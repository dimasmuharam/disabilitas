"use client"

import React, { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Turnstile } from '@marsidev/react-turnstile'
import { 
  UserPlus, Building2, AlertCircle, 
  CheckCircle2, ShieldCheck, ChevronDown 
} from "lucide-react"
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

  // --- FUNGSI SUARA DIHAPUS UNTUK STANDAR AKSESIBILITAS ---

  useEffect(() => {
    const link = document.querySelector("link[rel='canonical']") || document.createElement("link");
    link.setAttribute("rel", "canonical");
    link.setAttribute("href", "https://disabilitas.com/daftar");
    if (!document.head.contains(link)) document.head.appendChild(link);
  }, []);

  const PUBLIC_ROLES = [
    USER_ROLES.TALENT, 
    USER_ROLES.COMPANY, 
    USER_ROLES.PARTNER, 
    USER_ROLES.CAMPUS,
    USER_ROLES.GOVERNMENT 
  ];
  
  const filteredRoles = USER_ROLE_LABELS.filter(r => PUBLIC_ROLES.includes(r.id as any));

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      (e.target as HTMLElement).blur();
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!turnstileToken) {
      setMsg("Mohon selesaikan verifikasi keamanan Turnstile.");
      setIsError(true);
      return;
    }

    setLoading(true)
    setMsg("")
    setIsError(false)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            full_name: fullName, 
            role: role 
          },
          emailRedirectTo: "https://www.disabilitas.com/konfirmasi",
        },
      })

      if (error) throw error

      if (data.user) {
        setIsSuccess(true)
        setMsg("Pendaftaran Berhasil! Silakan cek email aktivasi Anda.")
        
        setTimeout(() => {
router.push(`/daftar/konfirmasi?email=${encodeURIComponent(data.email)}`);
        }, 5000);
      }

    } catch (error: any) {
      setIsError(true)
      setMsg(error.message || "Gagal mendaftar.")
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col justify-center bg-slate-50 py-12 font-sans selection:bg-blue-100 sm:px-6 lg:px-8">
      
      <div className="px-4 text-center sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-blue-600 shadow-xl border-4 border-white">
            <UserPlus className="text-white" size={32} />
        </div>
        <h1 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900">
          Buat Akun Baru
        </h1>
        <p className="mt-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
          Digital Inclusion Ecosystem 2026
        </p>
      </div>

      <div className="mt-8 px-4 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-[3rem] border-4 border-slate-900 bg-white px-8 py-10 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] transition-all">
          
          {/* PESAN ERROR DENGAN ARIA-LIVE */}
          {isError && (
            <div 
              role="alert" 
              aria-live="assertive"
              className="mb-6 flex items-center gap-3 rounded-2xl border-4 border-rose-600 bg-rose-50 p-4 text-rose-700 animate-in slide-in-from-top-2"
            >
              <AlertCircle size={20} className="shrink-0" />
              <p className="text-[10px] font-black uppercase leading-tight tracking-widest">{msg}</p>
            </div>
          )}

          {!isSuccess ? (
            <form className="space-y-6" onSubmit={handleRegister}>
              <div className="space-y-2">
                <label htmlFor="role-select" className="ml-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Saya mendaftar sebagai:
                </label>
                <div className="relative">
                  <select 
                    id="role-select"
                    value={role} 
                    onChange={(e) => setRole(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full cursor-pointer appearance-none rounded-2xl border-4 border-slate-900 bg-slate-50 px-6 py-4 font-black uppercase italic text-slate-900 outline-none transition-all focus:bg-white focus:ring-8 focus:ring-blue-50"
                  >
                    {filteredRoles.map((r) => (
                      <option key={r.id} value={r.id}>{r.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 text-slate-900" size={20} />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="full_name" className="ml-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {role === USER_ROLES.TALENT ? "Nama Lengkap" : "Nama Institusi / Instansi"}
                </label>
                <input 
                  id="full_name"
                  type="text" 
                  required 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ketik di sini..."
                  className="block w-full rounded-2xl border-4 border-slate-900 bg-white px-6 py-4 font-bold text-slate-900 outline-none transition-all placeholder:text-slate-200 focus:bg-blue-50 focus:ring-8 focus:ring-blue-100/50" 
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="ml-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Alamat Email Aktif
                </label>
                <input 
                  id="email"
                  type="email" 
                  required 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="email@instansi.com"
                  className="block w-full rounded-2xl border-4 border-slate-900 bg-white px-6 py-4 font-bold text-slate-900 outline-none transition-all focus:bg-blue-50 focus:ring-8 focus:ring-blue-100/50" 
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" title="Minimal 6 karakter" className="ml-2 block text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Kata Sandi
                </label>
                <input 
                  id="password"
                  type="password" 
                  required 
                  minLength={6} 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="••••••••"
                  className="block w-full rounded-2xl border-4 border-slate-900 bg-white px-6 py-4 font-bold text-slate-900 outline-none transition-all focus:bg-blue-50 focus:ring-8 focus:ring-blue-100/50" 
                />
              </div>

              <div className="flex justify-center py-2 overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-4">
                  <Turnstile 
                      siteKey="0x4AAAAAACJnZ2_6aY-VEgfH" 
                      onSuccess={(token) => setTurnstileToken(token)}
                      options={{ theme: 'light' }} 
                  />
              </div>

              <button 
                  type="submit" 
                  disabled={loading || !turnstileToken} 
                  className="group relative flex w-full items-center justify-center gap-3 rounded-2xl border-4 border-slate-900 bg-blue-600 py-5 text-sm font-black uppercase italic tracking-widest text-white shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-slate-900 hover:shadow-none active:translate-x-1 active:translate-y-1 disabled:opacity-30"
              >
                {loading ? "SINKRONISASI..." : "DAFTAR SEKARANG"}
                <ShieldCheck className="group-hover:animate-pulse" size={20} />
              </button>
            </form>
          ) : (
            <div 
              role="status" 
              aria-live="polite" 
              className="space-y-6 rounded-[2rem] border-4 border-emerald-600 bg-emerald-50 p-10 text-center animate-in zoom-in-95 duration-500"
            >
              <CheckCircle2 size={64} className="mx-auto text-emerald-600" />
              <div className="space-y-2">
                <h2 className="text-2xl font-black uppercase italic tracking-tighter text-emerald-900">Email Terkirim!</h2>
                <p className="text-[10px] font-bold uppercase leading-relaxed tracking-widest text-emerald-700">
                  {msg}
                </p>
              </div>
            </div>
          )}

          <div className="mt-10 border-t-4 border-slate-50 pt-8 text-center">
              <Link href="/masuk" className="text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:text-blue-600 underline decoration-slate-200 underline-offset-8">
                Sudah punya akun? Masuk Kembali
              </Link>
          </div>
          
        </div>
      </div>
    </main>
  )
}