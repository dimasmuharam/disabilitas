import Link from "next/link"
import { CheckCircle, Building2, Users, ArrowRight, ShieldCheck, MonitorCheck, HeartHandshake } from "lucide-react"

export default function BisnisPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      
      {/* HERO SECTION */}
      <section className="w-full bg-slate-900 py-12 text-slate-50 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="space-y-4">
              {/* BADGE: Fokus pada Riset & Pengalaman Hidup */}
              <div className="mb-2 inline-flex items-center rounded-full border border-slate-700 bg-slate-800/50 px-3 py-1 text-sm text-blue-400">
                <HeartHandshake className="mr-2 size-4" /> Solusi oleh Peneliti & Praktisi Disabilitas
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Wujudkan Lingkungan Kerja yang Inklusif Secara Fungsional
              </h1>
              <p className="text-slate-300 md:text-xl">
                Kami membantu perusahaan memenuhi regulasi UU No. 8/2016 melalui pendekatan yang menggabungkan metodologi riset dengan pengalaman nyata penyandang disabilitas.
              </p>
              <div className="flex flex-col gap-4 pt-4 sm:flex-row">
                <Link
                  href="/kontak"
                  className="inline-flex h-12 items-center justify-center rounded-md bg-blue-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700"
                >
                  Konsultasi Gratis
                </Link>
                <Link
                  href="#layanan"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-slate-700 bg-transparent px-8 text-sm font-medium text-slate-100 shadow-sm transition-colors hover:bg-slate-800"
                >
                  Lihat Layanan
                </Link>
              </div>
            </div>
            <div className="mx-auto flex aspect-video w-full max-w-[500px] items-center justify-center overflow-hidden rounded-xl border border-slate-700 bg-slate-800 p-6 text-center shadow-2xl">
               <div className="space-y-2">
                  <Building2 className="mx-auto size-16 text-slate-600" />
                  <p className="text-sm italic text-slate-500">Audit Aksesibilitas Berbasis Riset & Pengalaman Hidup</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION LAYANAN UTAMA */}
      <section id="layanan" className="w-full bg-white py-12 dark:bg-slate-900 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tighter text-slate-900 dark:text-slate-50">Solusi Berbasis Bukti</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Kami tidak hanya memberikan teori, tapi solusi yang teruji oleh pengguna disabilitas langsung.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            
            {/* JASA 1: REKRUTMEN */}
            <div className="transition-hover flex flex-col rounded-lg border border-slate-200 bg-slate-50 p-6 hover:border-blue-500 dark:border-slate-800 dark:bg-slate-950/50">
              <Users className="mb-4 size-10 text-blue-600" />
              <h3 className="mb-2 text-xl font-bold">Inclusive Recruitment</h3>
              <p className="mb-4 flex-1 text-slate-600 dark:text-slate-400">
                Rekrutmen bukan sekadar memenuhi kuota. Kami membantu job-matching berdasarkan kualifikasi peneliti pendidikan dan kebutuhan spesifik talenta disabilitas.
              </p>
              <ul className="mb-6 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex gap-2"><CheckCircle className="size-4 text-green-500" /> Database Terverifikasi</li>
                <li className="flex gap-2"><CheckCircle className="size-4 text-green-500" /> Analisis Kompetensi</li>
              </ul>
              <Link href="/daftar" className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:underline">
                Mulai Rekrutmen Inklusif <ArrowRight className="size-4" />
              </Link>
            </div>

            {/* JASA 2: AUDIT AKSESIBILITAS */}
            <div className="transition-hover flex flex-col rounded-lg border border-slate-200 bg-slate-50 p-6 hover:border-purple-500 dark:border-slate-800 dark:bg-slate-950/50">
              <MonitorCheck className="mb-4 size-10 text-purple-600" />
              <h3 className="mb-2 text-xl font-bold">Accessibility Audit</h3>
              <p className="mb-4 flex-1 text-slate-600 dark:text-slate-400">
                Audit teknis digital dan fisik yang dilakukan dari kacamata peneliti dan pengguna teknologi asistif (tunanetra).
              </p>
              <ul className="mb-6 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex gap-2"><CheckCircle className="size-4 text-green-500" /> Kepatuhan Standar SPBE</li>
                <li className="flex gap-2"><CheckCircle className="size-4 text-green-500" /> Solusi Aksesibilitas Fungsional</li>
              </ul>
              <Link href="/kontak" className="flex items-center gap-1 text-sm font-medium text-purple-600 hover:underline">
                Konsultasi Audit <ArrowRight className="size-4" />
              </Link>
            </div>

            {/* JASA 3: TRAINING */}
            <div className="transition-hover flex flex-col rounded-lg border border-slate-200 bg-slate-50 p-6 hover:border-orange-500 dark:border-slate-800 dark:bg-slate-950/50">
              <ShieldCheck className="mb-4 size-10 text-orange-600" />
              <h3 className="mb-2 text-xl font-bold">Capacity Building</h3>
              <p className="mb-4 flex-1 text-slate-600 dark:text-slate-400">
                Edukasi etika berinteraksi dan pembangunan budaya kerja inklusif berdasarkan temuan riset perilaku di lingkungan kerja.
              </p>
              <ul className="mb-6 space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex gap-2"><CheckCircle className="size-4 text-green-500" /> Disability Awareness Training</li>
                <li className="flex gap-2"><CheckCircle className="size-4 text-green-500" /> Roadmap Strategis Inklusi</li>
              </ul>
              <Link href="/kontak" className="flex items-center gap-1 text-sm font-medium text-orange-600 hover:underline">
                Jadwalkan Sesi Pelatihan <ArrowRight className="size-4" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION CTA */}
      <section className="w-full border-t border-slate-200 bg-slate-100 py-12 dark:border-slate-800 dark:bg-slate-800/50 md:py-24">
        <div className="container px-4 text-center md:px-6">
          <h2 className="mb-4 text-3xl font-bold tracking-tighter">Membangun Masa Depan Inklusif Bersama</h2>
          <p className="mx-auto mb-8 max-w-2xl text-slate-600 dark:text-slate-400">
            Gabungkan keahlian riset dan pengalaman praktis kami untuk mentransformasi organisasi Anda menjadi lingkungan yang ramah bagi semua orang.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/kontak"
              className="inline-flex h-12 items-center justify-center rounded-md bg-slate-900 px-8 text-sm font-medium text-slate-50 shadow hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90"
            >
              Hubungi Tim Pakar <ArrowRight className="ml-2 size-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
