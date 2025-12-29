"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState("talent") // Default talent
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState("")
  const [type, setType] = useState("info")

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMsg("")

    const siteUrl = typeof window !== 'undefined' ? window.location.origin : ''

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Kirim data Role ke Supabase
          data: {
            full_name: fullName, 
            role: role // <-- INI YANG BARU
          },
          emailRedirectTo: `${siteUrl}/dashboard?verified=true`,
        },
      })

      if (error) throw error

      if (data.session) {
        router.push("/dashboard")
      } else {
        setType("success")
        setMsg("Pendaftaran berhasil! Cek email untuk verifikasi.")
        setEmail("")
        setPassword("")
        setFullName("")
      }

    } catch (error: any) {
      setType("error")
      setMsg(error.message || "Terjadi kesalahan.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="mt-6 text-center text-3xl font-extrabold text-slate-900 dark:text-slate-50">
          Daftar Akun Baru
        </h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          Disabilitas.com - Ekosistem Karir Inklusif
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-slate-900 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-slate-200 dark:border-slate-800">
          <form className="space-y-6" onSubmit={handleRegister}>
            
            {/* Pilihan Peran (Role) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Saya mendaftar sebagai:
              </label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-2 border rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700"
              >
                <option value="talent">Pencari Kerja (Talenta)</option>
                <option value="company">Pemberi Kerja (Perusahaan)</option>
                {/* Kampus & Pemerintah biasanya via invite admin, jadi disembunyikan dulu */}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Nama Lengkap / Nama Perusahaan</label>
              <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="mt-1 w-full p-2 border rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full p-2 border rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
              <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full p-2 border rounded-md bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700" />
            </div>

            {msg && <div className={`p-3 rounded text-sm ${type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{msg}</div>}

            <button type="submit" disabled={loading} className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50">
              {loading ? "Memproses..." : "Daftar Sekarang"}
            </button>
          </form>

          <div className="mt-6 text-center">
             <Link href="/masuk" className="text-sm text-blue-600 hover:underline">Sudah punya akun? Masuk</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
