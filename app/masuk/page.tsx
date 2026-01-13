"use client"

import React, { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Turnstile } from '@marsidev/react-turnstile'
import { Eye, EyeOff, LogIn, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState("")
  const [isError, setIsError] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    // Set Canonical Link secara dinamis
    const link = document.querySelector("link[rel='canonical']") || document.createElement("link");
    link.setAttribute("rel", "canonical");
    link.setAttribute("href", "https://disabilitas.com/masuk");
    if (!document.head.contains(link)) document.head.appendChild(link);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!turnstileToken) {
        setMsg("Mohon tunggu validasi keamanan sistem selesai.");
        setIsError(true)
        return
    }

    setLoading(true)
    setMsg("")
    setIsError(false)

    const normalizedEmail = email.toLowerCase().trim()

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
        options: { captchaToken: turnstileToken }
      })

      if (error) throw error

      if (data?.user) {
        // --- MANAJEMEN AKSESIBILITAS ---
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }

        setMsg("Otentikasi Berhasil. Menghubungkan ke Portal Riset Disabilitas...");
        setIsError(false)

        // Pindahkan fokus ke pengumuman sukses
        setTimeout(() => {
          const alertElement = document.getElementById("login-announcement");
          if (alertElement) alertElement.focus();
        }, 100);

        // Jeda untuk Screen Reader membacakan pesan sukses
        setTimeout(() => {
          router.push("/dashboard")
          router.refresh()
        }, 2000)
      }

    } catch (error: any) {
      setIsError(true)
      setLoading(false)
      if (error.message.includes("Invalid login")) {
        setMsg("Kredensial tidak valid. Silakan periksa email dan sandi Anda.")
      } else if (error.message.includes("Email not confirmed")) {
        setMsg("Akses ditangguhkan. Silakan verifikasi email Anda terlebih dahulu.")
      } else {
        setMsg(error.message)
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-white py-12 font-sans text-slate-900 sm:px-6 lg:px-8">
      
      <div className="px-4 text-center sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-[1.5rem] bg-slate-900 text-white shadow-2xl">
            <ShieldCheck size={32} />
        </div>
        <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">
          {"Akses Portal"}
        </h1>
        <p className="mt-3 text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">
          {"Platform Riset & Pengembangan Talenta"}
        </p>
      </div>

      <div className="mt-10 px-4 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-[3rem] border-4 border-slate-900 bg-white px-8 py-12 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
          
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="mb-2 ml-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                {"Identitas Email"}
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="block w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 font-bold outline-none transition-all focus:border-slate-900 focus:bg-white"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between px-1">
                <label htmlFor="password" className="block text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {"Kata Sandi"}
                </label>
                <Link href="/lupa-password" internal-title="Reset Access" className="text-[9px] font-black uppercase text-blue-600 hover:underline decoration-2 underline-offset-4">
                  {"Lupa Sandi?"}
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 font-bold outline-none transition-all focus:border-slate-900 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-4 flex items-center text-slate-300 hover:text-slate-900"
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex justify-center py-2">
                <Turnstile 
                    siteKey="0x4AAAAAACJnZ2_6aY-VEgfH" 
                    onSuccess={(token) => setTurnstileToken(token)}
                    options={{ theme: 'light' }}
                />
            </div>

            {msg && (
              <div 
                id="login-announcement"
                role="alert" 
                aria-live="assertive" 
                tabIndex={-1}
                className={`rounded-2xl border-2 p-4 text-center text-[10px] font-black uppercase outline-none animate-in zoom-in-95 ${isError ? 'border-red-100 bg-red-50 text-red-700' : 'border-emerald-100 bg-emerald-50 text-emerald-700'}`}
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
              className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 p-5 text-[11px] font-black uppercase italic tracking-widest text-white shadow-xl transition-all hover:bg-blue-600 active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
            >
              {loading ? "PROSES OTENTIKASI..." : (
                <>
                  {"MASUK KE PORTAL"}
                  <LogIn size={18} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="mt-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-slate-50" /></div>
              <div className="relative flex justify-center text-[10px] font-black uppercase"><span className="bg-white px-4 text-slate-300">{"Atau"}</span></div>
            </div>

            <div className="mt-8">
              <Link
                href="/daftar"
                className="flex w-full justify-center rounded-2xl border-2 border-slate-100 p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-all hover:border-slate-900 hover:text-slate-900"
              >
                {"Daftar Akun Baru"}
              </Link>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
