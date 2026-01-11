import Link from "next/link"
import { Building2, Users, GraduationCap, Landmark, Search } from "lucide-react"

export default function IndexPage() {
  return (
    <div className="flex min-h-screen flex-col">
      
      {/* HERO SECTION: Headline Utama */}
      <section className="w-full border-b border-slate-200 bg-white py-12 dark:border-slate-800 dark:bg-slate-900 md:py-24 lg:py-32 xl:py-48">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter text-slate-900 dark:text-slate-50 sm:text-4xl md:text-5xl lg:text-6xl/none">
                Satu Data, Sejuta Peluang <br className="hidden sm:inline" />
                <span className="text-blue-600">Ekosistem Karir Inklusif</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-slate-500 dark:text-slate-400 md:text-xl">
                Platform pertama yang menghubungkan Talenta Disabilitas, Kampus, Perusahaan, dan Pemerintah dalam satu sistem terintegrasi.
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link
                href="/lowongan"
                className="inline-flex h-11 items-center justify-center rounded-md bg-slate-900 px-8 text-sm font-medium text-slate-50 shadow transition-colors hover:bg-slate-900/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90"
              >
                <Search className="mr-2 size-4" /> Cari Lowongan
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
      <section className="w-full bg-slate-50 py-12 dark:bg-slate-950 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tighter text-slate-900 dark:text-slate-50">Siapa Anda?</h2>
            <p className="text-slate-500 dark:text-slate-400">Pilih peran Anda untuk mendapatkan layanan yang tepat.</p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            
            {/* 1. TALENTA (Penyandang Disabilitas) */}
            <Link href="/lowongan" className="group relative overflow-hidden rounded-xl border bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-lg dark:bg-slate-900">
              <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                <Users className="size-6" />
              </div>
              <h3 className="mb-2 text-xl font-bold transition-colors group-hover:text-blue-600">Talenta</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Akses ribuan lowongan kerja inklusif dan program pengembangan skill.
              </p>
            </Link>

            {/* 2. KAMPUS (Perguruan Tinggi) */}
            <Link href="/kampus" className="group relative overflow-hidden rounded-xl border bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-lg dark:bg-slate-900">
              <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300">
                <GraduationCap className="size-6" />
              </div>
              <h3 className="mb-2 text-xl font-bold transition-colors group-hover:text-green-600">Kampus</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Digitalisasi Unit Layanan Disabilitas (ULD) dan tracer study alumni.
              </p>
            </Link>

            {/* 3. PERUSAHAAN (Bisnis) */}
            <Link href="/bisnis" className="group relative overflow-hidden rounded-xl border bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-lg dark:bg-slate-900">
              <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300">
                <Building2 className="size-6" />
              </div>
              <h3 className="mb-2 text-xl font-bold transition-colors group-hover:text-orange-600">Perusahaan</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Rekrutmen inklusif, pemenuhan kuota 1%, dan Audit Aksesibilitas.
              </p>
            </Link>

            {/* 4. PEMERINTAH (Government) */}
            <Link href="/tentang" className="group relative overflow-hidden rounded-xl border bg-white p-6 transition-all hover:-translate-y-1 hover:shadow-lg dark:bg-slate-900">
              <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300">
                <Landmark className="size-6" />
              </div>
              <h3 className="mb-2 text-xl font-bold transition-colors group-hover:text-purple-600">Pemerintah</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Pantau data penyerapan tenaga kerja dan kepatuhan regulasi secara real-time.
              </p>
            </Link>

          </div>
        </div>
      </section>

      {/* ALUR KERJA EKOSISTEM */}
      <section className="w-full bg-white py-12 dark:bg-slate-900">
        <div className="container px-4 md:px-6">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold tracking-tighter">Bagaimana Kami Menghubungkan Anda?</h2>
          </div>
          
          <div className="relative mx-auto flex max-w-5xl flex-col items-center justify-between gap-8 md:flex-row">
            
            {/* Step 1: Kampus/Lembaga */}
            <div className="z-10 flex flex-col items-center bg-white p-2 text-center dark:bg-slate-900">
              <div className="mb-3 rounded-full bg-green-100 p-4 dark:bg-green-900">
                <GraduationCap className="size-8 text-green-700 dark:text-green-300" />
              </div>
              <h4 className="text-sm font-bold">1. Kampus/Lembaga</h4>
              <p className="max-w-[150px] text-xs text-slate-500">Melatih & mendata kompetensi talenta.</p>
            </div>

            {/* Panah Konektor 1 */}
            <div className="relative mx-4 hidden h-1 flex-1 bg-slate-200 dark:bg-slate-800 md:block">
              <div className="absolute -top-1.5 right-0 size-3 rotate-45 border-r-2 border-t-2 border-slate-300"></div>
            </div>
            <div className="h-8 w-1 bg-slate-200 dark:bg-slate-800 md:hidden"></div>

            {/* Step 2: Platform Disabilitas.com */}
            <div className="z-10 flex scale-110 flex-col items-center rounded-xl border-2 border-blue-600 bg-white p-4 text-center shadow-lg dark:bg-slate-900">
              <div className="mb-3 rounded-full bg-blue-600 p-4 shadow-md">
                <Search className="size-8 text-white" />
              </div>
              <h4 className="text-base font-bold text-blue-700 dark:text-blue-400">2. Disabilitas.com</h4>
              <p className="max-w-[150px] text-xs text-slate-500">Validasi data, matching, & audit aksesibilitas.</p>
            </div>

            {/* Panah Konektor 2 */}
            <div className="relative mx-4 hidden h-1 flex-1 bg-slate-200 dark:bg-slate-800 md:block">
                <div className="absolute -top-1.5 right-0 size-3 rotate-45 border-r-2 border-t-2 border-slate-300"></div>
            </div>
            <div className="h-8 w-1 bg-slate-200 dark:bg-slate-800 md:hidden"></div>

            {/* Step 3: Industri */}
            <div className="z-10 flex flex-col items-center bg-white p-2 text-center dark:bg-slate-900">
              <div className="mb-3 rounded-full bg-orange-100 p-4 dark:bg-orange-900">
                <Building2 className="size-8 text-orange-700 dark:text-orange-300" />
              </div>
              <h4 className="text-sm font-bold">3. Industri</h4>
              <p className="max-w-[150px] text-xs text-slate-500">Merekrut talenta yang terverifikasi.</p>
            </div>

          </div>
        </div>
      </section>

      {/* STATISTIK / SOCIAL PROOF */}
      <section className="w-full border-t border-slate-200 py-12 dark:border-slate-800">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
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
      <section className="w-full bg-slate-900 py-12 text-slate-50 md:py-24">
        <div className="container px-4 text-center md:px-6">
          <h2 className="mb-4 text-3xl font-bold tracking-tighter">Siap Menciptakan Perubahan?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-slate-400">
            Bergabunglah sekarang untuk mewujudkan Indonesia yang inklusif, di mana setiap orang memiliki kesempatan yang sama.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
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
