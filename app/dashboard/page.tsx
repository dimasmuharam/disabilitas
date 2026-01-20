"use client"

import React, { useEffect, useState, Suspense } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"
import TalentDashboard from "@/components/dashboard/talent-dashboard"
import CompanyDashboard from "@/components/dashboard/company-dashboard"
import PartnerDashboard from "@/components/dashboard/partner-dashboard"
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
      try {
        // 1. Ambil data autentikasi terbaru
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !authUser) {
          router.push("/masuk")
          return
        }

        // 2. Tentukan Role
        const userRole = authUser.app_metadata?.role || authUser.user_metadata?.role || USER_ROLES.TALENT

        // --- JALUR MANDIRI ADMIN (DIPISAH KE /admin) ---
        if (userRole === 'admin' || userRole === 'super_admin') {
          router.replace("/admin")
          return // Hentikan eksekusi kode selanjutnya untuk Admin
        }

        setUser(authUser)
        setRole(userRole)

        let profileData = null

        // 3. Ambil data profil berdasarkan tabel masing-masing role (Non-Admin)
        if (userRole === USER_ROLES.COMPANY) {
          const { data } = await supabase.from('companies').select('*').eq('id', authUser.id).maybeSingle()
          profileData = data || { 
            id: authUser.id, 
            name: authUser.user_metadata?.full_name || "Instansi Baru",
            is_placeholder: true 
          }
        } else if (userRole === USER_ROLES.PARTNER) {
          const { data } = await supabase.from('partners').select('*').eq('id', authUser.id).maybeSingle()
          profileData = data || { 
            id: authUser.id, 
            name: authUser.user_metadata?.full_name || "Mitra Pelatihan Baru",
            is_placeholder: true 
          }
        } else if (userRole === USER_ROLES.CAMPUS) {
          const { data } = await supabase.from('campuses').select('*').eq('id', authUser.id).maybeSingle()
          profileData = data || { 
            id: authUser.id, 
            name: authUser.user_metadata?.full_name || "Perguruan Tinggi Baru",
            is_placeholder: true 
          }
        } else if (userRole === USER_ROLES.GOVERNMENT) {
          const { data } = await supabase.from('government').select('*').eq('id', authUser.id).maybeSingle()
          profileData = data || { 
            id: authUser.id, 
            name: authUser.user_metadata?.full_name || "Instansi Pemerintah",
            is_placeholder: true 
          }
        } else {
          // Default: Role Talent
          const { data } = await supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle()
          profileData = data || { 
            id: authUser.id, 
            full_name: authUser.user_metadata?.full_name || "Pengguna Baru",
            is_placeholder: true 
          }
        }

        setProfile(profileData)

        // 4. Manajemen Fokus Aksesibilitas
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
        console.error("[DASHBOARD_ROUTER] Critical Error:", error)
        setLoading(false)
      }
    }

    checkUser()
  }, [router, isJustVerified])

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950" aria-busy="true">
        <div className="space-y-4 text-center">
          <div className="mx-auto size-12 animate-spin rounded-full border-4 border-slate-900 border-t-transparent"></div>
          <p className="text-[10px] font-black uppercase italic tracking-widest text-slate-400">
            {"Otentikasi Identitas Riset..."}
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
              {"✓ Akses Terverifikasi"}
            </h2>
            <p className="text-[10px] font-bold uppercase leading-relaxed tracking-widest text-blue-100">
              {"Email berhasil divalidasi. Selamat bergabung di ekosistem inklusif disabilitas.com."}
            </p>
          </div>
        )}

        <h1 id="dashboard-title" className="sr-only">{"Dashboard Router"}</h1>

        {/* SWITCHER BERDASARKAN ROLE (Hanya Non-Admin) */}
        {role === USER_ROLES.TALENT ? (
          <TalentDashboard 
            user={user} 
            profile={profile} 
            autoOpenProfile={isJustVerified} 
          />
        ) : role === USER_ROLES.COMPANY ? (
          <CompanyDashboard 
            user={{ ...user, ...profile }} 
            company={profile} 
          />
        ) : role === USER_ROLES.PARTNER ? (
          <PartnerDashboard user={{ ...user, ...profile }} />
        ) : role === USER_ROLES.CAMPUS ? (
          <CampusDashboard user={{ ...user, ...profile }} />
        ) : role === USER_ROLES.GOVERNMENT ? (
          <GovDashboard user={{ ...user, ...profile }} />
        ) : (
          <div className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-20 text-center shadow-2xl">
            <h2 className="mb-4 text-2xl font-black uppercase italic tracking-tight text-red-600">
                {"Identitas Tidak Dikenali"}
            </h2>
            <div className="mb-8 space-y-2 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <p>{"Log: "}{user?.email}</p>
              <p>{"Role: "}{role || "UNDEFINED"}</p>
            </div>
            <button onClick={() => router.push("/masuk")} className="rounded-2xl bg-slate-900 px-8 py-4 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-blue-600">
              {"Otorisasi Ulang"}
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