import Link from "next/link"
import { CheckCircle, AlertTriangle, ShieldCheck, Search, Users } from "lucide-react"

export default function AksesibilitasPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 dark:bg-slate-950">
      <div className="container max-w-4xl px-4 md:px-6">
        
        <div className="space-y-8 rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-12">
          
          <div className="border-b border-slate-200 pb-6 dark:border-slate-800">
            <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-slate-50">Pernyataan Aksesibilitas</h1>
            <p className="text-slate-500 dark:text-slate-400">Terakhir diperbarui: Desember 2025</p>
          </div>

          {/* TONJOLKAN: Peneliti + Praktisi Disabilitas */}
          <div className="space-y-4">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <ShieldCheck className="size-6 text-blue-600" /> Standar Inklusi dari Perspektif Nyata
            </h2>
            <p className="leading-relaxed text-slate-700 dark:text-slate-300">
              Disabilitas.com dikembangkan di bawah supervisi teknis <strong>Dimas Prasetyo Muharam</strong>, seorang peneliti pendidikan inklusif yang juga merupakan praktisi tunanetra. Kami percaya bahwa aksesibilitas sejati hanya bisa dibangun ketika metodologi riset bertemu dengan pengalaman hidup nyata sebagai pengguna teknologi asistif.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="flex items-center gap-2 text-xl font-bold">
              <Search className="size-6 text-blue-600" /> Standar Kepatuhan & Audit
            </h2>
            <p className="leading-relaxed text-slate-700 dark:text-slate-300">
              Kami menggabungkan standar teknis global dengan kebutuhan praktis di lapangan untuk memastikan inklusivitas yang fungsional:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-slate-700 dark:text-slate-300">
              <li><strong>WCAG 2.1 Level AA:</strong> Kepatuhan teknis agar konten dapat dipersepsikan, dioperasikan, dan dipahami secara internasional.</li>
              <li><strong>User-Experience Driven:</strong> Setiap fitur diuji langsung oleh tim penyandang disabilitas menggunakan Screen Reader dan perangkat asistif lainnya.</li>
              <li><strong>Kesesuaian Regulasi Nasional:</strong> Membantu organisasi selaras dengan standar aksesibilitas layanan publik di Indonesia (SPBE).</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold">Fitur Aksesibilitas Aktif</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <CheckCircle className="mt-1 size-5 text-green-600" />
                <span className="text-sm"><strong>Aksesibilitas Navigasi:</strong> Penggunaan penuh via keyboard dan kontrol hirarki yang logis.</span>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <CheckCircle className="mt-1 size-5 text-green-600" />
                <span className="text-sm"><strong>Kontras & Visual:</strong> Rasio warna tinggi untuk kemudahan pembacaan low-vision.</span>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <CheckCircle className="mt-1 size-5 text-green-600" />
                <span className="text-sm"><strong>Integrasi ARIA:</strong> Label deskriptif untuk elemen interaktif bagi pembaca layar.</span>
              </div>
              <div className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <CheckCircle className="mt-1 size-5 text-green-600" />
                <span className="text-sm"><strong>Struktur Semantik:</strong> Tag HTML yang tepat guna memudahkan eksplorasi data.</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-900 dark:bg-blue-900/20">
            <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-blue-800 dark:text-blue-300">
              <Users className="size-5" /> Kolaborasi Berkelanjutan
            </h3>
            <p className="mb-4 text-sm text-blue-700 dark:text-blue-300">
              Sebagai platform yang dibangun oleh dan untuk penyandang disabilitas, kami sangat menghargai masukan Anda. Jika Anda menemukan hambatan aksesibilitas, tim peneliti kami siap melakukan perbaikan secara cepat.
            </p>
            <Link href="/kontak" className="inline-flex h-9 items-center justify-center rounded-md bg-blue-600 px-4 text-sm font-medium text-white shadow transition-colors hover:bg-blue-700">
              Laporkan Masalah Aksesibilitas
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
