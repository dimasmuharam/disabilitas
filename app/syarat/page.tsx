import Link from "next/link"

export default function SyaratPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12">
      <div className="container px-4 md:px-6 max-w-4xl">
        <div className="bg-white dark:bg-slate-900 p-8 md:p-12 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          
          <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 mb-2">Syarat & Ketentuan</h1>
            <p className="text-slate-500 dark:text-slate-400">Efektif per: 1 Januari 2025</p>
          </div>

          <div className="prose prose-slate dark:prose-invert max-w-none text-slate-700 dark:text-slate-300">
            <p>
              Selamat datang di Disabilitas.com. Dengan mengakses dan menggunakan situs web ini, Anda setuju untuk terikat oleh syarat dan ketentuan berikut.
            </p>

            <h3 className="text-lg font-bold mt-6 mb-2 text-slate-900 dark:text-slate-50">1. Akun Pengguna</h3>
            <p>
              Anda bertanggung jawab untuk menjaga kerahasiaan akun dan kata sandi Anda. PT Dimaster Education Berprestasi tidak bertanggung jawab atas kerugian yang timbul akibat kelalaian Anda dalam menjaga keamanan akun.
            </p>

            <h3 className="text-lg font-bold mt-6 mb-2 text-slate-900 dark:text-slate-50">2. Keakuratan Data</h3>
            <p>
              Bagi pelamar kerja (Talenta), Anda menjamin bahwa semua data diri, riwayat pendidikan, dan informasi disabilitas yang Anda berikan adalah benar dan akurat. Pemalsuan data dapat mengakibatkan pemblokiran akun permanen.
            </p>

            <h3 className="text-lg font-bold mt-6 mb-2 text-slate-900 dark:text-slate-50">3. Larangan Penggunaan</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Dilarang memposting lowongan kerja palsu atau penipuan.</li>
              <li>Dilarang menggunakan bahasa yang mendiskriminasi, menghina, atau mengandung SARA.</li>
              <li>Dilarang melakukan scraping data secara otomatis tanpa izin tertulis.</li>
            </ul>

            <h3 className="text-lg font-bold mt-6 mb-2 text-slate-900 dark:text-slate-50">4. Penyangkalan (Disclaimer)</h3>
            <p>
              Disabilitas.com hanya bertindak sebagai perantara (platform). Kami tidak menjamin penempatan kerja bagi setiap pelamar, namun kami berusaha sebaik mungkin menghubungkan Anda dengan peluang yang relevan.
            </p>

            <h3 className="text-lg font-bold mt-6 mb-2 text-slate-900 dark:text-slate-50">5. Perubahan Ketentuan</h3>
            <p>
              Kami berhak mengubah syarat dan ketentuan ini sewaktu-waktu. Perubahan akan diberitahukan melalui situs web ini.
            </p>
          </div>
          
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
             <Link href="/kontak" className="text-blue-600 hover:underline text-sm font-medium">
                Punya pertanyaan hukum? Hubungi Legal Kami.
             </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
