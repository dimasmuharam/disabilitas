"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Turnstile } from '@marsidev/react-turnstile'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState("talent")
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState("")
  const [type, setType] = useState("info")
  const [turnstileToken, setTurnstileToken] = useState("")

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!turnstileToken) {
        setMsg("Mohon selesaikan verifikasi keamanan di bawah.")
        setType("error")
        return
    }

    setLoading(true)
    setMsg("")

    const siteUrl = typeof window !== 'undefined' ? window.location.origin : ''

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          data: {
            full_name: fullName, 
            role: role 
          },
          captchaToken: turnstileToken, 
          emailRedirectTo: `${siteUrl}/dashboard?verified=true`,
        },
      })

      if (error) throw error

      if (data.user && !data.session) {
        setType("success")
        setMsg("Pendaftaran berhasil! Silakan cek email Anda untuk konfirmasi aktivasi profil.")
        setEmail("")
        setPassword("")
        setFullName("")
      } else if (data.session) {
        router.push("/dashboard")
      }

    } catch (error: any) {
      setType("error")
      setMsg(error.message || "Terjadi kesalahan sistem.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 text-center">
        <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg mb-6" aria-hidden="true">
            <span className="text-white font-black text-2xl">{"D"}</span>
        </div>
        <h1 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-slate-50">
          {"Daftar Akun Baru"}
        </h1>
        <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest italic">
          {"Bergabung ke Ekosistem Inklusif disabilitas.com"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-slate-900 py-10 px-6 shadow-2xl rounded-[2.5rem] border border-slate-200 dark:border-slate-800">
          
          {/* ARIA Live Region untuk notifikasi error/sukses agar langsung terbaca Screen Reader */}
          <div aria-live="polite" className="mb-4">
            {msg && (
                <div role="alert" className={`p-4 rounded-2xl text-[11px] font-black uppercase text-center border ${type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                    {msg}
                </div>
            )}
          </div>

          <form className="space-y-6" onSubmit={handleRegister} aria-label="Formulir Pendaftaran Akun">
            
            <div>
              <label htmlFor="role-select" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">
                {"Daftar Sebagai"}
              </label>
              <select 
                id="role-select"
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-5 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
              >
                <option value="talent">{"Pencari Kerja (Talenta Disabilitas)"}</option>
                <option value="company">{"Pemberi Kerja (Perusahaan/Mitra)"}</option>
              </select>
            </div>

            <div>
              <label htmlFor="full_name" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">
                {"Nama Lengkap atau Instansi"}
              </label>
              <input 
                id="full_name"
                type="text" 
                required 
                autoComplete="name"
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Contoh: Dimas Muharam"
                className="appearance-none block w-full px-5 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none" 
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
                className="appearance-none block w-full px-5 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none" 
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
                className="appearance-none block w-full px-5 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>

            <div className="flex justify-center py-2" aria-label="Verifikasi Keamanan Cloudflare">
                <Turnstile 
                    siteKey="0x4AAAAAACJnZ2_6aY-VEgfH" 
                    onSuccess={(token) => setTurnstileToken(token)}
                    options={{ theme: 'auto' }} 
                />
            </div>

            <button 
                type="submit" 
                disabled={loading || !turnstileToken} 
                className="w-full flex justify-center py-4 px-4 rounded-2xl shadow-xl text-xs font-black uppercase tracking-[0.2em] text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {loading ? "SEDANG MEMPROSES..." : "DAFTAR SEKARANG"}
            </button>
          </form>

          <nav className="mt-8 text-center" aria-label="Navigasi Login">
             <Link href="/masuk" className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline focus:outline-dotted focus:outline-2">
                {"Sudah punya akun? Masuk di sini"}
             </Link>
          </nav>
        </div>
      </div>
    </div>
  )
}
