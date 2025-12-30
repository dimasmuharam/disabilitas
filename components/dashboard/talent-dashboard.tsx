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
  Search, Clock, Building2, ArrowRight, Share2, Send, Youtube, Phone, Info
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
  
  // -- FITUR BARU --
  const [commPreference, setCommPreference] = useState("WhatsApp")
  const [videoIntroUrl, setVideoIntroUrl] = useState("")

  // -- STATE AKTIVITAS --
  const [certs, setCerts] = useState<any[]>([])
  const [myApplications, setMyApplications] = useState<any[]>([])
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([])
  const [newCertName, setNewCertName] = useState("")

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
        
        if (!pData.has_informed_consent) setShowConsentModal(true)
        if (!pData.full_name) setIsEditing(true)
      } else {
        setShowConsentModal(true); setIsEditing(true)
      }

      const { data: cData } = await supabase.from('certifications').select('*').eq('profile_id', user.id)
      if (cData) setCerts(cData)

      const { data: aData } = await supabase.from('applications').select('*, jobs(*, companies(*))').eq('profile_id', user.id)
      if (aData) setMyApplications(aData)

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
      has_informed_consent: isConsent, updated_at: new Date()
    }
    const { error } = await supabase.from('profiles').upsert(updates)
    if (!error) {
      setMsg("Profil berhasil diperbarui dan disinkronkan.")
      setIsEditing(false)
      fetchInitialData()
      // Focus Management: Pindah fokus ke pesan sukses
      setTimeout(() => msgRef.current?.focus(), 100)
    }
    setSaving(false)
  }

  async function handleApply(jobId: string) {
    const { error } = await supabase.from('applications').insert({ job_id: jobId, profile_id: user.id })
    if (!error) fetchInitialData()
  }

  const handleShare = () => {
    const text = `Halo! Saya ${fullName}, profil kepakaran saya sebagai talenta disabilitas kini telah terverifikasi di disabilitas.com. Cek profil profesional saya di sini: ${publicProfileUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-400">MENYELARASKAN DATA RISET...</div>

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-10">
      {/* Skip Navigation untuk Aksesibilitas */}
      <a href="#main-content" className="sr-only focus:not-sr-only bg-blue-600 text-white p-4 absolute z-[100] rounded-b-xl">Loncat ke konten utama</a>

      {showConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 border-4 border-blue-600 shadow-2xl">
            <h2 className="text-2xl font-black mb-4 uppercase italic tracking-tighter">Informed Consent</h2>
            <p className="text-sm text-slate-600 mb-8 leading-relaxed">
              Saya setuju data saya digunakan untuk rekrutmen inklusif dan diolah sebagai data anonim riset disabilitas.com demi kemajuan kebijakan inklusi nasional sesuai standar riset yang berlaku.
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
                    <p className="text-blue-400 text-sm font-bold flex items-center gap-2 italic"><CheckCircle size={14}/> Profil Riset Aktif</p>
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
                {/* Visual Kartu Profesional */}
                <div className="w-full md:w-72 aspect-[3/4] bg-slate-950 rounded-3xl p-6 text-white flex flex-col justify-between shadow-2xl relative overflow-hidden border border-white/10">
                    <div className="flex justify-between items-start">
                        <img src="/logo.png" alt="Logo Disabilitas.com" className="h-6 object-contain" />
                        <ShieldCheck className="text-blue-500" size={24}/>
                    </div>
                    <div>
                        <h3 className="text-xl font-black leading-tight mb-1 uppercase tracking-tighter">{fullName}</h3>
                        <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-4">{disabilityType}</p>
                        <div className="space-y-1">
                            <p className="text-[8px] text-slate-500 uppercase font-black tracking-widest">Kepakaran Utama</p>
                            <p className="text-[10px] font-bold truncate">{skills.split(',')[0] || "General Talent"}</p>
                        </div>
                    </div>
                    <div className="flex justify-between items-end border-t border-white/10 pt-4">
                        <div className="bg-white p-1 rounded-lg">
                           <QRCodeSVG value={publicProfileUrl} size={64} aria-label="Scan untuk profil publik" />
                        </div>
                        <p className="text-[8px] font-black text-slate-500 text-right uppercase leading-tight">Verified<br/>Professional<br/>Talent</p>
                    </div>
                </div>

                {/* Konten Promosi */}
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-3xl font-black tracking-tighter mb-4 italic uppercase">Paspor Karir Inklusif</h2>
                    <p className="text-slate-500 font-medium mb-6 leading-relaxed max-w-lg">
                        Bagikan kartu identitas digital Anda untuk menunjukkan kompetensi profesional yang telah terverifikasi. Membangun kebanggaan, mematahkan stigma.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                        <button onClick={handleShare} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95">
                            <Share2 size={20}/> Share Ke WhatsApp
                        </button>
                        <a href={publicProfileUrl} target="_blank" className="bg-slate-100 text-slate-800 px-8 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 hover:bg-slate-200 transition-all border border-slate-200">
                            <ExternalLink size={20}/> Preview Profil
                        </a>
                    </div>
                </div>
            </div>
        </section>
      )}

      {isEditing ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm animate-in slide-in-from-top-4">
            <h2 className="text-xl font-black uppercase mb-8 border-b pb-4 flex items-center gap-2 text-blue-600"><Edit3 size={20}/> Form Pembaruan Profil</h2>
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <h3 className="font-black text-[10px] uppercase text-slate-400 tracking-widest flex items-center gap-2"><User size={14}/> Identitas & Kontak</h3>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">Nama Lengkap</label><input value={fullName} onChange={e => setFullName(e.target.value)} className="input-std font-bold" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">Preferensi Dihubungi</label>
                        <select value={commPreference} onChange={e => setCommPreference(e.target.value)} className="input-std">
                            <option value="WhatsApp">WhatsApp / Pesan Teks</option>
                            <option value="Email">Email Resmi</option>
                            <option value="Telepon">Panggilan Suara Direct</option>
                        </select>
                    </div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">Kota (Hybrid Autocomplete)</label><input list="city-list" value={city} onChange={e => setCity(e.target.value)} className="input-std" /><datalist id="city-list">{INDONESIA_CITIES.map(c => <option key={c} value={c} />)}</datalist></div>
                </div>
                
                <div className="space-y-6">
                    <h3 className="font-black text-[10px] uppercase text-slate-400 tracking-widest flex items-center gap-2"><GraduationCap size={14}/> Latar Belakang Riset</h3>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">Ragam Disabilitas (Hybrid)</label><input list="dis-list" value={disabilityType} onChange={e => setDisabilityType(e.target.value)} className="input-std" /><datalist id="dis-list">{DISABILITY_TYPES.map(t => <option key={t} value={t} />)}</datalist></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">Model Sekolah</label><select value={educationModel} onChange={e => setEducationModel(e.target.value)} className="input-std">{EDUCATION_MODELS.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
                </div>

                <div className="md:col-span-2 space-y-4 pt-4 border-t">
                    <h3 className="font-black text-[10px] uppercase text-slate-400 tracking-widest flex items-center gap-2"><Youtube size={16} className="text-red-600"/> Video Intro (YouTube Link - Opsional)</h3>
                    <input type="url" value={videoIntroUrl} onChange={e => setVideoIntroUrl(e.target.value)} className="input-std" placeholder="https://youtube.com/watch?v=..." />
                    <div className="bg-red-50 p-4 rounded-2xl flex gap-3 border border-red-100">
                        <Info className="text-red-500 shrink-0" size={18}/>
                        <p className="text-[10px] font-medium text-red-800 leading-relaxed italic">
                            <strong>Saran Durasi:</strong> 60-90 detik. <br/>
                            <strong>Isi Video:</strong> Perkenalan nama, ringkasan keahlian, dan alat bantu yang digunakan. Bantu perusahaan mengenal karakter profesional Anda lebih dekat.
                        </p>
                    </div>
                </div>
            </div>
            <button onClick={handleSaveProfile} disabled={saving} className="w-full mt-10 h-16 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-3">
                {saving ? "Menyelaraskan..." : <><Save size={20}/> Simpan & Aktifkan Profil</>}
            </button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <section aria-labelledby="applications-title">
                    <h2 id="applications-title" className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2"><Clock size={16}/> Pelacakan Lamaran</h2>
                    <div className="grid gap-4">
                        {myApplications.length > 0 ? myApplications.map(app => (
                            <div key={app.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center"><Building2 className="text-slate-400" /></div>
                                    <div>
                                        <h3 className="font-black text-sm uppercase">{app.jobs.title}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase">{app.jobs.companies.name}</p>
                                    </div>
                                </div>
                                <div className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-100 text-blue-700">{app.status}</div>
                            </div>
                        )) : <div className="p-10 border-2 border-dashed border-slate-200 rounded-3xl text-center text-slate-400 font-medium italic">Belum mengirim lamaran.</div>}
                    </div>
                </section>

                <section aria-labelledby="recommendations-title">
                    <h2 id="recommendations-title" className="text-sm font-black uppercase tracking-widest text-blue-600 mb-4 flex items-center gap-2"><Search size={16}/> Lowongan Relevan</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {recommendedJobs.map(job => (
                            <div key={job.id} className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 group transition-all">
                                <h3 className="font-black text-lg leading-tight mb-1">{job.title}</h3>
                                <p className="text-xs font-bold text-slate-500 mb-4 uppercase">{job.companies.name}</p>
                                <button 
                                    onClick={() => handleApply(job.id)}
                                    disabled={myApplications.some(a => a.job_id === job.id)}
                                    className="w-full py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-700 disabled:bg-slate-300 transition-all shadow-md active:scale-95"
                                >
                                    {myApplications.some(a => a.job_id === job.id) ? 'Sudah Dilamar' : <><Send size={14}/> Lamar Sekarang</>}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            <div className="space-y-8">
                <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm" aria-labelledby="meta-info">
                    <h2 id="meta-info" className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 border-b pb-2">Kontak & Kepakaran</h2>
                    <div className="space-y-4">
                        <div><p className="text-[9px] font-black text-blue-600 uppercase mb-1">Preferensi Hubungi</p><p className="text-xs font-bold flex items-center gap-2"><Phone size={12}/> {commPreference}</p></div>
                        <div><p className="text-[9px] font-black text-blue-600 uppercase mb-1">Keahlian</p><p className="text-xs font-bold">{skills || "Menunggu pengisian"}</p></div>
                        {videoIntroUrl && <div><p className="text-[9px] font-black text-red-600 uppercase mb-1 tracking-widest">Video Intro</p><a href={videoIntroUrl} target="_blank" className="text-xs font-bold underline flex items-center gap-1"><Youtube size={14}/> Lihat Video</a></div>}
                    </div>
                </section>
                
                <section className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl">
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2"><Award size={14} className="text-orange-400"/> Sertifikasi</h2>
                    <div className="space-y-3 mb-6">
                        {certs.map(c => (
                             <div key={c.id} className="p-3 bg-white/5 rounded-xl border border-white/10 flex justify-between items-center text-xs">
                                <span>{c.name}</span>
                                <button onClick={async () => {
                                    await supabase.from('certifications').delete().eq('id', c.id)
                                    setCerts(certs.filter(item => item.id !== c.id))
                                }} className="text-red-400 hover:text-red-500"><Trash2 size={14}/></button>
                             </div>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <input value={newCertName} onChange={e => setNewCertName(e.target.value)} placeholder="Nama Sertifikat..." className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-[10px] font-bold focus:outline-none focus:border-blue-500" />
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
