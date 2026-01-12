export const runtime = 'edge';
export const dynamic = 'force-dynamic';

import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { 
  ShieldCheck, MapPin, Globe, Users, 
  Award, BookOpen, ArrowRight, Share2,
  Calendar, GraduationCap
} from "lucide-react";
import Link from "next/link";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { data: partner } = await supabase.from("partners").select("name, description").eq("id", params.id).single();
  if (!partner) return { title: "Institusi Tidak Ditemukan" };
  return {
    title: `${partner.name} | Profil Institusi Inklusif - Disabilitas.com`,
    description: partner.description || `Melihat kontribusi ${partner.name} dalam memberdayakan talenta disabilitas.`,
    alternates: { canonical: `https://disabilitas.com/partner/${params.id}` },
  };
}

export default async function PartnerPublicProfile({ params }: { params: { id: string } }) {
  // 1. Fetch Data Partner dengan Revalidate 0 untuk bypass cache
  const { data: partner, error: pError } = await supabase
    .from("partners")
    .select("*")
    .eq("id", params.id)
    .single();

  if (pError || !partner) {
    console.error("DEBUG - Partner ID:", params.id);
    console.error("DEBUG - Error:", pError);
    return notFound();
  }

  // 2. Ambil ID Talenta terafiliasi (Gelar & Pelatihan)
  const { data: certs } = await supabase.from("certifications").select("profile_id").eq("organizer_name", partner.name);
  const certProfileIds = Array.from(new Set(certs?.map(c => c.profile_id) || []));
  
  const { data: talenta } = await supabase.from("profiles").select("id, disability_type, career_status")
    .or(`university.eq."${partner.name}",id.in.(${certProfileIds.length > 0 ? certProfileIds.map(id => `'${id}'`).join(',') : "'00000000-0000-0000-0000-000000000000'"})`);

  // 3. Ambil Pelatihan
  const { data: trainings } = await supabase.from("trainings").select("*").eq("partner_id", partner.id).order("start_date", { ascending: false });

  const totalImpact = talenta?.length || 0;
  const employed = talenta?.filter(t => !["Job Seeker", "Belum Bekerja", "Pelajar / Mahasiswa"].includes(t.career_status)).length || 0;
  
  const disabilityDist: Record<string, number> = {};
  talenta?.forEach(t => { if (t.disability_type) disabilityDist[t.disability_type] = (disabilityDist[t.disability_type] || 0) + 1; });

  const activeTrainings = trainings?.filter(t => new Date(t.end_date || '') >= new Date()) || [];
  const archivedTrainings = trainings?.filter(t => new Date(t.end_date || '') < new Date()) || [];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-sans text-slate-900">
      <div className="bg-slate-900 pt-32 pb-20 px-4 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
            <div className="space-y-4 text-left">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                   <GraduationCap size={28} />
                </div>
                <span className="inline-block rounded-full bg-blue-600/20 border border-blue-600/30 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em]">
                  {partner.category} Terverifikasi
                </span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none">{partner.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-slate-400">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest"><MapPin size={16} className="text-blue-500" /> {partner.location}</div>
                {partner.website && <a href={partner.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest hover:text-white transition-colors"><Globe size={16} className="text-blue-500" /> Website</a>}
              </div>
            </div>
            <div className="rounded-[2.5rem] bg-white/10 p-8 backdrop-blur-md border border-white/10 text-left min-w-[240px]">
              <div className="flex items-center gap-3 mb-2"><ShieldCheck className="text-emerald-400" size={24} /><span className="text-[10px] font-black uppercase tracking-widest opacity-60">Inclusion Score</span></div>
              <p className="text-6xl font-black italic tracking-tighter leading-none">{partner.inclusion_score}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto -mt-10 max-w-5xl px-4">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <section className="rounded-[3rem] border-2 border-slate-100 bg-white p-10 text-left shadow-xl shadow-slate-200/50">
              <h2 className="mb-6 flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-blue-600"><Award size={20} /> Kontribusi & Visi Inklusi</h2>
              <div className="space-y-6 text-xl font-medium leading-relaxed text-slate-800 md:text-2xl italic">
                <p>Mendampingi <strong>{totalImpact} talenta disabilitas</strong> dengan tingkat keterserapan kerja alumni sebesar <strong>{totalImpact > 0 ? Math.round((employed/totalImpact)*100) : 0}%</strong>.</p>
                <p className="text-sm not-italic text-slate-500 leading-relaxed border-t border-slate-50 pt-6">{partner.description || "Komitmen sedang diperbarui."}</p>
              </div>
            </section>

            <section className="space-y-6 text-left">
              <h2 className="px-4 flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-slate-900"><BookOpen size={20} className="text-blue-600" /> Program Pelatihan</h2>
              <div className="space-y-4">
                {activeTrainings.map((t) => (
                  <Link key={t.id} href={`/pelatihan/${t.id}`} className="group flex flex-col md:flex-row items-start md:items-center justify-between rounded-[2.5rem] border-2 border-blue-100 bg-white p-8 transition-all hover:border-blue-600 hover:shadow-2xl hover:shadow-blue-100">
                    <div className="space-y-2 text-left"><span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-[8px] font-black uppercase text-blue-600">Pendaftaran Terbuka</span><h3 className="text-xl font-black uppercase italic tracking-tighter text-slate-900 group-hover:text-blue-600">{t.title}</h3></div>
                    <ArrowRight className="mt-4 md:mt-0 text-slate-300 transition-transform group-hover:translate-x-2 group-hover:text-blue-600" size={24} />
                  </Link>
                ))}
                {(!trainings || trainings.length === 0) && (
                  <div className="rounded-[2.5rem] border-2 border-dashed border-slate-200 p-12 text-center"><p className="text-xs font-bold uppercase tracking-widest text-slate-400">Belum ada riwayat pelatihan</p></div>
                )}
              </div>
            </section>
          </div>

          <div className="space-y-8 text-left">
            <div className="rounded-[3rem] border-2 border-slate-100 bg-white p-8 shadow-lg">
              <h3 className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400"><Users size={16} /> Spektrum Inklusi</h3>
              <div className="space-y-6">
                {Object.entries(disabilityDist).map(([type, count]) => (
                  <div key={type} className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter text-slate-600"><span>{type}</span><span>{totalImpact > 0 ? Math.round((count / totalImpact) * 100) : 0}%</span></div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-50"><div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-1000" style={{ width: `${totalImpact > 0 ? (count / totalImpact) * 100 : 0}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
