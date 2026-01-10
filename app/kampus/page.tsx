import Link from "next/link"
import { GraduationCap, BookOpen, Users, BarChart, ArrowRight, CheckCircle, Building } from "lucide-react"

export default function KampusPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
      
      {/* HERO SECTION */}
      <section className="w-full bg-green-900 py-12 text-slate-50 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
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
              <div className="flex flex-col gap-4 pt-4 sm:flex-row">
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
            <div className="mx-auto flex aspect-video w-full max-w-[500px] items-center justify-center rounded-xl border border-green-700 bg-green-800/50">
              <GraduationCap className="size-24 text-green-200/50" />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION FITUR */}
      <section id="fitur" className="w-full bg-white py-12 dark:bg-slate-900 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tighter text-slate-900 dark:text-slate-50">Mengapa Bergabung?</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-400">Solusi manajemen inklusi dari Hulu (Pendidikan) ke Hilir (Industri).</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            
            {/* FITUR 1 */}
            <div className="flex flex-col rounded-lg border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950/50">
              <BookOpen className="mb-4 size-10 text-green-600" />
              <h3 className="mb-2 text-xl font-bold">Database Talent Pool</h3>
              <p className="mb-4 flex-1 text-slate-600 dark:text-slate-400">
                Kumpulkan data peserta pelatihan atau mahasiswa disabilitas dalam satu dashboard yang rapi dan standar industri.
              </p>
            </div>

            {/* FITUR 2 */}
            <div className="flex flex-col rounded-lg border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950/50">
              <BarChart className="mb-4 size-10 text-blue-600" />
              <h3 className="mb-2 text-xl font-bold">Laporan Penyerapan (Tracer)</h3>
              <p className="mb-4 flex-1 text-slate-600 dark:text-slate-400">
                Bukti nyata kinerja lembaga Anda. Pantau berapa persen alumni yang sudah mendapat pekerjaan setelah lulus pelatihan.
              </p>
            </div>

            {/* FITUR 3 */}
            <div className="flex flex-col rounded-lg border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950/50">
              <Users className="mb-4 size-10 text-purple-600" />
              <h3 className="mb-2 text-xl font-bold">Koneksi Industri Langsung</h3>
              <p className="mb-4 flex-1 text-slate-600 dark:text-slate-400">
                Jangan biarkan alumni bingung cari kerja. Hubungkan profil mereka langsung ke dashboard HRD mitra perusahaan kami.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* TARGET MITRA */}
      <section className="w-full border-t border-slate-200 bg-slate-50 py-12 dark:border-slate-800 dark:bg-slate-950">
         <div className="container px-4 md:px-6">
            <h3 className="mb-8 text-center text-xl font-bold">Siapa yang cocok menggunakan fitur ini?</h3>
            <div className="mx-auto grid max-w-4xl gap-4 md:grid-cols-2">
               <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900"><GraduationCap className="size-6 text-blue-600 dark:text-blue-300"/></div>
                  <div>
                     <h4 className="font-bold">Perguruan Tinggi (Kampus)</h4>
                     <p className="text-sm text-slate-500">Unit Layanan Disabilitas (ULD) & Pusat Karir.</p>
                  </div>
               </div>
               <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                  <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900"><Building className="size-6 text-orange-600 dark:text-orange-300"/></div>
                  <div>
                     <h4 className="font-bold">Lembaga Pelatihan (BLK/Bootcamp)</h4>
                     <p className="text-sm text-slate-500">Program pemerintah (DTS Komdigi, Prakerja) & Swasta.</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* CTA JOIN */}
      <section className="w-full border-t border-slate-200 bg-white py-12 dark:border-slate-800 dark:bg-slate-900 md:py-24">
        <div className="container px-4 text-center md:px-6">
          <div className="mx-auto max-w-2xl space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter">Tingkatkan Valuasi Lembaga Anda</h2>
              <p className="text-slate-600 dark:text-slate-400">
                Lembaga pendidikan dinilai dari kesuksesan alumninya. Mari pastikan alumni disabilitas Anda mendapatkan kesempatan yang setara.
              </p>
              <Link 
                href="/mitra"
                className="inline-flex h-12 items-center justify-center rounded-md bg-green-900 px-8 text-sm font-medium text-white shadow transition-colors hover:bg-green-800"
              >
                Buat Akun Lembaga Gratis
              </Link>
          </div>
        </div>
      </section>

    </div>
  )
}
