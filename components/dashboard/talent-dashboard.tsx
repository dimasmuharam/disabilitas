"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { QRCodeSVG } from "qrcode.react"
// SINKRONISASI DATA STATIC
import { 
  INDONESIA_CITIES, UNIVERSITIES, DISABILITY_TOOLS, DISABILITY_TYPES,
  EDUCATION_LEVELS, EDUCATION_MODELS, SCHOLARSHIP_TYPES, WORK_MODES, SKILLS_LIST
} from "@/lib/data-static"
// SINKRONISASI ACTIONS
import { postInclusionRating } from "@/lib/actions/ratings"
import { 
  User, GraduationCap, Briefcase, FileText, ShieldCheck, Save, 
  Edit3, Award, Plus, Trash2, MapPin, Building2, ArrowRight, 
  Share2, Stethoscope, Globe, Wifi, Laptop, Smartphone, Star, Clock
} from "lucide-react"

export default function TalentDashboard({ user }: { user: any }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showConsentModal, setShowConsentModal] = useState(false)
  const [msg, setMsg] = useState("")
  const msgRef = useRef<HTMLDivElement>(null)

  // -- STATE DATA PROFIL (LENGKAP SESUAI TABEL DATABASE) --
  const [fullName, setFullName] = useState("")
  const [city, setCity] = useState("")
  const [disabilityType, setDisabilityType] = useState("")
  const [lastEducation, setLastEducation] = useState("")
  const [educationModel, setEducationModel] = useState("")
  const [major, setMajor] = useState("")
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

  // -- TAUTAN & PROFESIONAL --
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
  const [myApplications, setMyApplications] = useState<any[]>([])
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([])
  
  // -- STATE RATING --
  const [showRatingId, setShowRatingId] = useState<string | null>(null)
  const [ratingScores, setRatingScores] = useState({ accessibility: 5, culture: 5, management: 5, onboarding: 5 })

  const [newCertName, setNewCertName] = useState("")
  const [newJobTitle, setNewJobTitle] = useState("")
  const [newJobCompany, setNewJobCompany] = useState("")

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

      const [cRes, wRes, aRes] = await Promise.all([
        supabase.from('certifications').select('*').eq('profile_id', user.id),
        supabase.from('work_experiences').select('*').eq('profile_id', user.id).order('is_current_work', { ascending: false }),
        supabase.from('applications').select('*, jobs(*, companies(*))').eq('applicant_id', user.id)
      ])
      if (cRes.data) setCerts(cRes.data); if (wRes.data) setWorkEx(wRes.data); if (aRes.data) setMyApplications(aRes.data)

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
      setMsg("Data berhasil disinkronkan."); setIsEditing(false); fetchInitialData()
      setTimeout(() => msgRef.current?.focus(), 100)
    }
    setSaving(false)
  }

  // INTEGRASI DENGAN lib/actions/ratings.ts
  async function handlePostRating(companyId: string) {
    const result = await postInclusionRating({
        talentId: user.id,
        companyId: companyId,
        accessibility: ratingScores.accessibility,
        culture: ratingScores.culture,
        management: ratingScores.management,
        onboarding: ratingScores.onboarding
    })
    if(result.success) {
        setMsg("Rating Inklusi Berhasil Terkirim."); setShowRatingId(null); fetchInitialData()
    } else {
        setMsg(result.error || "Gagal mengirim rating")
    }
  }

  async function handleApply(jobId: string) {
    const { error } = await supabase.from('applications').insert({ job_id: jobId, applicant_id: user.id })
    if (!error) { setMsg("Lamaran berhasil dikirim!"); fetchInitialData() }
  }

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-400 italic">{"MENYIAPKAN PUSAT DATA INKLUSI..."}</div>

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-10">
      <a href="#main-content" className="sr-only focus:not-sr-only bg-blue-600 text-white p-4 absolute z-[100] rounded-b-xl">{"Loncat ke konten utama"}</a>

      {/* HEADER */}
      <div id="main-content" className="flex flex-col md:flex-row justify-between items-center bg-slate-900 text-white p-8 rounded-3xl shadow-xl gap-6">
        <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black uppercase italic">{fullName ? fullName.substring(0,2) : "T"}</div>
            <div ref={msgRef} tabIndex={-1} className="outline-none">
                {msg && <p className="text-green-400 text-[10px] font-black uppercase mb-1">{"✅ "}{msg}</p>}
                <h1 className="text-xl font-black uppercase tracking-tighter leading-none">{fullName || "Talenta Baru"}</h1>
                <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest">{careerStatus}</p>
            </div>
        </div>
        <button onClick={() => setIsEditing(!isEditing)} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-black text-[10px] uppercase tracking-widest border border-white/10 transition-all">
            {isEditing ? "Tutup Editor" : <><Edit3 size={14}/> {"Edit Profil & Riset"}</>}
        </button>
      </div>

      {isEditing ? (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-10">
            <h2 className="text-lg font-black uppercase italic text-blue-600 border-b pb-4">{"Pusat Pembaruan Data Talenta"}</h2>
            <div className="grid md:grid-cols-2 gap-10">
                {/* IDENTITAS */}
                <div className="space-y-4">
                    <h3 className="font-black text-[10px] uppercase text-slate-400 tracking-widest flex items-center gap-2"><User size={14}/> {"Identitas & Lokasi"}</h3>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">{"Nama Lengkap"}</label><input value={fullName} onChange={e => setFullName(e.target.value)} className="input-std font-bold" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">{"Jenis Disabilitas"}</label>
                        <select value={disabilityType} onChange={e => setDisabilityType(e.target.value)} className="input-std font-bold">
                            {DISABILITY_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">{"Kota"}</label><input list="city-list" value={city} onChange={e => setCity(e.target.value)} className="input-std" /><datalist id="city-list">{INDONESIA_CITIES.map(c => <option key={c} value={c} />)}</datalist></div>
                </div>
                {/* PENDIDIKAN */}
                <div className="space-y-4">
                    <h3 className="font-black text-[10px] uppercase text-slate-400 tracking-widest flex items-center gap-2"><GraduationCap size={14}/> {"Pendidikan"}</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <select value={lastEducation} onChange={e => setLastEducation(e.target.value)} className="input-std font-bold">{EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}</select>
                        <select value={educationModel} onChange={e => setEducationModel(e.target.value)} className="input-std font-bold">{EDUCATION_MODELS.map(m => <option key={m} value={m}>{m}</option>)}</select>
                    </div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">{"Jurusan"}</label><input value={major} onChange={e => setMajor(e.target.value)} className="input-std" placeholder="Contoh: Administrasi..." /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">{"Nama Institusi"}</label><input list="uni-list" value={institutionName} onChange={e => setInstitutionName(e.target.value)} className="input-std" /><datalist id="uni-list">{UNIVERSITIES.map(u => <option key={u} value={u} />)}</datalist></div>
                </div>
            </div>

            {/* KESIAPAN WFH (PENTING) */}
            <div className="pt-10 border-t space-y-6">
                <h3 className="font-black text-[10px] uppercase text-slate-400 tracking-widest flex items-center gap-2"><Briefcase size={14}/> {"Kesiapan Kerja Remote / WFH"}</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">{"Mode Kerja"}</label><select value={workPreference} onChange={e => setWorkPreference(e.target.value)} className="input-std font-bold">{WORK_MODES.map(mode => <option key={mode} value={mode}>{mode}</option>)}</select></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">{"Internet"}</label><select value={internetQuality} onChange={e => setInternetQuality(e.target.value)} className="input-std font-bold text-blue-600"><option value="Fiber Optic">{"Fiber"}</option><option value="WiFi">{"WiFi"}</option><option value="Selular">{"Kuota HP"}</option></select></div>
                </div>
                <div className="flex gap-8 p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                    <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={hasLaptop} onChange={e => setHasLaptop(e.target.checked)} className="w-5 h-5" /><span className="text-[10px] font-black uppercase">{"Laptop"}</span></label>
                    <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={hasSmartphone} onChange={e => setHasSmartphone(e.target.checked)} className="w-5 h-5" /><span className="text-[10px] font-black uppercase">{"Smartphone"}</span></label>
                </div>
            </div>

            {/* SKILLS & TOOLS */}
            <div className="pt-10 border-t grid md:grid-cols-2 gap-10">
                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">{"Keahlian"}</label><input list="skills-list" value={skills} onChange={e => setSkills(e.target.value)} className="input-std font-bold" /><datalist id="skills-list">{SKILLS_LIST.map(s => <option key={s} value={s} />)}</datalist></div>
                <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">{"Alat Bantu"}</label><input list="tools-list" value={assistiveTools} onChange={e => setAssistiveTools(e.target.value)} className="input-std" /><datalist id="tools-list">{DISABILITY_TOOLS.map(t => <option key={t} value={t} />)}</datalist></div>
            </div>

            <button onClick={handleSaveProfile} disabled={saving} className="w-full h-16 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">{saving ? "MENYIMPAN..." : <><Save size={20}/> {"Simpan Profil Riset"}</>}</button>
        </div>
      ) : (
        /* ================================= VIEW MODE ================================= */
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-10">
                {/* ID CARD */}
                <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 flex flex-col md:flex-row gap-8 items-center shadow-sm relative overflow-hidden">
                   <div className="bg-slate-900 p-6 rounded-3xl text-white w-full md:w-64 aspect-[3/4] flex flex-col justify-between relative border border-white/10 shadow-2xl">
                      <div className="flex justify-between items-start"><img src="/logo.png" className="h-4 opacity-50"/><ShieldCheck className="text-blue-500" size={24}/></div>
                      <div><h4 className="text-xl font-black uppercase mb-1 leading-tight">{fullName || "Talenta"}</h4><p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">{disabilityType}</p></div>
                      <div className="bg-white p-1 rounded-lg w-fit"><QRCodeSVG value={`${window.location.origin}/talent/${user.id}`} size={64} /></div>
                   </div>
                   <div className="flex-1 space-y-4">
                      <h3 className="text-3xl font-black uppercase italic tracking-tighter">{"Verified Identity"}</h3>
                      <div className="flex flex-wrap gap-2">
                        {hasLaptop && <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[9px] font-black flex items-center gap-1 uppercase tracking-widest"><Laptop size={12}/> {"Laptop"}</span>}
                        {portfolioUrl && <a href={portfolioUrl} target="_blank" className="bg-slate-100 p-2 rounded-xl"><Globe size={18}/></a>}
                      </div>
                      <button onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(fullName)}`)} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg"><Share2 size={16}/> {"Share Profil"}</button>
                   </div>
                </section>

                {/* TRACKER LAMARAN & RATING (SINKRON lib/actions/ratings.ts) */}
                <section className="space-y-6">
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><Clock size={16}/> {"Status Lamaran & Rating Inklusi"}</h2>
                    <div className="grid gap-4">
                        {myApplications.map(app => (
                            <div key={app.id} className="bg-white p-5 rounded-3xl border border-slate-200 flex justify-between items-center shadow-sm">
                                <div><h3 className="font-black text-xs uppercase mb-1">{app.jobs.title}</h3><p className="text-[10px] font-bold text-slate-400 uppercase">{app.jobs.companies.name}</p></div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${app.status === 'Hired' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{app.status}</span>
                                    {app.status === 'Hired' && (
                                        <button onClick={() => setShowRatingId(app.jobs.companies.id)} className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Star size={16}/></button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    {showRatingId && (
                        <div className="bg-orange-50 border-2 border-orange-200 p-6 rounded-3xl space-y-6">
                             <h4 className="text-sm font-black uppercase italic">{"Beri Rating Inklusi Perusahaan"}</h4>
                             <div className="grid grid-cols-2 gap-4">
                                {['accessibility', 'culture', 'management', 'onboarding'].map((k) => (
                                    <div key={k} className="flex flex-col gap-1">
                                        <label className="text-[9px] font-black uppercase text-slate-500">{k}</label>
                                        <input type="range" min="1" max="5" value={ratingScores[k as keyof typeof ratingScores]} onChange={e => setRatingScores({...ratingScores, [k]: parseInt(e.target.value)})} className="w-full accent-orange-500" />
                                    </div>
                                ))}
                             </div>
                             <div className="flex gap-2">
                                <button onClick={() => handlePostRating(showRatingId)} className="flex-1 py-3 bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase">{"Kirim Rating"}</button>
                                <button onClick={() => setShowRatingId(null)} className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase">{"Batal"}</button>
                             </div>
                        </div>
                    )}
                </section>
            </div>

            <div className="space-y-8">
                {/* SIDEBAR DETAIL RISET */}
                <section className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl space-y-6">
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-white/10 pb-2">{"Snapshot Inklusi"}</h2>
                    <div className="space-y-4">
                        <div><p className="text-[9px] font-black text-blue-400 uppercase mb-1">{"Pendidikan"}</p><p className="text-xs font-bold">{lastEducation} ({educationModel})</p></div>
                        <div><p className="text-[9px] font-black text-blue-400 uppercase mb-1">{"Alat Bantu"}</p><p className="text-xs font-bold">{assistiveTools || "-"}</p></div>
                    </div>
                </section>
                {/* SERTIFIKASI */}
                <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b pb-2 flex items-center gap-2"><Award size={14}/> {"Sertifikasi"}</h2>
                    <div className="space-y-3 mb-6">
                        {certs.map(c => (
                            <div key={c.id} className="text-[10px] font-bold p-3 bg-slate-50 rounded-xl flex justify-between items-center group">
                                {c.name}
                                <button onClick={async () => {
                                    await supabase.from('certifications').delete().eq('id', c.id)
                                    setCerts(certs.filter(item => item.id !== c.id))
                                }} className="text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={12}/></button>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input value={newCertName} onChange={e => setNewCertName(e.target.value)} placeholder="Nama..." className="flex-1 bg-slate-100 rounded-lg px-3 py-2 text-[10px] font-bold" />
                        <button onClick={async () => {
                            if(!newCertName) return
                            const { data } = await supabase.from('certifications').insert({ profile_id: user.id, name: newCertName }).select().single()
                            if(data) { setCerts([...certs, data]); setNewCertName("") }
                        }} className="p-2 bg-slate-900 text-white rounded-lg"><Plus size={16}/></button>
                    </div>
                </section>
            </div>
        </div>
      )}
    </div>
  )
}
