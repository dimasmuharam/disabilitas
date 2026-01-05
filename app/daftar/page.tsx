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

  // WHITE-LIST ROLE: Menjamin Admin/Government tidak bocor ke publik
  const PUBLIC_ROLES = [USER_ROLES.TALENT, USER_ROLES.COMPANY, USER_ROLES.PARTNER];
  const filteredRoles = USER_ROLE_LABELS.filter(r => PUBLIC_ROLES.includes(r.id as any));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!turnstileToken) {
        setMsg(`{"Mohon selesaikan verifikasi keamanan Turnstile terlebih dahulu."}`)
        setIsError(true)
        return
    }

    setLoading(true)
    setMsg("")
    setIsError(false)

    const siteUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const normalizedEmail = email.toLowerCase().trim()

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
          emailRedirectTo: `${siteUrl}/konfirmasi`,
        },
      })

      if (error) throw error

      if (data.user) {
        // --- LOGIKA AKSESIBILITAS & UX ---
        setIsSuccess(true)
        setMsg(`{"Pendaftaran Berhasil! Instruksi aktivasi telah dikirim ke email Anda. Anda akan diarahkan ke halaman masuk dalam 3 detik."}`)
        setIsError(false)

        // Keluar dari kotak edit agar keyboard virtual (HP) tertutup
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }

        // Pindahkan fokus ke pesan status untuk Screen Reader
        setTimeout(() => {
          const alertElement = document.getElementById("register-announcement");
          if (alertElement) alertElement.focus();
        }, 100);

        // Redirect ke halaman masuk setelah memberi waktu SR membacakan pesan
        setTimeout(() => {
          router.push("/masuk");
        }, 4000);
      }

    } catch (error: any) {
      console.error('[REGISTRASI] Error:', error)
      setIsError(true)
      setMsg(error.message || `{"Terjadi kesalahan sistem saat mendaftar."}`)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 text-center">
        <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg mb-6">
            <UserPlus className="text-white" size={32} />
        </div>
        <h1 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-slate-50">
          {"Daftar Akun Baru"}
        </h1>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-slate-900 py-10 px-6 shadow-2xl rounded-[2.5rem] border border-slate-200 dark:border-slate-800">
          
          {/* Tampilan Kondisional: Sembunyikan form jika sukses agar fokus ke pesan */}
          {!isSuccess ? (
            <form className="space-y-6" onSubmit={handleRegister}>
              <div>
                <label htmlFor="role-select" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">
                  {"Daftar Sebagai"}
                </label>
                <div className="relative">
                  <select 
                    id="role-select"
                    value={role} 
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-5 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold outline-none appearance-none cursor-pointer transition-all"
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

              <div>
                <label htmlFor="full_name" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">
                  {"Nama Lengkap / Instansi"}
                </label>
                <input 
                  id="full_name"
                  type="text" 
                  required 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nama sesuai identitas..."
                  className="appearance-none block w-full px-5 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold outline-none transition-all" 
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">
                  {"Alamat Email"}
                </label>
                <input 
                  id="email"
                  type="email" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="appearance-none block w-full px-5 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold outline-none transition-all" 
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">
                  {"Kata Sandi"}
                </label>
                <input 
                  id="password"
                  type="password" 
                  required 
                  minLength={6} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="appearance-none block w-full px-5 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold outline-none transition-all" 
                />
              </div>

              <div className="flex justify-center py-2">
                  <Turnstile 
                      siteKey="0x4AAAAAACJnZ2_6aY-VEgfH" 
                      onSuccess={(token) => setTurnstileToken(token)}
                      options={{ theme: 'auto' }} 
                  />
              </div>

              <button 
                  type="submit" 
                  disabled={loading || !turnstileToken} 
                  className="w-full flex justify-center py-5 px-4 rounded-2xl shadow-xl text-xs font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                {loading ? "MEMPROSES DATA..." : "BUAT AKUN SEKARANG"}
              </button>
            </form>
          ) : (
            /* AREA NOTIFIKASI SUKSES (Hanya ini yang tampil saat berhasil) */
            <div 
              id="register-announcement"
              role="alert" 
              aria-live="assertive" 
              tabIndex={-1}
              className="p-10 rounded-[2rem] bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-2 border-emerald-100 dark:border-emerald-800 text-center space-y-4 animate-in zoom-in-95 outline-none"
            >
              <CheckCircle2 size={48} className="mx-auto mb-4" />
              <p className="text-sm font-black uppercase tracking-tighter">{"Pendaftaran Berhasil!"}</p>
              <p className="text-[10px] font-bold leading-relaxed uppercase">
                {msg}
              </p>
              <div className="pt-6">
                <div className="w-8 h-8 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto"></div>
              </div>
            </div>
          )}

          <nav className="mt-8 text-center">
             <Link href="/masuk" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">
                {"Sudah punya akun? Masuk di sini"}
             </Link>
          </nav>
        </div>
      </div>
    </div>
  )
}
