import Link from "next/link"
import { ArrowRight, Building2, GraduationCap, Landmark, Users } from "lucide-react"

export default function IndexPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      
      {/* SECTION 1: HERO (Banner Utama) */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-slate-50 dark:bg-slate-950">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-slate-900 dark:text-slate-50">
                Satu Data Disabilitas Nasional
              </h1>
              <p className="mx-auto max-w-[800px] text-slate-600 md:text-xl dark:text-slate-400">
                Platform terintegrasi yang menghubungkan Talenta, Kampus, Dunia Usaha, dan Pemerintah dalam satu ekosistem inklusif.
              </p>
            </div>
            
            <div className="space-x-4 pt-4">
              <Link
                href="/lowongan"
                className="inline-flex h-12 items-center justify-center rounded-md bg-slate-900 px-8 text-sm font-medium text-slate-50 shadow transition-colors hover:bg-slate-900/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90"
              >
                Gabung sebagai Talenta
              </Link>
              <Link
                href="/mitra"
                className="inline-flex h-12 items-center justify-center rounded-md border border-slate-200 bg-white px-8 text-sm font-medium shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 dark:hover:text-slate-50"
              >
                Login Mitra
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: 4 PILAR EKOSISTEM */}
      <section className="w-full py-12 md:py-24 bg-white dark:bg-slate-900">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl">Solusi untuk Semua Stakeholder</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Kolaborasi lintas sektor untuk masa depan yang setara.</p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4">
            
            {/* 1. TALENTA */}
            <div className="flex flex-col space-y-3 rounded-lg border border-slate-200 p-6 shadow-sm dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
              <Users className="h-10 w-10 text-blue-600 mb-2" />
              <h3 className="text-xl font-bold">Talenta Disabilitas</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 flex-1">
                Bangun profil profesional, temukan karir impian, dan akses pelatihan skill digital.
              </p>
              <Link href="/lowongan" className="text-sm font-medium text-blue-600 hover:underline">
                Mulai Karir &rarr;
              </Link>
            </div>

            {/* 2. PERUSAHAAN (Swasta & BUMN) */}
            <div className="flex flex-col space-y-3 rounded-lg border border-slate-200 p-6 shadow-sm dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
              <Building2 className="h-10 w-10 text-orange-600 mb-2" />
              <h3 className="text-xl font-bold">Dunia Usaha</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 flex-1">
                Rekrutmen inklusif pemenuhan kuota 1%, serta audit aksesibilitas kantor & sistem digital perusahaan.
              </p>
              <Link href="/bisnis" className="text-sm font-medium text-orange-600 hover:underline">
                Layanan Bisnis &rarr;
              </Link>
            </div>

            {/* 3. PERGURUAN TINGGI */}
            <div className="flex flex-col space-y-3 rounded-lg border border-slate-200 p-6 shadow-sm dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
              <GraduationCap className="h-10 w-10 text-green-600 mb-2" />
              <h3 className="text-xl font-bold">Perguruan Tinggi</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 flex-1">
                Sistem pendataan mahasiswa disabilitas & pengelolaan Unit Layanan Disabilitas (ULD) Kampus.
              </p>
              <Link href="/kampus" className="text-sm font-medium text-green-600 hover:underline">
                Sistem ULD &rarr;
              </Link>
            </div>

            {/* 4. PEMERINTAH */}
            <div className="flex flex-col space-y-3 rounded-lg border border-slate-200 p-6 shadow-sm dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
              <Landmark className="h-10 w-10 text-purple-600 mb-2" />
              <h3 className="text-xl font-bold">Pemerintah</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 flex-1">
                Dashboard sebaran data nasional, pemantauan kuota ASN, serta <span className="font-semibold">audit kepatuhan aksesibilitas website (SPBE) & layanan publik.</span>
              </p>
              <Link href="/pemerintah" className="text-sm font-medium text-purple-600 hover:underline">
                Akses Dashboard &rarr;
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* FOOTER MANUAL SUDAHDIHAPUS DARI SINI */}
      {/* Footer Global akan otomatis muncul dari layout.tsx */}

    </div>
  )
}
