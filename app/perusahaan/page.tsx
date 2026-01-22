import { Metadata } from "next";
import Link from "next/link";
import { 
  Building2, 
  Users, 
  ArrowRight, 
  ShieldCheck, 
  Database, 
  MapPin, 
  CheckCircle2,
  Briefcase
} from "lucide-react";

export const metadata: Metadata = {
  title: "Portal Perusahaan Inklusif | Rekrutmen Talenta Disabilitas Terverifikasi",
  description: "Penuhi kuota 1% tenaga kerja disabilitas dengan data talenta yang sudah tervalidasi skill dan kualifikasinya. Solusi rekrutmen berbasis data nasional.",
};

export default function CompanyLandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 selection:bg-orange-100">
      
      {/* HERO SECTION - Orange Theme for Business & Energy */}
      <section className="border-b-8 border-slate-900 bg-orange-500 py-20 text-white lg:py-32">
        <div className="mx-auto max-w-7xl px-4 text-center lg:text-left">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              <div className="inline-block rounded-xl border-4 border-slate-900 bg-white px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                Enterprise Inclusion Portal
              </div>
              <h1 className="text-5xl font-black uppercase italic leading-none tracking-tighter sm:text-6xl md:text-7xl">
                Rekrutmen Cerdas <br /> 
                <span className="text-slate-900">Dapatkan Kualitas.</span>
              </h1>
              <p className="max-w-xl text-lg font-bold uppercase tracking-widest text-orange-50">
                Temukan talenta disabilitas dengan kualifikasi yang tepat melalui database nasional yang sudah tervalidasi oleh Kampus dan Lembaga Pelatihan resmi.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/register?role=company"
                  className="flex h-16 items-center justify-center rounded-2xl border-4 border-slate-900 bg-slate-900 px-10 text-sm font-black uppercase italic text-white shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                >
                  Mulai Rekrutmen Sekarang
                </Link>
                <Link
                  href="/bisnis"
                  className="flex h-16 items-center justify-center gap-2 rounded-2xl border-4 border-slate-900 bg-white px-10 text-sm font-black uppercase italic text-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                >
                  Konsultasi & Audit
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative mx-auto flex aspect-square w-full max-w-[450px] items-center justify-center rounded-[3rem] border-8 border-slate-900 bg-white shadow-[20px_20px_0px_0px_rgba(15,23,42,1)]">
                <Building2 size={180} className="text-orange-500" />
                <div className="absolute -left-8 top-10 rounded-3xl border-4 border-slate-900 bg-blue-500 p-6 text-white shadow-xl">
                  <Database size={40} />
                  <p className="mt-2 text-[10px] font-black uppercase italic">Verified Data</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE PROP: Filling the Gap for Company */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-16 text-center lg:text-left">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900">Solusi Kepatuhan & Produktivitas</h2>
            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.3em] text-orange-600">Membantu Perusahaan Memenuhi UU No. 8/2016 Secara Terukur</p>
          </div>

          <div className="grid gap-10 md:grid-cols-3">
            {[
              { 
                icon: CheckCircle2, 
                title: "Talenta Terverifikasi", 
                desc: "Jangan khawatir soal kualitas SDM. Profil talenta kami divalidasi oleh Unit Layanan Disabilitas Kampus dan Lembaga Pelatihan mitra." 
              },
              { 
                icon: MapPin, 
                title: "Matching Berbasis Domisili", 
                desc: "Cari talenta hebat yang berada di area operasional Anda untuk mempermudah mobilisasi dan dukungan akomodasi lokal." 
              },
              { 
                icon: ShieldCheck, 
                title: "Kepatuhan Regulasi", 
                desc: "Pantau penyerapan tenaga kerja disabilitas di perusahaan Anda secara real-time untuk laporan kepatuhan kepada pemerintah." 
              }
            ].map((f, i) => (
              <div key={i} className="group flex flex-col rounded-[2.5rem] border-4 border-slate-900 bg-white p-10 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all hover:-translate-y-2">
                <div className="mb-6 flex size-16 items-center justify-center rounded-2xl border-2 border-slate-900 bg-orange-50 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                    <f.icon className="size-8 text-orange-600" />
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

      {/* BRIDGE SECTION: The Audit Connection */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center justify-between gap-12 rounded-[3.5rem] border-8 border-slate-900 bg-white p-12 shadow-[15px_15px_0px_0px_rgba(249,115,22,1)] md:flex-row">
            <div className="text-left md:w-1/2">
              <h2 className="text-4xl font-black uppercase italic leading-none tracking-tighter">Bukan Hanya <br /> <span className="text-orange-600">Papan Lowongan.</span></h2>
              <p className="mt-6 text-lg font-bold italic leading-relaxed text-slate-600">
                Kami menyediakan data kesiapan aksesibilitas talenta dan membantu Anda melakukan audit kesiapan lingkungan kerja. Pastikan talenta hebat yang Anda rekrut mendapatkan akomodasi yang layak untuk performa maksimal.
              </p>
              <Link href="/bisnis" className="mt-8 inline-flex items-center gap-2 font-black uppercase italic text-orange-600 transition-all hover:gap-4">
                Pelajari Layanan Audit Aksesibilitas <ArrowRight size={20} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 md:w-1/3">
               <div className="rounded-2xl bg-orange-100 p-6 text-center">
                  <p className="text-3xl font-black text-orange-600">1%</p>
                  <p className="text-[10px] font-bold uppercase">Kuota Swasta</p>
               </div>
               <div className="rounded-2xl bg-blue-100 p-6 text-center">
                  <p className="text-3xl font-black text-blue-600">2%</p>
                  <p className="text-[10px] font-bold uppercase">Kuota BUMN</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <div className="rounded-[4rem] border-8 border-slate-900 bg-orange-500 p-16 text-white shadow-[20px_20px_0px_0px_rgba(15,23,42,1)]">
              <h2 className="text-4xl font-black uppercase italic leading-none tracking-tighter md:text-6xl">
                Dapatkan Talenta <br /> Terbaik Anda.
              </h2>
              <p className="mx-auto mt-8 max-w-2xl text-lg font-bold uppercase tracking-widest text-orange-100/70">
                Bangun budaya inklusi yang nyata dan fungsional di organisasi Anda bersama ekosistem data kami.
              </p>
              <div className="mt-12 flex flex-col justify-center gap-4 sm:flex-row">
                <Link 
                  href="/register?role=company"
                  className="rounded-2xl border-4 border-slate-900 bg-white px-12 py-6 text-sm font-black uppercase italic tracking-[0.2em] text-slate-900 shadow-2xl transition-all hover:-translate-y-1 hover:bg-slate-100 active:translate-y-0"
                >
                  Registrasi Perusahaan
                </Link>
                <Link 
                  href="/kontak"
                  className="rounded-2xl border-4 border-slate-900 bg-slate-900 px-12 py-6 text-sm font-black uppercase italic tracking-[0.2em] text-white transition-all hover:-translate-y-1 hover:bg-slate-800 active:translate-y-0"
                >
                  Hubungi Tim Ahli
                </Link>
              </div>
          </div>
        </div>
      </section>

    </div>
  );
}