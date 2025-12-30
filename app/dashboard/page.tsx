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
    // Memasukkan fungsi ke dalam useEffect menghilangkan peringatan 'missing dependency'
    async function checkUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push("/login")
          return
        }
        setUser(user)

        // Ambil role dari profil untuk menentukan dashboard yang tampil
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profile) {
          setRole(profile.role)
        }
      } catch (error) {
        console.error("Dashboard router error:", error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [router]) // Menambahkan router sebagai dependency standar

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="font-black animate-pulse text-slate-400 tracking-widest uppercase italic">
          {"Menyelaraskan Autentikasi Riset..."}
        </p>
      </div>
    )
  }

  // RENDER BERDASARKAN ROLE
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4">
      <div className="container max-w-7xl mx-auto">
        {role === 'admin' && <AdminDashboard user={user} />}
        {role === 'talent' && <TalentDashboard user={user} />}
        {role === 'company' && <CompanyDashboard user={user} />}
        
        {!role && (
          <div className="text-center p-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-slate-500 font-bold uppercase italic">
              {"Role akun tidak teridentifikasi. Silakan hubungi sistem admin."}
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
