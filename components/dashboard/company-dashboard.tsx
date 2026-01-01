"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

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
import { updateApplicationStatus } from "@/lib/actions/applications"
import { getCompanyRatingAggregate } from "@/lib/actions/ratings"

import { 
  Briefcase, Building2, MapPin, LayoutDashboard, Plus, Users, CheckCircle2, 
  Eye, ShieldCheck, Info, Settings, Save, Sparkles, Clipboard, 
  Zap, X, ArrowUpRight, Filter, FileDown, CheckSquare, Square, Trash2
} from "lucide-react"

export default function CompanyDashboard({ user }: { user: any }) {
  const [company, setCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview") 
  const [isPreview, setIsPreview] = useState(false)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")
  const msgRef = useRef<HTMLDivElement>(null)
  
  // -- STATE MASTER PROFIL --
  const [companyName, setCompanyName] = useState("")
  const [industry, setIndustry] = useState("")
  const [description, setDescription] = useState("")
  const [vision, setVision] = useState("")
  const [location, setLocation] = useState("")
  const [totalDisabilityEmp, setTotalDisabilityEmp] = useState(0)
  const [masterAcomodations, setMasterAcomodations] = useState<string[]>([])
  const [isVerified, setIsVerified] = useState(false)

  // -- STATE LOWONGAN & PELAMAR --
  const [jobTitle, setJobTitle] = useState("")
  const [jobDesc, setJobDesc] = useState("")
  const [jobLocation, setJobLocation] = useState("Jakarta Selatan")
  const [jobWorkMode, setJobWorkMode] = useState(WORK_MODES[0])
  const [targetDisabilities, setTargetDisabilities] = useState<string[]>([])
  const [applicants, setApplicants] = useState<any[]>([])
  const [filterDisability, setFilterDisability] = useState("Semua")
  const [myJobs, setMyJobs] = useState<any[]>([])
  
  // -- STATE BATCH/BULK ACTION --
  const [selectedApps, setSelectedApps] = useState<string[]>([])
  
  const [stats, setStats] = useState({ applicants: 0, jobs: 0 })
  const [ratings, setRatings] = useState({ avg: 0, accessibility: 0, culture: 0, management: 0, onboarding: 0 })

  useEffect(() => {
    if (!user?.id) {
      console.warn('[COMPANY-DASHBOARD] User not available yet')
      return
    }
    console.log('[COMPANY-DASHBOARD] Initializing with user:', { id: user.id, email: user.email })
    fetchInitialData()
  }, [user?.id])

  async function fetchInitialData() {
    if (!user?.id) {
      console.error('[COMPANY-DASHBOARD] Cannot fetch data: user.id is undefined')
      return
    }
    
    try {
      console.log('[COMPANY-DASHBOARD] Fetching company data for owner:', user.id)
      const { data: comp } = await supabase.from("companies").select("*").eq("owner_id", user.id).single()
      if (comp) {
        console.log('[COMPANY-DASHBOARD] Company data loaded:', comp.name)
        setCompany(comp)
        setCompanyName(comp.name || ""); setIndustry(comp.industry || "")
        setDescription(comp.description || ""); setVision(comp.vision_statement || "")
        setLocation(comp.location || ""); setTotalDisabilityEmp(comp.total_employees_with_disability || 0)
        setMasterAcomodations(comp.master_accommodations_provided || [])
        setIsVerified(comp.is_verified || false)

        const statsData = await getCompanyStats(comp.id)
        setStats({ jobs: statsData.jobCount, applicants: statsData.applicantCount })

        // 1. Ambil Lowongan Aktif
        const { data: jobs } = await supabase.from("jobs").select("*").eq("company_id", comp.id).order("created_at", { ascending: false })
        setMyJobs(jobs || [])

        // 2. Ambil Data Pelamar Lengkap
        const { data: apps } = await supabase.from("applications")
          .select(`
            *, 
            profiles(*), 
            jobs(title)
          `)
          .eq("jobs.company_id", comp.id)
          .order("created_at", { ascending: false })
        setApplicants(apps || [])

        // 3. Ambil Rating via Server Action
        const rData = await getCompanyRatingAggregate(comp.id)
        if (rData) {
            setRatings({
                avg: rData.totalAvg,
                accessibility: rData.accessibility, culture: rData.culture,
                management: rData.management, onboarding: rData.onboarding
            })
        }
      }
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  // LOGIKA BULK ACTIONS
  const toggleSelect = (id: string) => {
    setSelectedApps(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id])
  }

  async function handleBulkStatusChange(newStatus: string) {
    if (selectedApps.length === 0) return
    setSaving(true)
    try {
      await Promise.all(selectedApps.map(id => updateApplicationStatus(id, newStatus)))
      setMsg(`${selectedApps.length} pelamar berhasil diubah ke status ${newStatus}.`)
      setSelectedApps([])
      fetchInitialData()
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  const generateCompanyCV = async (app: any) => {
    const doc = new jsPDF()
    const p = app.profiles
    const jobName = app.jobs?.title || "Posisi Tertentu"
    const { data: wEx } = await supabase.from("work_experiences").select("*").eq("profile_id", p.id).order("is_current_work", { ascending: false })
    
    doc.setFillColor(30, 41, 59); doc.rect(0, 0, 210, 50, "F")
    doc.setTextColor(255, 255, 255); doc.setFontSize(20); doc.text(p.full_name.toUpperCase(), 20, 25)
    doc.setFontSize(10); doc.text(`${p.disability_type} | ${p.city}`, 20, 35)

    doc.setTextColor(0, 0, 0); doc.text("PENGALAMAN KERJA TALENTA", 20, 70)
    autoTable(doc, {
      startY: 75,
      head: [["Posisi", "Instansi", "Status"]],
      body: wEx?.map(w => [w.position, w.company_name, w.is_current_work ? "AKTIF" : "SELESAI"]),
      headStyles: { fillColor: [37, 99, 235] }
    })
    doc.save(`Audit_CV_${p.full_name}.pdf`)
  }

  const useTemplate = () => { setJobDesc(INCLUSIVE_JOB_TEMPLATE); setMsg("Template inklusif diterapkan.") }

  async function handleUpdateMasterProfile() {
    setSaving(true)
    const result = await updateCompanyMaster(user.id, {
        name: companyName, industry, description, vision, location,
        totalDisabilityEmp, masterAcomodations
    })
    if (!result.error) { setMsg("Profil Berhasil Diperbarui."); fetchInitialData() }
    setSaving(false)
  }

  async function handlePostJob() {
    if(!jobTitle || !jobDesc) { setMsg("Wajib isi judul & deskripsi."); return }
    setSaving(true)
    const { error } = await supabase.from("jobs").insert({
        company_id: company.id, title: jobTitle, description: jobDesc,
        location: jobLocation, work_mode: jobWorkMode, target_disabilities: targetDisabilities, is_active: true
    })
    if (!error) { setMsg("Lowongan Berhasil Tayang!"); setActiveTab("overview"); fetchInitialData() }
    setSaving(false)
  }

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-400 italic">{"MEMYIAPKAN DASHBOARD..."}</div>

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8 px-4">
      {/* HEADER UTAMA */}
      <header role="banner" className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black italic">{companyName.substring(0,2)}</div>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tighter leading-tight">{companyName || "Instansi Baru"}</h1>
            <div className="flex items-center gap-4 mt-2">
              {isVerified ? <p className="text-blue-400 text-[10px] font-black uppercase flex items-center gap-1"><ShieldCheck size={14}/> {"Terverifikasi"}</p> : <p className="text-slate-500 text-[10px] font-black uppercase flex items-center gap-1"><Info size={14}/> {"Verifikasi Pending"}</p>}
            </div>
          </div>
        </div>
        <nav role="tablist" className="flex bg-white/5 p-2 rounded-2xl gap-1 border border-white/5">
          {["overview", "profile", "jobs", "applicants"].map((tab) => (
            <button key={tab} role="tab" aria-selected={activeTab === tab} onClick={() => setActiveTab(tab)} className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? "bg-blue-600 text-white shadow-lg" : "hover:bg-white/10 text-slate-400"}`}>
              {tab === "overview" && <LayoutDashboard size={14} className="inline mr-2"/>}
              {tab === "profile" && <Settings size={14} className="inline mr-2"/>}
              {tab === "jobs" && <Plus size={14} className="inline mr-2"/>}
              {tab === "applicants" && <Users size={14} className="inline mr-2"/>}
              {tab}
            </button>
          ))}
        </nav>
      </header>

      {msg && <div role="alert" className="p-4 bg-blue-50 text-blue-700 text-[10px] font-black uppercase text-center rounded-2xl border border-blue-200">{"✅ "}{msg}</div>}

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <main className="space-y-8 animate-in fade-in">
            <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <h2 className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-2"><Users size={14}/> {"Pelamar"}</h2>
                    <p className="text-3xl font-black text-slate-800 mt-2">{stats.applicants}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <h2 className="text-[9px] font-black uppercase text-slate-400 flex items-center gap-2"><Briefcase size={14}/> {"Lowongan"}</h2>
                    <p className="text-3xl font-black text-slate-800 mt-2">{stats.jobs}</p>
                </div>
                <div className="bg-slate-900 text-white p-6 rounded-[2rem] md:col-span-2 flex justify-between items-center border border-white/10 shadow-xl">
                    <div>
                        <h2 className="text-[9px] font-black uppercase text-blue-400 tracking-widest">{"Inclusion Index Rating"}</h2>
                        <p className="text-5xl font-black italic mt-1">{ratings.avg.toFixed(1)}<span className="text-sm not-italic opacity-30">{"/5.0"}</span></p>
                    </div>
                    <div className="text-right text-[8px] font-bold space-y-1 opacity-60 uppercase tracking-tighter">
                        <p>{"Akses Fisik: "}{ratings.accessibility.toFixed(1)}</p>
                        <p>{"Budaya Kerja: "}{ratings.culture.toFixed(1)}</p>
                    </div>
                </div>
            </div>

            <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200">
                <h2 className="text-sm font-black uppercase italic mb-6 text-slate-800">{"Lowongan Terpublikasi"}</h2>
                <div className="grid gap-4">
                    {myJobs.length === 0 ? <p className="text-xs italic text-slate-400">{"Belum ada lowongan."}</p> : myJobs.map(job => (
                        <div key={job.id} className="p-5 border border-slate-100 rounded-2xl flex justify-between items-center bg-slate-50/30">
                            <div>
                                <h4 className="text-xs font-black uppercase">{job.title}</h4>
                                <p className="text-[9px] font-bold text-slate-400 uppercase">{job.location} • {job.work_mode}</p>
                            </div>
                            <button className="text-red-400 hover:text-red-600 p-2"><Trash2 size={18}/></button>
                        </div>
                    ))}
                </div>
            </section>
        </main>
      )}

      {/* PROFILE TAB (DATA RISET & AKOMODASI) */}
      {activeTab === "profile" && (
        <section className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-10 animate-in slide-in-from-bottom-4">
          <div className="flex justify-between items-center border-b pb-8">
            <h2 className="text-xl font-black uppercase italic text-blue-600 flex items-center gap-3"><Building2 size={24}/> {"Profil Riset Instansi"}</h2>
            <button onClick={handleUpdateMasterProfile} disabled={saving} className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[11px] flex items-center gap-3 shadow-xl shadow-blue-200">
              {saving ? "SIMPAN..." : <><Save size={18}/> {"Update Profil"}</>}
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Nama Instansi"}</label><input value={companyName} onChange={e => setCompanyName(e.target.value)} className="input-std font-bold text-lg" /></div>
              <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Sektor"}</label><input value={industry} onChange={e => setIndustry(e.target.value)} className="input-std" /></div>
            </div>
            <div className="space-y-6">
              <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Pegawai Disabilitas"}</label><input type="number" value={totalDisabilityEmp} onChange={e => setTotalDisabilityEmp(parseInt(e.target.value) || 0)} className="input-std font-black text-xl text-blue-600" /></div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-2">{"Akomodasi Tersedia"}</label>
                <div className="flex flex-wrap gap-2">
                  {ACCOMMODATION_TYPES.map(acc => (
                    <button key={acc} onClick={() => setMasterAcomodations(prev => prev.includes(acc) ? prev.filter(a => a !== acc) : [...prev, acc])} className={`px-4 py-2 rounded-xl text-[9px] font-bold border transition-all ${masterAcomodations.includes(acc) ? "bg-blue-600 text-white border-blue-600 shadow-lg" : "bg-slate-50 text-slate-400 border-slate-100"}`}>
                      {acc}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* JOBS TAB (POSTING & TEMPLATE) */}
      {activeTab === "jobs" && (
        <section className="grid lg:grid-cols-5 gap-10 animate-in slide-in-from-right-4">
          <div className="lg:col-span-3 bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8">
            <div className="flex justify-between items-center border-b pb-6">
              <h2 className="text-xl font-black uppercase italic text-purple-600 flex items-center gap-3"><Plus size={24}/> {"Buat Lowongan"}</h2>
              <button onClick={useTemplate} className="px-5 py-3 bg-orange-50 text-orange-700 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 shadow-sm"><Sparkles size={16}/> {"Pakai Template"}</button>
            </div>
            <div className="space-y-5 text-slate-800">
              <input value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="Judul Pekerjaan" className="input-std font-bold text-lg" />
              <textarea value={jobDesc} onChange={e => setJobDesc(e.target.value)} placeholder="Tuliskan deskripsi lowongan..." className="input-std h-72 text-sm leading-relaxed" />
              <button onClick={() => setIsPreview(true)} className="w-full h-16 bg-slate-900 text-white rounded-3xl font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-3 hover:bg-black transition-all"><Eye size={20}/> {"Review Lowongan"}</button>
            </div>
          </div>
          <div className="lg:col-span-2">
            {isPreview ? (
              <div className="bg-white p-10 rounded-[3rem] border-4 border-blue-600 shadow-2xl space-y-8 sticky top-10 animate-in zoom-in-95">
                <div className="flex justify-between items-center"><span className="bg-blue-600 text-white px-4 py-1 rounded-full text-[9px] font-black uppercase">{"Pratinjau"}</span><button onClick={() => setIsPreview(false)} className="text-slate-400 hover:text-slate-900"><X size={24}/></button></div>
                <h3 className="text-3xl font-black uppercase italic leading-tight">{jobTitle || "Posisi Baru"}</h3>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-[10px] text-slate-600 whitespace-pre-line line-clamp-[12] italic">{jobDesc}</div>
                <button onClick={handlePostJob} disabled={saving} className="w-full h-20 bg-blue-600 text-white rounded-[2rem] font-black text-xl uppercase shadow-xl">{saving ? "SEDANG PROSES..." : "TAYANGKAN SEKARANG"}</button>
              </div>
            ) : (
              <div className="bg-slate-50 p-16 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center text-slate-300 h-[500px] shadow-inner"><Clipboard size={48} className="mb-6 opacity-10"/><p className="text-sm font-bold uppercase tracking-widest">{"Pratinjau Lowongan"}</p></div>
            )}
          </div>
        </section>
      )}

      {/* APPLICANTS TAB (MASS MANAGEMENT) */}
      {activeTab === "applicants" && (
        <section className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8 animate-in fade-in">
          <div className="flex flex-col md:flex-row justify-between items-center border-b pb-8 gap-4">
            <h2 className="text-2xl font-black uppercase italic text-blue-600 flex items-center gap-4"><Users size={28}/> {"Kelola Pelamar Kerja"}</h2>
            {selectedApps.length > 0 && (
              <div className="flex items-center gap-3 animate-in slide-in-from-right-4">
                <button onClick={() => handleBulkStatusChange("interview")} className="px-5 py-3 bg-amber-500 text-white rounded-2xl text-[9px] font-black uppercase shadow-lg">{"Interview Massal"}</button>
                <button onClick={() => handleBulkStatusChange("accepted")} className="px-5 py-3 bg-green-600 text-white rounded-2xl text-[9px] font-black uppercase shadow-lg">{"Hired Massal"}</button>
                <button onClick={() => setSelectedApps([])} className="p-3 bg-slate-100 text-slate-400 rounded-2xl hover:bg-slate-200"><X size={18}/></button>
              </div>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-y-3">
              <thead>
                <tr className="text-slate-400">
                  <th className="px-6 py-2 text-[9px] font-black uppercase tracking-widest">{"Pilih"}</th>
                  <th className="px-6 py-2 text-[9px] font-black uppercase tracking-widest">{"Nama & Ragam"}</th>
                  <th className="px-6 py-2 text-[9px] font-black uppercase tracking-widest text-center">{"Dokumen"}</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map(app => (
                  <tr key={app.id} className={`group transition-all ${selectedApps.includes(app.id) ? "bg-blue-50/50" : "hover:bg-slate-50"}`}>
                    <td className="px-6 py-4 rounded-l-[1.5rem] border-y border-l">
                      <button onClick={() => toggleSelect(app.id)} className="transition-transform active:scale-90">
                        {selectedApps.includes(app.id) ? <CheckSquare className="text-blue-600" size={24}/> : <Square className="text-slate-200" size={24}/>}
                      </button>
                    </td>
                    <td className="px-6 py-4 border-y">
                        <p className="font-black text-slate-800 uppercase text-xs tracking-tight">{app.profiles?.full_name}</p>
                        <p className="text-[9px] font-bold text-blue-600 uppercase mt-0.5">{app.profiles?.disability_type} • {app.jobs?.title}</p>
                    </td>
                    <td className="px-6 py-4 rounded-r-[1.5rem] border-y border-r text-center">
                      <button onClick={() => generateCompanyCV(app)} className="p-3 text-slate-300 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><FileDown size={20}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
