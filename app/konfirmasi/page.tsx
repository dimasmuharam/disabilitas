"use client"

import React, { useEffect, useState, Suspense } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { CheckCircle, ArrowRight, Building2, User, Landmark, GraduationCap } from "lucide-react"
import { USER_ROLES } from "@/lib/data-static"

function ConfirmContent() {
  const [profileName, setProfileName] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [role, setRole] = useState<string>("talent")
  const router = useRouter()

  useEffect(() => {
    async function getProfile() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const userRole = user.user_metadata?.role || USER_ROLES.TALENT
          const metaName = user.user_metadata?.full_name || "Pengguna"
          setRole(userRole)

          // --- LOGIKA PENCARIAN DATA (Sinkron dengan Trigger Database) ---
          let displayName = metaName

          if (userRole === USER_ROLES.COMPANY) {
            const { data } = await supabase.from("companies").select("name").eq("id", user.id).maybeSingle()
            if (data?.name) displayName = data.name
          } 
          else if (userRole === USER_ROLES.PARTNER) {
            const { data } = await supabase.from("partners").select("name").eq("id", user.id).maybeSingle()
            if (data?.name) displayName = data.name
          } 
          else if (userRole === USER_ROLES.GOVERNMENT) {
            const { data } = await supabase.from("government").select("name").eq("id", user.id).maybeSingle()
            if (data?.name) displayName = data.name
          } 
          else {
            const { data } = await supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle()
            if (data?.full_name) displayName = data.full_name
          }

          setProfileName(displayName)

          // MANAJEMEN FOKUS UNTUK SCREEN READER
          setTimeout(() => {
            const heading = document.querySelector("h1")
            if (heading) {
              heading.setAttribute("tabIndex", "-1")
              heading.focus()
            }
          }, 500)
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }
    getProfile()
  }, [])

  const getDisplayData = () => {
    const name = profileName
    const currentRole = role.toLowerCase()

    switch (currentRole) {
      case USER_ROLES.COMPANY:
        return {
          icon: <Building2 size={48} />,
          title: "Akses Bisnis Aktif",
          desc: `Halo, ${name}! Akun perusahaan Anda telah diverifikasi. Mari temukan talenta terbaik untuk memperkuat inklusivitas bisnis Anda.`,
          btnText: "Buka Dashboard Bisnis"
        }
      case USER_ROLES.GOVERNMENT:
        return {
          icon: <Landmark size={48} />,
          title: "Otoritas Diverifikasi",
          desc: `Halo, ${name}! Akun instansi pemerintah Anda telah aktif. Akses data monitoring dan kebijakan inklusi sekarang.`,
          btnText: "Buka Panel Monitoring"
        }
      case USER_ROLES.PARTNER:
        return {
          icon: <GraduationCap size={48} />,
          title: "Kemitraan Aktif",
          desc: `Halo, ${name}! Akun mitra pendidikan Anda telah diverifikasi. Mari mulai sinkronisasi data lulusan dan peluang karir.`,
          btnText: "Masuk ke Portal Mitra"
        }
      default: // Talent
        return {
          icon: <User size={48} />,
          title: "Konfirmasi Berhasil",
          desc: `Halo, ${name}! Akun talenta Anda telah aktif. Mari lengkapi profil profesional Anda untuk menarik perhatian perekrut.`,
          btnText: "Lengkapi Profil Sekarang"
        }
    }
  }

  const content = getDisplayData()

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950" aria-busy="true">
      <p className="font-black animate-pulse text-slate-400 uppercase italic tracking-widest text-sm">
        Menyinkronkan Akun...
      </p>
    </div>
  )

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 font-sans selection:bg-blue-100">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl p-10 text-center border border-slate-100 dark:border-slate-800 animate-in zoom-in-95 duration-500">
        <div className="flex justify-center mb-8">
          <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-[2.5rem] shadow-inner text-blue-600 dark:text-blue-400">
            {content.icon}
          </div>
        </div>

        <div className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 px-5 py-1.5 rounded-full mb-6">
          <CheckCircle size={14} className="text-emerald-600 dark:text-emerald-400" />
          <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 tracking-widest">
            Email Terverifikasi
          </span>
        </div>

        <h1 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-slate-50 mb-4 outline-none">
          {content.title}
        </h1>
        
        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm mb-10 leading-relaxed px-4">
          {content.desc}
        </p>

        <button 
          onClick={() => router.push("/dashboard?verified=true")}
          className="w-full py-5 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-blue-600 dark:hover:bg-blue-700 transition-all shadow-xl active:scale-95"
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
