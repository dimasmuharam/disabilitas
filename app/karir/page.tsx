import Link from "next/link"
import { Briefcase, Heart, Zap } from "lucide-react"

export default function KarirInternalPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      <div className="container px-4 md:px-6 max-w-4xl mx-auto text-center">
        
        <h1 className="text-3xl font-bold mb-4 text-slate-900 dark:text-slate-50">Bergabung dengan Tim Disabilitas.com</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-12 text-lg">
          Bantu kami membangun masa depan yang inklusif bagi jutaan orang Indonesia.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-16 text-left">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
            <Heart className="h-8 w-8 text-red-500 mb-4" />
            <h3 className="font-bold mb-2">Impact Driven</h3>
            <p className="text-sm text-slate-500">Pekerjaan Anda berdampak langsung pada kehidupan nyata.</p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
            <Zap className="h-8 w-8 text-yellow-500 mb-4" />
            <h3 className="font-bold mb-2">Remote First</h3>
            <p className="text-sm text-slate-500">Kami bekerja dari mana saja, mengutamakan hasil bukan absensi.</p>
          </div>
          <div className="p-6 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-200 dark:border-slate-800">
            <Briefcase className="h-8 w-8 text-blue-500 mb-4" />
            <h3 className="font-bold mb-2">Inklusif Total</h3>
            <p className="text-sm text-slate-500">Lingkungan kerja yang ramah bagi semua ragam disabilitas.</p>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 p-8 rounded-xl border border-blue-100 dark:border-blue-800">
          <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-4">Posisi Tersedia</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Saat ini kami belum membuka lowongan untuk tim internal. Namun, kami selalu terbuka untuk talenta luar biasa.
          </p>
          <Link 
            href="mailto:hrd@dimaster.co.id"
            className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-8 text-sm font-medium text-white shadow hover:bg-blue-700 transition-colors"
          >
            Kirimkan CV Spontan
          </Link>
        </div>

      </div>
    </div>
  )
}
