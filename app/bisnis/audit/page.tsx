import { Metadata } from "next";
import Link from "next/link";
import { 
  ShieldCheck, 
  Monitor, 
  Building, 
  FileText, 
  CheckCircle2, 
  ArrowRight,
  Zap,
  Accessibility
} from "lucide-react";

export const metadata: Metadata = {
  title: "Audit Aksesibilitas Digital (SPBE) & Fisik | Standar WCAG 2.1",
  description: "Layanan audit profesional untuk memastikan sistem digital dan infrastruktur fisik Anda aksesibel bagi semua orang. Pengujian fungsional oleh praktisi disabilitas.",
  keywords: ["Audit Aksesibilitas", "WCAG 2.1", "Kepatuhan SPBE", "VPAT Indonesia", "Audit Disabilitas"],
};

export default function AuditAksesibilitasPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 selection:bg-purple-100">
      
      {/* 1. HERO SECTION - Fokus pada Otoritas & Kepatuhan */}
      <section className="border-b-8 border-slate-900 bg-purple-600 py-20 text-white lg:py-32">
        <div className="mx-auto max-w-7xl px-4 text-center lg:text-left">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              <div className="inline-block rounded-xl border-4 border-slate-900 bg-yellow-400 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                Standardization & Compliance
              </div>
              <h1 className="text-5xl font-black uppercase italic leading-none tracking-tighter sm:text-6xl md:text-7xl">
                Audit Tanpa <br /> 
                <span className="text-slate-900">Kompromi.</span>
              </h1>
              <p className="max-w-xl text-lg font-bold uppercase tracking-widest text-purple-50">
                Transformasi ekosistem organisasi menjadi inklusif melalui audit fungsional berbasis metodologi riset dan standar internasional WCAG 2.1.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/kontak"
                  className="flex h-16 items-center justify-center rounded-2xl border-4 border-slate-900 bg-white px-10 text-sm font-black uppercase italic text-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                >
                  Jadwalkan Audit Sekarang
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative mx-auto flex aspect-square w-full max-w-[450px] items-center justify-center rounded-[3rem] border-8 border-slate-900 bg-white shadow-[20px_20px_0px_0px_rgba(15,23,42,1)]">
                <Accessibility size={180} className="text-purple-600" />
                <div className="absolute -left-8 top-10 rounded-3xl border-4 border-slate-900 bg-emerald-400 p-6 text-slate-900 shadow-xl">
                  <ShieldCheck size={40} />
                  <p className="mt-2 text-[10px] font-black uppercase italic">SPBE Compliant</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORE AUDIT MODULES: Fokus pada Digital sebagai Expertise Utama */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-16 text-center lg:text-left">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900">Modul Evaluasi Profesional</h2>
            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.3em] text-purple-600">Standardisasi Inklusi Berbasis Pengalaman Pengguna Nyata</p>
          </div>

          <div className="grid gap-10 md:grid-cols-3">
            {[
              { 
                icon: Monitor, 
                title: "Audit Digital (SPBE)", 
                desc: "Evaluasi mendalam website dan aplikasi mobile berdasarkan standar internasional WCAG 2.1 Level AA. Pengujian dilakukan secara manual oleh pakar teknologi asistif.",
                points: ["VPAT Reporting", "Kepatuhan Standar SPBE", "Pengujian User Tunanetra"]
              },
              { 
                icon: Building, 
                title: "Audit Fisik", 
                desc: "Penilaian aksesibilitas lingkungan kerja untuk memastikan kemandirian mobilitas bagi talenta dengan disabilitas fisik dan sensorik.",
                points: ["Aksesibilitas Arsitektur", "Sistem Guiding Block", "Standardisasi Ruang Kerja"]
              },
              { 
                icon: FileText, 
                title: "Roadmap Strategis", 
                desc: "Penyusunan rencana transformasi organisasi jangka panjang untuk membangun budaya kerja yang inklusif dan akomodatif.",
                points: ["Kebijakan Inklusi", "Sertifikasi Internal", "Panduan Etika Interaksi"]
              }
            ].map((f, i) => (
              <div key={i} className="group flex flex-col rounded-[2.5rem] border-4 border-slate-900 bg-white p-10 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all hover:-translate-y-2">
                <div className="mb-6 flex size-16 items-center justify-center rounded-2xl border-2 border-slate-900 bg-purple-50 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                    <f.icon className="size-8 text-purple-600" />
                </div>
                <h3 className="mb-4 text-2xl font-black uppercase italic tracking-tighter">{f.title}</h3>
                <p className="mb-6 text-sm font-bold italic leading-relaxed text-slate-500">
                  {f.desc}
                </p>
                <ul className="mt-auto space-y-2 border-t-2 border-slate-100 pt-6">
                  {f.points.map(p => (
                    <li key={p} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                      <CheckCircle2 size={14} className="text-emerald-500" /> {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. THE EDGE: User-Led Audit (Unique Selling Point) */}
      <section className="border-y-8 border-slate-900 bg-white py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center gap-16 lg:flex-row">
            <div className="flex-1 space-y-8">
              <h2 className="text-4xl font-black uppercase italic leading-none tracking-tighter sm:text-6xl">Validasi <br /> <span className="text-purple-600">Fungsional Nyata.</span></h2>
              <p className="text-lg font-bold italic leading-relaxed text-slate-600">
                Kami melampaui audit otomatis. Metodologi kami melibatkan pengujian langsung oleh praktisi disabilitas profesional (Access Squad) untuk menemukan hambatan akses yang sering terlewatkan oleh mesin.
              </p>
              <div className="space-y-4">
                 {[
                   { t: "Analisis Teknis Berbasis Riset", d: "Menggunakan metodologi yang tervalidasi secara akademis." },
                   { t: "Pengujian Teknologi Asistif", d: "Verifikasi fungsional menggunakan screen reader dan perangkat khusus." },
                   { t: "Laporan VPAT Komprehensif", d: "Dokumentasi standar internasional yang diakui secara profesional." }
                 ].map((item, idx) => (
                   <div key={idx} className="flex items-center gap-4">
                      <div className="flex size-10 items-center justify-center rounded-full border-4 border-slate-900 bg-yellow-400 text-xs font-black">{idx + 1}</div>
                      <div>
                        <h4 className="text-sm font-black uppercase">{item.t}</h4>
                        <p className="text-[10px] font-bold text-slate-400">{item.d}</p>
                      </div>
                   </div>
                 ))}
              </div>
            </div>
            <div className="flex-1 rounded-[3rem] border-8 border-slate-900 bg-purple-100 p-12 shadow-[20px_20px_0px_0px_rgba(15,23,42,1)]">
               <Zap className="mb-6 text-yellow-500" size={48} />
               <h3 className="text-3xl font-black uppercase italic leading-tight text-slate-900">Siap Menuju <br /> Inklusi Digital?</h3>
               <p className="mt-4 font-bold italic text-purple-700">Pastikan sistem dan lingkungan Anda siap mengoptimalkan potensi talenta tanpa hambatan aksesibilitas.</p>
               <Link 
                 href="/kontak" 
                 className="mt-10 inline-flex w-full items-center justify-center rounded-2xl border-4 border-slate-900 bg-slate-900 py-6 text-sm font-black uppercase italic tracking-widest text-white transition-all hover:bg-purple-600"
               >
                 Konsultasi Bersama Pakar <ArrowRight size={20} className="ml-2" />
               </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}