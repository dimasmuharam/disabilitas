import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { 
  Trophy, Medal, School, 
  ArrowUpRight, ShieldCheck, 
  Search, BarChart2, Info, 
  CheckCircle2, Monitor, TrendingUp
} from "lucide-react";
import Link from "next/link";

export const runtime = "edge";
export const revalidate = 3600; // Cache 1 jam agar data riset tetap segar

// 1. DYNAMIC SEO METADATA
export const metadata: Metadata = {
  title: "TOP 50 Kampus Paling Inklusif Indonesia 2026 | National Inclusion Index",
  description: "Daftar peringkat universitas terbaik berdasarkan aksesibilitas fasilitas fisik, layanan infrastruktur digital, dan keberhasilan karir alumni disabilitas.",
  alternates: { canonical: "https://disabilitas.com/kampus/ranking" },
  openGraph: {
    title: "National Inclusion Index 2026",
    description: "Cek peringkat inklusivitas kampus Anda di disabilitas.com",
    images: ["https://disabilitas.com/api/og/ranking"],
  },
};

export default async function CampusRankingPage() {
  // Menarik data dengan agregasi skor inklusi tertinggi
  const { data: campuses, error } = await supabase
    .from("campuses")
    .select(`
      id, name, location, 
      inclusion_score, 
      inclusion_score_physical, 
      inclusion_score_digital, 
      inclusion_score_output,
      stats_academic_total
    `)
    .order("inclusion_score", { ascending: false })
    .limit(50);

  if (error) return (
    <div className="flex min-h-screen items-center justify-center p-20 font-black uppercase italic tracking-tighter">
      DATABASE_SYNC_ERROR: Gagal Menarik Data Ranking Nasional
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-emerald-100">
      
      {/* 2. HERO SECTION - National Index Branding */}
      <header className="relative overflow-hidden border-b-8 border-slate-900 bg-emerald-600 px-4 py-20 text-white lg:py-32">
        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-3xl space-y-6 text-left">
              <div className="inline-flex items-center gap-2 rounded-full border-2 border-white/20 bg-slate-900 px-5 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">
                <Trophy size={14} /> Official National Index 2026
              </div>
              <h1 className="text-6xl font-black uppercase italic leading-none tracking-tighter lg:text-9xl">
                National <br /> Leaderboard
              </h1>
              <p className="max-w-xl text-lg font-bold uppercase leading-tight tracking-widest opacity-90 lg:text-2xl">
                Memetakan Standar Pendidikan Tinggi Inklusif & Transisi Karir Disabilitas di Indonesia.
              </p>
            </div>
            <div className="hidden rotate-12 opacity-20 lg:block">
               <BarChart2 size={300} />
            </div>
          </div>
        </div>
        {/* Background Decorative Element */}
        <div className="absolute -bottom-20 -right-20 opacity-10">
          <ShieldCheck size={500} />
        </div>
      </header>

      {/* 3. SEARCH & ANALYTICS BAR */}
      <nav className="sticky top-0 z-20 border-b-4 border-slate-900 bg-white py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 md:flex-row">
           <div className="flex items-center gap-4 text-left">
              <div className="hidden size-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400 sm:flex">
                 <Search size={20} />
              </div>
              <div>
                 <h2 className="text-xl font-black uppercase italic leading-none tracking-tighter">Peringkat Terverifikasi</h2>
                 <p className="mt-1 text-[10px] font-black uppercase italic tracking-widest text-slate-400">Total: {campuses?.length} Institusi Unggulan</p>
              </div>
           </div>
           <div className="flex w-full items-center gap-3 md:w-auto">
              <input 
                type="text" 
                placeholder="Cari Universitas..." 
                className="flex-1 rounded-2xl border-4 border-slate-900 bg-white px-6 py-3 text-sm font-bold shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] outline-none transition-all focus:ring-4 focus:ring-emerald-100 md:w-80"
              />
           </div>
        </div>
      </nav>

      {/* 4. RANKING LIST ENGINE */}
      <main className="mx-auto max-w-7xl px-4 py-20">
        <div className="grid grid-cols-1 gap-8">
          {campuses?.map((campus, index) => {
            const isTop3 = index < 3;
            const isCriticalDigital = (campus.inclusion_score_digital || 0) < 50;

            return (
              <Link 
                href={`/kampus/${campus.id}`} 
                key={campus.id}
                className={`group relative flex flex-col items-center justify-between gap-10 rounded-[3.5rem] border-4 border-slate-900 p-10 transition-all hover:-translate-y-2 hover:shadow-[15px_15px_0px_0px_rgba(15,23,42,1)] md:flex-row ${isTop3 ? 'bg-slate-50' : 'bg-white'}`}
              >
                {/* RANK & NAME */}
                <div className="flex shrink-0 items-center gap-8 md:w-2/5">
                  <div className={`flex size-20 shrink-0 items-center justify-center rounded-3xl border-4 border-slate-900 text-3xl font-black italic shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transition-all ${index === 0 ? 'bg-yellow-400' : index === 1 ? 'bg-slate-200' : index === 2 ? 'bg-orange-300' : 'bg-white group-hover:bg-slate-900 group-hover:text-white'}`}>
                    {index + 1}
                  </div>
                  <div className="text-left">
                    <h3 className="text-2xl font-black uppercase italic leading-tight tracking-tighter text-slate-900 transition-colors group-hover:text-emerald-600">{campus.name}</h3>
                    <p className="mt-1 text-xs font-black uppercase italic tracking-widest text-slate-400">{campus.location}</p>
                  </div>
                </div>

                {/* BREAKDOWN PILLS */}
                <div className="flex flex-1 flex-wrap justify-center gap-6 md:justify-center">
                   {[
                     { label: "Fisik", score: campus.inclusion_score_physical, icon: School, color: "emerald" },
                     { label: "Digital", score: campus.inclusion_score_digital, icon: Monitor, color: isCriticalDigital ? "orange" : "blue" },
                     { label: "Output", score: campus.inclusion_score_output, icon: TrendingUp, color: "purple" }
                   ].map((item) => (
                     <div key={item.label} className="flex flex-col items-center gap-2">
                        <div className={`flex items-center gap-2 rounded-xl border-2 border-slate-900 bg-white px-4 py-2 text-[10px] font-black uppercase shadow-[3px_3px_0px_0px_rgba(15,23,42,1)]`}>
                          <item.icon size={12} className={`text-${item.color}-500`} />
                          {item.label}: {item.score}%
                        </div>
                        {item.label === "Digital" && isCriticalDigital && (
                          <span className="shrink-0 animate-pulse text-[8px] font-black uppercase text-orange-600">Butuh Audit!</span>
                        )}
                     </div>
                   ))}
                </div>

                {/* AGGREGATE SCORE */}
                <div className="flex shrink-0 items-center gap-8 md:w-1/4 md:justify-end">
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase leading-none tracking-[0.2em] text-emerald-600">Final Index</p>
                    <p className="mt-1 text-5xl font-black italic tracking-tighter text-slate-900">{campus.inclusion_score}%</p>
                  </div>
                  <div className="rounded-2xl border-4 border-slate-900 bg-white p-4 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all group-hover:bg-slate-900 group-hover:text-white">
                    <ArrowUpRight size={24} />
                  </div>
                </div>

                {/* CHAMPION BADGE */}
                {index === 0 && (
                  <div className="absolute -top-6 left-12 animate-bounce rounded-2xl border-4 border-slate-900 bg-yellow-400 px-6 py-2 text-[11px] font-black uppercase italic shadow-lg">
                    🥇 No. 1 Nasional
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </main>

      {/* 5. DYNAMIC FOOTER - EDUCATING THE MARKET */}
      <section className="mx-auto max-w-7xl px-4 py-32">
        <div className="relative overflow-hidden rounded-[4rem] border-8 border-slate-900 bg-slate-900 p-12 text-left text-white lg:p-24">
          <div className="relative z-10 grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div className="space-y-8">
               <h2 className="text-5xl font-black uppercase italic leading-none tracking-tighter">
                Cara Kami <br /> <span className="text-emerald-400">Menghitung Valuasi.</span>
               </h2>
               <div className="space-y-6">
                 <div className="flex gap-4">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 font-black text-slate-900">1</div>
                    <p className="text-lg font-medium italic leading-relaxed opacity-80">
                      <strong>Klaster Fisik (30%):</strong> Verifikasi ketersediaan guiding block, ramp, dan toilet aksesibel.
                    </p>
                 </div>
                 <div className="flex gap-4">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-500 font-black text-slate-900">2</div>
                    <p className="text-lg font-medium italic leading-relaxed opacity-80">
                      <strong>Klaster Digital (40%):</strong> Audit standar WCAG pada website portal kampus dan platform LMS.
                    </p>
                 </div>
                 <div className="flex gap-4">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-purple-500 font-black text-slate-900">3</div>
                    <p className="text-lg font-medium italic leading-relaxed opacity-80">
                      <strong>Klaster Output (30%):</strong> Akumulasi alumni disabilitas yang terserap di industri mitra.
                    </p>
                 </div>
               </div>
            </div>
            <div className="space-y-6 rounded-[3rem] border-4 border-white/10 bg-white/5 p-10">
               <Info className="text-orange-400" size={48} />
               <h3 className="text-2xl font-black uppercase italic leading-tight tracking-tighter">Pemberitahuan Audit Digital</h3>
               <p className="text-sm font-medium italic leading-relaxed opacity-60">
                 Halaman Ranking ini bersifat transparan. Kampus dengan skor digital di bawah 50% sangat direkomendasikan untuk melakukan 
                 audit aksesibilitas digital profesional guna menjamin hak informasi mahasiswa disabilitas.
               </p>
               <button className="w-full rounded-2xl bg-white py-5 text-[11px] font-black uppercase tracking-widest text-slate-900 transition-all hover:bg-emerald-400">
                 Konsultasi Audit Sekarang
               </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}