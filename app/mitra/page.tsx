import Link from "next/link"
import { Building2, ArrowRight, ShieldCheck, GraduationCap, Landmark } from "lucide-react"

export default function MitraLoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] w-full lg:grid lg:grid-cols-2">
      
      {/* BAGIAN KIRI: Form Login */}
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Portal Mitra</h1>
            <p className="text-balance text-slate-500 dark:text-slate-400">
              Masuk untuk mengelola lowongan, data mahasiswa, atau dashboard pemerintah.
            </p>
          </div>
          
          <div className="grid gap-4">
            <div className="grid gap-2">
              <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Email Kerja (Corporate Email)
              </label>
              <input
                id="email"
                type="email"
                placeholder="nama@perusahaan.co.id"
                required
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300"
              />
            </div>
            
            <div className="grid gap-2">
              <div className="flex items-center">
                <label htmlFor="password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Kata Sandi
                </label>
                <Link
                  href="/lupa-password"
                  className="ml-auto inline-block text-sm underline hover:text-blue-600"
                >
                  Lupa sandi?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                required
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus:ring-slate-300"
              />
            </div>

            <button
              type="submit"
              className="inline-flex h-10 w-full items-center justify-center rounded-md bg-slate-900 px-8 text-sm font-medium text-slate-50 shadow transition-colors hover:bg-slate-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90"
            >
              Masuk Dashboard
            </button>
            
            <button
              type="button"
              className="inline-flex h-10 w-full items-center justify-center rounded-md border border-slate-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950 disabled:pointer-events-none disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50"
            >
              Masuk dengan Google Workspace
            </button>
          </div>

          <div className="mt-4 text-center text-sm text-slate-500">
            Belum menjadi mitra?{" "}
            <Link href="/bisnis" className="font-medium underline hover:text-blue-600">
              Daftar Perusahaan
            </Link>{" "}
            atau{" "}
            <Link href="/kampus" className="font-medium underline hover:text-blue-600">
              Daftar Kampus
            </Link>
          </div>
        </div>
      </div>

      {/* BAGIAN KANAN: Visual / Banner (Hidden di HP) */}
      <div className="hidden flex-col justify-center border-l border-slate-200 bg-slate-100 p-12 dark:border-slate-800 dark:bg-slate-900 lg:flex">
        <div className="mx-auto max-w-md space-y-6">
          <div className="mb-8 grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center justify-center rounded-lg bg-white p-4 shadow-sm dark:bg-slate-950">
               <Building2 className="mb-2 size-8 text-orange-600" />
               <span className="text-xs font-semibold">Korporat</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg bg-white p-4 shadow-sm dark:bg-slate-950">
               <GraduationCap className="mb-2 size-8 text-green-600" />
               <span className="text-xs font-semibold">Kampus</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-lg bg-white p-4 shadow-sm dark:bg-slate-950">
               <Landmark className="mb-2 size-8 text-purple-600" />
               <span className="text-xs font-semibold">Pemerintah</span>
            </div>
          </div>

          <blockquote className="space-y-2">
            <p className="text-lg font-medium leading-relaxed text-slate-700 dark:text-slate-300">
              &ldquo;Bergabung dengan ekosistem Disabilitas.com memudahkan kami dalam memenuhi kuota 2% ASN disabilitas dengan talenta yang tepat sasaran.&rdquo;
            </p>
            <footer className="text-sm font-semibold text-slate-500">
              — Kepala BKD (Badan Kepegawaian Daerah)
            </footer>
          </blockquote>
          
          <div className="pt-8">
             <div className="flex items-center gap-2 text-sm text-slate-500">
               <ShieldCheck className="size-4 text-green-600" /> Data Anda terenkripsi dan aman.
             </div>
          </div>
        </div>
      </div>

    </div>
  )
}
