import Link from "next/link"
import { Building2, Users, GraduationCap, Landmark, Search } from "lucide-react"

export default function IndexPage() {
  return (
    <div className="flex flex-col min-h-screen">
      
      {/* HERO SECTION: Headline Utama */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-slate-900 dark:text-slate-50">
                Satu Data, Sejuta Peluang <br className="hidden sm:inline" />
                <span className="text-blue-600">Ekosistem Karir Inklusif</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-slate-500 md:text-xl dark:text-slate-400">
                Platform pertama yang menghubungkan Talenta Disabilitas, Kampus, Perusahaan, dan Pemerintah dalam satu sistem terintegrasi.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/lowongan"
                className="inline-flex h-11 items-center justify-center rounded-md bg-slate-900 px-8 text-sm font-medium text-slate-50 shadow transition-colors hover:bg-slate-900/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90"
              >
                <Search className="mr-2 h-4 w-4" /> Cari Lowongan
              </Link>
              <Link
                href="/bisnis"
                className="inline-flex h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50"
              >
                Untuk Perusahaan
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SEKSI 4 PILAR (EKOSISTEM) */}
      <section className="w-full py-12 md:py-24 bg-slate-50 dark:bg-slate-950">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter text-slate-900 dark:text-slate-50">Siapa Anda?</h2>
            <p className="text-slate-500 dark:text-slate-400">Pilih peran Anda untuk mendapatkan layanan yang tepat.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* 1. TALENTA (Penyandang Disabilitas) */}
            <Link href="/lowongan" className="group relative overflow-hidden rounded-xl border bg-white dark:bg-slate-900 p-6 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 mb-4">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-xl mb-2 group-hover:text-blue-600 transition-colors">Talenta</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Akses ribuan lowongan kerja inklusif dan program pengembangan skill.
              </p>
            </Link>

            {/* 2. KAMPUS (Perguruan Tinggi) */}
            <Link href="/kampus" className="group relative overflow-hidden rounded-xl border bg-white dark:bg-slate-900 p-6 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 mb-4">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-xl mb-2 group-hover:text-green-600 transition-colors">Kampus</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Digitalisasi Unit Layanan Disabilitas (ULD) dan tracer study alumni.
              </p>
            </Link>

            {/* 3. PERUSAHAAN (Bisnis) */}
            <Link href="/bisnis" className="group relative overflow-hidden rounded-xl border bg-white dark:bg-slate-900 p-6 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-300 mb-4">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-xl mb-2 group-hover:text-orange-600 transition-colors">Perusahaan</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Rekrutmen inklusif, pemenuhan kuota 1%, dan Audit Aksesibilitas.
              </p>
            </Link>

            {/* 4. PEMERINTAH (Government) */}
            <Link href="/tentang" className="group relative overflow-hidden rounded-xl border bg-white dark:bg-slate-900 p-6 hover:shadow-lg transition-all hover:-translate-y-1">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 mb-4">
                <Landmark className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-xl mb-2 group-hover:text-purple-600 transition-colors">Pemerintah</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Pantau data penyerapan tenaga kerja dan kepatuhan regulasi secara real-time.
              </p>
            </Link>

          </div>
        </div>
      </section>

      {/* ALUR KERJA EKOSISTEM */}
      <section className="w-full py-12 bg-white dark:bg-slate-900">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold tracking-tighter">Bagaimana Kami Menghubungkan Anda?</h2>
          </div>
          
          <div className="relative flex flex-col md:flex-row justify-between items-center max-w-5xl mx-auto gap-8">
            
            {/* Step 1: Kampus/Lembaga */}
            <div className="flex flex-col items-center text-center z-10 bg-white dark:bg-slate-900 p-2">
              <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full mb-3">
                <GraduationCap className="h-8 w-8 text-green-700 dark:text-green-300" />
              </div>
              <h4 className="font-bold text-sm">1. Kampus/Lembaga</h4>
              <p className="text-xs text-slate-500 max-w-[150px]">Melatih & mendata kompetensi talenta.</p>
            </div>

            {/* Panah Konektor 1 */}
            <div className="hidden md:block flex-1 h-1 bg-slate-200 dark:bg-slate-800 relative mx-4">
              <div className="absolute right-0 -top-1.5 h-3 w-3 border-t-2 border-r-2 border-slate-300 rotate-45"></div>
            </div>
            <div className="md:hidden h-8 w-1 bg-slate-200 dark:bg-slate-800"></div>

            {/* Step 2: Platform Disabilitas.com */}
            <div className="flex flex-col items-center text-center z-10 bg-white dark:bg-slate-900 p-4 border-2 border-blue-600 rounded-xl shadow-lg transform scale-110">
              <div className="bg-blue-600 p-4 rounded-full mb-3 shadow-md">
                <Search className="h-8 w-8 text-white" />
              </div>
              <h4 className="font-bold text-base text-blue-700 dark:text-blue-400">2. Disabilitas.com</h4>
              <p className="text-xs text-slate-500 max-w-[150px]">Validasi data, matching, & audit aksesibilitas.</p>
            </div>

            {/* Panah Konektor 2 */}
            <div className="hidden md:block flex-1 h-1 bg-slate-200 dark:bg-slate-800 relative mx-4">
                <div className="absolute right-0 -top-1.5 h-3 w-3 border-t-2 border-r-2 border-slate-300 rotate-45"></div>
            </div>
            <div className="md:hidden h-8 w-1 bg-slate-200 dark:bg-slate-800"></div>

            {/* Step 3: Industri */}
            <div className="flex flex-col items-center text-center z-10 bg-white dark:bg-slate-900 p-2">
              <div className="bg-orange-100 dark:bg-orange-900 p-4 rounded-full mb-3">
                <Building2 className="h-8 w-8 text-orange-700 dark:text-orange-300" />
              </div>
              <h4 className="font-bold text-sm">3. Industri</h4>
              <p className="text-xs text-slate-500 max-w-[150px]">Merekrut talenta yang terverifikasi.</p>
            </div>

          </div>
        </div>
      </section>

      {/* STATISTIK / SOCIAL PROOF */}
      <section className="w-full py-12 border-t border-slate-200 dark:border-slate-800">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <h3 className="text-3xl font-bold">1,000+</h3>
              <p className="text-sm text-slate-500">Talenta Siap Kerja</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-bold">50+</h3>
              <p className="text-sm text-slate-500">Mitra Perusahaan</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-bold">20+</h3>
              <p className="text-sm text-slate-500">Kampus Terdaftar</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-bold">100%</h3>
              <p className="text-sm text-slate-500">Aksesibel (WCAG 2.1)</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA AKHIR (PENTING) */}
      <section className="w-full py-12 md:py-24 bg-slate-900 text-slate-50">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tighter mb-4">Siap Menciptakan Perubahan?</h2>
          <p className="text-slate-400 max-w-2xl mx-auto mb-8">
            Bergabunglah sekarang untuk mewujudkan Indonesia yang inklusif, di mana setiap orang memiliki kesempatan yang sama.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            {/* UPDATE: Link ke Pendaftaran langsung */}
            <Link
              href="/daftar"
              className="inline-flex h-12 items-center justify-center rounded-md bg-blue-600 px-8 text-sm font-medium text-white shadow hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            >
              Daftar Sekarang
            </Link>
            <Link
              href="/lowongan"
              className="inline-flex h-12 items-center justify-center rounded-md border border-slate-700 bg-transparent px-8 text-sm font-medium text-slate-100 shadow-sm transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
            >
              Lihat Lowongan Terbaru
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
