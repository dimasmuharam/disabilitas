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
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            full_name: fullName, 
            role: role 
          },
          captchaToken: turnstileToken, 
          emailRedirectTo: finalRedirect,
        },
      })

      if (error) throw error

      if (data.user) {
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
      }

    } catch (error: any) {
      console.error("[REGISTRASI] Error:", error)
      setIsError(true)
      setMsg(error.message || "Terjadi kesalahan sistem saat mendaftar.")
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-blue-100">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 text-center">
        <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg mb-6">
            <UserPlus className="text-white" size={32} />
        </div>
        <h1 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900">
          Daftar Akun Baru
        </h1>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-10 px-6 shadow-2xl rounded-[2.5rem] border border-slate-200">
          
          {isError && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-100 rounded-2xl flex items-center gap-3 text-red-700 animate-in fade-in duration-300">
              <AlertCircle size={20} />
              <p className="text-[10px] font-black uppercase tracking-widest leading-tight">{msg}</p>
            </div>
          )}

          {!isSuccess ? (
            <form className="space-y-6" onSubmit={handleRegister}>
              <div className="space-y-2">
                <label htmlFor="role-select" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                  Kategori Akun
                </label>
                <div className="relative">
                  <select 
                    id="role-select"
                    value={role} 
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-5 py-4 border-2 border-slate-50 rounded-2xl bg-slate-50 text-slate-900 font-bold outline-none appearance-none cursor-pointer focus:border-blue-600 transition-all"
                  >
                    {filteredRoles.map((r) => (
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

              <div className="space-y-2">
                <label htmlFor="full_name" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                  Nama Lengkap atau Instansi
                </label>
                <input 
                  id="full_name"
                  type="text" 
                  required 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama sesuai identitas..."
                  className="block w-full px-5 py-4 border-2 border-slate-50 rounded-2xl bg-slate-50 text-slate-900 font-bold outline-none focus:border-blue-600 transition-all placeholder:text-slate-300" 
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
                  Alamat Email Aktif
                </label>
                <input 
                  id="email"
                  type="email" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="block w-full px-5 py-4 border-2 border-slate-50 rounded-2xl bg-slate-50 text-slate-900 font-bold outline-none focus:border-blue-600 transition-all placeholder:text-slate-300" 
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
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
                  className="block w-full px-5 py-4 border-2 border-slate-50 rounded-2xl bg-slate-50 text-slate-900 font-bold outline-none focus:border-blue-600 transition-all placeholder:text-slate-300" 
                />
              </div>

              <div className="flex justify-center py-2 scale-90 md:scale-100">
                  <Turnstile 
                      siteKey="0x4AAAAAACJnZ2_6aY-VEgfH" 
                      onSuccess={(token) => setTurnstileToken(token)}
                      options={{ theme: 'light' }} 
                  />
              </div>

              <button 
                  type="submit" 
                  disabled={loading || !turnstileToken} 
                  className="w-full flex justify-center py-5 px-4 rounded-2xl shadow-xl text-xs font-black uppercase tracking-[0.2em] text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95"
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
              className="p-10 rounded-[2.5rem] bg-emerald-50 text-emerald-700 border-2 border-emerald-100 text-center space-y-6 animate-in zoom-in-95 outline-none"
            >
              <CheckCircle2 size={56} className="mx-auto text-emerald-500" />
              <div className="space-y-2">
                <p className="text-lg font-black uppercase italic tracking-tighter">Pendaftaran Berhasil</p>
                <p className="text-[10px] font-bold leading-relaxed uppercase tracking-widest">
                  <strong>{msg}</strong>
                </p>
              </div>
              <div className="pt-4">
                <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-[8px] font-black uppercase text-slate-400 italic">Mengarahkan ke halaman masuk...</p>
              </div>
            </div>
          )}

          <nav className="mt-10 text-center border-t border-slate-50 pt-6">
              <Link href="/masuk" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-slate-900 transition-colors">
                Sudah punya akun? Masuk di sini
              </Link>
          </nav>
        </div>
      </div>
    </main>
  )
}
