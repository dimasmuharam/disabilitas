"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
// SINKRONISASI DATA STATIC
import { 
  INDONESIA_CITIES, 
  DISABILITY_TYPES, 
  WORK_MODES, 
  ACCOMMODATION_TYPES 
} from "@/lib/data-static"
// SINKRONISASI ACTIONS
import { updateCompanyMaster, getCompanyStats } from "@/lib/actions/company"
import { 
  Briefcase, LayoutDashboard, Plus, Users, CheckCircle2, 
  Eye, Edit3, ShieldCheck, FileText, ArrowRight, Send, 
  MapPin, Globe, Building2, Star, Info, Settings, Save, Trash2, Wifi, Laptop
} from "lucide-react"

export default function CompanyDashboard({ user }: { user: any }) {
  const [company, setCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview") 
  const [isPreview, setIsPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")
  const msgRef = useRef<HTMLDivElement>(null)
  
  // -- STATE MASTER PROFIL PERUSAHAAN (SINKRON KE ACTION & DB) --
  const [companyName, setCompanyName] = useState("")
  const [industry, setIndustry] = useState("")
  const [description, setDescription] = useState("")
  const [vision, setVision] = useState("")
  const [location, setLocation] = useState("") // Lokasi Kantor Pusat
  const [totalDisabilityEmp, setTotalDisabilityEmp] = useState(0)
  const [masterAcomodations, setMasterAcomodations] = useState<string[]>([])

  // -- STATE FORM LOWONGAN --
  const [jobTitle, setJobTitle] = useState("")
  const [jobDesc, setJobDesc] = useState("")
  const [jobLocation, setJobLocation] = useState("Jakarta Selatan")
  const [jobWorkMode, setJobWorkMode] = useState(WORK_MODES[0])
  const [targetDisabilities, setTargetDisabilities] = useState<string[]>([])
  
  // -- STATE DATA STATISTIK & RATING --
  const [stats, setStats] = useState({ applicants: 0, jobs: 0 })
  const [ratings, setRatings] = useState({
    avg: 0, accessibility: 0, culture: 0, management: 0, onboarding: 0
  })

  useEffect(() => {
    fetchInitialData()
  }, [])

  async function fetchInitialData() {
    try {
      const { data: comp } = await supabase.from('companies').select('*').eq('owner_id', user.id).single()
      if (comp) {
        setCompany(comp)
        setCompanyName(comp.name || ""); setIndustry(comp.industry || "")
        setDescription(comp.description || ""); setVision(comp.vision_statement || "")
        setLocation(comp.location || ""); setTotalDisabilityEmp(comp.total_employees_with_disability || 0)
        setMasterAcomodations(comp.master_accommodations_provided || [])

        // Menggunakan getCompanyStats dari lib/actions/company.ts
        const statsData = await getCompanyStats(comp.id)
        setStats({ jobs: statsData.jobCount, applicants: statsData.applicantCount })

        // Fetch Ratings (Aggregate)
        const { data: rData } = await supabase.from('inclusion_ratings').select('*').eq('company_id', comp.id)
        if (rData && rData.length > 0) {
            const avg = (key: string) => rData.reduce((a, b) => a + b[key], 0) / rData.length
            setRatings({
                avg: (avg('score_accessibility') + avg('score_culture') + avg('score_management') + avg('score_onboarding')) / 4,
                accessibility: avg('score_accessibility'),
                culture: avg('score_culture'),
                management: avg('score_management'),
                onboarding: avg('score_onboarding')
            })
        }
      }
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  // INTEGRASI DENGAN lib/actions/company.ts
  async function handleUpdateMasterProfile() {
    setSaving(true)
    const result = await updateCompanyMaster(user.id, {
        name: companyName,
        industry: industry,
        description: description,
        vision: vision,
        location: location,
        totalDisabilityEmp: totalDisabilityEmp,
        masterAcomodations: masterAcomodations
    })
    if (!result.error) {
        setMsg("Profil Inklusi Perusahaan Berhasil Diperbarui")
        fetchInitialData()
        setTimeout(() => msgRef.current?.focus(), 100)
    }
    setSaving(false)
  }

  async function handlePostJob() {
    setSaving(true)
    const { error } = await supabase.from('jobs').insert({
        company_id: company.id,
        title: jobTitle,
        description: jobDesc,
        location: jobLocation,
        work_mode: jobWorkMode,
        target_disabilities: targetDisabilities,
        is_active: true
    })
    if (!error) {
        setMsg("Lowongan Kerja Berhasil Dipublikasikan!")
        setActiveTab("overview"); fetchInitialData()
    }
    setSaving(false)
  }

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-400 italic">{"MENYINKRONKAN DATA PERUSAHAAN..."}</div>

  if (!company) {
    return (
        <div className="max-w-2xl mx-auto bg-white p-10 rounded-[2.5rem] border-4 border-slate-100 shadow-2xl">
            <Building2 className="text-blue-600 mb-6" size={48} />
            <h2 className="text-3xl font-black tracking-tighter uppercase italic mb-2">{"Registrasi Instansi"}</h2>
            <p className="text-slate-500 mb-8 font-medium">{"Daftarkan organisasi Anda untuk memulai pemetaan talenta inklusif."}</p>
            <div className="space-y-4">
                <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Nama Perusahaan" className="input-std h-14 font-bold" />
                <input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="Bidang Industri" className="input-std h-14" />
                <button onClick={handleUpdateMasterProfile} disabled={saving} className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest">{saving ? "MEMPROSES..." : "DAFTAR SEKARANG"}</button>
            </div>
        </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8">
      {/* HEADER DASHBOARD DENGAN TAB */}
      <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black uppercase italic">{companyName.substring(0,2)}</div>
            <div>
                <h2 className="text-2xl font-black tracking-tighter uppercase">{companyName}</h2>
                <div className="flex items-center gap-4 mt-1">
                    <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><ShieldCheck size={12}/> {"Partner Inklusi"}</p>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><Star size={12} className="text-orange-400"/> {"Score: "}{ratings.avg.toFixed(1)}</p>
                </div>
            </div>
        </div>
        <div className="flex bg-white/5 p-2 rounded-2xl gap-1">
            <button onClick={() => setActiveTab("overview")} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-white/10'}`}><LayoutDashboard size={16}/> {"Ikhtisar"}</button>
            <button onClick={() => setActiveTab("profile")} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-white/10'}`}><Settings size={16}/> {"Profil"}</button>
            <button onClick={() => setActiveTab("jobs")} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${activeTab === 'jobs' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-white/10'}`}><Plus size={16}/> {"Lowongan"}</button>
        </div>
      </div>

      {msg && <div ref={msgRef} tabIndex={-1} className="p-4 bg-green-50 text-green-700 text-xs font-black uppercase tracking-widest text-center rounded-2xl border border-green-200">{"✅ "}{msg}</div>}

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"><Users className="text-blue-600 mb-2" size={24}/><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{"Pelamar Masuk"}</p><p className="text-3xl font-black leading-none mt-1">{stats.applicants}</p></div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"><Briefcase className="text-purple-600 mb-2" size={24}/><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{"Lowongan Aktif"}</p><p className="text-3xl font-black leading-none mt-1">{stats.jobs}</p></div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm md:col-span-2 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">{"Indikator Inklusi (Audit Talenta)"}</p>
                        <div className="flex gap-4">
                            <div className="text-center"><p className="text-[10px] font-bold text-blue-600">{ratings.accessibility.toFixed(1)}</p><p className="text-[8px] font-black uppercase text-slate-400">{"Akses"}</p></div>
                            <div className="text-center"><p className="text-[10px] font-bold text-blue-600">{ratings.culture.toFixed(1)}</p><p className="text-[8px] font-black uppercase text-slate-400">{"Budaya"}</p></div>
                        </div>
                    </div>
                    <div className="text-4xl font-black italic bg-slate-100 p-4 rounded-2xl">{ratings.avg.toFixed(1)}</div>
                </div>
            </div>
            <div className="bg-gradient-to-br from-blue-700 to-indigo-900 p-10 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                <ShieldCheck className="absolute right-0 top-0 opacity-10 -rotate-12" size={240}/>
                <div className="relative z-10 space-y-4">
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter">{"Certified Inclusive Branding"}</h3>
                    <p className="text-blue-100 text-sm font-medium max-w-xl">{"Profil perusahaan Anda akan tampil publik. Semakin tinggi rating inklusivitas, semakin besar minat kandidat terbaik."}</p>
                    <button onClick={() => window.open(`/perusahaan/${company.id}`)} className="bg-white text-blue-800 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl flex items-center gap-2">{"Lihat Profil Publik"} <ArrowRight size={16}/></button>
                </div>
            </div>
        </div>
      )}

      {/* TAB 2: PROFIL MASTER (DATA RISET) */}
      {activeTab === "profile" && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-10 animate-in fade-in">
            <h2 className="text-xl font-black uppercase italic border-b pb-4 flex items-center gap-2 text-blue-600"><Building2/> {"Master Profile Instansi"}</h2>
            <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">{"Nama Instansi"}</label><input value={companyName} onChange={e => setCompanyName(e.target.value)} className="input-std font-bold" /></div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400">{"Lokasi Kantor Pusat"}</label>
                        <input list="city-list" value={location} onChange={e => setLocation(e.target.value)} className="input-std" />
                        <datalist id="city-list">{INDONESIA_CITIES.map(c => <option key={c} value={c} />)}</datalist>
                    </div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">{"Visi Inklusi"}</label><textarea value={vision} onChange={e => setVision(e.target.value)} className="input-std h-32" /></div>
                </div>
                <div className="space-y-6">
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">{"Jumlah Karyawan Disabilitas"}</label><input type="number" value={totalDisabilityEmp} onChange={e => setTotalDisabilityEmp(parseInt(e.target.value))} className="input-std" /></div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-slate-400">{"Fasilitas Akomodasi Tersedia (Master)"}</label>
                        <div className="flex flex-wrap gap-2">
                            {ACCOMMODATION_TYPES.map(acc => (
                                <button key={acc} onClick={() => setMasterAcomodations(prev => prev.includes(acc) ? prev.filter(a => a !== acc) : [...prev, acc])}
                                className={`px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${masterAcomodations.includes(acc) ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-slate-50 text-slate-400'}`}>
                                    {acc}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <button onClick={handleUpdateMasterProfile} disabled={saving} className="w-full h-16 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3"><Save/> {saving ? "MENYIMPAN..." : "SIMPAN MASTER PROFILE"}</button>
        </div>
      )}

      {/* TAB 3: LOWONGAN */}
      {activeTab === "jobs" && (
        <div className="grid lg:grid-cols-5 gap-8 animate-in slide-in-from-right-4">
            <div className="lg:col-span-3 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
                <h2 className="text-xl font-black uppercase italic border-b pb-4 text-purple-600 flex items-center gap-2"><Plus/> {"Pasang Lowongan"}</h2>
                <div className="space-y-6">
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">{"Judul Posisi"}</label><input value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="input-std font-bold text-lg" placeholder="Misal: HR Admin (Tuli/HoH)" /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">{"Lokasi Penempatan"}</label>
                            <select value={jobLocation} onChange={e => setJobLocation(e.target.value)} className="input-std">
                                {INDONESIA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">{"Mode Kerja"}</label>
                            <select value={jobWorkMode} onChange={e => setJobWorkMode(e.target.value)} className="input-std">
                                {WORK_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-slate-400">{"Target Ragam Disabilitas"}</label>
                        <div className="flex flex-wrap gap-2">
                            {DISABILITY_TYPES.map(t => (
                                <button key={t} onClick={() => setTargetDisabilities(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}
                                className={`px-4 py-2 rounded-xl text-[10px] font-bold border ${targetDisabilities.includes(t) ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-slate-50 text-slate-400'}`}>{t}</button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">{"Deskripsi Pekerjaan"}</label><textarea value={jobDesc} onChange={e => setJobDesc(e.target.value)} className="input-std h-48" /></div>
                    <button onClick={() => setIsPreview(true)} className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2"><Eye size={18}/> {"Preview Tampilan"}</button>
                </div>
            </div>

            <div className="lg:col-span-2">
                {isPreview ? (
                    <div className="bg-white p-8 rounded-[2.5rem] border-4 border-blue-600 shadow-2xl space-y-6 sticky top-8 animate-in zoom-in-95">
                        <div className="flex justify-between items-center"><h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{"Live Preview"}</h4><button onClick={() => setIsPreview(false)} className="text-[9px] font-black text-slate-400 uppercase">{"Tutup"}</button></div>
                        <h3 className="text-2xl font-black tracking-tighter uppercase leading-none">{jobTitle || "Judul Lowongan"}</h3>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <p className="text-[9px] font-black text-slate-400 uppercase mb-2">{"Akomodasi Terintegrasi"}</p>
                            <div className="flex flex-wrap gap-1">
                                {masterAcomodations.map(a => <span key={a} className="text-[8px] font-bold text-slate-600 flex items-center gap-1"><CheckCircle2 size={10} className="text-green-500"/> {a}</span>)}
                            </div>
                        </div>
                        <button onClick={handlePostJob} disabled={saving} className="w-full h-16 bg-blue-600 text-white rounded-2xl font-black text-lg uppercase shadow-xl flex items-center justify-center gap-3"><Send/> {saving ? "MEMPROSES..." : "PUBLIKASIKAN"}</button>
                    </div>
                ) : (
                    <div className="bg-slate-50 p-10 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center text-slate-400 italic h-64">
                        <Info size={40} className="mb-4 opacity-20"/>
                        <p className="text-sm font-medium">{"Klik Preview untuk melihat bagaimana talenta melihat lowongan Anda."}</p>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  )
}
