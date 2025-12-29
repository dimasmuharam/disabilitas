"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

// Komponen Aksesibilitas
import { ThemeToggle } from "@/components/theme-toggle"
import { FontToggle } from "@/components/font-toggle"
import { LanguageToggle } from "@/components/language-toggle"

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  // LOGIKA 1: Cek Status Login Realtime
  useEffect(() => {
    // Cek awal saat load
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    // Pasang pendengar (listener) jika user login/logout di tab lain
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (event === 'SIGNED_OUT') {
        setUser(null)
        router.refresh()
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  // LOGIKA 2: Fungsi Logout
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/masuk") // Lempar ke halaman masuk setelah keluar
  }

  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40 w-full border-b">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
        
        {/* BAGIAN KIRI: Logo & Menu Utama */}
        <div className="flex gap-6 md:gap-10">
          
          {/* Logo Utama */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 dark:focus:ring-slate-300 rounded-md p-1"
            aria-label="Disabilitas.com, kembali ke halaman depan"
          >
            <div className="relative h-8 w-8 overflow-hidden rounded-md bg-white p-0.5">
              <Image 
                src="/logo.png" 
                alt="Logo Disabilitas.com" 
                width={32}
                height={32}
                className="object-contain"
                priority
              />
            </div>
            
            <span className="hidden font-bold text-xl text-slate-900 dark:text-white sm:inline-block">
              Disabilitas.com
            </span>
          </Link>

          {/* Navigasi Desktop */}
          <nav className="hidden gap-6 md:flex items-center">
            <Link
              href="/lowongan"
              className={`text-sm font-medium transition-colors hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-slate-900 rounded p-1 ${pathname === '/lowongan' ? 'text-slate-900 dark:text-white font-bold' : 'text-muted-foreground'}`}
            >
              Cari Lowongan
            </Link>
            
            <Link
              href="/bisnis"
              className={`text-sm font-medium transition-colors hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-slate-900 rounded p-1 ${pathname === '/bisnis' ? 'text-slate-900 dark:text-white font-bold' : 'text-muted-foreground'}`}
            >
              Audit & Rekrutmen
            </Link>
            
            <Link
              href="/kampus"
              className={`text-sm font-medium transition-colors hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-slate-900 rounded p-1 ${pathname === '/kampus' ? 'text-slate-900 dark:text-white font-bold' : 'text-muted-foreground'}`}
            >
              Mitra Kampus
            </Link>
             <Link
              href="/tentang"
              className={`text-sm font-medium transition-colors hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-slate-900 rounded p-1 ${pathname === '/tentang' ? 'text-slate-900 dark:text-white font-bold' : 'text-muted-foreground'}`}
            >
              Tentang Kami
            </Link>
          </nav>
        </div>

        {/* BAGIAN KANAN: Tools & Auth */}
        <div className="flex items-center space-x-2 md:space-x-4">
            
            {/* Tools Area */}
            <div className="hidden sm:flex items-center space-x-1 border-r border-slate-200 dark:border-slate-800 pr-3 mr-1">
              <LanguageToggle />
              <FontToggle />
              <ThemeToggle />
            </div>

            {/* AREA DINAMIS: AUTHENTICATION */}
            {user ? (
                // JIKA SUDAH LOGIN (User Ada)
                <div className="flex items-center gap-2">
                    <Link href="/dashboard">
                        <button className="inline-flex h-9 items-center justify-center rounded-md bg-slate-100 px-4 text-sm font-medium text-slate-900 transition-colors hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700">
                            Dashboard
                        </button>
                    </Link>
                    <button 
                        onClick={handleLogout}
                        className="inline-flex h-9 items-center justify-center rounded-md border border-red-200 px-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                        Keluar
                    </button>
                </div>
            ) : (
                // JIKA BELUM LOGIN (Guest)
                <div className="flex items-center gap-2">
                    <Link href="/masuk" className="text-sm font-medium text-muted-foreground hover:text-primary px-2 hidden sm:block">
                        Masuk
                    </Link>
                    <Link href="/daftar">
                        <button className="inline-flex h-9 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-bold text-white shadow transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                            Daftar
                        </button>
                    </Link>
                </div>
            )}
            
        </div>
      </div>
    </header>
  )
}
