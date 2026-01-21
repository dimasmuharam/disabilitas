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
  Lightbulb
} from "lucide-react";

export const metadata: Metadata = {
  title: "Solusi Inklusi Profesional | Konsultasi, Audit & Training Disabilitas",
  description: "Transformasi organisasi Anda menjadi inklusif secara fungsional melalui pendekatan riset BRIN dan pengalaman nyata praktisi disabilitas.",
};

export default function BisnisPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 selection:bg-blue-100">
      
      {/* HERO SECTION - Agency/Expertise Focus */}
      <section className="border-b-8 border-slate-900 bg-slate-900 py-20 text-white lg:py-32">
        <div className="mx-auto max-w-7xl px-4 text-center lg:text-left">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8 text-left">
              <div className="inline-flex items-center rounded-xl border-4 border-slate-900 bg-blue-600 px-4 py-2 text-xs font-black uppercase tracking-widest text-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
                <HeartHandshake size={16} className="mr-2" /> Pakar Inklusi & Aksesibilitas
              </div>
              <h1 className="text-5xl font-black uppercase italic leading-none tracking-tighter sm:text-6xl md:text-7xl">
                Inklusi yang <br /> 
                <span className="text-blue-500">Berdampak Nyata.</span>
              </h1>
              <p className="max-w-xl text-lg font-bold uppercase tracking-widest text-slate-400">
                Kami menggabungkan metodologi riset ketat dengan pengalaman hidup penyandang disabilitas untuk mewujudkan ekosistem kerja yang fungsional.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/kontak"
                  className="flex h-16 items-center justify-center rounded-2xl border-4 border-white bg-blue-600 px-10 text-sm font-black uppercase italic text-white shadow-[6px_6px_0px_0px_rgba(255,255,255,0.2)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                >
                  Konsultasi Gratis
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
                <Lightbulb size={180} className="text-blue-500" />
                <div className="absolute -left-8 top-10 rounded-3xl border-4 border-white bg-slate-900 p-6 text-white shadow-xl">
                  <ShieldCheck size={40} className="text-emerald-400" />
                  <p className="mt-2 text-[10px] font-black uppercase italic text-center">Riset Teruji</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THREE CORE SERVICES GRID */}
      <section id="layanan" className="py-24 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-16 text-left">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900">Solusi Berbasis Bukti</h2>
            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Layanan Profesional untuk Institusi Modern</p>
          </div>

          <div className="grid gap-10 md:grid-cols-3">
            
            {/* JASA 1: REKRUTMEN STRATEGIS */}
            <div className="group flex flex-col rounded-[2.5rem] border-4 border-slate-900 bg-white p-10 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all hover:-translate-y-2">
              <div className="mb-6 flex size-16 items-center justify-center rounded-2xl border-2 border-slate-900 bg-blue-50 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                  <Users className="size-8 text-blue-600" />
              </div>
              <h3 className="mb-4 text-2xl font-black uppercase italic tracking-tighter text-slate-900">Inclusive Recruitment</h3>
              <p className="mb-6 text-sm font-bold italic leading-relaxed text-slate-500">
                Job-matching cerdas berdasarkan kualifikasi akademik dan kebutuhan spesifik talenta disabilitas.
              </p>
              <ul className="mb-8 space-y-2">
                <li className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                  <CheckCircle size={14} className="text-emerald-500" /> Profil Terverifikasi
                </li>
                <li className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                  <CheckCircle size={14} className="text-emerald-500" /> Analisis Kompetensi
                </li>
              </ul>
              <Link href="/perusahaan" className="mt-auto flex items-center gap-2 text-xs font-black uppercase italic text-blue-600">
                Akses Portal Rekrutmen <ArrowRight size={16} />
              </Link>
            </div>

            {/* JASA 2: AUDIT AKSESIBILITAS */}
            <div className="group flex flex-col rounded-[2.5rem] border-4 border-slate-900 bg-white p-10 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all hover:-translate-y-2">
              <div className="mb-6 flex size-16 items-center justify-center rounded-2xl border-2 border-slate-900 bg-purple-50 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                  <MonitorCheck className="size-8 text-purple-600" />
              </div>
              <h3 className="mb-4 text-2xl font-black uppercase italic tracking-tighter text-slate-900">Accessibility Audit</h3>
              <p className="mb-6 text-sm font-bold italic leading-relaxed text-slate-500">
                Audit teknis digital (SPBE/WCAG) dan fisik kantor oleh praktisi disabilitas profesional.
              </p>
              <ul className="mb-8 space-y-2">
                <li className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                  <CheckCircle size={14} className="text-emerald-500" /> VPAT Reporting
                </li>
                <li className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                  <CheckCircle size={14} className="text-emerald-500" /> Pengujian User Nyata
                </li>
              </ul>
              <Link href="/bisnis/audit" className="mt-auto flex items-center gap-2 text-xs font-black uppercase italic text-purple-600">
                Detail Layanan Audit <ArrowRight size={16} />
              </Link>
            </div>

            {/* JASA 3: CAPACITY BUILDING */}
            <div className="group flex flex-col rounded-[2.5rem] border-4 border-slate-900 bg-white p-10 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all hover:-translate-y-2">
              <div className="mb-6 flex size-16 items-center justify-center rounded-2xl border-2 border-slate-900 bg-orange-50 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                  <Zap className="size-8 text-orange-600" />
              </div>
              <h3 className="mb-4 text-2xl font-black uppercase italic tracking-tighter text-slate-900">Capacity Building</h3>
              <p className="mb-6 text-sm font-bold italic leading-relaxed text-slate-500">
                Edukasi etika interaksi dan pembangunan budaya kerja inklusif berbasis temuan riset lapangan.
              </p>
              <ul className="mb-8 space-y-2">
                <li className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                  <CheckCircle size={14} className="text-emerald-500" /> Disability Awareness
                </li>
                <li className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                  <CheckCircle size={14} className="text-emerald-500" /> Roadmap Strategis
                </li>
              </ul>
              <Link href="/kontak" className="mt-auto flex items-center gap-2 text-xs font-black uppercase italic text-orange-600">
                Konsultasi Pelatihan <ArrowRight size={16} />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-24 border-t-8 border-slate-900">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <div className="rounded-[4rem] border-8 border-slate-900 bg-blue-600 p-16 text-white shadow-[20px_20px_0px_0px_rgba(15,23,42,1)]">
              <h2 className="text-4xl font-black uppercase italic leading-none tracking-tighter md:text-6xl">
                Transformasi <br /> Inklusi Sekarang.
              </h2>
              <p className="mx-auto mt-8 max-w-2xl text-lg font-bold uppercase tracking-widest text-blue-100/70">
                Gabungkan keahlian riset dan pengalaman praktis kami untuk membangun organisasi yang ramah bagi semua orang.
              </p>
              <div className="mt-12">
                <Link 
                  href="/kontak"
                  className="rounded-2xl border-4 border-slate-900 bg-yellow-400 px-12 py-6 text-sm font-black uppercase italic tracking-[0.2em] text-slate-900 shadow-2xl transition-all hover:-translate-y-1 hover:bg-white active:translate-y-0"
                >
                  Hubungi Tim Pakar Kami
                </Link>
              </div>
          </div>
        </div>
      </section>

    </div>
  );
}