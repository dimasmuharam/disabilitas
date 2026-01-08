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

  if (error || !company) return <div className="min-h-screen flex items-center justify-center font-black">Profil Tidak Ditemukan</div>;

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
    <div className="min-h-screen bg-[#FDFDFD] pb-24 font-sans text-slate-900 leading-relaxed">
      <header className="bg-white border-b-2 border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex flex-col lg:flex-row items-center lg:items-end gap-10">
            <div className="w-32 h-32 bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-white shrink-0 shadow-2xl border-4 border-white animate-in zoom-in">
              <Building2 size={60} />
            </div>
            
            <div className="flex-1 text-center lg:text-left space-y-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <h1 className="text-4xl font-black italic uppercase tracking-tighter">{company.name}</h1>
                  <div className="flex items-center gap-1 bg-blue-600 text-white px-4 py-1.5 rounded-full shadow-lg">
                    <CheckCircle2 size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white italic">Verified Profile</span>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                  <span className="flex items-center gap-2 italic"><Briefcase size={16} className="text-blue-600" /> {company.industry}</span>
                  <span className="flex items-center gap-2 italic"><MapPin size={16} className="text-red-600" /> {company.location}</span>
                </div>
              </div>
            </div>

            {/* PROGRESS SCORING BOX */}
            <div className={`max-w-xs md:max-w-sm p-6 rounded-[2.5rem] border-2 shadow-sm ${badgeConfig.color}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-white rounded-2xl shadow-sm">{badgeConfig.icon}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-end mb-1">
                    <h3 className="text-sm font-black uppercase tracking-tighter leading-none">{badgeConfig.label}</h3>
                    <span className="text-xs font-black italic">{score}%</span>
                  </div>
                  {/* Progress Bar Scoring */}
                  <div className="w-full h-2 bg-white/50 rounded-full overflow-hidden border border-current border-opacity-10">
                    <div className={`h-full ${badgeConfig.progressColor} transition-all duration-1000`} style={{ width: `${score}%` }}></div>
                  </div>
                </div>
              </div>
              <p className="text-[11px] font-bold leading-relaxed italic opacity-80 border-t border-current border-opacity-10 pt-3">
                {badgeConfig.description}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-3 gap-16">
          
          <div className="lg:col-span-2 space-y-20">
            {/* TENTANG INSTANSI */}
            <section className="space-y-6">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3 text-slate-900">
                <Info className="text-blue-600" size={28} /> Tentang Kami
              </h2>
              <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm">
                <p className="text-slate-700 leading-relaxed font-medium text-lg whitespace-pre-line">
                  {company.description || "Instansi ini berkomitmen penuh menciptakan lingkungan kerja yang setara."}
                </p>
              </div>
            </section>

            {/* LOWONGAN AKTIF */}
            <section className="space-y-8">
              <div className="flex items-center justify-between border-b-4 border-blue-600 pb-4">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                  <Zap className="text-amber-500 fill-amber-500" size={32} /> Lowongan Aktif
                </h2>
                <span className="text-xl font-black text-blue-600 uppercase italic">{activeJobs.length} Posisi</span>
              </div>
              
              <div className="grid gap-6">
                {activeJobs.length > 0 ? activeJobs.map((job) => (
                  <Link key={job.id} href={`/lowongan/${job.slug}`} className="group bg-white p-8 rounded-[3.5rem] border-2 border-slate-100 hover:border-slate-900 transition-all shadow-sm hover:shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="text-left space-y-4 flex-1">
                      <div className="space-y-1">
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter group-hover:text-blue-600 transition-colors leading-tight">{job.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-tighter italic">
                          <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg border border-blue-100">{job.job_type}</span>
                          <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-lg border border-emerald-100">{job.work_mode}</span>
                          <span className="text-slate-400">Min. {job.required_education_level}</span>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {job.required_skills?.slice(0, 3).map((s: string) => (
                          <span key={s} className="text-[8px] font-black text-slate-400 border border-slate-200 px-2 py-0.5 rounded-lg uppercase tracking-tighter">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-8 shrink-0">
                      <div className="text-right hidden md:block">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic mb-1">Estimasi Gaji</p>
                        <p className="text-xl font-black text-slate-900 flex items-center gap-1 justify-end">
                          <DollarSign size={16} className="text-emerald-500" />
                          {job.salary_min > 0 ? `${(job.salary_min/1000000).toFixed(1)}jt - ${(job.salary_max/1000000).toFixed(1)}jt` : "Kompetitif"}
                        </p>
                      </div>
                      <div className="bg-slate-900 text-white p-5 rounded-3xl group-hover:bg-blue-600 transition-all shadow-xl group-hover:translate-x-2"><ArrowRight size={24} /></div>
                    </div>
                  </Link>
                )) : (
                  <div className="p-20 bg-slate-50 border-4 border-dashed border-slate-100 rounded-[4rem] text-center opacity-50 font-black uppercase italic text-slate-400 tracking-[0.2em]">Belum ada lowongan riset aktif.</div>
                )}
              </div>
            </section>

            {/* ARSIP LOWONGAN */}
            {closedJobs.length > 0 && (
              <section className="space-y-8 pt-10 border-t-4 border-slate-50">
                <h2 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3 text-slate-400">
                  <Archive size={28} /> Rekam Jejak (Arsip)
                </h2>
                <div className="grid sm:grid-cols-2 gap-6 opacity-60">
                  {closedJobs.map((job) => (
                    <div key={job.id} className="p-8 bg-white border-2 border-slate-50 rounded-[2.5rem] shadow-sm">
                      <h3 className="text-base font-black uppercase italic text-slate-600">{job.title}</h3>
                      <p className="text-[9px] font-black text-slate-400 uppercase mt-2 italic">DITUTUP PADA {new Date(job.created_at).getFullYear()}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ASIDE / SIDEBAR ANALYTICS */}
          <aside className="space-y-12">
            <section className="bg-slate-900 rounded-[3.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
              <div className="absolute -bottom-4 -right-4 opacity-10 rotate-12"><BarChart3 size={120} /></div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-10 border-b border-white/10 pb-4">Inclusive Analytics</h4>
              <div className="space-y-10 relative z-10">
                <div className="flex justify-between items-end border-l-4 border-blue-600 pl-6">
                  <div>
                    <p className="text-3xl font-black italic text-white leading-none">{disabilityEmployees} Orang</p>
                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-tighter mt-2 italic">Tenaga Kerja Disabilitas</p>
                  </div>
                  {isMeetQuota && (
                    <div className="text-right">
                      <TrendingUp size={24} className="text-emerald-400 ml-auto mb-1" />
                      <span className="text-[7px] font-black uppercase bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">Memenuhi Kuota Inklusi</span>
                    </div>
                  )}
                </div>
                
                <div className="p-6 bg-white/5 rounded-[2rem] border border-white/10 space-y-4">
                  <p className="text-[10px] font-medium text-slate-300 italic leading-relaxed">
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
            <section className="bg-white border-2 border-slate-900 rounded-[3.5rem] p-10 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)] space-y-10">
              <h3 className="text-lg font-black uppercase tracking-tighter flex items-center gap-3">
                <Accessibility className="text-blue-600" size={24} /> Akomodasi
              </h3>
              <ul className="space-y-4">
                {providedAccommodations.length > 0 ? providedAccommodations.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-4 p-4 rounded-2xl border-2 border-emerald-50 bg-emerald-50/20 shadow-sm">
                    <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-[11px] font-black uppercase text-emerald-950 leading-tight">{item}</span>
                  </li>
                )) : <p className="text-[10px] text-slate-300 uppercase italic font-black text-center">Data akomodasi fisik belum terdata.</p>}
              </ul>
            </section>

            {/* KONTAK */}
            <section className="bg-white border-2 border-slate-100 rounded-[3.5rem] p-10 space-y-6 shadow-sm">
              <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2 italic font-black text-slate-900">
                <Mail size={16} className="text-blue-600"/> Hubungi Kami
              </h4>
              <div className="space-y-3">
                {company.email && (
                  <a href={`mailto:${company.email}`} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-blue-600 hover:text-white transition-all group font-black uppercase text-[10px]">
                    <Mail size={18} className="text-slate-400 group-hover:text-white" /> {company.email}
                  </a>
                )}
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl hover:bg-blue-900 hover:text-white transition-all group font-black uppercase text-[10px]">
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
