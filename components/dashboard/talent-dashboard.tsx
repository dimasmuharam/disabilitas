"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { QRCodeSVG } from "qrcode.react"
// SINKRONISASI TOTAL DENGAN DATA STATIC
import { 
  INDONESIA_CITIES, UNIVERSITIES, DISABILITY_TOOLS, DISABILITY_TYPES,
  EDUCATION_LEVELS, EDUCATION_MODELS, SCHOLARSHIP_TYPES, WORK_MODES, SKILLS_LIST
} from "@/lib/data-static"
import { 
  User, GraduationCap, Briefcase, FileText, ShieldCheck, Save, 
  Edit3, Award, Plus, Trash2, MapPin, CheckCircle,
  Building2, ArrowRight, Share2, Stethoscope, Link as LinkIcon, Globe, Wifi, Laptop, Smartphone
} from "lucide-react"

export default function TalentDashboard({ user }: { user: any }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showConsentModal, setShowConsentModal] = useState(false)
  const [msg, setMsg] = useState("")
  const msgRef = useRef<HTMLDivElement>(null)

  // -- STATE DATA PROFIL (SINKRON DATABASE & DATA-STATIC) --
  const [fullName, setFullName] = useState("")
  const [city, setCity] = useState("")
  const [disabilityType, setDisabilityType] = useState("")
  const [lastEducation, setLastEducation] = useState("")
  const [educationModel, setEducationModel] = useState("")
  const [major, setMajor] = useState("") // Jurusan
  const [institutionName, setInstitutionName] = useState("")
  const [scholarshipType, setScholarshipType] = useState("")
  const [skills, setSkills] = useState("") 
  const [assistiveTools, setAssistiveTools] = useState("") 
  const [accommodations, setAccommodations] = useState("")
  
  // -- KESIAPAN KERJA & WFH --
  const [workPreference, setWorkPreference] = useState("")
  const [hasLaptop, setHasLaptop] = useState(false)
  const [hasSmartphone, setHasSmartphone] = useState(false)
  const [internetQuality, setInternetQuality] = useState("")

  // -- TAUTAN LUAR --
  const [linkedin, setLinkedin] = useState("")
  const [portfolioUrl, setPortfolioUrl] = useState("")
  const [resumeLink, setResumeLink] = useState("")
  const [proofLink, setProofLink] = useState("")
  
  const [careerStatus, setCareerStatus] = useState("Job Seeker")
  const [expectedSalary, setExpectedSalary] = useState("")
  const [isConsent, setIsConsent] = useState(false)

  // -- STATE RELASIONAL --
  const [certs, setCerts] = useState<any[]>([])
  const [workEx, setWorkEx] = useState<any[]>([])
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([])

  useEffect(() => {
    fetchInitialData()
  }, []) 

  async function fetchInitialData() {
    try {
      const { data: pData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (pData) {
        setFullName(pData.full_name || ""); setCity(pData.city || ""); setDisabilityType(pData.disability_type || "")
        setLastEducation(pData.education_level || ""); setEducationModel(pData.education_model || "")
        setMajor(pData.major || ""); setInstitutionName(pData.university || "")
        setScholarshipType(pData.scholarship_type || "")
        setWorkPreference(pData.work_preference || "")
        setHasLaptop(pData.has_laptop || false); setHasSmartphone(pData.has_smartphone || false)
        setInternetQuality(pData.internet_quality || "")
        setSkills(pData.skills ? pData.skills.join(", ") : "")
        setAssistiveTools(pData.used_assistive_tools ? pData.used_assistive_tools.join(", ") : "")
        setAccommodations(pData.preferred_accommodations ? pData.preferred_accommodations.join(", ") : "")
        setLinkedin(pData.linkedin_url || ""); setPortfolioUrl(pData.portfolio_url || "")
        setResumeLink(pData.resume_url || ""); setProofLink(pData.document_disability_url || "")
        setCareerStatus(pData.career_status || "Job Seeker"); setExpectedSalary(pData.expected_salary || "")
        setIsConsent(pData.has_informed_consent || false)
        
        if (!pData.has_informed_consent) setShowConsentModal(true)
      }

      const [cRes, wRes] = await Promise.all([
        supabase.from('certifications').select('*').eq('profile_id', user.id),
        supabase.from('work_experiences').select('*').eq('profile_id', user.id).order('is_current_work', { ascending: false })
      ])
      if (cRes.data) setCerts(cRes.data); if (wRes.data) setWorkEx(wRes.data)

      if (pData?.disability_type) {
        const { data: jData } = await supabase.from('jobs').select('*, companies(*)').contains('target_disabilities', [pData.disability_type]).limit(3)
        if (jData) setRecommendedJobs(jData)
      }
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  async function handleSaveProfile() {
    setSaving(true)
    const updates = {
      id: user.id, full_name: fullName, city, disability_type: disabilityType,
      education_level: lastEducation, education_model: educationModel, major,
      university: institutionName, scholarship_type: scholarshipType,
      work_preference: workPreference, has_laptop: hasLaptop, has_smartphone: hasSmartphone,
      internet_quality: internetQuality, portfolio_url: portfolioUrl,
      skills: skills.split(",").map(s => s.trim()).filter(s => s),
      used_assistive_tools: assistiveTools.split(",").map(t => t.trim()).filter(t => t),
      preferred_accommodations: accommodations.split(",").map(a => a.trim()).filter(a => a),
      linkedin_url: linkedin, resume_url: resumeLink, document_disability_url: proofLink,
      career_status: careerStatus, expected_salary: expectedSalary,
      has_informed_consent: isConsent, updated_at: new Date()
    }
    const { error } = await supabase.from('profiles').upsert(updates)
    if (!error) {
      setMsg("Data Profil & Riset berhasil diperbarui."); setIsEditing(false); fetchInitialData()
      setTimeout(() => msgRef.current?.focus(), 100)
    }
    setSaving(false)
  }

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-400">{"MENYINKRONKAN DATA..."}</div>

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-10">
      <a href="#main-content" className="sr-only focus:not-sr-only bg-blue-600 text-white p-4 absolute z-[100] rounded-b-xl">{"Loncat ke konten utama"}</a>

      {/* HEADER DASHBOARD */}
      <div id="main-content" className="flex flex-col md:flex-row justify-between items-center bg-slate-900 text-white p-8 rounded-3xl shadow-xl gap-6">
        <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black uppercase">{fullName ? fullName.substring(0,2) : "T"}</div>
            <div>
                <div ref={msgRef} tabIndex={-1} className="outline-none">
                    {msg && <p className="text-green-400 text-[10px] font-black uppercase mb-1">{"✅ "}{msg}</p>}
                    <h1 className="text-xl font-black uppercase tracking-tighter">{fullName || "Talenta Baru"}</h1>
                    <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest">{careerStatus}</p>
                </div>
            </div>
        </div>
        <button onClick={() => setIsEditing(!isEditing)} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border border-white/10 transition-all">
            {isEditing ? "Tutup Editor" : <><Edit3 size={14}/> {"Edit Profil & Riset"}</>}
        </button>
      </div>

      {isEditing ? (
        /* ================================= EDITOR MODE ================================= */
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-10">
            <h2 className="text-lg font-black uppercase italic text-blue-600 border-b pb-4">{"Pusat Pembaruan Data Talenta"}</h2>
            
            <div className="grid md:grid-cols-2 gap-10">
                {/* IDENTITAS */}
                <div className="space-y-4">
                    <h3 className="font-black text-[10px] uppercase text-slate-400 tracking-widest flex items-center gap-2"><User size={14}/> {"Identitas & Lokasi"}</h3>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">{"Nama Lengkap"}</label><input value={fullName} onChange={e => setFullName(e.target.value)} className="input-std font-bold" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">{"Jenis Disabilitas"}</label>
                        <select value={disabilityType} onChange={e => setDisabilityType(e.target.value)} className="input-std font-bold">
                            <option value="">{"-- Pilih --"}</option>
                            {DISABILITY_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-500">{"Kota Domisili"}</label>
                        <input list="city-list" value={city} onChange={e => setCity(e.target.value)} className="input-std" />
                        <datalist id="city-list">{INDONESIA_CITIES.map(c => <option key={c} value={c} />)}</datalist>
                    </div>
                </div>

                {/* PENDIDIKAN (RISET BRIN) */}
                <div className="space-y-4">
                    <h3 className="font-black text-[10px] uppercase text-slate-400 tracking-widest flex items-center gap-2"><GraduationCap size={14}/> {"Pendidikan"}</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">{"Jenjang"}</label>
                            <select value={lastEducation} onChange={e => setLastEducation(e.target.value)} className="input-std font-bold">
                                {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">{"Model"}</label>
                            <select value={educationModel} onChange={e => setEducationModel(e.target.value)} className="input-std font-bold">
                                {EDUCATION_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">{"Jurusan / Bidang Studi"}</label>
                        <input value={major} onChange={e => setMajor(e.target.value)} className="input-std font-bold" placeholder="Contoh: Administrasi, IT, SLB..." />
                    </div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">{"Nama Institusi"}</label>
                        <input list="uni-list" value={institutionName} onChange={e => setInstitutionName(e.target.value)} className="input-std" />
                        <datalist id="uni-list">{UNIVERSITIES.map(u => <option key={u} value={u} />)}</datalist>
                    </div>
                </div>
            </div>

            {/* PREFERENSI KERJA & KESIAPAN WFH */}
            <div className="pt-10 border-t space-y-6">
                <h3 className="font-black text-[10px] uppercase text-slate-400 tracking-widest flex items-center gap-2"><Briefcase size={14}/> {"Preferensi Kerja & Kesiapan Remote"}</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">{"Model Kerja Favorit"}</label>
                        <select value={workPreference} onChange={e => setWorkPreference(e.target.value)} className="input-std font-bold">
                            <option value="">{"-- Pilih Preferensi --"}</option>
                            {WORK_MODES.map(mode => <option key={mode} value={mode}>{mode}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">{"Koneksi Internet Utama"}</label>
                        <select value={internetQuality} onChange={e => setInternetQuality(e.target.value)} className="input-std font-bold text-blue-600">
                            <option value="">{"-- Pilih --"}</option>
                            <option value="Fiber Optic">{"Fiber Optic (Rumah)"}</option>
                            <option value="WiFi / Modem">{"WiFi / Modem Portable"}</option>
                            <option value="Selular">{"Kuota HP / Selular"}</option>
                        </select>
                    </div>
                </div>
                <div className="flex gap-8 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={hasLaptop} onChange={e => setHasLaptop(e.target.checked)} className="w-5 h-5 accent-blue-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{"Memiliki Laptop"}</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input type="checkbox" checked={hasSmartphone} onChange={e => setHasSmartphone(e.target.checked)} className="w-5 h-5 accent-blue-600" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{"Memiliki Smartphone"}</span>
                    </label>
                </div>
            </div>

            {/* TAUTAN & DOKUMEN */}
            <div className="pt-10 border-t grid md:grid-cols-2 gap-8">
                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">{"LinkedIn URL"}</label><input value={linkedin} onChange={e => setLinkedin(e.target.value)} className="input-std" placeholder="https://linkedin.com/in/..." /></div>
                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">{"Portfolio URL / Link Karya"}</label><input value={portfolioUrl} onChange={e => setPortfolioUrl(e.target.value)} className="input-std" placeholder="https://behance.net/ atau link drive..." /></div>
            </div>

            <button onClick={handleSaveProfile} disabled={saving} className="w-full h-16 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 flex items-center justify-center gap-3 transition-all">
                {saving ? "MENYIMPAN..." : <><Save size={20}/> {"Simpan Profil & Riset"}</>}
            </button>
        </div>
      ) : (
        /* ================================= VIEW MODE ================================= */
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                {/* DIGITAL ID CARD */}
                <section className="bg-slate-900 rounded-[2.5rem] p-8 flex flex-col md:flex-row gap-8 items-center border border-white/5">
                    <div className="w-full md:w-56 aspect-[3/4] bg-white rounded-2xl p-4 flex flex-col justify-between shadow-2xl">
                        <div className="flex justify-between items-start"><img src="/logo.png" className="h-4" /><ShieldCheck className="text-blue-600" size={20}/></div>
                        <div className="bg-slate-100 p-2 rounded-lg flex justify-center"><QRCodeSVG value={`${window.location.origin}/talent/${user.id}`} size={120} /></div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-tighter truncate">{fullName || "Talenta"}</p>
                            <p className="text-[8px] font-bold text-blue-600 uppercase tracking-widest">{disabilityType}</p>
                        </div>
                    </div>
                    <div className="flex-1 space-y-4 text-center md:text-left">
                        <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">{"Verified Talent Profile"}</h2>
                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                           {hasLaptop && <span className="bg-white/10 text-white px-3 py-1 rounded-full text-[9px] font-black flex items-center gap-1 uppercase tracking-widest"><Laptop size={12}/> {"Laptop Ready"}</span>}
                           <span className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-[9px] font-black flex items-center gap-1 uppercase tracking-widest"><Wifi size={12}/> {internetQuality || "Internet"}</span>
                        </div>
                        <p className="text-xs text-slate-400 italic">{"Data pendidikan dan kesiapan kerja Anda telah tersinkronisasi untuk riset nasional."}</p>
                        <div className="flex gap-3 justify-center md:justify-start">
                            {portfolioUrl && <a href={portfolioUrl} target="_blank" className="bg-white text-slate-900 p-3 rounded-xl hover:scale-105 transition-all"><Globe size={18}/></a>}
                            <button onClick={() => {}} className="bg-blue-600 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest">{"Bagikan Profil"}</button>
                        </div>
                    </div>
                </section>

                {/* RIWAYAT PENDIDIKAN DETAIL */}
                <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b pb-2 flex items-center gap-2"><GraduationCap size={14}/> {"Detail Akademik"}</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div><p className="text-[9px] font-black text-blue-600 uppercase mb-1">{"Institusi"}</p><p className="text-sm font-bold">{institutionName || "-"}</p></div>
                        <div><p className="text-[9px] font-black text-blue-600 uppercase mb-1">{"Jurusan"}</p><p className="text-sm font-bold uppercase">{major || "-"}</p></div>
                        <div><p className="text-[9px] font-black text-blue-600 uppercase mb-1">{"Model Sekolah"}</p><p className="text-sm font-bold">{educationModel || "-"}</p></div>
                        <div><p className="text-[9px] font-black text-blue-600 uppercase mb-1">{"Status Beasiswa"}</p><p className="text-sm font-bold">{scholarshipType || "-"}</p></div>
                    </div>
                </section>
            </div>

            <aside className="space-y-8">
                 {/* LOWONGAN REKOMENDASI */}
                 <section className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4">
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic flex items-center gap-2"><ArrowRight size={14} className="text-blue-600"/> {"Karir Untukmu"}</h2>
                    <div className="space-y-3">
                        {recommendedJobs.map(job => (
                            <div key={job.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                <h4 className="text-[10px] font-black uppercase leading-tight mb-1">{job.title}</h4>
                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{job.companies.name}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </aside>
        </div>
      )}
    </div>
  )
}
