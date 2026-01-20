"use client"

import React, { useEffect, useState, Suspense } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { 
  CheckCircle, ArrowRight, Building2, User, 
  Landmark, GraduationCap, AlertTriangle, RefreshCw 
} from "lucide-react"
import { USER_ROLES } from "@/lib/data-static"

function ConfirmContent() {
  const [profileName, setProfileName] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [role, setRole] = useState<string>("talent")
  const [resending, setResending] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function checkSessionAndProfile() {
      try {
        // 1. Cek apakah ada session (ini membuktikan link verifikasi berhasil)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError || !session) {
          // Jika tidak ada session, kemungkinan link expired atau invalid
          setError("Tautan verifikasi tidak valid atau telah kadaluwarsa.")
          setLoading(false)
          return
        }

        const user = session.user
        const userRole = user.user_metadata?.role || USER_ROLES.TALENT
        const metaName = user.user_metadata?.full_name || "Pengguna"
        setRole(userRole)

        // 2. Ambil Nama Asli dari Tabel Terkait
        let displayName = metaName
        const tableMap: Record<string, string> = {
          [USER_ROLES.COMPANY]: "companies",
          [USER_ROLES.PARTNER]: "partners",
          [USER_ROLES.GOVERNMENT]: "government",
          [USER_ROLES.TALENT]: "profiles"
        }

        const targetTable = tableMap[userRole] || "profiles"
        const { data } = await supabase
          .from(targetTable)
          .select(userRole === USER_ROLES.TALENT ? "full_name" : "name")
          .eq("id", user.id)
          .maybeSingle()

if (data) {
  displayName = ('name' in data ? data.name : (data as any).full_name) || metaName;
}

        setProfileName(displayName)

        // MANAJEMEN FOKUS UNTUK NVDA
        setTimeout(() => {
          const heading = document.querySelector("h1")
          if (heading) {
            heading.setAttribute("tabIndex", "-1")
            heading.focus()
          }
        }, 500)

      } catch (err) {
        console.error("Error:", err)
        setError("Terjadi kesalahan saat memverifikasi akun.")
      } finally {
        setLoading(false)
      }
    }
    checkSessionAndProfile()
  }, [])

  const handleResend = async () => {
    // Karena kita tidak punya email di state (karena session gagal), 
    // standar terbaik adalah redirect ke login agar user input email lagi atau 
    // minta mereka cek kembali pendaftaran. 
    // Namun untuk UX, kita asumsikan user ingin ke halaman bantuan.
    router.push("/masuk?error=expired")
  }

  if (loading) return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50" role="status">
      <RefreshCw className="mb-4 animate-spin text-blue-600" size={32} />
      <p className="text-sm font-black uppercase italic tracking-widest text-slate-400">Menyinkronkan Akun...</p>
    </div>
  )

  // TAMPILAN JIKA EXPIRED / ERROR
  if (error) return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-[3rem] border-4 border-slate-900 bg-white p-10 text-center shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
        <div className="mb-6 flex justify-center text-rose-500">
          <AlertTriangle size={64} strokeWidth={2.5} />
        </div>
        <h1 className="mb-4 text-2xl font-black uppercase italic tracking-tighter text-slate-900">Verifikasi Gagal</h1>
        <p className="mb-8 text-sm font-bold leading-relaxed text-slate-500">{error}</p>
        <button 
          onClick={handleResend}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 py-5 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-rose-600"
        >
          Kembali ke Login & Kirim Ulang
        </button>
      </div>
    </main>
  )

  const getDisplayData = () => {
    switch (role.toLowerCase()) {
      case USER_ROLES.COMPANY:
        return { icon: <Building2 size={48} />, title: "Bisnis Aktif", btnText: "Dashboard Bisnis" }
      case USER_ROLES.GOVERNMENT:
        return { icon: <Landmark size={48} />, title: "Otoritas Aktif", btnText: "Panel Monitoring" }
      case USER_ROLES.PARTNER:
        return { icon: <GraduationCap size={48} />, title: "Mitra Aktif", btnText: "Portal Mitra" }
      default:
        return { icon: <User size={48} />, title: "Akun Aktif", btnText: "Lengkapi Profil" }
    }
  }

  const content = getDisplayData()

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-[3rem] border-4 border-slate-900 bg-white p-10 text-center shadow-[12px_12px_0px_0px_rgba(59,130,246,1)]">
        <div className="mb-8 flex justify-center">
          <div className="rounded-[2.5rem] border-2 border-blue-100 bg-blue-50 p-6 text-blue-600">
            {content.icon}
          </div>
        </div>

        <div className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-emerald-200 bg-emerald-100 px-5 py-1.5">
          <CheckCircle size={14} className="text-emerald-600" />
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Terverifikasi</span>
        </div>

        <h1 className="mb-4 text-2xl font-black uppercase italic tracking-tighter text-slate-900 outline-none">
          {content.title}
        </h1>
        
        <p className="mb-10 px-4 text-sm font-bold leading-relaxed text-slate-500">
          Halo, <span className="text-blue-600">{profileName}</span>! Akun Anda telah berhasil dikonfirmasi. Silakan masuk untuk melanjutkan akses Anda.
        </p>

        <button 
          onClick={() => router.push("/dashboard")}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-blue-600 active:scale-95"
        >
          {content.btnText}
          <ArrowRight size={18} />
        </button>
      </div>
    </main>
  )
}

export default function ConfirmSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <ConfirmContent />
    </Suspense>
  )
}