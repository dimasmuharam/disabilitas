"use client"

import React, { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { signUpUser } from "@/lib/actions/auth"
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
  const [isSuccess, setIsSuccess] = useState(false)

  const PUBLIC_ROLES = [USER_ROLES.TALENT, USER_ROLES.COMPANY, USER_ROLES.PARTNER];
  const filteredRoles = USER_ROLE_LABELS.filter(r => PUBLIC_ROLES.includes(r.id as any));

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

    const normalizedEmail = email.toLowerCase().trim()
    // HARDCODE URL untuk menjamin kecocokan dengan Whitelist Supabase
    const finalRedirect = "https://www.disabilitas.com/konfirmasi"

    try {
      // Use unified Server Action for registration
      const result = await signUpUser({
        email: normalizedEmail,
        password,
        full_name: fullName,
        role: role as "talent" | "company" | "partner",
        captchaToken: turnstileToken,
        emailRedirectTo: finalRedirect,
      });

      if (!result?.success) {
        const message = result?.message || "Terjadi kesalahan sistem";
        throw new Error(message);
      }

      setIsSuccess(true)
      setMsg("Pendaftaran Berhasil! Instruksi aktivasi telah dikirim ke email Anda. Silakan cek kotak masuk atau folder spam.")
      setIsError(false)

      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      setTimeout(() => {
        const alertElement = document.getElementById("register-announcement");
        if (alertElement) alertElement.focus();
      }, 100);

      setTimeout(() => {
        router.push("/masuk");
      }, 5000);

    } catch (error: any) {
      console.error("[REGISTRASI] Error:", error)
      setIsError(true)
      setMsg(error.message || "Terjadi kesalahan sistem saat mendaftar.")
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col justify-center bg-slate-50 py-12 font-sans selection:bg-blue-100 sm:px-6 lg:px-8">
      
      <div className="px-4 text-center sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-blue-600 shadow-lg">
            <UserPlus className="text-white" size={32} />
        </div>
        <h1 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900">
          Daftar Akun Baru
        </h1>
      </div>

      <div className="mt-8 px-4 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-[2.5rem] border border-slate-200 bg-white px-6 py-10 shadow-2xl">
          
          {isError && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border-2 border-red-100 bg-red-50 p-4 text-red-700 duration-300 animate-in fade-in">
              <AlertCircle size={20} />
              <p className="text-[10px] font-black uppercase leading-tight tracking-widest">{msg}</p>
            </div>
          )}

          {!isSuccess ? (
            <form className="space-y-6" onSubmit={handleRegister}>
              <div className="space-y-2">
                <label htmlFor="role-select" className="ml-1 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Kategori Akun
                </label>
                <div className="relative">
                  <select 
                    id="role-select"
                    value={role} 
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full cursor-pointer appearance-none rounded-2xl border-2 border-slate-50 bg-slate-50 px-5 py-4 font-bold text-slate-900 outline-none transition-all focus:border-blue-600"
                  >
                    {filteredRoles.map((r) => (
                      <option key={r.id} value={r.id}>{r.label}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-5 flex items-center text-slate-400">
                    {role === USER_ROLES.TALENT && <User size={18} />}
                    {role === USER_ROLES.COMPANY && <Building2 size={18} />}
                    {role === USER_ROLES.PARTNER && <GraduationCap size={18} />}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="full_name" className="ml-1 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Nama Lengkap atau Instansi
                </label>
                <input 
                  id="full_name"
                  type="text" 
                  required 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama sesuai identitas..."
                  className="block w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-5 py-4 font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300 focus:border-blue-600" 
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="ml-1 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Alamat Email Aktif
                </label>
                <input 
                  id="email"
                  type="email" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="block w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-5 py-4 font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300 focus:border-blue-600" 
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="ml-1 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Kata Sandi Baru
                </label>
                <input 
                  id="password"
                  type="password" 
                  required 
                  minLength={6} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter..."
                  className="block w-full rounded-2xl border-2 border-slate-50 bg-slate-50 px-5 py-4 font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300 focus:border-blue-600" 
                />
              </div>

              <div className="flex scale-90 justify-center py-2 md:scale-100">
                  <Turnstile 
                      siteKey="0x4AAAAAACJnZ2_6aY-VEgfH" 
                      onSuccess={(token) => setTurnstileToken(token)}
                      options={{ theme: 'light' }} 
                  />
              </div>

              <button 
                  type="submit" 
                  disabled={loading || !turnstileToken} 
                  className="flex w-full justify-center rounded-2xl bg-blue-600 px-4 py-5 text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl transition-all hover:bg-blue-700 active:scale-95 disabled:opacity-50"
              >
                {loading ? "MEMPROSES DATA..." : "BUAT AKUN SEKARANG"}
              </button>
            </form>
          ) : (
            <div 
              id="register-announcement"
              role="alert" 
              aria-live="assertive" 
              tabIndex={-1}
              className="space-y-6 rounded-[2.5rem] border-2 border-emerald-100 bg-emerald-50 p-10 text-center text-emerald-700 outline-none animate-in zoom-in-95"
            >
              <CheckCircle2 size={56} className="mx-auto text-emerald-500" />
              <div className="space-y-2">
                <p className="text-lg font-black uppercase italic tracking-tighter">Pendaftaran Berhasil</p>
                <p className="text-[10px] font-bold uppercase leading-relaxed tracking-widest">
                  <strong>{msg}</strong>
                </p>
              </div>
              <div className="pt-4">
                <div className="mx-auto size-10 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600"></div>
                <p className="mt-4 text-[8px] font-black uppercase italic text-slate-400">Mengarahkan ke halaman masuk...</p>
              </div>
            </div>
          )}

          <nav className="mt-10 border-t border-slate-50 pt-6 text-center">
              <Link href="/masuk" className="text-[10px] font-black uppercase tracking-widest text-blue-600 transition-colors hover:text-slate-900">
                Sudah punya akun? Masuk di sini
              </Link>
          </nav>
        </div>
      </div>
    </main>
  )
}
