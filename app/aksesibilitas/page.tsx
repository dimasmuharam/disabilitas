import Link from "next/link"
import { CheckCircle, AlertTriangle, ShieldCheck, Search } from "lucide-react"

export default function AksesibilitasPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      <div className="container px-4 md:px-6 max-w-4xl">
        
        <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
          
          <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">Pernyataan Aksesibilitas</h1>
            <p className="text-slate-500 dark:text-slate-400">Terakhir diperbarui: Desember 2025</p>
          </div>

          {/* KOMITMEN RISET */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="text-blue-600 h-6 w-6" /> Komitmen Inklusi Berbasis Riset
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Disabilitas.com bukan sekadar portal lowongan kerja. Platform ini dikembangkan di bawah supervisi riset <strong>Dimas Prasetyo Muharam (Peneliti BRIN)</strong> untuk memastikan hambatan digital bagi penyandang disabilitas dieliminasi secara sistematis. Kami percaya bahwa aksesibilitas adalah hak asasi manusia di era digital.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Search className="text-blue-600 h-6 w-6" /> Standar Kepatuhan & Audit
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Kami menerapkan standar ganda untuk memastikan inklusivitas maksimal:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
              <li><strong>WCAG 2.1 Level AA:</strong> Standar global untuk konten web yang dapat dipersepsikan, dioperasikan, dan dipahami.</li>
              <li><strong>Panduan SPBE (Sistem Pemerintahan Berbasis Elektronik):</strong> Selaras dengan standar aksesibilitas layanan publik di Indonesia.</li>
              <li><strong>Kompatibilitas Assistive Technology:</strong> Optimal untuk Screen Reader (NVDA, JAWS, VoiceOver), Braille Display, dan Switch Access.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold">Fitur Aksesibilitas Aktif</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                <span className="text-sm"><strong>Navigasi Keyboard:</strong> Seluruh elemen dapat diakses tanpa mouse.</span>
              </div>
              <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                <span className="text-sm"><strong>Deskripsi Tekstual:</strong> Alternatif teks (Alt-text) pada semua elemen visual.</span>
              </div>
              <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                <span className="text-sm"><strong>Kontras Adaptif:</strong> Dukungan High Contrast dan Dark Mode.</span>
              </div>
              <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                <span className="text-sm"><strong>Struktur Semantik:</strong> Penggunaan tag HTML5 yang tepat untuk memudahkan navigasi Screen Reader.</span>
              </div>
            </div>
          </div>

          {/* UMPAN BALIK */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-900">
            <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5" /> Kontribusi & Masukan
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
              Aksesibilitas adalah perjalanan berkelanjutan. Jika Anda mengalami kesulitan saat mengakses konten kami, atau ingin berkonsultasi mengenai audit aksesibilitas digital untuk lembaga Anda, silakan hubungi tim ahli kami.
            </p>
            <Link href="/kontak" className="inline-flex h-9 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-medium text-white shadow hover:bg-blue-700 transition-colors">
              Hubungi Spesialis Aksesibilitas
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
