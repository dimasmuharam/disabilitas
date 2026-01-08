import React from "react";
import { supabase } from "@/lib/supabase";
import { 
  Building2, MapPin, Briefcase, Users, 
  CheckCircle2, Globe, Mail,
  ShieldCheck, Zap, Award,
  ArrowRight, Info, Clock, Archive,
  ExternalLink, Gem, DollarSign, Monitor,
  Accessibility, GraduationCap, Tag
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

export const runtime = "edge";

// 1. GENERATE METADATA DENGAN CANONICAL SESUAI INSTRUKSI
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { data: company } = await supabase
    .from("companies")
    .select("name, description")
    .eq("id", params.id)
    .single();

  return {
    title: `${company?.name || "Profil Instansi"} | disabilitas.com`,
    description: company?.description || "Detail profil instansi inklusif dan rekam jejak rekrutmen.",
    alternates: {
      canonical: `https://www.disabilitas.com/perusahaan/${params.id}`,
    },
  };
}

export default async function PublicCompanyProfile({ params }: { params: { id: string } }) {
  // 2. FETCH DATA UTAMA
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("*")
    .eq("id", params.id)
    .single();

  const { data: allJobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("company_id", params.id)
    .order("created_at", { ascending: false });

  if (companyError || !company) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-black uppercase italic tracking-tighter text-slate-300">Profil Tidak Ditemukan</h1>
        <Link href="/lowongan" className="mt-4 text-blue-600 font-bold uppercase text-[10px] underline tracking-widest">Kembali ke Jelajah</Link>
      </div>
    );
  }

  // 3. LOGIKA BADGE INKLUSI (BERBASIS inclusion_score)
  const score = company.inclusion_score || 0;
  let badgeConfig = {
    label: "Inclusive Entity",
    color: "text-orange-700 bg-orange-50 border-orange-200",
    icon: <ShieldCheck size={24} />,
    description: "Instansi telah memenuhi standar dasar aksesibilitas fisik bagi talenta disabilitas."
  };

  if (score >= 85) {
    badgeConfig = {
      label: "Inclusion Champion",
      color: "text-amber-700 bg-amber-50 border-amber-200",
      icon: <Gem size={24} />,
      description: "Level Tertinggi. Instansi memenuhi standar inklusi komprehensif."
    };
  } else if (score >= 50) {
    badgeConfig = {
      label: "Inclusion Leader",
      color: "text-slate-700 bg-slate-50 border-slate-200",
      icon: <Award size={24} />,
      description: "Instansi menunjukkan komitmen kuat dengan penyediaan akomodasi layak."
    };
  }

  // 4. PEMISAHAN DATA LOWONGAN (SINKRON DENGAN is_active)
  const activeJobs = allJobs?.filter(j => j.is_active === true) || [];
  const closedJobs = allJobs?.filter(j => j.is_active === false) || [];
  const providedAccommodations = company.master_accommodations_provided || [];
  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 font-sans text-slate-900 leading-relaxed">
      {/* HEADER PERUSAHAAN */}
      <header className="bg-white border-b-2 border-slate-100 shadow-sm relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex flex-col lg:flex-row items-center lg:items-end gap-10">
            <div className="w-32 h-32 bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-white shrink-0 shadow-2xl border-4 border-white animate-in zoom-in duration-500">
              <Building2 size={60} />
            </div>
            
            <div className="flex-1 text-center lg:text-left space-y-4">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 leading-tight">
                    {company.name}
                  </h1>
                  <div className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-full shadow-lg">
                    <CheckCircle2 size={12} />
                    <span className="text-[8px] font-black uppercase tracking-widest text-white italic">Verified Entity</span>
                  </div>
                </div>
                <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                  <span className="flex items-center gap-2 italic"><Briefcase size={16} className="text-blue-600" /> {company.industry}</span>
                  <span className="flex items-center gap-2 italic"><MapPin size={16} className="text-red-600" /> {company.location}</span>
                </div>
              </div>
            </div>

            {/* BOX SKOR INKLUSI (BERBASIS RISET) */}
            <div className={`max-w-xs p-6 rounded-[2.5rem] border-2 shadow-sm ${badgeConfig.color}`}>
              <div className="flex items-center gap-4 mb-3">
                <div className="p-2 bg-white rounded-2xl shadow-sm">{badgeConfig.icon}</div>
                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60">Indeks Inklusi</p>
                  <h3 className="text-xl font-black italic uppercase tracking-tighter leading-none">{badgeConfig.label}</h3>
                </div>
              </div>
              <p className="text-[11px] font-bold leading-relaxed italic opacity-80">{badgeConfig.description}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-3 gap-16">
          
          <div className="lg:col-span-2 space-y-20">
            {/* TENTANG KOMITMEN */}
            <section aria-labelledby="vision-title" className="space-y-6">
              <h2 id="vision-title" className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                <Info className="text-blue-600" size={28} /> Tentang Instansi
              </h2>
              <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm relative group overflow-hidden">
                <p className="text-slate-700 leading-relaxed font-medium text-lg whitespace-pre-line relative z-10">
                  {company.description || "Instansi ini belum memperbarui profil visi inklusi mereka."}
                </p>
              </div>
            </section>

            {/* LOWONGAN AKTIF (INFORMATIF & RINGKAS) */}
            <section aria-labelledby="jobs-title" className="space-y-8">
              <div className="flex items-center justify-between border-b-4 border-blue-600 pb-4">
                <h2 id="jobs-title" className="text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                  <Zap className="text-amber-500 fill-amber-500" size={32} /> Lowongan Aktif
                </h2>
                <span className="text-xl font-black text-blue-600 uppercase italic">{activeJobs.length} Posisi</span>
              </div>
              
              <div className="grid gap-6">
                {activeJobs.length > 0 ? activeJobs.map((job) => (
                  <Link 
                    key={job.id} 
                    href={`/lowongan/${job.slug}`} 
                    className="group bg-white p-8 rounded-[3.5rem] border-2 border-slate-100 hover:border-slate-900 transition-all shadow-sm hover:shadow-2xl flex flex-col md:flex-row justify-between items-center gap-8"
                  >
                    <div className="text-left space-y-4 flex-1">
                      <div className="space-y-1">
                        <h3 className="text-2xl font-black uppercase italic tracking-tighter group-hover:text-blue-600 transition-colors leading-tight">{job.title}</h3>
                        <div className="flex flex-wrap items-center gap-3 text-[10px] font-black uppercase tracking-tighter italic">
                          <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded border border-blue-100">{job.job_type}</span>
                          <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded border border-emerald-100">{job.work_mode}</span>
                          <span className="text-slate-400">Pendidikan: Min. {job.required_education_level}</span>
                        </div>
                      </div>
                      
                      {/* Skill Tags - Hanya Tampil 3 Saja Biar Ringkas */}
                      <div className="flex flex-wrap gap-2">
                        {job.required_skills?.slice(0, 3).map((s: string) => (
                          <span key={s} className="text-[8px] font-black text-slate-400 border border-slate-200 px-2 py-0.5 rounded-lg uppercase tracking-tighter">
                            {s}
                          </span>
                        ))}
                        {job.required_skills?.length > 3 && <span className="text-[8px] font-black text-slate-300">+{job.required_skills.length - 3} lainnya</span>}
                      </div>
                    </div>

                    <div className="flex items-center gap-8 shrink-0 w-full md:w-auto border-t md:border-t-0 md:border-l border-slate-50 pt-6 md:pt-0 md:pl-8">
                      <div className="text-left md:text-right flex-1 md:flex-none space-y-1">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest italic">Estimasi Gaji</p>
                        <p className="text-xl font-black text-slate-900 flex items-center gap-1 justify-start md:justify-end">
                          <DollarSign size={16} className="text-emerald-500" />
                          {job.salary_min > 0 ? `${(job.salary_min/1000000).toFixed(1)} - ${(job.salary_max/1000000).toFixed(1)} Juta` : "Kompetitif"}
                        </p>
                      </div>
                      <div className="bg-slate-900 text-white p-5 rounded-3xl group-hover:bg-blue-600 transition-all shadow-xl group-hover:translate-x-2">
                        <ArrowRight size={24} />
                      </div>
                    </div>
                  </Link>
                )) : (
                  <div className="p-20 bg-slate-50 border-4 border-dashed border-slate-100 rounded-[4rem] text-center opacity-50 font-black uppercase italic text-slate-400 tracking-[0.2em]">Belum ada lowongan riset aktif.</div>
                )}
              </div>
            </section>

            {/* SECTION ARSIP (REKAM JEJAK) */}
            {closedJobs.length > 0 && (
              <section aria-labelledby="archive-title" className="space-y-8 pt-10 border-t-4 border-slate-50">
                <div className="flex flex-col gap-2">
                  <h2 id="archive-title" className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3 text-slate-400">
                    <Archive size={28} /> Rekam Jejak Lowongan (Arsip)
                  </h2>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest ml-10">Berikut adalah daftar lowongan inklusif yang pernah dibuka sebelumnya.</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-6 opacity-60">
                  {closedJobs.map((job) => (
                    <div key={job.id} className="p-8 bg-white border-2 border-slate-50 rounded-[2.5rem] shadow-sm flex flex-col justify-between h-full">
                      <div className="space-y-3">
                        <h3 className="text-base font-black uppercase italic text-slate-600 leading-tight">{job.title}</h3>
                        <div className="flex items-center justify-between text-[9px] font-black uppercase text-slate-400 italic">
                          <span className="flex items-center gap-1"><Clock size={10}/> Closed</span>
                          <span>Tahun {new Date(job.created_at).getFullYear()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ASIDE / SIDEBAR */}
          <aside className="space-y-12">
            {/* STATS ANALYTICS RINGKAS */}
            <section aria-labelledby="analytic-title" className="bg-slate-900 rounded-[3.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
              <h4 id="analytic-title" className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-10 border-b border-white/10 pb-4 flex items-center gap-2"><BarChart3 size={16}/> Inclusion Analytic</h4>
              <div className="space-y-8 relative z-10">
                <div className="flex justify-between items-end border-l-2 border-blue-600 pl-6">
                  <div>
                    <p className="text-[34px] font-black italic leading-none">{company.total_employees_with_disability || 0}</p>
                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-2">Staf Disabilitas</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[34px] font-black italic text-blue-400 leading-none">
                      {(( (company.total_employees_with_disability || 0) / (company.total_employees || 1) ) * 100).toFixed(1)}%
                    </p>
                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest mt-2">Inclusion Rate</p>
                  </div>
                </div>
              </div>
            </section>

            {/* AKOMODASI SIDEBAR */}
            <section aria-labelledby="acc-title" className="bg-white border-2 border-slate-900 rounded-[3.5rem] p-10 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] space-y-10">
              <h3 id="acc-title" className="text-lg font-black uppercase tracking-tighter flex items-center gap-3 text-slate-900">
                <Accessibility className="text-blue-600" size={24} /> Akomodasi Tersedia
              </h3>
              <ul className="space-y-4" role="list">
                {providedAccommodations.length > 0 ? providedAccommodations.map((item: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-4 p-4 rounded-2xl border-2 border-emerald-50 bg-emerald-50/20 shadow-sm transition-all hover:bg-emerald-50">
                    <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-[11px] font-black uppercase text-emerald-950 leading-tight">{item}</span>
                  </li>
                )) : <p className="text-[10px] text-slate-300 uppercase italic font-black text-center">Data akomodasi fisik belum terdata.</p>}
              </ul>
            </section>

            {/* CONTACT WIDGET */}
            <section className="bg-white border-2 border-slate-100 rounded-[3.5rem] p-10 space-y-8 shadow-sm">
              <h4 className="text-[11px] font-black uppercase tracking-widest flex items-center gap-2 italic">
                <Mail size={16} className="text-blue-600"/> Hubungi Kami
              </h4>
              <div className="space-y-4">
                {company.email && (
                  <a href={`mailto:${company.email}`} className="flex items-center gap-4 p-5 bg-slate-50 rounded-3xl hover:bg-blue-600 hover:text-white transition-all group font-black uppercase text-[10px] shadow-sm">
                    <Mail size={20} className="text-slate-400 group-hover:text-white shrink-0" /> <span className="truncate">{company.email}</span>
                  </a>
                )}
                {company.website && (
                  <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-5 bg-slate-50 rounded-3xl hover:bg-blue-900 hover:text-white transition-all group font-black uppercase text-[10px] shadow-sm">
                    <Globe size={20} className="text-slate-400 group-hover:text-white shrink-0" /> Website Resmi
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
