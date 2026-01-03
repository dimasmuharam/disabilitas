"use client"

import React, { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Lock, Eye, EyeOff, Save, CheckCircle2, AlertCircle } from "lucide-react"

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [msg, setMsg] = useState("")
  const [isError, setIsError] = useState(false)

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setMsg("Konfirmasi kata sandi tidak cocok.")
      setIsError(true)
      return
    }

    setLoading(true)
    setMsg("")
    setIsError(false)

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      // --- LOGIKA AKSESIBILITAS ---
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      setMsg("Kata Sandi Berhasil Diperbarui! Anda sekarang dapat masuk menggunakan kata sandi baru. Mengalihkan ke halaman masuk...")
      setIsError(false)

      // Pindahkan fokus kursor ke pesan sukses
      setTimeout(() => {
        const alertElement = document.getElementById("update-announcement");
        if (alertElement) alertElement.focus();
      }, 100);

      // JEDA 5 DETIK agar pengumuman sukses terdengar tuntas
      setTimeout(() => {
        router.push("/masuk")
      }, 5000)

    } catch (error: any) {
      setIsError(true)
      setMsg(error.message || "Gagal memperbarui kata sandi. Link mungkin sudah kadaluarsa.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-slate-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4 text-center">
        <div className="mx-auto w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-lg mb-6 text-white">
            <Lock size={32} />
        </div>
        <h1 className="text-3xl font-black uppercase italic tracking-tighter dark:text-slate-50">
          {"Atur Ulang Sandi"}
        </h1>
        <p className="mt-2 text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest italic">
          {"Buat Kata Sandi Baru Anda"}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-slate-900 py-10 px-6 shadow-2xl rounded-[2.5rem] border border-slate-200 dark:border-slate-800">
          
          <form className="space-y-6" onSubmit={handleUpdatePassword}>
            <div>
              <label htmlFor="new_password" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">
                {"Kata Sandi Baru"}
              </label>
              <div className="relative">
                <input
                  id="new_password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="appearance-none block w-full px-5 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-blue-600"
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm_password" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">
                {"Konfirmasi Kata Sandi Baru"}
              </label>
              <input
                id="confirm_password"
                type={showPassword ? "text" : "password"}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi kata sandi"
                className="appearance-none block w-full px-5 py-4 border border-slate-200 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            {msg && (
              <div 
                id="update-announcement"
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
              disabled={loading}
              className="w-full flex justify-center items-center gap-3 py-4 px-4 rounded-2xl shadow-xl text-xs font-black uppercase tracking-[0.2em] text-white bg-slate-900 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all active:scale-[0.98]"
            >
              {loading ? "MEMPROSES..." : (
                <>
                  {"SIMPAN KATA SANDI"}
                  <Save size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
