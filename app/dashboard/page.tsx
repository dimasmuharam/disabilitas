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
  const router = useRouter()

  useEffect(() => {
    async function checkUser() {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !authUser) {
          router.push("/login")
          return
        }

        setUser(authUser)

        // Normalisasi Email ke huruf kecil agar cocok dengan database
        const cleanEmail = authUser.email?.toLowerCase().trim()

        // Ambil profil berdasarkan ID atau Email (Lower Case)
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .or(`id.eq.${authUser.id},email.eq.${cleanEmail}`)
          .single()

        if (profile && profile.role) {
          setRole(profile.role.toLowerCase().trim())
        }
      } catch (error) {
        console.error("Dashboard router error:", error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="font-black animate-pulse text-slate-400 tracking-widest uppercase italic">
          {"Menyelaraskan Otoritas Riset..."}
        </p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="container max-w-7xl mx-auto">
        {/* LOGIKA TAMPILAN */}
        {role === 'admin' ? (
          <AdminDashboard user={user} />
        ) : role === 'talent' ? (
          <TalentDashboard user={user} />
        ) : role === 'company' ? (
          <CompanyDashboard user={user} />
        ) : (
          <div className="text-center p-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 shadow-2xl animate-in zoom-in-95">
            <p className="text-slate-500 font-black uppercase italic tracking-tight">
              {"Akses Ditolak: Role '"}{role || "Tidak Ada"}{"' Tidak Valid Untuk Email: "}{user?.email}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-6 px-8 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase"
            >
              {"Coba Sinkron Ulang"}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
