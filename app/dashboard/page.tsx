"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

// Import Ruangan-Ruangan yang baru kita buat
import TalentDashboard from "@/components/dashboard/talent-dashboard"
import CompanyDashboard from "@/components/dashboard/company-dashboard"
import CampusDashboard from "@/components/dashboard/campus-dashboard"
import GovDashboard from "@/components/dashboard/gov-dashboard"

export default function DashboardManager() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState("talent") // default role

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    // 1. Cek Login
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/masuk")
      return
    }
    setUser(user)

    // 2. Cek Role di Database
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (data && data.role) {
      setRole(data.role)
    }
    setLoading(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <p className="text-slate-500">Sedang memuat dashboard ekosistem...</p>
    </div>
  )

  // RENDER SESUAI PERAN (ROLE)
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div className="container px-4 md:px-6 mx-auto max-w-5xl">
        
        {/* Tombol Rahasia untuk Mas Dimas Tes Role (Hapus nanti saat Production) */}
        {/* <div className="mb-4 p-2 bg-yellow-100 text-xs flex gap-2 rounded">
           <span>Dev Mode (Switch Role):</span>
           <button onClick={() => setRole('talent')} className="underline">Talent</button>
           <button onClick={() => setRole('company')} className="underline">Company</button>
           <button onClick={() => setRole('campus')} className="underline">Campus</button>
           <button onClick={() => setRole('government')} className="underline">Gov</button>
        </div> 
        */}

        {role === 'talent' && <TalentDashboard user={user} />}
        {role === 'company' && <CompanyDashboard user={user} />}
        {role === 'campus' && <CampusDashboard user={user} />}
        {role === 'government' && <GovDashboard user={user} />}
        
      </div>
    </div>
  )
}
