"use client"

import React, { useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Turnstile } from '@marsidev/react-turnstile'
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, KeyRound } from "lucide-react"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState("")
  const [isError, setIsError] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState("")

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!turnstileToken) {
        setMsg("Mohon tunggu verifikasi keamanan selesai.")
        setIsError(true)
        return
    }

    setLoading(true)
    setMsg("")
    setIsError(false)

    const normalizedEmail = email.toLowerCase().trim()

    try {
      // Mengirimkan link reset password ke email talenta
      const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
        redirectTo: `${window.location.origin}/perbarui-password`,
      })

      if (error) throw error

      // --- LOGIKA AKSESIBILITAS ---
      // 1. Lepas kursor dari input email
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      // 2. Pengumuman sukses (aria-live akan membacakan ini)
      setMsg("Instruksi Berhasil Dikirim! Silakan periksa kotak masuk email Anda untuk melakukan reset kata sandi. Anda akan diarahkan kembali ke halaman masuk dalam 5 detik...");
      setIsError(false);

      // 3. Pindahkan fokus ke pesan sukses agar Screen Reader keluar dari kotak edit
      setTimeout(() => {
        const alertElement = document.getElementById("reset-announcement");
        if (alertElement) alertElement.focus();
      }, 100);

      // 4. JEDA 5 DETIK agar pengumuman instruksi terbaca tuntas sebelum pindah halaman
      setTimeout(() => {
        router.push("/masuk");
      }, 5000);

    } catch (error: any) {
      setIsError(true)
      setLoading(false)
      setMsg(error.message || "Gagal mengirim permintaan. Pastikan email Anda benar.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-slate-900">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 text-center">
        <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg mb-6 text-white">
            {/* Properti italic sudah dihapus agar tidak error lagi */}
            <KeyRound size={32} />
        </div>
        <h1 className="text-3xl font-black uppercase italic tracking-tighter dark:text-slate-50">
          {"Lupa Sandi"}
        </h1>
        <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest italic">
          {"Atur Ulang Akses Akun Disabilitas.com"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-slate-900 py-10 px-6 shadow-2xl rounded-[2.5rem] border border-slate-200 dark:border-slate-800">
          
          <form className="space-y-6" onSubmit={handleResetPassword}>
            <div>
              <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">
                {"Alamat Email Akun"}
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="appearance-none block w-full px-5 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            <div className="flex justify-center py-2">
                <Turnstile 
                    siteKey="0x4AAAAAACJnZ2_6aY-VEgfH" 
                    onSuccess={(token) => setTurnstileToken(token)}
                    options={{ theme: 'auto' }}
                />
            </div>

            {/* ANNOUNCEMENT REGION */}
            {msg && (
              <div 
                id="reset-announcement"
                role="alert" 
                aria-live="assertive" 
                tabIndex={-1}
                className={`p-4 rounded-2xl text-[11px] font-black uppercase text-center border outline-none ${isError ? 'bg-red-50 text-red-700 border-red-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'} animate-in zoom-in-95`}
              >
                <div className="flex items-center justify-center gap-2">
                  {isError ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                  {msg}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !turnstileToken}
              className="w-full flex justify-center items-center gap-3 py-4 px-4 rounded-2xl shadow-xl text-xs font-black uppercase tracking-[0.2em] text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all active:scale-[0.98]"
            >
              {loading ? "MENGIRIM INSTRUKSI..." : "KIRIM LINK ATUR ULANG"}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
              <Link href="/masuk" className="flex justify-center items-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
                {"Kembali ke Halaman Masuk"}
              </Link>
          </div>
          
        </div>
      </div>
    </div>
  )
}
