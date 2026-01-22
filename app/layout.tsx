import "./globals.css"
import { Metadata } from "next"
import { Inter as FontSans } from "next/font/google"
import Script from "next/script"

import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

/**
 * METADATA PUSAT (SEO FRIENDLY)
 * Slogan Mas Dimas bertahta di sini.
 */
export const metadata: Metadata = {
  metadataBase: new URL("https://www.disabilitas.com"),
  title: {
    default: "Disabilitas.com | Inklusi Jadi Nyata.",
    template: "%s | Disabilitas.com",
  },
  description: "Platform hub talenta disabilitas dan rekrutmen inklusif terbesar di Indonesia. Menghubungkan potensi dengan peluang tanpa batas melalui data dan riset.",
  keywords: [
    "lowongan disabilitas",
    "audit aksesibilitas",
    "inklusi kerja",
    "audit SPBE",
    "Dimaster Group",
    "ASN Inklusif"
  ],
  alternates: {
    canonical: "https://www.disabilitas.com",
  },
  icons: {
    icon: "/logo.png",
  },
  authors: [
    {
      name: "Dimaster Group",
      url: "https://dimaster.co.id",
    },
  ],
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="relative flex min-h-screen flex-col">
            
            {/* 1. FIXED SKIP LINK (SINGLE SOURCE) 
                Dibuat 'fixed' agar selalu bisa diakses saat scroll, 
                dan bergaya neubrutalism sesuai UI Mas Dimas.
            */}
            <a 
              href="#main-content" 
              className="sr-only outline-none transition-all focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-[100] focus:rounded-2xl focus:border-4 focus:border-slate-900 focus:bg-blue-600 focus:px-8 focus:py-5 focus:font-black focus:uppercase focus:text-white focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
            >
              Lompat ke Konten Utama
            </a>

            {/* 2. HEADER
                Ingat: Hapus skip link yang ada di dalam komponen SiteHeader 
                agar tidak dobel lagi.
            */}
            <SiteHeader />
            
            {/* 3. MAIN CONTENT
                tabIndex={-1} penting agar browser bisa memindahkan fokus secara programmatik
                tanpa menambahkan elemen ke urutan tab reguler.
            */}
            <main id="main-content" className="flex-1 outline-none" tabIndex={-1}>
              {children}
            </main>

            <SiteFooter />
          </div>
        </ThemeProvider>

        {/* GOOGLE ANALYTICS (G-Q9H6SLY8R0) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-Q9H6SLY8R0"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-Q9H6SLY8R0');
          `}
        </Script>
      </body>
    </html>
  )
}