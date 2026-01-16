import Link from "next/link";
import { GraduationCap, BookOpen, Users, BarChart3, ArrowRight, Building2, Trophy, ShieldCheck } from "lucide-react";

export default function KampusLandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-slate-900 selection:bg-emerald-100">
      
      {/* HERO SECTION - Neubrutalism Style */}
      <section className="border-b-8 border-slate-900 bg-emerald-600 py-20 text-white lg:py-32">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="space-y-8 text-left">
              <div className="inline-block rounded-xl border-4 border-slate-900 bg-yellow-400 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                Institutional Partnership
              </div>
              <h1 className="text-5xl font-black uppercase italic tracking-tighter sm:text-6xl md:text-7xl leading-none">
                Digitalisasi Unit Layanan Disabilitas
              </h1>
              <p className="max-w-xl text-lg font-bold uppercase tracking-widest text-emerald-50">
                Pantau karir alumni disabilitas Anda agar tidak sekadar lulus, tapi terserap secara profesional di pasar kerja global.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/mitra"
                  className="flex h-16 items-center justify-center rounded-2xl border-4 border-slate-900 bg-white px-10 text-sm font-black uppercase italic text-slate-900 shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                >
                  Daftarkan Institusi
                </Link>
                <Link
                  href="/kampus/ranking"
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

      {/* SECTION RANKING PREVIEW (The Hook) */}
      <section className="bg-slate-50 py-20 border-b-4 border-slate-100">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col items-center justify-between gap-8 rounded-[3rem] border-4 border-slate-900 bg-white p-12 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] md:flex-row">
            <div className="text-left md:w-2/3">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter">National Inclusion Index 2026</h2>
              <p className="mt-4 text-lg font-medium text-slate-500 italic leading-relaxed">
                Cek posisi Universitas Anda dalam standar inklusivitas nasional. Kami mengukur aksesibilitas fisik, kualitas infrastruktur digital, dan keterserapan kerja alumni.
              </p>
            </div>
            <Link href="/kampus/ranking" className="group flex items-center gap-4 rounded-2xl bg-emerald-600 px-8 py-5 text-sm font-black uppercase italic text-white transition-all hover:bg-slate-900">
              Buka Leaderboard <ArrowRight className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* CORE FEATURES */}
      <section id="fitur" className="py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-16 text-left">
            <h2 className="text-4xl font-black uppercase italic tracking-tighter">Mengapa Kampus Harus Bergabung?</h2>
            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-600">Standardisasi Inklusi dari Hulu ke Hilir</p>
          </div>

          <div className="grid gap-10 md:grid-cols-3">
            {[
              { 
                icon: BookOpen, 
                title: "Database Talent Pool", 
                color: "emerald",
                desc: "Kumpulkan data mahasiswa disabilitas dalam satu dashboard yang rapi dan standar industri."
              },
              { 
                icon: BarChart3, 
                title: "Automatic Tracer Study", 
                color: "blue",
                desc: "Pantau keterserapan kerja alumni secara real-time untuk kebutuhan akreditasi institusi."
              },
              { 
                icon: Users, 
                title: "Koneksi Industri", 
                color: "purple",
                desc: "Hubungkan profil lulusan Anda langsung ke dashboard HRD mitra perusahaan nasional."
              }
            ].map((f, i) => (
              <div key={i} className="group flex flex-col rounded-[2.5rem] border-4 border-slate-900 bg-white p-10 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all hover:-translate-y-2">
                <f.icon className={`mb-6 size-14 text-${f.color}-600`} />
                <h3 className="mb-4 text-2xl font-black uppercase italic tracking-tighter">{f.title}</h3>
                <p className="flex-1 text-sm font-bold leading-relaxed text-slate-500 italic">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TARGET MITRA */}
      <section className="bg-slate-900 py-24 text-white overflow-hidden relative">
          <div className="container relative z-10 mx-auto max-w-7xl px-4">
            <h3 className="mb-12 text-left text-3xl font-black uppercase italic tracking-tighter">Siapa yang kami dampingi?</h3>
            <div className="grid gap-6 md:grid-cols-2">
               <div className="flex items-center gap-6 rounded-[2rem] border-2 border-white/10 bg-white/5 p-8 backdrop-blur-md">
                  <div className="rounded-2xl bg-emerald-500 p-4 text-slate-900 shadow-xl shadow-emerald-500/20"><GraduationCap size={32}/></div>
                  <div className="text-left">
                     <h4 className="text-xl font-black uppercase italic">Perguruan Tinggi</h4>
                     <p className="text-xs font-medium text-slate-400 opacity-80 uppercase tracking-widest">ULD & Pusat Karir Universitas</p>
                  </div>
               </div>
               <div className="flex items-center gap-6 rounded-[2rem] border-2 border-white/10 bg-white/5 p-8 backdrop-blur-md">
                  <div className="rounded-2xl bg-blue-500 p-4 text-white shadow-xl shadow-blue-500/20"><Building2 size={32}/></div>
                  <div className="text-left">
                     <h4 className="text-xl font-black uppercase italic">Lembaga Pelatihan</h4>
                     <p className="text-xs font-medium text-slate-400 opacity-80 uppercase tracking-widest">BLK, Bootcamp & DTS Komdigi</p>
                  </div>
               </div>
            </div>
          </div>
          {/* Decorative Pattern */}
          <div className="absolute -right-20 -bottom-20 opacity-5">
            <GraduationCap size={400} />
          </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <div className="rounded-[4rem] border-8 border-slate-900 bg-yellow-400 p-16 shadow-[20px_20px_0px_0px_rgba(15,23,42,1)]">
              <h2 className="text-4xl font-black uppercase italic tracking-tighter md:text-6xl leading-none">
                Tingkatkan Valuasi Institusi Anda
              </h2>
              <p className="mx-auto mt-8 max-w-2xl text-lg font-bold uppercase tracking-widest text-slate-900/70">
                Mari pastikan alumni disabilitas Anda mendapatkan kesempatan karir yang setara melalui integrasi data yang valid.
              </p>
              <div className="mt-12 flex flex-col justify-center gap-4 sm:flex-row">
                <Link 
                  href="/mitra"
                  className="rounded-2xl bg-slate-900 px-12 py-6 text-sm font-black uppercase italic tracking-[0.2em] text-white shadow-2xl transition-all hover:bg-emerald-600 hover:-translate-y-1 active:translate-y-0"
                >
                  Registrasi Lembaga (Gratis)
                </Link>
              </div>
          </div>
        </div>
      </section>

    </div>
  );
}