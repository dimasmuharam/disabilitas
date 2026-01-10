"use client"

import React, { useEffect, useState, Suspense } from "react"
import { createClient } from "@/lib/supabase/client/client"
import { useRouter, useSearchParams } from "next/navigation"
import TalentDashboard from "@/components/dashboard/talent-dashboard"
import CompanyDashboard from "@/components/dashboard/company-dashboard"
import AdminDashboard from "@/components/dashboard/admin-dashboard"
import CampusDashboard from "@/components/dashboard/campus-dashboard"
import GovDashboard from "@/components/dashboard/gov-dashboard"
import { USER_ROLES } from "@/lib/data-static"

function DashboardContent() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()

  const isJustVerified = searchParams.get('verified') === 'true'

  useEffect(() => {
    async function checkUser() {
      const supabase = createClient()
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !authUser) {
          router.push("/masuk")
          return
        }

        setUser(authUser)
        const userRole = authUser.user_metadata?.role || USER_ROLES.TALENT
        setRole(userRole)

        let profileData = null

        // --- LOGIKA PENGAMBILAN DATA DENGAN FALLBACK (PENCEGAH STUCK) ---
        if (userRole === USER_ROLES.COMPANY) {
          const { data } = await supabase.from('companies').select('*').eq('owner_id', authUser.id).maybeSingle()
          // Fallback: Jika profil instansi belum dibuat
          profileData = data || { 
            owner_id: authUser.id, 
            name: authUser.user_metadata?.full_name || "Instansi Baru",
            is_placeholder: true 
          }
        } else if (userRole === USER_ROLES.PARTNER) {
          const { data } = await supabase.from('partners').select('*').eq('id', authUser.id).maybeSingle()
          // Fallback: Jika profil mitra kampus belum dibuat
          profileData = data || { 
            id: authUser.id, 
            name: authUser.user_metadata?.full_name || "Mitra Kampus Baru",
            is_placeholder: true 
          }
        } else if (userRole === USER_ROLES.GOVERNMENT) {
          const { data } = await supabase.from('government').select('*').eq('id', authUser.id).maybeSingle()
          // Fallback: Jika profil instansi pemerintah belum dibuat
          profileData = data || { 
            id: authUser.id, 
            institution_name: authUser.user_metadata?.full_name || "Instansi Pemerintah",
            is_placeholder: true 
          }
        } else {
          // Role Talent atau Admin
          const { data } = await supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle()
          profileData = data || { 
            id: authUser.id, 
            full_name: authUser.user_metadata?.full_name || "Pengguna Baru",
            is_placeholder: true 
          }
        }

        setProfile(profileData)

        // --- MANAJEMEN FOKUS ---
        setTimeout(() => {
          const targetId = isJustVerified ? "welcome-banner" : "dashboard-title";
          const element = document.getElementById(targetId);
          if (element) {
            element.setAttribute("tabIndex", "-1");
            element.focus();
          }
        }, 500);

        setLoading(false)
      } catch (error) {
        console.error("[DASHBOARD] Critical Error:", error)
        setLoading(false)
      }
    }

    checkUser()
  }, [router, isJustVerified])

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950" aria-busy="true">
        <div className="space-y-4 text-center">
          <div className="mx-auto size-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-[10px] font-black uppercase italic tracking-widest text-slate-400">
            {"Menyinkronkan Otoritas Akses..."}
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 font-sans dark:bg-slate-950">
      <div className="container mx-auto max-w-7xl">
        
        {isJustVerified && (
          <div 
            id="welcome-banner"
            role="alert" 
            aria-live="assertive"
            className="mb-8 rounded-[2.5rem] bg-blue-600 p-8 shadow-xl outline-none duration-700 animate-in fade-in slide-in-from-top-4"
          >
            <h2 className="mb-1 text-xl font-black uppercase italic tracking-tighter text-white">
              {"✓ Verifikasi Email Berhasil"}
            </h2>
            <p className="text-[10px] font-bold uppercase leading-relaxed tracking-widest text-blue-100">
              {"Selamat bergabung! Silakan mulai dengan melengkapi profil Anda pada menu yang tersedia."}
            </p>
          </div>
        )}

        <h1 id="dashboard-title" className="sr-only">{"Dashboard Utama Disabilitas.com"}</h1>

        {/* Dashboard Switcher dengan Proteksi Null */}
        {role === 'admin' || role === 'super_admin' ? (
          <AdminDashboard user={user} />
        ) : role === USER_ROLES.TALENT ? (
          <TalentDashboard 
            user={user} 
            profile={profile} 
            autoOpenProfile={isJustVerified} 
          />
        ) : role === USER_ROLES.COMPANY ? (
          <CompanyDashboard 
            user={user} 
            company={profile} 
          />
        ) : role === USER_ROLES.PARTNER ? (
          <CampusDashboard user={user} />
        ) : role === USER_ROLES.GOVERNMENT ? (
          <GovDashboard user={user} />
        ) : (
          <div className="rounded-[2.5rem] border-2 border-dashed border-slate-200 bg-white p-20 text-center shadow-2xl dark:bg-slate-900">
            <h2 className="mb-4 text-2xl font-black uppercase italic tracking-tight text-red-600">
                {"Profil Tidak Dikenali"}
            </h2>
            <div className="mb-8 space-y-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <p>{"Akun: "}{user?.email}</p>
              <p>{"Role: "}{role || "NULL"}</p>
            </div>
            <button onClick={() => router.push("/masuk")} className="rounded-2xl bg-blue-600 px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white">
              {"Kembali ke Login"}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  )
}
