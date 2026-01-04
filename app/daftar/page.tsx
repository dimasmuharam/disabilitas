"use client"

import React, { useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Turnstile } from '@marsidev/react-turnstile'
import { UserPlus, User, Building2, GraduationCap, CheckCircle2, AlertCircle } from "lucide-react"
import { USER_ROLES, USER_ROLE_LABELS } from "@/lib/data-static"

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState<string>(USER_ROLES.TALENT)
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState("")
  const [isError, setIsError] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState("")

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!turnstileToken) {
        setMsg("Mohon selesaikan verifikasi keamanan Turnstile terlebih dahulu.")
        setIsError(true)
        return
    }

    setLoading(true)
    setMsg("")
    setIsError(false)

    const siteUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const normalizedEmail = email.toLowerCase().trim()

    try {
      // 1. Proses Sign Up ke Supabase Auth
      // Data role dan full_name dikirim sebagai metadata agar ditangkap oleh Trigger SQL
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: fullName, 
            role: role 
          },
          captchaToken: turnstileToken, 
          emailRedirectTo: `${siteUrl}/konfirmasi`,
        },
      })

      if (error) throw error

      if (data.user) {
        // --- LOGIKA AKSESIBILITAS ---
        // Paksa kursor keluar dari kotak edit
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }

        setMsg("Pendaftaran Berhasil! Instruksi aktivasi telah dikirim ke email Anda. Silakan periksa kotak masuk.")
        setIsError(false)

        // Pindahkan fokus ke pesan sukses agar Screen Reader membacakan status
        setTimeout(() => {
          const alertElement = document.getElementById("register-announcement");
          if (alertElement) alertElement.focus();
        }, 100);

        // Reset Form
        setEmail("")
        setPassword("")
        setFullName("")
      }

    } catch (error: any) {
      console.error('[REGISTRASI] Error:', error)
      setIsError(true)
      setMsg(error.message || "Terjadi kesalahan sistem saat mendaftar.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 text-center">
        <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg mb-6" aria-hidden="true">
            <UserPlus className="text-white" size={32} />
        </div>
        <h1 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-slate-50">
          {"Daftar Akun Baru"}
        </h1>
        <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest italic">
          {"Bergabung ke Ekosistem Inklusif Disabilitas.com"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-slate-900 py-10 px-6 shadow-2xl rounded-[2.5rem] border border-slate-200 dark:border-slate-800">
          
          <form className="space-y-6" onSubmit={handleRegister}>
            
            {/* Pilihan Role dengan Ikon Statis agar tidak error build */}
            <div>
              <label htmlFor="role-select" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">
                {"Daftar Sebagai"}
              </label>
              <div className="relative">
                <select 
                  id="role-select"
                  value={role} 
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-5 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer transition-all"
                >
                  {USER_ROLE_LABELS.filter(r => r.id !== 'government').map((r) => (
                    <option key={r.id} value={r.id}>{r.label}</option>
                  ))}
                </select>
                <div className="absolute right-5 inset-y-0 flex items-center pointer-events-none text-slate-400">
                  {role === USER_ROLES.TALENT && <User size={18} />}
                  {role === USER_ROLES.COMPANY && <Building2 size={18} />}
                  {role === USER_ROLES.PARTNER && <GraduationCap size={18} />}
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="full_name" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">
                {"Nama Lengkap atau Nama Instansi"}
              </label>
              <input 
                id="full_name"
                type="text" 
                required 
                autoComplete="name"
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Contoh: Dimas Muharam / PT Inklusi Digital"
                className="appearance-none block w-full px-5 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">
                {"Alamat Email Aktif"}
              </label>
              <input 
                id="email"
                type="email" 
                required 
                autoComplete="email"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="appearance-none block w-full px-5 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">
                {"Kata Sandi (Minimal 6 Karakter)"}
              </label>
              <input 
                id="password"
                type="password" 
                required 
                minLength={6} 
                autoComplete="new-password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="appearance-none block w-full px-5 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
              />
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
                id="register-announcement"
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
                className="w-full flex justify-center py-4 px-4 rounded-2xl shadow-xl text-xs font-black uppercase tracking-[0.2em] text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {loading ? "SEDANG MEMPROSES..." : "BUAT AKUN SEKARANG"}
            </button>
          </form>

          <nav className="mt-8 text-center" aria-label="Navigasi Login">
             <Link href="/masuk" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline decoration-2 underline-offset-4 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1">
                {"Sudah punya akun? Masuk di sini"}
             </Link>
          </nav>
        </div>
      </div>
    </div>
  )
}
