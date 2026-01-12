export const runtime = "edge";
export const revalidate = 0;

import React from "react";
import { supabase } from "@/lib/supabase";
import { 
  GraduationCap, MapPin, CheckCircle2, 
  Globe, Mail, ShieldCheck, Zap, 
  Award, ArrowRight, Info, BookOpen, 
  BarChart3, TrendingUp, Calendar,
  Gem, Share2, Users
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { data: partner } = await supabase.from("partners").select("name").eq("id", params.id).maybeSingle();
  return { title: `${partner?.name || "Profil Partner"} | disabilitas.com` };
}

export default async function PublicPartnerProfile({ params }: { params: { id: string } }) {
  // 1. Ambil data partner secara aman
  const { data: partner, error } = await supabase.from("partners").select("*").eq("id", params.id).maybeSingle();

  if (error || !partner) {
    return (
      <div className="flex min-h-screen items-center justify-center p-10 text-center font-sans">
        <div className="max-w-md space-y-4">
          <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Info size={40} />
          </div>
          <h1 className="text-2xl font-black uppercase italic tracking-tighter">Profil Tidak Ditemukan</h1>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 leading-relaxed">
            Data institusi belum tersedia di sistem publik.
          </p>
          <Link href="/" className="inline-block mt-6 rounded-full bg-slate-900 px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-xl">Kembali</Link>
        </div>
      </div>
    );
  }

  // 2. Fetch Pelatihan
  const { data: trainings } = await supabase.from("trainings").select("*").eq("partner_id", partner.id).eq("is_published", true).order("start_date", { ascending: false });

  // 3. Persiapkan Data Statistik (Gunakan default value jika NULL agar tidak crash)
  const isUni = partner.category === "Perguruan Tinggi";
  const statAcademic = Number(partner.stats_academic_total) || 0;
  const statImpact = Number(partner.stats_impact_total) || 0;
  const totalTalenta = statAcademic + statImpact;

  const hiredAcademic = Number(partner.stats_academic_hired) || 0;
  const hiredImpact = Number(partner.stats_impact_hired) || 0;
  const totalHired = hiredAcademic + hiredImpact;

  const employabilityRate = totalTalenta > 0 ? Math.round((totalHired / totalTalenta) * 100) : 0;
  
  // Proteksi JSONB agar Object.entries tidak crash
  const disMap = (partner.stats_disability_map as Record<string, number>) || {};
  const genMap = (partner.stats_gender_map as Record<string, number>) || { male: 0, female: 0 };
  const score = partner.inclusion_score || 0;

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
                  <span className="flex items-center gap-1 rounded-full bg-blue-600 px-4 py-1.5 text-[10px] font-black uppercase italic text-white shadow-lg">
                    <CheckCircle2 size={14} /> Verified Partner
                  </span>
                </div>
                <div className="flex flex-wrap gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  <span className="flex items-center gap-2 italic"><BookOpen size={16} /> {partner.category}</span>
                  <span className="flex items-center gap-2 italic"><MapPin size={16} /> {partner.location}</span>
                </div>
              </div>
            </div>
            <div className={`max-w-xs rounded-[2.5rem] border-2 p-6 shadow-sm md:max-w-sm ${badge.color} text-left`}>
              <div className="mb-4 flex items-center gap-4">
                <div className="rounded-2xl bg-white p-3 shadow-sm">{badge.icon}</div>
                <div className="flex-1">
                  <div className="mb-1 flex items-end justify-between">
                    <h3 className="text-sm font-black uppercase tracking-tighter leading-none">{badge.label}</h3>
                    <span className="text-xs font-black italic">{score}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full border border-current/10 bg-white/50">
                    <div className={`h-full ${badge.pColor} transition-all duration-1000`} style={{ width: `${score}%` }}></div>
                  </div>
                </div>
              </div>
              <p className="border-t border-current/10 pt-3 text-left text-[11px] font-bold italic leading-relaxed opacity-80">
                Institusi ini berkomitmen pada standar inklusivitas berkelanjutan.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-16 text-left">
        <div className="grid gap-16 lg:grid-cols-3">
          <div className="space-y-20 lg:col-span-2 text-left">
            <section className="space-y-6">
              <h2 className="flex items-center gap-3 text-2xl font-black uppercase italic tracking-tighter text-slate-900">
                <Info className="text-blue-600" size={28} /> Tentang Kami
              </h2>
              <div className="rounded-[3rem] border-2 border-slate-100 bg-white p-10 shadow-sm italic text-left">
                <p className="whitespace-pre-line text-lg font-medium leading-relaxed text-slate-700">
                  {partner.description || "Institusi ini berkomitmen menciptakan akses pendidikan dan pelatihan yang setara."}
                </p>
              </div>
            </section>

            <section className="space-y-8 text-left">
              <div className="flex items-center justify-between border-b-4 border-blue-600 pb-4">
                <h2 className="flex items-center gap-3 text-2xl font-black uppercase italic tracking-tighter text-slate-900">
                  <Zap className="fill-amber-500 text-amber-500" size={32} /> Program Berjalan
                </h2>
              </div>
              <div className="grid gap-6">
                {trainings && trainings.length > 0 ? trainings.map((t) => (
                  <Link key={t.id} href={`/pelatihan/${t.id}`} className="group flex flex-col items-center justify-between gap-8 rounded-[3.5rem] border-2 border-slate-100 bg-white p-8 shadow-sm transition-all hover:border-slate-900 hover:shadow-2xl md:flex-row">
                    <div className="flex-1 space-y-4 text-left">
                      <div className="space-y-1 text-left">
                        <h3 className="text-2xl font-black uppercase italic leading-tight tracking-tighter transition-colors group-hover:text-blue-600">{t.title}</h3>
                        <div className="flex items-center gap-4 text-[10px] font-black uppercase italic tracking-tighter text-blue-600">
                          <span className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-1">Pendaftaran Terbuka</span>
                          <span className="flex items-center gap-1 text-slate-400 italic"><Calendar size={12} /> {new Date(t.start_date).getFullYear()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-3xl bg-slate-900 p-5 text-white shadow-xl transition-all group-hover:translate-x-2 group-hover:bg-blue-600">
                       <ArrowRight size={24} />
                    </div>
                  </Link>
                )) : <div className="rounded-[4rem] border-4 border-dashed border-slate-100 bg-slate-50 p-20 text-left font-black uppercase italic tracking-[0.2em] text-slate-400 opacity-50">Belum ada program pelatihan aktif.</div>}
              </div>
            </section>
          </div>

          <aside className="space-y-12 text-left">
            <section className="relative overflow-hidden rounded-[3.5rem] bg-slate-900 p-10 text-white shadow-2xl">
              <div className="absolute -bottom-4 -right-4 rotate-12 opacity-10"><BarChart3 size={120} /></div>
              <h4 className="mb-10 border-b border-white/10 pb-4 text-[10px] font-black uppercase tracking-widest text-blue-400 text-left">Impact Analytics</h4>
              <div className="relative z-10 space-y-10">
                <div className="flex items-end justify-between border-l-4 border-blue-600 pl-6 text-left">
                  <div>
                    <p className="text-3xl font-black italic leading-none text-white">{totalTalenta} Jiwa</p>
                    <p className="mt-2 text-[8px] font-black uppercase italic tracking-tighter text-slate-400">{isUni ? "Alumni & Mahasiswa" : "Peserta Pelatihan"}</p>
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
                      <p className="mt-1 text-lg font-black leading-none">{genMap?.male || 0}</p>
                   </div>
                   <div className="flex-1 rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
                      <p className="text-[7px] font-black uppercase leading-none text-pink-400">Perempuan</p>
                      <p className="mt-1 text-lg font-black leading-none">{genMap?.female || 0}</p>
                   </div>
                </div>
              </div>
            </section>

            <section className="space-y-8 rounded-[3.5rem] border-2 border-slate-900 bg-white p-10 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)] text-left">
              <h3 className="flex items-center gap-3 text-lg font-black uppercase tracking-tighter text-slate-900">
                <Users size={24} className="text-blue-600" /> Spektrum Inklusi
              </h3>
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
                {totalTalenta === 0 && <p className="text-[10px] font-black uppercase italic text-slate-300">Data belum tersedia.</p>}
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
