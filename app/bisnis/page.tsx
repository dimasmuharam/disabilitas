import { Metadata } from "next";
import Link from "next/link";
import { 
  HeartHandshake, 
  Building2, 
  Users, 
  ArrowRight, 
  ShieldCheck, 
  MonitorCheck, 
  CheckCircle,
  Zap,
  Lightbulb,
  Accessibility
} from "lucide-react";

export const metadata: Metadata = {
  title: "Layanan Keahlian Inklusi & Aksesibilitas | Disabilitas.com",
  description: "Dukungan pakar untuk audit aksesibilitas digital, standardisasi lingkungan kerja, dan pengembangan kapasitas organisasi inklusif.",
};

export default function BisnisPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 selection:bg-blue-100">
      
      {/* HERO SECTION - Fokus pada Otoritas Teknis & Pengalaman Nyata */}
      <section className="border-b-8 border-slate-900 bg-slate-900 py-20 text-white lg:py-32">
        <div className="mx-auto max-w-7xl px-4 text-center lg:text-left">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8 text-left">
              <div className="inline-flex items-center rounded-xl border-4 border-slate-900 bg-blue-600 px-4 py-2 text-xs font-black uppercase tracking-widest text-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
                <HeartHandshake size={16} className="mr-2" /> Expertise & Implementation
              </div>
              <h1 className="text-5xl font-black uppercase italic leading-none tracking-tighter sm:text-6xl md:text-7xl">
                Otoritas Teknis <br /> 
                <span className="text-blue-500">Inklusi Digital.</span>
              </h1>
              <p className="max-w-xl text-lg font-bold uppercase tracking-widest text-slate-400">
                Menghubungkan standar riset dengan pengujian fungsional oleh praktisi disabilitas untuk memastikan sistem Anda benar-benar dapat diakses oleh semua orang.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/kontak"
                  className="flex h-16 items-center justify-center rounded-2xl border-4 border-white bg-blue-600 px-10 text-sm font-black uppercase italic text-white shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                >
                  Konsultasi Teknis
                </Link>
                <Link
                  href="#layanan"
                  className="flex h-16 items-center justify-center gap-2 rounded-2xl border-4 border-slate-700 bg-transparent px-10 text-sm font-black uppercase italic text-slate-100 transition-all hover:bg-white hover:text-slate-900"
                >
                  Eksplor Layanan
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative mx-auto flex aspect-square w-full max-w-[450px] items-center justify-center rounded-[3rem] border-8 border-slate-700 bg-slate-800 shadow-[20px_20px_0px_0px_rgba(37,99,235,1)]">
                <Accessibility size={180} className="text-blue-500" />
                <div className="absolute -left-8 top-10 rounded-3xl border-4 border-white bg-slate-900 p-6 text-white shadow-xl">
                  <ShieldCheck size={40} className="text-emerald-400" />
                  <p className="mt-2 text-[10px] font-black uppercase italic text-center">User-Led Audit</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STRATEGIC SERVICES GRID */}
      <section id="layanan" className="py-24 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-16 text-left">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900">Standar Inklusi 360&deg;</h2>
            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Membangun Kapasitas Organisasi yang Aksesibel</p>
          </div>

          <div className="grid gap-10 md:grid-cols-3">
            
            {/* SERVICE 1: ACCESSIBILITY AUDIT (Revenue Engine) */}
            <div className="group flex flex-col rounded-[2.5rem] border-4 border-slate-900 bg-white p-10 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all hover:-translate-y-2">
              <div className="mb-6 flex size-16 items-center justify-center rounded-2xl border-2 border-slate-900 bg-purple-50 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                  <MonitorCheck className="size-8 text-purple-600" />
              </div>
              <h3 className="mb-4 text-2xl font-black uppercase italic tracking-tighter text-slate-900">Audit Aksesibilitas</h3>
              <p className="mb-6 text-sm font-bold italic leading-relaxed text-slate-500">
                Pengujian teknis dan fungsional pada ekosistem digital (Web/Apps) berbasis WCAG 2.1 oleh tim pakar tunanetra.
              </p>
              <ul className="mb-8 space-y-2">
                <li className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                  <CheckCircle size={14} className="text-emerald-500" /> Sertifikasi Kepatuhan SPBE
                </li>
                <li className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                  <CheckCircle size={14} className="text-emerald-500" /> Verifikasi User Nyata
                </li>
              </ul>
              <Link href="/bisnis/audit" className="mt-auto flex items-center gap-2 text-xs font-black uppercase italic text-purple-600">
                Detail Metodologi Audit <ArrowRight size={16} />
              </Link>
            </div>

            {/* SERVICE 2: INCLUSIVE RECRUITMENT STRATEGY */}
            <div className="group flex flex-col rounded-[2.5rem] border-4 border-slate-900 bg-white p-10 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all hover:-translate-y-2">
              <div className="mb-6 flex size-16 items-center justify-center rounded-2xl border-2 border-slate-900 bg-blue-50 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                  <Users className="size-8 text-blue-600" />
              </div>
              <h3 className="mb-4 text-2xl font-black uppercase italic tracking-tighter text-slate-900">Strategi Rekrutmen</h3>
              <p className="mb-6 text-sm font-bold italic leading-relaxed text-slate-500">
                Pendampingan pemenuhan kuota tenaga kerja melalui platform integrasi data talenta nasional yang terverifikasi.
              </p>
              <ul className="mb-8 space-y-2">
                <li className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                  <CheckCircle size={14} className="text-emerald-500" /> Job-Matching Berbasis Skill
                </li>
                <li className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                  <CheckCircle size={14} className="text-emerald-500" /> Analisis Kebutuhan Akomodasi
                </li>
              </ul>
              <Link href="/perusahaan" className="mt-auto flex items-center gap-2 text-xs font-black uppercase italic text-blue-600">
                Akses Dashboard Rekrutmen <ArrowRight size={16} />
              </Link>
            </div>

            {/* SERVICE 3: CAPACITY BUILDING */}
            <div className="group flex flex-col rounded-[2.5rem] border-4 border-slate-900 bg-white p-10 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all hover:-translate-y-2">
              <div className="mb-6 flex size-16 items-center justify-center rounded-2xl border-2 border-slate-900 bg-orange-50 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                  <Zap className="size-8 text-orange-600" />
              </div>
              <h3 className="mb-4 text-2xl font-black uppercase italic tracking-tighter text-slate-900">Pelatihan Budaya</h3>
              <p className="mb-6 text-sm font-bold italic leading-relaxed text-slate-500">
                Edukasi etika interaksi dan penyusunan roadmap inklusi organisasi berdasarkan pengalaman hidup penyandang disabilitas.
              </p>
              <ul className="mb-8 space-y-2">
                <li className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                  <CheckCircle size={14} className="text-emerald-500" /> Disability Awareness Training
                </li>
                <li className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                  <CheckCircle size={14} className="text-emerald-500" /> Standardisasi Fisik Kantor
                </li>
              </ul>
              <Link href="/kontak" className="mt-auto flex items-center gap-2 text-xs font-black uppercase italic text-orange-600">
                Konsultasi Pelatihan <ArrowRight size={16} />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* WHY US: User-Led Difference */}
      <section className="py-24 border-y-8 border-slate-900 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="relative mx-auto w-full max-w-md">
              <div className="rounded-[2rem] border-4 border-slate-900 bg-blue-100 p-10 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)]">
                <Lightbulb className="mb-6 size-12 text-blue-600" />
                <h4 className="text-2xl font-black uppercase italic mb-4 text-slate-900">Mengapa Kami Berbeda?</h4>
                <p className="text-sm font-bold italic text-slate-600 leading-relaxed">
                  Kami tidak hanya menggunakan perangkat audit otomatis. Setiap sistem diuji langsung oleh praktisi tunanetra yang memahami hambatan fungsional nyata di lapangan.
                </p>
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="text-4xl font-black uppercase italic leading-none tracking-tighter text-slate-900">Validasi yang <br /> Menghilangkan Hambatan</h2>
              <p className="text-lg font-bold italic text-slate-500 leading-relaxed">
                Platform ini membantu Anda menemukan talenta terbaik secara gratis, sementara layanan audit kami memastikan talenta tersebut dapat bekerja dengan produktivitas maksimal pada sistem Anda.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <div className="rounded-[4rem] border-8 border-slate-900 bg-blue-600 p-16 text-white shadow-[20px_20px_0px_0px_rgba(15,23,42,1)]">
              <h2 className="text-4xl font-black uppercase italic leading-none tracking-tighter md:text-6xl">
                Bangun Standar <br /> Inklusi Anda.
              </h2>
              <p className="mx-auto mt-8 max-w-2xl text-lg font-bold uppercase tracking-widest text-blue-100/70">
                Dapatkan pendampingan pakar untuk memastikan setiap aspek organisasi Anda siap menerima dan mengoptimalkan potensi talenta disabilitas.
              </p>
              <div className="mt-12">
                <Link 
                  href="/kontak"
                  className="rounded-2xl border-4 border-slate-900 bg-yellow-400 px-12 py-6 text-sm font-black uppercase italic tracking-[0.2em] text-slate-900 shadow-2xl transition-all hover:-translate-y-1 hover:bg-white active:translate-y-0"
                >
                  Hubungi Tim Pakar Sekarang
                </Link>
              </div>
          </div>
        </div>
      </section>

    </div>
  );
}