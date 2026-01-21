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
        // 1. Ambil sesi autentikasi (lebih cepat dari getUser untuk routing awal)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !session?.user) {
          router.replace("/masuk")
          return
        }

        const authUser = session.user

        // 2. Tentukan Role dengan hirarki keamanan: app_metadata > user_metadata
        // app_metadata lebih aman karena tidak bisa diubah oleh user via client SDK
        const userRole = authUser.app_metadata?.role || authUser.user_metadata?.role || USER_ROLES.TALENT

        // --- JALUR MANDIRI ADMIN ---
        // Jika terdeteksi admin, langsung lempar ke portal Zero Trust
        if (userRole === 'admin' || userRole === 'super_admin') {
          setLoading(true) // Tetap loading agar UI dashboard tidak berkedip
          router.replace("/admin")
          return 
        }

        setUser(authUser)
        setRole(userRole)

        // 3. Data Fetching Profiles (Parallel fetching akan lebih cepat)
        let profileData = null
        const tableMap: Record<string, string> = {
          [USER_ROLES.COMPANY]: 'companies',
          [USER_ROLES.PARTNER]: 'partners',
          [USER_ROLES.CAMPUS]: 'campuses',
          [USER_ROLES.GOVERNMENT]: 'government'
        }

        const tableName = tableMap[userRole] || 'profiles'
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle()

        if (error) throw error

        // Handle Placeholder jika profil belum dibuat
        profileData = data || { 
          id: authUser.id, 
          full_name: authUser.user_metadata?.full_name || "Pengguna Baru",
          name: authUser.user_metadata?.full_name || "Instansi Baru",
          is_placeholder: true 
        }

        setProfile(profileData)

        // 4. Manajemen Fokus Aksesibilitas (Penting bagi pengguna Screen Reader)
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50" role="status" aria-live="polite">
        <div className="space-y-4 text-center">
          <div className="mx-auto size-12 animate-spin rounded-full border-4 border-slate-900 border-t-transparent"></div>
          <p className="text-[10px] font-black uppercase italic tracking-widest text-slate-400">
            {"Sinkronisasi Dashboard Riset..."}
          </p>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 font-sans">
      <div className="container mx-auto max-w-7xl">
        
        {isJustVerified && (
          <div 
            id="welcome-banner"
            role="alert" 
            className="mb-8 rounded-[2.5rem] bg-blue-600 p-8 shadow-xl outline-none"
          >
            <h2 className="mb-1 text-xl font-black uppercase italic tracking-tighter text-white">
              {"✓ Akses Terverifikasi"}
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-blue-100">
              {"Selamat datang di pusat kendali riset inklusif disabilitas.com"}
            </p>
          </div>
        )}

        <h1 id="dashboard-title" className="sr-only">{"Dashboard Identitas"}</h1>

        {/* SWITCHER DINAMIS BERDASARKAN ROLE */}
        {role === USER_ROLES.TALENT && (
          <TalentDashboard user={user} profile={profile} autoOpenProfile={isJustVerified} />
        )}
        
        {role === USER_ROLES.COMPANY && (
          <CompanyDashboard user={{ ...user, ...profile }} company={profile} />
        )}
        
        {role === USER_ROLES.PARTNER && (
          <PartnerDashboard user={{ ...user, ...profile }} />
        )}
        
        {role === USER_ROLES.CAMPUS && (
          <CampusDashboard user={{ ...user, ...profile }} />
        )}
        
        {role === USER_ROLES.GOVERNMENT && (
          <GovDashboard user={{ ...user, ...profile }} />
        )}

        {/* Fallback jika role tidak valid */}
        {!Object.values(USER_ROLES).includes(role as any) && (
          <div className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-20 text-center shadow-2xl">
            <h2 className="mb-4 text-2xl font-black uppercase italic text-red-600">
              {"Identitas Belum Terpetakan"}
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              {"Silakan hubungi administrator untuk verifikasi role anda."}
            </p>
            <button 
              onClick={() => supabase.auth.signOut().then(() => router.push("/masuk"))} 
              className="mt-8 rounded-2xl bg-slate-900 px-8 py-4 text-[10px] font-black uppercase text-white hover:bg-red-600"
            >
              {"Keluar & Masuk Kembali"}
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