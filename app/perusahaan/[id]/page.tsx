import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { 
  Building2, MapPin, Globe, ShieldCheck, Star, 
  CheckCircle, Users, Briefcase, ArrowRight, Info
} from "lucide-react"
import Link from "next/link"

export default async function PublicCompanyProfile({ params }: { params: { id: string } }) {
  const supabase = createServerComponentClient({ cookies })

  // 1. Fetch Data Perusahaan
  const { data: company } = await supabase
    .from('companies')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!company) return notFound()

  // 2. Fetch Rating Agregat
  const { data: ratings } = await supabase
    .from('inclusion_ratings')
    .select('*')
    .eq('company_id', params.id)

  const { data: activeJobs } = await supabase
    .from('jobs')
    .select('*')
    .eq('company_id', params.id)
    .eq('is_active', true)

  // Hitung Rata-rata Rating
  const calculateAvg = (key: string) => {
    if (!ratings || ratings.length === 0) return 0
    return ratings.reduce((a, b) => a + b[key], 0) / ratings.length
  }

  const scores = {
    accessibility: calculateAvg('score_accessibility'),
    culture: calculateAvg('score_culture'),
    management: calculateAvg('score_management'),
    onboarding: calculateAvg('score_onboarding')
  }
  
  const avgTotal = (scores.accessibility + scores.culture + scores.management + scores.onboarding) / 4

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* HERO SECTION */}
      <div className="bg-slate-900 text-white pt-20 pb-32 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 bg-blue-600 rounded-[2.5rem] flex items-center justify-center text-4xl font-black italic shadow-2xl border-4 border-white/10">
            {company.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-3">
              <h1 className="text-4xl font-black tracking-tighter uppercase">{company.name}</h1>
              {company.is_verified && (
                <span className="bg-blue-500 text-[10px] font-black uppercase px-3 py-1 rounded-full flex items-center gap-1 shadow-lg shadow-blue-500/20">
                  <ShieldCheck size={12}/> Partner Terverifikasi
                </span>
              )}
            </div>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 text-slate-400 font-bold text-sm">
              <span className="flex items-center gap-2"><MapPin size={16} className="text-blue-500"/> {company.location || "Lokasi tidak diset"}</span>
              <span className="flex items-center gap-2"><Globe size={16} className="text-blue-500"/> {company.industry}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="max-w-5xl mx-auto px-6 -mt-16 grid lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: SCORECARD & INFO */}
        <div className="lg:col-span-1 space-y-6">
          {/* SCORECARD */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest mb-6 flex items-center gap-2">
              <Star size={14} className="text-orange-400"/> Inclusion Scorecard
            </h3>
            <div className="flex items-end gap-3 mb-8">
              <span className="text-6xl font-black italic leading-none">{avgTotal > 0 ? avgTotal.toFixed(1) : "N/A"}</span>
              <span className="text-slate-400 font-bold mb-1">/ 5.0</span>
            </div>
            <div className="space-y-4">
              {[
                { label: "Aksesibilitas", val: scores.accessibility },
                { label: "Budaya Kerja", val: scores.culture },
                { label: "Dukungan Manajemen", val: scores.management },
                { label: "Proses Onboarding", val: scores.onboarding },
              ].map((s) => (
                <div key={s.label} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                    <span>{s.label}</span>
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
          </div>

          {/* STATS */}
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-white/5 rounded-2xl">
                <p className="text-2xl font-black">{company.total_employees_with_disability || 0}</p>
                <p className="text-[8px] font-black uppercase text-slate-400">Karyawan Disabilitas</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-2xl">
                <p className="text-2xl font-black">{activeJobs?.length || 0}</p>
                <p className="text-[8px] font-black uppercase text-slate-400">Lowongan Aktif</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DESCRIPTION & JOBS */}
        <div className="lg:col-span-2 space-y-8">
          {/* ABOUT & VISION */}
          <div className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-slate-100 space-y-8">
            <section>
              <h3 className="text-sm font-black uppercase italic text-blue-600 mb-4">Visi Inklusi</h3>
              <p className="text-slate-600 leading-relaxed italic font-medium">{company.vision_statement || "Belum ada visi tertulis."}</p>
            </section>
            
            <section className="pt-8 border-t border-slate-100">
              <h3 className="text-sm font-black uppercase italic text-blue-600 mb-4">Akomodasi yang Disediakan</h3>
              <div className="flex flex-wrap gap-2">
                {company.master_accommodations_provided?.map((acc: string) => (
                  <span key={acc} className="bg-green-50 text-green-700 px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 border border-green-100">
                    <CheckCircle size={14}/> {acc}
                  </span>
                )) || <p className="text-slate-400 text-xs italic">Informasi akomodasi belum dilengkapi.</p>}
              </div>
            </section>
          </div>

          {/* ACTIVE JOBS LIST */}
          <div className="space-y-4">
            <h3 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-2 px-2">
              <Briefcase className="text-blue-600"/> Lowongan Aktif di Perusahaan Ini
            </h3>
            {activeJobs && activeJobs.length > 0 ? (
              activeJobs.map((job) => (
                <Link key={job.id} href={`/lowongan/${job.id}`} className="block bg-white p-6 rounded-3xl border border-slate-100 hover:border-blue-600 hover:shadow-2xl transition-all group">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <h4 className="text-xl font-black group-hover:text-blue-600 transition-colors uppercase tracking-tight">{job.title}</h4>
                      <div className="flex gap-3 text-[10px] font-bold text-slate-400 uppercase">
                        <span>{job.work_mode}</span>
                        <span>•</span>
                        <span>{job.location}</span>
                      </div>
                    </div>
                    <div className="bg-slate-100 p-3 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                      <ArrowRight size={20}/>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="bg-slate-100 p-10 rounded-[2.5rem] text-center italic text-slate-400 font-medium">
                Saat ini belum ada lowongan aktif.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
