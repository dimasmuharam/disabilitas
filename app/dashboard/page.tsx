"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import TalentDashboard from "@/components/dashboard/talent-dashboard"
import CompanyDashboard from "@/components/dashboard/company-dashboard"
import AdminDashboard from "@/components/dashboard/admin-dashboard"
import CampusDashboard from "@/components/dashboard/campus-dashboard"
import GovDashboard from "@/components/dashboard/gov-dashboard"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    async function checkUser() {
      try {
        console.log('[DASHBOARD] Memulai verifikasi pengguna...')
        
        // 1. Ambil data sesi auth
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !authUser) {
          console.log('[DASHBOARD] Tidak ada sesi aktif, redirect ke login')
          router.push("/masuk")
          return
        }

        setUser(authUser)
        console.log('[DASHBOARD] User terautentikasi:', authUser.email, 'ID:', authUser.id)

        // 2. Normalisasi email
        const targetEmail = authUser.email?.toLowerCase().trim()

        // 3. Ambil profil lengkap dengan semua field yang dibutuhkan untuk validasi role-specific
        let { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', targetEmail)
          .maybeSingle()

        // 4. Jika tidak ketemu lewat email, coba cari lewat ID (UUID)
        if (!profileData && !profileError) {
          console.log('[DASHBOARD] Profile tidak ditemukan via email, mencoba via ID...')
          const { data: profileByID } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .maybeSingle()
          profileData = profileByID
        }

        if (profileError) {
          console.error('[DASHBOARD] Error mengambil profile:', profileError)
        }

        // 5. Logika penentuan Role dengan fallback
        if (profileData && profileData.role) {
          const normalizedRole = profileData.role.toLowerCase().trim()
          console.log('[DASHBOARD] Profile ditemukan dengan role:', normalizedRole)
          
          // Validasi role-specific properties
          if (normalizedRole === 'campus_partner' || normalizedRole === 'campus') {
            if (!profileData.partner_institution) {
              console.warn('[DASHBOARD] Campus partner tanpa partner_institution, menggunakan fallback')
              // Set default atau ambil dari metadata auth
              profileData.partner_institution = authUser.user_metadata?.partner_institution || 'Universitas Indonesia (UI)'
            }
          } else if (normalizedRole === 'government' || normalizedRole === 'gov') {
            if (!profileData.agency_name) {
              console.warn('[DASHBOARD] Government user tanpa agency_name, menggunakan fallback')
              // Set default atau ambil dari metadata auth
              profileData.agency_name = authUser.user_metadata?.agency_name || 'Kementerian'
            }
          }
          
          setProfile(profileData)
          setRole(normalizedRole)
          setLoading(false)
        } else {
          console.warn('[DASHBOARD] Profile tidak memiliki role, mencoba fallback...')
          
          // Fallback: coba ambil dari auth metadata
          const metadataRole = authUser.user_metadata?.role
          if (metadataRole) {
            console.log('[DASHBOARD] Role ditemukan di metadata:', metadataRole)
            
            // Update profile dengan role dari metadata
            const { error: updateError } = await supabase
              .from('profiles')
              .upsert({
                id: authUser.id,
                email: targetEmail,
                role: metadataRole,
                full_name: authUser.user_metadata?.full_name || authUser.email?.split('@')[0],
                updated_at: new Date().toISOString()
              })
            
            if (!updateError) {
              console.log('[DASHBOARD] Profile berhasil diperbarui dengan role dari metadata')
              setRole(metadataRole.toLowerCase().trim())
              setProfile({ ...profileData, role: metadataRole })
              setLoading(false)
            } else {
              console.error('[DASHBOARD] Error update profile:', updateError)
              // Retry mechanism: memberi waktu jika trigger database agak lambat
              if (retryCount < 2) {
                console.log('[DASHBOARD] Retry attempt', retryCount + 1)
                setTimeout(() => setRetryCount(prev => prev + 1), 2000)
              } else {
                console.error('[DASHBOARD] Maksimal retry tercapai, role tidak ditemukan')
                setLoading(false)
              }
            }
          } else {
            // Retry mechanism: memberi waktu jika trigger database agak lambat
            if (retryCount < 2) {
              console.log('[DASHBOARD] Retry attempt', retryCount + 1)
              setTimeout(() => setRetryCount(prev => prev + 1), 2000)
            } else {
              console.error('[DASHBOARD] Maksimal retry tercapai, role tidak ditemukan')
              setLoading(false)
            }
          }
        }
      } catch (error) {
        console.error("[DASHBOARD] Error:", error)
        setLoading(false)
      }
    }

    checkUser()
  }, [router, retryCount])

  // Tampilan Loading (Ramah Screen Reader dengan aria-busy)
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
        {role === 'admin' || role === 'super_admin' ? (
          <AdminDashboard user={{ ...user, ...profile }} />
        ) : role === 'talent' ? (
          <TalentDashboard user={{ ...user, ...profile }} />
        ) : role === 'company' ? (
          <CompanyDashboard user={{ ...user, ...profile }} />
        ) : role === 'campus_partner' || role === 'campus' ? (
          <CampusDashboard user={{ ...user, ...profile, partner_institution: profile?.partner_institution }} />
        ) : role === 'government' || role === 'gov' ? (
          <GovDashboard user={{ ...user, ...profile, agency_name: profile?.agency_name }} />
        ) : (
          /* State jika data profil benar-benar tidak ditemukan setelah retry */
          <div className="text-center p-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-200 shadow-2xl">
            <h1 className="text-red-600 font-black uppercase italic tracking-tight mb-4 text-2xl">
               {"Akses Ditolak: Profil Belum Siap"}
            </h1>
            <div className="text-slate-500 font-bold mb-8 space-y-2">
              <p>{"Sistem mengenali akun: "}<span className="text-slate-900">{user?.email}</span></p>
              <p>{"Namun, status peran (Role) Anda tidak ditemukan di tabel profil."}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => window.location.reload()} 
                className="px-8 py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg"
              >
                {"Coba Segarkan Halaman"}
              </button>
              
              <button 
                onClick={async () => {
                  await supabase.auth.signOut()
                  router.push("/masuk")
                }} 
                className="px-8 py-4 bg-slate-200 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-300 transition-all"
              >
                {"Keluar & Login Ulang"}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
