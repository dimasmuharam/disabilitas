export const runtime = "edge";
export const revalidate = 0;

import React from "react";
import { supabase } from "@/lib/supabase";
import { 
  GraduationCap, MapPin, CheckCircle2, 
  BookOpen, Info, Zap, Calendar, ArrowRight,
  ShieldCheck, Gem, Award, BarChart3, TrendingUp, Users
} from "lucide-react";
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { data: partner } = await supabase.from("partners").select("name").eq("id", params.id).maybeSingle();
  return { title: `${partner?.name || "Profil Partner"} | disabilitas.com` };
}

export default async function PublicPartnerProfile({ params }: { params: { id: string } }) {
  const { data: partner, error } = await supabase.from("partners").select("*").eq("id", params.id).maybeSingle();
  const { data: trainings } = await supabase.from("trainings").select("*").eq("partner_id", params.id).eq("is_published", true).order("start_date", { ascending: false });

  if (error || !partner) {
    return <div className="flex min-h-screen items-center justify-center font-black">PROFIL TIDAK DITEMUKAN</div>;
  }

  const score = Number(partner.inclusion_score || 0);
  const totalTalenta = Number(partner.stats_academic_total || 0) + Number(partner.stats_impact_total || 0);
  const totalHired = Number(partner.stats_academic_hired || 0) + Number(partner.stats_impact_hired || 0);
  const rate = totalTalenta > 0 ? Math.round((totalHired / totalTalenta) * 100) : 0;
  
  const disMap = (partner.stats_disability_map as Record<string, number>) || {};
  const genMap = (partner.stats_gender_map as Record<string, number>) || { male: 0, female: 0 };

  return (
    <div className="min-h-screen bg-white pb-24 font-sans text-slate-900 leading-relaxed">
      <header className="border-b-2 border-slate-100 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-end">
            <div className="flex size-32 shrink-0 items-center justify-center rounded-[2.5rem] bg-slate-900 text-white shadow-2xl">
              <GraduationCap size={60} />
            </div>
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none">{partner.name}</h1>
              <div className="mt-4 flex flex-wrap justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 lg:justify-start">
                <span className="flex items-center gap-2"><BookOpen size={16} /> {partner.category}</span>
                <span className="flex items-center gap-2"><MapPin size={16} /> {partner.location}</span>
              </div>
            </div>
            <div className="rounded-[2.5rem] border-2 border-slate-900 p-8 text-left min-w-[200px]">
              <p className="text-[10px] font-black uppercase opacity-60">Inclusion Score</p>
              <p className="text-5xl font-black italic tracking-tighter">{score}%</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-16 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-20 text-left">
            <section className="space-y-6">
              <h2 className="flex items-center gap-3 text-2xl font-black uppercase italic tracking-tighter"><Info className="text-blue-600" size={28} /> Tentang Kami</h2>
              <p className="rounded-[3rem] border-2 border-slate-100 p-10 text-lg italic text-slate-700 whitespace-pre-line">
                {partner.description || "Komitmen pemberdayaan talenta disabilitas."}
              </p>
            </section>

            <section className="space-y-8">
              <h2 className="flex items-center gap-3 border-b-4 border-blue-600 pb-4 text-2xl font-black uppercase italic tracking-tighter"><Zap size={32} /> Program</h2>
              <div className="grid gap-6">
                {(trainings || []).map((t) => (
                  <div key={t.id} className="flex items-center justify-between rounded-[3.5rem] border-2 border-slate-100 p-8">
                    <div className="text-left">
                      <h3 className="text-2xl font-black uppercase italic tracking-tighter">{t.title}</h3>
                      <p className="text-[10px] font-bold text-slate-400">Batch {new Date(t.start_date).getFullYear()}</p>
                    </div>
                    <div className="size-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400"><ArrowRight /></div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-12 text-left">
            <div className="rounded-[3.5rem] bg-slate-900 p-10 text-white shadow-2xl">
              <h4 className="mb-8 border-b border-white/10 pb-4 text-[10px] font-black uppercase text-blue-400">Impact Stats</h4>
              <div className="space-y-8">
                <div className="flex justify-between items-end">
                  <div><p className="text-3xl font-black">{totalTalenta}</p><p className="text-[8px] uppercase opacity-60">Total Jiwa</p></div>
                  <div className="text-right"><p className="text-xl font-black text-emerald-400">{rate}%</p><p className="text-[8px] uppercase opacity-60">Keterserapan</p></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <p className="text-[7px] font-black uppercase text-blue-400">Pria</p>
                    <p className="text-lg font-black">{genMap.male || 0}</p>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                    <p className="text-[7px] font-black uppercase text-pink-400">Wanita</p>
                    <p className="text-lg font-black">{genMap.female || 0}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[3.5rem] border-2 border-slate-900 p-10">
              <h3 className="mb-8 flex items-center gap-3 text-lg font-black uppercase tracking-tighter"><Users size={24} /> Spektrum</h3>
              <div className="space-y-6">
                {Object.entries(disMap).map(([type, count]) => (
                  <div key={type} className="space-y-1">
                    <div className="flex justify-between text-[9px] font-black uppercase text-slate-500"><span>{type}</span><span>{totalTalenta > 0 ? Math.round((Number(count)/totalTalenta)*100) : 0}%</span></div>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600" style={{ width: `${totalTalenta > 0 ? (Number(count)/totalTalenta)*100 : 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
