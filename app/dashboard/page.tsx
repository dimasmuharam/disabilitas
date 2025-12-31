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

        // STRATEGI PENGAMBILAN ROLE GANDA: Berdasarkan ID, jika gagal gunakan Email
        let { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', authUser.id)
          .single()

        // Jika tidak ketemu berdasarkan ID (kasus record manual), cari berdasarkan email
        if (!profile || profileError) {
          const { data: profileByEmail } = await supabase
            .from('profiles')
            .select('role')
            .eq('email', authUser.email)
            .single()
          
          profile = profileByEmail
        }

        if (profile) {
          // Pastikan role dibersihkan dari spasi atau huruf besar yang tidak sengaja terinput
          setRole(profile.role?.toLowerCase().trim())
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
          {"Menyelaraskan Autentikasi Riset..."}
        </p>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4">
      <div className="container max-w-7xl mx-auto">
        {/* RENDER BERDASARKAN ROLE DENGAN PROTEKSI CASE-SENSITIVE */}
        {role === 'admin' && <AdminDashboard user={user} />}
        {role === 'talent' && <TalentDashboard user={user} />}
        {role === 'company' && <CompanyDashboard user={user} />}
        
        {!role && (
          <div className="text-center p-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95">
            <p className="text-slate-500 font-bold uppercase italic">
              {"Role akun tidak teridentifikasi ("}{user?.email}{")."}
              <br/>
              {"Silakan hubungi sistem admin untuk aktivasi role admin."}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
