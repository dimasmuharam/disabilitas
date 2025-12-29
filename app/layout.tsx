import "./globals.css"
import { Inter as FontSans } from "next/font/google"
import { Metadata } from "next"

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
    default: "Disabilitas.com - Ekosistem Karir & Audit Aksesibilitas",
    template: "%s | Disabilitas.com",
  },
  description: "Platform lowongan kerja inklusif dan layanan audit aksesibilitas digital (SPBE) serta lingkungan kerja.",
  keywords: [
    "lowongan disabilitas",
    "audit aksesibilitas",
    "inklusi kerja",
    "audit SPBE",
    "Dimaster Group"
  ],
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: "/favicon.ico",
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
      <head />
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
      </body>
    </html>
  )
}
