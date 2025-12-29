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
              Di Disabilitas.com, privasi Anda adalah prioritas kami. Dokumen ini menjelaskan bagaimana kami mengelola data Anda untuk keperluan karir serta kontribusi strategis bagi riset inklusi nasional.
            </p>

            <h3 className="text-lg font-bold mt-6 mb-2 text-slate-900 dark:text-slate-50">1. Data yang Kami Kumpulkan</h3>
            <p>
              Kami mengumpulkan data identitas, riwayat pendidikan, kompetensi profesional, dan data spesifik disabilitas untuk keperluan pencocokan kerja yang akurat.
            </p>

            <h3 className="text-lg font-bold mt-6 mb-2 text-slate-900 dark:text-slate-50">2. Penggunaan Data Operasional</h3>
            <p>
              Data profil Anda akan ditampilkan kepada Mitra Perusahaan terverifikasi. Kami menjamin data kontak pribadi tidak diperjualbelikan untuk spam/pemasaran pihak ketiga.
            </p>

            {/* UPDATE: KLAUSUL JAIP & BRIN */}
            <h3 className="text-lg font-bold mt-6 mb-2 text-slate-900 dark:text-slate-50">3. Persetujuan Riset & Publikasi Ilmiah (JAIP)</h3>
            <p>
              Disabilitas.com merupakan bagian dari ekosistem riset <strong>Dimaster Group</strong> yang berafiliasi dengan lembaga riset nasional (BRIN). Dengan mendaftar, Anda memberikan persetujuan (Informed Consent) bahwa data Anda dapat diolah secara <strong>Anonim (Tanpa Identitas)</strong> untuk:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Sumber data primer bagi <strong>Journal of Accessibility and Public Policy (JAIP)</strong>.</li>
              <li>Analisis kebijakan publik untuk advokasi Forum ASN Inklusif dan DPP Pertuni.</li>
              <li>Pemetaan potensi talenta disabilitas (Tracer Study) untuk rekomendasi formasi kerja ke Pemerintah.</li>
            </ul>
            
            {/* PERBAIKAN: Menggunakan &quot; pengganti tanda kutip agar deploy sukses */}
            <p className="mt-2 text-sm italic border-l-4 border-blue-500 pl-4 py-1 bg-blue-50 dark:bg-blue-900/20">
              &quot;Data Anda bukan sekadar statistik, melainkan bukti nyata untuk mengubah kebijakan negara menjadi lebih inklusif.&quot;
            </p>

            <h3 className="text-lg font-bold mt-6 mb-2 text-slate-900 dark:text-slate-50">4. Hak Pengguna</h3>
            <p>
              Anda memiliki hak penuh untuk meminta penghapusan akun atau menarik kembali persetujuan penggunaan data riset kapan saja melalui pengaturan akun.
            </p>
            
          </div>
          
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
             <Link href="/kontak" className="text-blue-600 hover:underline text-sm font-medium">
                Hubungi Data Protection Officer (DPO) kami
             </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
