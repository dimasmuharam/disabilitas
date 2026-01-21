"use client"

import React from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { LogOut, ShieldAlert, Home } from "lucide-react"

/**
 * LAYOUT KHUSUS ADMINISTRATOR
 * Terproteksi secara struktur dan terpisah dari elemen publik.
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const handleLogout = async () => {
    // Keluar dari Supabase Auth
    await supabase.auth.signOut()
    // Arahkan ke halaman masuk atau biarkan Cloudflare Zero Trust menangani sesi berikutnya
    router.push("/masuk")
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased text-slate-900">
      
      {/* 1. HEADER KHUSUS ADMIN (NAVIGASI MINIMALIS) */}
      <nav className="sticky top-0 z-50 border-b-4 border-slate-900 bg-white px-6 py-4 shadow-sm">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between">
          
          <div className="flex items-center gap-4">
            <div className="rounded-lg bg-slate-900 p-2 text-white shadow-[4px_4px_0px_0px_rgba(37,99,235,1)]">
              <ShieldAlert size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase italic leading-none text-blue-600">Secure Access</p>
              <h2 className="text-sm font-black uppercase tracking-tighter">Admin Portal</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Tombol Kembali ke Beranda Publik */}
            <button 
              onClick={() => router.push("/")}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-[10px] font-black uppercase text-slate-500 hover:bg-slate-100 transition-all"
              aria-label="Kembali ke Beranda"
            >
              <Home size={16} /> Home
            </button>

            {/* Tombol Keluar Mandiri */}
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-xl bg-rose-50 px-4 py-2 text-[10px] font-black uppercase text-rose-600 border-2 border-transparent hover:border-rose-200 transition-all shadow-sm"
            >
              <LogOut size={16} /> Keluar
            </button>
          </div>

        </div>
      </nav>

      {/* 2. AREA KONTEN UTAMA */}
      <main className="relative flex-1">
        {/* Indikator Mode Admin untuk Aksesibilitas */}
        <div className="sr-only" role="note">
          Anda berada di dalam mode manajemen sistem ekosistem disabilitas.
        </div>
        
        {children}
      </main>

      {/* 3. FOOTER ADMIN RINGKAS */}
      <footer className="border-t-2 border-slate-100 bg-white py-6">
        <div className="container mx-auto px-6 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            © {new Date().getFullYear()} Disabilitas.com Command Center • Zero Trust Protected
          </p>
        </div>
      </footer>
    </div>
  )
}