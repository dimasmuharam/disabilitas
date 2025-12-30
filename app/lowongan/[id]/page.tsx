"use client"

export const runtime = 'edge'

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { 
  MapPin, Briefcase, Building2, Calendar, ArrowLeft, 
  CheckCircle, ExternalLink, Send, ShieldCheck, Info, Clock 
} from "lucide-react"
import { useRouter } from "next/navigation"

export default function JobDetailPage({ params }: { params: { id: string } }) {
  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  // Definisi teks riset mandiri (Bracing dipatuhi)
  const TXT_LOADING = "Menyinkronkan Detail Lowongan..."
  const TXT_NOT_FOUND = "Lowongan Tidak Tersedia"
  const TXT_BACK = "Kembali ke Pencarian"
  const MSG_CONFIRM = "Dengan melamar, Anda setuju membagikan profil profesional Anda demi kepentingan rekrutmen dan data riset inklusivitas."
  const MSG_SUCCESS = "Lamaran Anda berhasil terkirim. Data akan diproses untuk riset inklusivitas kerja."
  const MSG_ERROR = "Terjadi kendala saat mengirim lamaran."

  useEffect(() => {
    async function init() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      setUser(authUser)
      
      if (authUser) {
        const { data } = await supabase
          .from('applications')
          .select('id')
          .eq('job_id', params.id)
          .eq('applicant_id', authUser.id)
          .maybeSingle()
        if (data) setHasApplied(true)
      }

      try {
        const { data, error } = await supabase
          .from('jobs')
          .select(`*, companies (*)`)
          .eq('id', params.id)
          .single()
        if (error) throw error
        setJob(data)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [params.id])

  async function handleApply() {
    if (!user) {
      router.push('/masuk')
      return
    }
    
    if (!confirm(MSG_CONFIRM)) return

    setApplying(true)
    const { error } = await supabase.from('applications').insert({
      job_id: params.id,
      applicant_id: user.id,
      company_id: job.companies.id,
      status: 'Review'
    })

    if (!error) {
      setHasApplied(true)
      alert(MSG_SUCCESS)
    } else {
      alert(MSG_ERROR)
    }
    setApplying(false)
  }

  if (loading) {
    return (
      <div className="p-20 text-center font-black animate-pulse text-slate-400 uppercase tracking-widest italic">
        {TXT_LOADING}
      </div>
    )
  }
  
  if (!job) {
    return (
      <div className="p-20 text-center space-y-4">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter">{TXT_NOT_FOUND}</h2>
        <Link href="/lowongan" className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black uppercase text-[10px]">
          {"Kembali"}
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-10">
      <div className="container px-4 md:px-6 max-w-5xl mx-auto">
        
        <Link href="/lowongan" className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 mb-8 transition-all group">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
          {TXT_BACK}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-200 shadow-xl relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                  <Briefcase size={12}/> {job.work_mode || "Pekerjaan Tetap"}
                </div>
                <h1 className="text-4xl font-black text-slate-900 leading-none tracking-tighter uppercase italic">{job.title}</h1>
                <Link href={`/perusahaan/${job.companies?.id}`} className="flex items-center gap-2 text-lg font-bold text-blue-600 hover:underline">
                  <Building2 className="h-5 w-5" /> 
                  {job.companies?.name}
                  {job.companies?.is_verified && <ShieldCheck className="h-5 w-5 text-blue-500" />}
                </Link>
                <div className="flex flex-wrap gap-6 pt-4 border-t border-slate-50 mt-4">
                  <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <MapPin className="h-4 w-4 text-red-500" /> {job.location}
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <Calendar className="h-4 w-4 text-blue-500" /> {"Terbit: "}{new Date(job.created_at).toLocaleDateString("id-ID")}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 md:p-10 border border-slate-200 shadow-sm">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 mb-8 pb-4 border-b flex items-center gap-2">
                <Info size={16}/> {"Kualifikasi & Deskripsi"}
              </h2>
              <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-line leading-relaxed font-medium">
                {job.description}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl sticky top-10 border border-white/5">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">{"Panel Lamaran"}</h3>
              <div className="space-y-4">
                {hasApplied ? (
                  <div className="w-full py-5 bg-green-500/20 border border-green-500/30 text-green-400 rounded-2xl font-black text-center uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                    <CheckCircle size={18}/> {"Sudah Melamar"}
                  </div>
                ) : (
                  <button 
                    onClick={handleApply}
                    disabled={applying || !job.is_active}
                    className="w-full h-16 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    {applying ? "Memproses..." : <><Send size={20}/> {"Kirim Lamaran"}</>}
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Building2 size={14} className="text-blue-600"/> {"Akomodasi Instansi"}
              </h3>
              <div className="space-y-3">
                {job.companies?.master_accommodations_provided?.length > 0 ? (
                  job.companies.master_accommodations_provided.map((acc: string) => (
                    <div key={acc} className="flex items-center gap-3 text-xs font-bold text-slate-800">
                      <CheckCircle size={16} className="text-green-500 shrink-0" /> {acc}
                    </div>
                  ))
                ) : (
                  <p className="text-xs italic text-slate-400">{"Instansi belum mencantumkan detail."}</p>
                )}
              </div>
              <Link href={`/perusahaan/${job.companies?.id}`} className="block w-full py-4 bg-slate-50 rounded-2xl text-[10px] font-black text-center uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100 flex items-center justify-center gap-2">
                {"Profil Instansi"} <ExternalLink size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
