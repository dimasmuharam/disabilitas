"use client"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { INDONESIA_CITIES } from "@/lib/data-static"
import { INCLUSIVE_JOB_TEMPLATE } from "@/app/lowongan/create/template"
import { 
  Briefcase, 
  LayoutDashboard, 
  Plus, 
  Users, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  Edit3, 
  ShieldCheck, 
  FileText,
  ArrowRight,
  Send
} from "lucide-react"

export default function CompanyDashboard({ user }: { user: any }) {
  const [company, setCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview") 
  const [isPreview, setIsPreview] = useState(false)
  
  // State Form Perusahaan & Lowongan
  const [companyName, setCompanyName] = useState("")
  const [industry, setIndustry] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [jobDesc, setJobDesc] = useState("")
  const [jobLocation, setJobLocation] = useState("Jakarta Selatan")
  const [jobMsg, setJobMsg] = useState("")

  // State Fitur Audit
  const [auditLoading, setAuditLoading] = useState(false)
  const [auditRequested, setAuditRequested] = useState(false)

  const initialDescription = INCLUSIVE_JOB_TEMPLATE.sections
    .map(s => `${s.heading.toUpperCase()}\n${s.content}\n`)
    .join("\n")

  useEffect(() => {
    fetchCompany()
  }, [])

  useEffect(() => {
    if (activeTab === "post-job" && !jobDesc) {
      setJobDesc(initialDescription)
      setJobTitle(INCLUSIVE_JOB_TEMPLATE.title)
    }
  }, [activeTab])

  async function fetchCompany() {
    const { data } = await supabase.from('companies').select('*').eq('owner_id', user.id).single()
    if (data) {
      setCompany(data)
      setCompanyName(data.name)
    }
    setLoading(false)
  }

  async function postJob() {
    setJobMsg("")
    if(!company) return

    const { error } = await supabase.from('jobs').insert({
        company_id: company.id,
        title: jobTitle,
        description: jobDesc,
        location: jobLocation,
        is_active: true
    })

    if(error) {
        setJobMsg("Gagal memposting: " + error.message)
    } else {
        setJobMsg("Sukses! Lowongan inklusif berhasil diposting.")
        setTimeout(() => {
            setActiveTab("overview")
            setIsPreview(false)
            setJobTitle("")
            setJobDesc("")
            setJobMsg("")
        }, 2000)
    }
  }

  // FITUR BARU: Request Audit
  async function requestAudit() {
    setAuditLoading(true)
    // Logika pengiriman permintaan audit (bisa masuk ke tabel baru atau notifikasi admin)
    // Untuk saat ini kita simulasikan sukses
    setTimeout(() => {
      setAuditLoading(false)
      setAuditRequested(true)
    }, 1500)
  }

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium italic">Menyelaraskan data kepakaran...</div>

  if (!company) {
    return (
      <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-slate-50">
          <Briefcase className="text-blue-600" /> Profil Instansi/Perusahaan
        </h2>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div><label className="block text-sm font-bold mb-1">Nama Organisasi</label><input type="text" required value={companyName} onChange={e => setCompanyName(e.target.value)} className="input-std" /></div>
          <div><label className="block text-sm font-bold mb-1">Industri</label><input type="text" required value={industry} onChange={e => setIndustry(e.target.value)} className="input-std" /></div>
          <button type="submit" className="btn-primary w-full h-11">Daftarkan Sekarang</button>
        </form>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* HEADER PT */}
      <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold">{company.name}</h2>
            <p className="text-slate-400 text-sm italic">Mitra Inklusi Jadi Nyata</p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => setActiveTab("overview")} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'overview' ? 'bg-blue-600 shadow-lg' : 'bg-slate-800'}`}><LayoutDashboard className="h-4 w-4" /> Ikhtisar</button>
            <button onClick={() => {setActiveTab("post-job"); setIsPreview(false)}} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${activeTab === 'post-job' ? 'bg-blue-600 shadow-lg' : 'bg-slate-800'}`}><Plus className="h-4 w-4" /> Pasang Lowongan</button>
        </div>
      </div>

      {activeTab === "overview" && (
          <div className="space-y-8">
            {/* STATS */}
            <div className="grid gap-6 md:grid-cols-3">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-hover hover:border-blue-500">
                <Users className="h-8 w-8 text-blue-600 mb-4" />
                <h3 className="text-sm text-slate-500 font-bold uppercase">Pelamar</h3>
                <p className="text-3xl font-black">0</p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-hover hover:border-purple-500">
                <Briefcase className="h-8 w-8 text-purple-600 mb-4" />
                <h3 className="text-sm text-slate-500 font-bold uppercase">Lowongan</h3>
                <p className="text-3xl font-black">0</p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm transition-hover hover:border-orange-500">
                <ShieldCheck className="h-8 w-8 text-orange-600 mb-4" />
                <h3 className="text-sm text-slate-500 font-bold uppercase">Skor Inklusi</h3>
                <p className="text-lg font-black text-orange-600">PENDING</p>
              </div>
            </div>

            {/* SECTION AUDIT AKSESIBILITAS */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center gap-8 shadow-xl">
               <div className="bg-white/20 p-4 rounded-full border border-white/30">
                  <FileText className="h-12 w-12" />
               </div>
               <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Audit Aksesibilitas Digital</h3>
                  <p className="text-blue-100 text-sm leading-relaxed max-w-xl">
                    Pastikan website dan aplikasi perusahaan Anda dapat diakses dengan mudah oleh talenta disabilitas (Screen Reader Friendly). Dapatkan laporan audit berbasis riset WCAG 2.1 oleh tim pakar kami.
                  </p>
               </div>
               <div className="shrink-0 w-full md:w-auto">
                  {auditRequested ? (
                    <div className="bg-green-500/20 border border-green-400 p-3 rounded-lg flex items-center gap-2">
                       <CheckCircle2 className="h-5 w-5" /> 
                       <span className="font-bold">Permintaan Terkirim</span>
                    </div>
                  ) : (
                    <button 
                      onClick={requestAudit}
                      disabled={auditLoading}
                      className="w-full md:w-auto bg-white text-blue-600 px-8 py-3 rounded-xl font-black hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                    >
                      {auditLoading ? "Memproses..." : "Ajukan Audit"} <ArrowRight className="h-5 w-5" />
                    </button>
                  )}
               </div>
            </div>
          </div>
      )}

      {activeTab === "post-job" && (
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* SISI KIRI: INPUT FORM */}
            <div className={`bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm ${isPreview ? 'hidden lg:block opacity-40 pointer-events-none' : 'block'}`}>
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Edit3 className="h-5 w-5 text-blue-600" /> Draft Lowongan</h3>
                <div className="space-y-4">
                    <div><label className="text-xs font-black uppercase text-slate-500">Judul Posisi</label><input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="input-std mt-1" /></div>
                    <div><label className="text-xs font-black uppercase text-slate-500">Lokasi</label><input list="cities" value={jobLocation} onChange={e => setJobLocation(e.target.value)} className="input-std mt-1" /><datalist id="cities">{INDONESIA_CITIES.map(c => <option key={c} value={c}/>)}</datalist></div>
                    <div><label className="text-xs font-black uppercase text-slate-500">Deskripsi (Format Inklusif)</label><textarea value={jobDesc} onChange={e => setJobDesc(e.target.value)} className="input-std mt-1 min-h-[400px] font-mono text-sm leading-relaxed" /></div>
                    <button onClick={() => setIsPreview(true)} className="w-full h-12 bg-slate-900 text-white rounded-lg font-black flex items-center justify-center gap-2 hover:bg-slate-800 transition-all uppercase tracking-wider"><Eye className="h-5 w-5" /> Lihat Simulasi Tampilan</button>
                </div>
            </div>

            {/* SISI KANAN: PREVIEW AKSESIBEL */}
            <div className={`bg-white dark:bg-slate-900 p-6 rounded-xl border-2 border-blue-600 shadow-2xl min-h-[600px] ${!isPreview ? 'hidden lg:flex flex-col items-center justify-center text-slate-400 italic opacity-20' : 'block animate-in fade-in slide-in-from-right-4'}`}>
                {!isPreview ? (
                    <>
                        <ShieldCheck className="h-16 w-16 mb-4" />
                        <p className="font-bold uppercase tracking-widest text-xs">Awaiting Preview Simulation</p>
                    </>
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b pb-4">
                            <h3 className="text-lg font-black text-blue-600 flex items-center gap-2"><ShieldCheck className="h-5 w-5" /> PREVIEW TAMPILAN</h3>
                            <button onClick={() => setIsPreview(false)} className="text-xs font-black bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded uppercase hover:bg-slate-200">Batal / Edit</button>
                        </div>
                        
                        <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200">
                            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50">{jobTitle}</h1>
                            <div className="flex gap-4 text-xs font-black text-slate-500 uppercase">
                                <span>📍 {jobLocation}</span>
                                <span>🏢 {company.name}</span>
                            </div>
                            <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed font-sans border-t pt-4 text-sm">
                                {jobDesc}
                            </div>
                        </div>

                        {/* ANALISIS INKLUSI OTOMATIS */}
                        <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
                            <h4 className="text-[10px] font-black text-blue-700 uppercase mb-3 tracking-widest flex items-center gap-2">
                               <ShieldCheck className="h-3 w-3" /> Audit Inklusi Instan
                            </h4>
                            <ul className="space-y-2">
                                <li className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                                    <CheckCircle2 className={`h-4 w-4 ${jobDesc.toLowerCase().includes('akomodasi') ? 'text-green-600' : 'text-slate-300'}`} /> 
                                    Informasi Akomodasi Tersedia
                                </li>
                                <li className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                                    <CheckCircle2 className={`h-4 w-4 ${jobDesc.length > 300 ? 'text-green-600' : 'text-slate-300'}`} /> 
                                    Kedalaman Deskripsi (Riset)
                                </li>
                            </ul>
                        </div>

                        <button 
                           onClick={postJob} 
                           className="w-full h-14 bg-blue-600 text-white rounded-xl font-black text-lg shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
                        >
                            <Send className="h-5 w-5" /> TAYANGKAN SEKARANG
                        </button>
                        {jobMsg && <p className="text-center text-green-600 font-black animate-bounce mt-4 uppercase text-sm tracking-tighter">{jobMsg}</p>}
                    </div>
                )}
            </div>
          </div>
      )}
    </div>
  )
}
