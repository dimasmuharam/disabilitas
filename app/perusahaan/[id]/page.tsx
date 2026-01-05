import React from "react";
import { supabase } from "@/lib/supabase";
import { 
  Building2, MapPin, Briefcase, Users, 
  CheckCircle2, Globe, Mail, Phone,
  Star, ShieldCheck, Zap, Award,
  ArrowRight, Info
} from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

// 1. GENERATE METADATA UNTUK SEO & AKSESIBILITAS
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
      canonical: `https://disabilitas.com/perusahaan/${params.id}`,
    },
  };
}

export default async function PublicCompanyProfile({ params }: { params: { id: string } }) {
  // 2. FETCH DATA LENGKAP DARI DATABASE
  const { data: company, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", params.id)
    .single();

  // 3. FETCH RATING AGREGAT
  const { data: ratingData } = await supabase
    .rpc('get_company_rating_aggregate', { comp_id: params.id });

  // 4. FETCH LOWONGAN AKTIF
  const { data: jobs } = await supabase
    .from("jobs")
    .select("*")
    .eq("company_id", params.id)
    .eq("status", "open")
    .order("created_at", { ascending: false });

  if (error || !company) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mb-4">
          <Building2 size={40} />
        </div>
        <h1 className="text-xl font-black uppercase italic tracking-tighter text-slate-900">Profil Tidak Ditemukan</h1>
        <p className="text-sm text-slate-500 mt-2">Maaf, profil instansi yang Anda cari tidak tersedia atau telah dihapus.</p>
        <Link href="/" className="mt-6 px-8 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px]">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  // LOGIKA PERSENTASE KUOTA (Sama dengan Dashboard)
  const totalEmp = company.total_employees || 0;
  const disEmp = company.total_employees_with_disability || 0;
  const quotaPercent = totalEmp > 0 ? ((disEmp / totalEmp) * 100).toFixed(1) : "0.0";

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20 font-sans text-slate-900">
      {/* HEADER SECTION */}
      <div className="bg-white border-b-2 border-slate-100 shadow-sm overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row items-center lg:items-end gap-8">
            {/* Logo/Avatar */}
            <div className="w-32 h-32 bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-white shrink-0 shadow-xl border-4 border-white">
              <Building2 size={60} />
            </div>

            {/* Title & Info Utama */}
            <div className="flex-1 text-center lg:text-left space-y-4">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <h1 className="text-4xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">
                  {company.name}
                </h1>
                {company.is_verified && (
                  <div className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-full">
                    <CheckCircle2 size={14} />
                    <span className="text-[8px] font-black uppercase tracking-widest">Verified Partner</span>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-slate-500">
                <div className="flex items-center gap-2">
                  <Briefcase size={16} className="text-blue-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wide">{company.industry}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-red-600" />
                  <span className="text-[10px] font-bold uppercase tracking-wide">{company.location}</span>
                </div>
                {company.website && (
                  <a href={company.website} target="_blank" className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                    <Globe size={16} />
                    <span className="text-[10px] font-bold uppercase tracking-wide">Website</span>
                  </a>
                )}
              </div>
            </div>

            {/* Ringkasan Skor */}
            <div className="bg-slate-50 p-6 rounded-[2.5rem] border-2 border-slate-100 flex items-center gap-6">
              <div className="text-center">
                <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Inclusion Index</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl font-black">{ratingData?.total_avg?.toFixed(1) || "0.0"}</span>
                  <Star size={20} className="fill-amber-500 text-amber-500" />
                </div>
              </div>
              <div className="w-[2px] h-10 bg-slate-200" />
              <div className="text-center">
                <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Quota 1%</p>
                <span className="text-2xl font-black text-blue-600">{quotaPercent}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          
          {/* KOLOM KIRI: DETAIL & VISI */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* 1. DESKRIPSI & VISI INKLUSI */}
            <section className="space-y-6">
              <h2 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                <Info className="text-blue-600" size={24} /> {"Tentang & Visi Inklusi"}
              </h2>
              <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm">
                <p className="text-slate-600 leading-relaxed whitespace-pre-line font-medium">
                  {company.description || "Instansi ini belum memberikan deskripsi visi inklusi secara detail."}
                </p>
              </div>
            </section>

            {/* 2. AKOMODASI YANG DISEDIAKAN (SINKRON DATA-STATIC) */}
            <section className="space-y-6">
              <h2 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                <ShieldCheck className="text-emerald-600" size={24} /> {"Akomodasi & Fasilitas Inklusi"}
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {company.master_accommodations_provided && company.master_accommodations_provided.length > 0 ? (
                  company.master_accommodations_provided.map((acc: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-4 p-4 bg-emerald-50/50 border border-emerald-100 rounded-2xl">
                      <div className="mt-1 bg-emerald-500 rounded-full p-1 text-white">
                        <CheckCircle2 size={12} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wide text-emerald-900">{acc}</span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase italic">{"Data akomodasi spesifik belum diisi."}</p>
                  </div>
                )}
              </div>
            </section>

            {/* 3. LOWONGAN KERJA AKTIF */}
            <section className="space-y-6">
              <h2 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                <Zap className="text-amber-500" size={24} /> {"Lowongan Inklusif Tersedia"}
              </h2>
              <div className="space-y-4">
                {jobs && jobs.length > 0 ? (
                  jobs.map((job) => (
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
                      <div className="mt-4 md:mt-0 flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase px-4 py-2 bg-slate-50 rounded-full">
                          {job.location}
                        </span>
                        <div className="bg-slate-900 text-white p-2 rounded-xl group-hover:bg-blue-600 transition-colors">
                          <ArrowRight size={18} />
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="p-12 bg-white border-2 border-slate-100 rounded-[2.5rem] text-center space-y-3">
                    <Briefcase className="mx-auto text-slate-200" size={48} />
                    <p className="text-sm font-bold text-slate-400 uppercase italic tracking-widest">{"Saat ini belum ada lowongan aktif."}</p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* KOLOM KANAN: STATS & KOMITMEN */}
          <div className="space-y-8">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white space-y-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/20 blur-[60px]" />
              
              <div className="space-y-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">Statistik Karyawan</h3>
                <p className="text-2xl font-black italic tracking-tight uppercase leading-none">Komitmen Inklusi</p>
              </div>

              <div className="space-y-6">
                <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Total Karyawan</p>
                  <p className="text-2xl font-black">{totalEmp}</p>
                </div>
                <div className="p-5 bg-blue-600/20 rounded-2xl border border-blue-600/30">
                  <p className="text-[8px] font-black uppercase text-blue-400 mb-1">Karyawan Disabilitas</p>
                  <p className="text-2xl font-black text-blue-400">{disEmp}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-white/10 text-center">
                <div className="flex items-center justify-center gap-3 text-emerald-400 mb-2">
                  <Award size={20} />
                  <span className="text-sm font-black italic uppercase tracking-tighter">Inclusion Growth</span>
                </div>
                <p className="text-[9px] font-medium text-slate-400 leading-relaxed italic">
                  {"Instansi ini secara aktif mendukung pemberdayaan ekonomi talenta disabilitas di Indonesia."}
                </p>
              </div>
            </div>

            {/* KONTAK INFO */}
            <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 space-y-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900">Kontak Instansi</h3>
              <div className="space-y-4">
                {company.email && (
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-50 rounded-xl text-slate-400"><Mail size={16} /></div>
                    <span className="text-[10px] font-bold uppercase truncate">{company.email}</span>
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-slate-50 rounded-xl text-slate-400"><Phone size={16} /></div>
                    <span className="text-[10px] font-bold uppercase">{company.phone}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
