"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import TalentDashboard from "@/components/dashboard/talent-dashboard"
import CompanyDashboard from "@/components/dashboard/company-dashboard"
import AdminDashboard from "@/components/dashboard/admin-dashboard"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    async function checkUser() {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !authUser) {
          router.push("/masuk")
          return
        }

        setUser(authUser)

        // Normalisasi email untuk pencarian: Huruf kecil dan tanpa spasi
        const targetEmail = authUser.email?.toLowerCase().trim()

        // Ambil profil: Cek ID asli atau Email (Case-Insensitive)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .or(`id.eq.${authUser.id},email.ilike.${targetEmail}`)
          .maybeSingle() // Gunakan maybeSingle agar tidak throw error jika kosong

        if (profile && profile.role) {
          setRole(profile.role.toLowerCase().trim())
          setLoading(false)
        } else {
          // Jika tidak ketemu, coba lagi hingga 3 kali (memberi waktu trigger database bekerja)
          if (retryCount < 3) {
            setTimeout(() => setRetryCount(prev => prev + 1), 1500)
          } else {
            setLoading(false)
          }
        }
      } catch (error) {
        console.error("Dashboard error:", error)
        setLoading(false)
      }
    }

    checkUser()
  }, [router, retryCount])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50" aria-busy="true">
        <p className="font-black animate-pulse text-slate-400 tracking-widest uppercase italic">
          {"Menyinkronkan Otoritas Akses..."}
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="container max-w-7xl mx-auto">
        {role === 'admin' ? (
          <AdminDashboard user={user} />
        ) : role === 'talent' ? (
          <TalentDashboard user={user} />
        ) : role === 'company' ? (
          <CompanyDashboard user={user} />
        ) : (
          <div className="text-center p-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 shadow-2xl">
            <h2 className="text-red-600 font-black uppercase italic tracking-tight mb-4">
               {"Akses Ditolak: Profil Belum Siap"}
            </h2>
            <p className="text-slate-500 font-bold mb-6">
              {"Sistem mendeteksi akun: "}{user?.email?.toLowerCase()}
              <br/>
              {"Namun data 'Role' Masih Kosong di Database."}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all"
            >
              {"Segarkan Halaman & Coba Lagi"}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
