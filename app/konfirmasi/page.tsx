"use client"

import React, { useEffect, useState, Suspense } from "react"
import { createClient } from "@/lib/supabase/client"
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
      const supabase = createClient()
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
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950" aria-busy="true">
      <p className="animate-pulse text-sm font-black uppercase italic tracking-widest text-slate-400">
        Menyinkronkan Akun...
      </p>
    </div>
  )

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6 font-sans selection:bg-blue-100 dark:bg-slate-950">
      <div className="w-full max-w-md rounded-[3rem] border border-slate-100 bg-white p-10 text-center shadow-2xl duration-500 animate-in zoom-in-95 dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-8 flex justify-center">
          <div className="rounded-[2.5rem] bg-slate-50 p-6 text-blue-600 shadow-inner dark:bg-slate-800 dark:text-blue-400">
            {content.icon}
          </div>
        </div>

        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-5 py-1.5 dark:bg-emerald-900/30">
          <CheckCircle size={14} className="text-emerald-600 dark:text-emerald-400" />
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
            Email Terverifikasi
          </span>
        </div>

        <h1 className="mb-4 text-2xl font-black uppercase italic tracking-tighter text-slate-900 outline-none dark:text-slate-50">
          {content.title}
        </h1>
        
        <p className="mb-10 px-4 text-sm font-bold leading-relaxed text-slate-500 dark:text-slate-400">
          {content.desc}
        </p>

        <button 
          onClick={() => router.push("/dashboard?verified=true")}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl transition-all hover:bg-blue-600 active:scale-95 dark:bg-blue-600 dark:hover:bg-blue-700"
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
