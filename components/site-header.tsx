import Link from "next/link"

// Import komponen tombol aksesibilitas yang sudah kita buat
import { ThemeToggle } from "@/components/theme-toggle"
import { FontToggle } from "@/components/font-toggle"
import { LanguageToggle } from "@/components/language-toggle"

export function SiteHeader() {
  return (
    <header className="bg-background sticky top-0 z-40 w-full border-b">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
        
        {/* BAGIAN KIRI: Logo & Menu Utama */}
        <div className="flex gap-6 md:gap-10">
          
          {/* Logo Utama */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 dark:focus:ring-slate-300 rounded-md p-1"
            aria-label="Disabilitas.com, kembali ke halaman depan"
          >
            <span className="inline-block font-bold text-xl">
              Disabilitas.com
            </span>
          </Link>

          {/* Navigasi Desktop (Hidden di layar HP) */}
          <nav className="hidden gap-6 md:flex">
            <Link
              href="/lowongan"
              className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-300 rounded p-1"
            >
              Lowongan
            </Link>
            <Link
              href="/bisnis"
              className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-300 rounded p-1"
            >
              Layanan Bisnis
            </Link>
          </nav>
        </div>

        {/* BAGIAN KANAN: Accessibility Tools Area */}
        <div className="flex items-center space-x-2 md:space-x-3">
            
            {/* 1. Tombol Ganti Bahasa (ID/EN) */}
            <LanguageToggle />

            {/* 2. Tombol Ukuran Huruf (A+) */}
            <FontToggle />

            {/* 3. Tombol Dark Mode (Matahari/Bulan) */}
            <ThemeToggle />
            
        </div>
      </div>
    </header>
  )
}
