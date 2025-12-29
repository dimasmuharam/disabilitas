"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { useRouter } from "next/navigation"
// 1. Import Turnstile
import { Turnstile } from '@marsidev/react-turnstile'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState("")
  const [isError, setIsError] = useState(false)
  
  // 2. State Token
  const [turnstileToken, setTurnstileToken] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 3. Validasi Token
    if (!turnstileToken) {
        setMsg("Mohon tunggu verifikasi keamanan (Turnstile) selesai.")
        setIsError(true)
        return
    }

    setLoading(true)
    setMsg("")
    setIsError(false)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: { captchaToken: turnstileToken } // Opsional: Supabase bisa verifikasi ini di settingan dashboard
      })

      if (error) throw error

      router.push("/dashboard")
      router.refresh() 

    } catch (error: any) {
      setIsError(true)
      if (error.message.includes("Invalid login")) {
        setMsg("Email atau password salah.")
      } else if (error.message.includes("Email not confirmed")) {
        setMsg("Email belum diverifikasi.")
      } else {
        setMsg(error.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-slate-50">
          Masuk ke Akun
        </h1>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          Akses profil karir dan kelola data Anda.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200 dark:border-slate-800">
          
          <form className="space-y-6" onSubmit={handleLogin}>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Alamat Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white sm:text-sm"
                />
              </div>
            </div>

            {/* 4. WIDGET TURNSTILE */}
            <div className="flex justify-center">
                <Turnstile 
                    siteKey="0x4AAAAAACJnZ2_6aY-VEgfH" 
                    onSuccess={(token) => setTurnstileToken(token)}
                    options={{ theme: 'auto' }}
                />
            </div>

            {msg && (
              <div role="alert" className={`p-4 rounded-md text-sm ${isError ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
                {msg}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading || !turnstileToken}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Memproses..." : "Masuk"}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-slate-900 text-slate-500">
                  Belum punya akun?
                </span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/daftar"
                className="w-full flex justify-center py-2 px-4 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Daftar akun baru
              </Link>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
