import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { 
  School, ShieldCheck, Users, Briefcase, 
  MapPin, Globe, Award, Zap, 
  BarChart3, Heart, CheckCircle2, Sparkles,
  User
} from "lucide-react";

export const runtime = "edge";
export const revalidate = 3600;

interface Props {
  params: { id: string };
}

/**
 * 1. DYNAMIC METADATA UNTUK SEO
 * Mengambil data dari DB sebelum render untuk mengisi tag <title> dan <meta>
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: campus } = await supabase
    .from("campuses")
    .select("name, description, location")
    .eq("id", params.id)
    .single();

  if (!campus) return { title: "Kampus Tidak Ditemukan" };

  const cleanDescription = campus.description?.substring(0, 160) || `Profil inklusivitas ${campus.name} di ${campus.location}.`;

  return {
    title: `${campus.name} | Profil Inklusi Kampus`,
    description: cleanDescription,
    openGraph: {
      title: `${campus.name} - Indeks Inklusi Nasional`,
      description: cleanDescription,
      type: "website",
      url: `https://disabilitas.com/kampus/${params.id}`,
    },
    twitter: {
      card: "summary_large_image",
      title: campus.name,
      description: cleanDescription,
    },
  };
}

export default async function CampusPublicProfile({ params }: Props) {
  const { data: campus, error } = await supabase
    .from("campuses")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !campus) notFound();

  // Kalkulasi Statistik
  const totalTalents = Number(campus.stats_academic_total || 0);
  const hiredTalents = Number(campus.stats_academic_hired || 0);
  const employmentRate = totalTalents > 0 ? Math.round((hiredTalents / totalTalents) * 100) : 0;
  
  const disMap = campus.stats_disability_map || {};
  const genMap = campus.stats_gender_map || { male: 0, female: 0 };
  
  const badgeLabel = campus.inclusion_score >= 80 ? "Platinum" : campus.inclusion_score >= 60 ? "Gold" : campus.inclusion_score >= 40 ? "Silver" : "Bronze";

  // JSON-LD untuk SEO Google (Rich Results)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": campus.name,
    "description": campus.description,
    "url": campus.website || `https://disabilitas.com/kampus/${params.id}`,
    "address": { 
      "@type": "PostalAddress", 
      "addressLocality": campus.location 
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": campus.inclusion_score,
      "bestRating": "100",
      "worstRating": "0"
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-emerald-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HERO SECTION */}
      <header className="relative border-b-8 border-slate-900 bg-slate-50 px-4 py-20 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-start gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-6 text-left">
              <div className="flex items-center gap-4">
                <div className="inline-flex items-center gap-3 rounded-2xl bg-emerald-600 p-4 text-white shadow-xl shadow-emerald-100">
                  <School size={40} />
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border-2 border-slate-900 bg-slate-900 px-4 py-2 text-white shadow-[4px_4px_0px_0px_rgba(16,185,129,1)]">
                  <Sparkles size={16} className="text-amber-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest">{badgeLabel} Status</span>
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-5xl font-black uppercase italic leading-none tracking-tighter lg:text-7xl">
                  {campus.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-left text-sm font-black uppercase tracking-widest text-slate-400">
                  <span className="flex items-center gap-1.5"><MapPin size={16} /> {campus.location}</span>
                  {campus.website && (
                    <a href={campus.website} target="_blank" className="flex items-center gap-1.5 text-blue-600 hover:underline">
                      <Globe size={16} /> Website Resmi
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* MAIN SCORE CARD */}
            <div className="w-full rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 text-left shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] md:w-80">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">National Inclusion Index</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-6xl font-black italic tracking-tighter text-emerald-600">{campus.inclusion_score || 0}%</span>
                <ShieldCheck size={48} className="text-emerald-500" />
              </div>
              <p className="mt-4 text-[10px] font-bold uppercase italic leading-tight opacity-60">
                Peringkat aksesibilitas dan kemandirian lulusan tersertifikasi.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-20">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-3">
          
          {/* LEFT COLUMN: NARRATIVE & BREAKDOWN */}
          <div className="space-y-12 text-left lg:col-span-2">
            
            {/* SMART NARRATIVE */}
            <section className="rounded-3xl border-l-8 border-slate-900 bg-slate-50 p-10 italic shadow-sm">
              <p className="text-2xl font-black leading-tight text-slate-800 md:text-3xl">
                &quot;{campus.smart_narrative_summary || campus.description}&quot;
              </p>
            </section>

            {/* 3 CLUSTER DETAILS */}
            <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                { label: "Akses Fisik", score: campus.inclusion_score_physical, color: "bg-emerald-500", sub: "Mobilitas Kampus" },
                { label: "Akses Digital", score: campus.inclusion_score_digital, color: "bg-blue-500", sub: "LMS & Portal" },
                { label: "Output Alumni", score: campus.inclusion_score_output, color: "bg-purple-500", sub: "Employment Rate" }
              ].map((c) => (
                <div key={c.label} className="rounded-3xl border-2 border-slate-100 bg-slate-50 p-6">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{c.label}</p>
                  <p className="mt-1 text-3xl font-black">{c.score || 0}%</p>
                  <p className="mt-1 text-[9px] font-bold uppercase text-slate-400">{c.sub}</p>
                  <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white">
                    <div 
                      className={`h-full transition-all duration-1000 ${c.color}`} 
                      style={{ width: `${c.score || 0}%` }} 
                    />
                  </div>
                </div>
              ))}
            </section>

            {/* ACCOMMODATION LIST */}
            <section className="rounded-[3rem] border-4 border-slate-900 bg-white p-10 shadow-[10px_10px_0px_0px_rgba(241,245,249,1)]">
              <h3 className="mb-8 flex items-center gap-2 text-xs font-black uppercase leading-none tracking-widest text-slate-900">
                <CheckCircle2 size={18} className="text-emerald-500" /> Fasilitas & Akomodasi Tersedia
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {(campus.master_accommodations_provided || []).length > 0 ? (
                  campus.master_accommodations_provided.map((acc: string) => (
                    <div key={acc} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                      <div className="size-2 shrink-0 rounded-full bg-emerald-500" /> {acc}
                    </div>
                  ))
                ) : (
                  <p className="text-left text-sm font-bold italic text-slate-400">Belum ada data fasilitas publik.</p>
                )}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: ANALYTICS */}
          <div className="space-y-8 text-left">
            <div className="rounded-[3rem] bg-slate-900 p-10 text-white shadow-2xl">
              <h3 className="mb-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                <BarChart3 size={18} /> Tracer Study Result
              </h3>
              <div className="space-y-10">
                <div>
                  <p className="text-[9px] font-black uppercase leading-none tracking-widest opacity-60">Populasi Mahasiswa Disabilitas</p>
                  <p className="text-5xl font-black italic tracking-tighter">{totalTalents} <span className="text-sm uppercase not-italic opacity-40">Orang</span></p>
                </div>
                <div className="border-l-4 border-emerald-500 pl-6">
                  <p className="text-[9px] font-black uppercase leading-none tracking-widest text-emerald-400">Employment Rate</p>
                  <p className="text-5xl font-black italic tracking-tighter">{employmentRate}%</p>
                  <p className="mt-2 text-[10px] font-medium uppercase leading-relaxed opacity-60">Alumni telah terserap industri profesional.</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-8">
              <h3 className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase leading-none tracking-widest text-slate-900">
                <Users size={16} /> Analisis Gender
              </h3>
              <div className="flex gap-4">
                <div className="flex-1 rounded-2xl border-b-4 border-blue-500 bg-slate-50 p-4 text-center">
                  <User className="mx-auto mb-2 text-blue-500" size={20} />
                  <p className="text-[8px] font-black uppercase text-slate-400">Laki-laki</p>
                  <p className="text-2xl font-black">{genMap.male || 0}</p>
                </div>
                <div className="flex-1 rounded-2xl border-b-4 border-pink-500 bg-slate-50 p-4 text-center">
                  <User className="mx-auto mb-2 text-pink-500" size={20} />
                  <p className="text-[8px] font-black uppercase text-slate-400">Perempuan</p>
                  <p className="text-2xl font-black">{genMap.female || 0}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-8">
              <h3 className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase leading-none tracking-widest text-slate-900">
                <Zap size={16} className="text-orange-500" /> Ragam Disabilitas
              </h3>
              <div className="space-y-4">
                {Object.entries(disMap).length > 0 ? (
                  Object.entries(disMap).map(([type, count]: [string, any]) => (
                    <div key={type}>
                      <div className="flex justify-between text-[9px] font-black uppercase text-slate-500">
                        <span>{type}</span><span>{count}</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                        <div 
                          className="h-full bg-slate-900 transition-all duration-1000" 
                          style={{ width: `${(count / (totalTalents || 1)) * 100}%` }} 
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] font-black italic text-slate-300">Data sebaran belum tersedia.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER CTA */}
      <footer className="mx-auto max-w-7xl px-4 py-20">
        <div className="rounded-[3rem] bg-emerald-600 p-12 text-center text-white shadow-2xl">
          <Award className="mx-auto mb-6 shadow-emerald-700" size={48} />
          <h2 className="text-3xl font-black uppercase italic leading-tight tracking-tighter md:text-5xl">
            Wujudkan Kampus Inklusif
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm font-bold uppercase leading-relaxed tracking-widest opacity-80">
            Bergabunglah dengan {campus.name} dan bangun masa depan pendidikan yang setara bagi semua talenta.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a href="/daftar" className="rounded-2xl bg-slate-900 px-10 py-5 text-[11px] font-black uppercase italic tracking-[0.2em] transition-all hover:bg-white hover:text-slate-900">
              Daftar Sebagai Mahasiswa
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}