"use client"

import "./globals.css"
import { Inter as FontSans } from "next/font/google"
import { usePathname } from "next/navigation"
import Script from "next/script"

import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  
  // Cek path tanpa fungsi server headers() agar tidak error di Cloudflare
  const isAdmin = pathname.startsWith('/admin')

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
            
            <a 
              href="#main-content" 
              className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-blue-600 focus:text-white focus:px-6 focus:py-4 focus:font-black"
            >
              Lompat ke Konten Utama
            </a>

            {/* Header & Footer otomatis hilang di area /admin */}
            {!isAdmin && <SiteHeader />}
            
            <main id="main-content" className="flex-1 outline-none" tabIndex={-1}>
              {children}
            </main>

            {!isAdmin && <SiteFooter />}
          </div>
        </ThemeProvider>

        {/* GOOGLE ANALYTICS */}
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