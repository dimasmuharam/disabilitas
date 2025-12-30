"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
// SINKRONISASI DATA STATIC
import { 
  INDONESIA_CITIES, 
  DISABILITY_TYPES, 
  WORK_MODES, 
  ACCOMMODATION_TYPES,
  INCLUSIVE_JOB_TEMPLATE 
} from "@/lib/data-static"
// SINKRONISASI ACTIONS
import { updateCompanyMaster, getCompanyStats } from "@/lib/actions/company"
import { 
  Briefcase, LayoutDashboard, Plus, Users, CheckCircle2, 
  Eye, Edit3, ShieldCheck, FileText, ArrowRight, Send, 
  MapPin, Building2, Star, Info, Settings, Save, Sparkles, Clipboard, 
  SearchCheck, Globe, Zap
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
  const [location, setLocation] = useState("")
  const [totalDisabilityEmp, setTotalDisabilityEmp] = useState(0)
  const [masterAcomodations, setMasterAcomodations] = useState<string[]>([])
  const [isVerified, setIsVerified] = useState(false)

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
        setIsVerified(comp.is_verified || false)

        const statsData = await getCompanyStats(comp.id)
        setStats({ jobs: statsData.jobCount, applicants: statsData.applicantCount })

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

  const useTemplate = () => {
    setJobDesc(INCLUSIVE_JOB_TEMPLATE)
    setMsg("Template inklusif berhasil diterapkan.")
  }

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
        setMsg("Profil Inklusi Berhasil Diperbarui.")
        fetchInitialData()
        setTimeout(() => msgRef.current?.focus(), 100)
    }
    setSaving(false)
  }

  async function handlePostJob() {
    if(!jobTitle || !jobDesc) { setMsg("Judul dan deskripsi wajib diisi."); return }
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
        setJobTitle(""); setJobDesc(""); setTargetDisabilities([])
    }
    setSaving(false)
  }

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-400 italic">{"MENYIAPKAN RUANG KERJA INKLUSI..."}</div>

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8">
      {/* HEADER */}
      <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black uppercase italic">{companyName.substring(0,2)}</div>
            <div>
                <h2 className="text-2xl font-black tracking-tighter uppercase leading-none">{companyName}</h2>
                <div className="flex items-center gap-4 mt-2">
                    {isVerified ? (
                        <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><ShieldCheck size={14}/> {"Partner Terverifikasi"}</p>
                    ) : (
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1"><Info size={14}/> {"Menunggu Verifikasi Admin"}</p>
                    )}
                </div>
            </div>
        </div>
        <div className="flex bg-white/5 p-2 rounded-2xl gap-1">
            <button onClick={() => setActiveTab("overview")} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-white/10'}`}><LayoutDashboard size={16}/> {"Ikhtisar"}</button>
            <button onClick={() => setActiveTab("profile")} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-white/10'}`}><Settings size={16}/> {"Profil"}</button>
            <button onClick={() => setActiveTab("jobs")} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${activeTab === 'jobs' ? 'bg-blue-600 text-white shadow-lg' : 'hover:bg-white/10'}`}><Plus size={16}/> {"Lowongan"}</button>
        </div>
      </div>

      {msg && <div ref={msgRef} tabIndex={-1} className="p-4 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest text-center rounded-2xl border border-blue-200">{"✅ "}{msg}</div>}

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in">
            <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <Users className="text-blue-600 mb-2" size={24}/>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{"Pelamar Riset"}</p>
                    <p className="text-3xl font-black leading-none mt-1">{stats.applicants}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <Briefcase className="text-purple-600 mb-2" size={24}/>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{"Lowongan Aktif"}</p>
                    <p className="text-3xl font-black leading-none mt-1">{stats.jobs}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm md:col-span-2 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">{"Inclusion Index"}</p>
                        <div className="flex gap-4">
                            <div className="text-center"><p className="text-[10px] font-bold text-blue-600">{ratings.accessibility.toFixed(1)}</p><p className="text-[8px] font-black uppercase text-slate-400">{"Akses"}</p></div>
                            <div className="text-center"><p className="text-[10px] font-bold text-blue-600">{ratings.culture.toFixed(1)}</p><p className="text-[8px] font-black uppercase text-slate-400">{"Budaya"}</p></div>
                        </div>
                    </div>
                    <div className="text-4xl font-black italic bg-slate-100 p-4 rounded-2xl">{ratings.avg.toFixed(1)}</div>
                </div>
            </div>

            {/* BANNER JASA AUDIT AKSESIBILITAS DIGITAL */}
            <section className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 rounded-[2.5rem] p-10 relative overflow-hidden border border-white/5 shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Zap size={200} className="text-blue-400 -rotate-12"/>
                </div>
                <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
                            <Sparkles size={14} className="text-blue-400"/>
                            <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{"Layanan Eksklusif Partner"}</span>
                        </div>
                        <h3 className="text-3xl font-black text-white leading-none tracking-tighter uppercase italic">
                            {"Pastikan Aset Digital "}<br/>
                            <span className="text-blue-500">{"Instansi Anda Inklusif"}</span>
                        </h3>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed">
                            {"Apakah website dan aplikasi rekrutmen Anda sudah bisa diakses dengan Screen Reader oleh talenta Tunanetra? Lakukan Audit Aksesibilitas bersama tim ahli disabilitas.com."}
                        </p>
                        <div className="flex flex-wrap gap-4 pt-2">
                            <button onClick={() => window.open('https://wa.me/6281234567890?text=Halo%20Admin%20Disabilitas.com,%20saya%20tertarik%20dengan%20Jasa%20Audit%20Aksesibilitas')} className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl shadow-blue-900/20">
                                <SearchCheck size={18}/> {"Ajukan Audit Sekarang"}
                            </button>
                            <button onClick={() => window.open('/layanan-audit')} className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest border border-white/10 transition-all">
                                {"Pelajari Metodologi WCAG"}
                            </button>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-sm space-y-4">
                            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400"><Globe size={20}/></div>
                                <p className="text-[10px] font-black text-white uppercase tracking-widest">{"Audit Digital Snapshot"}</p>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center text-[10px] font-bold"><span className="text-slate-400 uppercase">{"Screen Reader Ready"}</span><span className="text-red-400">{"Unchecked"}</span></div>
                                <div className="flex justify-between items-center text-[10px] font-bold"><span className="text-slate-400 uppercase">{"Color Contrast"}</span><span className="text-green-400">{"Pass"}</span></div>
                                <div className="flex justify-between items-center text-[10px] font-bold"><span className="text-slate-400 uppercase">{"Keyboard Navigable"}</span><span className="text-orange-400">{"Partial"}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
      )}

      {/* PROFIL MASTER & LOWONGAN TAB TETAP SAMA SEPERTI SEBELUMNYA */}
      {/* ... (Gunakan sisa tab profile dan jobs dari kodingan sebelumnya) */}
    </div>
  )
}
