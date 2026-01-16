export const runtime = "edge";
export const revalidate = 0;

import React from "react";
import { supabase } from "@/lib/supabase";
import { 
  MapPin, Info, Zap, Calendar, ArrowRight,
  ShieldCheck, Award, Users, Globe, History, 
  CheckCircle2, Accessibility, Star, Gem,
  Target, BarChart3, TrendingUp
} from "lucide-react";
import { Metadata } from "next";

type PageProps = {
  params: { id: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { data: partner } = await supabase.from("partners").select("name").eq("id", params.id).maybeSingle();
  const partnerName = partner?.name || "Mitra Pelatihan";
  
  return { 
    title: `${partnerName} | Mitra Pelatihan Inklusif Terverifikasi`,
    description: `Profil dampak dan fasilitas akomodasi pelatihan inklusif ${partnerName} di platform disabilitas.com.`,
    alternates: { canonical: `https://disabilitas.com/partner/${params.id}` }
  };
}

export default async function PublicPartnerProfile({ params }: PageProps) {
  const [partnerRes, trainingsRes] = await Promise.all([
    supabase.from("partners").select("*").eq("id", params.id).maybeSingle(),
    supabase.from("trainings")
      .select("*")
      .eq("partner_id", params.id)
      .eq("is_published", true)
      .order("start_date", { ascending: false })
  ]);

  const partner = partnerRes.data;
  const allTrainings = trainingsRes.data || [];

  if (!partner) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center font-black uppercase italic text-slate-400" role="alert">
        <ShieldCheck size={48} className="mb-4 opacity-20" />
        PROFIL TIDAK DITEMUKAN
      </div>
    );
  }

  // LOGIKA BADGE & NARASI EDUKATIF (Konsisten dengan Profil Perusahaan)
  const score = partner.inclusion_score || 0;
  let badgeConfig = {
    label: "Inclusive Entity",
    level: "Bronze",
    color: "text-orange-700 bg-orange-50 border-orange-200",
    progressColor: "bg-orange-500",
    icon: <ShieldCheck size={24} />,
    description: "Mitra ini telah menginisiasi program inklusif dengan fasilitas dasar. Langkah awal yang penting dalam membangun ekosistem pelatihan yang setara."
  };

  if (score >= 85) {
    badgeConfig = {
      label: "Inclusion Champion",
      level: "Gold",
      color: "text-amber-700 bg-amber-50 border-amber-200",
      progressColor: "bg-amber-500",
      icon: <Gem size={24} />,
      description: "Mitra ini adalah standar emas inklusivitas. Memiliki kurikulum yang aksesibel, instruktur terlatih, dan lingkungan belajar yang sangat inklusif bagi semua ragam disabilitas."
    };
  } else if (score >= 50) {
    badgeConfig = {
      label: "Inclusion Leader",
      level: "Silver",
      color: "text-slate-700 bg-slate-50 border-slate-200",
      progressColor: "bg-slate-600",
      icon: <Award size={24} />,
      description: "Mitra menunjukkan komitmen kuat melalui penyediaan akomodasi pelatihan yang layak dan penyesuaian materi pembelajaran bagi talenta disabilitas."
    };
  }

  const today = new Date().toISOString().split('T')[0];
  const activeTrainings = allTrainings.filter(t => t.registration_deadline >= today);
  const pastTrainings = allTrainings.filter(t => t.registration_deadline < today);

  const totalTalenta = Number(partner.stats_impact_total || 0);
  const totalHired = Number(partner.stats_impact_hired || 0);
  const rate = totalTalenta > 0 ? Math.round((totalHired / totalTalenta) * 100) : 0;
  const disMap = (partner.stats_disability_map as Record<string, number>) || {};
  const genMap = (partner.stats_gender_map as Record<string, number>) || { male: 0, female: 0 };
  const providedAccommodations = (partner.master_accommodations_provided as string[]) || [];

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 text-left font-sans leading-relaxed text-slate-900">
      {/* HEADER */}
      <header className="border-b-2 border-slate-100 bg-white shadow-sm" role="banner">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-end">
            <div className="flex size-32 shrink-0 items-center justify-center rounded-[2.5rem] border-4 border-white bg-blue-600 text-white shadow-2xl animate-in zoom-in">
              <Award size={60} aria-hidden="true" />
            </div>
            <div className="flex-1 space-y-4 text-center lg:text-left">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                  <h1 className="text-4xl font-black uppercase italic tracking-tighter">{partner.name}</h1>
                  <div className="flex items-center gap-1 rounded-full bg-blue-600 px-4 py-1.5 text-white shadow-lg">
                    <CheckCircle2 size={14} aria-hidden="true" />
                    <span className="text-[10px] font-black uppercase italic tracking-widest">Verified Partner</span>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 lg:justify-start">
                  <span className="flex items-center gap-2 italic"><MapPin size={16} className="text-blue-600" /> {partner.location || "Lokasi Global"}</span>
                  {partner.website && (
                    <a href={partner.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition-colors hover:text-blue-600">
                      <Globe size={16} /> Website Resmi
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* PROGRESS SCORING BOX (Identik dengan Company Profile) */}
            <section className={`w-full max-w-xs rounded-[2.5rem] border-2 p-6 shadow-sm md:max-w-sm ${badgeConfig.color}`} aria-labelledby="score-title">
              <div className="mb-4 flex items-center gap-4">
                <div className="rounded-2xl bg-white p-3 shadow-sm" aria-hidden="true">{badgeConfig.icon}</div>
                <div className="flex-1">
                  <div className="mb-1 flex items-end justify-between">
                    <h3 id="score-title" className="text-sm font-black uppercase leading-none tracking-tighter">{badgeConfig.label}</h3>
                    <span className="text-xs font-black italic">{score}%</span>
                  </div>
                  <div className="border-current/10 h-2 w-full overflow-hidden rounded-full border bg-white/50">
                    <div className={`h-full ${badgeConfig.progressColor} transition-all duration-1000`} style={{ width: `${score}%` }}></div>
                  </div>
                </div>
              </div>
              <p className="border-current/10 border-t pt-3 text-[11px] font-bold italic leading-relaxed opacity-80">
                {badgeConfig.description}
              </p>
            </section>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-16 lg:grid-cols-3">
          <div className="space-y-20 lg:col-span-2">
            {/* TENTANG MITRA */}
            <section className="space-y-6" aria-labelledby="about-title">
              <h2 id="about-title" className="flex items-center gap-3 text-2xl font-black uppercase italic tracking-tighter text-slate-900">
                <Info className="text-blue-600" size={28} aria-hidden="true" /> Visi & Komitmen
              </h2>
              <div className="rounded-[3rem] border-2 border-slate-100 bg-white p-10 shadow-sm">
                <p className="whitespace-pre-line text-lg font-medium leading-relaxed text-slate-700">
                  {partner.description || "Mitra ini berkomitmen dalam menyediakan kurikulum pelatihan yang aksesibel bagi talenta disabilitas."}
                </p>
              </div>
            </section>

            {/* PROGRAM AKTIF */}
            <section className="space-y-8" aria-labelledby="active-trainings">
              <div className="flex items-center justify-between border-b-4 border-blue-600 pb-4">
                <h2 id="active-trainings" className="flex items-center gap-3 text-2xl font-black uppercase italic tracking-tighter text-slate-900">
                  <Zap className="fill-amber-500 text-amber-500" size={32} aria-hidden="true" /> Program Pelatihan Aktif
                </h2>
                <span className="text-xl font-black uppercase italic text-blue-600">{activeTrainings.length} Program</span>
              </div>
              <div className="grid gap-6">
                {activeTrainings.length > 0 ? activeTrainings.map((t) => (
                  <a key={t.id} href={`/pelatihan/${t.id}`} className="group flex flex-col items-center justify-between gap-8 rounded-[3.5rem] border-2 border-slate-100 bg-white p-8 shadow-sm transition-all hover:border-slate-900 hover:shadow-2xl md:flex-row">
                    <div className="flex-1 space-y-2 text-left">
                      <span className="inline-block rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[8px] font-black uppercase text-emerald-600">Buka Pendaftaran</span>
                      <h3 className="text-2xl font-black uppercase italic leading-tight tracking-tighter group-hover:text-blue-600">{t.title}</h3>
                      <div className="flex items-center gap-4 text-[10px] font-bold uppercase italic text-slate-400">
                        <span className="flex items-center gap-1"><Calendar size={14} /> Akhir Pendaftaran: {t.registration_deadline}</span>
                      </div>
                    </div>
                    <div className="rounded-3xl bg-slate-900 p-5 text-white shadow-xl transition-all group-hover:translate-x-2 group-hover:bg-blue-600"><ArrowRight size={24} /></div>
                  </a>
                )) : (
                  <div className="rounded-[4rem] border-4 border-dashed border-slate-100 bg-slate-50 p-20 text-center font-black uppercase italic text-slate-300 opacity-50">Belum ada pendaftaran yang dibuka saat ini.</div>
                )}
              </div>
            </section>
          </div>

          {/* SIDEBAR ANALYTICS & AKOMODASI */}
          <aside className="space-y-12">
            <section className="relative overflow-hidden rounded-[3.5rem] bg-slate-900 p-10 text-white shadow-2xl" aria-labelledby="stats-title">
              <div className="absolute -bottom-4 -right-4 rotate-12 opacity-10" aria-hidden="true"><BarChart3 size={120} /></div>
              <h4 id="stats-title" className="mb-10 border-b border-white/10 pb-4 text-[10px] font-black uppercase tracking-widest text-blue-400">Impact Analytics</h4>
              <div className="relative z-10 space-y-10 text-left">
                <div className="flex items-end justify-between border-l-4 border-blue-600 pl-6">
                  <div>
                    <p className="text-3xl font-black italic leading-none">{totalTalenta} Orang</p>
                    <p className="mt-2 text-[8px] font-black uppercase italic tracking-tighter text-slate-400">Total Talenta Terpeta</p>
                  </div>
                  <div className="text-right">
                    <TrendingUp size={24} className="mb-1 ml-auto text-emerald-400" aria-hidden="true" />
                    <span className="rounded bg-emerald-500/20 px-2 py-1 text-[7px] font-black uppercase text-emerald-400">{rate}% Success Rate</span>
                  </div>
                </div>
                
                <div className="space-y-4 rounded-[2rem] border border-white/10 bg-white/5 p-6">
                   <div className="flex items-center justify-between text-[10px] font-black uppercase italic">
                      <span className="text-blue-400">Pria: {genMap.male || 0}</span>
                      <span className="text-pink-400">Wanita: {genMap.female || 0}</span>
                   </div>
                   <p className="text-center text-[9px] font-bold leading-relaxed opacity-40">Data divalidasi sistem otomatis disabilitas.com 2026.</p>
                </div>
              </div>
            </section>

            {/* AKOMODASI (Aksesibel & Konsisten dengan Profil Perusahaan) */}
            <section className="space-y-10 rounded-[3.5rem] border-2 border-slate-900 bg-white p-10 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)]" aria-labelledby="acc-title">
              <h3 id="acc-title" className="flex items-center gap-3 text-lg font-black uppercase tracking-tighter text-slate-900">
                <Accessibility className="text-blue-600" size={24} aria-hidden="true" /> Fasilitas Inklusi
              </h3>
              <ul className="space-y-4" aria-label="Daftar akomodasi yang disediakan mitra">
                {providedAccommodations.length > 0 ? providedAccommodations.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-4 rounded-2xl border-2 border-emerald-50 bg-emerald-50/20 p-4 shadow-sm">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" aria-hidden="true" />
                    <span className="text-[11px] font-black uppercase leading-tight text-emerald-950">{item}</span>
                  </li>
                )) : (
                  <li className="text-center text-[10px] font-black uppercase italic text-slate-300">Data fasilitas belum terdata.</li>
                )}
              </ul>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
