import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { Metadata } from "next"
import { 
  Building2, MapPin, Globe, ShieldCheck, Star, 
  CheckCircle, Users, Briefcase, ArrowRight, Info, Heart
} from "lucide-react"
import Link from "next/link"

export const runtime = 'edge';

// GENERATE METADATA & CANONICAL
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createServerComponentClient({ cookies })
  const { data: company } = await supabase.from('companies').select('name').eq('id', params.id).single()
  
  if (!company) return {}

  return {
    title: `${company.name} | Partner Inklusi disabilitas.com`,
    description: `Lihat komitmen inklusivitas dan lowongan kerja di ${company.name}. Bergabunglah dengan ekosistem kerja ramah disabilitas.`,
    alternates: {
      canonical: `https://www.disabilitas.com/perusahaan/${params.id}`,
    },
  }
}

export default async function PublicCompanyProfile({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })

  // 1. Fetch Data Perusahaan Lengkap
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!company) return notFound()

  // 2. Fetch Rating Agregat dari Talenta
  const { data: ratings } = await supabase
    .from('inclusion_ratings')
    .select('*')
    .eq('company_id', params.id)

  // 3. Fetch Lowongan Aktif
  const { data: activeJobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('company_id', params.id)
    .eq('is_active', true)

  // Hitung Rata-rata Rating
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
      <div className="bg-slate-900 text-white pt-20 pb-32 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-20 opacity-10 pointer-events-none">
          <Building2 size={300} className="-rotate-12" />
        </div>
        
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="w-32 h-32 bg-blue-600 rounded-[2.5rem] flex items-center justify-center text-4xl font-black italic shadow-2xl border-4 border-white/10 uppercase">
            {company.name.substring(0, 2)}
          </div>
          <div className="flex-1 text-center md:text-left space-y-3">
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
              <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">{company.name}</h1>
              {company.is_verified && (
                <span className="bg-blue-600 text-[10px] font-black uppercase px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
                  <ShieldCheck size={14}/> {"Partner Terverifikasi"}
                </span>
              )}
            </div>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 text-slate-400 font-bold text-xs tracking-widest uppercase">
              <span className="flex items-center gap-2"><MapPin size={16} className="text-blue-500"/> {company.location || "Lokasi Belum Diatur"}</span>
              <span className="flex items-center gap-2"><Globe size={16} className="text-blue-500"/> {company.industry || "General Industry"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="max-w-5xl mx-auto px-6 -mt-16 grid lg:grid-cols-3 gap-8 relative z-20">
        
        {/* SIDEBAR: STATS & SCORECARD */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-6 flex items-center gap-2">
              <Star size={14} className="text-orange-400"/> {"Inclusion Scorecard"}
            </h3>
            <div className="flex items-end gap-3 mb-8">
              <span className="text-6xl font-black italic leading-none">{avgTotal > 0 ? avgTotal.toFixed(1) : "0.0"}</span>
              <span className="text-slate-400 font-bold mb-1">{"/ 5.0"}</span>
            </div>
            
            <div className="space-y-5">
              {[
                { label: "Aksesibilitas", val: scoreAccessibility },
                { label: "Budaya Kerja", val: scoreCulture },
                { label: "Dukungan Manajemen", val: scoreManagement },
                { label: "Onboarding", val: scoreOnboarding },
              ].map((s) => (
                <div key={s.label} className="space-y-2">
                  <div className="flex justify-between text-[9px] font-black uppercase tracking-wider">
                    <span>{s.label}</span>
                    <span className="text-blue-600">{s.val.toFixed(1)}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full transition-all duration-1000" 
                      style={{ width: `${(s.val / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-10 pt-6 border-t border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-600">
                        <Users size={24}/>
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{"Karyawan Disabilitas"}</p>
                        <p className="text-xl font-black">{company.total_employees_with_disability || 0} {" Orang"}</p>
                    </div>
                </div>
            </div>
          </div>

          <div className="bg-blue-600 text-white p-8 rounded-[2.5rem] shadow-xl flex flex-col items-center text-center space-y-4">
            <Heart size={40} className="fill-white/20" />
            <h4 className="text-sm font-black uppercase tracking-tighter">{"Dukung Inklusivitas"}</h4>
            <p className="text-[10px] font-medium leading-relaxed opacity-80 uppercase">{"Setiap lowongan dan fasilitas yang disediakan membantu mewujudkan Indonesia yang lebih setara."}</p>
          </div>
        </div>

        {/* MAIN CONTENT: VISION & JOBS */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-10">
            <section>
              <h3 className="text-xs font-black uppercase italic text-blue-600 mb-4 tracking-widest flex items-center gap-2">
                <Info size={16}/> {"Visi Inklusi Perusahaan"}
              </h3>
              <p className="text-slate-700 leading-relaxed italic font-medium text-lg">
                {"\""}{company.vision_statement || "Kami berkomitmen membangun lingkungan kerja yang inklusif bagi seluruh talenta tanpa hambatan."}{"\""}
              </p>
            </section>
            
            <section className="pt-8 border-t border-slate-100">
              <h3 className="text-xs font-black uppercase italic text-blue-600 mb-6 tracking-widest">{"Akomodasi & Fasilitas Tersedia"}</h3>
              <div className="flex flex-wrap gap-3">
                {Array.isArray(company.master_accommodations_provided) && company.master_accommodations_provided.length > 0 ? (
                  company.master_accommodations_provided.map((acc: string) => (
                    <span key={acc} className="bg-slate-50 text-slate-700 px-5 py-3 rounded-2xl text-[10px] font-black uppercase flex items-center gap-3 border border-slate-100 shadow-sm transition-all hover:bg-white hover:border-blue-600">
                      <CheckCircle size={16} className="text-green-500"/> {acc}
                    </span>
                  ))
                ) : (
                  <p className="text-slate-400 text-[10px] font-bold uppercase italic">{"Data akomodasi sedang dalam pembaruan."}</p>
                )}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3 px-4">
              <Briefcase className="text-blue-600" size={24}/> {"Peluang Karir Aktif"}
            </h3>
            <div className="grid gap-4">
              {activeJobs && activeJobs.length > 0 ? (
                activeJobs.map((job) => (
                  <Link key={job.id} href={`/lowongan/${job.id}`} className="block bg-white p-8 rounded-[2.5rem] border border-slate-100 hover:border-blue-600 hover:shadow-2xl transition-all group">
                    <div className="flex justify-between items-center">
                      <div className="space-y-3">
                        <h4 className="text-2xl font-black group-hover:text-blue-600 transition-colors uppercase tracking-tight leading-none">{job.title}</h4>
                        <div className="flex flex-wrap gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          <span className="bg-slate-50 px-3 py-1 rounded-lg">{job.work_mode}</span>
                          <span className="bg-slate-50 px-3 py-1 rounded-lg">{job.location}</span>
                        </div>
                      </div>
                      <div className="bg-slate-100 p-4 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                        <ArrowRight size={24}/>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="bg-slate-100 p-16 rounded-[3rem] text-center italic text-slate-400 font-bold uppercase tracking-widest text-xs border-2 border-dashed border-slate-200">
                  {"Saat ini belum ada lowongan aktif."}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
