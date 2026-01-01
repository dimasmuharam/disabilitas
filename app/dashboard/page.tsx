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
  const [retryCount, setRetryCount] = useState(0)
  const router = useRouter()

  useEffect(() => {
    async function checkUser() {
      try {
        // 1. Ambil data sesi auth
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()
        
        if (authError || !authUser) {
          router.push("/masuk")
          return
        }

        setUser(authUser)

        // 2. Normalisasi email (sangat penting untuk email Mas yang banyak titik)
        const targetEmail = authUser.email?.toLowerCase().trim()

        // 3. Ambil profil dengan filter yang lebih stabil daripada .or()
        // Kita cari berdasarkan email dulu karena Mas sudah pastikan datanya ada di SQL lewat email
        let { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('email', targetEmail)
          .maybeSingle()

        // 4. Jika tidak ketemu lewat email, coba cari lewat ID (UUID)
        if (!profile && !profileError) {
          const { data: profileByID } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', authUser.id)
            .maybeSingle()
          profile = profileByID
        }

        // 5. Logika penentuan Role
        if (profile && profile.role) {
          setRole(profile.role.toLowerCase().trim())
          setLoading(false)
        } else {
          // Retry mechanism: memberi waktu jika trigger database agak lambat
          if (retryCount < 2) {
            setTimeout(() => setRetryCount(prev => prev + 1), 2000)
          } else {
            setLoading(false)
          }
        }
      } catch (error) {
        console.error("Dashboard error:", error)
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
        {role === 'admin' ? (
          <AdminDashboard user={user} />
        ) : role === 'talent' ? (
          <TalentDashboard user={user} />
        ) : role === 'company' ? (
          <CompanyDashboard user={user} />
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
