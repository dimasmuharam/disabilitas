"use client"

import { useEffect, useState, Suspense } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"
import TalentDashboard from "@/components/dashboard/talent-dashboard"
import CompanyDashboard from "@/components/dashboard/company-dashboard"
import AdminDashboard from "@/components/dashboard/admin-dashboard"
import CampusDashboard from "@/components/dashboard/campus-dashboard"
import GovDashboard from "@/components/dashboard/gov-dashboard"

function DashboardContent() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const router = useRouter()
  const searchParams = useSearchParams()

  // Ambil parameter verified dari URL (hasil redirect email konfirmasi)
  const isJustVerified = searchParams.get('verified') === 'true'

  useEffect(() => {
    async function checkUser() {
      try {
        console.log('[DASHBOARD] Memulai verifikasi pengguna...')
        
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !authUser) {
          console.log('[DASHBOARD] Tidak ada sesi aktif, redirect ke login')
          router.push("/masuk")
          return
        }

        setUser(authUser)
        const targetEmail = authUser.email?.toLowerCase().trim()

        // Ambil profil lengkap
        let { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', targetEmail)
          .maybeSingle()

        if (!profileData && !profileError) {
          console.log('[DASHBOARD] Profile tidak ditemukan via email, mencoba via ID...')
          const { data: profileByID } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .maybeSingle()
          profileData = profileByID
        }

        if (profileData && profileData.role) {
          const normalizedRole = profileData.role.toLowerCase().trim()
          
          // Fallback data untuk role spesifik
          if (normalizedRole === 'campus_partner' && !profileData.partner_institution) {
            profileData.partner_institution = authUser.user_metadata?.partner_institution || 'Universitas Indonesia (UI)'
          } else if (normalizedRole === 'government' && !profileData.agency_name) {
            profileData.agency_name = authUser.user_metadata?.agency_name || 'Kementerian'
          }
          
          setProfile(profileData)
          setRole(normalizedRole)
          setLoading(false)
        } else {
          // Fallback: ambil dari metadata jika trigger DB belum selesai
          const metadataRole = authUser.user_metadata?.role
          if (metadataRole && retryCount < 2) {
             // Lakukan upsert jika data di tabel profiles benar-benar belum ada
             await supabase.from('profiles').upsert({
                id: authUser.id,
                email: targetEmail,
                role: metadataRole,
                full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
                updated_at: new Date().toISOString()
             })
             setTimeout(() => setRetryCount(prev => prev + 1), 2000)
          } else if (retryCount < 2) {
            setTimeout(() => setRetryCount(prev => prev + 1), 2000)
          } else {
            setLoading(false)
          }
        }
      } catch (error) {
        console.error("[DASHBOARD] Error:", error)
        setLoading(false)
      }
    }

    checkUser()
  }, [router, retryCount])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50" aria-busy="true">
        <div className="text-center">
          <p className="font-black animate-pulse text-slate-400 tracking-widest uppercase italic">
            {"Menyinkronkan Otoritas Akses..."}
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="container max-w-7xl mx-auto">
        
        {/* Banner Selamat Datang khusus untuk yang baru verifikasi email */}
        {isJustVerified && (
          <div role="alert" className="mb-8 p-6 bg-blue-600 rounded-[2rem] shadow-xl animate-in fade-in slide-in-from-top-4 duration-700">
            <h2 className="text-white font-black uppercase italic tracking-tighter text-lg mb-1">
              {"✓ Konfirmasi Akun Berhasil"}
            </h2>
            <p className="text-blue-100 font-bold text-[10px] uppercase tracking-[0.2em]">
              {"Selamat datang! Silakan lengkapi profil Anda agar dapat menggunakan platform Disabilitas.com secara optimal."}
            </p>
          </div>
        )}

        {role === 'admin' || role === 'super_admin' ? (
          <AdminDashboard user={{ ...user, ...profile }} />
        ) : role === 'talent' ? (
          <TalentDashboard user={{ ...user, ...profile }} autoOpenProfile={isJustVerified} />
        ) : role === 'company' ? (
          <CompanyDashboard user={{ ...user, ...profile }} />
        ) : role === 'campus_partner' ? (
          <CampusDashboard user={{ ...user, ...profile, partner_institution: profile?.partner_institution }} />
        ) : role === 'government' ? (
          <GovDashboard user={{ ...user, ...profile, agency_name: profile?.agency_name }} />
        ) : (
          <div className="text-center p-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 shadow-2xl">
            <h1 className="text-red-600 font-black uppercase italic tracking-tight mb-4 text-2xl">
               {"Akses Ditolak: Profil Belum Siap"}
            </h1>
            <div className="text-slate-500 font-bold mb-8 space-y-2">
              <p>{"Sistem mengenali akun: "}<span className="text-slate-900">{user?.email}</span></p>
              <p>{"Namun, status peran (Role) Anda tidak ditemukan di tabel profil."}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => window.location.reload()} className="px-8 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg">
                {"Coba Segarkan Halaman"}
              </button>
              <button onClick={async () => { await supabase.auth.signOut(); router.push("/masuk") }} className="px-8 py-4 bg-slate-200 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-300 transition-all">
                {"Keluar & Login Ulang"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

// Export default dengan Suspense agar useSearchParams tidak error saat build
export default function DashboardPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="font-black animate-pulse text-slate-400 tracking-widest uppercase italic">{"Memuat Dashboard..."}</p>
      </main>
    }>
      <DashboardContent />
    </Suspense>
  )
}
