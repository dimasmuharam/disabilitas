"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { 
  INDONESIA_CITIES, UNIVERSITIES, DISABILITY_TOOLS, DISABILITY_TYPES,
  EDUCATION_LEVELS, EDUCATION_MODELS, SCHOLARSHIP_TYPES, EDUCATION_BARRIERS,
  ACCOMMODATION_TYPES
} from "@/lib/data-static"
import { 
  User, GraduationCap, Briefcase, FileText, ShieldCheck, Save, 
  Edit3, ExternalLink, Award, Plus, Trash2, MapPin, CheckCircle,
  Search, Clock, Building2, ArrowRight
} from "lucide-react"

export default function TalentDashboard({ user }: { user: any }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showConsentModal, setShowConsentModal] = useState(false)
  const [msg, setMsg] = useState("")

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

  // -- STATE AKTIVITAS --
  const [certs, setCerts] = useState<any[]>([])
  const [myApplications, setMyApplications] = useState<any[]>([])
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([])
  const [newCertName, setNewCertName] = useState("")

  useEffect(() => {
    fetchInitialData()
  }, []) 

  async function fetchInitialData() {
    try {
      // 1. Ambil Profil
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
        
        if (!pData.has_informed_consent) setShowConsentModal(true)
        if (!pData.full_name) setIsEditing(true)
      } else {
        setShowConsentModal(true); setIsEditing(true)
      }

      // 2. Ambil Sertifikasi
      const { data: cData } = await supabase.from('certifications').select('*').eq('profile_id', user.id)
      if (cData) setCerts(cData)

      // 3. Ambil Lamaran Saya
      const { data: aData } = await supabase
        .from('applications')
        .select('*, jobs(*, companies(*))')
        .eq('profile_id', user.id)
      if (aData) setMyApplications(aData)

      // 4. Ambil Rekomendasi Lowongan (Berdasarkan Ragam Disabilitas)
      if (pData?.disability_type) {
        const { data: jData } = await supabase
          .from('jobs')
          .select('*, companies(*)')
          .contains('target_disabilities', [pData.disability_type])
          .limit(3)
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
      has_informed_consent: isConsent, updated_at: new Date()
    }
    await supabase.from('profiles').upsert(updates)
    setIsEditing(false)
    fetchInitialData()
    setSaving(false)
  }

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-400">MENYELARASKAN DATA RISET...</div>

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-10">
      
      {/* MODAL INFORMED CONSENT TETAP ADA DI SINI */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 border-4 border-blue-600 shadow-2xl">
            <h2 className="text-2xl font-black mb-4 uppercase italic">Informed Consent</h2>
            <p className="text-sm text-slate-600 mb-8 leading-relaxed">
              Saya setuju data saya digunakan untuk rekrutmen inklusif dan diolah sebagai data anonim riset disabilitas.com.
            </p>
            <button onClick={() => {setIsConsent(true); setShowConsentModal(false)}} className="w-full py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-blue-700">Setuju & Lanjutkan</button>
          </div>
        </div>
      )}

      {/* HEADER DASHBOARD */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-slate-900 text-white p-8 rounded-3xl shadow-xl gap-6">
        <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl font-black shadow-inner uppercase">{fullName ? fullName.substring(0,2) : "T"}</div>
            <div>
                <h1 className="text-2xl font-black tracking-tighter uppercase mb-1">{fullName || "Talenta Baru"}</h1>
                <p className="text-blue-400 text-sm font-bold flex items-center gap-2 italic"><CheckCircle size={14}/> Profil Terverifikasi untuk Riset</p>
            </div>
        </div>
        <div className="flex gap-3">
            <button onClick={() => setIsEditing(!isEditing)} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 border border-white/10 transition-all">
                {isEditing ? "Tutup Editor" : <><Edit3 size={16}/> Edit Profil</>}
            </button>
        </div>
      </div>

      {isEditing ? (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm animate-in slide-in-from-top-4">
            <h2 className="text-xl font-black uppercase mb-8 border-b pb-4 flex items-center gap-2 text-blue-600"><Edit3 size={20}/> Edit Informasi Talenta</h2>
            <div className="grid md:grid-cols-2 gap-8">
                {/* Field yang sudah kita bahas sebelumnya tetap ada di sini (Hybrid Autocomplete) */}
                <div className="space-y-4">
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Nama Lengkap</label><input value={fullName} onChange={e => setFullName(e.target.value)} className="input-std font-bold" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Kota Domisili (Hybrid)</label><input list="city-list" value={city} onChange={e => setCity(e.target.value)} className="input-std" /><datalist id="city-list">{INDONESIA_CITIES.map(c => <option key={c} value={c} />)}</datalist></div>
                </div>
                <div className="space-y-4">
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Ragam Disabilitas (Hybrid)</label><input list="dis-list" value={disabilityType} onChange={e => setDisabilityType(e.target.value)} className="input-std" /><datalist id="dis-list">{DISABILITY_TYPES.map(t => <option key={t} value={t} />)}</datalist></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Model Pendidikan</label><select value={educationModel} onChange={e => setEducationModel(e.target.value)} className="input-std">{EDUCATION_MODELS.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
                </div>
            </div>
            <button onClick={handleSaveProfile} disabled={saving} className="w-full mt-10 h-16 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all">
                {saving ? "Sinkronisasi Data..." : "Simpan Pembaruan Profil"}
            </button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8 items-start">
            
            {/* KIRI: AKTIVITAS LAMARAN & REKOMENDASI */}
            <div className="lg:col-span-2 space-y-8">
                
                {/* 1. TRACKER LAMARAN */}
                <section aria-label="Status Lamaran Saya">
                    <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2"><Clock size={16}/> Pelacakan Lamaran Aktif</h2>
                    <div className="grid gap-4">
                        {myApplications.length > 0 ? myApplications.map(app => (
                            <div key={app.id} className="bg-white p-5 rounded-2xl border border-slate-200 flex justify-between items-center shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center"><Building2 className="text-slate-400" /></div>
                                    <div>
                                        <h3 className="font-black text-sm uppercase">{app.jobs.title}</h3>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{app.jobs.companies.name}</p>
                                    </div>
                                </div>
                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${app.status === 'Hired' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {app.status}
                                </div>
                            </div>
                        )) : (
                            <div className="p-10 border-2 border-dashed border-slate-200 rounded-3xl text-center text-slate-400 italic text-sm font-medium">Belum ada lamaran terkirim.</div>
                        )}
                    </div>
                </section>

                {/* 2. REKOMENDASI JOB MATCHING (RISET-BASED) */}
                <section aria-label="Rekomendasi Lowongan Inklusif">
                    <h2 className="text-sm font-black uppercase tracking-widest text-blue-600 mb-4 flex items-center gap-2"><Search size={16}/> Rekomendasi untuk Anda</h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {recommendedJobs.map(job => (
                            <div key={job.id} className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100 hover:border-blue-300 transition-all group relative overflow-hidden">
                                <h3 className="font-black text-lg leading-tight mb-1 group-hover:text-blue-700">{job.title}</h3>
                                <p className="text-xs font-bold text-slate-500 mb-4 uppercase">{job.companies.name}</p>
                                <div className="flex gap-2 mb-6">
                                    <span className="text-[9px] font-black bg-white px-2 py-1 rounded-md border border-blue-100 uppercase tracking-tighter">#{job.work_mode}</span>
                                    <span className="text-[9px] font-black bg-blue-600 text-white px-2 py-1 rounded-md uppercase tracking-tighter italic">Cocok Ragam</span>
                                </div>
                                <button className="w-full py-3 bg-white border border-blue-200 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all">
                                    Lihat Detail <ArrowRight size={14}/>
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* KANAN: RINGKASAN PROFIL & SERTIFIKASI */}
            <div className="space-y-8">
                <section className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm" aria-label="Ringkasan Profil">
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 border-b pb-2">Informasi Kepakaran</h2>
                    <div className="space-y-4">
                        <div><p className="text-[9px] font-black text-blue-600 uppercase mb-1 tracking-widest">Keahlian</p><p className="text-xs font-bold">{skills || "Belum diisi"}</p></div>
                        <div><p className="text-[9px] font-black text-blue-600 uppercase mb-1 tracking-widest">Alat Bantu</p><p className="text-xs font-bold">{assistiveTools || "Tidak ada"}</p></div>
                        <div><p className="text-[9px] font-black text-blue-600 uppercase mb-1 tracking-widest">Akomodasi</p><p className="text-xs font-bold">{accommodations || "Standar"}</p></div>
                    </div>
                </section>

                <section className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl" aria-label="Sertifikasi Pelatihan">
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2"><Award size={14} className="text-orange-400"/> Sertifikasi</h2>
                    <div className="space-y-3 mb-6">
                        {certs.length > 0 ? certs.map(c => (
                            <div key={c.id} className="p-3 bg-white/5 rounded-xl border border-white/10 flex justify-between items-center group">
                                <div><p className="text-xs font-bold">{c.name}</p><p className="text-[9px] text-slate-500 font-bold uppercase">{c.issuing_organization}</p></div>
                                <button onClick={async () => {
                                    await supabase.from('certifications').delete().eq('id', c.id)
                                    setCerts(certs.filter(item => item.id !== c.id))
                                }} className="opacity-0 group-hover:opacity-100 text-red-400 transition-all"><Trash2 size={14}/></button>
                            </div>
                        )) : <p className="text-[10px] italic text-slate-500 text-center py-4">Belum ada sertifikat.</p>}
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

                <section className="bg-slate-50 p-6 rounded-3xl border border-slate-200" aria-label="Validasi Dokumen">
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Verifikasi Link</h2>
                    <div className="space-y-2">
                        {linkedin && <a href={linkedin} target="_blank" className="flex items-center gap-3 p-3 bg-white rounded-xl text-[10px] font-black shadow-sm hover:shadow-md transition-all border border-slate-100"><ExternalLink size={12} className="text-blue-600"/> LINKEDIN</a>}
                        {resumeLink && <a href={resumeLink} target="_blank" className="flex items-center gap-3 p-3 bg-white rounded-xl text-[10px] font-black shadow-sm hover:shadow-md transition-all border border-slate-100"><FileText size={12} className="text-red-600"/> RESUME / CV</a>}
                    </div>
                </section>
            </div>
        </div>
      )}
    </div>
  )
}
