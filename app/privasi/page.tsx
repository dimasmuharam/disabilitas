import Link from "next/link"
import { Shield, Lock, Eye, FileText } from "lucide-react"

export default function PrivasiPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      <div className="container px-4 md:px-6 max-w-4xl">
        
        <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
          
          <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">Kebijakan Privasi</h1>
            <p className="text-slate-500 dark:text-slate-400">Terakhir diperbarui: Desember 2025</p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none">
            <p className="leading-relaxed text-slate-700 dark:text-slate-300">
              PT Dimaster Education Berprestasi (pengelola platform <strong>Disabilitas.com</strong>) sangat menghargai privasi Anda. Dokumen ini menjelaskan bagaimana kami mengumpulkan, menggunakan, dan melindungi data pribadi Anda sesuai dengan Undang-Undang Perlindungan Data Pribadi yang berlaku di Indonesia.
            </p>

            <div className="grid md:grid-cols-2 gap-6 my-8">
              <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-100 dark:border-slate-800">
                <Shield className="h-6 w-6 text-blue-600 mb-2" />
                <h3 className="font-bold text-slate-900 dark:text-slate-50">Data Terenkripsi</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Seluruh data sensitif disimpan dengan standar enkripsi industri perbankan.</p>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
                <Lock className="h-6 w-6 text-green-600 mb-2" />
                <h3 className="font-bold text-slate-900 dark:text-slate-50">Kendali Penuh</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Anda memiliki hak penuh untuk meminta penghapusan data kapan saja.</p>
              </div>
            </div>

            <h3 className="text-xl font-bold mt-8 mb-4 text-slate-900 dark:text-slate-50">1. Data yang Kami Kumpulkan</h3>
            <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
              <li><strong>Informasi Identitas:</strong> Nama lengkap, NIK (untuk verifikasi disabilitas), alamat email, dan nomor telepon.</li>
              <li><strong>Data Profesional:</strong> Riwayat pendidikan, pengalaman kerja, CV, dan portofolio.</li>
              <li><strong>Data Kesehatan (Sukarela):</strong> Jenis disabilitas dan kebutuhan alat bantu kerja (akomodasi) yang diperlukan. Data ini bersifat rahasia dan hanya dibagikan kepada pemberi kerja atas izin Anda.</li>
            </ul>

            <h3 className="text-xl font-bold mt-8 mb-4 text-slate-900 dark:text-slate-50">2. Penggunaan Data</h3>
            <p className="text-slate-700 dark:text-slate-300">Data Anda digunakan semata-mata untuk:</p>
            <ul className="list-disc pl-6 space-y-2 text-slate-700 dark:text-slate-300">
              <li>Menghubungkan Anda dengan lowongan pekerjaan yang relevan.</li>
              <li>Memproses lamaran kerja ke perusahaan mitra.</li>
              <li>Keperluan pelaporan statistik agregat (tanpa identitas) kepada pemerintah terkait penyerapan tenaga kerja disabilitas.</li>
            </ul>

            <h3 className="text-xl font-bold mt-8 mb-4 text-slate-900 dark:text-slate-50">3. Berbagi Data dengan Pihak Ketiga</h3>
            <p className="text-slate-700 dark:text-slate-300">
              Kami tidak akan pernah menjual data Anda. Kami hanya membagikan data Anda kepada Perusahaan Pemberi Kerja saat Anda secara aktif melamar pekerjaan di perusahaan tersebut.
            </p>

            <h3 className="text-xl font-bold mt-8 mb-4 text-slate-900 dark:text-slate-50">4. Hak Anda</h3>
            <p className="text-slate-700 dark:text-slate-300">
              Anda berhak untuk mengakses, mengoreksi, atau menghapus data pribadi Anda dari sistem kami. Silakan hubungi tim dukungan kami jika Anda ingin menggunakan hak ini.
            </p>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
             <p className="text-sm text-slate-500">
               Punya pertanyaan tentang privasi?
             </p>
             <Link href="/kontak" className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-medium shadow-sm transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800">
               Hubungi Data Protection Officer (DPO)
             </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
