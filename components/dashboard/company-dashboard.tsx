"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
// Library untuk PDF
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
import { 
  Briefcase, Building2, MapPin, LayoutDashboard, Plus, Users, CheckCircle2, 
  Eye, ShieldCheck, Info, Settings, Save, Sparkles, Clipboard, 
  SearchCheck, Globe, Zap, X, ArrowUpRight, Filter, FileDown
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
  
  const [stats, setStats] = useState({ applicants: 0, jobs: 0 })
  const [ratings, setRatings] = useState({ avg: 0, accessibility: 0, culture: 0, management: 0, onboarding: 0 })

  useEffect(() => {
    fetchInitialData()
  }, [])

  async function fetchInitialData() {
    try {
      const { data: comp } = await supabase.from("companies").select("*").eq("owner_id", user.id).single()
      if (comp) {
        setCompany(comp)
        setCompanyName(comp.name || ""); setIndustry(comp.industry || "")
        setDescription(comp.description || ""); setVision(comp.vision_statement || "")
        setLocation(comp.location || ""); setTotalDisabilityEmp(comp.total_employees_with_disability || 0)
        setMasterAcomodations(comp.master_accommodations_provided || [])
        setIsVerified(comp.is_verified || false)

        const statsData = await getCompanyStats(comp.id)
        setStats({ jobs: statsData.jobCount, applicants: statsData.applicantCount })

        // Ambil Data Pelamar (Ditingkatkan untuk menarik data profil & sertifikat lengkap)
        const { data: apps } = await supabase.from("applications")
          .select(`
            *, 
            profiles(*), 
            jobs(title),
            work_experiences:profiles(work_experiences(*)),
            certifications:profiles(certifications(*))
          `)
          .eq("company_id", comp.id)
          .order("created_at", { ascending: false })
        setApplicants(apps || [])

        const { data: rData } = await supabase.from("inclusion_ratings").select("*").eq("company_id", comp.id)
        if (rData && rData.length > 0) {
            const avg = (key: string) => rData.reduce((a, b) => a + b[key], 0) / rData.length
            setRatings({
                avg: (avg("score_accessibility") + avg("score_culture") + avg("score_management") + avg("score_onboarding")) / 4,
                accessibility: avg("score_accessibility"), culture: avg("score_culture"),
                management: avg("score_management"), onboarding: avg("score_onboarding")
            })
        }
      }
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  // FITUR BARU: GENERATE CV PELAMAR UNTUK PERUSAHAAN (KONTEKSTUAL)
  const generateCompanyCV = async (app: any) => {
    const doc = new jsPDF()
    const p = app.profiles
    const jobName = app.jobs?.title || "Posisi Tertentu"
    
    // Ambil data relasional tambahan jika belum lengkap di state
    const { data: wEx } = await supabase.from("work_experiences").select("*").eq("profile_id", p.id)
    const { data: certs } = await supabase.from("certifications").select("*").eq("profile_id", p.id)

    // 1. HEADER KHUSUS PERUSAHAAN
    doc.setFillColor(30, 41, 59)
    doc.rect(0, 0, 210, 55, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(20)
    doc.text(p.full_name.toUpperCase(), 20, 20)
    
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`DOKUMEN LAMARAN RESMI - DISABILITAS.COM`, 130, 20)
    doc.text(`${p.disability_type} | ${p.city}`, 20, 28)
    
    // INFO POSISI (CONTEXTUAL BRANDING)
    doc.setFillColor(37, 99, 235)
    doc.rect(20, 35, 170, 12, "F")
    doc.text(`MELAMAR POSISI: ${jobName.toUpperCase()}`, 25, 43)
    doc.text(`UNTUK: ${companyName.toUpperCase()}`, 120, 43)

    // 2. EXECUTIVE SUMMARY (BIO)
    doc.setTextColor(0, 0, 0)
    doc.setFont("helvetica", "bold")
    doc.text("RINGKASAN PROFESIONAL & BIO", 20, 70)
    doc.setFont("helvetica", "normal")
    const bioText = p.bio || `Talenta ${p.disability_type} dengan keahlian ${p.skills?.join(", ") || "-"}.`
    doc.text(bioText, 20, 78, { maxWidth: 170 })

    // 3. AKOMODASI & ALAT BANTU (DATA REAL)
    doc.setFillColor(241, 245, 249)
    doc.rect(20, 95, 170, 10, "F")
    doc.setFont("helvetica", "bold")
    doc.text("ALAT BANTU / AKOMODASI:", 25, 101)
    doc.setFont("helvetica", "normal")
    const tools = p.used_assistive_tools?.join(", ") || "Mandiri"
    doc.text(tools, 75, 101)

    // 4. PENGALAMAN KERJA
    doc.setFont("helvetica", "bold")
    doc.text("RIWAYAT PENGALAMAN KERJA", 20, 115)
    autoTable(doc, {
      startY: 120,
      head: [["Posisi", "Perusahaan", "Durasi", "Deskripsi"]],
      body: wEx?.map(w => [w.position, w.company_name, `${w.start_date} - ${w.is_current_work ? "Sekarang" : w.end_date}`, w.description || "-"]),
      theme: "striped",
      headStyles: { fillColor: [37, 99, 235] }
    })

    // 5. SERTIFIKASI
    const finalY = (doc as any).lastAutoTable.finalY || 180
    doc.setFont("helvetica", "bold")
    doc.text("SERTIFIKASI TERKAIT", 20, finalY + 15)
    let certY = finalY + 22
    certs?.slice(0, 3).forEach(c => {
      doc.setFont("helvetica", "normal")
      doc.text(`- ${c.name} (${c.organizer_name}, ${c.year})`, 25, certY)
      certY += 7
    })

    // 6. FOOTER QR
    doc.line(20, 275, 190, 275)
    doc.setFontSize(8)
    doc.text(`Dicetak oleh ${companyName} pada ${new Date().toLocaleDateString("id-ID")}`, 20, 282)
    doc.rect(175, 277, 15, 15)
    doc.text("QR VALID", 173, 295)

    doc.save(`CV_Pelamar_${p.full_name.replace(/\s+/g, "_")}.pdf`)
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

  async function handleStatusChange(appId: string, newStatus: string) {
    const res = await updateApplicationStatus(appId, newStatus)
    if (!res.error) { setMsg(`Status pelamar diubah menjadi ${newStatus}`); fetchInitialData() }
  }

  async function handlePostJob() {
    if(!jobTitle || !jobDesc) { setMsg("Judul & Deskripsi wajib."); return }
    setSaving(true)
    const { error } = await supabase.from("jobs").insert({
        company_id: company.id, title: jobTitle, description: jobDesc,
        location: jobLocation, work_mode: jobWorkMode, target_disabilities: targetDisabilities, is_active: true
    })
    if (!error) { setMsg("Lowongan Berhasil Tayang!"); setActiveTab("overview"); fetchInitialData() }
    setSaving(false)
  }

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-400 italic">{"MENYIAPKAN DASHBOARD INKLUSI..."}</div>

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8">
      {/* HEADER */}
      <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black italic">{companyName.substring(0,2)}</div>
            <div>
                <h2 className="text-2xl font-black uppercase tracking-tighter">{companyName}</h2>
                <div className="flex items-center gap-4 mt-2">
                    {isVerified ? <p className="text-blue-400 text-[10px] font-black uppercase flex items-center gap-1"><ShieldCheck size={14}/> {"Partner Terverifikasi"}</p> : <p className="text-slate-500 text-[10px] font-black uppercase flex items-center gap-1"><Info size={14}/> {"Verifikasi Pending"}</p>}
                </div>
            </div>
        </div>
        <nav className="flex bg-white/5 p-2 rounded-2xl gap-1">
            <button onClick={() => setActiveTab("overview")} className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${activeTab === "overview" ? "bg-blue-600 text-white shadow-lg" : "hover:bg-white/10"}`}><LayoutDashboard size={14}/> {"Ikhtisar"}</button>
            <button onClick={() => setActiveTab("profile")} className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${activeTab === "profile" ? "bg-blue-600 text-white shadow-lg" : "hover:bg-white/10"}`}><Settings size={14}/> {"Profil Riset"}</button>
            <button onClick={() => setActiveTab("jobs")} className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${activeTab === "jobs" ? "bg-blue-600 text-white shadow-lg" : "hover:bg-white/10"}`}><Plus size={14}/> {"Lowongan"}</button>
            <button onClick={() => setActiveTab("applicants")} className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 ${activeTab === "applicants" ? "bg-blue-600 text-white shadow-lg" : "hover:bg-white/10"}`}><Users size={14}/> {"Pelamar"}</button>
        </nav>
      </div>

      {msg && <div ref={msgRef} tabIndex={-1} className="p-4 bg-blue-50 text-blue-700 text-[10px] font-black uppercase text-center rounded-2xl border border-blue-200 shadow-sm">{"✅ "}{msg}</div>}

      {/* OVERVIEW TAB */}
      {activeTab === "overview" && (
        <div className="space-y-8 animate-in fade-in">
            <div className="grid md:grid-cols-4 gap-6 text-slate-800">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <Users className="text-blue-600 mb-2" size={24}/><p className="text-[9px] font-black uppercase text-slate-400">{"Total Pelamar"}</p>
                    <p className="text-3xl font-black mt-1">{stats.applicants}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <Briefcase className="text-purple-600 mb-2" size={24}/><p className="text-[9px] font-black uppercase text-slate-400">{"Lowongan Aktif"}</p>
                    <p className="text-3xl font-black mt-1">{stats.jobs}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm md:col-span-2 flex items-center justify-between">
                    <div><p className="text-[9px] font-black uppercase text-slate-400">{"Inclusion Index"}</p>
                    <div className="flex gap-4 mt-2">
                        <div className="text-center"><p className="text-[10px] font-bold text-blue-600">{ratings.accessibility.toFixed(1)}</p><p className="text-[8px] font-black uppercase text-slate-400">{"Akses"}</p></div>
                        <div className="text-center"><p className="text-[10px] font-bold text-blue-600">{ratings.culture.toFixed(1)}</p><p className="text-[8px] font-black uppercase text-slate-400">{"Budaya"}</p></div>
                    </div></div>
                    <div className="text-4xl font-black italic bg-slate-50 p-4 rounded-2xl">{ratings.avg.toFixed(1)}</div>
                </div>
            </div>

            {/* BANNER AUDIT */}
            <section className="bg-gradient-to-r from-slate-900 to-blue-950 rounded-[2.5rem] p-10 relative overflow-hidden border border-white/5">
                <div className="absolute top-0 right-0 p-8 opacity-10"><Zap size={180} className="text-blue-400 -rotate-12"/></div>
                <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 font-black text-[8px] uppercase tracking-widest"><Sparkles size={12}/> {"Audit Aksesibilitas"}</div>
                        <h3 className="text-3xl font-black text-white leading-none uppercase italic">{"Website rekrutmen anda "}<span className="text-blue-500">{"Sudah Inklusif?"}</span></h3>
                        <p className="text-slate-400 text-xs leading-relaxed">{"Dapatkan laporan kepatuhan WCAG 2.1 untuk memastikan talenta Tunanetra dapat melamar dengan mandiri di portal Anda."}</p>
                        <button onClick={() => window.open("https://wa.me/6281234567890")} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 transition-all">{"Hubungi Ahli Kami"}</button>
                    </div>
                </div>
            </section>
        </div>
      )}

      {/* PROFIL MASTER */}
      {activeTab === "profile" && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-10 animate-in fade-in">
            <div className="flex justify-between items-center border-b pb-6">
                <h2 className="text-xl font-black uppercase italic text-blue-600 flex items-center gap-2"><Building2 size={24}/> {"Data Induk Riset Perusahaan"}</h2>
                <button onClick={handleUpdateMasterProfile} disabled={saving} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px] flex items-center gap-2 shadow-lg">{saving ? "MENYIMPAN..." : <><Save size={16}/> {"Simpan Perubahan"}</>}</button>
            </div>
            <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">{"Nama Instansi"}</label><input value={companyName} onChange={e => setCompanyName(e.target.value)} className="input-std font-bold" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">{"Domisili Kantor Pusat"}</label><select value={location} onChange={e => setLocation(e.target.value)} className="input-std font-bold">{INDONESIA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">{"Visi Inklusi"}</label><textarea value={vision} onChange={e => setVision(e.target.value)} className="input-std h-32" /></div>
                </div>
                <div className="space-y-6">
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">{"Karyawan Disabilitas Saat Ini"}</label><input type="number" value={totalDisabilityEmp} onChange={e => setTotalDisabilityEmp(parseInt(e.target.value) || 0)} className="input-std font-black" /></div>
                    <div className="space-y-3"><label className="text-[10px] font-black uppercase text-slate-400">{"Fasilitas Akomodasi"}</label><div className="flex flex-wrap gap-2">{ACCOMMODATION_TYPES.map(acc => (<button key={acc} onClick={() => setMasterAcomodations(prev => prev.includes(acc) ? prev.filter(a => a !== acc) : [...prev, acc])} className={`px-4 py-2 rounded-xl text-[10px] font-bold border transition-all ${masterAcomodations.includes(acc) ? "bg-blue-600 text-white border-blue-600 shadow-md" : "bg-slate-50 text-slate-400"}`}>{acc}</button>))}</div></div>
                </div>
            </div>
        </div>
      )}

      {/* MANAJEMEN PELAMAR */}
      {activeTab === "applicants" && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8 animate-in fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6">
                <h2 className="text-xl font-black uppercase italic text-blue-600 flex items-center gap-2"><Users size={24}/> {"Daftar Pelamar Riset"}</h2>
                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100">
                    <Filter size={16} className="text-slate-400 ml-2"/><span className="text-[9px] font-black text-slate-400 uppercase">{"Filter Ragam:"}</span>
                    <select value={filterDisability} onChange={(e) => setFilterDisability(e.target.value)} className="bg-transparent border-none text-[10px] font-black uppercase text-blue-600 focus:ring-0">
                        <option value="Semua">{"Semua"}</option>
                        {DISABILITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left" aria-label="Tabel Pelamar">
                    <thead><tr className="border-b border-slate-100"><th className="px-4 py-4 text-[10px] font-black uppercase text-slate-400">{"Nama"}</th><th className="px-4 py-4 text-[10px] font-black uppercase text-slate-400">{"Posisi"}</th><th className="px-4 py-4 text-[10px] font-black uppercase text-slate-400">{"Ragam"}</th><th className="px-4 py-4 text-[10px] font-black uppercase text-slate-400">{"Status"}</th><th className="px-4 py-4 text-[10px] font-black uppercase text-slate-400 text-center">{"Aksi"}</th></tr></thead>
                    <tbody className="divide-y divide-slate-50">
                        {applicants.filter(a => filterDisability === "Semua" || a.profiles.disability_type === filterDisability).map((app) => (
                            <tr key={app.id} className="hover:bg-slate-50/50 transition-all group">
                                <td className="px-4 py-4 font-bold text-slate-700">{app.profiles.full_name}</td>
                                <td className="px-4 py-4 text-[10px] font-medium text-slate-500">{app.jobs.title}</td>
                                <td className="px-4 py-4"><span className="px-2 py-1 bg-purple-50 text-purple-600 rounded-md text-[8px] font-black uppercase">{app.profiles.disability_type}</span></td>
                                <td className="px-4 py-4">
                                    <select value={app.status} onChange={(e) => handleStatusChange(app.id, e.target.value)} className="bg-blue-50 text-blue-700 text-[9px] font-black uppercase px-2 py-1 rounded-lg border-none">
                                        <option value="pending">{"Pending"}</option><option value="interview">{"Interview"}</option><option value="accepted">{"Accepted"}</option><option value="rejected">{"Rejected"}</option>
                                    </select>
                                </td>
                                <td className="px-4 py-4 text-center">
                                  <div className="flex items-center justify-center gap-2">
                                    <button onClick={() => generateCompanyCV(app)} title="Cetak CV" className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"><FileDown size={18}/></button>
                                    <button title="Lihat Profil" className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"><Eye size={18}/></button>
                                  </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {/* LOWONGAN TAB */}
      {activeTab === "jobs" && (
        <div className="grid lg:grid-cols-5 gap-8 animate-in slide-in-from-right-4">
            <div className="lg:col-span-3 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8 text-slate-800">
                <div className="flex justify-between items-center border-b pb-4"><h2 className="text-xl font-black uppercase italic text-purple-600 flex items-center gap-2"><Plus/> {"Posting Lowongan"}</h2><button onClick={useTemplate} className="px-4 py-2 bg-orange-50 text-orange-700 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 transition-all"><Sparkles size={14}/> {"Pakai Template"}</button></div>
                <div className="space-y-6">
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">{"Judul Posisi"}</label><input value={jobTitle} onChange={e => setJobTitle(e.target.value)} className="input-std font-bold text-lg" /></div>
                    <div className="grid grid-cols-2 gap-4"><div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">{"Penempatan"}</label><select value={jobLocation} onChange={e => setJobLocation(e.target.value)} className="input-std">{INDONESIA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}</select></div><div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">{"Sistem"}</label><select value={jobWorkMode} onChange={e => setJobWorkMode(e.target.value)} className="input-std">{WORK_MODES.map(m => <option key={m} value={m}>{m}</option>)}</select></div></div>
                    <div className="space-y-3"><label className="text-[10px] font-black uppercase text-slate-400">{"Prioritas Disabilitas"}</label><div className="flex flex-wrap gap-2">{DISABILITY_TYPES.map(t => (<button key={t} onClick={() => setTargetDisabilities(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])} className={`px-4 py-2 rounded-xl text-[10px] font-bold border ${targetDisabilities.includes(t) ? "bg-purple-600 text-white border-purple-600" : "bg-slate-50 text-slate-400"}`}>{t}</button>))}</div></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">{"Deskripsi"}</label><textarea value={jobDesc} onChange={e => setJobDesc(e.target.value)} className="input-std h-60" /></div>
                    <button onClick={() => setIsPreview(true)} className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95"><Eye size={18}/> {"Pratinjau Lowongan"}</button>
                </div>
            </div>
            <div className="lg:col-span-2">
                {isPreview ? (
                    <div className="bg-white p-8 rounded-[2.5rem] border-4 border-blue-600 shadow-2xl space-y-6 sticky top-8">
                        <div className="flex justify-between items-center"><span className="text-[10px] font-black text-blue-600 uppercase">{"Tampilan Talenta"}</span><button onClick={() => setIsPreview(false)}><X size={20}/></button></div>
                        <h3 className="text-2xl font-black uppercase leading-tight">{jobTitle || "Judul Kosong"}</h3>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100"><p className="text-[9px] font-black text-slate-400 uppercase mb-2">{"Fasilitas Instansi"}</p><div className="flex flex-wrap gap-1">{masterAcomodations.map(a => <span key={a} className="text-[8px] font-bold text-slate-600 flex items-center gap-1"><CheckCircle2 size={10} className="text-green-500"/> {a}</span>)}</div></div>
                        <button onClick={handlePostJob} disabled={saving} className="w-full h-16 bg-blue-600 text-white rounded-2xl font-black text-lg uppercase flex items-center justify-center gap-3">{saving ? "MEMPROSES..." : "PUBLIKASIKAN"}</button>
                    </div>
                ) : (
                    <div className="bg-slate-50 p-10 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center text-slate-300 h-64 italic"><Clipboard size={40} className="mb-4 opacity-20"/><p>{"Pratinjau akan muncul di sini."}</p></div>
                )}
            </div>
        </div>
      )}
    </div>
  )
}
