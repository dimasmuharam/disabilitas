import Link from "next/link"
import { AlertTriangle } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="bg-orange-100 dark:bg-orange-900/30 p-4 rounded-full mb-6">
        <AlertTriangle className="h-12 w-12 text-orange-600 dark:text-orange-400" aria-hidden="true" />
      </div>
      
      <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl mb-4">
        Halaman Tidak Ditemukan
      </h1>
      
      <p className="text-lg text-slate-600 dark:text-slate-400 max-w-md mb-8">
        Maaf, halaman yang Anda cari mungkin sudah dihapus, dipindahkan, atau alamatnya salah ketik.
      </p>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link 
          href="/"
          className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-8 text-sm font-medium text-slate-50 shadow transition-colors hover:bg-slate-900/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90"
        >
          Kembali ke Beranda
        </Link>
        <Link 
          href="/kontak"
          className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800"
        >
          Laporkan Masalah
        </Link>
      </div>
    </div>
  )
}
