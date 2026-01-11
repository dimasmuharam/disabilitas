"use client"

import * as React from "react"
import { Monitor, Smartphone } from "lucide-react"

export function FontToggle() {
  const [isLarge, setIsLarge] = React.useState(false)

  // Efek untuk mengubah ukuran font di elemen HTML utama
  React.useEffect(() => {
    const root = document.documentElement
    if (isLarge) {
      root.classList.add("text-lg") // Memperbesar ukuran dasar
    } else {
      root.classList.remove("text-lg")
    }
  }, [isLarge])

  return (
    <button
      onClick={() => setIsLarge(!isLarge)}
      className="inline-flex items-center justify-center rounded-md p-2 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:hover:bg-slate-800"
      aria-label={isLarge ? "Kembalikan ukuran huruf normal" : "Perbesar ukuran huruf"}
      title={isLarge ? "Ukuran Huruf: Besar" : "Ukuran Huruf: Normal"}
    >
      <span className="mr-1 text-sm font-bold">A{isLarge ? "-" : "+"}</span>
      <span className="sr-only">Ubah Ukuran Huruf</span>
    </button>
  )
}
