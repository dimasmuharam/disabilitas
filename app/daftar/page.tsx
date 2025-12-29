"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase" // Mengambil kunci dari file yang kita buat
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState("")
  const [type, setType] = useState("info") // info, success, error

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg("")

    try {
      // 1. Mendaftar ke Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Data ini akan ditangkap oleh Trigger SQL untuk masuk ke tabel 'profiles'
          data: {
            full_name: fullName, 
          },
        },
      })

      if (error) throw error

      // 2. Jika sukses
      setType("success")
      setMsg("Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.")
      
      // Opsional: Reset form
      setEmail("")
      setPassword("")
      setFullName("")

    } catch (error: any) {
      setType("error")
      setMsg(error.message || "Terjadi kesalahan saat mendaftar.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-slate-50">
          Bergabung dengan Ekosistem
        </h1>
        <p className="mt-2 text-center text-sm text-slate-600 dark:text-slate-400">
          Mulai karir inklusif atau temukan talenta terbaik.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200 dark:border-slate-800">
          
          <form className="space-y-6" onSubmit={handleRegister}>
            
            {/* Input Nama Lengkap */}
            <div>
              <label htmlFor="fullname" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Nama Lengkap
              </label>
              <div className="mt-1">
                <input
                  id="fullname"
                  name="fullname"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white sm:text-sm"
                  placeholder="Contoh: Dimas Prasetyo"
                />
              </div>
            </div>

            {/* Input Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Alamat Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white sm:text-sm"
                />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white sm:text-sm"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">Minimal 6 karakter.</p>
            </div>

            {/* Notifikasi Status */}
            {msg && (
              <div 
                role="alert" 
                className={`p-4 rounded-md text-sm ${
                  type === 'success' 
                    ? 'bg-green-50 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                    : 'bg-red-50 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                }`}
              >
                {msg}
              </div>
            )}

            {/* Tombol Submit */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sedang Memproses..." : "Daftar Sekarang"}
              </button>
            </div>
          </form>

          {/* Link ke Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-slate-900 text-slate-500">
                  Sudah punya akun?
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3">
              <Link
                href="/masuk"
                className="w-full flex justify-center py-2 px-4 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm bg-white dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Masuk di sini
              </Link>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  )
}
