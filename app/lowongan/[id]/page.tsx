"use client"

export const runtime = 'edge'

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { 
  MapPin, Briefcase, Building2, Calendar, ArrowLeft, 
  CheckCircle, ExternalLink, Send, ShieldCheck, Info 
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
    checkUser()
    getJobDetail()
  }, [])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    if (user) {
      const { data } = await supabase
        .from('applications')
        .select('id')
        .eq('job_id', params.id)
        .eq('applicant_id', user.id) // Diperbaiki dari profile_id ke applicant_id sesuai screenshot DB
        .single()
      if (data) setHasApplied(true)
    }
  }

  async function getJobDetail() {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select(`
          *,
          companies (
            id,
            name,
            industry,
            is_verified,
            master_accommodations_provided,
            vision_statement
          )
        `)
        .eq('id', params.id)
        .single()

      if (error) throw error
      setJob(data)
    } catch (error) {
      console.error("Job not found", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleApply() {
    if (!user) {
      router.push('/masuk')
      return
    }
    
    setApplying(true)
    const { error } = await supabase.from('applications').insert({
      job_id: params.id,
      applicant_id: user.id, // Diperbaiki dari profile_id ke applicant_id
      status: 'Review'
    })

    if (!error) {
      setHasApplied(true)
      alert("Lamaran Anda berhasil dikirim secara profesional.")
    } else {
      alert("Gagal mengirim lamaran: " + error.message)
    }
    setApplying(false)
  }

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-400 uppercase tracking-widest italic">Menyinkronkan Detail Lowongan...</div>
  
  if (!job) return (
    <div className="p-20 text-center space-y-4">
      <h2 className="text-2xl font-black uppercase italic tracking-tighter">Lowongan Tidak Tersedia</h2>
      <Link href="/lowongan" className="btn-primary px-8 py-3 inline-block">Kembali Cari Lowongan</Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 pt-10">
      <div className="container px-4 md:px-6 max-w-5xl mx-auto">
        
        <Link href="/lowongan" className="inline-flex items-center text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 mb-8 transition-all group">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Kembali ke Pencarian
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* KOLOM KIRI: DETAIL UTAMA */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header Card */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-10 border border-slate-200 shadow-xl shadow-slate-200/50">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
                    <Briefcase size={12}/> {job.work_mode || "Full-time"}
                  </div>
                  <h1 className="text-4xl font-black text-slate-900 dark:text-white leading-none tracking-tighter uppercase italic">{job.title}</h1>
                  <Link href={`/perusahaan/${job.companies?.id}`} className="flex items-center gap-2 text-lg font-bold text-blue-600 hover:underline">
                    <Building2 className="h-5 w-5" /> 
                    {job.companies?.name}
                    {job.companies?.is_verified && <CheckCircle className="h-5 w-5 text-blue-500" />}
                  </Link>

                  <div className="flex flex-wrap gap-4 pt-2">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-tight">
                      <MapPin className="h-4 w-4 text-red-500" /> {job.location}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-tight">
                      <Calendar className="h-4 w-4 text-blue-500" /> Diposting {new Date(job.created_at).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Deskripsi Area */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-10 border border-slate-200 shadow-sm">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-blue-600 mb-8 pb-4 border-b">Deskripsi & Kualifikasi</h2>
              <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed font-medium">
                {job.description}
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: SIDEBAR AKSI & INKLUSI */}
          <div className="space-y-6">
            
            {/* Action Card */}
            <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl sticky top-10 border border-white/5">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">Panel Lamaran</h3>
              <div className="space-y-4">
                {hasApplied ? (
                  <div className="w-full py-4 bg-green-500/20 border border-green-500/30 text-green-400 rounded-2xl font-black text-center uppercase tracking-widest text-xs flex items-center justify-center gap-2">
                    <CheckCircle size={18}/> Lamaran Terkirim
                  </div>
                ) : (
                  <button 
                    onClick={handleApply}
                    disabled={applying || !job.is_active}
                    className="w-full h-16 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
                  >
                    {applying ? "Memproses..." : <><Send size={20}/> Lamar Sekarang</>}
                  </button>
                )}
                <p className="text-[9px] text-center text-slate-400 font-medium leading-relaxed italic">
                  Data profil dan CV Anda akan otomatis disinkronkan ke sistem perusahaan ini.
                </p>
              </div>

              {/* Target Ragam */}
              <div className="mt-10 pt-8 border-t border-white/10 space-y-4">
                <h3 className="text-[9px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
                  <ShieldCheck size={14}/> Target Ragam Inklusi
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.target_disabilities?.map((tag: string) => (
                    <span key={tag} className="bg-white/5 border border-white/10 text-white text-[9px] font-black px-3 py-1.5 rounded-lg uppercase">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Company Access Card */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 shadow-sm space-y-6">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Building2 size={14} className="text-blue-600"/> Komitmen Akomodasi
              </h3>
              <div className="space-y-3">
                {job.companies?.master_accommodations_provided?.length > 0 ? (
                  job.companies.master_accommodations_provided.map((acc: string) => (
                    <div key={acc} className="flex items-center gap-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                      <CheckCircle size={16} className="text-green-500 shrink-0" /> {acc}
                    </div>
                  ))
                ) : (
                  <p className="text-xs italic text-slate-400">Menunggu verifikasi detail akomodasi.</p>
                )}
              </div>
              
              <Link href={`/perusahaan/${job.companies?.id}`} className="block w-full py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-[10px] font-black text-center uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100 dark:border-slate-700">
                Cek Profil Inklusivitas <ExternalLink size={12} className="inline ml-1" />
              </Link>
            </div>

            {/* Disclaimer Informed Consent */}
            <div className="px-6 flex gap-3">
                <Info size={16} className="text-slate-400 shrink-0"/>
                <p className="text-[8px] font-medium text-slate-400 leading-tight uppercase">
                    Seluruh proses rekrutmen dipantau oleh tim riset disabilitas.com demi menjamin pengalaman kerja yang inklusif.
                </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
