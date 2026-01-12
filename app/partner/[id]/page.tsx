export const runtime = "edge";

import React from "react";
import { supabase } from "@/lib/supabase";
import { 
  GraduationCap, MapPin, CheckCircle2, 
  Globe, Mail, ShieldCheck, Zap, 
  Award, ArrowRight, Info, BookOpen, 
  BarChart3, TrendingUp, Calendar,
  Gem, Accessibility, Share2, Users
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { data: partner } = await supabase.from("partners").select("name").eq("id", params.id).single();
  return { title: `${partner?.name || "Profil Partner"} | disabilitas.com` };
}

export default async function PublicPartnerProfile({ params }: { params: { id: string } }) {
  // 1. Ambil data dengan metode paling stabil (Single Query)
  const { data: partner, error } = await supabase
    .from("partners")
    .select("*")
    .eq("id", params.id)
    .single();

  // Proteksi 404
  if (error || !partner) {
    return <div className="flex min-h-screen items-center justify-center font-black uppercase italic text-slate-400">Institusi Tidak Ditemukan</div>;
  }

  // 2. Fetch data pelatihan (terpisah agar tidak memberatkan join)
  const { data: trainings } = await supabase
    .from("trainings")
    .select("*")
    .eq("partner_id", partner.id)
    .eq("is_published", true)
    .order("start_date", { ascending: false });

  // 3. Kalkulasi Statistik dengan "Hard Fallback" (Mencegah crash jika data null)
  const isUni = partner.category === "Perguruan Tinggi";
  
  // Konversi eksplisit ke Number untuk mencegah "Application Error"
  const statAcademicTotal = Number(partner.stats_academic_total || 0);
  const statImpactTotal = Number(partner.stats_impact_total || 0);
  const totalTalenta = statAcademicTotal + statImpactTotal;

  const statAcademicHired = Number(partner.stats_academic_hired || 0);
  const statImpactHired = Number(partner.stats_impact_hired || 0);
  const totalHired = statAcademicHired + statImpactHired;

  const employabilityRate = totalTalenta > 0 ? Math.round((totalHired / totalTalenta) * 100) : 0;
  
  // Parsing JSONB dengan aman
  const disMap = (partner.stats_disability_map as Record<string, number>) || {};
  const genMap = (partner.stats_gender_map as Record<string, number>) || { male: 0, female: 0 };
  const score = Number(partner.inclusion_score || 0);

  let badge = { label: "Emerging Partner", icon: <ShieldCheck size={24} />, color: "text-blue-700 bg-blue-50 border-blue-200", pColor: "bg-blue-500" };
  if (score >= 85) badge = { label: "Inclusion Champion", icon: <Gem size={24} />, color: "text-amber-700 bg-amber-50 border-amber-200", pColor: "bg-amber-500" };
  else if (score >= 50) badge = { label: "Inclusion Leader", icon: <Award size={24} />, color: "text-emerald-700 bg-emerald-50 border-emerald-200", pColor: "bg-emerald-600" };

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 font-sans leading-relaxed text-slate-900">
      <header className="border-b-2 border-slate-100 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-end">
            <div className="flex size-32 shrink-0 animate-in zoom-in items-center justify-center rounded-[2.5rem] border-4 border-white bg-slate-900 text-white shadow-2xl">
              <GraduationCap size={60} />
            </div>
            
            <div className="flex-1 space-y-4 text-center lg:text-left">
              <div className="space-y-2 text-left">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">{partner.name}</h1>
                  <div className="flex items-center gap-1 rounded-full bg-blue-600 px-4 py-1.5 text-white shadow-lg">
                    <CheckCircle2 size={14} />
                    <span className="text-[10px] font-black uppercase italic tracking-widest text-white">Verified Partner</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  <span className="flex items-center gap-2 italic"><BookOpen size={16} className="text-blue-600" /> {partner.category}</span>
                  <span className="flex items-center gap-2 italic"><MapPin size={16} className="text-red-600" /> {partner.location}</span>
                </div>
              </div>
            </div>

            <div className={`max-w-xs rounded-[2.5rem] border-2 p-6 shadow-sm md:max-w-sm ${badge.color} text-left`}>
              <div className="mb-4 flex items-center gap-4">
                <div className="rounded-2xl bg-white p-3 shadow-sm">{badge.icon}</div>
                <div className="flex-1">
                  <div className="mb-1 flex items-end justify-between">
                    <h3 className="text-sm font-black uppercase leading-none tracking-tighter">{badge.label}</h3>
                    <span className="text-xs font-black italic">{score}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full border border-current/10 bg-white/50">
                    <div className={`h-full ${badge.pColor} transition-all duration-1000`} style={{ width: `${score}%` }}></div>
                  </div>
                </div>
              </div>
              <p className="border-t border-current/10 pt-3 text-[11px] font-bold italic leading-relaxed opacity-80 text-left">Institusi ini berkomitmen pada standar inklusivitas berkelanjutan.</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-16 text-left">
        <div className="grid gap-16 lg:grid-cols-3">
          <div className="space-y-20 lg:col-span-2 text-left">
            <section className="space-y-6 text-left">
              <h2 className="flex items-center gap-3 text-2xl font-black uppercase italic tracking-tighter text-slate-900">
                <Info className="text-blue-600" size={28} /> Visi & Komitmen Inklusi
              </h2>
              <div className="rounded-[3rem] border-2 border-slate-100 bg-white p-10 italic shadow-sm text-left">
                <p className="whitespace-pre-line text-lg font-medium leading-relaxed text-slate-700">
                  {partner.description || "Institusi ini berkomitmen mendukung terciptanya akses yang setara bagi talenta disabilitas."}
                </p>
              </div>
            </section>

            <section className="space-y-8 text-left">
              <div className="flex items-center justify-between border-b-4 border-blue-600 pb-4 text-left">
                <h2 className="flex items-center gap-3 text-2xl font-black uppercase italic tracking-tighter">
                  <Zap className="fill-amber-500 text-amber-500" size={32} /> Program Berjalan
                </h2>
                <span className="text-xl font-black uppercase italic text-blue-600">{trainings?.length || 0} Batch</span>
              </div>
              <div className="grid gap-6">
                {trainings && trainings.length > 0 ? trainings.map((t) => (
                  <Link key={t.id} href={`/pelatihan/${t.id}`} className="group flex flex-col items-center justify-between gap-8 rounded-[3.5rem] border-2 border-slate-100 bg-white p-8 shadow-sm transition-all hover:border-slate-900 hover:shadow-2xl md:flex-row text-left">
                    <div className="flex-1 space-y-4 text-left">
                      <div className="space-y-1">
                        <h3 className="text-2xl font-black uppercase italic leading-tight tracking-tighter transition-colors group-hover:text-blue-600">{t.title}</h3>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase italic tracking-tighter text-blue-600">
                          <span className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-1 text-blue-600">Pendaftaran Terbuka</span>
                          <span className="flex items-center gap-1 text-slate-400 italic leading-none"><Calendar size={12} /> Mulai: {new Date(t.start_date).getFullYear()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-3xl bg-slate-900 p-5 text-white shadow-xl transition-all group-hover:translate-x-2 group-hover:bg-blue-600"><ArrowRight size={24} /></div>
                  </Link>
                )) : <div className="rounded-[4rem] border-4 border-dashed border-slate-100 bg-slate-50 p-20 text-center font-black uppercase italic tracking-[0.2em] text-slate-400 opacity-50">Belum ada program pelatihan aktif.</div>}
              </div>
            </section>
          </div>

          <aside className="space-y-12 text-left">
            <section className="relative overflow-hidden rounded-[3.5rem] bg-slate-900 p-10 text-white shadow-2xl text-left">
              <div className="absolute -bottom-4 -right-4 rotate-12 opacity-10"><BarChart3 size={120} /></div>
              <h4 className="mb-10 border-b border-white/10 pb-4 text-[10px] font-black uppercase tracking-widest text-blue-400">Impact Analytics</h4>
              <div className="relative z-10 space-y-10">
                <div className="flex items-end justify-between border-l-4 border-blue-600 pl-6 text-left">
                  <div className="text-left">
                    <p className="text-3xl font-black italic leading-none text-white">{totalTalenta} Jiwa</p>
                    <p className="mt-2 text-[8px] font-black uppercase italic tracking-tighter text-slate-400 opacity-60">{isUni ? "Alumni & Mahasiswa" : "Peserta Pelatihan"}</p>
                  </div>
                  <div className="text-right">
                    <TrendingUp size={24} className="mb-1 ml-auto text-emerald-400" />
                    <p className="text-xl font-black italic leading-none text-emerald-400">{employabilityRate}%</p>
                    <span className="text-[7px] font-black uppercase tracking-tighter text-slate-500">Terserap Kerja</span>
                  </div>
                </div>
                <div className="flex gap-4">
                   <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
                      <p className="text-[7px] font-black uppercase leading-none text-blue-400">Laki-laki</p>
                      <p className="mt-1 text-lg font-black leading-none">{genMap.male || 0}</p>
                   </div>
                   <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
                      <p className="text-[7px] font-black uppercase text-pink-400 leading-none">Perempuan</p>
                      <p className="mt-1 text-lg font-black leading-none">{genMap.female || 0}</p>
                   </div>
                </div>
              </div>
            </section>

            <section className="space-y-8 rounded-[3.5rem] border-2 border-slate-900 bg-white p-10 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)] text-left">
              <h3 className="flex items-center gap-3 text-lg font-black uppercase tracking-tighter text-slate-900"><Users size={24} className="text-blue-600" /> Spektrum Inklusi</h3>
              <div className="space-y-6">
                {Object.entries(disMap).map(([type, count]) => (
                  <div key={type} className="space-y-2 text-left">
                    <div className="flex justify-between text-[9px] font-black uppercase text-slate-600 tracking-tighter">
                      <span>{type}</span>
                      <span>{totalTalenta > 0 ? Math.round((Number(count)/totalTalenta)*100) : 0}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-50">
                      <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600" style={{ width: `${totalTalenta > 0 ? (Number(count)/totalTalenta)*100 : 0}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <button 
              className="flex w-full items-center justify-center gap-3 rounded-[2rem] border-2 border-slate-200 bg-white py-5 text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-sm transition-all hover:border-slate-900"
              onClick={() => { navigator.clipboard.writeText(window.location.href); alert("Link disalin!"); }}
            >
              <Share2 size={18} /> Bagikan Profil
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
}
