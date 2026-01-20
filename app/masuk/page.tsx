"use client"

import React, { useState, useEffect, Suspense } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation" // Tambahkan useSearchParams
import { Turnstile } from '@marsidev/react-turnstile'
import { Eye, EyeOff, LogIn, CheckCircle2, AlertCircle, ShieldCheck, RefreshCw } from "lucide-react"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams() // Inisialisasi searchParams
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState("")
  const [isError, setIsError] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showResendBtn, setShowResendBtn] = useState(false) // State baru untuk tombol kirim ulang

  // Efek untuk menangkap error=expired dari URL
  useEffect(() => {
    const errorType = searchParams.get("error");
    if (errorType === "expired") {
      setIsError(true);
      setMsg("Tautan verifikasi Anda kadaluwarsa. Silakan masukkan email di bawah untuk kirim ulang.");
      setShowResendBtn(true);
    }
  }, [searchParams]);

  // Logika Kirim Ulang Email
  const handleResendVerification = async () => {
    if (!email) {
      setMsg("Masukkan alamat email Anda terlebih dahulu.");
      setIsError(true);
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });
    
    if (error) {
      setMsg(error.message);
      setIsError(true);
    } else {
      setMsg("Email verifikasi baru telah dikirim! Silakan cek inbox Anda.");
      setIsError(false);
      setShowResendBtn(false);
    }
    setLoading(false);
  };

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
    setShowResendBtn(false) // Reset tombol resend saat mencoba login baru

    const normalizedEmail = email.toLowerCase().trim()

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
        options: { captchaToken: turnstileToken }
      })

      if (error) throw error

      if (data?.user) {
        setMsg("Otentikasi Berhasil. Menghubungkan ke Dashboard...");
        setTimeout(() => {
          router.push("/dashboard")
          router.refresh()
        }, 2000)
      }

    } catch (error: any) {
      setIsError(true)
      setLoading(false)
      
      // Deteksi error email belum verifikasi
      if (error.message.includes("Email not confirmed")) {
        setMsg("Email belum diverifikasi. Klik tombol di bawah untuk kirim ulang link.");
        setShowResendBtn(true);
      } else if (error.message.includes("Invalid login")) {
        setMsg("Kredensial tidak valid. Silakan periksa kembali email & sandi.");
      } else {
        setMsg(error.message)
      }
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-white py-12 font-sans text-slate-900 sm:px-6 lg:px-8">
      {/* HEADER TETAP SAMA */}
      <div className="px-4 text-center sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-3xl bg-slate-900 text-white shadow-2xl">
            <ShieldCheck size={32} />
        </div>
        <h1 className="text-4xl font-black uppercase italic leading-none tracking-tighter">Akses Portal</h1>
        <p className="mt-3 text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Platform Karir Talenta Inklusif</p>
      </div>

      <div className="mt-10 px-4 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-[3rem] border-4 border-slate-900 bg-white px-8 py-12 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
          
          <form className="space-y-6" onSubmit={handleLogin}>
            {/* INPUT EMAIL */}
            <div>
              <label htmlFor="email" className="mb-2 ml-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">Identitas Email</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="block w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 font-bold outline-none transition-all focus:border-slate-900 focus:bg-white"
              />
            </div>

            {/* INPUT PASSWORD */}
            {!showResendBtn && ( // Sembunyikan password jika sedang mode kirim ulang email
              <div className="duration-300 animate-in fade-in">
                <div className="mb-2 flex items-center justify-between px-1">
                  <label htmlFor="password" className="block text-[10px] font-black uppercase tracking-widest text-slate-400">Kata Sandi</label>
                  <Link href="/lupa-password" internal-title="Reset Access" className="text-[9px] font-black uppercase text-blue-600 hover:underline">Lupa Sandi?</Link>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required={!showResendBtn}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4 font-bold outline-none transition-all focus:border-slate-900 focus:bg-white"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-4 flex items-center text-slate-300 hover:text-slate-900">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-center py-2">
                <Turnstile siteKey="0x4AAAAAACJnZ2_6aY-VEgfH" onSuccess={(token) => setTurnstileToken(token)} options={{ theme: 'light' }} />
            </div>

            {/* PESAN NOTIFIKASI */}
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

            {/* TOMBOL AKSI UTAMA */}
            {!showResendBtn ? (
              <button
                type="submit"
                disabled={loading || !turnstileToken}
                className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 p-5 text-[11px] font-black uppercase italic tracking-widest text-white shadow-xl transition-all hover:bg-blue-600 active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? "PROSES OTENTIKASI..." : (
                  <>MASUK KE PORTAL <LogIn size={18} className="transition-transform group-hover:translate-x-1" /></>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleResendVerification}
                disabled={loading || !turnstileToken}
                className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-blue-600 p-5 text-[11px] font-black uppercase italic tracking-widest text-white shadow-xl transition-all hover:bg-slate-900 active:scale-[0.98]"
              >
                {loading ? "MENGIRIM ULANG..." : (
                  <>KIRIM ULANG LINK KONFIRMASI <RefreshCw size={18} className="transition-transform group-hover:rotate-180" /></>
                )}
              </button>
            )}
          </form>

          {/* FOOTER TETAP SAMA */}
          <div className="mt-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-slate-50" /></div>
              <div className="relative flex justify-center text-[10px] font-black uppercase"><span className="bg-white px-4 text-slate-300">Atau</span></div>
            </div>
            <div className="mt-8">
              <Link href="/daftar" className="flex w-full justify-center rounded-2xl border-2 border-slate-100 p-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-slate-900 hover:text-slate-900">Daftar Akun Baru</Link>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 size-16 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900"></div>
          <p className="text-sm font-medium text-slate-600">Memuat...</p>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}