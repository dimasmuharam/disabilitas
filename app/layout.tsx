import "./globals.css"
import { Metadata } from "next"
import { Inter as FontSans } from "next/font/google"
import Script from "next/script"
import { headers } from "next/headers" // Untuk cek URL di Server Side

import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

// --- 1. SMART DYNAMIC METADATA ---
export const metadata: Metadata = {
  metadataBase: new URL("https://www.disabilitas.com"),
  title: {
    default: "Disabilitas.com | Inklusi Jadi Nyata.",
    template: "%s | Disabilitas.com", // Otomatis nambahin nama brand di belakang judul halaman
  },
  description: "Platform hub talenta disabilitas dan rekrutmen inklusif terbesar di Indonesia.",
  alternates: {
    canonical: "./", // Next.js otomatis buat canonical sesuai URL yang sedang dibuka
  },
  icons: { icon: "/logo.png" },
  authors: [{ name: "Dimaster Group" }],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // --- 2. SERVER-SIDE PATH CHECK ---
  // Menggunakan headers untuk tahu apakah kita di area admin tanpa bikin file jadi "use client"
  const headerList = headers();
  const fullPath = headerList.get("x-invoke-path") || ""; 
  const isAdmin = fullPath.startsWith('/admin');

  return (
    <html lang="id" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable)}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          
          <div className="relative flex min-h-screen flex-col">
            
            {/* FITUR AKSESIBILITAS: SKIP LINK */}
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:bg-blue-600 focus:text-white focus:p-4 focus:font-black">
              Lompat ke Konten Utama
            </a>

            {/* HEADER OTOMATIS: Hilang jika di /admin */}
            {!isAdmin && <SiteHeader />}
            
            <main id="main-content" className="flex-1 outline-none" tabIndex={-1}>
              {children}
            </main>

            {/* FOOTER OTOMATIS: Hilang jika di /admin */}
            {!isAdmin && <SiteFooter />}
          </div>
        </ThemeProvider>

        {/* GOOGLE ANALYTICS */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-Q9H6SLY8R0" strategy="afterInteractive" />
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