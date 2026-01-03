"use client"

import React, { useState } from "react"
import { supabase } from "@/lib/supabase"
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
      console.log('[LOGIN] Memulai login untuk:', normalizedEmail)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
        options: { captchaToken: turnstileToken }
      })

      if (error) throw error

      if (data?.user) {
        // --- LOGIKA AKSESIBILITAS KHUSUS ---
        // 1. Paksa kursor keluar dari kotak password (agar SR keluar dari kotak edit)
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }

        // 2. Set pesan sukses
        setMsg("Login Berhasil! Selamat datang di Dashboard Disabilitas dot com. Mengalihkan Anda sekarang...")
        setIsError(false)

        // 3. Pindahkan fokus kursor ke pesan sukses (agar dibaca instan & keluar dari form)
        // Kita beri sedikit jeda agar elemen pesan muncul di DOM terlebih dahulu
        setTimeout(() => {
          const alertElement = document.getElementById("login-announcement");
          if (alertElement) {
            alertElement.focus();
          }
        }, 100);

        // --- SINKRONISASI DATA PROFIL ---
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle()

        if (!profile) {
          const roleFromMetadata = data.user.user_metadata?.role || 'talent'
          await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: normalizedEmail,
              full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || '',
              role: roleFromMetadata,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
        } else {
          if (!profile.role && data.user.user_metadata?.role) {
            await supabase
              .from('profiles')
              .update({ 
                role: data.user.user_metadata.role,
                updated_at: new Date().toISOString()
              })
              .eq('id', data.user.id)
          }
        }

        // Jeda 1.5 detik agar Screen Reader selesai membacakan pengumuman sukses sepenuhnya
        setTimeout(() => {
          router.push("/dashboard")
          router.refresh()
        }, 1500)
      }

    } catch (error: any) {
      console.error('[LOGIN] Error:', error)
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-slate-900">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 text-center">
        <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg mb-6">
            <span className="text-white font-black text-2xl italic">{"D"}</span>
        </div>
        <h1 className="text-3xl font-black uppercase italic tracking-tighter dark:text-slate-50">
          {"Masuk ke Akun"}
        </h1>
        <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest italic">
          {"Akses Dashboard Disabilitas.com"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-slate-900 py-10 px-6 shadow-2xl rounded-[2.5rem] border border-slate-200 dark:border-slate-800">
          
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">
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
                className="appearance-none block w-full px-5 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 px-1">
                <label htmlFor="password" className="block text-[10px] font-black uppercase tracking-widest text-slate-500">
                  {"Kata Sandi"}
                </label>
                <Link href="/lupa-password" title="Klik untuk mengatur ulang kata sandi" className="text-[9px] font-black uppercase text-blue-600 hover:text-blue-700 underline decoration-2 underline-offset-4">
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
                  className="appearance-none block w-full px-5 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-blue-600 transition-colors"
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

            {/* ANNOUNCEMENT REGION: Diberi ID dan tabIndex agar bisa menerima fokus */}
            {msg && (
              <div 
                id="login-announcement"
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
              className="w-full flex justify-center items-center gap-3 py-4 px-4 rounded-2xl shadow-xl text-xs font-black uppercase tracking-[0.2em] text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
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
              <div className="relative flex justify-center text-[10px] font-black uppercase"><span className="px-4 bg-white dark:bg-slate-900 text-slate-400">{"Atau"}</span></div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/daftar"
                className="w-full flex justify-center py-4 px-4 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
              >
                {"Daftar Akun Baru"}
              </Link>
              <Link href="/" className="text-center text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] mt-2 group">
                <span className="group-hover:mr-2 transition-all">{"←"}</span> {"Kembali ke Beranda"}
              </Link>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
