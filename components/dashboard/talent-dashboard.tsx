"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { QRCodeSVG } from "qrcode.react"
import { 
  INDONESIA_CITIES, UNIVERSITIES, DISABILITY_TOOLS, DISABILITY_TYPES,
  EDUCATION_LEVELS, EDUCATION_MODELS, SCHOLARSHIP_TYPES, EDUCATION_BARRIERS,
  ACCOMMODATION_TYPES, SKILLS_LIST
} from "@/lib/data-static"
import { 
  User, GraduationCap, Briefcase, FileText, ShieldCheck, Save, 
  Edit3, ExternalLink, Award, Plus, Trash2, MapPin, CheckCircle,
  Search, Clock, Building2, ArrowRight, Share2, Send, Youtube, Phone, Info,
  Coins, BriefcaseBusiness
} from "lucide-react"

export default function TalentDashboard({ user }: { user: any }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showConsentModal, setShowConsentModal] = useState(false)
  const [msg, setMsg] = useState("")
  const msgRef = useRef<HTMLDivElement>(null)

  // -- STATE DATA PROFIL --
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
  
  // -- FITUR MANAJEMEN TALENTA --
  const [commPreference, setCommPreference] = useState("WhatsApp")
  const [videoIntroUrl, setVideoIntroUrl] = useState("")
  const [careerStatus, setCareerStatus] = useState("Job Seeker")
  const [expectedSalary, setExpectedSalary] = useState("")

  // -- STATE AKTIVITAS (RELASIONAL) --
  const [certs, setCerts] = useState<any[]>([])
  const [workEx, setWorkEx] = useState<any[]>([])
  const [myApplications, setMyApplications] = useState<any[]>([])
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([])
  
  // Temporary State for Add New
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
        setCareerStatus(pData.career_status || "Job Seeker")
        setExpectedSalary(pData.expected_salary || "")
        
        if (!pData.has_informed_consent) setShowConsentModal(true)
        if (!pData.full_name) setIsEditing(true)
      } else {
        setShowConsentModal(true); setIsEditing(true)
      }

      // Load Certifications
      const { data: cData } = await supabase.from('certifications').select('*').eq('profile_id', user.id)
      if (cData) setCerts(cData)

      // Load Work Experiences
      const { data: wData } = await supabase.from('work_experiences').select('*').eq('profile_id', user.id).order('is_current_work', { ascending: false })
      if (wData) setWorkEx(wData)

      // Load Applications
      const { data: aData } = await supabase.from('applications').select('*, jobs(*, companies(*))').eq('profile_id', user.id)
      if (aData) setMyApplications(aData)

      // Job Recommendations
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
      setMsg("Data Talent berhasil diperbarui dan disinkronkan.")
      setIsEditing(false)
      fetchInitialData()
      setTimeout(() => msgRef.current?.focus(), 100)
    }
    setSaving(false)
  }

  async function handleAddWork() {
    if(!newJobTitle || !newJobCompany) return
    const { data } = await supabase.from('work_experiences').insert({
        profile_id: user.id,
        position: newJobTitle,
        company_name: newJobCompany,
        is_current_work: workEx.length === 0 // Default true if first entry
    }).select().single()
    if(data) {
        setWorkEx([data, ...workEx])
        setNewJobTitle(""); setNewJobCompany("")
    }
  }

  async function handleApply(jobId: string) {
    const { error } = await supabase.from('applications').insert({ job_id: jobId, profile_id: user.id })
    if (!error) fetchInitialData()
  }

  const handleShare = () => {
    const text = `Halo! Saya ${fullName}, profil kepakaran saya sebagai talenta disabilitas kini telah terverifikasi di disabilitas.com. Cek profil profesional saya di sini: ${publicProfileUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-400">MENYELARASKAN DATA MANAJEMEN TALENTA...</div>

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-10">
      <a href="#main-content" className="sr-only focus:not-sr-only bg-blue-600 text-white p-4 absolute z-[100] rounded-b-xl">Loncat ke konten utama</a>

      {showConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 border-4 border-blue-600 shadow-2xl">
            <h2 className="text-2xl font-black mb-4 uppercase italic tracking-tighter">Informed Consent</h2>
            <p className="text-sm text-slate-600 mb-8 leading-relaxed">
              Saya setuju data saya dikelola oleh disabilitas.com untuk keperluan rekrutmen inklusif dan riset nasional secara anonim.
            </p>
            <button onClick={() => {setIsConsent(true); setShowConsentModal(false)}} className="w-full py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all">Setuju & Lanjutkan</button>
          </div>
        </div>
      )}

      {/* HEADER DASHBOARD */}
      <div id="main-content" className="flex flex-col md:flex-row justify-between items-center bg-slate-900 text-white p-8 rounded-3xl shadow-xl gap-6">
        <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl font-black shadow-inner uppercase">{fullName ? fullName.substring(0,2) : "T"}</div>
            <div>
                <div ref={msgRef} tabIndex={-1} className="outline-none">
                    {msg && <p className="text-green-400 text-[10px] font-black uppercase mb-2 tracking-widest animate-pulse">✅ {msg}</p>}
                    <h1 className="text-2xl font-black tracking-tighter uppercase mb-1">{fullName || "Talenta Baru"}</h1>
                    <p className="text-blue-400 text-sm font-bold flex items-center gap-2 italic"><BriefcaseBusiness size={14}/> {careerStatus}</p>
                </div>
            </div>
        </div>
        <button onClick={() => setIsEditing(!isEditing)} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 border border-white/10 transition-all">
            {isEditing ? "Tutup Editor" : <><Edit3 size={16}/> Edit Profil</>}
        </button>
      </div>

      {!isEditing && fullName && (
        <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 rounded-[2.5rem] p-1 shadow-2xl overflow-hidden relative group">
            <div className="bg-white dark:bg-slate-900 rounded-[2.4rem] p-8 flex flex-col md:flex-row gap-8 items-center relative z-10">
                <div className="w-full md:w-72 aspect-[3/4] bg-slate-950 rounded-3xl p-6 text-white flex flex-col justify-between shadow-2xl relative overflow-hidden border border-white/10">
                    <div className="flex justify-between items-start">
                        <img src="/logo.png" alt="Logo Disabilitas.com" className="h-6 object-contain" />
                        <ShieldCheck className="text-blue-500" size={24}/>
                    </div>
                    <div>
                        <h3 className="text-xl font-black leading-tight mb-1 uppercase tracking-tighter">{fullName}</h3>
                        <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4">{disabilityType}</p>
                        <div className="space-y-1">
                            <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Keahlian Utama</p>
                            <p className="text-[10px] font-bold truncate">{skills.split(',')[0] || "General Talent"}</p>
                        </div>
                    </div>
                    <div className="flex justify-between items-end border-t border-white/10 pt-4">
                        <div className="bg-white p-1 rounded-lg"><QRCodeSVG value={publicProfileUrl} size={64} /></div>
                        <p className="text-[8px] font-black text-slate-500 text-right uppercase leading-tight italic">Verified<br/>Talent ID</p>
                    </div>
                </div>

                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-3xl font-black tracking-tighter mb-4 italic uppercase">Identity Card</h2>
                    <p className="text-slate-500 font-medium mb-6 leading-relaxed max-w-lg">
                        Bagikan kartu identitas profesional Anda. Tunjukkan kepada dunia bahwa disabilitas bukan halangan untuk berkompetisi secara bonafit.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                        <button onClick={handleShare} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95"><Share2 size={20}/> Share WhatsApp</button>
                        <a href={publicProfileUrl} target="_blank" className="bg-slate-100 text-slate-800 px-8 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 hover:bg-slate-200 border border-slate-200"><ExternalLink size={20}/> Profil Publik</a>
                    </div>
                </div>
            </div>
        </section>
      )}

      {isEditing ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm animate-in slide-in-from-top-4 space-y-12">
            <h2 className="text-xl font-black uppercase mb-8 border-b pb-4 flex items-center gap-2 text-blue-600"><Edit3 size={20}/> Pembaruan Data Talenta</h2>
            
            <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <h3 className="font-black text-[10px] uppercase text-slate-400 tracking-widest flex items-center gap-2"><BriefcaseBusiness size={14}/> Status Profesional</h3>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">Status Karir</label>
                        <select value={careerStatus} onChange={e => setCareerStatus(e.target.value)} className="input-std font-bold text-blue-600">
                            <option value="Job Seeker">Aktif Mencari Kerja</option>
                            <option value="Employed (Open)">Bekerja (Terbuka Peluang)</option>
                            <option value="Employed (Fixed)">Bekerja (Tidak Mencari Kerja)</option>
                            <option value="Entrepreneur">Wirausaha / Freelancer</option>
                        </select>
                    </div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">Gaji Diharapkan (Opsional)</label><input value={expectedSalary} onChange={e => setExpectedSalary(e.target.value)} className="input-std" placeholder="Contoh: 5-7 Juta" /></div>
                </div>

                <div className="space-y-6">
                    <h3 className="font-black text-[10px] uppercase text-slate-400 tracking-widest flex items-center gap-2"><Phone size={14}/> Komunikasi</h3>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">Preferensi Dihubungi</label>
                        <select value={commPreference} onChange={e => setCommPreference(e.target.value)} className="input-std">
                            <option value="WhatsApp">WhatsApp</option><option value="Email">Email</option><option value="Telepon">Panggilan Suara</option>
                        </select>
                    </div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">Kota Domisili (Hybrid)</label><input list="city-list" value={city} onChange={e => setCity(e.target.value)} className="input-std" /><datalist id="city-list">{INDONESIA_CITIES.map(c => <option key={c} value={c} />)}</datalist></div>
                </div>
            </div>

            <div className="space-y-6 pt-10 border-t">
                <h3 className="font-black text-[10px] uppercase text-slate-400 tracking-widest flex items-center gap-2"><Youtube size={16} className="text-red-600"/> Video Intro YouTube</h3>
                <input type="url" value={videoIntroUrl} onChange={e => setVideoIntroUrl(e.target.value)} className="input-std" placeholder="Link video perkenalan..." />
            </div>

            <button onClick={handleSaveProfile} disabled={saving} className="w-full h-16 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 flex items-center justify-center gap-3">
                {saving ? "Menyelaraskan..." : <><Save size={20}/> Simpan & Sinkronkan Profil</>}
            </button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                {/* TRACKER LAMARAN */}
                <section>
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2"><Clock size={16}/> Lamaran Aktif</h2>
                    <div className="grid gap-4">
                        {myApplications.map(app => (
                            <div key={app.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center"><Building2 className="text-slate-400" /></div>
                                    <div><h3 className="font-black text-sm uppercase">{app.jobs.title}</h3><p className="text-[10px] font-bold text-slate-400 uppercase">{app.jobs.companies.name}</p></div>
                                </div>
                                <div className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-100 text-blue-700">{app.status}</div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* MANAJEMEN RIWAYAT KERJA */}
                <section>
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2"><Briefcase size={16}/> Pengalaman Karir</h2>
                    <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
                        {workEx.map(w => (
                            <div key={w.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                                <div>
                                    <h4 className="font-black text-sm uppercase">{w.position}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">{w.company_name} {w.is_current_work && <span className="text-blue-600">(Saat Ini)</span>}</p>
                                </div>
                                <button onClick={async () => {
                                    await supabase.from('work_experiences').delete().eq('id', w.id)
                                    setWorkEx(workEx.filter(item => item.id !== w.id))
                                }} className="text-red-400 opacity-0 group-hover:opacity-100"><Trash2 size={16}/></button>
                            </div>
                        ))}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t">
                            <input value={newJobTitle} onChange={e => setNewJobTitle(e.target.value)} placeholder="Posisi..." className="input-std text-xs" />
                            <input value={newJobCompany} onChange={e => setNewJobCompany(e.target.value)} placeholder="Perusahaan..." className="input-std text-xs" />
                            <button onClick={handleAddWork} className="bg-slate-900 text-white rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2"><Plus size={14}/> Tambah</button>
                        </div>
                    </div>
                </section>
            </div>

            <div className="space-y-8">
                {/* SIDEBAR SUMMARY */}
                <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 border-b pb-2">Status Riset</h2>
                    <div className="space-y-4">
                        <div><p className="text-[9px] font-black text-blue-600 uppercase mb-1">Status Karir</p><p className="text-xs font-bold">{careerStatus}</p></div>
                        <div><p className="text-[9px] font-black text-blue-600 uppercase mb-1">Gaji Diharapkan</p><p className="text-xs font-bold">{expectedSalary || "N/A"}</p></div>
                        <div><p className="text-[9px] font-black text-blue-600 uppercase mb-1">Keahlian</p><p className="text-xs font-bold">{skills || "Kosong"}</p></div>
                    </div>
                </section>
                
                <section className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2"><Award size={14} className="text-orange-400"/> Sertifikasi</h2>
                    <div className="flex gap-2">
                        <input value={newCertName} onChange={e => setNewCertName(e.target.value)} placeholder="Nama..." className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-[10px] font-bold" />
                        <button onClick={async () => {
                            if(!newCertName) return
                            const { data } = await supabase.from('certifications').insert({ profile_id: user.id, name: newCertName }).select().single()
                            if(data) { setCerts([...certs, data]); setNewCertName("") }
                        }} className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700"><Plus size={16}/></button>
                    </div>
                </section>
            </div>
        </div>
      )}
    </div>
  )
}
