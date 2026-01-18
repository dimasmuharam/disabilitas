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
  PieChart
} from "lucide-react";

export const metadata = {
  title: "Transformasi Digital ULD - Portal Otoritas Pemerintah",
  description: "Dukung kemandirian ekonomi disabilitas di wilayah Anda melalui monitoring data real-time, verifikasi industri, dan direktori talenta inklusif.",
  keywords: ["Unit Layanan Disabilitas", "ULD Ketenagakerjaan", "Monitoring Disabilitas", "Inklusi Kerja Pemerintah"]
};

export default function GovernmentLandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 selection:bg-blue-100">
      
      {/* HERO SECTION - Blue Theme for Authority */}
      <section className="border-b-8 border-slate-900 bg-blue-600 py-20 text-white lg:py-32">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8 text-left">
              <div className="inline-block rounded-xl border-4 border-slate-900 bg-yellow-400 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                Government Agency Portal
              </div>
              <h1 className="text-5xl font-black uppercase italic leading-none tracking-tighter sm:text-6xl md:text-7xl">
                Modernisasi Unit Layanan Disabilitas
              </h1>
              <p className="max-w-xl text-lg font-bold uppercase tracking-widest text-blue-50">
                Pusat kendali data inklusi wilayah untuk memantau keterserapan kerja dan memverifikasi kepatuhan industri secara akurat.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/register?role=government"
                  className="flex h-16 items-center justify-center rounded-2xl border-4 border-slate-900 bg-white px-10 text-sm font-black uppercase italic text-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                >
                  Aktifkan Otoritas Wilayah
                </Link>
                <Link
                  href="#manfaat"
                  className="flex h-16 items-center justify-center gap-2 rounded-2xl border-4 border-slate-900 bg-slate-900 px-10 text-sm font-black uppercase italic text-white shadow-[6px_6px_0px_0px_rgba(59,130,246,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                >
                  <FileSearch size={18} className="text-blue-400" /> Pelajari Modul ULD
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
               <div className="relative mx-auto flex aspect-square w-full max-w-[450px] items-center justify-center rounded-[3rem] border-8 border-slate-900 bg-white shadow-[20px_20px_0px_0px_rgba(15,23,42,1)]">
                  <Scale size={180} className="text-slate-900" />
                  <div className="absolute -left-8 -top-8 animate-bounce rounded-3xl border-4 border-slate-900 bg-emerald-400 p-6 shadow-xl text-slate-900">
                    <ShieldCheck size={40} />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE PROPOSITION (The Hook) */}
      <section className="border-b-4 border-slate-100 bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center justify-between gap-8 rounded-[3rem] border-4 border-slate-900 bg-white p-12 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] md:flex-row">
            <div className="text-left md:w-2/3">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">Satu Data Disabilitas Nasional</h2>
              <p className="mt-4 text-lg font-medium italic leading-relaxed text-slate-500">
                Hubungkan data ULD daerah Anda dengan ekosistem riset nasional. Pastikan setiap kebijakan berbasis data lapangan yang valid, bukan sekadar asumsi.
              </p>
            </div>
            <div className="flex items-center gap-4 rounded-2xl bg-blue-100 px-8 py-5 text-blue-700">
               <MapPin size={24} />
               <span className="text-sm font-black uppercase italic tracking-tighter">Mendukung 514 Kota/Kabupaten</span>
            </div>
          </div>
        </div>
      </section>

      {/* CORE MODULES */}
      <section id="manfaat" className="py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-16 text-left">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900">Dashboard Kerja ULD</h2>
            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Alur Kerja Digital Otoritas Publik</p>
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
                desc: "Berikan badge verifikasi resmi kepada perusahaan yang patuh pada kuota penempatan disabilitas."
              },
              { 
                icon: Users, 
                title: "Direktori Talenta", 
                color: "purple",
                desc: "Akses database profil talenta di wilayah Anda untuk mempermudah matchmaking karir lokal."
              }
            ].map((f, i) => (
              <div key={i} className="group flex flex-col rounded-[2.5rem] border-4 border-slate-900 bg-white p-10 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all hover:-translate-y-2">
                <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] bg-${f.color}-400`}>
                    <f.icon className="text-slate-900 size-8" />
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

      {/* IMPACT SECTION */}
      <section className="relative overflow-hidden bg-slate-900 py-24 text-white">
          <div className="container relative z-10 mx-auto max-w-7xl px-4">
            <h3 className="mb-12 text-left text-3xl font-black uppercase italic tracking-tighter">Target Integrasi Otoritas</h3>
            <div className="grid gap-6 md:grid-cols-2">
               <div className="flex items-center gap-6 rounded-[2rem] border-2 border-white/10 bg-white/5 p-8 backdrop-blur-md">
                  <div className="rounded-2xl bg-blue-500 p-4 text-white shadow-xl shadow-blue-500/20"><Building2 size={32}/></div>
                  <div className="text-left">
                     <h4 className="text-xl font-black uppercase italic">Dinas Tenaga Kerja</h4>
                     <p className="text-xs font-medium uppercase tracking-widest text-slate-400 opacity-80 text-center">Tingkat Provinsi & Kota/Kabupaten</p>
                  </div>
               </div>
               <div className="flex items-center gap-6 rounded-[2rem] border-2 border-white/10 bg-white/5 p-8 backdrop-blur-md">
                  <div className="rounded-2xl bg-purple-500 p-4 text-white shadow-xl shadow-purple-500/20"><PieChart size={32}/></div>
                  <div className="text-left">
                     <h4 className="text-xl font-black uppercase italic">Kementerian Sektoral</h4>
                     <p className="text-xs font-medium uppercase tracking-widest text-slate-400 opacity-80 text-center">Pengambil Kebijakan Makro</p>
                  </div>
               </div>
            </div>
          </div>
          <div className="absolute -bottom-20 -right-20 opacity-5">
            <Scale size={400} />
          </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <div className="rounded-[4rem] border-8 border-slate-900 bg-blue-600 p-16 shadow-[20px_20px_0px_0px_rgba(15,23,42,1)] text-white">
              <h2 className="text-4xl font-black uppercase italic leading-none tracking-tighter md:text-6xl">
                Wujudkan Ekosistem Kerja Inklusif
              </h2>
              <p className="mx-auto mt-8 max-w-2xl text-lg font-bold uppercase tracking-widest text-blue-100/70">
                Mari bersama kita bangun infrastruktur data yang memadai bagi warga disabilitas untuk mendapatkan hak pekerjaan yang layak.
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