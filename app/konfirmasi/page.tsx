"use client"

import { useEffect, useState, Suspense } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { CheckCircle, ArrowRight, User, Building2 } from "lucide-react"

function ConfirmContent() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function getProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name, role")
          .eq("id", user.id)
          .single()
        setProfile(data)
      }
      setLoading(false)
    }
    getProfile()
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <p className="font-black animate-pulse text-slate-400 uppercase italic">{"Memverifikasi Akun..."}</p>
    </div>
  )

  const isCompany = profile?.role === "company"

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-[3rem] shadow-2xl p-10 text-center border border-slate-100">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 p-4 rounded-full">
            <CheckCircle size={48} className="text-green-600" />
          </div>
        </div>

        <h1 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 mb-2">
          {"Konfirmasi Berhasil"}
        </h1>
        
        <p className="text-slate-500 font-bold text-sm mb-8 leading-relaxed">
          {"Halo, "}<span className="text-blue-600">{profile?.full_name || "Pengguna"}</span>{"!"}
          <br />
          {isCompany 
            ? "Akun perusahaan Anda telah aktif. Mari temukan talenta terbaik untuk bisnis Anda."
            : "Akun talenta Anda telah aktif. Mari lengkapi profil untuk meningkatkan peluang karir."}
        </p>

        <button 
          onClick={() => router.push("/dashboard?verified=true")}
          className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
        >
          {isCompany ? "Masuk ke Dashboard Bisnis" : "Lengkapi Profil Sekarang"}
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
