import Link from "next/link"
import { Briefcase, Heart, Zap } from "lucide-react"

export default function KarirInternalPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 dark:bg-slate-950">
      <div className="container mx-auto max-w-4xl px-4 text-center md:px-6">
        
        <h1 className="mb-4 text-3xl font-bold text-slate-900 dark:text-slate-50">Bergabung dengan Tim Disabilitas.com</h1>
        <p className="mb-12 text-lg text-slate-600 dark:text-slate-400">
          Bantu kami membangun masa depan yang inklusif bagi jutaan orang Indonesia.
        </p>

        <div className="mb-16 grid gap-6 text-left md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Heart className="mb-4 size-8 text-red-500" />
            <h3 className="mb-2 font-bold">Impact Driven</h3>
            <p className="text-sm text-slate-500">Pekerjaan Anda berdampak langsung pada kehidupan nyata.</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Zap className="mb-4 size-8 text-yellow-500" />
            <h3 className="mb-2 font-bold">Remote First</h3>
            <p className="text-sm text-slate-500">Kami bekerja dari mana saja, mengutamakan hasil bukan absensi.</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Briefcase className="mb-4 size-8 text-blue-500" />
            <h3 className="mb-2 font-bold">Inklusif Total</h3>
            <p className="text-sm text-slate-500">Lingkungan kerja yang ramah bagi semua ragam disabilitas.</p>
          </div>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50 p-8 dark:border-blue-800 dark:bg-blue-900/20">
          <h2 className="mb-4 text-xl font-bold text-blue-900 dark:text-blue-100">Posisi Tersedia</h2>
          <p className="mb-6 text-slate-600 dark:text-slate-300">
            Saat ini kami belum membuka lowongan untuk tim internal. Namun, kami selalu terbuka untuk talenta luar biasa.
          </p>
          <Link 
            href="mailto:hrd@dimaster.co.id"
            className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700"
          >
            Kirimkan CV Spontan
          </Link>
        </div>

      </div>
    </div>
  )
}
