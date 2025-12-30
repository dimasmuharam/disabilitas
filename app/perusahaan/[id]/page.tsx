import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import { 
  Building2, MapPin, Globe, ShieldCheck, Star, 
  CheckCircle, Users, Briefcase, ArrowRight, Info, Heart, Clock
} from "lucide-react"
import Link from "next/link"

export const runtime = 'edge';

/**
 * GENERATE METADATA & CANONICAL 
 * Sinkronisasi SEO menggunakan domain WWW sesuai standar Mas Dimas.
 */
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createServerComponentClient({ cookies })
  const { data: company } = await supabase
    .from('companies')
    .select('name')
    .eq('id', params.id)
    .single()
  
  if (!company) return {}

  return {
    title: `${company.name} | Partner Inklusi disabilitas.com`,
    description: `Lihat komitmen inklusivitas, skor aksesibilitas, dan lowongan kerja aktif di ${company.name}.`,
    alternates: {
      canonical: `https://www.disabilitas.com/perusahaan/${params.id}`,
    },
  }
}

export default async function PublicCompanyProfile({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })

  // 1. Fetch Data Perusahaan Riil
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!company) return notFound()

  // 2. Fetch Rating Agregat Riil (Hasil input dari para Talenta)
  const { data: ratings } = await supabase
    .from('inclusion_ratings')
    .select('*')
    .eq('company_id', params.id)

  // 3. Fetch Lowongan Kerja Aktif
  const { data: activeJobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('company_id', params.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  // LOGIKA HITUNG RATING RIEL
  const calculateAvg = (key: string) => {
    if (!ratings || ratings.length === 0) return 0
    return ratings.reduce((a, b) => a + (b[key] || 0), 0) / ratings.length
  }

  const scoreAccessibility = calculateAvg('score_accessibility')
  const scoreCulture = calculateAvg('score_culture')
  const scoreManagement = calculateAvg('score_management')
  const scoreOnboarding = calculateAvg('score_onboarding')
  const avgTotal = (scoreAccessibility + scoreCulture + scoreManagement + scoreOnboarding) / 4

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* HERO SECTION */}
      <div className="bg-slate-900 text-white pt-24 pb-36 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none flex justify-end items-center">
          <Building2 size={400} className="-rotate-12 translate-x-20" />
        </div>

        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-10 relative z-10">
          {/* Logo Inisial */}
          <div className="w-36 h-36 bg-blue-600 rounded-[3rem] flex items-center justify-center text-5xl font-black italic shadow-2xl border-4 border-white/10 uppercase">
            {company.name.substring(0, 2)}
          </div>
          
          <div className="flex-1 text-center md:text-left space-y-4">
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none">
                {company.name}
              </h1>
              {company.is_verified && (
                <div className="bg-blue-600 text-white px-5 py-2 rounded-full flex items-center gap-2 shadow-xl border border-white/10">
                  <ShieldCheck size={16}/> 
                  <span className="text-[10px] font-black uppercase tracking-widest">{"Partner Terverifikasi"}</span>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-8 text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em]">
              <span className="flex items-center gap-2">
                <MapPin size={18} className="text-blue-500"/> {company.location || "Lokasi Belum Ditentukan"}
              </span>
              <span className="flex items-center gap-2">
                <Globe size={18} className="text-blue-500"/> {company.industry || "Sektor Industri"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="max-w-5xl mx-auto px-6 -mt-20 grid lg:grid-cols-3 gap-10 relative z-20">
        
        {/* SIDEBAR: ANALISIS INKLUSI RIIL */}
        <div className="lg:col-span-1 space-y-8">
          <section className="bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-8 flex items-center gap-2">
              <Star size={14} className="text-orange-400"/> {"Inclusion Scorecard"}
            </h3>
            
            <div className="flex items-end gap-3 mb-10">
              <span className="text-7xl font-black italic leading-none">
                {avgTotal > 0 ? avgTotal.toFixed(1) : "0.0"}
              </span>
              <span className="text-slate-400 font-black mb-2 tracking-widest">{"/ 5.0"}</span>
            </div>
            
            <div className="space-y-6">
              {[
                { label: "Aksesibilitas Fisik/Digital", val: scoreAccessibility },
                { label: "Budaya Kerja Inklusif", val: scoreCulture },
                { label: "Dukungan Manajemen", val: scoreManagement },
                { label: "Proses Onboarding", val: scoreOnboarding },
              ].map((s) => (
                <div key={s.label} className="space-y-2">
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-wider">
                    <span className="text-slate-500">{s.label}</span>
                    <span className="text-blue-600">{s.val.toFixed(1)}</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-1000" 
                      style={{ width: `${(s.val / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner">
                  <Users size={28}/>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{"Resapan Talenta"}</p>
                  <p className="text-2xl font-black text-slate-900">
                    {company.total_employees_with_disability || 0} {" Karyawan"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Aksesibilitas Web Perusahaan Banner */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-8 rounded-[2.5rem] shadow-xl space-y-4">
            <Heart size={32} className="fill-white/20" />
            <h4 className="text-lg font-black uppercase tracking-tighter leading-tight">{"Komitmen Disabilitas.com"}</h4>
            <p className="text-[10px] font-bold uppercase leading-relaxed opacity-90">
              {"Setiap data di sini divalidasi untuk memastikan ekosistem karir yang adil dan inklusif bagi semua."}
            </p>
          </div>
        </div>

        {/* CONTENT UTAMA: VISI & LOWONGAN */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* VISI & AKOMODASI */}
          <div className="bg-white p-12 rounded-[2.5rem] shadow-2xl border border-slate-100 space-y-12">
            <section>
              <h3 className="text-xs font-black uppercase italic text-blue-600 mb-6 tracking-[0.2em] flex items-center gap-2">
                <Info size={18}/> {"Filosofi Inklusi Instansi"}
              </h3>
              <p className="text-2xl font-black text-slate-800 leading-snug italic">
                {"\""}{company.vision_statement || "Kami mengutamakan kompetensi di atas keterbatasan."}{"\""}
              </p>
            </section>
            
            <section className="pt-10 border-t border-slate-100">
              <h3 className="text-xs font-black uppercase italic text-blue-600 mb-8 tracking-[0.2em]">{"Akomodasi & Fasilitas Riil"}</h3>
              <div className="flex flex-wrap gap-4">
                {Array.isArray(company.master_accommodations_provided) && company.master_accommodations_provided.length > 0 ? (
                  company.master_accommodations_provided.map((acc: string) => (
                    <span key={acc} className="bg-slate-50 text-slate-700 px-6 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center gap-3 border border-slate-100 hover:border-blue-600 hover:bg-white transition-all shadow-sm">
                      <CheckCircle size={18} className="text-green-500"/> {acc}
                    </span>
                  ))
                ) : (
                  <p className="text-slate-400 text-xs italic font-bold">{"Data akomodasi master belum diatur."}</p>
                )}
              </div>
            </section>
          </div>

          {/* DAFTAR LOWONGAN AKTIF */}
          <div className="space-y-8">
            <div className="flex items-center justify-between px-6">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter flex items-center gap-4">
                <Briefcase className="text-blue-600" size={32}/> {"Peluang Karir"}
              </h3>
              <span className="text-[10px] font-black bg-slate-200 px-4 py-1 rounded-full uppercase">
                {activeJobs?.length || 0} {" Aktif"}
              </span>
            </div>

            <div className="grid gap-6">
              {activeJobs && activeJobs.length > 0 ? (
                activeJobs.map((job) => (
                  <div key={job.id} className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-blue-600 transition-all group relative overflow-hidden">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                      <div className="space-y-4">
                        <h4 className="text-3xl font-black uppercase tracking-tight leading-none group-hover:text-blue-600 transition-colors">
                          {job.title}
                        </h4>
                        <div className="flex flex-wrap gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <span className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl">
                            <MapPin size={14} className="text-blue-500"/> {job.location}
                          </span>
                          <span className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-xl">
                            <Clock size={14} className="text-blue-500"/> {job.work_mode}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 w-full md:w-auto">
                        <Link 
                          href={`/lowongan/${job.id}`}
                          className="flex-1 md:flex-none px-8 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-xl"
                        >
                          {"Lihat Detail"} <ArrowRight size={16}/>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-slate-100 p-20 rounded-[3rem] text-center border-4 border-dashed border-slate-200">
                  <Info size={40} className="mx-auto mb-4 text-slate-300" />
                  <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
                    {"Saat ini belum ada lowongan aktif dari instansi ini."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
