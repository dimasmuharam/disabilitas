import React from "react";
import { supabase } from "@/lib/supabase";
import { 
  Building2, MapPin, Briefcase, Users, 
  CheckCircle2, Globe, Mail,
  ShieldCheck, Zap, Award,
  ArrowRight, Info, Clock, Archive,
  ExternalLink, Gem, DollarSign, Monitor,
  Accessibility, GraduationCap, Tag, BarChart3,
  TrendingUp, Target
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const runtime = "edge";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { data: company } = await supabase.from("companies").select("name, description").eq("id", params.id).single();
  return {
    title: `${company?.name || "Profil Instansi"} | disabilitas.com`,
    description: company?.description || "Detail profil instansi inklusif dan rekam jejak rekrutmen.",
    alternates: { canonical: `https://www.disabilitas.com/perusahaan/${params.id}` },
  };
}

export default async function PublicCompanyProfile({ params }: { params: { id: string } }) {
  const { data: company, error } = await supabase.from("companies").select("*").eq("id", params.id).single();
  const { data: allJobs } = await supabase.from("jobs").select("*").eq("company_id", params.id).order("created_at", { ascending: false });

  if (error || !company) return <div className="flex min-h-screen items-center justify-center font-black">Profil Tidak Ditemukan</div>;

  const score = company.inclusion_score || 0;
  const disabilityEmployees = company.total_employees_with_disability || 0;
  const totalEmployees = company.total_employees || 1;
  const isMeetQuota = (disabilityEmployees / totalEmployees) >= 0.01;

  // LOGIKA BADGE & NARASI EDUKATIF
  let badgeConfig = {
    label: "Inclusive Entity",
    level: "Bronze",
    color: "text-orange-700 bg-orange-50 border-orange-200",
    progressColor: "bg-orange-500",
    icon: <ShieldCheck size={24} />,
    description: "Instansi ini telah menginisiasi budaya inklusi dengan menyediakan fasilitas dasar. Langkah awal yang baik untuk membangun ekosistem kerja yang setara."
  };

  if (score >= 85) {
    badgeConfig = {
      label: "Inclusion Champion",
      level: "Gold",
      color: "text-amber-700 bg-amber-50 border-amber-200",
      progressColor: "bg-amber-500",
      icon: <Gem size={24} />,
      description: "Instansi ini adalah role model inklusivitas. Telah memenuhi standar komprehensif dalam infrastruktur, kebijakan, dan budaya kerja inklusif bagi berbagai ragam disabilitas."
    };
  } else if (score >= 50) {
    badgeConfig = {
      label: "Inclusion Leader",
      level: "Silver",
      color: "text-slate-700 bg-slate-50 border-slate-200",
      progressColor: "bg-slate-600",
      icon: <Award size={24} />,
      description: "Instansi menunjukkan komitmen kuat melampaui standar fisik. Fokus pada penyediaan akomodasi layak yang menunjang produktivitas talenta disabilitas."
    };
  }

  const activeJobs = allJobs?.filter(j => j.is_active === true) || [];
  const closedJobs = allJobs?.filter(j => j.is_active === false) || [];
  const providedAccommodations = company.master_accommodations_provided || [];
  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 font-sans leading-relaxed text-slate-900">
      <header className="border-b-2 border-slate-100 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="flex flex-col items-center gap-10 lg:flex-row lg:items-end">
            <div className="flex size-32 shrink-0 items-center justify-center rounded-[2.5rem] border-4 border-white bg-slate-900 text-white shadow-2xl animate-in zoom-in">
              <Building2 size={60} />
            </div>
            
            <div className="flex-1 space-y-4 text-center lg:text-left">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                  <h1 className="text-4xl font-black uppercase italic tracking-tighter">{company.name}</h1>
                  <div className="flex items-center gap-1 rounded-full bg-blue-600 px-4 py-1.5 text-white shadow-lg">
                    <CheckCircle2 size={14} />
                    <span className="text-[10px] font-black uppercase italic tracking-widest text-white">Verified Profile</span>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-500 lg:justify-start">
                  <span className="flex items-center gap-2 italic"><Briefcase size={16} className="text-blue-600" /> {company.industry}</span>
                  <span className="flex items-center gap-2 italic"><MapPin size={16} className="text-red-600" /> {company.location}</span>
                </div>
              </div>
            </div>

            {/* PROGRESS SCORING BOX */}
            <div className={`max-w-xs rounded-[2.5rem] border-2 p-6 shadow-sm md:max-w-sm ${badgeConfig.color}`}>
              <div className="mb-4 flex items-center gap-4">
                <div className="rounded-2xl bg-white p-3 shadow-sm">{badgeConfig.icon}</div>
                <div className="flex-1">
                  <div className="mb-1 flex items-end justify-between">
                    <h3 className="text-sm font-black uppercase leading-none tracking-tighter">{badgeConfig.label}</h3>
                    <span className="text-xs font-black italic">{score}%</span>
                  </div>
                  {/* Progress Bar Scoring */}
                  <div className="border-current/10 h-2 w-full overflow-hidden rounded-full border bg-white/50">
                    <div className={`h-full transition-all duration-1000 ${badgeConfig.progressColor}`} style={{ width: `${score}%` }}></div>
                  </div>
                </div>
              </div>
              <p className="border-current/10 border-t pt-3 text-[11px] font-bold italic leading-relaxed opacity-80">
                {badgeConfig.description}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-16 lg:grid-cols-3">
          
          <div className="space-y-20 lg:col-span-2">
            {/* TENTANG INSTANSI */}
            <section className="space-y-6">
              <h2 className="flex items-center gap-3 text-2xl font-black uppercase italic tracking-tighter text-slate-900">
                <Info className="text-blue-600" size={28} /> Tentang Kami
              </h2>
              <div className="rounded-[3rem] border-2 border-slate-100 bg-white p-10 shadow-sm">
                <p className="whitespace-pre-line text-lg font-medium leading-relaxed text-slate-700">
                  {company.description || "Instansi ini berkomitmen penuh menciptakan lingkungan kerja yang setara."}
                </p>
              </div>
            </section>

            {/* LOWONGAN AKTIF */}
            <section className="space-y-8">
              <div className="flex items-center justify-between border-b-4 border-blue-600 pb-4">
                <h2 className="flex items-center gap-3 text-2xl font-black uppercase italic tracking-tighter">
                  <Zap className="fill-amber-500 text-amber-500" size={32} /> Lowongan Aktif
                </h2>
                <span className="text-xl font-black uppercase italic text-blue-600">{activeJobs.length} Posisi</span>
              </div>
              
              <div className="grid gap-6">
                {activeJobs.length > 0 ? activeJobs.map((job) => (
                  <Link key={job.id} href={`/lowongan/${job.slug}`} className="group flex flex-col items-center justify-between gap-8 rounded-[3.5rem] border-2 border-slate-100 bg-white p-8 shadow-sm transition-all hover:border-slate-900 hover:shadow-2xl md:flex-row">
                    <div className="flex-1 space-y-4 text-left">
                      <div className="space-y-1">
                        <h3 className="text-2xl font-black uppercase italic leading-tight tracking-tighter transition-colors group-hover:text-blue-600">{job.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase italic tracking-tighter">
                          <span className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-1 text-blue-600">{job.job_type}</span>
                          <span className="rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1 text-emerald-600">{job.work_mode}</span>
                          <span className="text-slate-400">Min. {job.required_education_level}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {job.required_skills?.slice(0, 3).map((s: string) => (
                          <span key={s} className="rounded-lg border border-slate-200 px-2 py-0.5 text-[8px] font-black uppercase tracking-tighter text-slate-400">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-8">
                      <div className="hidden text-right md:block">
                        <p className="mb-1 text-[8px] font-black uppercase italic tracking-widest text-slate-400">Estimasi Gaji</p>
                        <p className="flex items-center justify-end gap-1 text-xl font-black text-slate-900">
                          <DollarSign size={16} className="text-emerald-500" />
                          {job.salary_min > 0 ? `${(job.salary_min/1000000).toFixed(1)}jt - ${(job.salary_max/1000000).toFixed(1)}jt` : "Kompetitif"}
                        </p>
                      </div>
                      <div className="rounded-3xl bg-slate-900 p-5 text-white shadow-xl transition-all group-hover:translate-x-2 group-hover:bg-blue-600"><ArrowRight size={24} /></div>
                    </div>
                  </Link>
                )) : (
                  <div className="rounded-[4rem] border-4 border-dashed border-slate-100 bg-slate-50 p-20 text-center font-black uppercase italic tracking-[0.2em] text-slate-400 opacity-50">Belum ada lowongan riset aktif.</div>
                )}
              </div>
            </section>

            {/* ARSIP LOWONGAN */}
            {closedJobs.length > 0 && (
              <section className="space-y-8 border-t-4 border-slate-50 pt-10">
                <h2 className="flex items-center gap-3 text-xl font-black uppercase italic tracking-tighter text-slate-400">
                  <Archive size={28} /> Rekam Jejak (Arsip)
                </h2>
                <div className="grid gap-6 opacity-60 sm:grid-cols-2">
                  {closedJobs.map((job) => (
                    <div key={job.id} className="rounded-[2.5rem] border-2 border-slate-50 bg-white p-8 shadow-sm">
                      <h3 className="text-base font-black uppercase italic text-slate-600">{job.title}</h3>
                      <p className="mt-2 text-[9px] font-black uppercase italic text-slate-400">DITUTUP PADA {new Date(job.created_at).getFullYear()}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ASIDE / SIDEBAR ANALYTICS */}
          <aside className="space-y-12">
            <section className="relative overflow-hidden rounded-[3.5rem] bg-slate-900 p-10 text-white shadow-2xl">
              <div className="absolute -bottom-4 -right-4 rotate-12 opacity-10"><BarChart3 size={120} /></div>
              <h4 className="mb-10 border-b border-white/10 pb-4 text-[10px] font-black uppercase tracking-widest text-blue-400">Inclusive Analytics</h4>
              <div className="relative z-10 space-y-10">
                <div className="flex items-end justify-between border-l-4 border-blue-600 pl-6">
                  <div>
                    <p className="text-3xl font-black italic leading-none text-white">{disabilityEmployees} Orang</p>
                    <p className="mt-2 text-[8px] font-black uppercase italic tracking-tighter text-slate-400">Tenaga Kerja Disabilitas</p>
                  </div>
                  {isMeetQuota && (
                    <div className="text-right">
                      <TrendingUp size={24} className="mb-1 ml-auto text-emerald-400" />
                      <span className="rounded bg-emerald-500/20 px-2 py-1 text-[7px] font-black uppercase text-emerald-400">Memenuhi Kuota Inklusi</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4 rounded-[2rem] border border-white/10 bg-white/5 p-6">
                  <p className="text-[10px] font-medium italic leading-relaxed text-slate-300">
                    Kami mendorong instansi untuk terus meningkatkan jumlah talenta disabilitas yang **berkualitas** dan **berkompeten** demi terciptanya ekosistem kerja yang unggul dan setara.
                  </p>
                  <div className="flex items-center gap-2 text-blue-400">
                    <Target size={14} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Inclusion Mission 2026</span>
                  </div>
                </div>
              </div>
            </section>

            {/* AKOMODASI SIDEBAR */}
            <section className="space-y-10 rounded-[3.5rem] border-2 border-slate-900 bg-white p-10 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)]">
              <h3 className="flex items-center gap-3 text-lg font-black uppercase tracking-tighter">
                <Accessibility className="text-blue-600" size={24} /> Akomodasi
              </h3>
              <ul className="space-y-4">
                {providedAccommodations.length > 0 ? providedAccommodations.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-4 rounded-2xl border-2 border-emerald-50 bg-emerald-50/20 p-4 shadow-sm">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" />
                    <span className="text-[11px] font-black uppercase leading-tight text-emerald-950">{item}</span>
                  </li>
                )) : <p className="text-center text-[10px] font-black uppercase italic text-slate-300">Data akomodasi fisik belum terdata.</p>}
              </ul>
            </section>

            {/* KONTAK */}
            <section className="space-y-6 rounded-[3.5rem] border-2 border-slate-100 bg-white p-10 shadow-sm">
              <h4 className="flex items-center gap-2 text-[11px] font-black uppercase italic tracking-widest text-slate-900">
                <Mail size={16} className="text-blue-600"/> Hubungi Kami
              </h4>
              <div className="space-y-3">
                {company.email && (
                  <a href={`mailto:${company.email}`} className="group flex items-center gap-4 rounded-2xl bg-slate-50 p-4 text-[10px] font-black uppercase transition-all hover:bg-blue-600 hover:text-white">
                    <Mail size={18} className="text-slate-400 group-hover:text-white" /> {company.email}
                  </a>
                )}
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 rounded-2xl bg-slate-50 p-4 text-[10px] font-black uppercase transition-all hover:bg-blue-900 hover:text-white">
                    <Globe size={18} className="text-slate-400 group-hover:text-white" /> Website Resmi
                  </a>
                )}
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
