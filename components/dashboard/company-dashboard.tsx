"use client"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { INDONESIA_CITIES } from "@/lib/data-static"
import { INCLUSIVE_JOB_TEMPLATE } from "@/app/lowongan/create/template"
import { 
  Briefcase, LayoutDashboard, Plus, Users, CheckCircle2, 
  AlertCircle, Eye, Edit3, ShieldCheck, FileText,
  ArrowRight, Send, MapPin, Globe
} from "lucide-react"

// Konstanta terstruktur untuk data riset
const DISABILITY_TYPES = ["Netra", "Rungu/Tuli", "Daksa", "Intelektual", "Mental", "Sensorik Lainnya"]
const WORK_MODES = ["WFO (Di Kantor)", "Remote (WFH)", "Hybrid"]

export default function CompanyDashboard({ user }: { user: any }) {
  const [company, setCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview") 
  const [isPreview, setIsPreview] = useState(false)
  
  // State Form Lowongan
  const [jobTitle, setJobTitle] = useState("")
  const [jobDesc, setJobDesc] = useState("")
  const [jobLocation, setJobLocation] = useState("Jakarta Selatan")
  const [jobWorkMode, setJobWorkMode] = useState("WFO (Di Kantor)")
  const [targetDisabilities, setTargetDisabilities] = useState<string[]>([])
  const [jobMsg, setJobMsg] = useState("")

  // State Form Perusahaan & Audit
  const [companyName, setCompanyName] = useState("")
  const [industry, setIndustry] = useState("")
  const [auditRequested, setAuditRequested] = useState(false)
  const [auditLoading, setAuditLoading] = useState(false)

  const initialDescription = INCLUSIVE_JOB_TEMPLATE.sections
    .map(s => `${s.heading.toUpperCase()}\n${s.content}\n`)
    .join("\n")

  useEffect(() => {
    fetchCompany()
  }, [])

  // Sinkronisasi Template
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

  // Fungsi Pendaftaran PT Terintegrasi
  async function handleCreateCompany(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { data, error } = await supabase
      .from('companies')
      .insert({ owner_id: user.id, name: companyName, industry })
      .select()
      .single()
    
    if (data) {
      setCompany(data)
    } else if (error) {
      alert("Gagal mendaftarkan instansi: " + error.message)
    }
    setLoading(false)
  }

  const toggleDisability = (type: string) => {
    setTargetDisabilities(prev => 
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    )
  }

  async function postJob() {
    setJobMsg("")
    if(!company) return

    const { error } = await supabase.from('jobs').insert({
        company_id: company.id,
        title: jobTitle,
        description: jobDesc,
        location: jobLocation,
        work_mode: jobWorkMode,
        target_disabilities: targetDisabilities,
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
            setTargetDisabilities([])
            setJobMsg("")
        }, 2000)
    }
  }

  async function requestAudit() {
    setAuditLoading(true)
    // Simulasi integrasi permintaan audit ke sistem riset
    setTimeout(() => {
      setAuditLoading(false)
      setAuditRequested(true)
    }, 1500)
  }

  if (loading) return <div className="p-8 text-center text-slate-500 font-medium italic">Sinkronisasi data riset...</div>

  // UI Pendaftaran PT (Jika data belum ada)
  if (!company) {
    return (
      <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-slate-50">
          <Briefcase className="text-blue-600" /> Profil Instansi/Organisasi
        </h2>
        <p className="text-sm text-slate-500 mb-6 font-medium">Lengkapi identitas organisasi Anda untuk memulai integrasi data rekrutmen inklusif.</p>
        <form onSubmit={handleCreateCompany} className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-1 uppercase tracking-tighter text-slate-600 dark:text-slate-400">Nama Organisasi</label>
            <input type="text" required value={companyName} onChange={e => setCompanyName(e.target.value)} className="input-std" placeholder="Contoh: PT. Inklusi Digital Indonesia" />
          </div>
          <div>
            <label className="block text-sm font-bold mb-1 uppercase tracking-tighter text-slate-600 dark:text-slate-400">Bidang Industri</label>
            <input type="text" required value={industry} onChange={e => setIndustry(e.target.value)} className="input-std" placeholder="Contoh: Teknologi Informasi / Pendidikan" />
          </div>
          <button type="submit" className="btn-primary w-full h-12 text-lg font-black uppercase tracking-widest">Daftarkan Sekarang</button>
        </form>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* HEADER INTEGRASI */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h2 className="text-2xl font-black tracking-tight">{company.name}</h2>
            <p className="text-blue-400 text-sm flex items-center gap-2 italic font-bold">
               <ShieldCheck className="h-4 w-4" /> Partner Riset Disabilitas.com
            </p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => setActiveTab("overview")} className={`px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2 transition-all ${activeTab === 'overview' ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-slate-800'}`}><LayoutDashboard className="h-4 w-4" /> Ikhtisar</button>
            <button onClick={() => {setActiveTab("post-job"); setIsPreview(false)}} className={`px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2 transition-all ${activeTab === 'post-job' ? 'bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.5)]' : 'bg-slate-800'}`}><Plus className="h-4 w-4" /> Pasang Lowongan</button>
        </div>
      </div>

      {activeTab === "overview" && (
          <div className="space-y-8">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"><Users className="h-8 w-8 text-blue-600 mb-4" /><h3 className="text-xs text-slate-500 font-black uppercase tracking-widest">Pelamar</h3><p className="text-3xl font-black">0</p></div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"><Briefcase className="h-8 w-8 text-purple-600 mb-4" /><h3 className="text-xs text-slate-500 font-black uppercase tracking-widest">Lowongan</h3><p className="text-3xl font-black">0</p></div>
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm"><ShieldCheck className="h-8 w-8 text-orange-600 mb-4" /><h3 className="text-xs text-slate-500 font-black uppercase tracking-widest">Skor Audit</h3><p className="text-lg font-black text-orange-600 uppercase">Pending</p></div>
            </div>

            {/* BANNER LAYANAN AUDIT - INTEGRASI RISET */}
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-8 text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden">
               <div className="absolute right-0 bottom-0 opacity-10"><FileText size={200} /></div>
               <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-sm border border-white/20"><FileText className="h-10 w-10 text-white" /></div>
               <div className="flex-1 text-center md:text-left z-10">
                  <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter italic">Layanan Audit Aksesibilitas</h3>
                  <p className="text-blue-100 text-sm leading-relaxed max-w-xl font-medium">
                    Tingkatkan standar inklusivitas digital Anda. Tim pakar kami akan mengaudit aset digital Anda berdasarkan standar WCAG 2.1 untuk memastikan keramahan bagi pengguna disabilitas.
                  </p>
               </div>
               <div className="z-10 w-full md:w-auto">
                  {auditRequested ? (
                    <div className="bg-green-500/30 border border-green-400 px-6 py-3 rounded-2xl flex items-center gap-2 font-bold"><CheckCircle2 className="h-5 w-5" /> Permintaan Terkirim</div>
                  ) : (
                    <button onClick={requestAudit} disabled={auditLoading} className="w-full md:w-auto bg-white text-indigo-700 px-8 py-4 rounded-2xl font-black hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow-lg">{auditLoading ? "Mengirim..." : "Ajukan Audit"} <ArrowRight className="h-5 w-5" /></button>
                  )}
               </div>
            </div>
          </div>
      )}

      {activeTab === "post-job" && (
          <div className="grid lg:grid-cols-5 gap-8 items-start">
            <div className={`lg:col-span-3 bg-white dark:bg-slate-900 p-6 md:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm ${isPreview ? 'hidden lg:block opacity-30 pointer-events-none' : 'block'}`}>
                <h3 className="text-xl font-black mb-8 flex items-center gap-2 text-slate-900 dark:text-slate-100 uppercase tracking-tighter"><Edit3 className="h-5 w-5 text-blue-600" /> Detail Lowongan</h3>
                <div className="space-y-6">
                    <div className="space-y-2"><label className="text-xs font-black uppercase text-slate-500 tracking-widest">Judul Posisi</label><input type="text" value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="input-std text-lg font-bold" /></div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2"><label className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-1"><MapPin className="h-3 w-3" /> Lokasi</label><select value={jobLocation} onChange={e => setJobLocation(e.target.value)} className="input-std">{INDONESIA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                        <div className="space-y-2"><label className="text-xs font-black uppercase text-slate-500 tracking-widest flex items-center gap-1"><Globe className="h-3 w-3" /> Mode Kerja</label><select value={jobWorkMode} onChange={e => setJobWorkMode(e.target.value)} className="input-std">{WORK_MODES.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
                    </div>
                    <div className="space-y-3 p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <label className="text-[11px] font-black uppercase text-blue-600 tracking-widest">Target Ragam Disabilitas (Data Riset)</label>
                        <div className="flex flex-wrap gap-2">{DISABILITY_TYPES.map(type => (<button key={type} type="button" onClick={() => toggleDisability(type)} className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${targetDisabilities.includes(type) ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white text-slate-500 border-slate-200 hover:border-blue-400'}`}>{type}</button>))}</div>
                    </div>
                    <div className="space-y-2"><label className="text-xs font-black uppercase text-slate-500 tracking-widest">Deskripsi (Format Inklusif)</label><textarea value={jobDesc} onChange={e => setJobDesc(e.target.value)} className="input-std min-h-[300px] font-mono text-sm leading-relaxed" /></div>
                    <button onClick={() => setIsPreview(true)} className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-slate-800 transition-all uppercase tracking-widest shadow-xl"><Eye className="h-5 w-5" /> Simulasi Preview</button>
                </div>
            </div>

            <div className={`lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-blue-600 shadow-2xl sticky top-6 ${!isPreview ? 'hidden lg:flex flex-col items-center justify-center text-slate-400 opacity-20' : 'block animate-in slide-in-from-right-4'}`}>
                {!isPreview ? (<div className="text-center p-8"><ShieldCheck className="h-16 w-16 mx-auto mb-4" /><p className="text-xs font-black uppercase tracking-widest">Awaiting Simulation</p></div>) : (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b pb-4"><h3 className="text-sm font-black text-blue-600 uppercase tracking-widest">Preview Pelamar</h3><button onClick={() => setIsPreview(false)} className="text-[10px] font-black bg-slate-100 px-3 py-2 rounded-lg uppercase">Edit Draft</button></div>
                        <div className="p-5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200">
                            <h1 className="text-2xl font-black mb-1 leading-tight">{jobTitle}</h1>
                            <p className="text-[10px] font-bold text-blue-600 uppercase mb-4 tracking-tighter">{jobWorkMode} • {jobLocation}</p>
                            <div className="flex flex-wrap gap-1 mb-6">{targetDisabilities.length > 0 ? targetDisabilities.map(t => <span key={t} className="text-[9px] bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-black uppercase">#{t}</span>) : <span className="text-[9px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">Harap pilih ragam disabilitas</span>}</div>
                            <div className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed border-t pt-4 font-sans">{jobDesc}</div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/30 p-5 rounded-2xl border border-blue-100 dark:border-blue-800">
                            <h4 className="text-[10px] font-black text-blue-700 uppercase mb-3 flex items-center gap-2 tracking-widest">Audit Inklusi Instan</h4>
                            <ul className="space-y-3">
                                <li className="flex items-center gap-3 text-xs font-bold"><CheckCircle2 className={`h-4 w-4 ${jobDesc.toLowerCase().includes('akomodasi') ? 'text-green-600' : 'text-slate-300'}`} /> Status Akomodasi</li>
                                <li className="flex items-center gap-3 text-xs font-bold"><CheckCircle2 className={`h-4 w-4 ${targetDisabilities.length > 0 ? 'text-green-600' : 'text-slate-300'}`} /> Target Ragam Terstruktur</li>
                            </ul>
                        </div>
                        <button onClick={postJob} className="w-full h-16 bg-blue-600 text-white rounded-2xl font-black text-xl shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 uppercase tracking-tighter"><Send className="h-6 w-6" /> Publikasikan</button>
                        {jobMsg && <p className="text-center text-green-600 font-black animate-bounce mt-4 text-xs uppercase">{jobMsg}</p>}
                    </div>
                )}
            </div>
          </div>
      )}
    </div>
  )
}
