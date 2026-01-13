import React from "react";
import { supabase } from "@/lib/supabase";
import { 
  MapPin, Info, Zap, Calendar, ArrowRight,
  ShieldCheck, Award, Users, Globe, History, CheckCircle2
} from "lucide-react";
import { Metadata } from "next";

type PageProps = {
  params: { id: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { data: partner } = await supabase.from("partners").select("name").eq("id", params.id).maybeSingle();
  return { 
    title: `${partner?.name || "Profil Mitra"} | disabilitas.com`,
    description: `Lihat capaian dampak dan program pelatihan inklusif dari ${partner?.name}.`
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
        MITRA TIDAK DITEMUKAN
      </div>
    );
  }

  // Kategorisasi Pelatihan Secara Otomatis
  const today = new Date().toISOString().split('T')[0];
  const activeTrainings = allTrainings.filter(t => t.registration_deadline >= today);
  const pastTrainings = allTrainings.filter(t => t.registration_deadline < today);

  // Ambil Statistik Langsung Dari Kolom Database (Tanpa Hitung Ulang)
  const totalTalenta = Number(partner.stats_impact_total || 0);
  const totalHired = Number(partner.stats_impact_hired || 0);
  const rate = totalTalenta > 0 ? Math.round((totalHired / totalTalenta) * 100) : 0;
  const disMap = (partner.stats_disability_map as Record<string, number>) || {};
  const genMap = (partner.stats_gender_map as Record<string, number>) || { male: 0, female: 0 };

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
                Official Training Partner
              </div>
              <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none md:text-6xl">{partner.name}</h1>
              <div className="flex flex-wrap justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 lg:justify-start">
                <span className="flex items-center gap-2"><MapPin size={16} className="text-blue-600" /> {partner.location || "Lokasi tidak tersedia"}</span>
                {partner.website && (
                  <a href={partner.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-blue-600 transition-colors">
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
            {/* VISI */}
            <section className="space-y-6 text-left">
              <h2 className="flex items-center gap-3 text-2xl font-black uppercase italic tracking-tighter">
                <Info className="text-blue-600" size={28} /> Visi Pengembangan
              </h2>
              <div className="rounded-[3rem] border-2 border-slate-100 bg-slate-50 p-10 text-xl italic font-medium text-slate-700 whitespace-pre-line leading-relaxed shadow-inner">
                {partner.description || "Mitra ini berfokus pada pemberdayaan talenta disabilitas melalui pelatihan keterampilan kerja."}
              </div>
            </section>

            {/* PELATIHAN AKTIF (BUKA PENDAFTARAN) */}
            <section className="space-y-8 text-left">
              <h2 className="flex items-center gap-3 text-2xl font-black uppercase italic tracking-tighter text-blue-600">
                <Zap size={32} /> Program Pelatihan Aktif
              </h2>
              <div className="grid gap-6">
                {activeTrainings.length > 0 ? activeTrainings.map((t) => (
                  <a key={t.id} href={`/trainings/${t.id}`} className="group flex items-center justify-between rounded-[3rem] border-2 border-slate-100 p-8 transition-all hover:border-slate-900 hover:shadow-xl bg-white">
                    <div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-emerald-600">Pendaftaran Dibuka</span>
                      <h3 className="text-2xl font-black uppercase italic tracking-tighter group-hover:text-blue-600">{t.title}</h3>
                      <p className="mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Deadline: {t.registration_deadline}</p>
                    </div>
                    <div className="size-14 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-lg group-hover:bg-blue-600 transition-colors">
                      <ArrowRight />
                    </div>
                  </a>
                )) : (
                  <p className="text-[10px] font-black uppercase italic text-slate-300 border-4 border-dashed border-slate-50 p-10 rounded-[3rem] text-center">Tidak ada pendaftaran yang dibuka saat ini.</p>
                )}
              </div>
            </section>

            {/* PELATIHAN SELESAI (ARSIP) */}
            {pastTrainings.length > 0 && (
              <section className="space-y-8 text-left">
                <h2 className="flex items-center gap-3 text-2xl font-black uppercase italic tracking-tighter text-slate-400">
                  <History size={32} /> Riwayat Program Pelatihan
                </h2>
                <div className="grid gap-4 opacity-60">
                  {pastTrainings.map((t) => (
                    <div key={t.id} className="flex items-center justify-between rounded-[2.5rem] border-2 border-slate-50 p-6 grayscale hover:grayscale-0 transition-all">
                      <div>
                        <h3 className="text-lg font-black uppercase italic text-slate-600">{t.title}</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Selesai pada: {t.end_date}</p>
                      </div>
                      <CheckCircle2 size={24} className="text-slate-300" />
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* SIDEBAR ANALITIK */}
          <aside className="space-y-12">
            <div className="rounded-[3.5rem] bg-slate-900 p-10 text-white shadow-2xl text-left">
              <h4 className="mb-8 border-b border-white/10 pb-4 text-[10px] font-black uppercase text-blue-400 tracking-widest">Partner Statistics</h4>
              <div className="space-y-8">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-5xl font-black tracking-tighter">{totalTalenta}</p>
                    <p className="mt-1 text-[8px] font-black uppercase opacity-60 italic">Peserta Terpeta</p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-black text-emerald-400 leading-none">{rate}%</p>
                    <p className="mt-1 text-[8px] font-black uppercase opacity-60 italic">Success Rate</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                    <p className="text-[8px] font-black uppercase text-blue-400 mb-1">Laki-laki</p>
                    <p className="text-2xl font-black">{genMap.male || 0}</p>
                  </div>
                  <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                    <p className="text-[8px] font-black uppercase text-pink-400 mb-1">Perempuan</p>
                    <p className="text-2xl font-black">{genMap.female || 0}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 italic text-center">
                  <p className="text-[9px] font-bold leading-relaxed opacity-40">Data divalidasi sistem otomatis disabilitas.com 2026.</p>
                </div>
              </div>
            </div>

            {/* SPEKTRUM INKLUSI */}
            <div className="rounded-[3.5rem] border-4 border-slate-100 p-10 bg-white shadow-sm text-left">
              <h3 className="mb-8 flex items-center gap-3 text-lg font-black uppercase tracking-tighter italic">
                <Users size={24} className="text-blue-600" /> Spektrum Inklusi
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
