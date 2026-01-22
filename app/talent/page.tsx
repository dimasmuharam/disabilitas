import { Metadata } from "next";
import Link from "next/link";
import { 
  UserCheck, 
  Search, 
  MapPin, 
  ShieldCheck, 
  Zap, 
  BarChartHorizontal, 
  CheckCircle2,
  ArrowRight
} from "lucide-react";

/**
 * SEO OPTIMIZATION
 * Target: Page 1 Google untuk keyword "Talenta Disabilitas" & "Karir Inklusif"
 */
export const metadata: Metadata = {
  title: "Talenta Disabilitas Terverifikasi | Bangun Karir Inklusif Anda",
  description: "Ubah cara industri melihat potensi Anda. Platform pemetaan skill talenta disabilitas yang terintegrasi dengan Kampus, Lembaga Pelatihan, dan ULD Naker Nasional.",
  keywords: [
    "talenta disabilitas", 
    "lowongan kerja disabilitas", 
    "karir inklusif", 
    "pemetaan potensi disabilitas",
    "akomodasi layak kerja"
  ],
  openGraph: {
    title: "Bangun Profil Profesional Disabilitas Terverifikasi",
    description: "Bukan sekadar CV, ini adalah pemetaan potensi Anda yang diakui oleh ekosistem inklusi nasional.",
    images: [{ url: "/logo.png" }],
  },
};

export default function TalentLandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 selection:bg-blue-100">
      
      {/* HERO SECTION - Fokus pada Empowerment & Dignity */}
      <section className="border-b-8 border-slate-900 bg-white py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 text-center lg:text-left">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              <div className="inline-block rounded-xl border-4 border-slate-900 bg-blue-600 px-4 py-2 text-xs font-black uppercase tracking-widest text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                Talent Empowerment Hub
              </div>
              <h1 className="text-5xl font-black uppercase italic leading-none tracking-tighter sm:text-6xl md:text-7xl">
                Kualifikasi Anda, <br /> 
                <span className="text-blue-600">Kini Terukur.</span>
              </h1>
              <p className="max-w-xl text-lg font-bold uppercase tracking-widest text-slate-500">
                Tunjukkan Kompetensimu dengan data. Bangun profil profesional yang memetakan skill, sertifikasi, dan kebutuhan akomodasi Anda secara transparan bagi industri.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/daftar?role=talent"
                  className="flex h-16 items-center justify-center rounded-2xl border-4 border-slate-900 bg-blue-600 px-10 text-sm font-black uppercase italic text-white shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                >
                  Bangun Profil Terverifikasi
                </Link>
                <Link
                  href="/lowongan"
                  className="flex h-16 items-center justify-center gap-2 rounded-2xl border-4 border-slate-900 bg-white px-10 text-sm font-black uppercase italic text-slate-900 shadow-[6px_6px_0px_0px_rgba(37,99,235,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                >
                  <Search size={18} /> Eksplor Lowongan
                </Link>
              </div>
            </div>

            {/* VISUAL ELEMENT: Mapping Concept */}
            <div className="hidden lg:block">
              <div className="relative mx-auto flex aspect-square w-full max-w-[450px] items-center justify-center rounded-[3rem] border-8 border-slate-900 bg-slate-50 shadow-[20px_20px_0px_0px_rgba(15,23,42,1)]">
                <UserCheck size={180} className="text-blue-600" />
                <div className="absolute -right-8 top-10 rounded-3xl border-4 border-slate-900 bg-emerald-400 p-6 text-slate-900 shadow-xl">
                  <CheckCircle2 size={40} />
                  <p className="mt-2 text-[10px] font-black uppercase italic">Skill Verified</p>
                </div>
                <div className="absolute -left-8 bottom-10 rounded-3xl border-4 border-slate-900 bg-yellow-400 p-6 text-slate-900 shadow-xl">
                  <Zap size={40} />
                  <p className="mt-2 text-[10px] font-black uppercase italic">Mapped Potential</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE PROP: Filling the Gap for Talent */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-16 text-center lg:text-left">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900">Mengapa Profil Anda Harus Terintegrasi?</h2>
            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Standarisasi Karir Disabilitas Indonesia</p>
          </div>

          <div className="grid gap-10 md:grid-cols-3">
            {[
              { 
                icon: ShieldCheck, 
                title: "Validasi Institusi", 
                desc: "Skill dan riwayat pendidikan Anda divalidasi langsung oleh Kampus atau Lembaga Pelatihan Mitra. Menghapus keraguan pemberi kerja." 
              },
              { 
                icon: BarChartHorizontal, 
                title: "Detail Akomodasi", 
                desc: "Sistem memetakan kebutuhan alat bantu dan aksesibilitas Anda, sehingga Perusahaan tahu cara mendukung produktivitas Anda sejak hari pertama." 
              },
              { 
                icon: MapPin, 
                title: "Radar ULD Naker", 
                desc: "Profil Anda otomatis muncul pada dashboard Unit Layanan Disabilitas di daerah domisili Anda untuk matchmaking kerja lokal." 
              }
            ].map((f, i) => (
              <div key={i} className="group flex flex-col rounded-[2.5rem] border-4 border-slate-900 bg-white p-10 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all hover:-translate-y-2">
                <div className="mb-6 flex size-16 items-center justify-center rounded-2xl border-2 border-slate-900 bg-blue-50 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                    <f.icon className="size-8 text-blue-600" />
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

      {/* THE PROCESS SECTION */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center justify-between gap-8 rounded-[3rem] border-4 border-slate-900 bg-slate-900 p-12 text-white shadow-[12px_12px_0px_0px_rgba(37,99,235,1)] md:flex-row">
            <div className="text-left md:w-1/2">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-blue-400">Proses Pemetaan Karier</h2>
              <p className="mt-4 text-lg font-medium italic leading-relaxed opacity-80">
                Kami tidak hanya memberikan daftar lowongan. Kami membangun &quot;Jembatan Integritas&quot; antara kemampuan Anda dan ekspektasi industri profesional.
              </p>
            </div>
            <div className="space-y-4 md:w-1/3">
              {[
                "Lengkapi Profil & Kebutuhan Akomodasi",
                "Hubungkan Institusi Pendidikan/Pelatihan",
                "Muncul di Dashboard Rekrutmen Nasional"
              ].map((step, idx) => (
                <div key={idx} className="flex items-center gap-3 font-black uppercase italic tracking-tighter text-sm">
                  <div className="flex size-6 items-center justify-center rounded-full bg-blue-500 text-[10px] text-white not-italic">{idx + 1}</div>
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <div className="rounded-[4rem] border-8 border-slate-900 bg-blue-600 p-16 text-white shadow-[20px_20px_0px_0px_rgba(15,23,42,1)]">
              <h2 className="text-4xl font-black uppercase italic leading-none tracking-tighter md:text-6xl">
                Jadilah Talenta <br /> Masa Depan.
              </h2>
              <p className="mx-auto mt-8 max-w-2xl text-lg font-bold uppercase tracking-widest text-blue-100/70">
                Waktunya menunjukkan bahwa dengan data yang tepat, tidak ada gap yang tidak bisa dijembatani.
              </p>
              <div className="mt-12">
                <Link 
                  href="/daftar?role=talent"
                  className="rounded-2xl border-4 border-slate-900 bg-yellow-400 px-12 py-6 text-sm font-black uppercase italic tracking-[0.2em] text-slate-900 shadow-2xl transition-all hover:-translate-y-1 hover:bg-white active:translate-y-0"
                >
                  Daftar Sekarang & Mulai Pemetaan
                </Link>
              </div>
          </div>
        </div>
      </section>

    </div>
  );
}