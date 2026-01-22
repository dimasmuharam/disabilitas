import Link from "next/link";
import { 
  ShieldCheck, 
  MapPin, 
  Users, 
  BarChart3, 
  ArrowRight, 
  Building2, 
  Scale, 
  FileSearch,
  PieChart,
  ClipboardCheck,
  Zap
} from "lucide-react";

export const metadata = {
  title: "Sistem Operasi ULD Naker Digital - Portal Otoritas",
  description: "Infrastruktur data terpadu untuk Unit Layanan Disabilitas (ULD) daerah dan pusat untuk pemetaan potensi talenta nasional.",
  keywords: ["Unit Layanan Disabilitas", "ULD Naker", "Satu Data Disabilitas", "Kebijakan Inklusi"]
};

export default function GovernmentLandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 selection:bg-blue-100">
      
      {/* HERO SECTION - Fokus pada Otoritas & Infrastruktur */}
      <section className="border-b-8 border-slate-900 bg-blue-600 py-20 text-white lg:py-32">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8 text-left">
              <div className="inline-block rounded-xl border-4 border-slate-900 bg-yellow-400 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                Official ULD Infrastructure
              </div>
              <h1 className="text-5xl font-black uppercase italic leading-none tracking-tighter sm:text-6xl md:text-7xl">
                Alamat Digital <br /> ULD Naker Nasional
              </h1>
              <p className="max-w-xl text-lg font-bold uppercase tracking-widest text-blue-50">
                Ubah beban administratif menjadi efisiensi data. Hubungkan talenta, industri, dan lembaga pelatihan di wilayah Anda dalam satu kendali otoritas.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/register?role=government"
                  className="flex h-16 items-center justify-center rounded-2xl border-4 border-slate-900 bg-white px-10 text-sm font-black uppercase italic text-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                >
                  Aktifkan Dashboard Daerah
                </Link>
                <Link
                  href="#manfaat"
                  className="flex h-16 items-center justify-center gap-2 rounded-2xl border-4 border-slate-900 bg-slate-900 px-10 text-sm font-black uppercase italic text-white shadow-[6px_6px_0px_0px_rgba(59,130,246,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                >
                  <FileSearch size={18} className="text-blue-400" /> Lihat Panduan Teknis
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
               <div className="relative mx-auto flex aspect-square w-full max-w-[450px] items-center justify-center rounded-[3rem] border-8 border-slate-900 bg-white shadow-[20px_20px_0px_0px_rgba(15,23,42,1)]">
                  <Scale size={180} className="text-slate-900" />
                  <div className="absolute -left-8 -top-8 animate-bounce rounded-3xl border-4 border-slate-900 bg-emerald-400 p-6 text-slate-900 shadow-xl">
                    <ShieldCheck size={40} />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE PROP: Solving the Hub Problem */}
      <section className="border-b-4 border-slate-100 bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
             <div className="rounded-3xl border-4 border-slate-900 bg-white p-8 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
                <Zap className="mb-4 text-yellow-500" size={32} />
                <h4 className="text-xl font-black uppercase italic">Mitigasi Asumsi</h4>
                <p className="mt-2 text-sm font-bold italic text-slate-500">Kebijakan berdasarkan data riil pemetaan potensi di wilayah Mas Dimas.</p>
             </div>
             <div className="rounded-3xl border-4 border-slate-900 bg-white p-8 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
                <ClipboardCheck className="mb-4 text-blue-600" size={32} />
                <h4 className="text-xl font-black uppercase italic">Verifikasi Terpusat</h4>
                <p className="mt-2 text-sm font-bold italic text-slate-500">Otoritas tunggal untuk memvalidasi kepatuhan industri lokal terhadap UU Disabilitas.</p>
             </div>
             <div className="rounded-3xl border-4 border-slate-900 bg-white p-8 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]">
                <PieChart className="mb-4 text-purple-600" size={32} />
                <h4 className="text-xl font-black uppercase italic">Laporan Otomatis</h4>
                <p className="mt-2 text-sm font-bold italic text-slate-500">Hasil laporan statistik penempatan kerja untuk Kepala Daerah secara instan.</p>
             </div>
          </div>
        </div>
      </section>

      {/* CORE MODULES */}
      <section id="manfaat" className="py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-16 text-left">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900">Dashboard Operasional ULD</h2>
            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Alur Kerja Otoritas Publik Digital</p>
          </div>

          <div className="grid gap-10 md:grid-cols-3">
            {[
              { 
                icon: BarChart3, 
                title: "Monitoring Wilayah", 
                color: "blue",
                desc: "Dashboard statistik real-time keterserapan tenaga kerja disabilitas berdasarkan yurisdiksi Anda."
              },
              { 
                icon: ShieldCheck, 
                title: "Verifikasi Industri", 
                color: "emerald",
                desc: "Berikan status 'Verified Inklusif' bagi perusahaan yang memenuhi kuota dan standar akomodasi."
              },
              { 
                icon: Users, 
                title: "Direktori Talenta", 
                color: "purple",
                desc: "Petakan talenta di wilayah Anda berdasarkan kualifikasi, domisili, dan jenis disabilitas untuk matching lokal."
              }
            ].map((f, i) => (
              <div key={i} className="group flex flex-col rounded-[2.5rem] border-4 border-slate-900 bg-white p-10 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all hover:-translate-y-2">
                <div className="mb-6 flex size-16 items-center justify-center rounded-2xl border-2 border-slate-900 bg-slate-50 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                    <f.icon className="size-8 text-slate-900" />
                </div>
                <h3 className="mb-4 text-2xl font-black uppercase italic tracking-tighter">{f.title}</h3>
                <p className="flex-1 text-sm font-bold italic leading-relaxed text-slate-500">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SIMULATION FOR CENTRAL GOV (Research-Driven) */}
      <section className="border-y-8 border-slate-900 bg-slate-50 py-24">
         <div className="mx-auto max-w-7xl px-4">
            <div className="flex flex-col items-center gap-12 lg:flex-row">
               <div className="flex-1 space-y-6">
                  <h3 className="text-4xl font-black uppercase italic leading-none tracking-tighter">
                     Simulasi Formasi <br /> <span className="text-blue-600">CASN Inklusif</span>
                  </h3>
                  <p className="text-lg font-bold italic text-slate-600">
                    Khusus Pemerintah Pusat: Gunakan data agregat nasional untuk menyimulasikan ketersediaan talenta disabilitas dengan kriteria spesifik sebelum pembukaan formasi nasional.
                  </p>
               </div>
               <div className="flex-1 rounded-3xl border-4 border-slate-900 bg-slate-900 p-10 text-white shadow-[12px_12px_0px_0px_rgba(37,99,235,1)]">
                  <div className="space-y-4">
                     <div className="h-4 w-full rounded-full bg-blue-500/20"><div className="h-full w-3/4 rounded-full bg-blue-500" /></div>
                     <div className="h-4 w-full rounded-full bg-emerald-500/20"><div className="h-full w-1/2 rounded-full bg-emerald-500" /></div>
                     <div className="h-4 w-full rounded-full bg-yellow-500/20"><div className="h-full w-2/3 rounded-full bg-yellow-500" /></div>
                     <p className="pt-4 text-center text-xs font-black uppercase tracking-widest text-blue-400">Data Simulation Engine Active</p>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <div className="rounded-[4rem] border-8 border-slate-900 bg-blue-600 p-16 text-white shadow-[20px_20px_0px_0px_rgba(15,23,42,1)]">
              <h2 className="text-4xl font-black uppercase italic leading-none tracking-tighter md:text-6xl">
                Aktifkan Alamat Digital <br /> Wilayah Anda
              </h2>
              <p className="mx-auto mt-8 max-w-2xl text-lg font-bold uppercase tracking-widest text-blue-100/70">
                Mulai integrasi data inklusi hari ini untuk pelayanan ULD Naker yang lebih akuntabel dan berdampak nyata.
              </p>
              <div className="mt-12 flex flex-col justify-center gap-4 sm:flex-row">
                <Link 
                  href="/register?role=government"
                  className="rounded-2xl border-4 border-slate-900 bg-yellow-400 px-12 py-6 text-sm font-black uppercase italic tracking-[0.2em] text-slate-900 shadow-2xl transition-all hover:-translate-y-1 hover:bg-white active:translate-y-0"
                >
                  Registrasi Otoritas (Gratis)
                </Link>
                <Link 
                  href="/kontak"
                  className="rounded-2xl border-4 border-slate-900 bg-slate-900 px-12 py-6 text-sm font-black uppercase italic tracking-[0.2em] text-white transition-all hover:-translate-y-1 hover:bg-slate-800 active:translate-y-0"
                >
                  Hubungi Admin Nasional
                </Link>
              </div>
          </div>
        </div>
      </section>

    </div>
  );
}