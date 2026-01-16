import { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { 
  School, ShieldCheck, Users, Briefcase, 
  MapPin, Globe, Award, Zap, 
  BarChart3, Heart, CheckCircle2
} from "lucide-react";

export const runtime = "edge";
export const revalidate = 3600; // Cache 1 jam

interface Props {
  params: { id: string };
}

// 1. SEO & METADATA GENERATOR
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { data: campus } = await supabase
    .from("campuses")
    .select("name, description, location")
    .eq("id", params.id)
    .single();

  if (!campus) return { title: "Kampus Tidak Ditemukan" };

  return {
    title: `Profil Inklusi: ${campus.name} | disabilitas.com`,
    description: campus.description || `Lihat statistik keterserapan kerja mahasiswa disabilitas dan skor inklusi akademik di ${campus.name}.`,
    alternates: { canonical: `https://disabilitas.com/kampus/${params.id}` },
    openGraph: {
      title: campus.name,
      description: campus.description,
images: [`https://disabilitas.com/api/og/campus?id=${params.id}`],    },
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

  // JSON-LD untuk SEO (Schema.org)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    "name": campus.name,
    "description": campus.description,
    "url": campus.website,
    "address": { "@type": "PostalAddress", "addressLocality": campus.location }
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
              <div className="inline-flex items-center gap-3 rounded-2xl bg-emerald-600 p-4 text-white shadow-xl shadow-emerald-100">
                <School size={40} />
              </div>
              <div className="space-y-2">
                <h1 className="text-5xl font-black uppercase italic tracking-tighter leading-none lg:text-7xl">
                  {campus.name}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm font-black uppercase tracking-widest text-slate-400">
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
            <div className="w-full rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] md:w-80">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Inclusion Score</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-6xl font-black italic tracking-tighter text-emerald-600">{campus.inclusion_score}%</span>
                <ShieldCheck size={48} className="text-emerald-500" />
              </div>
              <p className="mt-4 text-[10px] font-bold leading-tight uppercase opacity-60 italic">
                Tingkat aksesibilitas dan kemandirian alumni tersertifikasi.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-20">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-3">
          
          {/* LEFT COLUMN: NARRATIVE & ACCOMMODATION */}
          <div className="space-y-12 lg:col-span-2 text-left">
            <section className="space-y-6">
              <h2 className="flex items-center gap-3 text-2xl font-black uppercase italic tracking-tighter">
                <Heart className="text-pink-500" /> Komitmen Inklusi
              </h2>
              <p className="text-xl font-medium leading-relaxed text-slate-700 md:text-2xl italic">
                {campus.description || `${campus.name} terus berupaya menciptakan ekosistem pendidikan yang setara bagi seluruh mahasiswa tanpa terkecuali.`}
              </p>
            </section>

            {/* 3 CLUSTER DETAILS */}
            <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {[
                { label: "Akses Fisik", score: campus.inclusion_score_physical, color: "emerald", info: "Fasilitas Kampus" },
                { label: "Akses Digital", score: campus.inclusion_score_digital, color: "blue", info: "Akses Web & Apps" },
                { label: "Output Alumni", score: campus.inclusion_score_output, color: "purple", info: "Tingkat Kerja" }
              ].map((c) => (
                <div key={c.label} className="rounded-3xl border-2 border-slate-100 bg-slate-50 p-6">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{c.label}</p>
                  <p className="mt-1 text-2xl font-black">{c.score}%</p>
                  <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white">
                    <div className="h-full transition-all duration-1000" style={{ width: `${c.score}%`, backgroundColor: `var(--${c.color}-500)` }} />
                  </div>
                </div>
              ))}
            </section>

            {/* FACILITIES LIST */}
            <section className="rounded-[3rem] border-4 border-slate-900 bg-white p-10 shadow-[10px_10px_0px_0px_rgba(241,245,249,1)]">
              <h3 className="mb-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-900">
                <CheckCircle2 size={18} className="text-emerald-500" /> Akomodasi Tersedia
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {(campus.master_accommodations_provided || []).map((acc: string) => (
                  <div key={acc} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                    <div className="size-2 rounded-full bg-emerald-500" /> {acc}
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: ANALYTICS */}
          <div className="space-y-8">
            {/* TRACER STUDY BOX */}
            <div className="rounded-[3rem] bg-slate-900 p-10 text-white shadow-2xl">
              <h3 className="mb-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                <BarChart3 size={18} /> Tracer Study Result
              </h3>
              
              <div className="space-y-10">
                <div className="text-left">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-60">Populasi Mahasiswa</p>
                  <p className="text-5xl font-black italic tracking-tighter">{totalTalents}</p>
                </div>
                <div className="text-left border-l-4 border-emerald-500 pl-6">
                  <p className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Employability Rate</p>
                  <p className="text-5xl font-black italic tracking-tighter">{employmentRate}%</p>
                  <p className="mt-2 text-[10px] font-medium opacity-60">Alumni telah terserap industri profesional.</p>
                </div>
              </div>
            </div>

            {/* GENDER BOX */}
            <div className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-8">
              <h3 className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-900">
                <Users size={16} /> Proporsi Gender
              </h3>
              <div className="flex gap-4">
                <div className="flex-1 rounded-2xl bg-slate-50 p-4 border-b-4 border-blue-500 text-left">
                  <p className="text-[8px] font-black uppercase text-slate-400">Laki-laki</p>
                  <p className="text-xl font-black">{genMap.male}</p>
                </div>
                <div className="flex-1 rounded-2xl bg-slate-50 p-4 border-b-4 border-pink-500 text-left">
                  <p className="text-[8px] font-black uppercase text-slate-400">Perempuan</p>
                  <p className="text-xl font-black">{genMap.female}</p>
                </div>
              </div>
            </div>

            {/* DISABILITY MAP BOX */}
            <div className="rounded-[2.5rem] border-4 border-slate-900 bg-white p-8">
              <h3 className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-900">
                <Zap size={16} className="text-orange-500" /> Ragam Disabilitas
              </h3>
              <div className="space-y-4">
                {Object.entries(disMap).map(([type, count]: [string, any]) => (
                  <div key={type} className="text-left">
                    <div className="flex justify-between text-[9px] font-black uppercase text-slate-500">
                      <span>{type}</span><span>{count}</span>
                    </div>
                    <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full bg-slate-900" style={{ width: `${(count / totalTalents) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* FOOTER CALL TO ACTION */}
      <footer className="mx-auto max-w-7xl px-4 py-20">
        <div className="rounded-[3rem] bg-emerald-600 p-12 text-center text-white shadow-2xl">
          <Award className="mx-auto mb-6" size={48} />
          <h2 className="text-3xl font-black uppercase italic tracking-tighter md:text-5xl">
            Wujudkan Kampus Inklusif
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm font-bold uppercase tracking-widest opacity-80 leading-relaxed">
            Bergabunglah dengan {campus.name} dan ribuan talenta lainnya untuk membangun karir yang mandiri.
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