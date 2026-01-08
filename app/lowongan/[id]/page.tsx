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

  const TXT_LOADING = "Menyinkronkan Detail Lowongan Riset...";
  const TXT_NOT_FOUND = "Lowongan Tidak Ditemukan";
  const TXT_BACK = "Kembali ke Jelajah";
  const MSG_CONFIRM = "Dengan melamar, Anda setuju membagikan profil profesional Anda untuk kepentingan rekrutmen inklusif dan data riset BRIN.";
  const MSG_SUCCESS = "Lamaran terkirim. Status rekrutmen dapat dipantau di dashboard Anda.";
  const MSG_ERROR = "Terjadi kendala teknis saat mengirim lamaran.";

  useEffect(() => {
    async function init() {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      setUser(authUser)
      
      // Fetch Job by ID or SLUG (Sangat penting untuk fleksibilitas integrasi)
      try {
        const isUuid = params.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
        
        let query = supabase
          .from('jobs')
          .select(`*, companies (*)`)

        if (isUuid) {
          query = query.eq('id', params.id);
        } else {
          query = query.eq('slug', params.id);
        }

        const { data, error } = await query.single();
        if (error) throw error;
        setJob(data);

        // Cek apakah sudah pernah melamar
        if (authUser && data) {
          const { data: appData } = await supabase
            .from('applications')
            .select('id')
            .eq('job_id', data.id)
            .eq('applicant_id', authUser.id)
            .maybeSingle();
          if (appData) setHasApplied(true);
        }
      } catch (e) {
        console.error("Fetch Detail Error:", e);
      } finally {
        setLoading(false);
      }
    }
    init()
  }, [params.id])

  async function handleApply() {
    if (!user) {
      router.push('/masuk');
      return;
    }
    
    if (!confirm(MSG_CONFIRM)) return;

    setApplying(true);
    const { error } = await supabase.from('applications').insert({
      job_id: job.id,
      applicant_id: user.id,
      company_id: job.companies.id,
      status: 'Review'
    });

    if (!error) {
      setHasApplied(true);
      alert(MSG_SUCCESS);
    } else {
      alert(MSG_ERROR);
    }
    setApplying(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="font-black uppercase text-[10px] tracking-[0.3em] text-slate-400 italic">{TXT_LOADING}</p>
        </div>
      </div>
    )
  }
  if (!job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-6 bg-slate-50">
        <AlertCircle size={64} className="text-slate-200" />
        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">{TXT_NOT_FOUND}</h2>
        <Link href="/lowongan" className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl">
          {TXT_BACK}
        </Link>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-[#FDFDFD] pb-24 pt-10 font-sans">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Navigasi Balik */}
        <Link href="/lowongan" className="inline-flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-600 mb-10 transition-all group outline-none focus:ring-2 focus:ring-blue-600 rounded-lg p-1">
          <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-2 transition-transform" /> 
          {TXT_BACK}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          
          {/* KOLOM UTAMA: DETAIL LOWONGAN */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* CARD 1: RINGKASAN UTAMA */}
            <article className="bg-white rounded-[3rem] p-8 md:p-12 border-2 border-slate-100 shadow-sm relative overflow-hidden">
              <div className="relative z-10 space-y-6">
                <div className="flex flex-wrap gap-3">
                  <span className="bg-blue-50 text-blue-700 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100">
                    <Briefcase className="inline mr-1 mb-0.5" size={12}/> {job.job_type}
                  </span>
                  <span className="bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                    <Monitor className="inline mr-1 mb-0.5" size={12}/> {job.work_mode}
                  </span>
                </div>

                <div className="space-y-2">
                  <h1 className="text-4xl md:text-5xl font-black text-slate-900 leading-[0.9] tracking-tighter uppercase italic">
                    {job.title}
                  </h1>
                  <Link href={`/perusahaan/${job.companies?.id}`} className="inline-flex items-center gap-2 text-xl font-bold text-blue-600 hover:underline decoration-4 underline-offset-4 group">
                    <Building2 className="h-6 w-6 text-slate-900 group-hover:text-blue-600 transition-colors" /> 
                    {job.companies?.name}
                    {job.companies?.is_verified && <ShieldCheck className="h-5 w-5 text-blue-500 fill-blue-50" />}
                  </Link>
                </div>

                <div className="flex flex-wrap gap-8 pt-8 border-t-2 border-slate-50">
                  <div className="space-y-1">
                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest italic">Lokasi Kerja</p>
                    <span className="flex items-center gap-2 text-sm font-black uppercase text-slate-700">
                      <MapPin className="h-4 w-4 text-red-500" /> {job.location}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest italic">Estimasi Gaji</p>
                    <span className="flex items-center gap-2 text-sm font-black uppercase text-slate-900">
                      <DollarSign className="h-4 w-4 text-emerald-500" /> 
                      {job.salary_min > 0 ? `Rp ${(job.salary_min/1000000).toFixed(1)}jt - ${(job.salary_max/1000000).toFixed(1)}jt` : "Kompetitif"}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-widest italic">Tanggal Terbit</p>
                    <span className="flex items-center gap-2 text-sm font-black uppercase text-slate-700">
                      <Calendar className="h-4 w-4 text-blue-500" /> {new Date(job.created_at).toLocaleDateString("id-ID")}
                    </span>
                  </div>
                </div>
              </div>
            </article>

            {/* CARD 2: KRITERIA PENDIDIKAN & SKILL (DATA RISET) */}
            <section className="bg-white rounded-[3rem] p-8 md:p-12 border-2 border-slate-100 shadow-sm grid md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-blue-600 flex items-center gap-2">
                  <GraduationCap size={18}/> Pendidikan Minimal
                </h2>
                <div className="space-y-4">
                  <p className="text-2xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">{job.required_education_level}</p>
                  <div className="flex flex-wrap gap-2">
                    {job.required_education_major?.map((major: string) => (
                      <span key={major} className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase border border-blue-100">{major}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-6 border-t md:border-t-0 md:border-l-2 border-slate-50 pt-8 md:pt-0 md:pl-10">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 flex items-center gap-2">
                  <Tag size={18}/> Kompetensi Utama
                </h2>
                <div className="flex flex-wrap gap-2">
                  {job.required_skills?.map((skill: string) => (
                    <span key={skill} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md italic">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </section>

            {/* CARD 3: DESKRIPSI & SYARAT */}
            <section className="bg-white rounded-[3rem] p-8 md:p-12 border-2 border-slate-100 shadow-sm space-y-12">
              <div className="space-y-6">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 pb-4 border-b flex items-center gap-2 italic">
                  <Info size={16}/> Deskripsi Pekerjaan
                </h2>
                <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-line leading-relaxed font-medium text-lg">
                  {job.description}
                </div>
              </div>

              {job.requirements && (
                <div className="space-y-6 pt-6 border-t-2 border-slate-50 border-dashed">
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2 italic">
                    <ListChecks size={18}/> Kualifikasi Tambahan
                  </h2>
                  <div className="prose prose-slate max-w-none text-slate-600 whitespace-pre-line leading-relaxed font-medium italic">
                    {job.requirements}
                  </div>
                </div>
              )}
            </section>

            {/* CARD 4: CATATAN AKSESIBILITAS (CORE RISET) */}
            {job.accessibility_note && (
              <section className="bg-emerald-50/30 rounded-[3rem] p-8 md:p-12 border-2 border-emerald-100 shadow-sm space-y-6 animate-in fade-in duration-1000">
                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 flex items-center gap-2">
                  <Accessibility size={20}/> Budaya Inklusi & Aksesibilitas
                </h2>
                <div className="p-6 bg-white rounded-[2rem] border border-emerald-100 shadow-inner">
                  <p className="text-emerald-900 leading-relaxed font-bold italic text-lg whitespace-pre-line">
                    "{job.accessibility_note}"
                  </p>
                </div>
                <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                  * Informasi ini membantu talenta memahami dukungan lingkungan kerja sebelum melamar.
                </p>
              </section>
            )}
          </div>

          {/* KOLOM KANAN: PANEL AKSI & INFO PERUSAHAAN */}
          <aside className="space-y-8 sticky top-10">
            
            {/* Panel Lamaran */}
            <div className="bg-slate-900 text-white rounded-[3.5rem] p-10 shadow-2xl border border-white/5 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 opacity-10 rotate-12 pointer-events-none">
                <Briefcase size={150} />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-8 border-b border-white/10 pb-4 flex items-center gap-2">
                <Send size={14}/> Rekrutmen Panel
              </h3>
              
              <div className="space-y-6 relative z-10">
                {hasApplied ? (
                  <div className="w-full py-6 bg-emerald-500/20 border-2 border-emerald-500/30 text-emerald-400 rounded-3xl font-black text-center uppercase tracking-widest text-xs flex flex-col items-center gap-3">
                    <CheckCircle size={32}/> 
                    <span>Lamaran Sudah Terkirim</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <button 
                      onClick={handleApply}
                      disabled={applying || !job.is_active}
                      className="w-full h-20 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl transition-all active:scale-90 flex items-center justify-center gap-4 text-sm"
                    >
                      {applying ? "Memproses Data..." : <><Send size={24}/> Kirim Lamaran</>}
                    </button>
                    <p className="text-[8px] text-slate-400 uppercase leading-relaxed text-center font-bold italic">
                      Data profil Anda akan dibagikan kepada HRD dan digunakan secara anonim untuk riset ketenagakerjaan BRIN.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Akomodasi Perusahaan */}
            <section className="bg-white rounded-[3rem] p-10 border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] space-y-8">
              <h3 className="text-sm font-black uppercase tracking-tighter flex items-center gap-2 text-slate-900">
                <ShieldCheck className="text-blue-600" size={20}/> Dukungan Akomodasi
              </h3>
              <div className="space-y-4">
                {job.companies?.master_accommodations_provided?.length > 0 ? (
                  job.companies.master_accommodations_provided.map((acc: string) => (
                    <div key={acc} className="flex items-start gap-4 p-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50 shadow-sm transition-all hover:bg-emerald-50 hover:border-emerald-100">
                      <CheckCircle size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-[10px] font-black uppercase text-slate-700 leading-tight">{acc}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs italic text-slate-400 font-bold text-center py-4 uppercase">Instansi belum menginput detail akomodasi fisik.</p>
                )}
              </div>
              
              <Link href={`/perusahaan/${job.companies?.id}`} className="flex w-full py-5 bg-slate-900 text-white rounded-2xl text-[10px] font-black text-center uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-3">
                Lihat Profil Lengkap <ExternalLink size={14} />
              </Link>
            </section>

          </aside>
        </div>
      </div>
    </main>
  );
}
