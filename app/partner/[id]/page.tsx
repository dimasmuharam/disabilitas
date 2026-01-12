export const runtime = 'edge';
import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { 
  ShieldCheck, MapPin, Globe, Users, 
  Award, BookOpen, ArrowRight, Share2,
  Calendar
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
  const { data: partner } = await supabase.from("partners").select("*").eq("id", params.id).single();
  if (!partner) notFound();

  const { data: certs } = await supabase.from("certifications").select("profile_id").eq("organizer_name", partner.name);
  const certProfileIds = Array.from(new Set(certs?.map(c => c.profile_id) || []));
  
  const { data: talenta } = await supabase.from("profiles").select("id, disability_type, career_status")
    .or(`university.eq."${partner.name}",id.in.(${certProfileIds.length > 0 ? certProfileIds.map(id => `'${id}'`).join(',') : "'00000000-0000-0000-0000-000000000000'"})`);

  const { data: trainings } = await supabase.from("trainings").select("*").eq("partner_id", partner.id).order("start_date", { ascending: false });

  const totalImpact = talenta?.length || 0;
  const employed = talenta?.filter(t => !["Job Seeker", "Belum Bekerja", "Pelajar / Mahasiswa"].includes(t.career_status)).length || 0;
  
  const disabilityDist: Record<string, number> = {};
  talenta?.forEach(t => { if (t.disability_type) disabilityDist[t.disability_type] = (disabilityDist[t.disability_type] || 0) + 1; });

  const activeTrainings = trainings?.filter(t => new Date(t.end_date || '') >= new Date()) || [];
  const archivedTrainings = trainings?.filter(t => new Date(t.end_date || '') < new Date()) || [];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 text-slate-900 font-sans">
      <div className="bg-slate-900 px-4 pt-32 pb-20 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
            <div className="space-y-4">
              <span className="inline-block rounded-full bg-blue-600 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em]">{partner.category} Terverifikasi</span>
              <h1 className="text-4xl font-black uppercase italic leading-none tracking-tighter md:text-6xl">{partner.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-slate-400">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest"><MapPin size={16} className="text-blue-500" /> {partner.location}</div>
                {partner.website && <a href={partner.website} target="_blank" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest transition-colors hover:text-white"><Globe size={16} className="text-blue-500" /> Website</a>}
              </div>
            </div>
            <div className="rounded-[2.5rem] border border-white/10 bg-white/10 p-8 backdrop-blur-md min-w-[240px] text-left">
              <div className="mb-2 flex items-center gap-3"><ShieldCheck className="text-emerald-400" size={24} /><span className="text-[10px] font-black uppercase tracking-widest opacity-60">Inclusion Score</span></div>
              <p className="text-6xl font-black italic leading-none tracking-tighter">{partner.inclusion_score}%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto -mt-10 max-w-5xl px-4">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <section className="rounded-[3rem] border-2 border-slate-100 bg-white p-10 text-left shadow-xl shadow-slate-200/50">
              <h2 className="mb-6 flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] text-blue-600"><Award size={20} /> Kontribusi & Visi</h2>
              <div className="space-y-6 text-xl font-medium leading-relaxed text-slate-800 md:text-2xl italic">
                <p><strong>{partner.name}</strong> telah mendampingi <strong>{totalImpact} talenta disabilitas</strong>.</p>
                <p>Tingkat keterserapan kerja alumni mencapai <strong>{totalImpact > 0 ? Math.round((employed/totalImpact)*100) : 0}%</strong>.</p>
                <p className="border-t border-slate-50 pt-6 text-sm not-italic leading-relaxed text-slate-500">{partner.description || "Komitmen sedang diperbarui."}</p>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="flex items-center gap-3 px-4 text-xs font-black uppercase tracking-[0.2em] text-slate-900"><BookOpen size={20} className="text-blue-600" /> Program Pelatihan</h2>
              <div className="space-y-4">
                {activeTrainings.map((t) => (
                  <Link key={t.id} href={`/pelatihan/${t.id}`} className="group flex flex-col items-start justify-between rounded-[2.5rem] border-2 border-blue-100 bg-white p-8 transition-all hover:border-blue-600 hover:shadow-2xl hover:shadow-blue-100 md:flex-row md:items-center">
                    <div className="space-y-2"><span className="inline-block rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[8px] font-black uppercase text-blue-600">Terbuka</span><h3 className="text-xl font-black uppercase italic leading-tight tracking-tighter group-hover:text-blue-600">{t.title}</h3></div>
                    <ArrowRight className="mt-4 transition-transform group-hover:translate-x-2 group-hover:text-blue-600 md:mt-0" size={24} />
                  </Link>
                ))}
                {archivedTrainings.map((t) => (
                  <div key={t.id} className="flex flex-col items-start justify-between rounded-[2.5rem] border-2 border-slate-50 bg-slate-50/50 p-8 opacity-70 grayscale md:flex-row md:items-center">
                    <div className="space-y-2"><span className="inline-block rounded-full bg-slate-200 px-3 py-1 text-[8px] font-black uppercase text-slate-500">Arsip</span><h3 className="text-xl font-black uppercase italic leading-tight tracking-tighter text-slate-700">{t.title}</h3></div>
                  </div>
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
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter text-slate-600"><span>{type}</span><span>{Math.round((count / totalImpact) * 100)}%</span></div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-50"><div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-1000" style={{ width: `${(count / totalImpact) * 100}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[3rem] bg-slate-900 p-8 text-white shadow-2xl">
              <h3 className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400"><ShieldCheck size={16} /> Akomodasi</h3>
              <div className="flex flex-wrap gap-2">{partner.master_accommodations_provided?.map((item: string) => <span key={item} className="rounded-xl border border-white/5 bg-white/10 px-3 py-2 text-[9px] font-black uppercase tracking-tight text-slate-300">{item}</span>)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
