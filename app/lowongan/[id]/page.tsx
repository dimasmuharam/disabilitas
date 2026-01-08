"use client"

export const runtime = 'edge'

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { 
  MapPin, Briefcase, Building2, Calendar, ArrowLeft, 
  CheckCircle, ExternalLink, Send, ShieldCheck, Info, 
  Clock, DollarSign, Monitor, GraduationCap, Tag, 
  Accessibility, AlertCircle, ListChecks
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

  // FUNGSI KRUSIAL: Memastikan data dibaca sebagai Array
  const parseToArray = (fieldData: any) => {
    if (!fieldData) return [];
    if (Array.isArray(fieldData)) return fieldData;
    if (typeof fieldData === 'string') {
      // Jika data tersimpan sebagai string JSON "[...]"
      try {
        const parsed = JSON.parse(fieldData);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        // Jika data string biasa dengan koma "Skill A, Skill B"
        return fieldData.split(',').map(s => s.trim()).filter(s => s !== "");
      }
    }
    return [];
  };

  async function handleApply() {
    if (!user) { router.push('/masuk'); return; }
    if (!confirm("Kirim lamaran Anda?")) return;
    setApplying(true);
    const { error } = await supabase.from('applications').insert({
      job_id: job.id, applicant_id: user.id, company_id: job.companies?.id, status: 'Review'
    });
    if (!error) { setHasApplied(true); alert("Lamaran berhasil terkirim."); }
    setApplying(false);
  }

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-400 italic">MENYINKRONKAN...</div>;
  if (!job) return <div className="p-20 text-center font-black uppercase italic">Lowongan Tidak Tersedia</div>;
  return (
    <main className="min-h-screen bg-[#FDFDFD] pb-24 pt-10 font-sans text-left">
      <div className="max-w-6xl mx-auto px-6">
        
        <Link href="/lowongan" className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 mb-10 transition-all group">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1" /> KEMBALI
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          <div className="lg:col-span-2 space-y-8">
            {/* CARD IDENTITAS */}
            <article className="bg-white rounded-[3rem] p-8 md:p-12 border-2 border-slate-100 shadow-sm space-y-6">
              <div className="flex flex-wrap gap-3 font-black uppercase text-[10px]">
                <span className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-xl border border-blue-100 italic">{job.job_type}</span>
                <span className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-xl border border-emerald-100 italic">{job.work_mode}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-none tracking-tighter uppercase italic">{job.title}</h1>
              <Link href={`/perusahaan/${job.companies?.id}`} className="inline-flex items-center gap-2 text-xl font-bold text-blue-600 hover:underline group">
                <Building2 className="h-6 w-6 text-slate-900 group-hover:text-blue-600" /> 
                {job.companies?.name || "Instansi Mitra"}
              </Link>
              <div className="flex flex-wrap gap-8 pt-8 border-t-2 border-slate-50 font-black uppercase text-[10px] text-slate-400">
                <span className="flex items-center gap-2"><MapPin size={16} className="text-red-500" /> {job.location}</span>
                <span className="flex items-center gap-2"><DollarSign size={16} className="text-emerald-500" /> {job.salary_min > 0 ? `Rp ${(job.salary_min/1000000).toFixed(1)}jt - ${(job.salary_max/1000000).toFixed(1)}jt` : "Kompetitif"}</span>
              </div>
            </article>

            {/* CARD KOMPETENSI (Fix Skills) */}
            <section className="bg-white rounded-[3rem] p-8 md:p-12 border-2 border-slate-100 shadow-sm grid md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <h2 className="text-[10px] font-black uppercase text-blue-600 tracking-widest flex items-center gap-2 italic"><GraduationCap size={16}/> Pendidikan Minimal</h2>
                <p className="text-2xl font-black uppercase italic text-slate-900">{job.required_education_level}</p>
                <div className="flex flex-wrap gap-2">
                  {parseToArray(job.required_education_major).map((m: string) => (
                    <span key={m} className="px-2 py-1 bg-slate-50 text-[9px] font-black uppercase rounded border border-slate-100">{m}</span>
                  ))}
                </div>
              </div>
              
              <div className="space-y-4 border-t md:border-t-0 md:border-l-2 border-slate-50 pt-8 md:pt-0 md:pl-10">
                <h2 className="text-[10px] font-black uppercase text-emerald-600 tracking-widest flex items-center gap-2 italic"><Tag size={16}/> Skill Utama</h2>
                <div className="flex flex-wrap gap-2">
                  {/* Memproses kolom required_skills dengan parseToArray */}
                  {parseToArray(job.required_skills).length > 0 ? (
                    parseToArray(job.required_skills).map((skill: string) => (
                      <span key={skill} className="px-3 py-1 bg-slate-900 text-white text-[9px] font-black uppercase rounded-lg italic shadow-sm">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-slate-300 italic">Data skill tidak terbaca.</span>
                  )}
                </div>
              </div>
            </section>

            {/* CARD DESKRIPSI */}
            <section className="bg-white rounded-[3rem] p-8 md:p-12 border-2 border-slate-100 shadow-sm space-y-10">
              <div className="space-y-4">
                <h2 className="text-[10px] font-black uppercase text-slate-400 border-b pb-2 flex items-center gap-2 italic"><Info size={14}/> Deskripsi Pekerjaan</h2>
                <div className="text-slate-700 whitespace-pre-line leading-relaxed font-medium text-lg italic">{job.description}</div>
              </div>
              {job.requirements && (
                <div className="space-y-4 pt-6 border-t-2 border-slate-50 border-dashed">
                  <h2 className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2 italic"><ListChecks size={16}/> Syarat & Ketentuan</h2>
                  <div className="text-slate-600 whitespace-pre-line leading-relaxed font-medium italic">{job.requirements}</div>
                </div>
              )}
            </section>

            {/* CARD AKSESIBILITAS */}
            {job.accessibility_note && (
              <section className="bg-emerald-50/50 rounded-[3rem] p-8 md:p-12 border-2 border-emerald-100 space-y-4">
                <h2 className="text-[10px] font-black uppercase text-emerald-600 flex items-center gap-2 italic"><Accessibility size={18}/> Budaya Inklusi</h2>
                <div className="p-6 bg-white rounded-[2rem] border border-emerald-100 italic font-bold text-emerald-900 text-lg">
                  &ldquo;{job.accessibility_note}&rdquo;
                </div>
              </section>
            )}
          </div>

          <aside className="space-y-8 sticky top-10 font-black uppercase tracking-tighter">
            <div className="bg-slate-900 text-white rounded-[3.5rem] p-10 shadow-2xl">
              <h3 className="text-[10px] text-blue-400 mb-8 border-b border-white/10 pb-4">Panel Rekrutmen</h3>
              {hasApplied ? (
                <div className="w-full py-6 bg-emerald-500/20 text-emerald-400 rounded-3xl text-center text-xs flex flex-col items-center gap-2 italic">
                  <CheckCircle size={24}/> Sudah Melamar
                </div>
              ) : (
                <button onClick={handleApply} disabled={applying || !job.is_active} className="w-full h-16 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 text-white rounded-2xl transition-all active:scale-95 text-xs">
                  {applying ? "MEMPROSES..." : "KIRIM LAMARAN"}
                </button>
              )}
            </div>

            <section className="bg-white rounded-[3rem] p-10 border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] space-y-6">
              <h3 className="text-sm font-black uppercase italic text-slate-900 flex items-center gap-2"><ShieldCheck className="text-blue-600" size={20}/> Akomodasi Kantor</h3>
              <div className="space-y-3">
                {parseToArray(job.companies?.master_accommodations_provided).length > 0 ? (
                  parseToArray(job.companies.master_accommodations_provided).map((acc: string) => (
                    <div key={acc} className="flex items-start gap-3 text-[10px] text-slate-700">
                      <CheckCircle size={14} className="text-emerald-500 shrink-0" /> {acc}
                    </div>
                  ))
                ) : <p className="text-[10px] italic text-slate-400">Belum ada detail.</p>}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
