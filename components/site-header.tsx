"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client/client"

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
    const supabase = createClient()
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
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/masuk") // Lempar ke halaman masuk setelah keluar
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
        
        {/* BAGIAN KIRI: Logo & Menu Utama */}
        <div className="flex gap-6 md:gap-10">
          
          {/* Logo Utama */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 dark:focus:ring-slate-300"
            aria-label="Disabilitas.com, kembali ke halaman depan"
          >
            <div className="relative size-8 overflow-hidden rounded-md bg-white p-0.5">
              <Image 
                src="/logo.png" 
                alt="Logo Disabilitas.com" 
                width={32}
                height={32}
                className="object-contain"
                priority
              />
            </div>
            
            <span className="hidden text-xl font-bold text-slate-900 dark:text-white sm:inline-block">
              Disabilitas.com
            </span>
          </Link>

          {/* Navigasi Desktop */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/lowongan"
              className={`rounded p-1 text-sm font-medium transition-colors hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-slate-900 ${pathname === '/lowongan' ? 'font-bold text-slate-900 dark:text-white' : 'text-muted-foreground'}`}
            >
              Cari Lowongan
            </Link>
            
            <Link
              href="/bisnis"
              className={`rounded p-1 text-sm font-medium transition-colors hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-slate-900 ${pathname === '/bisnis' ? 'font-bold text-slate-900 dark:text-white' : 'text-muted-foreground'}`}
            >
              Audit & Rekrutmen
            </Link>
            
            <Link
              href="/kampus"
              className={`rounded p-1 text-sm font-medium transition-colors hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-slate-900 ${pathname === '/kampus' ? 'font-bold text-slate-900 dark:text-white' : 'text-muted-foreground'}`}
            >
              Mitra Kampus
            </Link>
             <Link
              href="/tentang"
              className={`rounded p-1 text-sm font-medium transition-colors hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-slate-900 ${pathname === '/tentang' ? 'font-bold text-slate-900 dark:text-white' : 'text-muted-foreground'}`}
            >
              Tentang Kami
            </Link>
          </nav>
        </div>

        {/* BAGIAN KANAN: Tools & Auth */}
        <div className="flex items-center space-x-2 md:space-x-4">
            
            {/* Tools Area */}
            <div className="mr-1 hidden items-center space-x-1 border-r border-slate-200 pr-3 dark:border-slate-800 sm:flex">
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
                    <Link href="/masuk" className="hidden px-2 text-sm font-medium text-muted-foreground hover:text-primary sm:block">
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
