import Link from "next/link"
import { CheckCircle, Building2, BarChart3, Users, ArrowRight, ShieldCheck } from "lucide-react"

export default function BisnisPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      
      {/* HERO SECTION: Menjual Value Proposition */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-slate-900 text-slate-50">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Wujudkan Lingkungan Kerja yang Benar-Benar Inklusif
              </h1>
              <p className="text-slate-300 md:text-xl">
                Kami membantu perusahaan dan instansi pemerintah memenuhi regulasi (UU No. 8/2016), meningkatkan ESG Score, dan mendapatkan talenta loyal terbaik.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/kontak"
                  className="inline-flex h-12 items-center justify-center rounded-md bg-blue-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                >
                  Konsultasi Gratis
                </Link>
                <Link
                  href="#layanan"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-slate-700 bg-transparent px-8 text-sm font-medium text-slate-100 shadow-sm transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  Lihat Layanan
                </Link>
              </div>
            </div>
            {/* Ilustrasi Visual (Bisa diganti foto kantor nanti) */}
            <div className="mx-auto w-full max-w-[500px] aspect-video bg-slate-800 rounded-xl flex items-center justify-center border border-slate-700">
              <Building2 className="h-20 w-20 text-slate-600" />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION LAYANAN UTAMA */}
      <section id="layanan" className="w-full py-12 md:py-24 bg-white dark:bg-slate-900">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter text-slate-900 dark:text-slate-50">Solusi Komprehensif</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Satu pintu untuk semua kebutuhan inklusi perusahaan Anda.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            
            {/* JASA 1: REKRUTMEN */}
            <div className="flex flex-col p-6 bg-slate-50 dark:bg-slate-950/50 rounded-lg border border-slate-200 dark:border-slate-800">
              <Users className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Inclusive Recruitment</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4 flex-1">
                Akses database ribuan talenta disabilitas terverifikasi skill & medis. Kami bantu screening hingga onboarding.
              </p>
              <ul className="space-y-2 mb-6 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Pemenuhan Kuota 1%</li>
                <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Assessment Alat Kerja</li>
              </ul>
            </div>

            {/* JASA 2: AUDIT DIGITAL (IT) */}
            <div className="flex flex-col p-6 bg-slate-50 dark:bg-slate-950/50 rounded-lg border border-slate-200 dark:border-slate-800">
              <ShieldCheck className="h-10 w-10 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Digital Accessibility Audit</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4 flex-1">
                Pastikan website & aplikasi Anda bisa diakses tunanetra (Screen Reader Friendly) sesuai standar WCAG 2.1.
              </p>
              <ul className="space-y-2 mb-6 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Kepatuhan SPBE (Pemerintah)</li>
                <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Sertifikasi Aksesibilitas</li>
              </ul>
            </div>

            {/* JASA 3: AUDIT FISIK & PELATIHAN */}
            <div className="flex flex-col p-6 bg-slate-50 dark:bg-slate-950/50 rounded-lg border border-slate-200 dark:border-slate-800">
              <Building2 className="h-10 w-10 text-orange-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Building & Culture Audit</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4 flex-1">
                Audit fasilitas gedung (Ramp, Toilet, Guiding Block) dan pelatihan Disability Awareness untuk karyawan.
              </p>
              <ul className="space-y-2 mb-6 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Standar PU / Desain Universal</li>
                <li className="flex gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Training Bahasa Isyarat</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION CTA (Call to Action) */}
      <section className="w-full py-12 md:py-24 bg-slate-100 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tighter mb-4">Siap Memulai Transformasi?</h2>
          <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
            Jangan tunggu sampai ditegur regulasi. Jadilah pelopor inklusi di industri Anda bersama mitra yang tepat.
          </p>
          <Link
            href="/kontak"
            className="inline-flex h-12 items-center justify-center rounded-md bg-slate-900 px-8 text-sm font-medium text-slate-50 shadow hover:bg-slate-900/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 dark:bg-slate-50 dark:text-slate-900 dark:hover:bg-slate-50/90"
          >
            Hubungi Tim Bisnis Kami <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>

    </div>
  )
}
