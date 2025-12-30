import Link from "next/link"
import { CheckCircle, Building2, Users, ArrowRight, ShieldCheck, MonitorCheck, HeartHandshake } from "lucide-react"

export default function BisnisPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      
      {/* HERO SECTION */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-slate-900 text-slate-50">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              {/* BADGE: Fokus pada Riset & Pengalaman Hidup */}
              <div className="inline-flex items-center rounded-full border border-slate-700 bg-slate-800/50 px-3 py-1 text-sm text-blue-400 mb-2">
                <HeartHandshake className="mr-2 h-4 w-4" /> Solusi oleh Peneliti & Praktisi Disabilitas
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Wujudkan Lingkungan Kerja yang Inklusif Secara Fungsional
              </h1>
              <p className="text-slate-300 md:text-xl">
                Kami membantu perusahaan memenuhi regulasi UU No. 8/2016 melalui pendekatan yang menggabungkan metodologi riset dengan pengalaman nyata penyandang disabilitas.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
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
            <div className="mx-auto w-full max-w-[500px] aspect-video bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700 shadow-2xl overflow-hidden text-center p-6">
               <div className="space-y-2">
                  <Building2 className="h-16 w-16 text-slate-600 mx-auto" />
                  <p className="text-slate-500 text-sm italic">Audit Aksesibilitas Berbasis Riset & Pengalaman Hidup</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION LAYANAN UTAMA */}
      <section id="layanan" className="w-full py-12 md:py-24 bg-white dark:bg-slate-900">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter text-slate-900 dark:text-slate-50">Solusi Berbasis Bukti</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Kami tidak hanya memberikan teori, tapi solusi yang teruji oleh pengguna disabilitas langsung.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            
            {/* JASA 1: REKRUTMEN */}
            <div className="flex flex-col p-6 bg-slate-50 dark:bg-slate-950/50 rounded-lg border border-slate-200 dark:border-slate-800 transition-hover hover:border-blue-500">
              <Users className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Inclusive Recruitment</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4 flex-1">
                Rekrutmen bukan sekadar memenuhi kuota. Kami membantu job-matching berdasarkan kualifikasi peneliti pendidikan dan kebutuhan spesifik talenta disabilitas.
              </p>
              <ul className="space-y-2 mb-6 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Database Terverifikasi</li>
                <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Analisis Kompetensi</li>
              </ul>
              <Link href="/daftar" className="text-blue-600 font-medium text-sm flex items-center gap-1 hover:underline">
                Mulai Rekrutmen Inklusif <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* JASA 2: AUDIT AKSESIBILITAS */}
            <div className="flex flex-col p-6 bg-slate-50 dark:bg-slate-950/50 rounded-lg border border-slate-200 dark:border-slate-800 transition-hover hover:border-purple-500">
              <MonitorCheck className="h-10 w-10 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Accessibility Audit</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4 flex-1">
                Audit teknis digital dan fisik yang dilakukan dari kacamata peneliti dan pengguna teknologi asistif (tunanetra).
              </p>
              <ul className="space-y-2 mb-6 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Kepatuhan Standar SPBE</li>
                <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Solusi Aksesibilitas Fungsional</li>
              </ul>
              <Link href="/kontak" className="text-purple-600 font-medium text-sm flex items-center gap-1 hover:underline">
                Konsultasi Audit <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* JASA 3: TRAINING */}
            <div className="flex flex-col p-6 bg-slate-50 dark:bg-slate-950/50 rounded-lg border border-slate-200 dark:border-slate-800 transition-hover hover:border-orange-500">
              <ShieldCheck className="h-10 w-10 text-orange-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Capacity Building</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4 flex-1">
                Edukasi etika berinteraksi dan pembangunan budaya kerja inklusif berdasarkan temuan riset perilaku di lingkungan kerja.
              </p>
              <ul className="space-y-2 mb-6 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Disability Awareness Training</li>
                <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Roadmap Strategis Inklusi</li>
              </ul>
              <Link href="/kontak" className="text-orange-600 font-medium text-sm flex items-center gap-1 hover:underline">
                Jadwalkan Sesi Pelatihan <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION CTA */}
      <section className="w-full py-12 md:py-24 bg-slate-100 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tighter mb-4">Membangun Masa Depan Inklusif Bersama</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
            Gabungkan keahlian riset dan pengalaman praktis kami untuk mentransformasi organisasi Anda menjadi lingkungan yang ramah bagi semua orang.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/kontak"
              className="inline-flex h-12 items-center justify-center rounded-md bg-slate-900 px-8 text-sm font-medium text-slate-50 shadow hover:bg-slate-900/90 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90"
            >
              Hubungi Tim Pakar <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
