export const runtime = "edge";

import React from "react";
import { supabase } from "@/lib/supabase";
import { 
  GraduationCap, MapPin, CheckCircle2, 
  Globe, Mail, ShieldCheck, Zap, 
  Award, ArrowRight, Info, BookOpen, 
  Calendar, Gem, Share2
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

// --- SEO METADATA ---
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { data: partner } = await supabase.from("partners").select("name, description").eq("id", params.id).single();
  return {
    title: `${partner?.name || "Profil Institusi"} | disabilitas.com`,
    description: partner?.description || "Detail profil institusi inklusif dan program pelatihan.",
    alternates: { canonical: `https://www.disabilitas.com/partner/${params.id}` },
  };
}

export default async function PublicPartnerProfile({ params }: { params: { id: string } }) {
  // 1. FETCH DATA (Identik dengan profil perusahaan)
  const { data: partner, error } = await supabase.from("partners").select("*").eq("id", params.id).single();
  const { data: trainings } = await supabase.from("trainings").select("*").eq("partner_id", params.id).order("start_date", { ascending: false });

  if (error || !partner) {
    return <div className="flex min-h-screen items-center justify-center font-black uppercase italic text-slate-400">Institusi Tidak Ditemukan</div>;
  }

  // 2. LOGIKA BADGE & SKOR (Diambil langsung dari database)
  const score = partner.inclusion_score || 0;
  let badgeConfig = {
    label: "Emerging Partner",
    color: "text-blue-700 bg-blue-50 border-blue-200",
    progressColor: "bg-blue-500",
    icon: <ShieldCheck size={24} />,
    description: "Instansi ini telah menginisiasi budaya inklusi dengan menyediakan fasilitas dasar."
  };

  if (score >= 85) {
    badgeConfig = {
      label: "Inclusion Champion",
      color: "text-amber-700 bg-amber-50 border-amber-200",
      progressColor: "bg-amber-500",
      icon: <Gem size={24} />,
      description: "Instansi ini adalah role model inklusivitas dengan standar komprehensif."
    };
  } else if (score >= 50) {
    badgeConfig = {
      label: "Inclusion Leader",
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
      progressColor: "bg-emerald-600",
      icon: <Award size={24} />,
      description: "Instansi menunjukkan komitmen kuat dalam penyediaan akomodasi layak."
    };
  }

  const activeTrainings = trainings?.filter(t => t.is_published && new Date(t.end_date || "") >= new Date()) || [];
  const archivedTrainings = trainings?.filter(t => t.is_published && new Date(t.end_date || "") < new Date()) || [];

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 font-sans leading-relaxed text-slate-900">
      <header className="border-b-2 border-slate-100 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-16 text-left">
          <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-end">
            <div className="flex size-32 shrink-0 items-center justify-center rounded-[2.5rem] border-4 border-white bg-slate-900 text-white shadow-2xl">
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

            {/* PROGRESS SCORING BOX */}
            <div className={`max-w-xs rounded-[2.5rem] border-2 p-6 shadow-sm md:max-w-sm ${badgeConfig.color} text-left`}>
              <div className="mb-4 flex items-center gap-4">
                <div className="rounded-2xl bg-white p-3 shadow-sm">{badgeConfig.icon}</div>
                <div className="flex-1">
                  <div className="mb-1 flex items-end justify-between text-left">
                    <h3 className="text-sm font-black uppercase leading-none tracking-tighter">{badgeConfig.label}</h3>
                    <span className="text-xs font-black italic">{score}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full border border-current/10 bg-white/50">
                    <div className={`h-full ${badgeConfig.progressColor} transition-all duration-1000`} style={{ width: `${score}%` }}></div>
                  </div>
                </div>
              </div>
              <p className="border-t border-current/10 pt-3 text-[11px] font-bold italic leading-relaxed opacity-80">
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
            <section className="space-y-6">
              <h2 className="flex items-center gap-3 text-2xl font-black uppercase italic tracking-tighter text-slate-900">
                <Info className="text-blue-600" size={28} /> Tentang Kami
              </h2>
              <div className="rounded-[3rem] border-2 border-slate-100 bg-white p-10 shadow-sm">
                <p className="whitespace-pre-line text-lg font-medium leading-relaxed text-slate-700 italic">
                  {partner.description || "Institusi ini berkomitmen menciptakan akses pendidikan dan pelatihan yang setara."}
                </p>
              </div>
            </section>

            {/* PROGRAM AKTIF */}
            <section className="space-y-8">
              <div className="flex items-center justify-between border-b-4 border-blue-600 pb-4">
                <h2 className="flex items-center gap-3 text-2xl font-black uppercase italic tracking-tighter">
                  <Zap className="fill-amber-500 text-amber-500" size={32} /> Program Berjalan
                </h2>
                <span className="text-xl font-black uppercase italic text-blue-600">{activeTrainings.length} Batch</span>
              </div>
              
              <div className="grid gap-6">
                {activeTrainings.length > 0 ? activeTrainings.map((t) => (
                  <Link key={t.id} href={`/pelatihan/${t.id}`} className="group flex flex-col items-center justify-between gap-8 rounded-[3.5rem] border-2 border-slate-100 bg-white p-8 shadow-sm transition-all hover:border-slate-900 hover:shadow-2xl md:flex-row">
                    <div className="flex-1 space-y-4 text-left">
                      <div className="space-y-1">
                        <h3 className="text-2xl font-black uppercase italic leading-tight tracking-tighter transition-colors group-hover:text-blue-600">{t.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase italic tracking-tighter text-blue-600">
                          <span className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-1">Pendaftaran Terbuka</span>
                          <span className="flex items-center gap-1 text-slate-400"><Calendar size={12} /> Mulai: {new Date(t.start_date).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}</span>
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

          {/* SIDEBAR */}
          <aside className="space-y-12 text-left">
            <section className="space-y-10 rounded-[3.5rem] border-2 border-slate-900 bg-white p-10 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)]">
              <h3 className="flex items-center gap-3 text-lg font-black uppercase tracking-tighter">Akomodasi</h3>
              <div className="flex flex-wrap gap-2">
                {partner.master_accommodations_provided?.map((item: string, idx: number) => (
                  <span key={idx} className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-[9px] font-black uppercase tracking-tight text-emerald-700 shadow-sm">{item}</span>
                ))}
              </div>
            </section>

            <section className="space-y-6 rounded-[3.5rem] border-2 border-slate-100 bg-white p-10 shadow-sm">
              <h4 className="flex items-center gap-2 text-[11px] font-black uppercase italic tracking-widest text-slate-900">
                <Mail size={16} className="text-blue-600"/> Hubungi Kami
              </h4>
              <div className="space-y-3">
                {partner.website && (
                  <a href={partner.website} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 rounded-2xl bg-slate-50 p-4 text-[10px] font-black uppercase transition-all hover:bg-blue-900 hover:text-white">
                    <Globe size={18} className="text-slate-400 group-hover:text-white" /> Website Resmi
                  </a>
                )}
                <button 
                  className="flex w-full items-center gap-4 rounded-2xl bg-slate-50 p-4 text-[10px] font-black uppercase transition-all hover:bg-slate-900 hover:text-white text-left"
                  onClick={() => { navigator.clipboard.writeText(`https://www.disabilitas.com/partner/${partner.id}`); alert("Link disalin!"); }}
                >
                  <Share2 size={18} className="text-slate-400" /> Bagikan Profil
                </button>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
