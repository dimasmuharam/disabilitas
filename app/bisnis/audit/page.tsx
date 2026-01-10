import Link from "next/link"
import { ShieldCheck, Monitor, Building, FileText, CheckCircle2, ArrowRight } from "lucide-react"

export default function AuditAksesibilitasPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      
      {/* HERO SECTION */}
      <section className="w-full bg-blue-600 py-12 text-white md:py-24">
        <div className="container px-4 text-center md:px-6">
          <h1 className="mb-4 text-3xl font-bold tracking-tighter sm:text-5xl">Layanan Audit Aksesibilitas</h1>
          <p className="mx-auto max-w-[700px] text-blue-100 md:text-xl">
            Transformasi ekosistem kerja Anda menjadi inklusif melalui audit berbasis riset dan standar internasional (WCAG 2.1).
          </p>
        </div>
      </section>

      {/* LAYANAN UTAMA */}
      <section className="container px-4 py-16 md:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          
          {/* Audit Digital */}
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Monitor className="mb-4 size-12 text-blue-600" />
            <h3 className="mb-2 text-xl font-bold">Audit Digital (SPBE)</h3>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
              Evaluasi website dan aplikasi mobile berdasarkan standar WCAG 2.1 Level AA untuk kepatuhan inklusi digital.
            </p>
            <ul className="mb-6 space-y-2">
              <li className="flex items-center text-xs text-slate-500"><CheckCircle2 className="mr-2 size-4 text-green-500" /> Pengujian Screen Reader</li>
              <li className="flex items-center text-xs text-slate-500"><CheckCircle2 className="mr-2 size-4 text-green-500" /> Analisis Kontras & Navigasi</li>
            </ul>
          </div>

          {/* Audit Fisik */}
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Building className="mb-4 size-12 text-blue-600" />
            <h3 className="mb-2 text-xl font-bold">Audit Lingkungan Kerja</h3>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
              Penilaian fasilitas fisik kantor untuk memastikan aksesibilitas bagi pengguna kursi roda dan disabilitas sensorik.
            </p>
            <ul className="mb-6 space-y-2">
              <li className="flex items-center text-xs text-slate-500"><CheckCircle2 className="mr-2 size-4 text-green-500" /> Ramp & Guiding Block</li>
              <li className="flex items-center text-xs text-slate-500"><CheckCircle2 className="mr-2 size-4 text-green-500" /> Ergonomi Ruang Kerja</li>
            </ul>
          </div>

          {/* Training */}
          <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <FileText className="mb-4 size-12 text-blue-600" />
            <h3 className="mb-2 text-xl font-bold">Pelatihan & Roadmap</h3>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
              Penyusunan roadmap inklusi dan pelatihan bagi tim IT serta HRD untuk budaya kerja inklusif.
            </p>
            <ul className="mb-6 space-y-2">
              <li className="flex items-center text-xs text-slate-500"><CheckCircle2 className="mr-2 size-4 text-green-500" /> Sertifikasi Internal</li>
              <li className="flex items-center text-xs text-slate-500"><CheckCircle2 className="mr-2 size-4 text-green-500" /> Workshop Etika Berinteraksi</li>
            </ul>
          </div>

        </div>
      </section>

      {/* METODOLOGI RISET (Nilai Jual BRIN) */}
      <section className="border-y border-slate-200 bg-slate-100 py-16 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center gap-12 md:flex-row">
            <div className="flex-1">
              <ShieldCheck className="mb-6 size-16 text-blue-600" />
              <h2 className="mb-4 text-3xl font-bold">Metodologi Berbasis Riset</h2>
              <p className="mb-6 text-slate-600 dark:text-slate-400">
                Audit kami dilakukan dengan metodologi yang ketat, dikembangkan melalui penelitian di <strong>BRIN</strong> dan pengalaman lapangan bertahun-tahun sebagai <strong>aktivis disabilitas</strong>. Hasil akhir berupa laporan audit komprehensif (VPAT) yang diakui secara profesional.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <div className="flex size-8 items-center justify-center rounded-full bg-blue-600 font-bold text-white">1</div>
                   <p className="text-sm font-medium">Observasi & Pengumpulan Data</p>
                </div>
                <div className="flex items-center gap-3">
                   <div className="flex size-8 items-center justify-center rounded-full bg-blue-600 font-bold text-white">2</div>
                   <p className="text-sm font-medium">Analisis Gap Standar Global</p>
                </div>
                <div className="flex items-center gap-3">
                   <div className="flex size-8 items-center justify-center rounded-full bg-blue-600 font-bold text-white">3</div>
                   <p className="text-sm font-medium">Rekomendasi Perbaikan & Implementasi</p>
                </div>
              </div>
            </div>
            <div className="flex-1 rounded-2xl border border-blue-100 bg-white p-8 shadow-xl dark:border-blue-900 dark:bg-slate-950">
              <h4 className="mb-4 text-xl font-bold">Siap Menjadi Inklusif?</h4>
              <p className="mb-6 text-sm text-slate-500">Konsultasikan kebutuhan audit organisasi Anda dengan pakar kami.</p>
              <Link 
                href="/kontak" 
                className="inline-flex h-12 w-full items-center justify-center rounded-md bg-blue-600 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700"
              >
                Jadwalkan Konsultasi Gratis <ArrowRight className="ml-2 size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
