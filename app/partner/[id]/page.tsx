export const runtime = "edge";
export const revalidate = 0;

import React from "react";
import { supabase } from "@/lib/supabase";
import { 
  MapPin, Info, Zap, Calendar, ArrowRight,
  ShieldCheck, Award, Users, Globe, History, 
  CheckCircle2, Accessibility // Ikon Akomodasi
} from "lucide-react";
import { Metadata } from "next";

type PageProps = {
  params: { id: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { data: partner } = await supabase.from("partners").select("name").eq("id", params.id).maybeSingle();
  return { 
    title: `${partner?.name || "Profil Mitra"} | disabilitas.com`,
    description: `Lihat capaian dampak dan fasilitas inklusif dari ${partner?.name}.`
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

  return (
    <div className="min-h-screen bg-white pb-24 font-sans text-slate-900 text-left leading-relaxed">
      {/* HEADER */}
      <header className="border-b-4 border-slate-900 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-end">
            <div className="flex size-32 shrink-0 items-center justify-center rounded-[2.5rem] bg-blue-600 text-white shadow-2xl">
              <Award size={60} />
            </div>
            <div className="flex-1 text-center lg:text-left space-y-4">
              <div className="inline-block rounded-full bg-blue-50 px-4 py-1 text-[10px] font-black uppercase tracking-widest text-blue-600">
                Verified Training Partner
              </div>
              <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none md:text-6xl">{partner.name}</h1>
              <div className="flex flex-wrap justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 lg:justify-start">
                <span className="flex items-center gap-2"><MapPin size={16} className="text-blue-600" /> {partner.location || "Lokasi Global"}</span>
                {partner.website && (
                  <a href={partner.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-600">
                    <Globe size={16} /> Website Resmi
                  </a>
                )}
              </div>
            </div>
            <div className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
              <p className="text-[10px] font-black uppercase opacity-60">Inclusion Score</p>
              <p className="text-5xl font-black italic tracking-tighter text-blue-600">{partner.inclusion_score || 0}%</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-16 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-20">
            {/* VISI & DESKRIPSI */}
            <section className="space-y-6">
              <h2 className="flex items-center gap-3 text-2xl font-black uppercase italic tracking-tighter">
                <Info className="text-blue-600" size={28} /> Tentang Mitra
              </h2>
              <div className="rounded-[3rem] border-2 border-slate-100 bg-slate-50 p-10 text-xl italic font-medium text-slate-700 whitespace-pre-line leading-relaxed shadow-inner">
                {partner.description || "Mitra ini berkomitmen penuh dalam pengembangan talenta disabilitas yang inklusif."}
              </div>
            </section>

            {/* AKOMODASI YANG DISEDIAKAN */}
            <section className="space-y-6">
              <h2 className="flex items-center gap-3 text-2xl font-black uppercase italic tracking-tighter">
                <Accessibility className="text-blue-600" size={28} /> Fasilitas Akomodasi
              </h2>
              <div className="flex flex-wrap gap-3">
                {accommodations.length > 0 ? accommodations.map((item, idx) => (
                  <span key={idx} className="rounded-2xl border-2 border-slate-900 bg-white px-5 py-3 text-[10px] font-black uppercase italic text-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                    {item}
                  </span>
                )) : (
                  <p className="text-[10px] font-black uppercase italic text-slate-300">Data akomodasi sedang diperbarui.</p>
                )}
              </div>
            </section>

            {/* PELATIHAN AKTIF */}
            <section className="space-y-8">
              <h2 className="flex items-center gap-3 text-2xl font-black uppercase italic tracking-tighter text-blue-600">
                <Zap size={32} /> Program Pelatihan Aktif
              </h2>
              <div className="grid gap-6">
                {activeTrainings.length > 0 ? activeTrainings.map((t) => (
                  <a key={t.id} href={`/pelatihan/${t.id}`} className="group flex items-center justify-between rounded-[3rem] border-2 border-slate-100 p-8 transition-all hover:border-slate-900 hover:shadow-xl bg-white">
                    <div className="text-left">
                      <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600">Terbuka untuk umum</span>
                      <h3 className="text-2xl font-black uppercase italic tracking-tighter group-hover:text-blue-600">{t.title}</h3>
                      <p className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Pendaftaran Berakhir: {t.registration_deadline}</p>
                    </div>
                    <div className="size-14 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-lg group-hover:bg-blue-600 transition-all">
                      <ArrowRight />
                    </div>
                  </a>
                )) : (
                  <p className="text-center py-16 text-[10px] font-black uppercase italic text-slate-300 border-4 border-dashed border-slate-50 rounded-[3rem]">Belum ada pendaftaran yang dibuka saat ini.</p>
                )}
              </div>
            </section>

            {/* PELATIHAN SELESAI */}
            {pastTrainings.length > 0 && (
              <section className="space-y-8">
                <h2 className="flex items-center gap-3 text-2xl font-black uppercase italic tracking-tighter text-slate-400">
                  <History size={32} /> Arsip Program Pelatihan
                </h2>
                <div className="grid gap-4 opacity-50">
                  {pastTrainings.map((t) => (
                    <div key={t.id} className="flex items-center justify-between rounded-[2.5rem] border-2 border-slate-50 p-6 grayscale">
                      <div className="text-left">
                        <h3 className="text-lg font-black uppercase italic text-slate-600">{t.title}</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Selesai: {t.end_date}</p>
                      </div>
                      <CheckCircle2 size={24} className="text-slate-200" />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* SIDEBAR ANALITIK */}
          <aside className="space-y-12">
            <div className="rounded-[3.5rem] bg-slate-900 p-10 text-white shadow-2xl text-left">
              <h4 className="mb-8 border-b border-white/10 pb-4 text-[10px] font-black uppercase text-blue-400 tracking-widest leading-none">Partner Statistics</h4>
              <div className="space-y-8">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-5xl font-black tracking-tighter">{totalTalenta}</p>
                    <p className="mt-1 text-[8px] font-black uppercase opacity-60 italic">Peserta Dibina</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-emerald-400 leading-none">{rate}%</p>
                    <p className="mt-1 text-[8px] font-black uppercase opacity-60 italic">Lulusan Bekerja</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                    <p className="text-[8px] font-black uppercase text-blue-400 mb-1 leading-none">Laki-laki</p>
                    <p className="text-2xl font-black">{genMap.male || 0}</p>
                  </div>
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                    <p className="text-[8px] font-black uppercase text-pink-400 mb-1 leading-none">Perempuan</p>
                    <p className="text-2xl font-black">{genMap.female || 0}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 italic text-center">
                  <p className="text-[9px] font-bold leading-relaxed opacity-40">Verifikasi data dilakukan otomatis oleh sistem disabilitas.com 2026.</p>
                </div>
              </div>
            </div>

            {/* SPEKTRUM INKLUSI */}
            <div className="rounded-[3.5rem] border-4 border-slate-100 p-10 bg-white shadow-sm text-left">
              <h3 className="mb-8 flex items-center gap-3 text-lg font-black uppercase tracking-tighter italic leading-none">
                <Users size={24} className="text-blue-600" /> Spektrum Peserta
              </h3>
              <div className="space-y-6">
                {Object.entries(disMap).map(([type, count]) => (
                  <div key={type} className="space-y-2">
                    <div className="flex justify-between text-[9px] font-black uppercase text-slate-500">
                      <span>{type}</span>
                      <span>{totalTalenta > 0 ? Math.round((Number(count)/totalTalenta)*100) : 0}%</span>
                    </div>
                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
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
