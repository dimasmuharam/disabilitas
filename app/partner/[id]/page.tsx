export const runtime = "edge";

import React from "react";
import { supabase } from "@/lib/supabase";
import { 
  GraduationCap, MapPin, Users, 
  CheckCircle2, Globe, Mail,
  ShieldCheck, Zap, Award,
  ArrowRight, Info, BookOpen, 
  ExternalLink, BarChart3,
  TrendingUp, Target, Calendar,
  Gem, Accessibility
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

// --- SEO METADATA ---
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { data: partner } = await supabase.from("partners").select("name, description").eq("id", params.id).single();
  return {
    title: `${partner?.name || "Profil Partner"} | disabilitas.com`,
    description: partner?.description || "Detail kontribusi institusi dalam pemberdayaan talenta disabilitas.",
    alternates: { canonical: `https://www.disabilitas.com/partner/${params.id}` },
  };
}

export default async function PublicPartnerProfile({ params }: { params: { id: string } }) {
  // 1. FETCH DATA UTAMA
  const { data: partner, error } = await supabase.from("partners").select("*").eq("id", params.id).single();
  const { data: trainings } = await supabase.from("trainings").select("*").eq("partner_id", params.id).order("start_date", { ascending: false });

  if (error || !partner) return <div className="flex min-h-screen items-center justify-center font-black uppercase italic text-slate-400">Institusi Tidak Ditemukan</div>;

  // 2. FETCH DATA RISET TALENTA (TRIPLE SYNC LOGIC)
  const { data: certs } = await supabase.from("certifications").select("profile_id").eq("organizer_name", partner.name);
  const certProfileIds = Array.from(new Set(certs?.map(c => c.profile_id) || []));
  
  const { data: talenta } = await supabase.from("profiles").select("id, disability_type, career_status")
    .or(`university.eq."${partner.name}",id.in.(${certProfileIds.length > 0 ? certProfileIds.map(id => `'${id}'`).join(',') : "'00000000-0000-0000-0000-000000000000'"})`);

  // 3. KALKULASI STATISTIK & NARASI
  const totalImpact = talenta?.length || 0;
  const employed = talenta?.filter(t => !["Job Seeker", "Belum Bekerja", "Pelajar / Mahasiswa", "Fresh Graduate"].includes(t.career_status)).length || 0;
  const employabilityRate = totalImpact > 0 ? Math.round((employed / totalImpact) * 100) : 0;
  
  const disabilityDist: Record<string, number> = {};
  talenta?.forEach(t => { if (t.disability_type) disabilityDist[t.disability_type] = (disabilityDist[t.disability_type] || 0) + 1; });

  const isUni = partner.category === "Perguruan Tinggi";
  const labelTalent = isUni ? "Mahasiswa & Alumni" : "Peserta Pelatihan";
  
  // LOGIKA BADGE & TINGKATAN INKLUSI
  const score = partner.inclusion_score || 0;
  let badgeConfig = {
    label: "Emerging Inclusive Partner",
    level: "Bronze",
    color: "text-blue-700 bg-blue-50 border-blue-200",
    progressColor: "bg-blue-500",
    icon: <ShieldCheck size={24} />,
    description: "Institusi ini mulai memetakan ekosistem inklusif dan berkomitmen pada pengembangan talenta disabilitas."
  };

  if (score >= 85) {
    badgeConfig = {
      label: "Inclusion Excellence Center",
      level: "Gold",
      color: "text-amber-700 bg-amber-50 border-amber-200",
      progressColor: "bg-amber-500",
      icon: <Gem size={24} />,
      description: "Institusi ini adalah pusat unggulan inklusi nasional dengan rekam jejak pemberdayaan yang komprehensif."
    };
  } else if (score >= 50) {
    badgeConfig = {
      label: "Inclusive Growth Leader",
      level: "Silver",
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      progressColor: "bg-emerald-500",
      icon: <Award size={24} />,
      description: "Menunjukkan kepemimpinan dalam inklusivitas dengan dampak nyata pada peningkatan kompetensi kerja talenta."
    };
  }

  const activeTrainings = trainings?.filter(t => t.is_published && new Date(t.end_date || '') >= new Date()) || [];
  const archivedTrainings = trainings?.filter(t => t.is_published && new Date(t.end_date || '') < new Date()) || [];

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 font-sans leading-relaxed text-slate-900">
      <header className="border-b-2 border-slate-100 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-end">
            <div className="flex size-32 shrink-0 items-center justify-center rounded-[2.5rem] border-4 border-white bg-slate-900 text-white shadow-2xl animate-in zoom-in">
              <GraduationCap size={60} />
            </div>
            
            <div className="flex-1 space-y-4 text-center lg:text-left">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                  <h1 className="text-4xl font-black uppercase italic tracking-tighter">{partner.name}</h1>
                  <div className="flex items-center gap-1 rounded-full bg-blue-600 px-4 py-1.5 text-white shadow-lg">
                    <CheckCircle2 size={14} />
                    <span className="text-[10px] font-black uppercase italic tracking-widest text-white">Verified Partner</span>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 lg:justify-start">
                  <span className="flex items-center gap-2 italic"><BookOpen size={16} className="text-blue-600" /> {partner.category}</span>
                  <span className="flex items-center gap-2 italic"><MapPin size={16} className="text-red-600" /> {partner.location}</span>
                </div>
              </div>
            </div>

            {/* INCLUSION SCORE CARD */}
            <div className={`max-w-xs rounded-[2.5rem] border-2 p-6 shadow-sm md:max-w-sm ${badgeConfig.color}`}>
              <div className="mb-4 flex items-center gap-4">
                <div className="rounded-2xl bg-white p-3 shadow-sm">{badgeConfig.icon}</div>
                <div className="flex-1 text-left">
                  <div className="mb-1 flex items-end justify-between">
                    <h3 className="text-sm font-black uppercase leading-none tracking-tighter">{badgeConfig.label}</h3>
                    <span className="text-xs font-black italic">{score}%</span>
                  </div>
                  <div className="border-current/10 h-2 w-full overflow-hidden rounded-full border bg-white/50">
                    <div className={`h-full ${badgeConfig.progressColor} transition-all duration-1000`} style={{ width: `${score}%` }}></div>
                  </div>
                </div>
              </div>
              <p className="border-current/10 border-t pt-3 text-[11px] font-bold italic leading-relaxed opacity-80 text-left">
                {badgeConfig.description}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-16 text-left">
        <div className="grid gap-16 lg:grid-cols-3">
          
          <div className="space-y-20 lg:col-span-2">
            {/* TENTANG INSTITUSI */}
            <section className="space-y-6 text-left">
              <h2 className="flex items-center gap-3 text-2xl font-black uppercase italic tracking-tighter text-slate-900">
                <Info className="text-blue-600" size={28} /> Visi & Komitmen Inklusi
              </h2>
              <div className="rounded-[3rem] border-2 border-slate-100 bg-white p-10 shadow-sm italic text-left">
                <p className="whitespace-pre-line text-lg font-medium leading-relaxed text-slate-700">
                  {partner.description || "Institusi ini berkomitmen menciptakan akses pendidikan dan pelatihan yang setara bagi talenta disabilitas."}
                </p>
              </div>
            </section>

            {/* PROGRAM AKTIF */}
            <section className="space-y-8 text-left">
              <div className="flex items-center justify-between border-b-4 border-blue-600 pb-4">
                <h2 className="flex items-center gap-3 text-2xl font-black uppercase italic tracking-tighter">
                  <Zap className="fill-amber-500 text-amber-500" size={32} /> Program Berjalan
                </h2>
                <span className="text-xl font-black uppercase italic text-blue-600">{activeTrainings.length} Batch</span>
              </div>
              
              <div className="grid gap-6">
                {activeTrainings.length > 0 ? activeTrainings.map((t) => (
                  <Link key={t.id} href={`/pelatihan/${t.id}`} className="group flex flex-col items-center justify-between gap-8 rounded-[3.5rem] border-2 border-slate-100 bg-white p-8 shadow-sm transition-all hover:border-slate-900 hover:shadow-2xl md:flex-row text-left">
                    <div className="flex-1 space-y-4">
                      <div className="space-y-1">
                        <h3 className="text-2xl font-black uppercase italic leading-tight tracking-tighter transition-colors group-hover:text-blue-600">{t.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase italic tracking-tighter text-blue-600">
                          <span className="rounded-lg bg-blue-50 px-3 py-1 border border-blue-100">Pendaftaran Terbuka</span>
                          <span className="text-slate-400 flex items-center gap-1"><Calendar size={12} /> Mulai: {new Date(t.start_date).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-3xl bg-slate-900 p-5 text-white shadow-xl transition-all group-hover:translate-x-2 group-hover:bg-blue-600">
                       <ArrowRight size={24} />
                    </div>
                  </Link>
                )) : (
                  <div className="rounded-[4rem] border-4 border-dashed border-slate-100 bg-slate-50 p-20 text-center font-black uppercase italic tracking-[0.2em] text-slate-400 opacity-50">Belum ada program pelatihan aktif.</div>
                )}
              </div>
            </section>
          </div>

          {/* SIDEBAR ANALYTICS */}
          <aside className="space-y-12 text-left">
            <section className="relative overflow-hidden rounded-[3.5rem] bg-slate-900 p-10 text-white shadow-2xl">
              <div className="absolute -bottom-4 -right-4 rotate-12 opacity-10"><BarChart3 size={120} /></div>
              <h4 className="mb-10 border-b border-white/10 pb-4 text-[10px] font-black uppercase tracking-widest text-blue-400">Impact Analytics</h4>
              <div className="relative z-10 space-y-10">
                <div className="flex items-end justify-between border-l-4 border-blue-600 pl-6">
                  <div>
                    <p className="text-3xl font-black italic leading-none text-white">{totalImpact} Orang</p>
                    <p className="mt-2 text-[8px] font-black uppercase italic tracking-tighter text-slate-400">{labelTalent} Terpeta</p>
                  </div>
                  <div className="text-right">
                    <TrendingUp size={24} className="mb-1 ml-auto text-emerald-400" />
                    <p className="text-xl font-black italic text-emerald-400">{employabilityRate}%</p>
                    <span className="text-[7px] font-black uppercase text-slate-500 tracking-tighter leading-none">Terserap Kerja</span>
                  </div>
                </div>
                
                <div className="space-y-4 rounded-[2rem] border border-white/10 bg-white/5 p-6">
                  <p className="text-[10px] font-medium italic leading-relaxed text-slate-300">
                    Berdasarkan audit riset disabilitas.com, {partner.name} menunjukkan kontribusi signifikan dalam memberdayakan {totalImpact} talenta dengan berbagai ragam disabilitas.
                  </p>
                </div>
              </div>
            </section>

            {/* SEBARAN RAGAM DISABILITAS - GRAFIS VISUAL */}
            <section className="space-y-8 rounded-[3.5rem] border-2 border-slate-900 bg-white p-10 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)] text-left">
              <h3 className="flex items-center gap-3 text-lg font-black uppercase tracking-tighter">
                <Users size={24} className="text-blue-600" /> Spektrum Inklusi
              </h3>
              <div className="space-y-6">
                {Object.entries(disabilityDist).map(([type, count]) => (
                  <div key={type} className="space-y-2">
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter text-slate-600">
                      <span>{type}</span>
                      <span>{Math.round((count/totalImpact)*100)}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-50">
                      <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600" style={{ width: `${(count/totalImpact)*100}%` }}></div>
                    </div>
                  </div>
                ))}
                {totalImpact === 0 && <p className="text-center text-[10px] font-black uppercase italic text-slate-300">Data spektrum belum tersedia.</p>}
              </div>
            </section>

            <section className="space-y-10 rounded-[3.5rem] border-2 border-slate-100 bg-white p-10 shadow-sm">
              <h3 className="flex items-center gap-3 text-lg font-black uppercase tracking-tighter text-left">
                <Accessibility className="text-emerald-600" size={24} /> Akomodasi
              </h3>
              <div className="flex flex-wrap gap-2">
                {partner.master_accommodations_provided?.map((item: string, idx: number) => (
                  <span key={idx} className="rounded-xl bg-emerald-50 px-3 py-2 text-[9px] font-black uppercase tracking-tight text-emerald-700 border border-emerald-100 shadow-sm">
                    {item}
                  </span>
                ))}
              </div>
            </section>

            <button 
              className="flex w-full items-center justify-center gap-3 rounded-[2rem] border-2 border-slate-200 bg-white py-5 text-[10px] font-black uppercase tracking-widest text-slate-900 transition-all hover:border-slate-900"
              onClick={() => {
                const url = `https://www.disabilitas.com/partner/${partner.id}`;
                navigator.clipboard.writeText(`Lihat kontribusi inklusif ${partner.name} dalam memberdayakan talenta disabilitas: ${url}`);
                alert("Link Profil Publik disalin!");
              }}
            >
              <Share2 size={18} /> Bagikan Etalase Inklusi
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
}
