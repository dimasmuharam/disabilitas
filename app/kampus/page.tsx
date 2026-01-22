import { Metadata } from "next";
import Link from "next/link";
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  BarChart3, 
  ArrowRight, 
  Building2, 
  Trophy, 
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

export const metadata: Metadata = {
  title: "Infrastruktur ULD Kampus Digital | Satu Data Alumni Disabilitas",
  description: "Digitalisasi Unit Layanan Disabilitas (ULD) Perguruan Tinggi. Automasi tracer study dan tingkatkan akreditasi kampus melalui pemetaan karir alumni disabilitas.",
  keywords: ["Tracer Study Kampus", "ULD Perguruan Tinggi", "Inklusi Pendidikan", "Akreditasi Kampus", "Data Alumni Disabilitas"],
};

export default function KampusLandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 selection:bg-emerald-100">
      
      {/* 1. HERO SECTION - Fokus pada Otoritas Institusi */}
      <section className="border-b-8 border-slate-900 bg-emerald-600 py-20 text-white lg:py-32">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8 text-left">
              <div className="inline-block rounded-xl border-4 border-slate-900 bg-yellow-400 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                Institutional Data Sync
              </div>
              <h1 className="text-5xl font-black uppercase italic leading-none tracking-tighter sm:text-6xl md:text-7xl">
                Digitalisasi Unit <br /> Layanan Disabilitas
              </h1>
              <p className="max-w-xl text-lg font-bold uppercase tracking-widest text-emerald-50">
                Pastikan alumni disabilitas Anda tidak sekadar lulus, namun terpetakan dan terserap secara profesional melalui integrasi data industri nasional.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/register?role=campus"
                  className="flex h-16 items-center justify-center rounded-2xl border-4 border-slate-900 bg-white px-10 text-sm font-black uppercase italic text-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                >
                  Daftarkan Institusi
                </Link>
                <Link
                  href="#leaderboard"
                  className="flex h-16 items-center justify-center gap-2 rounded-2xl border-4 border-slate-900 bg-slate-900 px-10 text-sm font-black uppercase italic text-white shadow-[6px_6px_0px_0px_rgba(16,185,129,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                >
                  <Trophy size={18} className="text-yellow-400" /> Lihat Ranking Nasional
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
               <div className="relative mx-auto flex aspect-square w-full max-w-[450px] items-center justify-center rounded-[3rem] border-8 border-slate-900 bg-white shadow-[20px_20px_0px_0px_rgba(15,23,42,1)]">
                  <GraduationCap size={180} className="text-slate-900" />
                  <div className="absolute -right-8 -top-8 animate-bounce rounded-3xl border-4 border-slate-900 bg-yellow-400 p-6 shadow-xl">
                    <ShieldCheck size={40} className="text-slate-900" />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. VALUE PROP: The Hook for Reputation (IKU & Akreditasi) */}
      <section id="leaderboard" className="border-b-4 border-slate-100 bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center justify-between gap-8 rounded-[3rem] border-4 border-slate-900 bg-white p-12 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] md:flex-row">
            <div className="text-left md:w-2/3">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">National Inclusion Index 2026</h2>
              <p className="mt-4 text-lg font-medium italic leading-relaxed text-slate-500">
                Posisikan institusi Anda dalam standar inklusivitas nasional. Kami menyediakan data akurat mengenai aksesibilitas kampus, kualitas ULD, hingga angka keterserapan kerja alumni untuk kebutuhan akreditasi.
              </p>
            </div>
            <Link href="/kampus/ranking" className="group flex items-center gap-4 rounded-2xl bg-emerald-600 px-8 py-5 text-sm font-black uppercase italic text-white transition-all hover:bg-slate-900">
              Buka Leaderboard <ArrowRight className="transition-transform group-hover:translate-x-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* 3. CORE MODULES: Peran Kampus sebagai Validator */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-16 text-left">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter">Mengapa Kampus Harus Terintegrasi?</h2>
            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">Standardisasi Layanan ULD Digital</p>
          </div>

          <div className="grid gap-10 md:grid-cols-3">
            {[
              { 
                icon: BookOpen, 
                title: "Verifikasi Kompetensi", 
                color: "emerald",
                desc: "Validasi data mahasiswa disabilitas Anda agar kualifikasi akademik mereka diakui secara sah oleh sistem rekrutmen nasional."
              },
              { 
                icon: BarChart3, 
                title: "Automasi Tracer Study", 
                color: "blue",
                desc: "Lacak karir alumni secara otomatis. Peroleh data statistik keterserapan kerja yang valid untuk laporan IKU (Indikator Kinerja Utama)."
              },
              { 
                icon: Users, 
                title: "Konektivitas Industri", 
                color: "purple",
                desc: "Hubungkan Unit Layanan Disabilitas Anda langsung ke dashboard HRD berbagai perusahaan mitra yang mencari talenta berkualitas."
              }
            ].map((f, i) => (
              <div key={i} className="group flex flex-col rounded-[2.5rem] border-4 border-slate-900 bg-white p-10 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all hover:-translate-y-2">
                <div className="mb-6 flex size-14 items-center justify-center rounded-2xl border-2 border-slate-900 bg-slate-50 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
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

      {/* 4. TARGET SINKRONISASI */}
      <section className="relative overflow-hidden bg-slate-900 py-24 text-white">
          <div className="container relative z-10 mx-auto max-w-7xl px-4">
            <h3 className="mb-12 text-left text-3xl font-black uppercase italic tracking-tighter">Ekosistem yang Kami Hubungkan</h3>
            <div className="grid gap-6 md:grid-cols-2">
               <div className="flex items-center gap-6 rounded-[2rem] border-2 border-white/10 bg-white/5 p-8 backdrop-blur-md">
                  <div className="rounded-2xl bg-emerald-500 p-4 text-slate-900 shadow-xl shadow-emerald-500/20"><GraduationCap size={32}/></div>
                  <div className="text-left">
                     <h4 className="text-xl font-black uppercase italic">Perguruan Tinggi</h4>
                     <p className="text-xs font-medium uppercase tracking-widest text-slate-400 opacity-80">Negeri & Swasta Nasional</p>
                  </div>
               </div>
               <div className="flex items-center gap-6 rounded-[2rem] border-2 border-white/10 bg-white/5 p-8 backdrop-blur-md">
                  <div className="rounded-2xl bg-blue-500 p-4 text-white shadow-xl shadow-blue-500/20"><Building2 size={32}/></div>
                  <div className="text-left">
                     <h4 className="text-xl font-black uppercase italic">Lembaga Vokasi</h4>
                     <p className="text-xs font-medium uppercase tracking-widest text-slate-400 opacity-80">Pusat Pelatihan & Sertifikasi</p>
                  </div>
               </div>
            </div>
          </div>
          <div className="absolute -bottom-20 -right-20 opacity-5">
            <GraduationCap size={400} />
          </div>
      </section>

      {/* 5. FINAL CTA: Reputasi & Valuasi */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <div className="rounded-[4rem] border-8 border-slate-900 bg-yellow-400 p-16 shadow-[20px_20px_0px_0px_rgba(15,23,42,1)]">
              <h2 className="text-4xl font-black uppercase italic leading-none tracking-tighter md:text-6xl">
                Tingkatkan Valuasi <br /> Inklusi Institusi Anda
              </h2>
              <p className="mx-auto mt-8 max-w-2xl text-lg font-bold uppercase tracking-widest text-slate-900/70">
                Wujudkan transisi karir lulusan yang terukur. Mari bangun jembatan data antara dunia pendidikan dan industri bersama kami.
              </p>
              <div className="mt-12 flex flex-col justify-center gap-4 sm:flex-row">
                <Link 
                  href="/register?role=campus"
                  className="rounded-2xl bg-slate-900 px-12 py-6 text-sm font-black uppercase italic tracking-[0.2em] text-white shadow-2xl transition-all hover:-translate-y-1 hover:bg-emerald-600 active:translate-y-0"
                >
                  Registrasi ULD Kampus
                </Link>
              </div>
          </div>
        </div>
      </section>
    </div>
  );
}