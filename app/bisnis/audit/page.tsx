import Link from "next/link"
import { ShieldCheck, Monitor, Building, FileText, CheckCircle2, ArrowRight } from "lucide-react"

export default function AuditAksesibilitasPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      
      {/* HERO SECTION */}
      <section className="w-full py-12 md:py-24 bg-blue-600 text-white">
        <div className="container px-4 md:px-6 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl mb-4">Layanan Audit Aksesibilitas</h1>
          <p className="mx-auto max-w-[700px] text-blue-100 md:text-xl">
            Transformasi ekosistem kerja Anda menjadi inklusif melalui audit berbasis riset dan standar internasional (WCAG 2.1).
          </p>
        </div>
      </section>

      {/* LAYANAN UTAMA */}
      <section className="container px-4 md:px-6 py-16">
        <div className="grid gap-8 md:grid-cols-3">
          
          {/* Audit Digital */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <Monitor className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Audit Digital (SPBE)</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
              Evaluasi website dan aplikasi mobile berdasarkan standar WCAG 2.1 Level AA untuk kepatuhan inklusi digital.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center text-xs text-slate-500"><CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> Pengujian Screen Reader</li>
              <li className="flex items-center text-xs text-slate-500"><CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> Analisis Kontras & Navigasi</li>
            </ul>
          </div>

          {/* Audit Fisik */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <Building className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Audit Lingkungan Kerja</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
              Penilaian fasilitas fisik kantor untuk memastikan aksesibilitas bagi pengguna kursi roda dan disabilitas sensorik.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center text-xs text-slate-500"><CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> Ramp & Guiding Block</li>
              <li className="flex items-center text-xs text-slate-500"><CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> Ergonomi Ruang Kerja</li>
            </ul>
          </div>

          {/* Training */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <FileText className="h-12 w-12 text-blue-600 mb-4" />
            <h3 className="text-xl font-bold mb-2">Pelatihan & Roadmap</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
              Penyusunan roadmap inklusi dan pelatihan bagi tim IT serta HRD untuk budaya kerja inklusif.
            </p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center text-xs text-slate-500"><CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> Sertifikasi Internal</li>
              <li className="flex items-center text-xs text-slate-500"><CheckCircle2 className="h-4 w-4 mr-2 text-green-500" /> Workshop Etika Berinteraksi</li>
            </ul>
          </div>

        </div>
      </section>

      {/* METODOLOGI RISET (Nilai Jual BRIN) */}
      <section className="bg-slate-100 dark:bg-slate-900/50 py-16 border-y border-slate-200 dark:border-slate-800">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1">
              <ShieldCheck className="h-16 w-16 text-blue-600 mb-6" />
              <h2 className="text-3xl font-bold mb-4">Metodologi Berbasis Riset</h2>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Audit kami dilakukan dengan metodologi yang ketat, dikembangkan melalui penelitian di <strong>BRIN</strong> dan pengalaman lapangan bertahun-tahun sebagai <strong>aktivis disabilitas</strong>. Hasil akhir berupa laporan audit komprehensif (VPAT) yang diakui secara profesional.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                   <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
                   <p className="text-sm font-medium">Observasi & Pengumpulan Data</p>
                </div>
                <div className="flex items-center gap-3">
                   <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">2</div>
                   <p className="text-sm font-medium">Analisis Gap Standar Global</p>
                </div>
                <div className="flex items-center gap-3">
                   <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">3</div>
                   <p className="text-sm font-medium">Rekomendasi Perbaikan & Implementasi</p>
                </div>
              </div>
            </div>
            <div className="flex-1 bg-white dark:bg-slate-950 p-8 rounded-2xl shadow-xl border border-blue-100 dark:border-blue-900">
              <h4 className="text-xl font-bold mb-4">Siap Menjadi Inklusif?</h4>
              <p className="text-sm text-slate-500 mb-6">Konsultasikan kebutuhan audit organisasi Anda dengan pakar kami.</p>
              <Link 
                href="/kontak" 
                className="w-full inline-flex h-12 items-center justify-center rounded-md bg-blue-600 px-8 text-sm font-medium text-white shadow hover:bg-blue-700 transition-colors"
              >
                Jadwalkan Konsultasi Gratis <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
