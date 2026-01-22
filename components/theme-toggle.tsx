"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Pastikan komponen sudah siap di browser (menghindari error server/client mismatch)
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="size-10" /> // Placeholder agar tidak goyang layoutnya
  }

  const isDark = theme === "dark"

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="inline-flex items-center justify-center rounded-md border border-transparent p-2 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:hover:bg-slate-800 dark:focus:ring-slate-300"
      aria-label={isDark ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
      title={isDark ? "Mode Saat Ini: Gelap" : "Mode Saat Ini: Terang"}
    >
      {isDark ? (
        <Moon className="size-5 transition-all" aria-hidden="true" />
      ) : (
        <Sun className="size-5 text-orange-500 transition-all" aria-hidden="true" />
      )}
      <span className="sr-only">
        {isDark ? "Ganti ke Mode Terang" : "Ganti ke Mode Gelap"}
      </span>
    </button>
  )
}
