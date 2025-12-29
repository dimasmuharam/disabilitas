import Link from "next/link"
import Image from "next/image"

// Komponen Aksesibilitas
import { ThemeToggle } from "@/components/theme-toggle"
import { FontToggle } from "@/components/font-toggle"
import { LanguageToggle } from "@/components/language-toggle"

export function SiteHeader() {
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
            <div className="relative h-8 w-8 overflow-hidden rounded-md">
              <Image 
                src="/logo.png" 
                alt="Logo Disabilitas.com" 
                width={32}
                height={32}
                className="object-cover"
                priority
              />
            </div>
            {/* PERBAIKAN DI SINI: Hapus 'inline-block' pertama, ganti jadi 'hidden' */}
            <span className="hidden font-bold text-xl text-slate-900 dark:text-white sm:inline-block">
              Disabilitas.com
            </span>
          </Link>

          {/* Navigasi Desktop (Hidden di layar HP) */}
          <nav className="hidden gap-6 md:flex items-center">
            <Link
              href="/lowongan"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-300 rounded p-1"
            >
              Cari Lowongan
            </Link>
            <Link
              href="/bisnis"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-300 rounded p-1"
            >
              Layanan Bisnis
            </Link>
            <Link
              href="/kampus"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-300 rounded p-1"
            >
              Mitra Kampus
            </Link>
             <Link
              href="/tentang"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-300 rounded p-1"
            >
              Tentang Kami
            </Link>
          </nav>
        </div>

        {/* BAGIAN KANAN: Accessibility Tools & Login */}
        <div className="flex items-center space-x-2 md:space-x-4">
            
            {/* Tools Area */}
            <div className="flex items-center space-x-1 border-r border-slate-200 dark:border-slate-800 pr-3 mr-1">
              <LanguageToggle />
              <FontToggle />
              <ThemeToggle />
            </div>

            {/* Tombol Login Mitra */}
            <Link href="/mitra">
              <button className="inline-flex h-9 items-center justify-center rounded-md bg-slate-900 px-4 text-sm font-medium text-slate-50 shadow transition-colors hover:bg-slate-900/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90">
                Masuk
              </button>
            </Link>
            
        </div>
      </div>
    </header>
  )
}
