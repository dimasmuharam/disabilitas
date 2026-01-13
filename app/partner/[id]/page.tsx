export const runtime = "edge";
export const revalidate = 0;

import React from "react";
import { supabase } from "@/lib/supabase";
import { 
  MapPin, Info, Zap, Calendar, ArrowRight,
  ShieldCheck, Award, Users, Globe, History, 
  CheckCircle2, Accessibility, Star, HelpCircle
} from "lucide-react";
import { Metadata } from "next";

type PageProps = {
  params: { id: string };
};

// OPTIMASI SEO: Judul dan Deskripsi yang lebih menjual
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { data: partner } = await supabase.from("partners").select("name").eq("id", params.id).maybeSingle();
  const partnerName = partner?.name || "Mitra";
  
  return { 
    title: `${partnerName} | Mitra Pelatihan Inklusif & Pengembangan Talenta Disabilitas`,
    description: `Pelajari program pelatihan inklusif, fasilitas akomodasi, dan rekam jejak dampak sosial dari ${partnerName} di ekosistem disabilitas.com.`,
    keywords: [`pelatihan disabilitas`, `mitra inklusif`, partnerName, `pengembangan karir disabilitas`],
    alternates: {
      canonical: `https://disabilitas.com/partner/${params.id}`
    }
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
      <div className="flex min-h-screen flex-col items-center justify-center font-black uppercase italic text-slate-400">
        <ShieldCheck size={48} className="mb-4 opacity-20" />
        PROFIL TIDAK DITEMUKAN
      </div>
    );
  }

  const today = new Date().toISOString().split('T')[0];
  const activeTrainings = allTrainings.filter(t => t.registration_deadline >= today);
  const pastTrainings = allTrainings.filter(t => t.registration_deadline < today);

  const totalTalenta = Number(partner.stats_impact_total || 0);
  const totalHired = Number(partner.stats_impact_hired || 0);
  const rate = totalTalenta > 0 ? Math.round((totalHired / totalTalenta) * 100) : 0;
  
  const disMap = (partner.stats_disability_map as Record<string, number>) || {};
  const genMap = (partner.stats_gender_map as Record<string, number>) || { male: 0, female: 0 };
  const accommodations = (partner.master_accommodations_provided as string[]) || [];
  const score = Number(partner.inclusion_score || 0);

  return (
    <div className="min-h-screen bg-white pb-24 font-sans text-slate-900 text-left leading-relaxed">
      {/* HEADER: Penekanan pada Otoritas Mitra */}
      <header className="border-b-4 border-slate-900 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-end">
            <div className="flex size-32 shrink-0 items-center justify-center rounded-[2.5rem] bg-blue-600 text-white shadow-2xl">
              <Award size={60} />
            </div>
            <div className="flex-1 text-center lg:text-left space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-blue-600">
                <ShieldCheck size={14} /> Verified Training Partner
              </div>
              <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none md:text-6xl">
                {partner.name}
              </h1>
              <p className="text-lg font-bold text-slate-500 italic uppercase leading-none tracking-tight">Mitra Pelatihan Inklusif Terverifikasi</p>
              <div className="flex flex-wrap justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-400 lg:justify-start">
                <span className="flex items-center gap-2"><MapPin size={16} className="text-blue-600" /> {partner.location || "Lokasi Global"}</span>
                {partner.website && (
                  <a href={partner.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                    <Globe size={16} /> Website Resmi
                  </a>
                )}
              </div>
            </div>
            
            {/* SCORE MODULE: Edukatif & Interaktif */}
            <div className="group relative rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-black uppercase opacity-60 leading-none">Inclusion Score</p>
                <HelpCircle size={14} className="text-blue-600 cursor-help" />
              </div>
              <p className="text-6xl font-black italic tracking-tighter text-blue-600">{score}%</p>
              
              {/* Tooltip Edukatif */}
              <div className="absolute bottom-full left-1/2 mb-4 w-64 -translate-x-1/2 rounded-2xl bg-slate-900 p-4 text-[9px] font-bold uppercase leading-relaxed text-white opacity-0 shadow-2xl transition-opacity group-hover:opacity-100 pointer-events-none">
                <div className="mb-2 flex items-center gap-2 text-blue-400">
                  <Star size={12} fill="currentColor" /> Apa itu Inclusion Score?
                </div>
                Skor ini mengukur tingkat aksesibilitas fasilitas, kurikulum pelatihan, dan keberhasilan penempatan kerja talenta disabilitas oleh mitra ini.
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-16 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-20">
            {/* VISI & DESKRIPSI */}
            <section className="space-y-6">
              <h2 className="flex items-center gap-3 text-2xl font-black uppercase italic tracking-tighter leading-none">
                <Info className="text-blue-600" size={28} /> Visi Pengembangan Talenta
              </h2>
              <div className="rounded-[3rem] border-2 border-slate-100 bg-slate-50 p-10 text-xl italic font-medium text-slate-700 whitespace-pre-line leading-relaxed shadow-inner">
                {partner.description || "Mitra ini berkomitmen penuh dalam menciptakan kurikulum yang fleksibel dan aksesibel bagi setiap ragam talenta disabilitas."}
              </div>
            </section>

            {/* EDUKASI AKOMODASI */}
            <section className="space-y-6">
              <div className="flex items-end justify-between border-b-4 border-slate-900 pb-4">
                <h2 className="flex items-center gap-3 text-2xl font-black uppercase italic tracking-tighter leading-none">
                  <Accessibility className="text-blue-600" size={28} /> Dukungan Akomodasi
                </h2>
                <span className="text-[9px] font-black uppercase text-slate-400 italic">Standar Inklusi disabilitas.com</span>
              </div>
              <p className="text-[11px] font-bold uppercase text-slate-500 italic leading-relaxed">
                Mitra ini menyediakan fasilitas pendukung berikut untuk memastikan pengalaman belajar yang setara dan bermartabat:
              </p>
              <div className="flex flex-wrap gap-3">
                {accommodations.length > 0 ? accommodations.map((item, idx) => (
                  <span key={idx} className="rounded-2xl border-2 border-slate-900 bg-white px-5 py-3 text-[10px] font-black uppercase italic text-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-transform hover:scale-105">
                    {item}
                  </span>
                )) : (
                  <p className="text-[10px] font-black uppercase italic text-slate-300">Data dukungan akomodasi sedang dalam proses verifikasi sistem.</p>
                )}
              </div>
            </section>

            {/* PELATIHAN AKTIF */}
            <section className="space-y-8">
              <h2 className="flex items-center gap-3 text-2xl font-black uppercase italic tracking-tighter text-blue-600 leading-none">
                <Zap size={32} /> Program Pelatihan Tersedia
              </h2>
              <div className="grid gap-6">
                {activeTrainings.length > 0 ? activeTrainings.map((t) => (
                  <a key={t.id} href={`/pelatihan/${t.id}`} className="group relative flex items-center justify-between rounded-[3rem] border-2 border-slate-100 p-8 transition-all hover:border-slate-900 hover:shadow-2xl bg-white overflow-hidden">
                    <div className="relative z-10 text-left">
                      <span className="inline-block rounded-full bg-emerald-100 px-3 py-1 text-[8px] font-black uppercase text-emerald-700 mb-2">Registration Open</span>
                      <h3 className="text-2xl font-black uppercase italic tracking-tighter group-hover:text-blue-600 leading-none">{t.title}</h3>
                      <div className="mt-4 flex gap-6 text-[10px] font-bold text-slate-400 uppercase italic">
                        <span className="flex items-center gap-1 text-slate-900"><Calendar size={14} /> Akhir Pendaftaran: {t.registration_deadline}</span>
                      </div>
                    </div>
                    <div className="size-16 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-xl group-hover:bg-blue-600 transition-all group-hover:rotate-[-45deg]">
                      <ArrowRight size={28} />
                    </div>
                  </a>
                )) : (
                  <div className="rounded-[3rem] border-4 border-dashed border-slate-50 p-20 text-center">
                    <p className="text-[11px] font-black uppercase italic text-slate-300">Saat ini tidak ada pendaftaran aktif. Silakan pantau secara berkala.</p>
                  </div>
                )}
              </div>
            </section>

            {/* RIWAYAT PELATIHAN (ARSIP) */}
            {pastTrainings.length > 0 && (
              <section className="space-y-8">
                <h2 className="flex items-center gap-3 text-2xl font-black uppercase italic tracking-tighter text-slate-400 leading-none">
                  <History size={32} /> Jejak Rekam Program
                </h2>
                <div className="grid gap-4 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                  {pastTrainings.map((t) => (
                    <div key={t.id} className="flex items-center justify-between rounded-[2.5rem] border-2 border-slate-50 p-6">
                      <div className="text-left">
                        <h3 className="text-lg font-black uppercase italic text-slate-600 leading-none">{t.title}</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Batch Selesai: {t.end_date}</p>
                      </div>
                      <CheckCircle2 size={24} className="text-slate-200" />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* SIDEBAR ANALITIK: Data Valid Riset */}
          <aside className="space-y-12">
            <div className="rounded-[3.5rem] bg-slate-900 p-10 text-white shadow-2xl text-left border-t-[12px] border-blue-600">
              <h4 className="mb-8 flex items-center gap-2 border-b border-white/10 pb-4 text-[10px] font-black uppercase text-blue-400 tracking-widest leading-none">
                <Star size={12} fill="currentColor" /> Kinerja Pemberdayaan
              </h4>
              <div className="space-y-10">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-6xl font-black tracking-tighter leading-none">{totalTalenta}</p>
                    <p className="mt-2 text-[9px] font-black uppercase opacity-60 italic leading-none">Talenta Terpeta</p>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-black text-emerald-400 leading-none">{rate}%</p>
                    <p className="mt-2 text-[9px] font-black uppercase opacity-60 italic leading-none">Employment Rate</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10 transition-colors hover:bg-white/10">
                    <p className="text-[8px] font-black uppercase text-blue-400 mb-1 leading-none tracking-tighter">Pria</p>
                    <p className="text-2xl font-black leading-none">{genMap.male || 0}</p>
                  </div>
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10 transition-colors hover:bg-white/10">
                    <p className="text-[8px] font-black uppercase text-pink-400 mb-1 leading-none tracking-tighter">Wanita</p>
                    <p className="text-2xl font-black leading-none">{genMap.female || 0}</p>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 italic text-center opacity-40">
                  <p className="text-[9px] font-bold leading-relaxed">Laporan dampak ini terintegrasi secara otomatis dengan sistem disabilitas.com 2026.</p>
                </div>
              </div>
            </div>

            {/* SPEKTRUM PESERTA */}
            <div className="rounded-[3.5rem] border-4 border-slate-100 p-10 bg-white shadow-sm text-left">
              <h3 className="mb-8 flex items-center gap-3 text-lg font-black uppercase tracking-tighter italic leading-none">
                <Users size={24} className="text-blue-600" /> Keberagaman Inklusi
              </h3>
              <div className="space-y-8">
                {Object.entries(disMap).map(([type, count]) => (
                  <div key={type} className="space-y-3">
                    <div className="flex justify-between text-[9px] font-black uppercase text-slate-500 leading-none">
                      <span>{type}</span>
                      <span className="text-slate-900 font-black">{totalTalenta > 0 ? Math.round((Number(count)/totalTalenta)*100) : 0}%</span>
                    </div>
                    <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.3)]" style={{ width: `${totalTalenta > 0 ? (Number(count)/totalTalenta)*100 : 0}%` }} />
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
