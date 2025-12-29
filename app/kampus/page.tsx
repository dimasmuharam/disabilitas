import Link from "next/link"
import { GraduationCap, BookOpen, Users, BarChart, ArrowRight, CheckCircle, Building } from "lucide-react"

export default function KampusPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      
      {/* HERO SECTION */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-green-900 text-slate-50">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-green-800 px-3 py-1 text-sm font-semibold text-green-100">
                Untuk Kampus & Lembaga Pelatihan
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Digitalisasi Unit Layanan & Alumni Disabilitas
              </h1>
              <p className="text-slate-200 md:text-xl">
                Solusi manajemen data untuk Universitas dan Balai Pelatihan (BLK/Komdigi). Pantau karir alumni pelatihan Anda agar tidak sekadar lulus, tapi terserap kerja.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href="/mitra"
                  className="inline-flex h-12 items-center justify-center rounded-md bg-white px-8 text-sm font-medium text-green-900 shadow transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  Daftarkan Lembaga
                </Link>
                <Link
                  href="#fitur"
                  className="inline-flex h-12 items-center justify-center rounded-md border border-green-700 bg-transparent px-8 text-sm font-medium text-slate-100 shadow-sm transition-colors hover:bg-green-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  Pelajari Fitur
                </Link>
              </div>
            </div>
            {/* Visual Ilustrasi */}
            <div className="mx-auto w-full max-w-[500px] aspect-video bg-green-800/50 rounded-xl flex items-center justify-center border border-green-700">
              <GraduationCap className="h-24 w-24 text-green-200/50" />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION FITUR */}
      <section id="fitur" className="w-full py-12 md:py-24 bg-white dark:bg-slate-900">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tighter text-slate-900 dark:text-slate-50">Mengapa Bergabung?</h2>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Solusi manajemen inklusi dari Hulu (Pendidikan) ke Hilir (Industri).</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            
            {/* FITUR 1 */}
            <div className="flex flex-col p-6 bg-slate-50 dark:bg-slate-950/50 rounded-lg border border-slate-200 dark:border-slate-800">
              <BookOpen className="h-10 w-10 text-green-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Database Talent Pool</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4 flex-1">
                Kumpulkan data peserta pelatihan atau mahasiswa disabilitas dalam satu dashboard yang rapi dan standar industri.
              </p>
            </div>

            {/* FITUR 2 */}
            <div className="flex flex-col p-6 bg-slate-50 dark:bg-slate-950/50 rounded-lg border border-slate-200 dark:border-slate-800">
              <BarChart className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Laporan Penyerapan (Tracer)</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4 flex-1">
                Bukti nyata kinerja lembaga Anda. Pantau berapa persen alumni yang sudah mendapat pekerjaan setelah lulus pelatihan.
              </p>
            </div>

            {/* FITUR 3 */}
            <div className="flex flex-col p-6 bg-slate-50 dark:bg-slate-950/50 rounded-lg border border-slate-200 dark:border-slate-800">
              <Users className="h-10 w-10 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold mb-2">Koneksi Industri Langsung</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4 flex-1">
                Jangan biarkan alumni bingung cari kerja. Hubungkan profil mereka langsung ke dashboard HRD mitra perusahaan kami.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* TARGET MITRA */}
      <section className="w-full py-12 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
         <div className="container px-4 md:px-6">
            <h3 className="text-xl font-bold mb-8 text-center">Siapa yang cocok menggunakan fitur ini?</h3>
            <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
               <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full"><GraduationCap className="h-6 w-6 text-blue-600 dark:text-blue-300"/></div>
                  <div>
                     <h4 className="font-bold">Perguruan Tinggi (Kampus)</h4>
                     <p className="text-sm text-slate-500">Unit Layanan Disabilitas (ULD) & Pusat Karir.</p>
                  </div>
               </div>
               <div className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full"><Building className="h-6 w-6 text-orange-600 dark:text-orange-300"/></div>
                  <div>
                     <h4 className="font-bold">Lembaga Pelatihan (BLK/Bootcamp)</h4>
                     <p className="text-sm text-slate-500">Program pemerintah (DTS Komdigi, Prakerja) & Swasta.</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* CTA JOIN */}
      <section className="w-full py-12 md:py-24 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="container px-4 md:px-6 text-center">
          <div className="max-w-2xl mx-auto space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter">Tingkatkan Valuasi Lembaga Anda</h2>
              <p className="text-slate-600 dark:text-slate-400">
                Lembaga pendidikan dinilai dari kesuksesan alumninya. Mari pastikan alumni disabilitas Anda mendapatkan kesempatan yang setara.
              </p>
              <Link 
                href="/mitra"
                className="inline-flex h-12 items-center justify-center rounded-md bg-green-900 px-8 text-sm font-medium text-white shadow hover:bg-green-800 transition-colors"
              >
                Buat Akun Lembaga Gratis
              </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
