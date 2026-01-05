import React from "react";
import { supabase } from "@/lib/supabase";
import { 
  Building2, MapPin, Briefcase, Users, 
  CheckCircle2, Globe, Mail, Phone,
  Star, ShieldCheck, Zap, Award,
  ArrowRight, Info, Clock, Archive
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

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
  // 1. FETCH DATA UTAMA
  const { data: company, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", params.id)
    .single();

  // 2. FETCH SEMUA LOWONGAN (TANPA FILTER STATUS DULU)
  const { data: allJobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("company_id", params.id)
    .order("created_at", { ascending: false });

  // 3. PISAHKAN LOWONGAN AKTIF DAN TUTUP
  const activeJobs = allJobs?.filter(j => j.status === "open") || [];
  const closedJobs = allJobs?.filter(j => j.status === "closed") || [];

  const { data: ratingData } = await supabase
    .rpc('get_company_rating_aggregate', { comp_id: params.id });

  if (error || !company) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-xl font-black uppercase italic tracking-tighter">Profil Tidak Ditemukan</h1>
        <Link href="/" className="mt-6 px-8 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px]">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  const totalEmp = company.total_employees || 0;
  const disEmp = company.total_employees_with_disability || 0;
  const quotaPercent = totalEmp > 0 ? ((disEmp / totalEmp) * 100).toFixed(1) : "0.0";

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20 font-sans text-slate-900">
      {/* HEADER SECTION */}
      <div className="bg-white border-b-2 border-slate-100 shadow-sm overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row items-center lg:items-end gap-8">
            <div className="w-32 h-32 bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-white shrink-0 shadow-xl border-4 border-white">
              <Building2 size={60} />
            </div>
            <div className="flex-1 text-center lg:text-left space-y-4">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">{company.name}</h1>
                {company.is_verified && (
                  <div className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-full">
                    <CheckCircle2 size={14} /><span className="text-[8px] font-black uppercase tracking-widest">Verified Partner</span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-slate-500 font-bold uppercase text-[10px]">
                <div className="flex items-center gap-2"><Briefcase size={16} className="text-blue-600" />{company.industry}</div>
                <div className="flex items-center gap-2"><MapPin size={16} className="text-red-600" />{company.location}</div>
              </div>
            </div>
            <div className="bg-slate-50 p-6 rounded-[2.5rem] border-2 border-slate-100 flex items-center gap-6">
              <div className="text-center">
                <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Inclusion Index</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl font-black">{ratingData?.total_avg?.toFixed(1) || "0.0"}</span>
                  <Star size={20} className="fill-amber-500 text-amber-500" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          
          {/* KOLOM KIRI: DETAIL & DAFTAR KERJA */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* 1. DESKRIPSI VISI */}
            <section className="space-y-6">
              <h2 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3 text-slate-900">
                <Info className="text-blue-600" size={24} /> {"Visi Inklusi Instansi"}
              </h2>
              <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm">
                <p className="text-slate-600 leading-relaxed whitespace-pre-line font-medium text-sm">
                  {company.description || "Instansi ini berkomitmen pada kesetaraan peluang kerja."}
                </p>
              </div>
            </section>

            {/* 2. DAFTAR LOWONGAN AKTIF */}
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3 text-slate-900">
                  <Zap className="text-amber-500 fill-amber-500" size={24} /> {"Lowongan Aktif"}
                </h2>
                <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[9px] font-black rounded-full uppercase">
                  {activeJobs.length} {"Tersedia"}
                </span>
              </div>
              
              <div className="space-y-4">
                {activeJobs.length > 0 ? (
                  activeJobs.map((job) => (
                    <Link 
                      key={job.id} 
                      href={`/jobs/${job.id}`}
                      className="group flex flex-col md:flex-row justify-between items-center p-6 bg-white border-2 border-slate-100 rounded-[2rem] hover:border-slate-900 transition-all shadow-sm"
                    >
                      <div className="space-y-1">
                        <h3 className="text-lg font-black uppercase italic tracking-tighter group-hover:text-blue-600 transition-colors">
                          {job.title}
                        </h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {job.department} • {job.type}
                        </p>
                      </div>
                      <div className="bg-slate-900 text-white p-2 rounded-xl group-hover:bg-blue-600 transition-colors">
                        <ArrowRight size={18} />
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="p-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] text-center text-[10px] font-bold text-slate-400 uppercase italic">
                    {"Saat ini belum ada lowongan aktif."}
                  </p>
                )}
              </div>
            </section>

            {/* 3. ARSIP LOWONGAN (YANG SUDAH TUTUP) */}
            {closedJobs.length > 0 && (
              <section className="space-y-6 opacity-70">
                <h2 className="text-lg font-black italic uppercase tracking-tighter flex items-center gap-3 text-slate-500">
                  <Archive size={22} /> {"Arsip Lowongan (Tutup)"}
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {closedJobs.map((job) => (
                    <div key={job.id} className="p-5 bg-slate-50 border border-slate-200 rounded-2xl grayscale">
                      <h3 className="text-sm font-black uppercase italic tracking-tight text-slate-600">{job.title}</h3>
                      <div className="flex items-center gap-2 mt-2 text-[9px] font-bold text-slate-400 uppercase">
                        <Clock size={12} /> {"Tutup pada "}{new Date(job.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* KOLOM KANAN: STATS & KOMITMEN */}
          <div className="space-y-8">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-[60px]" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">{"Inclusion Progress"}</p>
              
              <div className="space-y-6">
                <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[8px] font-black uppercase text-slate-400 mb-1">{"Total Karyawan"}</p>
                  <p className="text-2xl font-black">{totalEmp}</p>
                </div>
                <div className="p-5 bg-blue-600/20 rounded-2xl border border-blue-600/30">
                  <p className="text-[8px] font-black uppercase text-blue-400 mb-1">{"Disabilitas Kerja"}</p>
                  <p className="text-2xl font-black text-blue-400">{disEmp}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10">
                <div className="flex items-center gap-3 text-emerald-400 mb-2">
                  <Award size={20} />
                  <span className="text-sm font-black italic uppercase tracking-tighter">{"Inclusion Commitment"}</span>
                </div>
                <p className="text-[9px] font-medium text-slate-400 italic">
                  {"Mendukung ekosistem kerja yang setara dan aksesibel bagi semua."}
                </p>
              </div>
            </div>

            {/* AKOMODASI LIST */}
            <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 space-y-6 shadow-sm">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                <ShieldCheck className="text-emerald-500" size={16} /> {"Akomodasi"}
              </h3>
              <div className="flex flex-wrap gap-2">
                {company.master_accommodations_provided?.map((acc: string, idx: number) => (
                  <span key={idx} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg text-[8px] font-black uppercase">
                    {acc}
                  </span>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
