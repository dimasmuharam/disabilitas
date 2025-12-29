import "./globals.css"
import { Metadata } from "next"
import { Inter as FontSans } from "next/font/google"
import Script from "next/script" // Import untuk Google Analytics

import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://www.disabilitas.com"),
  title: {
    // UPDATE: Title Startup pilihan Mas Dimas
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
    // UPDATE: Sesuai instruksi Mas Dimas ke domain utama
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
      <head>
        {/* Canonical Link manual untuk kepastian SEO */}
        <link rel="canonical" href="https://www.disabilitas.com" />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="relative flex min-h-screen flex-col">
            <SiteHeader />
            <div className="flex-1">{children}</div>
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
