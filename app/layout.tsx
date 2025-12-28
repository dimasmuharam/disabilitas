import "@/app/globals.css"
import { Inter as FontSans } from "next/font/google"

import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer" // <-- Kita import Footer di sini

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata = {
  title: "Disabilitas.com - Ekosistem Karir Inklusif",
  description: "Platform lowongan kerja dan pengembangan karir untuk penyandang disabilitas di Indonesia.",
}

interface RootLayoutProps {
  children: React.ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head />
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="relative flex min-h-screen flex-col">
            
            {/* Header Global */}
            <SiteHeader />
            
            {/* Isi Halaman Berubah-ubah di sini */}
            <div className="flex-1">{children}</div>
            
            {/* Footer Global */}
            <SiteFooter />
            
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
