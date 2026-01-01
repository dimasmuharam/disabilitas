"use client"

import { useEffect, useState, Suspense } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { CheckCircle, ArrowRight, Building2, User, Landmark, GraduationCap } from "lucide-react"

function ConfirmContent() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function getProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data } = await supabase
            .from("profiles")
            .select("full_name, role")
            .eq("id", user.id)
            .single()
          setProfile(data)
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }
    getProfile()
  }, [])

  // Fungsi untuk membedakan konten berdasarkan ROLE [cite: 2026-01-01]
  const getDisplayData = () => {
    const name = profile?.full_name || "Pengguna"
    const role = profile?.role?.toLowerCase() || "talent"

    switch (role) {
      case "company":
        return {
          icon: <Building2 size={48} className="text-blue-600" />,
          title: "Akses Bisnis Aktif",
          desc: `Halo, ${name}! Akun perusahaan Anda telah diverifikasi. Mari temukan talenta terbaik untuk memperkuat inklusivitas bisnis Anda.`,
          btnText: "Masuk ke Dashboard Bisnis"
        }
      case "government":
        return {
          icon: <Landmark size={48} className="text-indigo-600" />,
          title: "Otoritas Diverifikasi",
          desc: `Halo, ${name}! Akun instansi pemerintah Anda telah aktif. Akses data monitoring dan kebijakan inklusi sekarang.`,
          btnText: "Buka Panel Monitoring"
        }
      case "campus_partner":
        return {
          icon: <GraduationCap size={48} className="text-emerald-600" />,
          title: "Kemitraan Aktif",
          desc: `Halo, ${name}! Akun mitra pendidikan Anda telah diverifikasi. Mari mulai sinkronisasi data lulusan dan peluang karir.`,
          btnText: "Masuk ke Portal Mitra"
        }
      default: // Talent
        return {
          icon: <User size={48} className="text-blue-600" />,
          title: "Konfirmasi Berhasil",
          desc: `Halo, ${name}! Akun talenta Anda telah aktif. Mari lengkapi profil profesional Anda untuk menarik perhatian perekrut.`,
          btnText: "Lengkapi Profil Sekarang"
        }
    }
  }

  const content = getDisplayData()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <p className="font-black animate-pulse text-slate-400 uppercase italic tracking-widest">
        {"Menyinkronkan Akun..."}
      </p>
    </div>
  )

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 text-center border border-slate-100 animate-in zoom-in-95 duration-500">
        <div className="flex justify-center mb-6">
          <div className="bg-slate-50 p-6 rounded-[2rem] shadow-inner">
            {content.icon}
          </div>
        </div>

        <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-1 rounded-full mb-4">
          <CheckCircle size={14} className="text-green-600" />
          <span className="text-[10px] font-black uppercase text-green-700 tracking-wider">{"Email Terverifikasi"}</span>
        </div>

        <h1 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 mb-2">
          {content.title}
        </h1>
        
        <p className="text-slate-500 font-bold text-sm mb-10 leading-relaxed px-2">
          {content.desc}
        </p>

        <button 
          onClick={() => router.push("/dashboard?verified=true")}
          className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
        >
          {content.btnText}
          <ArrowRight size={16} />
        </button>
      </div>
    </main>
  )
}

export default function ConfirmSuccessPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmContent />
    </Suspense>
  )
}
