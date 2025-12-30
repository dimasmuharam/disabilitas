"use client"
import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { 
  INDONESIA_CITIES, 
  DISABILITY_TYPES, 
  WORK_MODES, 
  EDUCATION_LEVELS,
  ACCOMMODATION_TYPES 
} from "@/lib/data-static"
import { INCLUSIVE_JOB_TEMPLATE } from "@/app/lowongan/create/template"
import { 
  Briefcase, LayoutDashboard, Plus, Users, CheckCircle2, 
  Eye, Edit3, ShieldCheck, FileText, ArrowRight, Send, 
  MapPin, Globe, Building2, Star, Info, Settings, Save, Trash2
} from "lucide-react"

export default function CompanyDashboard({ user }: { user: any }) {
  const [company, setCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview") 
  const [isPreview, setIsPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")
  const msgRef = useRef<HTMLDivElement>(null)
  
  // -- STATE MASTER PROFIL PERUSAHAAN --
  const [companyName, setCompanyName] = useState("")
  const [industry, setIndustry] = useState("")
  const [description, setDescription] = useState("")
  const [vision, setVision] = useState("")
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
        setCompanyName(comp.name || "")
        setIndustry(comp.industry || "")
        setDescription(comp.description || "")
        setVision(comp.vision_statement || "")
        setTotalDisabilityEmp(comp.total_employees_with_disability || 0)
        setMasterAcomodations(comp.master_accommodations_provided || [])

        // Fetch Stats
        const { count: jCount } = await supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('company_id', comp.id)
        const { count: aCount } = await supabase.from('applications').select('*, jobs!inner(*)', { count: 'exact', head: true }).eq('jobs.company_id', comp.id)
        setStats({ jobs: jCount || 0, applicants: aCount || 0 })

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

  async function handleUpdateMasterProfile() {
    setSaving(true)
    const updates = {
      owner_id: user.id,
      name: companyName,
      industry,
      description,
      vision_statement: vision,
      total_employees_with_disability: totalDisabilityEmp,
      master_accommodations_provided: masterAcomodations,
      updated_at: new Date()
    }
    const { error } = await supabase.from('companies').upsert(updates)
    if (!error) {
        setMsg("Profil Master Inklusivitas Berhasil Diperbarui")
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
        setMsg("Lowongan berhasil dipublikasikan!")
        setActiveTab("overview")
        fetchInitialData()
    }
    setSaving(false)
  }

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-400 italic">Sinkronisasi Database Perusahaan...</div>

  // UI PENDAFTARAN AWAL
  if (!company) {
    return (
        <div className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-10 rounded-[2.5rem] border-4 border-slate-100 shadow-2xl">
            <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-blue-100">
                <Building2 className="text-white" size={32} />
            </div>
            <h2 className="text-3xl font-black tracking-tighter uppercase italic mb-2">Registrasi Instansi</h2>
            <p className="text-slate-500 mb-8 font-medium">Daftarkan organisasi Anda untuk memulai pemetaan talenta inklusif.</p>
            <div className="space-y-4">
                <input value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Nama Perusahaan / Organisasi" className="input-std h-14 font-bold" />
                <input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="Bidang Industri (Misal: Teknologi)" className="input-std h-14" />
                <button onClick={handleUpdateMasterProfile} disabled={saving} className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all">
                    {saving ? "Mendaftarkan..." : "Mulai Integrasi"}
                </button>
            </div>
        </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8">
      {/* HEADER DASHBOARD */}
      <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black uppercase italic shadow-inner">{companyName.substring(0,2)}</div>
            <div>
                <h2 className="text-2xl font-black tracking-tighter uppercase">{companyName}</h2>
                <div className="flex items-center gap-4 mt-1">
                    <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><ShieldCheck size={12}/> Partner Inklusi</p>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><Star size={12} className="text-orange-400"/> Score: {ratings.avg.toFixed(1)}/5</p>
                </div>
            </div>
        </div>
        <div className="flex bg-white/5 p-2 rounded-2xl gap-1">
            <button onClick={() => setActiveTab("overview")} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-white/10'}`}><LayoutDashboard size={16}/> Ikhtisar</button>
            <button onClick={() => setActiveTab("profile")} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-white/10'}`}><Settings size={16}/> Profil Inklusi</button>
            <button onClick={() => setActiveTab("jobs")} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'jobs' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-white/10'}`}><Plus size={16}/> Lowongan</button>
        </div>
      </div>

      {msg && (
          <div ref={msgRef} tabIndex={-1} className="p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700 text-xs font-black uppercase tracking-widest text-center animate-bounce outline-none">
              ✅ {msg}
          </div>
      )}

      {/* TAB 1: OVERVIEW & AUDIT SCORECARD */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"><Users className="text-blue-600 mb-2" size={24}/><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Pelamar Masuk</p><p className="text-3xl font-black leading-none mt-1">{stats.applicants}</p></div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm"><Briefcase className="text-purple-600 mb-2" size={24}/><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Lowongan Aktif</p><p className="text-3xl font-black leading-none mt-1">{stats.jobs}</p></div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm md:col-span-2 flex items-center justify-between">
                    <div><p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Audit Kualitas Inklusi (Oleh Talenta)</p>
                    <div className="flex gap-4">
                        <div className="text-center"><p className="text-[10px] font-bold text-blue-600">{ratings.accessibility.toFixed(1)}</p><p className="text-[8px] font-black uppercase text-slate-400">Akses</p></div>
                        <div className="text-center"><p className="text-[10px] font-bold text-blue-600">{ratings.culture.toFixed(1)}</p><p className="text-[8px] font-black uppercase text-slate-400">Budaya</p></div>
                        <div className="text-center"><p className="text-[10px] font-bold text-blue-600">{ratings.management.toFixed(1)}</p><p className="text-[8px] font-black uppercase text-slate-400">Manajemen</p></div>
                        <div className="text-center"><p className="text-[10px] font-bold text-blue-600">{ratings.onboarding.toFixed(1)}</p><p className="text-[8px] font-black uppercase text-slate-400">Onboarding</p></div>
                    </div>
                    </div>
                    <div className="text-4xl font-black italic text-slate-900 bg-slate-100 p-4 rounded-2xl">{ratings.avg.toFixed(1)}</div>
                </div>
            </div>

            <div className="bg-gradient-to-r from-blue-700 to-indigo-800 p-8 rounded-[2.5rem] text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden">
                <div className="absolute right-0 top-0 opacity-10 -rotate-12"><ShieldCheck size={200}/></div>
                <div className="relative z-10 space-y-4 flex-1">
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter">Certified Inclusive Branding</h3>
                    <p className="text-blue-100 text-sm font-medium max-w-xl">
                        Profil perusahaan Anda akan tampil secara publik. Semakin tinggi rating inklusivitas dari talenta Anda, semakin besar minat kandidat terbaik untuk melamar.
                    </p>
                </div>
                <button onClick={() => window.open(`/perusahaan/${company.id}`)} className="relative z-10 bg-white text-blue-800 px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl flex items-center gap-2">Lihat Profil Publik <ArrowRight size={16}/></button>
            </div>
        </div>
      )}

      {/* TAB 2: PROFIL INKLUSIVITAS MASTER */}
      {activeTab === "profile" && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-10 animate-in fade-in">
            <h2 className="text-xl font-black uppercase italic border-b pb-4 flex items-center gap-2 text-blue-600"><Building2/> Master Profile Perusahaan</h2>
            
            <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Nama Instansi</label><input value={companyName} onChange={e => setCompanyName(e.target.value)} className="input-std font-bold" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Bidang Industri</label><input value={industry} onChange={e => setIndustry(e.target.value)} className="input-std" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Visi Inklusi (Branding)</label><textarea value={vision} onChange={e => setVision(e.target.value)} className="input-std h-32" placeholder="Komitmen perusahaan terhadap talenta disabilitas..." /></div>
                </div>
                <div className="space-y-6">
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Jumlah Karyawan Disabilitas Saat Ini</label><input type="number" value={totalDisabilityEmp} onChange={e => setTotalDisabilityEmp(parseInt(e.target.value))} className="input-std" /></div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-slate-400">Akomodasi & Fasilitas Tersedia (Master)</label>
                        <div className="flex flex-wrap gap-2">
                            {ACCOMMODATION_TYPES.map(acc => (
                                <button key={acc} onClick={() => setMasterAcomodations(prev => prev.includes(acc) ? prev.filter(a => a !== acc) : [...prev, acc])}
                                className={`px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${masterAcomodations.includes(acc) ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                                    {acc}
                                </button>
                            ))}
                        </div>
                        <p className="text-[9px] italic text-slate-400">Fasilitas yang Anda pilih di sini akan otomatis muncul sebagai opsi di setiap lowongan baru.</p>
                    </div>
                </div>
            </div>
            <button onClick={handleUpdateMasterProfile} disabled={saving} className="w-full h-16 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3"><Save/> {saving ? "Menyimpan..." : "Perbarui Master Profile"}</button>
        </div>
      )}

      {/* TAB 3: MANAJEMEN LOWONGAN */}
      {activeTab === "jobs" && (
        <div className="grid lg:grid-cols-5 gap-8 animate-in slide-in-from-right-4">
            <div className="lg:col-span-3 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
                <h2 className="text-xl font-black uppercase italic border-b pb-4 text-purple-600 flex items-center gap-2"><Plus/> Pasang Lowongan Baru</h2>
                <div className="space-y-6">
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Judul Posisi</label><input value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="input-std font-bold text-lg" placeholder="Misal: Customer Service (Tuli/HoH)" /></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Lokasi</label>
                            <select value={jobLocation} onChange={e => setJobLocation(e.target.value)} className="input-std">
                                {INDONESIA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Mode Kerja</label>
                            <select value={jobWorkMode} onChange={e => setJobWorkMode(e.target.value)} className="input-std">
                                {WORK_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-slate-400">Target Ragam Disabilitas</label>
                        <div className="flex flex-wrap gap-2">
                            {DISABILITY_TYPES.map(t => (
                                <button key={t} onClick={() => setTargetDisabilities(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}
                                className={`px-4 py-2 rounded-xl text-[10px] font-bold border ${targetDisabilities.includes(t) ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-slate-50 text-slate-400'}`}>{t}</button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Deskripsi Pekerjaan</label><textarea value={jobDesc} onChange={e => setJobDesc(e.target.value)} className="input-std h-64 font-mono text-xs leading-relaxed" /></div>
                    <button onClick={() => setIsPreview(true)} className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2"><Eye size={18}/> Preview Tampilan Pelamar</button>
                </div>
            </div>

            {/* PREVIEW FLOATING CARD */}
            <div className="lg:col-span-2 space-y-6">
                {isPreview ? (
                    <div className="bg-white p-8 rounded-[2.5rem] border-4 border-blue-600 shadow-2xl space-y-6 sticky top-8 animate-in zoom-in-95">
                        <div className="flex justify-between items-center"><h4 className="text-[10px] font-black text-blue-600 uppercase">Live Preview</h4><button onClick={() => setIsPreview(false)} className="text-[9px] font-black text-slate-400 uppercase">Tutup</button></div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-black tracking-tighter uppercase leading-none">{jobTitle || "Judul Lowongan"}</h3>
                            <div className="flex gap-2">
                                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter">{jobWorkMode}</span>
                                <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter">{jobLocation}</span>
                            </div>
                            <div className="flex flex-wrap gap-1">
                                {targetDisabilities.map(t => <span key={t} className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-md text-[8px] font-black uppercase">#{t}</span>)}
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100"><p className="text-[9px] font-black text-slate-400 uppercase mb-2">Akomodasi Disediakan (Auto-Sync)</p><div className="flex flex-wrap gap-1">{masterAcomodations.map(a => <span key={a} className="text-[8px] font-bold text-slate-600 flex items-center gap-1"><CheckCircle2 size={10} className="text-green-500"/> {a}</span>)}</div></div>
                        </div>
                        <button onClick={handlePostJob} disabled={saving} className="w-full h-16 bg-blue-600 text-white rounded-2xl font-black text-lg uppercase shadow-xl shadow-blue-100 flex items-center justify-center gap-3"><Send/> {saving ? "Memproses..." : "Publikasikan Sekarang"}</button>
                    </div>
                ) : (
                    <div className="bg-slate-50 p-10 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center text-slate-400 italic">
                        <Info size={40} className="mb-4 opacity-20"/>
                        <p className="text-sm font-medium">Klik "Preview" untuk melihat bagaimana talenta disabilitas melihat lowongan Anda.</p>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  )
}
