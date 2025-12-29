import Link from "next/link"
import { CheckCircle, AlertTriangle } from "lucide-react"

export default function AksesibilitasPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      <div className="container px-4 md:px-6 max-w-4xl">
        
        <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
          
          <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">Pernyataan Aksesibilitas</h1>
            <p className="text-slate-500 dark:text-slate-400">Terakhir diperbarui: Desember 2025</p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold">Komitmen Kami</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Disabilitas.com berkomitmen untuk memastikan bahwa situs web ini dapat diakses oleh semua orang, terlepas dari kemampuan teknologi atau fisik. Kami terus berupaya meningkatkan pengalaman pengguna bagi semua orang, dan menerapkan standar aksesibilitas yang relevan.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold">Standar Kepatuhan</h2>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              Pedoman Aksesibilitas Konten Web (WCAG) 2.1 mendefinisikan persyaratan bagi desainer dan pengembang untuk meningkatkan aksesibilitas bagi penyandang disabilitas. Situs Disabilitas.com berupaya untuk mematuhi:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
              <li><strong>WCAG 2.1 Level AA</strong> (sebagian besar fitur)</li>
              <li>Kompatibilitas penuh dengan pembaca layar (NVDA, JAWS, VoiceOver, TalkBack)</li>
              <li>Navigasi keyboard penuh (Tanpa mouse)</li>
              <li>Rasio kontras warna yang tinggi untuk Low Vision</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold">Fitur Aksesibilitas di Situs Ini</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                <span className="text-sm">Skip to Content (Link Lompat ke Konten)</span>
              </div>
              <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                <span className="text-sm">Label ARIA pada semua tombol & form</span>
              </div>
              <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                <span className="text-sm">Mode Gelap (Dark Mode) bawaan</span>
              </div>
              <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                <span className="text-sm">Pengaturan Ukuran Font (Font Toggle)</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-lg border border-yellow-200 dark:border-yellow-900">
            <h3 className="text-lg font-bold text-yellow-800 dark:text-yellow-400 flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5" /> Umpan Balik & Kontak
            </h3>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
              Kami menyadari mungkin masih ada bagian dari website ini yang belum sempurna. Jika Anda menemukan hambatan aksesibilitas, mohon beri tahu kami agar segera diperbaiki.
            </p>
            <Link href="/kontak" className="inline-flex h-9 items-center justify-center rounded-md bg-yellow-600 px-4 text-sm font-medium text-white shadow hover:bg-yellow-700">
              Laporkan Masalah Aksesibilitas
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
