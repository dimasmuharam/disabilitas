"use client"

export const runtime = 'edge'

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { 
  MapPin, Briefcase, Building2, Calendar, ArrowLeft, 
  CheckCircle, ExternalLink, Send, ShieldCheck, Info, 
  Clock, DollarSign, Monitor, GraduationCap, Tag, 
  Accessibility, AlertCircle
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    async function init() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      setUser(authUser)
      
      try {
        const isUuid = params.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
        // Pastikan query mengambil semua kolom termasuk salary dan tools
        let query = supabase.from('jobs').select(`*, companies (*)`)
        
        if (isUuid) { 
          query = query.eq('id', params.id) 
        } else { 
          query = query.eq('slug', params.id) 
        }

        const { data, error } = await query.single()
        if (error) throw error
        setJob(data)

        if (authUser && data) {
          const { data: appData } = await supabase.from('applications').select('id').eq('job_id', data.id).eq('applicant_id', authUser.id).maybeSingle()
          if (appData) setHasApplied(true)
        }
      } catch (e) { 
        console.error("Fetch Error:", e) 
      } finally { 
        setLoading(false) 
      }
    }
    init()
  }, [params.id])

  const parseToArray = (fieldData: any) => {
    if (!fieldData) return [];
    if (Array.isArray(fieldData)) return fieldData;
    if (typeof fieldData === 'string') {
      try {
        const parsed = JSON.parse(fieldData);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        return fieldData.split(',').map(s => s.trim()).filter(s => s !== "");
      }
    }
    return [];
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-400 italic">MENYINKRONKAN DATA...</div>;
  if (!job) return <div className="p-20 text-center font-black uppercase italic tracking-widest">Lowongan Tidak Tersedia</div>;
  return (
    <main className="min-h-screen bg-[#FDFDFD] pb-24 pt-10 font-sans text-left selection:bg-blue-100 selection:text-blue-900">
      <div className="max-w-6xl mx-auto px-6">
        
        <Link href="/lowongan" className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 mb-10 transition-all group outline-none focus:ring-2 focus:ring-blue-600 rounded-lg">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1" /> KEMBALI KE PENCARIAN
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          <div className="lg:col-span-2 space-y-8">
            {/* CARD 1: IDENTITY */}
            <article className="bg-white rounded-[3rem] p-8 md:p-12 border-2 border-slate-100 shadow-sm space-y-6">
              <div className="flex flex-wrap gap-3 font-black uppercase text-[10px]">
                <span className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-xl border border-blue-100 italic">{job.job_type}</span>
                <span className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-xl border border-emerald-100 italic">{job.work_mode}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-none tracking-tighter uppercase italic">{job.title}</h1>
              <Link href={`/perusahaan/${job.companies?.id}`} className="inline-flex items-center gap-2 text-xl font-bold text-blue-600 hover:underline group">
                <Building2 className="h-6 w-6 text-slate-900 group-hover:text-blue-600 transition-colors" /> 
                {job.companies?.name || "Instansi Mitra"}
              </Link>
              <div className="flex flex-wrap gap-8 pt-8 border-t-2 border-slate-50 font-black uppercase text-[10px] text-slate-400">
                <span className="flex items-center gap-2 italic"><MapPin size={16} className="text-red-500" /> {job.location}</span>
                <span className="flex items-center gap-2 italic">
                  <DollarSign size={16} className="text-emerald-500" /> 
                  {/* Perbaikan pengambilan data gaji */}
                  {job.salary_min > 0 ? `Rp ${(job.salary_min/1000000).toFixed(1)}jt - ${(job.salary_max/1000000).toFixed(1)}jt` : "Kompetitif"}
                </span>
              </div>
            </article>

            {/* CARD 2: PENDIDIKAN & JURUSAN (DIJAMIN MUNCUL) */}
            <section className="bg-white rounded-[3rem] p-8 md:p-12 border-2 border-slate-100 shadow-sm grid md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <h2 className="text-[10px] font-black uppercase text-blue-600 tracking-widest flex items-center gap-2 italic"><GraduationCap size={16}/> Pendidikan Minimal</h2>
                <div className="space-y-4">
                  <p className="text-2xl font-black uppercase italic text-slate-900 leading-none">{job.required_education_level}</p>
                  <div className="flex flex-wrap gap-2">
                    {parseToArray(job.required_education_major).map((m: string, idx: number, arr: any[]) => (
                      <span key={m} className="px-2 py-1 bg-slate-50 text-[9px] font-black uppercase rounded border border-slate-100">
                        {m}{idx < arr.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6 border-t md:border-t-0 md:border-l-2 border-slate-50 pt-8 md:pt-0 md:pl-10">
                <h2 className="text-[10px] font-black uppercase text-emerald-600 tracking-widest flex items-center gap-2 italic"><Tag size={16}/> Skill Utama</h2>
                <div className="flex flex-wrap gap-2">
                  {/* Perbaikan logic agar tidak double: SR-ONLY dihapus, koma diberikan pada tiap span */}
                  {parseToArray(job.required_skills).length > 0 ? (
                    parseToArray(job.required_skills).map((skill: string, idx: number, arr: any[]) => (
                      <span key={skill} className="px-3 py-1 bg-slate-900 text-white text-[9px] font-black uppercase rounded-lg italic shadow-sm">
                        {skill}{idx < arr.length - 1 ? ", " : ""}
                      </span>
                    ))
                  ) : <span className="text-[10px] text-slate-300 italic">Keahlian tidak terdata.</span>}
                </div>
              </div>
            </section>

            {/* CARD 3: DESKRIPSI */}
            <section className="bg-white rounded-[3rem] p-8 md:p-12 border-2 border-slate-100 shadow-sm space-y-10">
              <div className="space-y-4">
                <h2 className="text-[10px] font-black uppercase text-slate-400 border-b pb-2 flex items-center gap-2 italic"><Info size={14}/> Deskripsi Tugas</h2>
                <div className="text-slate-700 whitespace-pre-line leading-relaxed font-medium text-lg italic">
                  {job.description}
                </div>
              </div>
            </section>

            {/* CARD 4: AKSESIBILITAS (NO QUOTES, JUST BOLD) */}
            {job.accessibility_note && (
              <section className="bg-emerald-50/50 rounded-[3rem] p-8 md:p-12 border-2 border-emerald-100 space-y-6">
                <h2 className="text-[11px] font-black uppercase text-emerald-600 flex items-center gap-2 italic">
                  <Accessibility size={18}/> Budaya Inklusi & Aksesibilitas
                </h2>
                <div className="p-8 bg-white rounded-[2.5rem] border-2 border-emerald-100 shadow-inner">
                  <p className="text-emerald-900 leading-relaxed font-bold italic text-lg whitespace-pre-line">
                    <strong>{job.accessibility_note}</strong>
                  </p>
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-8 sticky top-10 font-black uppercase tracking-tighter">
            {/* Panel Lamaran */}
            <div className="bg-slate-900 text-white rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden text-center">
              <h3 className="text-[10px] text-blue-400 mb-8 border-b border-white/10 pb-4 italic tracking-widest">Panel Rekrutmen</h3>
              <div className="space-y-6">
                {hasApplied ? (
                  <div className="w-full py-6 bg-emerald-500/20 text-emerald-400 rounded-3xl text-xs border border-emerald-500/30 flex flex-col items-center gap-2 italic">
                    <CheckCircle size={32}/> SUDAH MELAMAR
                  </div>
                ) : (
                  <button onClick={() => alert("Gunakan tombol lamar di dashboard talenta.")} disabled={!job.is_active} className="w-full h-16 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 text-white rounded-2xl shadow-xl transition-all active:scale-95 text-[11px] tracking-[0.2em]">
                    KIRIM LAMARAN
                  </button>
                )}
                <p className="text-[8px] text-slate-500 leading-relaxed italic">Data riset dikelola secara anonim oleh BRIN.</p>
              </div>
            </div>

            {/* Akomodasi Sidebar */}
            <section className="bg-white rounded-[3rem] p-10 border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] space-y-6">
              <h3 className="text-sm font-black uppercase italic text-slate-900 flex items-center gap-2"><ShieldCheck className="text-blue-600" size={20}/> Akomodasi Tersedia</h3>
              <div className="space-y-3">
                {parseToArray(job.companies?.master_accommodations_provided).length > 0 ? (
                  parseToArray(job.companies.master_accommodations_provided).map((acc: string, idx: number, arr: any[]) => (
                    <div key={acc} className="flex items-start gap-3 text-[10px] text-slate-700">
                      <CheckCircle size={14} className="text-emerald-500 shrink-0 mt-0.5" /> 
                      <span>{acc}{idx < arr.length - 1 ? ", " : "."}</span>
                    </div>
                  ))
                ) : <p className="text-[10px] italic text-slate-400">Belum ada detail akomodasi fisik.</p>}
              </div>
            </section>
          </aside>

        </div>
      </div>
    </main>
  );
}
