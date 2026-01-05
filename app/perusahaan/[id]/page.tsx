import React from "react";
import { supabase } from "@/lib/supabase";
import { 
  Building2, MapPin, Briefcase, Users, 
  CheckCircle2, Globe, Mail, Phone,
  Star, ShieldCheck, Zap, Award,
  ArrowRight, Info, Clock, Archive,
  ExternalLink, Gem
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { ACCOMMODATION_TYPES } from "@/lib/data-static";

export const runtime = "edge";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const { data: company } = await supabase
    .from("companies")
    .select("name, description")
    .eq("id", params.id)
    .single();

  return {
    title: `${company?.name || "Profil Instansi"} | disabilitas.com`,
    description: company?.description || "Detail profil instansi inklusif di disabilitas.com",
    alternates: {
      canonical: `https://www.disabilitas.com/perusahaan/${params.id}`,
    },
  };
}

export default async function PublicCompanyProfile({ params }: { params: { id: string } }) {
  // 1. FETCH DATA - Sekarang include kolom inclusion_score
  const { data: company, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", params.id)
    .single();

  const { data: allJobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("company_id", params.id)
    .order("created_at", { ascending: false });

  if (error || !company) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="font-black uppercase italic tracking-tighter">Profil Tidak Ditemukan</h1>
      </div>
    );
  }

  // 2. AMBIL SKOR DARI DATABASE (Sudah dihitung otomatis oleh Trigger)
  const score = company.inclusion_score || 0;

  // 3. LOGIKA BADGE & NARASI EDUKASI
  let badgeConfig = {
    label: "Inclusive Entity",
    level: "Bronze",
    color: "text-orange-700 bg-orange-50 border-orange-200",
    icon: <ShieldCheck size={24} />,
    description: "Instansi telah memulai langkah inklusi dengan menyediakan fasilitas dasar. Fokus pada pengembangan aksesibilitas fisik untuk mendukung mobilitas talenta."
  };

  if (score >= 85) {
    badgeConfig = {
      label: "Inclusion Champion",
      level: "Gold",
      color: "text-amber-700 bg-amber-50 border-amber-200",
      icon: <Gem size={24} />,
      description: "Level Tertinggi. Instansi telah memenuhi standar inklusi komprehensif (Fisik, Digital, Komunikasi, dan Kebijakan Strategis) sesuai framework internasional ILO & DEI."
    };
  } else if (score >= 50) {
    badgeConfig = {
      label: "Inclusion Leader",
      level: "Silver",
      color: "text-slate-700 bg-slate-50 border-slate-200",
      icon: <Award size={24} />,
      description: "Instansi menunjukkan komitmen kuat dengan menyediakan dukungan akomodasi yang beragam, melampaui standar fisik dasar menuju inklusi sistemik."
    };
  }

  const activeJobs = allJobs?.filter(j => j.status === "open") || [];
  const closedJobs = allJobs?.filter(j => j.status === "closed") || [];
  const providedAccommodations = company.master_accommodations_provided || [];

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20 font-sans text-slate-900">
      {/* HEADER UTAMA */}
      <div className="bg-white border-b-2 border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row items-center lg:items-end gap-8">
            <div className="w-32 h-32 bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-white shrink-0 shadow-xl border-4 border-white">
              <Building2 size={60} />
            </div>
            
            <div className="flex-1 text-center lg:text-left space-y-4">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
                  {company.name}
                </h1>
                <div className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-full">
                  <CheckCircle2 size={12} />
                  <span className="text-[8px] font-black uppercase tracking-widest">Verified by disabilitas.com</span>
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-slate-500 font-bold uppercase text-[10px]">
                <div className="flex items-center gap-2"><Briefcase size={16} className="text-blue-600" />{company.industry}</div>
                <div className="flex items-center gap-2"><MapPin size={16} className="text-red-600" />{company.location}</div>
                <div className="flex items-center gap-2"><Users size={16} className="text-green-600" />{company.total_employees_with_disability || 0} Karyawan Disabilitas</div>
              </div>
            </div>

            {/* BADGE PRIDE - Scoring Berbasis Data Riset */}
            <div className={`max-w-sm p-5 rounded-[2rem] border-2 shadow-sm transition-all hover:shadow-md ${badgeConfig.color}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                  {badgeConfig.icon}
                </div>
                <div>
                  <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60">Inclusion Score: {score}%</p>
                  <h3 className="text-lg font-black italic uppercase tracking-tighter leading-none">
                    {badgeConfig.label}
                  </h3>
                </div>
              </div>
              <p className="text-[11px] font-bold leading-relaxed italic opacity-80 mb-3">
                {badgeConfig.description}
              </p>
              <div className="pt-2 border-t border-current border-opacity-10 flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-widest">Standardized by disabilitas.com</span>
                <Info size={14} className="opacity-40" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          
          {/* KOLOM KIRI: NARASI & LOWONGAN */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* 1. VISI & BUDAYA INKLUSI */}
            <section className="space-y-6">
              <h2 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                <Info className="text-blue-600" size={24} /> {"Visi & Budaya Inklusi"}
              </h2>
              <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm relative overflow-hidden text-sm">
                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                  <Building2 size={80} />
                </div>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line font-medium relative z-10">
                  {company.description || "Instansi ini berkomitmen menciptakan lingkungan kerja yang setara dan mendukung potensi setiap talenta disabilitas di Indonesia."}
                </p>
              </div>
            </section>

            {/* 2. DAFTAR LOWONGAN AKTIF */}
            <section className="space-y-6">
              <div className="flex items-center justify-between border-b-2 border-slate-100 pb-4">
                <h2 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                  <Zap className="text-amber-500 fill-amber-500" size={24} /> {"Lowongan Inklusif Aktif"}
                </h2>
                <span className="text-[10px] font-black uppercase bg-slate-100 px-4 py-1 rounded-full text-slate-500">
                  {activeJobs.length} {"Posisi Tersedia"}
                </span>
              </div>
              
              <div className="space-y-4">
                {activeJobs.length > 0 ? (
                  activeJobs.map((job) => (
                    <Link 
                      key={job.id} 
                      href={`/jobs/${job.id}`}
                      className="group flex flex-col md:flex-row justify-between items-center p-6 bg-white border-2 border-slate-100 rounded-[2rem] hover:border-slate-900 transition-all shadow-sm hover:shadow-xl"
                    >
                      <div className="space-y-1">
                        <h3 className="text-lg font-black uppercase italic tracking-tighter group-hover:text-blue-600 transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {job.department} • {job.type}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 mt-4 md:mt-0">
                        <span className="text-[9px] font-black uppercase text-slate-400">{job.location}</span>
                        <div className="bg-slate-900 text-white p-2 rounded-xl group-hover:bg-blue-600 transition-all group-hover:translate-x-1">
                          <ArrowRight size={18} />
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] text-center">
                    <p className="text-[10px] font-black text-slate-400 uppercase italic tracking-widest">{"Belum ada lowongan aktif saat ini."}</p>
                  </div>
                )}
              </div>
            </section>

            {/* 3. ARSIP LOWONGAN (REKAM JEJAK) */}
            {closedJobs.length > 0 && (
              <section className="space-y-6">
                <h2 className="text-lg font-black italic uppercase tracking-tighter flex items-center gap-3 text-slate-400">
                  <Archive size={22} /> {"Rekam Jejak Rekrutmen (Arsip)"}
                </h2>
                <div className="grid sm:grid-cols-2 gap-4 opacity-60">
                  {closedJobs.map((job) => (
                    <div key={job.id} className="p-5 bg-white border-2 border-slate-100 rounded-2xl">
                      <h3 className="text-[11px] font-black uppercase italic text-slate-600">{job.title}</h3>
                      <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-tighter">
                        {"Lowongan ini telah ditutup pada "}{new Date(job.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* KOLOM KANAN: DETAIL AKOMODASI & STATS */}
          <div className="space-y-8">
            
            {/* WIDGET AKOMODASI BERDASARKAN MASTER (14 INDIKATOR) */}
            <section className="bg-white border-2 border-slate-900 rounded-[3rem] p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] space-y-6">
              <div className="space-y-1">
                <h3 className="text-sm font-black uppercase tracking-tighter flex items-center gap-2">
                  <ShieldCheck className="text-blue-600" size={20} /> {"Fasilitas & Akomodasi"}
                </h3>
                <p className="text-[9px] font-bold text-slate-400 uppercase italic">
                  {"Diverifikasi Berdasarkan Indikator Riset disabilitas.com"}
                </p>
              </div>
              
              <div className="space-y-3">
                {ACCOMMODATION_TYPES.map((type, idx) => {
                  const isProvided = providedAccommodations.includes(type);
                  return (
                    <div 
                      key={idx} 
                      className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                        isProvided 
                          ? 'bg-emerald-50 border-emerald-100 opacity-100 shadow-sm' 
                          : 'bg-slate-50 border-slate-100 opacity-40 grayscale'
                      }`}
                    >
                      <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                        isProvided ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'
                      }`}>
                        {isProvided ? <CheckCircle2 size={12} /> : <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />}
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-tight ${
                        isProvided ? 'text-emerald-900' : 'text-slate-400'
                      }`}>
                        {type}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-100">
                <p className="text-[8px] font-bold text-slate-400 leading-relaxed italic">
                  {"* Data ini divalidasi secara mandiri oleh instansi dan diawasi melalui mekanisme feedback talenta di disabilitas.com."}
                </p>
              </div>
            </section>

            {/* STATISTIK & KOMITMEN */}
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
              <div className="absolute -bottom-4 -right-4 opacity-10 rotate-12">
                <Gem size={100} />
              </div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-6">{"Impact Statistics"}</h4>
              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-end border-b border-white/10 pb-4">
                  <div>
                    <p className="text-[8px] font-bold uppercase text-slate-400">{"Tenaga Kerja Disabilitas"}</p>
                    <p className="text-3xl font-black italic">{company.total_employees_with_disability || 0}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] font-bold uppercase text-slate-400">{"Inclusion Rate"}</p>
                    <p className="text-xl font-black text-blue-400">
                      {((company.total_employees_with_disability / (company.total_employees || 1)) * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
                <p className="text-[9px] font-medium italic text-slate-400 leading-relaxed">
                  {"Keberagaman di tempat kerja mendorong inovasi dan perspektif baru. Instansi ini membuktikan bahwa inklusi adalah kekuatan bisnis."}
                </p>
              </div>
            </div>

            {/* KONTAK & MEDIA */}
            <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 space-y-4 shadow-sm mb-12">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-900 mb-2">{"Hubungi Instansi"}</h4>
              {company.email && (
                <a href={`mailto:${company.email}`} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-blue-50 transition-colors group">
                  <Mail size={16} className="text-slate-400 group-hover:text-blue-600" />
                  <span className="text-[10px] font-black uppercase truncate">{company.email}</span>
                </a>
              )}
              {company.website && (
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-blue-50 transition-colors group">
                  <Globe size={16} className="text-slate-400 group-hover:text-blue-600" />
                  <span className="text-[10px] font-black uppercase truncate">{"Website Resmi"}</span>
                  <ExternalLink size={12} className="ml-auto opacity-30" />
                </a>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
