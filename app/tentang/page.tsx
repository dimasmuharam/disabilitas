import Link from "next/link"
import { Users, Target, Heart, Award, ArrowRight } from "lucide-react"

export default function TentangPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      
      {/* HERO SECTION */}
      <section className="w-full py-12 md:py-24 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="container px-4 md:px-6 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl text-slate-900 dark:text-slate-50 mb-4">
            Menembus Batas, <br className="hidden sm:inline" />Menciptakan Peluang.
          </h1>
          <p className="mx-auto max-w-[700px] text-slate-600 md:text-xl dark:text-slate-400">
            Disabilitas.com adalah jembatan digital yang menghubungkan jutaan talenta disabilitas dengan masa depan karir yang setara.
          </p>
        </div>
      </section>

      {/* STORY SECTION */}
      <section className="container px-4 md:px-6 py-12 md:py-24">
        <div className="grid gap-10 lg:grid-cols-2 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter text-slate-900 dark:text-slate-50">Cerita Kami</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Berawal dari kegelisahan akan sulitnya akses kerja bagi penyandang disabilitas di Indonesia, <strong>Dimas Prasetyo Muharam</strong>, seorang aktivis tunanetra dan pendiri Forum ASN Inklusif, memimpikan sebuah ekosistem di mana hambatan fisik tidak lagi menjadi penghalang prestasi.
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Disabilitas.com lahir bukan sekadar sebagai situs lowongan kerja, melainkan sebagai partner transformasi bagi perusahaan dan pemerintah untuk mewujudkan lingkungan yang 100% inklusif.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
              <Target className="h-10 w-10 text-blue-600 mb-2" />
              <h3 className="font-bold text-lg">Visi</h3>
              <p className="text-sm text-slate-500">Mewujudkan Indonesia Inklusif 2045 di mana setiap talenta dihargai berdasarkan kompetensi.</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
              <Heart className="h-10 w-10 text-red-600 mb-2" />
              <h3 className="font-bold text-lg">Misi</h3>
              <p className="text-sm text-slate-500">Menyediakan teknologi aksesibel dan edukasi untuk menjembatani gap antara talenta dan industri.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOUNDER SECTION */}
      <section className="w-full py-12 bg-slate-100 dark:bg-slate-900/50">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-2xl font-bold mb-8">Dibalik Layar</h2>
          <div className="flex flex-col items-center justify-center max-w-2xl mx-auto p-6 bg-white dark:bg-slate-950 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
            <div className="h-24 w-24 rounded-full bg-slate-200 dark:bg-slate-800 mb-4 flex items-center justify-center">
              <Users className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold">Dimas Prasetyo Muharam</h3>
            <p className="text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">Founder & CEO</p>
            {/* PERBAIKAN DI SINI: Menggunakan kode &ldquo; dan &rdquo; pengganti tanda kutip */}
            <p className="text-slate-600 dark:text-slate-400 text-sm italic">
              &ldquo;Keterbatasan penglihatan mengajarkan saya untuk melihat peluang dengan hati dan pikiran. Disabilitas.com adalah wujud nyata dari visi tersebut.&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full py-12 md:py-24 text-center">
        <h2 className="text-2xl font-bold mb-4">Bergabung dengan Perubahan</h2>
        <div className="flex justify-center gap-4">
          <Link href="/lowongan" className="text-blue-600 hover:underline flex items-center font-medium">
             Lihat Lowongan <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
          <Link href="/bisnis" className="text-blue-600 hover:underline flex items-center font-medium">
             Mitra Perusahaan <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </section>

    </div>
  )
}
