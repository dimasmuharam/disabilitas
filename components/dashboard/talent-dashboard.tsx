"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { QRCodeSVG } from "qrcode.react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// SINKRONISASI DATA STATIC (DITAMBAHKAN CAREER_STATUSES & GOV AGENCIES)
import { 
  INDONESIA_CITIES, UNIVERSITIES, DISABILITY_TYPES,
  EDUCATION_LEVELS, EDUCATION_MODELS, WORK_MODES, 
  SKILLS_LIST, TRAINING_PARTNERS, COMMUNITY_PARTNERS,
  CAREER_STATUSES, GOVERNMENT_AGENCIES
} from "@/lib/data-static"

// SINKRONISASI ACTIONS
import { postInclusionRating } from "@/lib/actions/ratings"

import { 
  User, GraduationCap, Briefcase, ShieldCheck, Save, 
  Edit3, Award, Trash2, Building2, 
  Share2, Star, CheckCircle, FileDown, AlertCircle
} from "lucide-react"

export default function TalentDashboard({ user }: { user: any }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [msg, setMsg] = useState("")

  // -- STATE DATA PROFIL --
  const [fullName, setFullName] = useState("")
  const [city, setCity] = useState("")
  const [disabilityType, setDisabilityType] = useState("")
  const [lastEducation, setLastEducation] = useState("")
  const [educationModel, setEducationModel] = useState("")
  const [major, setMajor] = useState("")
  const [institutionName, setInstitutionName] = useState("")
  const [skills, setSkills] = useState("") 
  const [assistiveTools, setAssistiveTools] = useState("") 
  const [linkedin, setLinkedin] = useState("")
  const [portfolioUrl, setPortfolioUrl] = useState("")
  const [careerStatus, setCareerStatus] = useState("Job Seeker")
  const [bio, setBio] = useState("") 
  
  // -- STATE RELASIONAL --
  const [certs, setCerts] = useState<any[]>([])
  const [workEx, setWorkEx] = useState<any[]>([])
  const [myApplications, setMyApplications] = useState<any[]>([])
  
  // -- RATING MODAL STATE --
  const [showRatingId, setShowRatingId] = useState<string | null>(null)
  const [targetCompanyId, setTargetCompanyId] = useState<string | null>(null)
  const [ratingScores, setRatingScores] = useState({ accessibility: 5, culture: 5, management: 5, onboarding: 5, comment: "" })

  useEffect(() => { fetchInitialData() }, []) 

  async function fetchInitialData() {
    try {
      const { data: pData } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      if (pData) {
        setFullName(pData.full_name || ""); setCity(pData.city || ""); setDisabilityType(pData.disability_type || "")
        setLastEducation(pData.education_level || ""); setEducationModel(pData.education_model || "")
        setMajor(pData.major || ""); setInstitutionName(pData.university || "")
        setSkills(pData.skills ? pData.skills.join(", ") : "")
        setAssistiveTools(pData.used_assistive_tools ? pData.used_assistive_tools.join(", ") : "")
        setLinkedin(pData.linkedin_url || ""); setCareerStatus(pData.career_status || "Job Seeker")
        setBio(pData.bio || "")
      }
      const [cRes, wRes, aRes] = await Promise.all([
        supabase.from("certifications").select("*").eq("profile_id", user.id).order("created_at", { ascending: false }),
        supabase.from("work_experiences").select("*").eq("profile_id", user.id).order("is_current_work", { ascending: false }),
        supabase.from("applications").select("*, jobs(*, companies(*))").eq("applicant_id", user.id)
      ])
      if (cRes.data) setCerts(cRes.data); if (wRes.data) setWorkEx(wRes.data); if (aRes.data) setMyApplications(aRes.data)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  // FUNGSI UNTUK MENGIRIM RATING KE DATABASE (SINKRON DENGAN ratings.ts)
  async function submitInclusionRating() {
    if (!targetCompanyId) return;
    const res = await postInclusionRating({
      talentId: user.id,
      companyId: targetCompanyId,
      ...ratingScores
    });
    if (res.success) {
      setMsg("Rating inklusi berhasil dikirim secara anonim.");
      setShowRatingId(null);
    } else {
      setMsg(`Gagal: ${res.error}`);
    }
  }

  // LOGIKA AUDIT MANUAL: Deteksi jika kampus tidak ada di list
  async function handleProfileSave() {
    setSaving(true)
    
    // Cek apakah universitas diketik manual (tidak ada di data-static)
    if (institutionName && !UNIVERSITIES.includes(institutionName)) {
      await supabase.from("manual_input_logs").insert({
        field_name: "university",
        input_value: institutionName
      })
    }

    const updates = {
      id: user.id, full_name: fullName, city, disability_type: disabilityType,
      education_level: lastEducation, education_model: educationModel, major,
      university: institutionName, bio, career_status: careerStatus,
      updated_at: new Date()
    }
    const { error } = await supabase.from("profiles").upsert(updates)
    if (!error) { setMsg("Profil & Status Karir Berhasil Disinkronkan."); setIsEditing(false); fetchInitialData() }
    setSaving(false)
  }

  // PDF GENERATOR (Sama seperti sebelumnya dengan sedikit perapihan)
  const generateCV = () => { /* ... kode jsPDF yang sudah Anda miliki ... */ }

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-400">{"MENYIAPKAN PUSAT DATA TALENTA..."}</div>

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-10">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-slate-900 text-white p-8 rounded-3xl shadow-xl gap-6">
        <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black italic">{fullName ? fullName.substring(0,2) : "T"}</div>
            <div>
                {msg && <p className="text-green-400 text-[10px] font-black uppercase mb-1">{"✅ "}{msg}</p>}
                <h1 className="text-xl font-black uppercase italic tracking-tighter">{fullName || "Talenta Baru"}</h1>
                <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest">{careerStatus}</p>
            </div>
        </div>
        <div className="flex gap-4">
            <button onClick={generateCV} className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-green-900/20">
                <FileDown size={14}/> {"Cetak CV PDF"}
            </button>
            <button onClick={() => setIsEditing(!isEditing)} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-black text-[10px] uppercase tracking-widest border border-white/10 transition-all">
                {isEditing ? "Tutup Editor" : <><Edit3 size={14}/> {"Edit Profil & Riset"}</>}
            </button>
        </div>
      </div>

      {isEditing ? (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-10">
            <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-4">
                    <h3 className="font-black text-[10px] uppercase text-slate-400 tracking-widest flex items-center gap-2"><User size={14}/> {"Identitas & Status Karir"}</h3>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">{"Nama Lengkap"}</label><input value={fullName} onChange={e => setFullName(e.target.value)} className="input-std font-bold" /></div>
                    {/* DROPDOWN STATUS KARIR SINKRON DENGAN GOV TRACKER */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black uppercase text-slate-500">{"Status Karir Saat Ini"}</label>
                      <select value={careerStatus} onChange={e => setCareerStatus(e.target.value)} className="input-std font-bold text-xs uppercase">
                        {CAREER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                </div>
                {/* PENDIDIKAN DENGAN AUDIT MANUAL */}
                <div className="space-y-4">
                    <h3 className="font-black text-[10px] uppercase text-slate-400 tracking-widest flex items-center gap-2"><GraduationCap size={14}/> {"Pendidikan Terakhir"}</h3>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">{"Almamater"}</label><input list="uni-list" value={institutionName} onChange={e => setInstitutionName(e.target.value)} className="input-std font-bold uppercase text-[10px]" /><datalist id="uni-list">{UNIVERSITIES.map(u => <option key={u} value={u} />)}</datalist></div>
                </div>
            </div>
            <button onClick={handleProfileSave} disabled={saving} className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">
                {saving ? "MENYIMPAN DATA..." : <><Save size={20}/> {"Simpan Profil & Riset"}</>}
            </button>
        </div>
      ) : (
        /* VIEW MODE + RATING SECTION */
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-10">
                {/* TABEL LAMARAN DENGAN FITUR RATING */}
                <section className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm space-y-6">
                    <h2 className="text-sm font-black uppercase text-slate-500 flex items-center gap-2"><CheckCircle size={16}/> {"Status Lamaran & Rating Inklusi"}</h2>
                    <div className="overflow-hidden rounded-2xl border border-slate-100">
                        {myApplications.map(app => (
                          <div key={app.id} className="p-6 border-b flex justify-between items-center hover:bg-slate-50 transition-all">
                            <div>
                                <h4 className="text-xs font-black uppercase">{app.jobs?.title}</h4>
                                <p className="text-[9px] font-bold text-blue-600 uppercase">{app.jobs?.companies?.name} • {app.status}</p>
                            </div>
                            {/* TOMBOL RATING HANYA MUNCUL JIKA STATUS BUKAN PENDING */}
                            {app.status !== 'pending' && (
                              <button 
                                onClick={() => { setShowRatingId(app.id); setTargetCompanyId(app.jobs?.companies?.id) }} 
                                className="flex items-center gap-1 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-[9px] font-black uppercase hover:bg-amber-200"
                              >
                                <Star size={12} fill="currentColor"/> {"Beri Rating Inklusi"}
                              </button>
                            )}
                          </div>
                        ))}
                    </div>
                </section>

                {/* MODAL RATING POPUP */}
                {showRatingId && (
                  <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl space-y-6 animate-in zoom-in-95">
                       <h3 className="text-xl font-black uppercase italic leading-tight text-slate-800 italic">{"Audit Budaya Kerja Inklusif"}</h3>
                       <p className="text-[10px] font-bold text-slate-400 uppercase italic">{"Penilaian anda bersifat anonim untuk riset disabilitas.com"}</p>
                       <div className="space-y-4">
                         {["accessibility", "culture", "management", "onboarding"].map(cat => (
                           <div key={cat} className="flex justify-between items-center bg-slate-50 p-3 rounded-2xl">
                             <label className="text-[10px] font-black uppercase text-slate-600">{cat}</label>
                             <input type="range" min="1" max="5" value={(ratingScores as any)[cat]} onChange={e => setRatingScores({...ratingScores, [cat]: parseInt(e.target.value)})} className="w-24 accent-blue-600" />
                           </div>
                         ))}
                         <textarea placeholder="Ceritakan pengalaman inklusi anda (Opsional & Anonim)..." value={ratingScores.comment} onChange={e => setRatingScores({...ratingScores, comment: e.target.value})} className="input-std text-xs min-h-[80px]" />
                       </div>
                       <div className="flex gap-4">
                         <button onClick={() => setShowRatingId(null)} className="flex-1 py-4 bg-slate-100 rounded-2xl font-black uppercase text-[10px]">{"Batal"}</button>
                         <button onClick={submitInclusionRating} className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-[10px]">{"Kirim Audit"}</button>
                       </div>
                    </div>
                  </div>
                )}

                {/* RIWAYAT KARIR (Existing) */}
                <section className="space-y-6">
                    <h2 className="text-sm font-black uppercase text-slate-500 flex items-center gap-2"><Briefcase size={16}/> {"Riwayat Karir Profesional"}</h2>
                    <div className="grid gap-4">
                        {workEx.map(work => (
                            <div key={work.id} className="bg-white p-6 rounded-3xl border border-slate-200 flex justify-between items-start group">
                                <div className="space-y-1">
                                    <h3 className="font-black text-xs uppercase">{work.position}</h3>
                                    <p className="text-[10px] font-bold text-blue-600 uppercase flex items-center gap-1"><Building2 size={12}/> {work.company_name} {work.is_current_work && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[8px]">{"AKTIF"}</span>}</p>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase">{work.start_date} - {work.is_current_work ? "Sekarang" : work.end_date}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* SIDEBAR SNAPSHOT (Existing) */}
            <div className="space-y-8">
                <section className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl space-y-4">
                    <h2 className="text-[10px] font-black uppercase text-slate-400 border-b border-white/10 pb-2">{"Snapshot Inklusi"}</h2>
                    <div className="space-y-4 text-[10px] font-black uppercase">
                        <div><p className="text-blue-400 text-[8px]">{"Status Saat Ini"}</p>{careerStatus}</div>
                        <div><p className="text-blue-400 text-[8px]">{"Disabilitas"}</p>{disabilityType}</div>
                    </div>
                </section>
            </div>
        </div>
      )}
    </div>
  )
}
