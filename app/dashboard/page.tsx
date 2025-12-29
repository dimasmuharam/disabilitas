"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

// Import 4 Komponen Dashboard yang sudah dibuat
import TalentDashboard from "@/components/dashboard/talent-dashboard"
import CompanyDashboard from "@/components/dashboard/company-dashboard"
import CampusDashboard from "@/components/dashboard/campus-dashboard"
import GovDashboard from "@/components/dashboard/gov-dashboard"

export default function DashboardManager() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState("talent") // Default role jika belum diset

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    // 1. Cek Login
    const { data: { user } } = await supabase.auth.getUser()
    
    // Jika tidak login, tendang ke halaman masuk
    if (!user) {
      router.push("/masuk")
      return
    }
    
    setUser(user)

    // 2. Cek Role di Database Profiles
    // Kita ambil kolom 'role' untuk menentukan tampilan mana yang dirender
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

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-slate-500">Memuat dashboard...</p>
      </div>
    )
  }

  // RENDER TAMPILAN SESUAI PERAN (ROLE)
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div className="container px-4 md:px-6 mx-auto max-w-5xl">
        
        {/* Render Komponen Berdasarkan Role */}
        {role === 'talent' && <TalentDashboard user={user} />}
        {role === 'company' && <CompanyDashboard user={user} />}
        {role === 'campus' && <CampusDashboard user={user} />}
        {role === 'government' && <GovDashboard user={user} />}
        
        {/* Fallback jika role tidak dikenali (default ke Talent) */}
        {!['talent', 'company', 'campus', 'government'].includes(role) && (
           <TalentDashboard user={user} />
        )}
        
      </div>
    </div>
  )
}
