"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { QRCodeSVG } from "qrcode.react"
// SINKRONISASI TOTAL DENGAN DATA STATIC
import { 
  INDONESIA_CITIES, UNIVERSITIES, DISABILITY_TOOLS, DISABILITY_TYPES,
  EDUCATION_LEVELS, EDUCATION_MODELS, SCHOLARSHIP_TYPES, EDUCATION_BARRIERS,
  ACCOMMODATION_TYPES, SKILLS_LIST
} from "@/lib/data-static"
import { 
  User, GraduationCap, Briefcase, FileText, ShieldCheck, Save, 
  Edit3, ExternalLink, Award, Plus, Trash2, MapPin, CheckCircle,
  Search, Clock, Building2, ArrowRight, Share2, Send, Youtube, Phone, Info,
  Coins, Star, Heart, Stethoscope, Link as LinkIcon
} from "lucide-react"

export default function TalentDashboard({ user }: { user: any }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showConsentModal, setShowConsentModal] = useState(false)
  const [msg, setMsg] = useState("")
  const msgRef = useRef<HTMLDivElement>(null)

  // -- STATE DATA PROFIL (SINKRON DENGAN DATABASE & DATA-STATIC) --
  const [fullName, setFullName] = useState("")
  const [city, setCity] = useState("")
  const [disabilityType, setDisabilityType] = useState("")
  const [lastEducation, setLastEducation] = useState("")
  const [educationModel, setEducationModel] = useState("")
  const [institutionName, setInstitutionName] = useState("")
  const [scholarshipType, setScholarshipType] = useState("")
  const [educationBarrier, setEducationBarrier] = useState("")
  const [skills, setSkills] = useState("") 
  const [assistiveTools, setAssistiveTools] = useState("") 
  const [accommodations, setAccommodations] = useState("")
  const [linkedin, setLinkedin] = useState("")
  const [resumeLink, setResumeLink] = useState("")
  const [proofLink, setProofLink] = useState("")
  const [isConsent, setIsConsent] = useState(false)
  const [commPreference, setCommPreference] = useState("WhatsApp")
  const [videoIntroUrl, setVideoIntroUrl] = useState("")
  const [careerStatus, setCareerStatus] = useState("Job Seeker")
  const [expectedSalary, setExpectedSalary] = useState("")

  // -- STATE AKTIVITAS RELASIONAL --
  const [certs, setCerts] = useState<any[]>([])
  const [workEx, setWorkEx] = useState<any[]>([])
  const [myApplications, setMyApplications] = useState<any[]>([])
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([])
  
  // -- STATE RATING/SURVEY --
  const [showRatingId, setShowRatingId] = useState<string | null>(null)
  const [ratingScores, setRatingScores] = useState({ accessibility: 5, culture: 5, management: 5, onboarding: 5 })

  const [newCertName, setNewCertName] = useState("")
  const [newJobTitle, setNewJobTitle] = useState("")
  const [newJobCompany, setNewJobCompany] = useState("")

  const publicProfileUrl = typeof window !== 'undefined' ? `${window.location.origin}/talent/${user.id}` : ""

  useEffect(() => {
    fetchInitialData()
  }, []) 

  async function fetchInitialData() {
    try {
      const { data: pData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (pData) {
        setFullName(pData.full_name || ""); setCity(pData.city || ""); setDisabilityType(pData.disability_type || "")
        setLastEducation(pData.education_level || ""); setEducationModel(pData.education_model || "")
        setInstitutionName(pData.university || ""); setScholarshipType(pData.scholarship_type || "")
        setEducationBarrier(pData.education_barrier || "")
        setSkills(pData.skills ? pData.skills.join(", ") : "")
        setAssistiveTools(pData.used_assistive_tools ? pData.used_assistive_tools.join(", ") : "")
        setAccommodations(pData.preferred_accommodations ? pData.preferred_accommodations.join(", ") : "")
        setLinkedin(pData.linkedin_url || ""); setResumeLink(pData.resume_url || ""); setProofLink(pData.document_disability_url || "")
        setIsConsent(pData.has_informed_consent || false)
        setCommPreference(pData.communication_preference || "WhatsApp")
        setVideoIntroUrl(pData.video_intro_url || "")
        setCareerStatus(pData.career_status || "Job Seeker"); setExpectedSalary(pData.expected_salary || "")
        
        if (!pData.has_informed_consent) setShowConsentModal(true)
        if (!pData.full_name) setIsEditing(true)
      } else { setShowConsentModal(true); setIsEditing(true) }

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
      education_level: lastEducation, education_model: educationModel,
      university: institutionName, scholarship_type: scholarshipType,
      education_barrier: educationBarrier,
      skills: skills.split(",").map(s => s.trim()).filter(s => s),
      used_assistive_tools: assistiveTools.split(",").map(t => t.trim()).filter(t => t),
      preferred_accommodations: accommodations.split(",").map(a => a.trim()).filter(a => a),
      linkedin_url: linkedin, resume_url: resumeLink, document_disability_url: proofLink,
      communication_preference: commPreference, video_intro_url: videoIntroUrl,
      career_status: careerStatus, expected_salary: expectedSalary,
      has_informed_consent: isConsent, updated_at: new Date()
    }
    const { error } = await supabase.from('profiles').upsert(updates)
    if (!error) {
      setMsg("Data Talent & Riset berhasil diperbarui."); setIsEditing(false); fetchInitialData()
      setTimeout(() => msgRef.current?.focus(), 100)
    }
    setSaving(false)
  }

  async function handleAddWork() {
    if(!newJobTitle || !newJobCompany) return
    const { data } = await supabase.from('work_experiences').insert({
        profile_id: user.id, position: newJobTitle, company_name: newJobCompany,
        is_current_work: workEx.length === 0 
    }).select().single()
    if(data) { setWorkEx([data, ...workEx]); setNewJobTitle(""); setNewJobCompany("") }
  }

  async function handlePostRating(companyId: string) {
    const { error } = await supabase.from('inclusion_ratings').insert({
        talent_id: user.id, company_id: companyId,
        score_accessibility: ratingScores.accessibility, score_culture: ratingScores.culture,
        score_management: ratingScores.management, score_onboarding: ratingScores.onboarding
    })
    if(!error) { setMsg("Penilaian inklusi berhasil dikirim!"); setShowRatingId(null); fetchInitialData() }
  }

  async function handleApply(jobId: string) {
    const { error } = await supabase.from('applications').insert({ job_id: jobId, applicant_id: user.id })
    if (!error) { setMsg("Lamaran terkirim!"); fetchInitialData(); }
  }

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-400 italic">{"MENYINKRONKAN DATA RISET..."}</div>

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-10">
      <a href="#main-content" className="sr-only focus:not-sr-only bg-blue-600 text-white p-4 absolute z-[100] rounded-b-xl">{"Loncat ke konten utama"}</a>

      {showConsentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-10 border-4 border-blue-600 shadow-2xl">
            <h2 className="text-2xl font-black mb-4 uppercase italic">{"Informed Consent"}</h2>
            <p className="text-sm text-slate-600 mb-8 leading-relaxed font-medium">{"Saya setuju data saya dikelola oleh disabilitas.com untuk keperluan rekrutmen inklusif dan riset nasional BRIN secara anonim."}</p>
            <button onClick={() => {setIsConsent(true); setShowConsentModal(false)}} className="w-full py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest transition-all">{"Setuju & Lanjutkan"}</button>
          </div>
        </div>
      )}

      {/* HEADER DASHBOARD */}
      <div id="main-content" className="flex flex-col md:flex-row justify-between items-center bg-slate-900 text-white p-8 rounded-3xl shadow-xl gap-6">
        <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl font-black uppercase shadow-inner">{fullName ? fullName.substring(0,2) : "T"}</div>
            <div>
                <div ref={msgRef} tabIndex={-1} className="outline-none">
                    {msg && <p className="text-green-400 text-[10px] font-black uppercase mb-2 animate-pulse">{"✅ "}{msg}</p>}
                    <h1 className="text-2xl font-black tracking-tighter uppercase mb-1 leading-none">{fullName || "Talenta Baru"}</h1>
                    <p className="text-blue-400 text-xs font-bold flex items-center gap-2 italic mt-1"><Briefcase size={14}/> {careerStatus}</p>
                </div>
            </div>
        </div>
        <button onClick={() => setIsEditing(!isEditing)} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 border border-white/10 transition-all shadow-lg">
            {isEditing ? "Tutup Editor" : <><Edit3 size={16}/> {"Edit Profil & Riset"}</>}
        </button>
      </div>

      {isEditing ? (
        /* ================================= EDITOR MODE (SINKRON DATA-STATIC) ================================= */
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm animate-in slide-in-from-top-4 space-y-12">
            <h2 className="text-xl font-black uppercase border-b pb-4 flex items-center gap-2 text-blue-600 italic">{"Pembaruan Pusat Data Talenta"}</h2>
            
            <div className="grid md:grid-cols-2 gap-10">
                {/* IDENTITAS DASAR */}
                <div className="space-y-6">
                    <h3 className="font-black text-[10px] uppercase text-slate-400 tracking-widest flex items-center gap-2"><User size={14}/> {"Dasar & Lokasi"}</h3>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">{"Nama Lengkap"}</label><input value={fullName} onChange={e => setFullName(e.target.value)} className="input-std font-bold" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">{"Jenis Disabilitas"}</label>
                        <select value={disabilityType} onChange={e => setDisabilityType(e.target.value)} className="input-std font-bold">
                            <option value="">{"-- Pilih Jenis --"}</option>
                            {DISABILITY_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-500">{"Domisili (Kota)"}</label>
                        <input list="city-list" value={city} onChange={e => setCity(e.target.value)} className="input-std" />
                        <datalist id="city-list">{INDONESIA_CITIES.map(c => <option key={c} value={c} />)}</datalist>
                    </div>
                </div>

                {/* RISET PENDIDIKAN (KUNCI ANALISA BRIN) */}
                <div className="space-y-6">
                    <h3 className="font-black text-[10px] uppercase text-slate-400 tracking-widest flex items-center gap-2"><GraduationCap size={14}/> {"Riwayat Pendidikan"}</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">{"Jenjang Terakhir"}</label>
                            <select value={lastEducation} onChange={e => setLastEducation(e.target.value)} className="input-std font-bold">
                                {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">{"Model Sekolah"}</label>
                            <select value={educationModel} onChange={e => setEducationModel(e.target.value)} className="input-std font-bold text-blue-600">
                                <option value="">{"-- Pilih Model --"}</option>
                                {EDUCATION_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-500">{"Nama Kampus / Sekolah"}</label>
                        <input list="uni-list" value={institutionName} onChange={e => setInstitutionName(e.target.value)} className="input-std" />
                        <datalist id="uni-list">{UNIVERSITIES.map(u => <option key={u} value={u} />)}</datalist>
                    </div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">{"Status Beasiswa"}</label>
                        <select value={scholarshipType} onChange={e => setScholarshipType(e.target.value)} className="input-std font-bold">
                            {SCHOLARSHIP_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* AKOMODASI & ALAT BANTU (RISET INKLUSI) */}
            <div className="pt-10 border-t space-y-8">
                <h3 className="font-black text-[10px] uppercase text-slate-400 tracking-widest flex items-center gap-2"><Stethoscope size={14}/> {"Aksesibilitas & Kebutuhan"}</h3>
                <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-500">{"Alat Bantu Utama (Pisahkan dengan koma)"}</label>
                        <input list="tools-list" value={assistiveTools} onChange={e => setAssistiveTools(e.target.value)} className="input-std" placeholder="NVDA, Kursi Roda, dll" />
                        <datalist id="tools-list">{DISABILITY_TOOLS.map(t => <option key={t} value={t} />)}</datalist>
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-500">{"Kebutuhan Akomodasi Kerja"}</label>
                        <input list="acc-list" value={accommodations} onChange={e => setAccommodations(e.target.value)} className="input-std" placeholder="JBI, Ramp, dll" />
                        <datalist id="acc-list">{ACCOMMODATION_TYPES.map(a => <option key={a} value={a} />)}</datalist>
                    </div>
                </div>
            </div>

            <button onClick={handleSaveProfile} disabled={saving} className="w-full h-16 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 flex items-center justify-center gap-3 transition-all active:scale-95">
                {saving ? "MENYELARASKAN..." : <><Save size={20}/> {"Simpan Profil & Sinkronkan Riset"}</>}
            </button>
        </div>
      ) : (
        /* ================================= VIEW MODE (DASHBOARD AKTIF) ================================= */
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                {/* ID CARD DIGITAL */}
                <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-[2.5rem] p-1 shadow-2xl relative overflow-hidden group">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 flex flex-col md:flex-row gap-8 items-center relative z-10">
                        <div className="w-full md:w-64 aspect-[3/4] bg-slate-950 rounded-3xl p-6 text-white flex flex-col justify-between shadow-2xl relative border border-white/10">
                            <div className="flex justify-between items-start"><img src="/logo.png" className="h-6 object-contain" /><ShieldCheck className="text-blue-500" size={24}/></div>
                            <div>
                                <h3 className="text-xl font-black leading-tight mb-1 uppercase tracking-tighter">{fullName || "Talenta"}</h3>
                                <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4">{disabilityType || "Tipe Disabilitas"}</p>
                            </div>
                            <div className="flex justify-between items-end border-t border-white/10 pt-4">
                                <div className="bg-white p-1 rounded-lg"><QRCodeSVG value={publicProfileUrl} size={64} /></div>
                                <p className="text-[8px] font-black text-slate-500 text-right uppercase italic leading-tight">{"Verified"}<br/>{"Talent ID"}</p>
                            </div>
                        </div>
                        <div className="flex-1 text-center md:text-left space-y-4">
                            <h2 className="text-3xl font-black tracking-tighter italic uppercase">{"Verified Identity"}</h2>
                            <p className="text-sm text-slate-500 font-medium leading-relaxed italic">{"Identitas kepakaran Anda telah terverifikasi secara nasional untuk riset dan industri."}</p>
                            <button onClick={handleShare} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3 hover:bg-blue-700 shadow-lg active:scale-95 transition-all"><Share2 size={18}/> {"Share Profil"}</button>
                        </div>
                    </div>
                </section>

                {/* LOWONGAN REKOMENDASI */}
                <section className="space-y-6">
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 italic"><ArrowRight size={18} className="text-blue-600"/> {"Rekomendasi Karir Inklusif"}</h2>
                    <div className="grid gap-4">
                        {recommendedJobs.map(job => (
                            <div key={job.id} className="bg-white p-6 rounded-3xl border border-slate-200 flex justify-between items-center group hover:border-blue-300 transition-all shadow-sm">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400"><Building2 size={24}/></div>
                                    <div><h4 className="font-black text-sm uppercase leading-none mb-1">{job.title}</h4><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{job.companies.name}</p></div>
                                </div>
                                <button onClick={() => handleApply(job.id)} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all">{"Lamar Sekarang"}</button>
                            </div>
                        ))}
                    </div>
                </section>
                
                {/* MANAJEMEN RIWAYAT KERJA */}
                <section className="space-y-6">
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 flex items-center gap-2"><Briefcase size={16}/> {"Pengalaman Karir"}</h2>
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
                        {workEx.map(w => (
                            <div key={w.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                                <div><h4 className="font-black text-sm uppercase">{w.position}</h4><p className="text-[10px] font-bold text-slate-400 uppercase">{w.company_name}</p></div>
                                <button onClick={async () => {
                                    await supabase.from('work_experiences').delete().eq('id', w.id)
                                    setWorkEx(workEx.filter(item => item.id !== w.id))
                                }} className="text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                            </div>
                        ))}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t">
                            <input value={newJobTitle} onChange={e => setNewJobTitle(e.target.value)} placeholder="Posisi..." className="input-std text-xs font-bold uppercase" />
                            <input value={newJobCompany} onChange={e => setNewJobCompany(e.target.value)} placeholder="Perusahaan..." className="input-std text-xs font-bold uppercase" />
                            <button onClick={handleAddWork} className="bg-slate-900 text-white rounded-xl font-bold text-[10px] uppercase flex items-center justify-center gap-2 h-10"><Plus size={14}/> {"Tambah"}</button>
                        </div>
                    </div>
                </section>
            </div>

            <div className="space-y-8">
                {/* STATUS RISET SIDEBAR */}
                <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b pb-2">{"Snapshot Riset"}</h2>
                    <div className="space-y-4">
                        <div><p className="text-[9px] font-black text-blue-600 uppercase mb-1">{"Pendidikan"}</p><p className="text-xs font-bold">{lastEducation} ({educationModel})</p></div>
                        <div><p className="text-[9px] font-black text-blue-600 uppercase mb-1">{"Beasiswa"}</p><p className="text-xs font-bold">{scholarshipType}</p></div>
                        <div><p className="text-[9px] font-black text-blue-600 uppercase mb-1">{"Alat Bantu"}</p><p className="text-xs font-bold leading-relaxed">{assistiveTools || "-"}</p></div>
                    </div>
                </section>

                {/* SERTIFIKASI */}
                <section className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl">
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2"><Award size={14} className="text-orange-400"/> {"Sertifikasi"}</h2>
                    <div className="space-y-3 mb-6">
                        {certs.map(c => (
                            <div key={c.id} className="text-[10px] font-bold p-3 bg-white/5 rounded-xl border border-white/10 flex justify-between items-center group">
                                {c.name}
                                <button onClick={async () => {
                                    await supabase.from('certifications').delete().eq('id', c.id)
                                    setCerts(certs.filter(item => item.id !== c.id))
                                }} className="text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={12}/></button>
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input value={newCertName} onChange={e => setNewCertName(e.target.value)} placeholder="Nama Sertifikat..." className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-[10px] font-bold" />
                        <button onClick={async () => {
                            if(!newCertName) return
                            const { data } = await supabase.from('certifications').insert({ profile_id: user.id, name: newCertName }).select().single()
                            if(data) { setCerts([...certs, data]); setNewCertName("") }
                        }} className="p-2 bg-blue-600 rounded-lg h-10 w-10 flex items-center justify-center"><Plus size={16}/></button>
                    </div>
                </section>
            </div>
        </div>
      )}
    </div>
  )
}
