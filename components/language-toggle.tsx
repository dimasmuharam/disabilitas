"use client"

import * as React from "react"
import { Languages } from "lucide-react"

export function LanguageToggle() {
  // Nanti logika ini kita sambungkan ke i18n sungguhan.
  // Sekarang kita buat simulasi UI-nya dulu agar aksesibel.
  const [lang, setLang] = React.useState("id")

  const toggleLanguage = () => {
    const newLang = lang === "id" ? "en" : "id"
    setLang(newLang)
    // Di sini nanti kita panggil fungsi router.push untuk ganti bahasa betulan
  }

  const label = lang === "id" ? "Bahasa: Indonesia. Ganti ke Inggris" : "Language: English. Switch to Indonesian"

  return (
    <button
      onClick={toggleLanguage}
      className="inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-300 border border-slate-200 dark:border-slate-800"
      aria-label={label}
      title={label}
    >
      <Languages className="mr-2 h-4 w-4" />
      <span>{lang === "id" ? "ID" : "EN"}</span>
    </button>
  )
}
