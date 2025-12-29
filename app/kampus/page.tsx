import Link from "next/link"
import { GraduationCap, BookOpen, Users, BarChart, ArrowRight, CheckCircle } from "lucide-react"

export default function KampusPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      
      {/* HERO SECTION */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-green-900 text-slate-50">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-green-800 px-3 py-1 text-sm font-semibold text-green-100">
                Untuk Perguruan Tinggi
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Digitalisasi Unit Layanan Disabilitas (ULD) Kampus
              </h1>
              <p className="text-slate-200 md:text-xl">
                Kelola data mahasiswa disabilitas, pantau perkembangan akademik, dan hubungkan alumni dengan dunia kerja dalam satu dashboard terintegrasi.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/mitra"
                  className="inline-flex h-12 items-center justify-center rounded-md bg-white px-8 text-sm font-medium text-green-900 shadow transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  Daftarkan Kampus
                </Link>
                <Link
                  href="#fitur"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-green-700 bg-transparent px-8 text-sm font-medium text-slate-100 shadow-sm transition-colors hover:bg-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  Pelajari Fitur
                </Link>
              </div>
            </div>
            {/* Visual Ilustrasi */}
            <div className="mx-auto w-full max-w-[500px] aspect-video bg-green-800/50 rounded-xl flex items-center justify-center border border-green-700">
              <GraduationCap className="h-24 w-24 text-green-200/50" />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION FITUR */}
      <section id="fitur" className="w-full py-12 md:py-24 bg-white dark:bg-slate-900">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter text-slate-900 dark:text-slate-50">Mengapa Bergabung?</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Solusi manajemen inklusi sesuai standar Permenristekdikti.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            
            {/* FITUR 1 */}
            <div className="flex flex-col p-6 bg-slate-50 dark:bg-slate-950/50 rounded-lg border border-slate-200 dark:border-slate-800">
              <BookOpen className="h-10 w-10 text-green-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Pendataan Terpusat</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4 flex-1">
                Database mahasiswa disabilitas yang rapi, mencakup ragam disabilitas dan kebutuhan akomodasi pembelajaran.
              </p>
            </div>

            {/* FITUR 2 */}
            <div className="flex flex-col p-6 bg-slate-50 dark:bg-slate-950/50 rounded-lg border border-slate-200 dark:border-slate-800">
              <BarChart className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Tracer Study Inklusif</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4 flex-1">
                Pantau penyerapan kerja alumni disabilitas Anda secara real-time melalui dashboard analitik.
              </p>
            </div>

            {/* FITUR 3 */}
            <div className="flex flex-col p-6 bg-slate-50 dark:bg-slate-950/50 rounded-lg border border-slate-200 dark:border-slate-800">
              <Users className="h-10 w-10 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Koneksi Industri</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4 flex-1">
                Salurkan mahasiswa magang atau lulusan langsung ke jaringan mitra perusahaan Disabilitas.com.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* SYARAT BERGABUNG */}
      <section className="w-full py-12 md:py-24 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter">Langkah Kemitraan</h2>
              <p className="text-slate-600 dark:text-slate-400">
                Proses mudah untuk menjadikan kampus Anda ramah disabilitas.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Registrasi akun Kampus Resmi (domain .ac.id)</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Verifikasi dokumen legalitas & SK ULD</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Upload data mahasiswa (Batch Upload tersedia)</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Akses fitur penyaluran kerja & beasiswa</span>
                </li>
              </ul>
            </div>
            <div className="flex flex-col justify-center space-y-4 rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="space-y-2 text-center">
                <h3 className="text-2xl font-bold">Daftar Sekarang</h3>
                <p className="text-slate-500">Gratis untuk institusi pendidikan.</p>
              </div>
              <Link 
                href="/mitra"
                className="inline-flex h-10 items-center justify-center rounded-md bg-slate-900 w-full text-sm font-medium text-slate-50 shadow transition-colors hover:bg-slate-900/90"
              >
                Buat Akun Kampus
              </Link>
              <p className="text-xs text-center text-slate-500">
                Butuh bantuan proposal? <Link href="/kontak" className="underline hover:text-blue-600">Hubungi Kami</Link>
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
