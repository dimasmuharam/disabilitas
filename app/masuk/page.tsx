"use client"

import React, { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { signIn } from "@/lib/actions/auth"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Turnstile } from '@marsidev/react-turnstile'
import { Eye, EyeOff, LogIn, CheckCircle2, AlertCircle } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState("")
  const [isError, setIsError] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!turnstileToken) {
        setMsg("Mohon tunggu verifikasi keamanan (Turnstile) selesai.")
        setIsError(true)
        return
    }

    setLoading(true)
    setMsg("")
    setIsError(false)

    const normalizedEmail = email.toLowerCase().trim()

    try {
      // Use unified Server Action for sign in with role-based redirection
      const result = await signIn({
        email: normalizedEmail,
        password,
      });

      if (!result.success) {
        throw new Error(result.error || "Login failed");
      }

      // --- LOGIKA AKSESIBILITAS KHUSUS ---
      // 1. Paksa kursor keluar dari kotak edit agar mode formulir berhenti
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      // 2. Set pesan sukses
      setMsg("Login Berhasil! Selamat datang di Dashboard Disabilitas dot com. Anda akan diarahkan ke judul halaman utama...");
      setIsError(false)

      // 3. Pasang 'ranjau' fokus untuk halaman Dashboard
      sessionStorage.setItem("pindahkan_fokus_ke_h1", "true");

      // 4. Pindahkan fokus kursor ke pesan sukses sementara (agar dibaca instan)
      setTimeout(() => {
        const alertElement = document.getElementById("login-announcement");
        if (alertElement) alertElement.focus();
      }, 100);

      // 5. JEDA 3 DETIK agar pengumuman suara terbaca tuntas oleh Screen Reader
      setTimeout(() => {
        const redirectPath = result.redirectPath || "/dashboard";
        router.push(redirectPath);
        router.refresh();
      }, 3000);

    } catch (error: any) {
      setIsError(true)
      setLoading(false)
      if (error.message.includes("Invalid login")) {
        setMsg("Email atau password salah.")
      } else if (error.message.includes("Email not confirmed")) {
        setMsg("Email belum diverifikasi. Silakan cek kotak masuk Anda.")
      } else {
        setMsg(error.message)
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-slate-50 py-12 font-sans text-slate-900 dark:bg-slate-950 sm:px-6 lg:px-8">
      
      <div className="px-4 text-center sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg">
            <span className="text-2xl font-black italic">{"D"}</span>
        </div>
        <h1 className="text-3xl font-black uppercase italic tracking-tighter dark:text-slate-50">
          {"Masuk ke Akun"}
        </h1>
        <p className="mt-2 text-sm font-bold uppercase italic tracking-widest text-slate-500 dark:text-slate-400">
          {"Akses Dashboard Disabilitas.com"}
        </p>
      </div>

      <div className="mt-8 px-4 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-[2.5rem] border border-slate-200 bg-white px-6 py-10 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="mb-2 ml-1 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                {"Alamat Email"}
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="block w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-bold outline-none transition-all focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between px-1">
                <label htmlFor="password" className="block text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {"Kata Sandi"}
                </label>
                <Link href="/lupa-password" intermediate-title="Reset Kata Sandi" className="rounded p-1 text-[9px] font-black uppercase text-blue-600 underline decoration-2 underline-offset-4 hover:text-blue-700 focus:ring-2 focus:ring-blue-500">
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
                  className="block w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-bold outline-none transition-all focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-4 flex items-center text-slate-400 transition-colors hover:text-blue-600"
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
                    options={{ theme: 'auto' }}
                />
            </div>

            {msg && (
              <div 
                id="login-announcement"
                role="alert" 
                aria-live="assertive" 
                tabIndex={-1}
                className={`rounded-2xl border p-4 text-center text-[11px] font-black uppercase outline-none ${isError ? 'border-red-100 bg-red-50 text-red-700' : 'border-emerald-100 bg-emerald-50 text-emerald-700'} animate-in zoom-in-95`}
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
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 p-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.98]"
            >
              {loading ? "MENSINKRONISASI..." : (
                <>
                  {"MASUK KE DASHBOARD"}
                  <LogIn size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-800" /></div>
              <div className="relative flex justify-center text-[10px] font-black uppercase"><span className="bg-white px-4 text-slate-400 dark:bg-slate-900">{"Atau"}</span></div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/daftar"
                className="flex w-full justify-center rounded-2xl border-2 border-slate-100 p-4 text-[10px] font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
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
