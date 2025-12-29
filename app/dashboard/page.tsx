"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"

// Import Dashboard Komponen
import TalentDashboard from "@/components/dashboard/talent-dashboard"
import CompanyDashboard from "@/components/dashboard/company-dashboard"
import CampusDashboard from "@/components/dashboard/campus-dashboard"
import GovDashboard from "@/components/dashboard/gov-dashboard"
import AdminDashboard from "@/components/dashboard/admin-dashboard" // <--- TAMBAHAN BARU

export default function DashboardManager() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState("talent")

  useEffect(() => {
    checkUser()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push("/masuk")
      return
    }
    
    setUser(user)

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

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8">
      <div className="container px-4 md:px-6 mx-auto max-w-6xl">
        
        {/* Render Komponen Berdasarkan Role */}
        {role === 'talent' && <TalentDashboard user={user} />}
        {role === 'company' && <CompanyDashboard user={user} />}
        {role === 'campus' && <CampusDashboard user={user} />}
        {role === 'government' && <GovDashboard user={user} />}
        {role === 'admin' && <AdminDashboard user={user} />} {/* <--- TAMBAHAN BARU */}
        
        {/* Fallback */}
        {!['talent', 'company', 'campus', 'government', 'admin'].includes(role) && (
           <TalentDashboard user={user} />
        )}
        
      </div>
    </div>
  )
}
