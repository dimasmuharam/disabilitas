import Link from "next/link"

export default function PrivasiPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      <div className="container px-4 md:px-6 max-w-4xl">
        <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          
          <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">Kebijakan Privasi & Data Riset</h1>
            <p className="text-slate-500 dark:text-slate-400">Pembaruan Terakhir: 29 Desember 2025</p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
            <p>
              Di Disabilitas.com, privasi Anda adalah prioritas kami. Dokumen ini menjelaskan bagaimana kami mengelola data Anda, tidak hanya untuk keperluan karir, tetapi juga untuk kemajuan riset inklusi di Indonesia.
            </p>

            {/* BAB 1-4 SAMA SEPERTI SEBELUMNYA */}
            <h3 className="text-lg font-bold mt-6 mb-2 text-slate-900 dark:text-slate-50">1. Data yang Kami Kumpulkan</h3>
            <p>
              Kami mengumpulkan data pribadi (Nama, Kontak), data profesional (CV, Skill), dan data disabilitas (Jenis Hambatan, Alat Bantu) untuk keperluan pencocokan kerja.
            </p>

            <h3 className="text-lg font-bold mt-6 mb-2 text-slate-900 dark:text-slate-50">2. Penggunaan Data Operasional</h3>
            <p>
              Data Anda akan ditampilkan kepada Perusahaan Mitra yang terverifikasi untuk tujuan rekrutmen. Kami tidak menjual data kontak Anda ke pihak ketiga untuk tujuan pemasaran (spam).
            </p>

            {/* INI TAMBAHAN PENTING UNTUK RISET */}
            <h3 className="text-lg font-bold mt-6 mb-2 text-slate-900 dark:text-slate-50">3. Persetujuan Riset & Pengembangan (Informed Consent)</h3>
            <p>
              Sebagai platform yang berafiliasi dengan riset pendidikan dan kebijakan nasional, kami dapat menggunakan data Anda secara <strong>Anonim (Tanpa Nama/Identitas)</strong> untuk:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Studi statistik mengenai penyerapan tenaga kerja disabilitas.</li>
              <li>Analisis kebutuhan skill (Tracer Study) untuk kurikulum pelatihan.</li>
              <li>Publikasi artikel ilmiah dan rekomendasi kebijakan kepada Pemerintah (BRIN/Kementerian).</li>
            </ul>
            <p className="mt-2 font-medium">
              Dengan mendaftar, Anda menyetujui kontribusi data anonim ini demi perbaikan ekosistem disabilitas di masa depan.
            </p>

            <h3 className="text-lg font-bold mt-6 mb-2 text-slate-900 dark:text-slate-50">4. Hak Anda (Kendali Penuh)</h3>
            <p>
              Anda berhak meminta penghapusan akun atau penarikan data (Right to be Forgotten) kapan saja melalui pengaturan akun atau menghubungi tim kami.
            </p>
            
          </div>
          
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
             <Link href="/kontak" className="text-blue-600 hover:underline text-sm font-medium">
                Ada pertanyaan tentang penggunaan data? Hubungi Data Officer kami.
             </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
