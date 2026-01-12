export const runtime = "edge";
export const revalidate = 0;

import React from "react";
import { supabase } from "@/lib/supabase";
import { 
  GraduationCap, MapPin, Users, 
  CheckCircle2, Globe, Mail,
  ShieldCheck, Zap, Award,
  ArrowRight, Info, BookOpen, 
  BarChart3, TrendingUp, Calendar,
  Gem, Accessibility, Share2
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { data: partner } = await supabase.from("partners").select("name").eq("id", params.id).maybeSingle();
  return {
    title: `${partner?.name || "Profil Institusi"} | disabilitas.com`,
    alternates: { canonical: `https://www.disabilitas.com/partner/${params.id}` },
  };
}

export default async function PublicPartnerProfile({ params }: { params: { id: string } }) {
  // 1. Fetch data partner (Gunakan maybeSingle untuk stabilitas Edge)
  const { data: partner, error: pError } = await supabase
    .from("partners")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (pError || !partner) {
    return (
      <div className="flex min-h-screen items-center justify-center p-10 text-center font-sans">
        <div className="max-w-md space-y-4">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Info size={40} />
          </div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">Profil Tidak Ditemukan</h1>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            ID: {params.id}
          </p>
          <Link href="/" className="mt-6 inline-block rounded-full bg-slate-900 px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-xl">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  // 2. Fetch Research Data (Identik dengan Dashboard yang berhasil)
  const { data: certs } = await supabase.from("certifications").select("profile_id").eq("organizer_name", partner.name);
  const certProfileIds = Array.from(new Set(certs?.map(c => c.profile_id) || []));
  const { data: profilesByUni } = await supabase.from("profiles").select("id").eq("university", partner.name);
  const uniProfileIds = profilesByUni?.map(p => p.id) || [];
  const allUniqueIds = Array.from(new Set([...certProfileIds, ...uniProfileIds]));

  let talenta: any[] = [];
  if (allUniqueIds.length > 0) {
    const { data } = await supabase.from("profiles").select("id, disability_type, career_status").in("id", allUniqueIds);
    talenta = data || [];
  }

  const { data: trainings } = await supabase.from("trainings").select("*").eq("partner_id", partner.id).eq("is_published", true);

  // 3. Kalkulasi & Variabel UI (Safe Mapping)
  const score = partner.inclusion_score || 0;
  const totalImpact = talenta.length;
  const employed = talenta.filter(t => !["Job Seeker", "Belum Bekerja", "Pelajar / Mahasiswa", "Fresh Graduate"].includes(t.career_status)).length;
  const employabilityRate = totalImpact > 0 ? Math.round((employed / totalImpact) * 100) : 0;
  
  const disabilityDist: Record<string, number> = {};
  talenta.forEach(t => { 
    if (t.disability_type) disabilityDist[t.disability_type] = (disabilityDist[t.disability_type] || 0) + 1; 
  });

  const isUni = partner.category === "Perguruan Tinggi";

  let badgeConfig = { label: "Emerging Partner", icon: <ShieldCheck size={24} />, color: "text-blue-700 bg-blue-50 border-blue-200", pColor: "bg-blue-500" };
  if (score >= 85) badgeConfig = { label: "Inclusion Center", icon: <Gem size={24} />, color: "text-amber-700 bg-amber-50 border-amber-200", pColor: "bg-amber-500" };
  else if (score >= 50) badgeConfig = { label: "Growth Leader", icon: <Award size={24} />, color: "text-emerald-700 bg-emerald-50 border-emerald-200", pColor: "bg-emerald-500" };

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 font-sans text-slate-900 leading-relaxed">
      <header className="border-b-2 border-slate-100 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-end">
            <div className="flex size-32 shrink-0 items-center justify-center rounded-[2.5rem] border-4 border-white bg-slate-900 text-white shadow-2xl animate-in zoom-in">
              <GraduationCap size={60} />
            </div>
            <div className="flex-1 space-y-4 text-center lg:text-left">
              <div className="space-y-2 text-left">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">{partner.name}</h1>
                  <span className="flex items-center gap-1 rounded-full bg-blue-600 px-4 py-1.5 text-[10px] font-black uppercase italic text-white shadow-lg">
                    <CheckCircle2 size={12} /> Verified Partner
                  </span>
                </div>
                <div className="flex flex-wrap gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  <span className="flex items-center gap-2 italic"><BookOpen size={16} className="text-blue-600" /> {partner.category || "Institusi"}</span>
                  <span className="flex items-center gap-2 italic"><MapPin size={16} className="text-red-600" /> {partner.location || "Indonesia"}</span>
                </div>
              </div>
            </div>
            <div className={`max-w-xs rounded-[2.5rem] border-2 p-6 shadow-sm md:max-w-sm ${badgeConfig.color}`}>
              <div className="mb-4 flex items-center gap-4 text-left">
                <div className="rounded-2xl bg-white p-3 shadow-sm">{badgeConfig.icon}</div>
                <div className="flex-1">
                  <div className="mb-1 flex items-end justify-between"><h3 className="text-sm font-black uppercase tracking-tighter leading-none">{badgeConfig.label}</h3><span className="text-xs font-black italic">{score}%</span></div>
                  <div className="h-2 w-full overflow-hidden rounded-full border border-current/10 bg-white/50"><div className={`h-full ${badgeConfig.pColor} transition-all duration-1000`} style={{ width: `${score}%` }}></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-16 text-left">
        <div className="grid gap-16 lg:grid-cols-3">
          <div className="space-y-20 lg:col-span-2">
            <section className="space-y-6">
              <h2 className="flex items-center gap-3 text-2xl font-black uppercase italic tracking-tighter text-slate-900"><Info className="text-blue-600" size={28} /> Visi Inklusi</h2>
              <div className="rounded-[3rem] border-2 border-slate-100 bg-white p-10 italic shadow-sm">
                <p className="whitespace-pre-line text-lg font-medium leading-relaxed text-slate-700">{partner.description || "Berkomitmen penuh mendukung pemberdayaan talenta disabilitas."}</p>
              </div>
            </section>
            <section className="space-y-8">
              <h2 className="flex items-center gap-3 border-b-4 border-blue-600 pb-4 text-2xl font-black uppercase italic tracking-tighter text-slate-900"><Zap className="fill-amber-500 text-amber-500" size={32} /> Program Pelatihan</h2>
              <div className="grid gap-6">
                {trainings && trainings.length > 0 ? (
                  trainings.map((t) => (
                    <Link key={t.id} href={`/pelatihan/${t.id}`} className="group flex items-center justify-between gap-8 rounded-[3.5rem] border-2 border-slate-100 bg-white p-8 shadow-sm transition-all hover:border-slate-900 hover:shadow-2xl">
                      <div className="flex-1 text-left">
                        <h3 className="text-2xl font-black uppercase italic leading-tight tracking-tighter group-hover:text-blue-600">{t.title}</h3>
                        <p className="mt-1 text-[10px] font-black uppercase text-slate-400">Mulai: {new Date(t.start_date).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}</p>
                      </div>
                      <div className="rounded-3xl bg-slate-900 p-5 text-white shadow-xl transition-all group-hover:bg-blue-600 group-hover:translate-x-2"><ArrowRight size={24} /></div>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-[4rem] border-4 border-dashed border-slate-100 bg-slate-50 p-20 text-center font-black uppercase italic tracking-[0.2em] text-slate-400 opacity-50">Belum ada pelatihan aktif.</div>
                )}
              </div>
            </section>
          </div>

          <aside className="space-y-12">
            <section className="relative overflow-hidden rounded-[3.5rem] bg-slate-900 p-10 text-white shadow-2xl">
              <div className="absolute -bottom-4 -right-4 rotate-12 opacity-10"><BarChart3 size={120} /></div>
              <h4 className="mb-10 border-b border-white/10 pb-4 text-[10px] font-black uppercase tracking-widest text-blue-400 text-left">Impact Analytics</h4>
              <div className="relative z-10 space-y-10">
                <div className="flex items-end justify-between border-l-4 border-blue-600 pl-6 text-left">
                  <div><p className="text-3xl font-black italic text-white leading-none">{totalImpact} Orang</p><p className="mt-2 text-[8px] font-black uppercase text-slate-400">{isUni ? "Mahasiswa & Alumni" : "Peserta"} Terpeta</p></div>
                  <div className="text-right"><TrendingUp size={24} className="mb-1 ml-auto text-emerald-400" /><p className="text-xl font-black italic text-emerald-400 leading-none">{employabilityRate}%</p><span className="text-[7px] font-black uppercase text-slate-500">Terserap Kerja</span></div>
                </div>
              </div>
            </section>
            <section className="space-y-8 rounded-[3.5rem] border-2 border-slate-900 bg-white p-10 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)] text-left">
              <h3 className="flex items-center gap-3 text-lg font-black uppercase tracking-tighter text-slate-900"><Users size={24} className="text-blue-600" /> Spektrum Inklusi</h3>
              <div className="space-y-6">
                {totalImpact > 0 ? Object.entries(disabilityDist).map(([type, count]) => (
                  <div key={type} className="space-y-2 text-left">
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter text-slate-600"><span>{type}</span><span>{Math.round((count/totalImpact)*100)}%</span></div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-50"><div className="h-full bg-gradient-to-r from-blue-600 to-purple-600" style={{ width: `${(count/totalImpact)*100}%` }}></div></div>
                  </div>
                )) : <p className="text-[10px] font-black uppercase italic text-slate-300">Data belum tersedia.</p>}
              </div>
            </section>
            <button className="flex w-full items-center justify-center gap-3 rounded-[2rem] border-2 border-slate-200 bg-white py-5 text-[10px] font-black uppercase tracking-widest text-slate-900 transition-all hover:border-slate-900 shadow-sm"
              onClick={() => { navigator.clipboard.writeText(`Lihat profil inklusif ${partner.name}: ${window.location.href}`); alert("Link disalin!"); }}>
              <Share2 size={18} /> Bagikan Etalase
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
}
