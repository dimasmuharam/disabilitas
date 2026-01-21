import { Metadata } from "next";
import Link from "next/link";
import { 
  ShieldCheck, 
  Monitor, 
  Building, 
  FileText, 
  CheckCircle2, 
  ArrowRight,
  Search,
  Zap,
  Accessibility
} from "lucide-react";

export const metadata: Metadata = {
  title: "Layanan Audit Aksesibilitas Digital (SPBE) & Fisik | WCAG 2.1",
  description: "Layanan audit aksesibilitas profesional berbasis riset BRIN. Membantu kepatuhan SPBE dan standar inklusi internasional melalui pengujian fungsional nyata.",
};

export default function AuditAksesibilitasPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 selection:bg-purple-100">
      
      {/* HERO SECTION - Purple Authority Theme */}
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
                Transformasi ekosistem kerja Mas Dimas menjadi inklusif melalui audit fungsional berbasis riset BRIN dan standar internasional WCAG 2.1.
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

      {/* CORE AUDIT SERVICES */}
      <section className="py-24 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-16 text-center">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900">Modul Audit Profesional</h2>
            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.3em] text-purple-600">Standardisasi Inklusi Nasional</p>
          </div>

          <div className="grid gap-10 md:grid-cols-3">
            {[
              { 
                icon: Monitor, 
                title: "Audit Digital (SPBE)", 
                desc: "Evaluasi website dan aplikasi berdasarkan standar WCAG 2.1 Level AA. Pengujian menggunakan Screen Reader dan teknologi asistif nyata.",
                points: ["VPAT Reporting", "Kepatuhan SPBE", "User Experience Disabilitas"]
              },
              { 
                icon: Building, 
                title: "Audit Fisik", 
                desc: "Penilaian aksesibilitas gedung dan ruang kerja untuk mobilitas kursi roda serta keamanan sensorik bagi disabilitas netra/rungu.",
                points: ["Ramp & Toilet Akses", "Guiding Block System", "Safety & Emergency Exit"]
              },
              { 
                icon: FileText, 
                title: "Roadmap Inklusi", 
                desc: "Penyusunan rencana strategis transformasi organisasi menuju inklusi fungsional yang berkelanjutan dan terukur.",
                points: ["Kebijakan Internal", "Budgeting Akomodasi", "Sertifikasi Inklusi"]
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
                <ul className="space-y-2 border-t-2 border-slate-100 pt-6">
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

      {/* METHODOLOGY: The Research Edge */}
      <section className="py-24 border-y-8 border-slate-900">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center gap-16 lg:flex-row">
            <div className="flex-1 space-y-8">
              <h2 className="text-4xl font-black uppercase italic leading-none tracking-tighter sm:text-6xl">Metodologi <br /> <span className="text-purple-600">Berbasis Bukti.</span></h2>
              <p className="text-lg font-bold italic leading-relaxed text-slate-600">
                Audit kami bukan sekadar centang daftar tugas. Metodologi ini dikembangkan melalui penelitian di <strong>BRIN</strong> dan divalidasi oleh pengalaman hidup praktisi disabilitas langsung.
              </p>
              <div className="space-y-4">
                 {[
                   { t: "Observasi & Data", d: "Pengumpulan data lapangan secara mendalam." },
                   { t: "Analisis Gap Standar Global", d: "Membandingkan infrastruktur Anda dengan WCAG 2.1 AA." },
                   { t: "Rekomendasi Fungsional", d: "Bukan teori, tapi langkah konkret perbaikan." }
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
               <h3 className="text-3xl font-black uppercase italic leading-tight">Siap Memulai <br /> Audit Organisasi?</h3>
               <p className="mt-4 font-bold text-purple-700 italic">Dapatkan laporan VPAT profesional yang diakui secara nasional dan internasional.</p>
               <Link 
                 href="/kontak" 
                 className="mt-10 inline-flex w-full items-center justify-center rounded-2xl border-4 border-slate-900 bg-slate-900 py-6 text-sm font-black uppercase italic tracking-widest text-white transition-all hover:bg-purple-600"
               >
                 Jadwalkan Konsultasi <ArrowRight size={20} className="ml-2" />
               </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}