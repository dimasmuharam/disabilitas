import Link from "next/link"

export default function IndexPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 p-6">
      <main className="max-w-3xl text-center space-y-6">
        
        {/* Judul Utama - Menggunakan h1 untuk SEO & Aksesibilitas */}
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter">
          Disabilitas.com
        </h1>
        
        {/* Subjudul / Tagline */}
        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400">
          Membangun Ekosistem Digital yang Inklusif untuk Semua.
          <br />
          <span className="text-base mt-2 block">
            Talent Hub • Audit Aksesibilitas • Konsultasi
          </span>
        </p>

        {/* Tombol Call to Action (CTA) */}
        <div className="flex gap-4 justify-center pt-4">
          <Link 
            href="/lowongan"
            className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 px-8 text-sm font-medium text-slate-50 shadow transition-colors hover:bg-slate-900/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90"
          >
            Cari Lowongan
          </Link>
          <Link 
            href="/bisnis" 
            className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:focus-visible:ring-slate-300"
          >
            Layanan Bisnis
          </Link>
        </div>

      </main>
      
      <footer className="absolute bottom-4 text-sm text-slate-500">
        © 2025 PT Dimaster Education Berprestasi
      </footer>
    </div>
  )
}
