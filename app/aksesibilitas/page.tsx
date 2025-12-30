import Link from "next/link"
import { CheckCircle, AlertTriangle, ShieldCheck, Search, Users } from "lucide-react"

export default function AksesibilitasPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      <div className="container px-4 md:px-6 max-w-4xl">
        
        <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
          
          <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">Pernyataan Aksesibilitas</h1>
            <p className="text-slate-500 dark:text-slate-400">Terakhir diperbarui: Desember 2025</p>
          </div>

          {/* TONJOLKAN: Peneliti + Praktisi Disabilitas */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="text-blue-600 h-6 w-6" /> Standar Inklusi dari Perspektif Nyata
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Disabilitas.com dikembangkan di bawah supervisi teknis <strong>Dimas Prasetyo Muharam</strong>, seorang peneliti pendidikan inklusif yang juga merupakan praktisi tunanetra. Kami percaya bahwa aksesibilitas sejati hanya bisa dibangun ketika metodologi riset bertemu dengan pengalaman hidup nyata sebagai pengguna teknologi asistif.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Search className="text-blue-600 h-6 w-6" /> Standar Kepatuhan & Audit
            </h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Kami menggabungkan standar teknis global dengan kebutuhan praktis di lapangan untuk memastikan inklusivitas yang fungsional:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
              <li><strong>WCAG 2.1 Level AA:</strong> Kepatuhan teknis agar konten dapat dipersepsikan, dioperasikan, dan dipahami secara internasional.</li>
              <li><strong>User-Experience Driven:</strong> Setiap fitur diuji langsung oleh tim penyandang disabilitas menggunakan Screen Reader dan perangkat asistif lainnya.</li>
              <li><strong>Kesesuaian Regulasi Nasional:</strong> Membantu organisasi selaras dengan standar aksesibilitas layanan publik di Indonesia (SPBE).</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold">Fitur Aksesibilitas Aktif</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                <span className="text-sm"><strong>Aksesibilitas Navigasi:</strong> Penggunaan penuh via keyboard dan kontrol hirarki yang logis.</span>
              </div>
              <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                <span className="text-sm"><strong>Kontras & Visual:</strong> Rasio warna tinggi untuk kemudahan pembacaan low-vision.</span>
              </div>
              <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                <span className="text-sm"><strong>Integrasi ARIA:</strong> Label deskriptif untuk elemen interaktif bagi pembaca layar.</span>
              </div>
              <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                <span className="text-sm"><strong>Struktur Semantik:</strong> Tag HTML yang tepat guna memudahkan eksplorasi data.</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg border border-blue-200 dark:border-blue-900">
            <h3 className="text-lg font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2 mb-2">
              <Users className="h-5 w-5" /> Kolaborasi Berkelanjutan
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
              Sebagai platform yang dibangun oleh dan untuk penyandang disabilitas, kami sangat menghargai masukan Anda. Jika Anda menemukan hambatan aksesibilitas, tim peneliti kami siap melakukan perbaikan secara cepat.
            </p>
            <Link href="/kontak" className="inline-flex h-9 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-medium text-white shadow hover:bg-blue-700 transition-colors">
              Laporkan Masalah Aksesibilitas
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
