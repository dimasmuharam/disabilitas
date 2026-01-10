"use client"

import React, { useState } from "react"
import { createClient } from "@/lib/supabase/client/client"
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
    const supabase = createClient()

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      // --- LOGIKA AKSESIBILITAS ---
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }

      // Memberikan penanda agar Dashboard memfokuskan H1 saat mendarat
      sessionStorage.setItem("pindahkan_fokus_ke_h1", "true");

      setMsg("Kata Sandi Berhasil Diperbarui! Mengalihkan Anda ke Dashboard...")
      setIsError(false)

      // Pindahkan fokus kursor ke pesan sukses
      setTimeout(() => {
        const alertElement = document.getElementById("update-announcement");
        if (alertElement) alertElement.focus();
      }, 100);

      // JEDA 3 DETIK
      setTimeout(() => {
        router.push("/dashboard")
      }, 3000)

    } catch (error: any) {
      setIsError(true)
      setMsg(error.message || "Gagal memperbarui kata sandi. Link mungkin sudah kadaluarsa.")
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-slate-50 py-12 font-sans text-slate-900 dark:bg-slate-950 sm:px-6 lg:px-8">
      <div className="px-4 text-center sm:mx-auto sm:w-full sm:max-w-md">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg" aria-hidden="true">
            <Lock size={32} />
        </div>
        <h1 className="text-3xl font-black uppercase italic tracking-tighter dark:text-slate-50">
          {"Atur Ulang Sandi"}
        </h1>
        <p className="mt-2 text-sm font-bold uppercase italic tracking-widest text-slate-500 dark:text-slate-400">
          {"Buat Kata Sandi Baru Anda"}
        </p>
      </div>

      <div className="mt-8 px-4 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-[2.5rem] border border-slate-200 bg-white px-6 py-10 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
          
          <form className="space-y-6" onSubmit={handleUpdatePassword} aria-label="Formulir Atur Ulang Kata Sandi">
            <div>
              <label htmlFor="new_password" className="mb-2 ml-1 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                {"Kata Sandi Baru"}
              </label>
              <div className="relative">
                <input
                  id="new_password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="block w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-bold outline-none transition-all focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-4 flex items-center rounded-full p-1 text-slate-400 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirm_password" className="mb-2 ml-1 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                {"Konfirmasi Kata Sandi Baru"}
              </label>
              <input
                id="confirm_password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi kata sandi"
                className="block w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-bold outline-none transition-all focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            {msg && (
              <div 
                id="update-announcement"
                role="alert" 
                aria-live="assertive" 
                tabIndex={-1}
                className={`rounded-2xl border p-4 text-center text-[11px] font-black uppercase outline-none ${isError ? 'border-red-100 bg-red-50 text-red-700' : 'border-emerald-100 bg-emerald-50 text-emerald-700'} animate-in zoom-in-95`}
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
              className="flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-900 p-4 text-xs font-black uppercase tracking-[0.2em] text-white shadow-xl transition-all hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50"
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
