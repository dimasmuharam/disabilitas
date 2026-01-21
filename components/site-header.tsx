"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import { FontToggle } from "@/components/font-toggle"
import { LanguageToggle } from "@/components/language-toggle"

export function SiteHeader() {
  // 1. DEKLARASI HOOKS (Harus di paling atas)
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)

  // 2. LOGIKA SINKRONISASI (Harus sebelum Early Return)
  useEffect(() => {
    async function getStatus() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (authUser) {
        setUser(authUser)
        const role = authUser.app_metadata?.role || authUser.user_metadata?.role
        setIsAdmin(role === 'admin' || role === 'super_admin')
      }
    }

    getStatus()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const authUser = session?.user ?? null
      setUser(authUser)
      if (authUser) {
        const role = authUser.app_metadata?.role || authUser.user_metadata?.role
        setIsAdmin(role === 'admin' || role === 'super_admin')
      } else {
        setIsAdmin(false)
      }
      if (event === 'SIGNED_OUT') router.refresh()
    })

    return () => subscription.unsubscribe()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/masuk")
  }

  // 3. EARLY RETURN (Sekarang aman ditaruh di sini setelah semua hooks dipanggil)
  if (pathname.startsWith('/admin')) return null

  return (
    <>


      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 print:hidden">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-8">
          
          {/* BAGIAN KIRI: Identitas */}
          <div className="flex gap-6 md:gap-10">
            <Link 
              href="/" 
              className="flex items-center space-x-2 rounded-md focus-visible:ring-4 focus-visible:ring-blue-600 outline-none"
              aria-label="Disabilitas.com - Kembali ke Beranda"
            >
              <div className="relative size-8 overflow-hidden rounded-md bg-white p-0.5 border border-slate-200">
                <Image 
                  src="/logo.png" 
                  alt="Logo Disabilitas.com" 
                  width={32} 
                  height={32} 
                  className="object-contain"
                  priority
                />
              </div>
              <span className="hidden text-xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-white sm:inline-block">
                Disabilitas.com
              </span>
            </Link>

            {/* NAVIGASI DESKTOP */}
            <nav className="hidden items-center gap-6 md:flex" aria-label="Navigasi Utama">
              {[
                { href: "/lowongan", label: "Cari Lowongan" },
                { href: "/bisnis", label: "Audit & Rekrutmen" },
                { href: "/kampus", label: "Mitra Kampus" },
                { href: "/tentang", label: "Tentang Kami" }
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "text-sm font-bold uppercase tracking-tight transition-colors hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-600 outline-none",
                    pathname === link.href ? "text-blue-600" : "text-muted-foreground"
                  )}
                  aria-current={pathname === link.href ? "page" : undefined}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* BAGIAN KANAN: Tools & Auth (Dark Mode, Translate, Font Tetap Ada) */}
          <div className="flex items-center space-x-2 md:space-x-4">
            
            <div className="hidden items-center space-x-1 border-r border-slate-200 pr-3 dark:border-slate-800 sm:flex" role="group" aria-label="Pengaturan Aksesibilitas">
              <LanguageToggle />
              <FontToggle />
              <ThemeToggle />
            </div>

            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <Link href={isAdmin ? "/admin" : "/dashboard"}>
                    <button className="inline-flex h-9 items-center justify-center rounded-md bg-slate-900 px-4 text-[10px] font-black uppercase tracking-widest text-white shadow transition-all hover:bg-blue-600 focus-visible:ring-2 focus-visible:ring-blue-600 outline-none">
                      {isAdmin ? "Portal Admin" : "Dashboard"}
                    </button>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="inline-flex h-9 items-center justify-center rounded-md border-2 border-slate-900 px-3 text-[10px] font-black uppercase tracking-widest text-slate-900 transition-colors hover:bg-rose-50 hover:text-rose-600 focus-visible:ring-2 focus-visible:ring-rose-600 outline-none dark:border-slate-100 dark:text-white"
                    aria-label="Keluar dari akun"
                  >
                    Keluar
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/masuk" 
                    className="hidden px-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 sm:block focus-visible:ring-2 focus-visible:ring-blue-600 outline-none"
                  >
                    Masuk
                  </Link>
                  <Link href="/daftar">
                    <button className="inline-flex h-9 items-center justify-center rounded-md bg-blue-600 px-4 text-[10px] font-black uppercase tracking-widest text-white shadow-lg transition-colors hover:bg-slate-900 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none">
                      Daftar
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  )
}