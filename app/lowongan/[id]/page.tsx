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
  const [msg, setMsg] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
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
          const { data: appData } = await supabase.from('applications')
            .select('id')
            .eq('job_id', data.id)
            .eq('applicant_id', authUser.id)
            .maybeSingle()
          
          if (appData) setHasApplied(true)
        }
      } catch (e) { 
        console.error("Fetch Detail Error:", e) 
      } finally { 
        setLoading(false) 
      }
    }
    init()
  }, [params.id])

  // FUNGSI UTAMA MELAMAR (Updated with company_id sync)
  const handleApply = async () => {
    if (!user) {
      router.push("/masuk")
      return
    }

    setApplying(true)
    try {
      const { error } = await supabase
        .from("applications")
        .insert([
          {
            job_id: job.id,
            applicant_id: user.id,
            company_id: job.company_id, // POINT KRUSIAL: Menghubungkan lamaran langsung ke perusahaan
            status: "applied"
          }
        ])

      if (error) throw error

      setIsSuccess(true)
      setMsg("Lamaran berhasil terkirim. Mengarahkan Anda kembali ke dashboard dalam 3 detik.")
      setHasApplied(true)

      setTimeout(() => {
        router.push("/dashboard?applied=true")
      }, 3500)

    } catch (error: any) {
      console.error("Apply Error:", error)
      alert("Gagal mengirim lamaran: " + error.message)
    } finally {
      setApplying(false)
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Segera";
    return new Date(dateStr).toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const parseToArray = (fieldData: any) => {
    if (!fieldData) return [];
    if (Array.isArray(fieldData)) return fieldData;
    if (typeof fieldData === 'string') {
      try {
        const parsed = JSON.parse(fieldData);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        return fieldData.split(',').map((s: string) => s.trim()).filter((s: string) => s !== "");
      }
    }
    return [];
  };

  if (loading) return <div className="animate-pulse p-20 text-center font-black uppercase italic tracking-widest text-slate-400">Menyinkronkan Detail...</div>;
  if (!job) return <div className="rounded-[3rem] border-2 border-dashed border-slate-100 p-20 text-center font-black uppercase italic tracking-widest text-slate-300">Data Lowongan Tidak Ditemukan</div>;

  const seoTitle = `Lowongan Inklusif ${job.title} di ${job.companies?.name || 'Instansi Mitra'} - Batas: ${formatDate(job.expires_at)}`;

  return (
    <main className="min-h-screen bg-[#FDFDFD] pb-24 pt-10 text-left font-sans selection:bg-blue-100 selection:text-blue-900">
      
      <title>{seoTitle}</title>
      <link rel="canonical" href={`https://disabilitas.com/lowongan/${job.slug}`} />
      <meta name="description" content={`Lamar posisi ${job.title} di ${job.companies?.name}. Pekerjaan inklusif dengan dukungan akomodasi: ${parseToArray(job.preferred_disability_tools).join(", ")}.`} />

      <div className="mx-auto max-w-6xl px-6">
        
        <Link href="/lowongan" className="group mb-10 inline-flex items-center rounded-lg text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 outline-none transition-all hover:text-blue-600 focus:ring-2 focus:ring-blue-600">
          <ArrowLeft className="mr-2 size-4 group-hover:-translate-x-1" /> KEMBALI KE PENCARIAN
        </Link>

        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-3">
          
          <div className="space-y-8 lg:col-span-2">
            <article className="space-y-6 rounded-[3rem] border-2 border-slate-100 bg-white p-8 shadow-sm md:p-12">
              <div className="flex flex-wrap gap-3 text-[10px] font-black uppercase">
                <span className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-1.5 italic text-blue-700">{job.job_type}</span>
                <span className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-1.5 italic text-emerald-700">{job.work_mode}</span>
              </div>
              <h1 className="text-4xl font-black uppercase italic leading-none tracking-tighter text-slate-900 md:text-5xl">{job.title}</h1>
              <Link href={`/perusahaan/${job.companies?.id}`} className="group inline-flex items-center gap-2 text-xl font-bold text-blue-600 decoration-4 underline-offset-4 hover:underline">
                <Building2 className="size-6 text-slate-900 transition-colors group-hover:text-blue-600" /> {job.companies?.name}
              </Link>
              <div className="flex flex-wrap gap-8 border-t-2 border-slate-50 pt-8 text-[10px] font-black uppercase italic text-slate-400">
                <span className="flex items-center gap-2"><MapPin size={16} className="text-red-500" /> {job.location}</span>
                <span className="flex items-center gap-2"><DollarSign size={16} className="text-emerald-500" /> {job.salary_min > 0 ? `Rp ${(job.salary_min/1000000).toFixed(1)}jt - ${(job.salary_max/1000000).toFixed(1)}jt` : "Kompetitif"}</span>
                <span className="flex items-center gap-2"><Clock size={16} className="text-orange-500" /> Tutup: {formatDate(job.expires_at)}</span>
              </div>
            </article>

            <section className="grid gap-10 rounded-[3rem] border-2 border-slate-100 bg-white p-8 shadow-sm md:grid-cols-2 md:p-12">
              <div className="space-y-6">
                <h2 className="flex items-center gap-2 text-[10px] font-black uppercase italic tracking-widest text-blue-600"><GraduationCap size={16}/> Pendidikan Minimal</h2>
                <div className="space-y-2">
                   <p className="text-2xl font-black uppercase italic text-slate-900">{job.required_education_level}</p>
                   <div className="flex flex-wrap gap-x-2 text-[9px] font-black uppercase italic text-blue-500/70">
                     {parseToArray(job.required_education_major).map((m: string, idx: number, arr: any[]) => (
                       <span key={m}>{m}{idx < arr.length - 1 ? ", " : "."}</span>
                     ))}
                   </div>
                </div>
              </div>
              
              <div className="space-y-6 border-t border-slate-50 pt-8 text-left md:border-l-2 md:border-t-0 md:pl-10 md:pt-0">
                <h2 className="flex items-center gap-2 text-[10px] font-black uppercase italic tracking-widest text-emerald-600"><Tag size={16}/> Skill Utama</h2>
                <div className="flex flex-wrap gap-2">
                  {parseToArray(job.required_skills).length > 0 ? (
                    parseToArray(job.required_skills).map((skill: string, idx: number, arr: any[]) => (
                      <span key={skill} className="rounded-lg bg-slate-900 px-3 py-1 text-[9px] font-black uppercase italic text-white shadow-sm">
                        {skill}{idx < arr.length - 1 ? ", " : "."}
                      </span>
                    ))
                  ) : <span className="text-[10px] italic text-slate-300">Data skill tidak tersedia.</span>}
                </div>
              </div>
            </section>

            <section className="space-y-10 rounded-[3rem] border-2 border-slate-100 bg-white p-8 text-left shadow-sm md:p-12">
              <div className="space-y-4">
                <h2 className="flex items-center gap-2 border-b pb-2 text-[10px] font-black uppercase italic text-slate-400"><Info size={14}/> Deskripsi Pekerjaan</h2>
                <div className="whitespace-pre-line text-lg font-medium italic leading-relaxed text-slate-700">{job.description}</div>
              </div>

              {job.accessibility_note && (
                <div className="space-y-4 border-t-2 border-dashed border-slate-50 pt-8">
                  <h2 className="flex items-center gap-2 text-[11px] font-black uppercase italic text-emerald-600">
                    <Accessibility size={18}/> Budaya Inklusi & Aksesibilitas
                  </h2>
                  <div className="rounded-[2.5rem] border-2 border-emerald-100 bg-emerald-50/30 p-8 shadow-inner">
                    <p className="whitespace-pre-line text-lg font-bold italic leading-relaxed text-emerald-900">
                      <strong>{job.accessibility_note}</strong>
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>

          <aside className="sticky top-10 space-y-8 font-black uppercase tracking-tighter">
            <div className="relative overflow-hidden rounded-[3.5rem] bg-slate-900 p-10 text-white shadow-2xl">
              <h3 className="mb-8 flex items-center gap-2 border-b border-white/10 pb-4 text-[10px] italic tracking-widest text-blue-400"><Send size={14}/> Rekrutmen Panel</h3>
              <div className="relative z-10 space-y-4">
                
                {isSuccess && (
                  <div className="rounded-[2rem] border border-emerald-500/30 bg-emerald-500/10 p-6 text-[10px] font-black italic text-emerald-400 animate-in zoom-in-95">
                    <strong>{msg}</strong>
                  </div>
                )}

                {hasApplied ? (
                  <div className="flex w-full flex-col items-center gap-3 rounded-3xl border border-emerald-500/30 bg-emerald-500/20 py-6 text-center text-xs italic text-emerald-400">
                    <CheckCircle size={32}/> SUDAH MELAMAR
                  </div>
                ) : (
                  <button 
                    onClick={handleApply} 
                    disabled={applying || isSuccess}
                    className="flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 text-xs tracking-[0.2em] text-white shadow-xl transition-all hover:bg-blue-700 active:scale-95 disabled:bg-slate-800"
                  >
                    {applying ? "MEMPROSES DATA..." : isSuccess ? "BERHASIL TERKIRIM" : "KIRIM LAMARAN"}
                    {!applying && !isSuccess && <Send size={16} />}
                  </button>
                )}
                <p className="text-center text-[8px] italic leading-relaxed text-slate-500">
                  Data profil Anda akan otomatis dilampirkan ke dalam lamaran ini.
                </p>
              </div>
            </div>

            <section className="space-y-6 rounded-[3rem] border-2 border-slate-900 bg-white p-10 text-left shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
              <h3 className="flex items-center gap-2 text-sm font-black uppercase italic text-slate-900"><ShieldCheck className="text-blue-600" size={20}/> Akomodasi Kantor</h3>
              <div className="space-y-3">
                {parseToArray(job.companies?.master_accommodations_provided).length > 0 ? (
                  parseToArray(job.companies.master_accommodations_provided).map((acc: string, idx: number, arr: any[]) => (
                    <div key={acc} className="flex items-start gap-3 text-[10px] text-slate-700">
                      <CheckCircle size={14} className="mt-0.5 shrink-0 text-emerald-500" /> 
                      <span>{acc}{idx < arr.length - 1 ? ", " : "."}</span>
                    </div>
                  ))
                ) : <p className="text-[10px] italic text-slate-400">Rincian akomodasi fisik belum tersedia.</p>}
              </div>
            </section>
          </aside>

        </div>
      </div>
    </main>
  );
}
