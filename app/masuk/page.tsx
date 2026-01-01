"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Turnstile } from '@marsidev/react-turnstile'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState("")
  const [isError, setIsError] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState("")

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
      
      // 1. Melakukan SignIn
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
        options: { captchaToken: turnstileToken }
      })

      if (error) throw error

      console.log('[LOGIN] Login berhasil, user ID:', data?.user?.id)

      if (data?.user) {
        // 2. Verifikasi instan apakah data profil sudah ada di tabel profiles
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle()

        if (!profile) {
          console.warn('[LOGIN] Profile tidak ditemukan, mencoba membuat profile baru')
          
          // Auto-create profile jika belum ada
          const roleFromMetadata = data.user.user_metadata?.role || 'talent'
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: normalizedEmail,
              full_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || '',
              role: roleFromMetadata,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
          
          if (insertError) {
            console.error('[LOGIN] Error membuat profile:', insertError)
            setMsg("Login berhasil, namun ada masalah sinkronisasi profil. Silakan refresh halaman dashboard.")
          } else {
            console.log('[LOGIN] Profile berhasil dibuat dengan role:', roleFromMetadata)
          }
        } else {
          console.log('[LOGIN] Profile ditemukan dengan role:', profile.role)
          
          // Pastikan role ada, jika tidak ada update dari metadata
          if (!profile.role && data.user.user_metadata?.role) {
            console.log('[LOGIN] Updating profile dengan role dari metadata')
            await supabase
              .from('profiles')
              .update({ 
                role: data.user.user_metadata.role,
                updated_at: new Date().toISOString()
              })
              .eq('id', data.user.id)
          }
        }
      }

      // 3. Arahkan ke dashboard
      console.log('[LOGIN] Redirect ke dashboard')
      router.push("/dashboard")
      router.refresh() 

    } catch (error: any) {
      console.error('[LOGIN] Error:', error)
      setIsError(true)
      if (error.message.includes("Invalid login")) {
        setMsg("Email atau password salah.")
      } else if (error.message.includes("Email not confirmed")) {
        setMsg("Email belum diverifikasi. Silakan cek kotak masuk Anda.")
      } else {
        setMsg(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 text-center">
        <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg mb-6">
            <span className="text-white font-black text-2xl">{"D"}</span>
        </div>
        <h1 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-slate-50">
          {"Masuk ke Akun"}
        </h1>
        <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest italic">
          {"Akses Pusat Riset & Karir Disabilitas"}
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
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="appearance-none block w-full px-5 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="appearance-none block w-full px-5 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            {/* Turnstile Verification */}
            <div className="flex justify-center py-2">
                <Turnstile 
                    siteKey="0x4AAAAAACJnZ2_6aY-VEgfH" 
                    onSuccess={(token) => setTurnstileToken(token)}
                    options={{ theme: 'auto' }}
                />
            </div>

            {msg && (
              <div role="alert" className={`p-4 rounded-2xl text-[11px] font-black uppercase text-center border ${isError ? 'bg-red-50 text-red-700 border-red-100' : 'bg-blue-50 text-blue-700 border-blue-100'} animate-in zoom-in-95`}>
                {msg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !turnstileToken}
              className="w-full flex justify-center py-4 px-4 rounded-2xl shadow-xl text-xs font-black uppercase tracking-[0.2em] text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
            >
              {loading ? "MENSINKRONISASI..." : "MASUK KE DASHBOARD"}
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
              <Link href="/" className="text-center text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] mt-2">
                {"← Kembali ke Beranda"}
              </Link>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
