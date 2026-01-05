"use client"

import React, { useEffect, useState, Suspense } from "react"
import { supabase } from "@/lib/supabase"
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

  // Ambil parameter verified dari URL (hasil pendaftaran baru)
  const isJustVerified = searchParams.get('verified') === 'true'

  useEffect(() => {
    async function checkUser() {
      try {
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !authUser) {
          router.push("/masuk")
          return
        }

        setUser(authUser)
        const userRole = authUser.user_metadata?.role || USER_ROLES.TALENT
        setRole(userRole)

        // --- LOGIKA PENCARIAN DATA LINEAR BERDASARKAN TABEL MASING-MASING ---
        let profileData = null

        if (userRole === USER_ROLES.COMPANY) {
          const { data } = await supabase.from('companies').select('*').eq('owner_id', authUser.id).maybeSingle()
          profileData = data
        } else if (userRole === USER_ROLES.PARTNER) {
          const { data } = await supabase.from('partners').select('*').eq('id', authUser.id).maybeSingle()
          profileData = data
        } else if (userRole === USER_ROLES.GOVERNMENT) {
          const { data } = await supabase.from('government').select('*').eq('id', authUser.id).maybeSingle()
          profileData = data
        } else {
          // Default ke tabel profiles untuk talent atau admin
          const { data } = await supabase.from('profiles').select('*').eq('id', authUser.id).maybeSingle()
          profileData = data
        }

        setProfile(profileData)

        // --- MANAJEMEN FOKUS UNTUK SCREEN READER ---
        if (isJustVerified) {
          // Jika baru verifikasi, fokuskan ke banner sukses
          setTimeout(() => {
            const banner = document.getElementById("welcome-banner");
            if (banner) banner.focus();
          }, 500);
        } else {
          // Jika login biasa, fokus ke judul H1 dashboard utama
          setTimeout(() => {
            const h1 = document.querySelector("h1");
            if (h1) {
              h1.setAttribute("tabIndex", "-1");
              h1.focus();
            }
          }, 500);
        }

        setLoading(false)
      } catch (error) {
        console.error("[DASHBOARD] Error:", error)
        setLoading(false)
      }
    }

    checkUser()
  }, [router, isJustVerified])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950" aria-busy="true">
        <div className="text-center">
          <p className="font-black animate-pulse text-slate-400 tracking-widest uppercase italic">
            {"Menyinkronkan Otoritas Akses..."}
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-10 px-4 font-sans">
      <div className="container max-w-7xl mx-auto">
        
        {/* Banner Selamat Datang - Aksesibel untuk yang baru verifikasi */}
        {isJustVerified && (
          <div 
            id="welcome-banner"
            role="alert" 
            aria-live="assertive"
            tabIndex={-1}
            className="mb-8 p-8 bg-blue-600 rounded-[2.5rem] shadow-xl animate-in fade-in slide-in-from-top-4 duration-700 outline-none"
          >
            <h2 className="text-white font-black uppercase italic tracking-tighter text-xl mb-1">
              {"✓ Verifikasi Email Berhasil"}
            </h2>
            <p className="text-blue-100 font-bold text-[10px] uppercase tracking-widest leading-relaxed">
              {"Selamat bergabung! Silakan mulai dengan melengkapi profil instansi atau pribadi Anda di menu pengaturan."}
            </p>
          </div>
        )}

        {/* Dashboard Switcher Berdasarkan Role Linear */}
        {role === 'admin' || role === 'super_admin' ? (
          <AdminDashboard user={{ ...user, ...profile }} />
        ) : role === USER_ROLES.TALENT ? (
          <TalentDashboard 
            user={user} 
            profile={profile} 
            autoOpenProfile={isJustVerified} 
          />
        ) : role === USER_ROLES.COMPANY ? (
          <CompanyDashboard 
            user={{ ...user, ...profile }} 
            company={profile} // profile di sini adalah hasil fetch tabel companies
          />
        ) : role === USER_ROLES.PARTNER ? (
          <CampusDashboard user={{ ...user, ...profile }} />
        ) : role === USER_ROLES.GOVERNMENT ? (
          <GovDashboard user={{ ...user, ...profile }} />
        ) : (
          <div className="text-center p-20 bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800 shadow-2xl">
            <h1 className="text-red-600 font-black uppercase italic tracking-tight mb-4 text-2xl">
                {"Akses Ditolak: Profil Tidak Dikenali"}
            </h1>
            <div className="text-slate-500 font-bold mb-8 space-y-2 text-[10px] uppercase tracking-widest">
              <p>{"Akun: "}<span className="text-blue-600">{user?.email}</span></p>
              <p>{"Role: "}{role || "Tidak terdefinisi"}</p>
              <p>{"Hubungi admin jika ini adalah kesalahan."}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => window.location.reload()} className="px-8 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg active:scale-95">
                {"Segarkan Sinkronisasi"}
              </button>
              <button onClick={async () => { await supabase.auth.signOut(); router.push("/masuk") }} className="px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                {"Keluar"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <p className="font-black animate-pulse text-slate-400 tracking-widest uppercase italic">{"Memuat Dashboard..."}</p>
      </main>
    }>
      <DashboardContent />
    </Suspense>
  )
}
