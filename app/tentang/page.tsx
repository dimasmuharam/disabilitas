import Link from "next/link"
import { Users, Target, Heart, ArrowRight, Microscope, ShieldCheck } from "lucide-react"

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
            Disabilitas.com adalah hub karir inklusif yang menghubungkan potensi talenta disabilitas dengan peluang masa depan yang setara melalui pendekatan berbasis riset.
          </p>
        </div>
      </section>

      {/* STORY SECTION */}
      <section className="container px-4 md:px-6 py-12 md:py-24">
        <div className="grid gap-10 lg:grid-cols-2 items-center">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tighter text-slate-900 dark:text-slate-50">Cerita Kami</h2>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Berawal dari kegelisahan akan sulitnya akses kerja bagi penyandang disabilitas di Indonesia, <strong>Dimas Prasetyo Muharam</strong>, seorang peneliti pendidikan inklusif yang juga praktisi tunanetra, memimpikan sebuah ekosistem di mana hambatan fisik tidak lagi menjadi penghalang prestasi.
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Disabilitas.com lahir dari perpaduan antara data ilmiah dan pengalaman hidup nyata. Kami hadir bukan sekadar sebagai situs lowongan kerja, melainkan sebagai partner transformasi bagi industri untuk mewujudkan lingkungan yang benar-benar aksesibel bagi semua ragam disabilitas.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-hover hover:border-blue-500">
              <Target className="h-10 w-10 text-blue-600 mb-2" />
              <h3 className="font-bold text-lg">Visi</h3>
              <p className="text-sm text-slate-500">Mewujudkan dunia kerja inklusif di mana setiap individu dihargai berdasarkan kompetensi fungsional mereka.</p>
            </div>
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-hover hover:border-red-500">
              <Heart className="h-10 w-10 text-red-600 mb-2" />
              <h3 className="font-bold text-lg">Misi</h3>
              <p className="text-sm text-slate-500">Menyediakan teknologi aksesibel dan audit berbasis riset untuk menjembatani gap antara talenta dan industri.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOUNDER SECTION */}
      <section className="w-full py-12 bg-slate-100 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800">
        <div className="container px-4 md:px-6 text-center">
          <h2 className="text-2xl font-bold mb-8">Dibalik Layar</h2>
          <div className="flex flex-col items-center justify-center max-w-2xl mx-auto p-8 bg-white dark:bg-slate-950 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800">
            <div className="h-28 w-28 rounded-full bg-blue-50 dark:bg-blue-900/30 mb-6 flex items-center justify-center border-2 border-blue-600">
              <Users className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold">Dimas Prasetyo Muharam</h3>
            <p className="text-blue-600 dark:text-blue-400 font-semibold mb-6 flex items-center gap-2">
               <Microscope className="h-4 w-4" /> Peneliti & Praktisi Tunanetra
            </p>
            <p className="text-slate-600 dark:text-slate-400 text-base italic leading-relaxed">
              &ldquo;Keterbatasan penglihatan mengajarkan saya untuk melihat peluang dengan hati dan pikiran. Disabilitas.com adalah wujud nyata untuk membuktikan bahwa kompetensi melampaui segala batasan fisik.&rdquo;
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
               <div className="flex items-center gap-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                  <ShieldCheck className="h-3.5 w-3.5 text-green-600" /> Ahli Aksesibilitas Digital
               </div>
               <div className="flex items-center gap-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
                  <Target className="h-3.5 w-3.5 text-blue-600" /> Founder Forum ASN Inklusif
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full py-12 md:py-24 text-center">
        <h2 className="text-3xl font-bold tracking-tighter mb-4">Mari Menjadi Bagian dari Perubahan</h2>
        <p className="text-slate-500 mb-8 max-w-xl mx-auto">Kami mengundang talenta, akademisi, dan pemimpin industri untuk bersama-sama membangun ekosistem yang setara.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/lowongan" className="inline-flex h-11 items-center justify-center rounded-md bg-blue-600 px-8 text-sm font-medium text-white shadow hover:bg-blue-700 transition-colors">
             Lihat Lowongan
          </Link>
          <Link href="/kontak" className="inline-flex h-11 items-center justify-center rounded-md border border-slate-200 bg-white px-8 text-sm font-medium shadow-sm hover:bg-slate-100 transition-colors dark:bg-slate-950 dark:border-slate-800 dark:hover:bg-slate-800">
             Hubungi Kami <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>

    </div>
  )
}
