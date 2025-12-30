"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { 
  INDONESIA_CITIES, UNIVERSITIES, DISABILITY_TOOLS, DISABILITY_TYPES,
  EDUCATION_LEVELS, EDUCATION_MODELS, SCHOLARSHIP_TYPES, EDUCATION_BARRIERS,
  ACCOMMODATION_TYPES, SKILLS_LIST
} from "@/lib/data-static"
import { 
  User, GraduationCap, Briefcase, FileText, ShieldCheck, Save, 
  Edit3, ExternalLink, Award, Plus, Trash2, MapPin, CheckCircle
} from "lucide-react"

export default function TalentDashboard({ user }: { user: any }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showConsentModal, setShowConsentModal] = useState(false)
  const [msg, setMsg] = useState("")

  // -- STATE DATA PROFIL --
  const [profile, setProfile] = useState<any>(null)
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

  // -- STATE SERTIFIKASI --
  const [certs, setCerts] = useState<any[]>([])
  const [newCertName, setNewCertName] = useState("")
  const [newCertOrg, setNewCertOrg] = useState("")

  useEffect(() => {
    fetchInitialData()
  }, []) 

  async function fetchInitialData() {
    try {
      const { data: pData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
      if (pData) {
        setProfile(pData)
        setFullName(pData.full_name || "")
        setCity(pData.city || "")
        setDisabilityType(pData.disability_type || "")
        setLastEducation(pData.education_level || "")
        setEducationModel(pData.education_model || "")
        setInstitutionName(pData.university || "")
        setScholarshipType(pData.scholarship_type || "")
        setEducationBarrier(pData.education_barrier || "")
        setSkills(pData.skills ? pData.skills.join(", ") : "")
        setAssistiveTools(pData.used_assistive_tools ? pData.used_assistive_tools.join(", ") : "")
        setAccommodations(pData.preferred_accommodations ? pData.preferred_accommodations.join(", ") : "")
        setLinkedin(pData.linkedin_url || "")
        setResumeLink(pData.resume_url || "")
        setProofLink(pData.document_disability_url || "")
        setIsConsent(pData.has_informed_consent || false)
        
        if (!pData.has_informed_consent) setShowConsentModal(true)
        if (!pData.full_name) setIsEditing(true) // Jika data kosong, langsung mode edit
      } else {
        setShowConsentModal(true)
        setIsEditing(true)
      }

      const { data: cData } = await supabase.from('certifications').select('*').eq('profile_id', user.id)
      if (cData) setCerts(cData)

    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  async function handleSaveProfile() {
    setSaving(true)
    const updates = {
      id: user.id,
      full_name: fullName, city, disability_type: disabilityType,
      education_level: lastEducation, education_model: educationModel,
      university: institutionName, scholarship_type: scholarshipType,
      education_barrier: educationBarrier,
      skills: skills.split(",").map(s => s.trim()).filter(s => s),
      used_assistive_tools: assistiveTools.split(",").map(t => t.trim()).filter(t => t),
      preferred_accommodations: accommodations.split(",").map(a => a.trim()).filter(a => a),
      linkedin_url: linkedin, resume_url: resumeLink, document_disability_url: proofLink,
      has_informed_consent: isConsent, updated_at: new Date()
    }
    const { error } = await supabase.from('profiles').upsert(updates)
    if (!error) {
      setMsg("Profil berhasil diperbarui.")
      setIsEditing(false)
      fetchInitialData()
    }
    setSaving(false)
  }

  async function addCert() {
    if (!newCertName) return
    const { data, error } = await supabase.from('certifications').insert({
      profile_id: user.id, name: newCertName, issuing_organization: newCertOrg
    }).select().single()
    if (data) {
      setCerts([...certs, data])
      setNewCertName(""); setNewCertOrg("")
    }
  }

  if (loading) return <div className="p-20 text-center animate-pulse italic text-slate-500 font-bold">Menyelaraskan data kepakaran...</div>

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-8">
      {/* INFORMED CONSENT MODAL */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-8 shadow-2xl border-4 border-blue-600">
            <h2 className="text-2xl font-black mb-4 uppercase italic tracking-tighter">Informed Consent</h2>
            <p className="text-sm text-slate-600 mb-8 leading-relaxed">
              Saya setuju data saya digunakan untuk proses rekrutmen inklusif dan diolah sebagai data anonim riset disabilitas.com demi kemajuan kebijakan inklusi nasional.
            </p>
            <button onClick={() => {setIsConsent(true); setShowConsentModal(false)}} className="w-full py-4 bg-blue-600 text-white rounded-xl font-black uppercase tracking-widest hover:bg-blue-700 shadow-xl">Setuju & Lanjutkan</button>
          </div>
        </div>
      )}

      {/* HEADER & STATUS PROFIL */}
      <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg uppercase">
                {fullName ? fullName.substring(0,2) : "T"}
            </div>
            <div>
                <h1 className="text-2xl font-black tracking-tighter uppercase leading-none mb-1">{fullName || "Talenta Baru"}</h1>
                <p className="text-blue-400 text-sm font-bold flex items-center gap-2 italic"><CheckCircle size={14}/> Profil Riset Aktif</p>
            </div>
        </div>
        {!isEditing && (
            <button onClick={() => setIsEditing(true)} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all border border-white/10"><Edit3 size={16}/> Edit Profil</button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
            {/* FORM EDIT (Sama seperti sebelumnya namun lebih compact) */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <h3 className="font-black text-blue-600 uppercase tracking-widest text-sm mb-6 flex items-center gap-2"><User size={18}/> Data Personal & Domisili</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Nama Lengkap</label><input value={fullName} onChange={e => setFullName(e.target.value)} className="input-std font-bold" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Kota (Hybrid)</label><input list="city-list" value={city} onChange={e => setCity(e.target.value)} className="input-std" /><datalist id="city-list">{INDONESIA_CITIES.map(c => <option key={c} value={c} />)}</datalist></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Ragam (Hybrid)</label><input list="dis-list" value={disabilityType} onChange={e => setDisabilityType(e.target.value)} className="input-std" /><datalist id="dis-list">{DISABILITY_TYPES.map(t => <option key={t} value={t} />)}</datalist></div>
                </div>

                <h3 className="font-black text-purple-600 uppercase tracking-widest text-sm pt-4 flex items-center gap-2"><GraduationCap size={18}/> Pendidikan & Riset</h3>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Jenjang</label><select value={lastEducation} onChange={e => setLastEducation(e.target.value)} className="input-std">{EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}</select></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Model Sekolah</label><select value={educationModel} onChange={e => setEducationModel(e.target.value)} className="input-std">{EDUCATION_MODELS.map(m => <option key={m} value={m}>{m}</option>)}</select></div>
                    <div className="space-y-1 md:col-span-2"><label className="text-[10px] font-black uppercase text-slate-400">Nama Institusi (Hybrid)</label><input list="uni-list" value={institutionName} onChange={e => setInstitutionName(e.target.value)} className="input-std" /><datalist id="uni-list">{UNIVERSITIES.map(u => <option key={u} value={u} />)}</datalist></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Beasiswa</label><select value={scholarshipType} onChange={e => setScholarshipType(e.target.value)} className="input-std">{SCHOLARSHIP_TYPES.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-400">Hambatan Utama</label><select value={educationBarrier} onChange={e => setEducationBarrier(e.target.value)} className="input-std">{EDUCATION_BARRIERS.map(b => <option key={b} value={b}>{b}</option>)}</select></div>
                </div>

                <div className="pt-6 border-t flex gap-4">
                    <button onClick={handleSaveProfile} disabled={saving} className="flex-1 h-14 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl">{saving ? "Menyimpan..." : "Simpan Profil"}</button>
                    <button onClick={() => setIsEditing(false)} className="px-8 h-14 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-xs">Batal</button>
                </div>
            </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8 animate-in fade-in duration-500">
            {/* KARTU PROFIL (VIEW MODE) */}
            <div className="md:col-span-2 space-y-6">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5"><User size={120}/></div>
                    <div className="grid grid-cols-2 gap-y-6 relative z-10">
                        <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Domisili</p><p className="font-bold flex items-center gap-2"><MapPin size={14} className="text-blue-500"/> {city || "-"}</p></div>
                        <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ragam Disabilitas</p><p className="font-bold text-blue-600 italic">#{disabilityType || "-"}</p></div>
                        <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Pendidikan</p><p className="font-bold">{lastEducation} - {institutionName}</p></div>
                        <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Model Sekolah</p><p className="font-bold">{educationModel}</p></div>
                    </div>
                    <div className="mt-8 pt-6 border-t">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Keahlian & Kompetensi</p>
                        <div className="flex flex-wrap gap-2">
                            {skills.split(",").map(s => s.trim()).filter(s => s).map(s => (
                                <span key={s} className="px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-700">#{s}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* BAGIAN SERTIFIKASI */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 shadow-sm">
                    <h3 className="font-black uppercase tracking-widest text-sm mb-6 flex items-center gap-2"><Award size={18} className="text-orange-500"/> Sertifikasi & Pelatihan</h3>
                    <div className="space-y-4">
                        {certs.map(c => (
                            <div key={c.id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <div><p className="font-black text-sm">{c.name}</p><p className="text-[10px] font-bold text-slate-400 uppercase">{c.issuing_organization}</p></div>
                                <button onClick={async () => {
                                    await supabase.from('certifications').delete().eq('id', c.id)
                                    setCerts(certs.filter(item => item.id !== c.id))
                                }} className="text-red-400 hover:text-red-600"><Trash2 size={16}/></button>
                            </div>
                        ))}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t">
                            <input placeholder="Nama Sertifikat" value={newCertName} onChange={e => setNewCertName(e.target.value)} className="md:col-span-1 input-std text-xs" />
                            <input placeholder="Lembaga Penerbit" value={newCertOrg} onChange={e => setNewCertOrg(e.target.value)} className="md:col-span-1 input-std text-xs" />
                            <button onClick={addCert} className="bg-slate-900 text-white rounded-xl font-bold text-xs uppercase flex items-center justify-center gap-2"><Plus size={14}/> Tambah</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* SIDEBAR DOKUMEN (OPSIONAL) */}
            <div className="space-y-6">
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-200">
                    <h3 className="font-black uppercase tracking-widest text-[10px] mb-4 text-slate-500">Tautan & Verifikasi</h3>
                    <div className="space-y-3">
                        {linkedin && <a href={linkedin} target="_blank" className="flex items-center gap-3 p-3 bg-white rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all"><ExternalLink size={14} className="text-blue-600"/> LinkedIn Profil</a>}
                        {resumeLink && <a href={resumeLink} target="_blank" className="flex items-center gap-3 p-3 bg-white rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all"><FileText size={14} className="text-red-600"/> Resume / CV</a>}
                        {proofLink && <a href={proofLink} target="_blank" className="flex items-center gap-3 p-3 bg-white rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all"><ShieldCheck size={14} className="text-green-600"/> Bukti Disabilitas</a>}
                        {!linkedin && !resumeLink && !proofLink && <p className="text-[10px] italic text-slate-400 text-center py-4 underline cursor-pointer" onClick={() => setIsEditing(true)}>Belum ada dokumen dilampirkan. Lengkapi di sini.</p>}
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  )
}
