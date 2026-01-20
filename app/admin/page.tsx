"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import AdminDashboard from "@/components/dashboard/admin-dashboard"
import { useRouter } from "next/navigation"
import { getNationalStats, getManualInputAudit } from "@/lib/actions/admin"

/**
 * JALUR MANDIRI ADMIN (CLIENT-SIDE AUTH)
 * Mengapa Client-Side? Agar sinkron dengan sesi login di /dashboard dan /masuk.
 * Data statistik tetap ditarik via Server Actions untuk keamanan & kecepatan.
 */
export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [audit, setAudit] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function initAdmin() {
      try {
        // 1. Validasi Sesi (Menggunakan metode yang sama dengan dashboard Mas)
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !authUser) {
          router.replace("/masuk")
          return
        }

        // 2. Validasi Otoritas Admin
        const role = authUser.app_metadata?.role || authUser.user_metadata?.role
        if (role !== 'admin' && role !== 'super_admin') {
          // Jika bukan admin, kembalikan ke router dashboard biasa
          router.replace("/dashboard")
          return
        }

        // Simpan data user untuk dikirim ke komponen dashboard
        setUser(authUser)

        // 3. Tarik Data Riset BRIN (Pre-fetching dengan Retry Logic)
        // Memastikan saat komponen render, data sudah siap untuk NVDA
        let attempt = 0
        const maxAttempts = 3 // 1 initial attempt + 2 retries
        
        while (attempt < maxAttempts) {
          try {
            const [resStats, resAudit] = await Promise.all([
              getNationalStats(),
              getManualInputAudit()
            ])
            
            setStats(resStats)
            setAudit(resAudit || [])
            break // Success, exit retry loop
          } catch (fetchError) {
            attempt++
            console.error(`[ADMIN_DATA_FETCH_ERROR] Attempt ${attempt}/${maxAttempts}:`, fetchError)
            
            if (attempt < maxAttempts) {
              // Wait before retry (exponential backoff: 1s, 2s for attempts 1, 2)
              await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)))
            }
          }
        }
        
      } catch (e) {
        console.error("[ADMIN_INIT_ERROR]:", e)
      } finally {
        setLoading(false)
      }
    }

    initAdmin()
  }, [router])

  // Tampilan transisi saat pengecekan kunci akses
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center space-y-4 bg-slate-950">
        <div className="size-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
        <p className="animate-pulse font-black uppercase italic tracking-widest text-white">
          Otorisasi Komando Admin...
        </p>
      </div>
    )
  }

  // Jika lolos proteksi, tampilkan Command Center
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <AdminDashboard 
        user={user} 
        serverStats={stats} 
        serverAudit={audit} 
      />
    </main>
  )
}