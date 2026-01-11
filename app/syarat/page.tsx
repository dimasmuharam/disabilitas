import Link from "next/link"

export default function SyaratPage() {
  return (
    <div className="min-h-screen bg-slate-50 py-12 dark:bg-slate-950">
      <div className="container max-w-4xl px-4 md:px-6">
        <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:p-12">
          
          <div className="border-b border-slate-200 pb-6 dark:border-slate-800">
            <h1 className="mb-2 text-3xl font-bold text-slate-900 dark:text-slate-50">Syarat & Ketentuan</h1>
            <p className="text-slate-500 dark:text-slate-400">Efektif per: 1 Januari 2025</p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
            <p>
              Selamat datang di Disabilitas.com. Dengan mengakses dan menggunakan situs web ini, Anda setuju untuk terikat oleh syarat dan ketentuan berikut.
            </p>

            <h3 className="mb-2 mt-6 text-lg font-bold text-slate-900 dark:text-slate-50">1. Akun Pengguna</h3>
            <p>
              Anda bertanggung jawab untuk menjaga kerahasiaan akun dan kata sandi Anda. PT Dimaster Education Berprestasi tidak bertanggung jawab atas kerugian yang timbul akibat kelalaian Anda dalam menjaga keamanan akun.
            </p>

            <h3 className="mb-2 mt-6 text-lg font-bold text-slate-900 dark:text-slate-50">2. Keakuratan Data</h3>
            <p>
              Bagi pelamar kerja (Talenta), Anda menjamin bahwa semua data diri, riwayat pendidikan, dan informasi disabilitas yang Anda berikan adalah benar dan akurat. Pemalsuan data dapat mengakibatkan pemblokiran akun permanen.
            </p>

            <h3 className="mb-2 mt-6 text-lg font-bold text-slate-900 dark:text-slate-50">3. Larangan Penggunaan</h3>
            <ul className="list-disc space-y-1 pl-5">
              <li>Dilarang memposting lowongan kerja palsu atau penipuan.</li>
              <li>Dilarang menggunakan bahasa yang mendiskriminasi, menghina, atau mengandung SARA.</li>
              <li>Dilarang melakukan scraping data secara otomatis tanpa izin tertulis.</li>
            </ul>

            <h3 className="mb-2 mt-6 text-lg font-bold text-slate-900 dark:text-slate-50">4. Penyangkalan (Disclaimer)</h3>
            <p>
              Disabilitas.com hanya bertindak sebagai perantara (platform). Kami tidak menjamin penempatan kerja bagi setiap pelamar, namun kami berusaha sebaik mungkin menghubungkan Anda dengan peluang yang relevan.
            </p>

            <h3 className="mb-2 mt-6 text-lg font-bold text-slate-900 dark:text-slate-50">5. Perubahan Ketentuan</h3>
            <p>
              Kami berhak mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan akan diberitahukan melalui situs web ini.
            </p>
          </div>
          
          <div className="border-t border-slate-200 pt-6 dark:border-slate-800">
             <Link href="/kontak" className="text-sm font-medium text-blue-600 hover:underline">
                Punya pertanyaan hukum? Hubungi Legal Kami.
             </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
