import { Metadata } from "next";
import Link from "next/link";
import { 
  Handshake, 
  ArrowRight, 
  ShieldCheck, 
  Users, 
  Target, 
  LineChart,
  ClipboardCheck,
  CheckCircle2,
  Zap
} from "lucide-react";

/**
 * SEO OPTIMIZATION
 * Target: Lembaga Pelatihan, DPO, dan Organisasi Disabilitas
 */
export const metadata: Metadata = {
  title: "Kemitraan Strategis & Validasi Alumni | Disabilitas.com",
  description: "Hubungkan alumni pelatihan disabilitas Anda dengan industri. Tingkatkan akuntabilitas program melalui tracking keterserapan kerja yang terintegrasi.",
  keywords: [
    "kemitraan disabilitas", 
    "organisasi disabilitas", 
    "DPO Indonesia", 
    "pelatihan kerja disabilitas", 
    "tracer study alumni"
  ],
};

export default function PartnerLandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 selection:bg-emerald-100">
      
      {/* 1. HERO SECTION - Fokus pada Dampak & Keberlanjutan */}
      <section className="border-b-8 border-slate-900 bg-emerald-600 py-20 text-white lg:py-32">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8 text-left">
              <div className="inline-block rounded-xl border-4 border-slate-900 bg-yellow-400 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                Training & Community Partnership
              </div>
              <h1 className="text-5xl font-black uppercase italic leading-none tracking-tighter sm:text-6xl md:text-7xl">
                Pastikan Pelatihan <br /> Menjadi Pekerjaan
              </h1>
              <p className="max-w-xl text-lg font-bold uppercase tracking-widest text-emerald-50">
                Hubungkan alumni pelatihan Anda langsung dengan radar industri. Pantau dampak program Anda melalui sistem pelacakan transisi karier yang akurat dan terintegrasi.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/register?role=partner"
                  className="flex h-16 items-center justify-center rounded-2xl border-4 border-slate-900 bg-white px-10 text-sm font-black uppercase italic text-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                >
                  Daftar Sebagai Mitra
                </Link>
                <Link
                  href="/masuk"
                  className="flex h-16 items-center justify-center gap-2 rounded-2xl border-4 border-slate-900 bg-slate-900 px-10 text-sm font-black uppercase italic text-white shadow-[6px_6px_0px_0px_rgba(16,185,129,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                >
                  Portal Manajemen Mitra
                </Link>
              </div>
            </div>

            {/* VISUAL ELEMENT: Connectivity Graph Concept */}
            <div className="hidden lg:block">
              <div className="relative mx-auto flex aspect-square w-full max-w-[450px] items-center justify-center rounded-[3rem] border-8 border-slate-900 bg-white shadow-[20px_20px_0px_0px_rgba(15,23,42,1)]">
                <Handshake size={180} className="text-emerald-600" />
                <div className="absolute -left-8 top-10 rounded-3xl border-4 border-slate-900 bg-blue-500 p-6 text-white shadow-xl">
                  <LineChart size={40} />
                  <p className="mt-2 text-[10px] font-black uppercase italic text-center">Impact Tracking</p>
                </div>
                <div className="absolute -right-8 bottom-10 rounded-3xl border-4 border-slate-900 bg-yellow-400 p-6 text-slate-900 shadow-xl">
                  <Zap size={40} />
                  <p className="mt-2 text-[10px] font-black uppercase italic text-center">Skill Validation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VALUE PROPOSITION: Menghubungkan Celah Pelatihan */}
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-4 text-center lg:text-left">
          <div className="mb-16">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 sm:text-5xl">Menjembatani Celah Pelatihan & Dunia Kerja</h2>
            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">Akuntabilitas Data bagi Organisasi & Komunitas</p>
          </div>

          <div className="grid gap-10 md:grid-cols-3">
            {[
              {
                icon: LineChart,
                title: "Tracer Study Alumni",
                desc: "Pantau secara otomatis transisi alumni Anda. Identifikasi siapa yang telah bekerja dan pastikan relevansi pelatihan Anda dengan kebutuhan industri."
              },
              {
                icon: Target,
                title: "Rekrutmen Peserta",
                desc: "Gunakan database talenta nasional untuk menemukan calon peserta pelatihan yang paling sesuai dengan target dan kriteria program organisasi Anda."
              },
              {
                icon: ClipboardCheck,
                title: "Validasi Kompetensi",
                desc: "Sertifikasi yang Anda berikan akan tersemat secara permanen di profil publik talenta, memberikan sinyal kualifikasi yang kuat bagi pemberi kerja."
              }
            ].map((v, i) => (
              <div key={i} className="group flex flex-col rounded-[2.5rem] border-4 border-slate-900 bg-white p-10 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all hover:-translate-y-2">
                <div className="mb-6 flex size-16 items-center justify-center rounded-2xl border-2 border-slate-900 bg-emerald-50 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                  <v.icon className="size-8 text-emerald-700" />
                </div>
                <h3 className="mb-4 text-2xl font-black uppercase italic leading-none">{v.title}</h3>
                <p className="text-sm font-bold italic leading-relaxed text-slate-500">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SCIENTIFIC/SOCIAL PROOF SECTION */}
      <section className="bg-slate-900 py-24 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="mb-8 inline-flex size-16 items-center justify-center rounded-full bg-emerald-500">
            <ShieldCheck size={32} />
          </div>
          <blockquote className="text-2xl font-black italic leading-tight text-white md:text-4xl">
            &ldquo;Melalui platform ini, kami akhirnya memiliki data konkret untuk membuktikan dampak program pelatihan kami di hadapan donor dan pemerintah.&rdquo;
          </blockquote>
          <footer className="mt-8 text-sm font-black uppercase tracking-[0.3em] text-emerald-400">
            — Koordinator Program Inklusi Komunitas
          </footer>
        </div>
      </section>

      {/* 4. FINAL CALL TO ACTION */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <div className="rounded-[4rem] border-8 border-slate-900 bg-emerald-600 p-16 text-white shadow-[20px_20px_0px_0px_rgba(15,23,42,1)]">
            <h2 className="text-4xl font-black uppercase italic leading-none md:text-6xl">
              Bersama Membangun <br /> Ekosistem Karier
            </h2>
            <p className="mx-auto mt-8 max-w-2xl text-lg font-bold uppercase tracking-widest text-emerald-100/70">
              Jangan biarkan data talenta terfragmentasi. Integrasikan program pelatihan dan database komunitas Anda sekarang.
            </p>
            <div className="mt-12 flex flex-col justify-center gap-4 sm:flex-row">
              <Link 
                href="/register?role=partner"
                className="rounded-2xl border-4 border-slate-900 bg-yellow-400 px-12 py-6 text-sm font-black uppercase italic tracking-[0.2em] text-slate-900 shadow-2xl transition-all hover:-translate-y-1 hover:bg-white active:translate-y-0"
              >
                Gabung Sebagai Mitra
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}