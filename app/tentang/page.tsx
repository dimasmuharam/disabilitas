import { Metadata } from "next";
import Link from "next/link"
import { Users, Target, Heart, ArrowRight, Microscope, ShieldCheck, Zap, Database } from "lucide-react"

export const metadata: Metadata = {
  title: "Tentang Kami | Misi Mewujudkan Karir Inklusif Berbasis Data",
  description: "Kisah di balik Disabilitas.com, hub karir inklusif yang didirikan oleh Dimas Prasetyo Muharam untuk menjembatani talenta disabilitas dengan ekosistem industri melalui pendekatan riset fungsional.",
};

export default function TentangPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white selection:bg-blue-100 dark:bg-slate-950">
      
      {/* 1. HERO SECTION - Bold Narrative */}
      <section className="w-full border-b-8 border-slate-900 bg-white py-20 dark:bg-slate-900 lg:py-32 text-left px-4">
        <div className="container mx-auto max-w-7xl px-4 md:px-6">
          <div className="inline-block rounded-lg border-2 border-slate-900 bg-blue-600 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] mb-8">
            Our Vision & Mission
          </div>
          <h1 className="text-4xl font-black uppercase italic leading-none tracking-tighter text-slate-900 dark:text-white sm:text-6xl md:text-7xl lg:text-8xl">
            Menembus Batas, <br />
            <span className="text-blue-600">Menciptakan Peluang.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg font-bold uppercase tracking-tight text-slate-500 dark:text-slate-400 md:text-2xl italic">
            Disabilitas.com adalah hub digital karir inklusif yang menjembatani talenta disabilitas dengan ekosistem industri, pendidikan, dan otoritas melalui pendekatan riset terpadu.
          </p>
        </div>
      </section>

      {/* 2. STORY SECTION - Fill the Gap Focus */}
      <section className="container mx-auto max-w-7xl px-4 py-24 md:px-6">
        <div className="grid items-center gap-16 lg:grid-cols-2 text-left">
          <div className="space-y-8">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 dark:text-slate-50 sm:text-5xl">
              Cerita Kami
            </h2>
            <div className="space-y-6 text-lg font-bold leading-relaxed text-slate-600 dark:text-slate-400">
              <p>
                Berawal dari ketimpangan akses informasi (asymmetric information) di pasar kerja Indonesia, <strong>Dimas Prasetyo Muharam</strong> membayangkan sebuah sistem di mana kompetensi talenta disabilitas dapat terpetakan secara ilmiah dan transparan.
              </p>
              <p>
                Sebagai peneliti pendidikan Inklusif dan praktisi tunanetra, ia menyadari bahwa tantangan utama bukan hanya pada SDM, melainkan pada ekosistem yang terfragmentasi. Disabilitas.com lahir untuk mengisi celah tersebut (Fill the Gap).
              </p>
            </div>
          </div>
          <div className="grid gap-6 sm:grid-cols-1">
            <div className="group rounded-[2rem] border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(37,99,235,1)] transition-all hover:-translate-y-1">
              <Target className="mb-4 size-12 text-blue-600" />
              <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Visi Strategis</h3>
              <p className="font-bold italic text-slate-500 leading-relaxed">
                Mewujudkan infrastruktur data inklusif nasional di mana setiap individu diserap ke dunia kerja berdasarkan kompetensi fungsional yang tervalidasi.
              </p>
            </div>
            <div className="group rounded-[2rem] border-4 border-slate-900 bg-blue-600 p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] text-white transition-all hover:-translate-y-1">
              <Database className="mb-4 size-12 text-yellow-400" />
              <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-2">Misi Inovatif</h3>
              <p className="font-bold italic text-blue-50 leading-relaxed">
                Membangun platform satu pintu yang menyinergikan data lima pemangku kepentingan utama untuk menciptakan transisi karir yang setara dan berkelanjutan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOUNDER SECTION - Scientific Authority */}
      <section className="w-full border-y-8 border-slate-900 bg-slate-50 py-24 dark:bg-slate-900/50">
        <div className="container mx-auto max-w-7xl px-4 text-center">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter mb-16">Otoritas di Balik Layar</h2>
          <div className="mx-auto flex max-w-3xl flex-col items-center justify-center rounded-[3rem] border-8 border-slate-900 bg-white p-10 shadow-[20px_20px_0px_0px_rgba(37,99,235,1)] dark:bg-slate-950">
            <div className="mb-8 flex size-32 items-center justify-center rounded-full border-4 border-slate-900 bg-blue-600 text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] overflow-hidden">
               <Users size={60} />
            </div>
            <h3 className="text-3xl font-black uppercase italic tracking-tighter">Dimas Prasetyo Muharam</h3>
            <p className="mt-2 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-blue-600">
               <Microscope className="size-4" /> Peneliti Pendidikan Inklusif & Praktisi
            </p>
            <div className="mt-8 border-t-2 border-slate-100 pt-8 italic font-bold text-slate-500 leading-relaxed">
              &ldquo;Kehilangan penglihatan sejak usia 12 tahun mengajarkan saya untuk memetakan peluang melalui data dan empati. Disabilitas.com adalah upaya kolektif membuktikan bahwa kompetensi fungsional melampaui batasan fisik. Solusi teknologi dan aksesibilitas digital hadir untuk membongkar batasan-batasan itu dan membuka banyak peluang untuk penyandang disabilitas yang sebelumnya dianggap mustahil.&rdquo;
            </div>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
               <div className="flex items-center gap-1.5 rounded-xl border-2 border-slate-900 bg-slate-100 px-4 py-2 text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                  <ShieldCheck className="size-3.5 text-emerald-600" /> Peneliti BRIN
               </div>
               <div className="flex items-center gap-1.5 rounded-xl border-2 border-slate-900 bg-slate-100 px-4 py-2 text-[10px] font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                  <Zap className="size-3.5 text-blue-600" /> Founder Forum ASN Inklusif
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FINAL CTA - Ecosystem Invitation */}
      <section className="w-full py-24 text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-black uppercase italic leading-none tracking-tighter sm:text-6xl mb-8 text-slate-900">
            Mari Menjadi Bagian <br /> dari Perubahan Data.
          </h2>
          <p className="mx-auto mb-12 max-w-2xl text-lg font-bold italic text-slate-500 uppercase">
            Kami mengundang talenta, akademisi, dan pemimpin industri untuk bersama-sama mensinergikan ekosistem karir yang inklusif.
          </p>
          <div className="flex flex-col justify-center gap-6 sm:flex-row">
            <Link 
              href="/bisnis" 
              className="flex h-16 items-center justify-center rounded-2xl bg-blue-600 px-12 text-sm font-black uppercase italic tracking-[0.2em] text-white shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all hover:-translate-y-1 active:translate-y-0"
            >
              Solusi Kami
            </Link>
            <Link 
              href="/kontak" 
              className="flex h-16 items-center justify-center rounded-2xl border-4 border-slate-900 bg-transparent px-12 text-sm font-black uppercase italic tracking-[0.2em] text-slate-900 transition-all hover:bg-slate-900 hover:text-white"
            >
              Hubungi Kami <ArrowRight className="ml-2 size-5" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}