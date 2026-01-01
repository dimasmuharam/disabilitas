"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { QRCodeSVG } from "qrcode.react"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// SINKRONISASI DATA STATIC (UTAMA)
import { 
  UNIVERSITIES, EDUCATION_LEVELS, CAREER_STATUSES, 
  DISABILITY_TYPES, EDUCATION_MODELS, INDONESIA_CITIES 
} from "@/lib/data-static"

// SINKRONISASI ACTIONS
import { postInclusionRating } from "@/lib/actions/ratings"

import { 
  User, GraduationCap, ShieldCheck, Save, 
  Award, Trash2, Building2, Share2, Star, 
  CheckCircle, FileDown, Search, ArrowUpRight, X, 
  PlusCircle, MapPin, Linkedin, Link, Briefcase
} from "lucide-react"

export default function TalentDashboard({ user, autoOpenProfile = false }: { user: any, autoOpenProfile?: boolean }) {
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
  const [skills, setSkills] = useState<string[]>([]) 
  const [careerStatus, setCareerStatus] = useState("Job Seeker")
  const [bio, setBio] = useState("") 
  const [linkedinUrl, setLinkedinUrl] = useState("")
  
  // -- STATE RELASIONAL --
  const [certs, setCerts] = useState<any[]>([])
  const [workEx, setWorkEx] = useState<any[]>([])
  const [myApplications, setMyApplications] = useState<any[]>([])
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([])
  
  // -- INPUT MODAL STATES --
  const [showWorkModal, setShowWorkModal] = useState(false)
  const [showCertModal, setShowCertModal] = useState(false)
  const [showRatingId, setShowRatingId] = useState<string | null>(null)
  const [targetCompanyId, setTargetCompanyId] = useState<string | null>(null)

  // -- NEW ENTRY STATES --
  const [newWork, setNewWork] = useState({ company_name: "", position: "", start_date: "", end_date: "", is_current_work: false, description: "" })
  const [newCert, setNewCert] = useState({ name: "", organizer_name: "", year: "2025" })
  const [ratingScores, setRatingScores] = useState({ accessibility: 5, culture: 5, management: 5, onboarding: 5, comment: "" })

  useEffect(() => {
    if (autoOpenProfile) {
      setIsEditing(true);
      window.scrollTo({ top: 150, behavior: 'smooth' });
    }
  }, [autoOpenProfile]);


  useEffect(() => { 
    if (!user?.id) {
      console.warn('[TALENT-DASHBOARD] User not available yet')
      return
    }
    console.log('[TALENT-DASHBOARD] Initializing with user:', { id: user.id, email: user.email })
    fetchInitialData() 
  }, [user?.id]) 

  async function fetchInitialData() {
    if (!user?.id) {
      console.error('[TALENT-DASHBOARD] Cannot fetch data: user.id is undefined')
      return
    }
    
    try {
      console.log('[TALENT-DASHBOARD] Fetching profile data for user:', user.id)
      const { data: pData } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      if (pData) {
        setFullName(pData.full_name || ""); setCity(pData.city || ""); setDisabilityType(pData.disability_type || "")
        setLastEducation(pData.education_level || ""); setMajor(pData.major || ""); setInstitutionName(pData.university || "")
        setSkills(pData.skills || []); setCareerStatus(pData.career_status || "Job Seeker"); setBio(pData.bio || "")
        setLinkedinUrl(pData.linkedin_url || ""); setEducationModel(pData.education_model || "")

        if (pData.skills && pData.skills.length > 0) {
          const { data: jobs } = await supabase.from("jobs").select("*, companies(name, logo_url)").contains("required_skills", [pData.skills[0]]).eq("is_active", true).limit(3)
          if (jobs) setRecommendedJobs(jobs)
        }
      }
      const [cRes, wRes, aRes] = await Promise.all([
        supabase.from("certifications").select("*").eq("profile_id", user.id).order("created_at", { ascending: false }),
        supabase.from("work_experiences").select("*").eq("profile_id", user.id).order("is_current_work", { ascending: false }),
        supabase.from("applications").select("*, jobs(*, companies(*))").eq("applicant_id", user.id)
      ])
      if (cRes.data) setCerts(cRes.data); if (wRes.data) setWorkEx(wRes.data); if (aRes.data) setMyApplications(aRes.data)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  // --- LOGIKA ACTIONS ---
  async function handleApply(jobId: string) {
    const { error } = await supabase.from("applications").insert({ job_id: jobId, applicant_id: user.id, status: "pending" })
    if (!error) { setMsg("Lamaran Berhasil Dikirim!"); fetchInitialData(); }
  }

  async function handleProfileSave() {
    setSaving(true)
    if (institutionName && !UNIVERSITIES.includes(institutionName)) {
      await supabase.from("manual_input_logs").insert({ field_name: "university", input_value: institutionName })
    }
    const updates = { 
        id: user.id, full_name: fullName, city, university: institutionName, bio, 
        career_status: careerStatus, education_level: lastEducation, 
        education_model: educationModel, updated_at: new Date() 
    }
    await supabase.from("profiles").upsert(updates)
    setMsg("Profil Tersinkronisasi."); setIsEditing(false); fetchInitialData();
    setSaving(false)
  }

  async function handleAddWork() {
    await supabase.from("work_experiences").insert({ ...newWork, profile_id: user.id })
    setShowWorkModal(false); fetchInitialData();
  }

  async function handleAddCert() {
    await supabase.from("certifications").insert({ ...newCert, profile_id: user.id })
    setShowCertModal(false); fetchInitialData();
  }

  async function submitInclusionRating() {
    const res = await postInclusionRating({ talentId: user.id, companyId: targetCompanyId!, ...ratingScores })
    if (res.success) { setMsg("Rating Terkirim!"); setShowRatingId(null); }
  }

  const generateCV = () => {
    const doc = new jsPDF()
    doc.setFillColor(30, 41, 59); doc.rect(0, 0, 210, 50, "F")
    doc.setTextColor(255, 255, 255); doc.setFontSize(22); doc.text(fullName.toUpperCase(), 20, 25)
    doc.setFontSize(10); doc.text(`${disabilityType} | ${city} | ${user.email}`, 20, 35)
    doc.setTextColor(0, 0, 0); doc.setFontSize(12); doc.text("PENGALAMAN KERJA", 20, 65)
    autoTable(doc, {
      startY: 70,
      head: [["Posisi", "Perusahaan", "Durasi"]],
      body: workEx.map(w => [w.position, w.company_name, `${w.start_date} - ${w.is_current_work ? "Sekarang" : w.end_date}`]),
      headStyles: { fillColor: [37, 99, 235] }
    })
    doc.save(`CV_${fullName}.pdf`)
  }

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-400">{"MEMUAT PUSAT DATA..."}</div>

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-10 px-4">
      {/* HEADER ACTION */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl gap-6">
        <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-3xl font-black italic">{fullName ? fullName.substring(0,2) : "T"}</div>
            <div>
                {msg && <p className="text-green-400 text-[10px] font-black uppercase mb-1">{"✅ "}{msg}</p>}
                <h1 className="text-2xl font-black uppercase italic tracking-tighter leading-none">{fullName || "Talenta Baru"}</h1>
                <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest mt-2">{careerStatus}</p>
            </div>
        </div>
        <div className="flex gap-3">
            <button onClick={generateCV} className="p-4 bg-green-600 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 transition-all hover:scale-105 active:scale-95"><FileDown size={16}/> {"Cetak CV"}</button>
            <button onClick={() => setIsEditing(!isEditing)} className="p-4 bg-white/10 rounded-2xl font-black text-[10px] uppercase border border-white/5">{isEditing ? "Tutup" : "Edit Profile"}</button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-12">
          
          {isEditing ? (
            <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-xl space-y-8 animate-in slide-in-from-bottom-4">
                <h3 className="font-black text-xs uppercase text-blue-600 italic border-b pb-4">{"Data Personal & Akademik"}</h3>
{autoOpenProfile && (
  <div className="p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl mb-4 animate-bounce text-center">
    <p className="text-[10px] font-black uppercase tracking-widest text-blue-700">
      {"🎉 Konfirmasi Berhasil! Silakan Lengkapi Profil Talenta Anda."}
    </p>
  </div>
)}
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400">{"Nama Lengkap"}</label><input value={fullName} onChange={e => setFullName(e.target.value)} className="input-std font-bold" /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400">{"Status Karir"}</label>
                        <select value={careerStatus} onChange={e => setCareerStatus(e.target.value)} className="input-std uppercase text-[10px] font-bold">
                            {CAREER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400">{"Pendidikan"}</label>
                        <select value={lastEducation} onChange={e => setLastEducation(e.target.value)} className="input-std text-[10px] font-bold">
                            {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400">{"Almamater"}</label>
                        <input list="uni-list" value={institutionName} onChange={e => setInstitutionName(e.target.value)} className="input-std uppercase text-[10px]" />
                        <datalist id="uni-list">{UNIVERSITIES.map(u => <option key={u} value={u} />)}</datalist>
<div className="space-y-2">
  <label className="text-[10px] font-black uppercase text-slate-400">{"Model Pendidikan"}</label>
  <select 
    value={educationModel} 
    onChange={e => setEducationModel(e.target.value)} 
    className="input-std text-[10px] font-bold"
  >
    <option value="">{"Pilih Model"}</option>
    {EDUCATION_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
  </select>
</div>
</div>
                </div>
<div className="space-y-2">
  <label className="text-[10px] font-black uppercase text-slate-400">{"LinkedIn Profile URL"}</label>
  <input 
    type="url"
    value={linkedinUrl} 
    onChange={e => setLinkedinUrl(e.target.value)} 
    placeholder="https://linkedin.com/in/username"
    className="input-std font-bold text-xs text-blue-600" 
  />
</div>
                <div className="space-y-2"><label className="text-[10px] font-black uppercase text-slate-400">{"Executive Bio"}</label><textarea value={bio} onChange={e => setBio(e.target.value)} className="input-std min-h-[120px] text-xs" placeholder="Tulis ringkasan profesional untuk CV anda..." /></div>
                <button onClick={handleProfileSave} disabled={saving} className="w-full h-16 bg-slate-900 text-white rounded-[1.5rem] font-black uppercase tracking-widest flex items-center justify-center gap-3">
                    {saving ? "Menyimpan..." : <><Save size={20}/> {"Update Seluruh Data"}</>}
                </button>
            </div>
          ) : (
            <>
              {/* ID CARD VIRAL */}
              <section className="bg-white p-10 rounded-[3.5rem] border border-slate-100 flex flex-col md:flex-row gap-10 items-center shadow-sm">
                  <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white w-full md:w-64 aspect-[3/4.2] flex flex-col justify-between border-4 border-slate-800 shadow-2xl">
                    <div className="flex justify-between"><Building2 className="text-blue-500" size={28}/> <ShieldCheck className="text-green-500" size={28}/></div>
                    <div><h4 className="text-2xl font-black uppercase leading-tight italic">{fullName || "Talenta"}</h4><p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mt-1">{disabilityType}</p></div>
                    <div className="bg-white p-2 rounded-2xl w-fit shadow-inner"><QRCodeSVG value={`${typeof window !== "undefined" ? window.location.origin : ""}/talent/${user.id}`} size={70} /></div>
                  </div>
                  <div className="flex-1 space-y-6">
                    <h3 className="text-4xl font-black uppercase italic tracking-tighter leading-none text-slate-800">{"Verified Card"}</h3>
                    <p className="text-slate-500 text-sm italic border-l-8 border-blue-600 pl-6 py-2 leading-relaxed bg-slate-50 rounded-r-2xl">{bio || "Talenta profesional siap berkontribusi."}</p>
                    <div className="flex gap-3">
                        <button onClick={() => window.open(`https://wa.me/?text=Lihat profil saya: ${window.location.origin}/talent/${user.id}`)} className="bg-blue-600 text-white px-8 py-4 rounded-[2rem] font-black text-[10px] uppercase flex items-center gap-3 shadow-xl shadow-blue-200"><Share2 size={16}/> {"Share Profil"}</button>
                    </div>
                  </div>
              </section>

              {/* REKOMENDASI LOWONGAN (LAMAR LANGSUNG) */}
              <section className="bg-blue-50/50 p-10 rounded-[3.5rem] border border-blue-100 space-y-8">
                  <h2 className="text-base font-black uppercase text-slate-800 flex items-center gap-3 italic"><Search size={20} className="text-blue-600"/> {"Job Matches"}</h2>
                  <div className="grid gap-4">
                    {recommendedJobs.length === 0 ? <p className="text-[10px] font-bold text-slate-400 italic">{"Belum ada lowongan yang sesuai skill-mu."}</p> : recommendedJobs.map(job => (
                      <div key={job.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 flex justify-between items-center group shadow-sm hover:border-blue-500 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-blue-400 font-black text-[10px]">{"JOB"}</div>
                            <div><h4 className="text-xs font-black uppercase text-slate-800">{job.title}</h4><p className="text-[9px] font-bold text-slate-400 uppercase">{job.companies?.name}</p></div>
                        </div>
                        <button onClick={() => handleApply(job.id)} className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[9px] font-black uppercase flex items-center gap-2">{"Lamar"} <ArrowUpRight size={14}/></button>
                      </div>
                    ))}
                  </div>
              </section>

              {/* WORK EXPERIENCE */}
              <section className="bg-white p-10 rounded-[3.5rem] border border-slate-100 space-y-8 shadow-sm">
                  <div className="flex justify-between items-center">
                    <h2 className="text-base font-black uppercase text-slate-800 italic flex items-center gap-3"><Briefcase size={20} className="text-blue-600"/> {"Pengalaman Kerja"}</h2>
                    <button onClick={() => setShowWorkModal(true)} className="text-blue-600 hover:scale-110 transition-transform"><PlusCircle size={28}/></button>
                  </div>
                  <div className="space-y-4">
                    {workEx.map(work => (
                      <div key={work.id} className="p-6 border border-slate-100 rounded-[2rem] flex justify-between items-start bg-slate-50/50 group">
                        <div>
                            <h4 className="text-xs font-black uppercase">{work.position}</h4>
                            <p className="text-[10px] font-bold text-blue-600 uppercase flex items-center gap-2">{work.company_name} {work.is_current_work && <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-[8px]">{"AKTIF"}</span>}</p>
                            <p className="text-[9px] text-slate-400 mt-1 uppercase">{work.start_date} - {work.is_current_work ? "Sekarang" : work.end_date}</p>
                        </div>
                        <button onClick={async () => { await supabase.from("work_experiences").delete().eq("id", work.id); fetchInitialData(); }} className="text-red-300 group-hover:text-red-600 transition-colors"><Trash2 size={18}/></button>
                      </div>
                    ))}
                  </div>
              </section>

              {/* CERTIFICATIONS */}
              <section className="bg-white p-10 rounded-[3.5rem] border border-slate-100 space-y-8 shadow-sm">
                  <div className="flex justify-between items-center">
                    <h2 className="text-base font-black uppercase text-slate-800 italic flex items-center gap-3"><Award size={20} className="text-blue-600"/> {"Sertifikasi Pelatihan"}</h2>
                    <button onClick={() => setShowCertModal(true)} className="text-blue-600 hover:scale-110 transition-transform"><PlusCircle size={28}/></button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    {certs.map(cert => (
                      <div key={cert.id} className="p-5 border border-slate-100 rounded-[1.5rem] bg-slate-50/50 flex items-center gap-4">
                        <Award className="text-amber-500" size={24}/>
                        <div><h4 className="text-[10px] font-black uppercase leading-tight">{cert.name}</h4><p className="text-[8px] font-bold text-slate-400">{cert.organizer_name}</p></div>
                      </div>
                    ))}
                  </div>
              </section>

              {/* STATUS LAMARAN & RATING (SINKRON ratings.ts) */}
              <section className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-sm space-y-6">
                  <h2 className="text-base font-black uppercase text-slate-800 flex items-center gap-3 italic"><CheckCircle size={20} className="text-green-600"/> {"Lacak Lamaran & Audit Inklusi"}</h2>
                  <div className="space-y-3">
                      {myApplications.map(app => (
                        <div key={app.id} className="p-6 border-2 border-slate-50 rounded-[2rem] flex justify-between items-center">
                          <div><h4 className="text-xs font-black uppercase">{app.jobs?.title}</h4><p className="text-[9px] font-bold text-blue-600 uppercase italic">{"Status: "}{app.status}</p></div>
                          {app.status !== 'pending' && (
                            <button onClick={() => { setShowRatingId(app.id); setTargetCompanyId(app.jobs?.companies?.id) }} className="bg-amber-100 text-amber-700 px-5 py-3 rounded-2xl text-[9px] font-black uppercase flex items-center gap-2 hover:bg-amber-200 transition-all shadow-sm shadow-amber-900/10"><Star size={14} fill="currentColor"/> {"Audit Inklusi"}</button>
                          )}
                        </div>
                      ))}
                  </div>
              </section>
            </>
          )}
        </div>

        {/* SIDEBAR SNAPSHOT */}
        <div className="space-y-8">
            <section className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl space-y-8 sticky top-10">
                <h2 className="text-[11px] font-black uppercase text-blue-400 border-b border-white/10 pb-4 tracking-[0.2em] italic">{"Research Snapshot"}</h2>
                <div className="space-y-6 font-black uppercase">
                    <div className="space-y-1"><p className="text-white/30 text-[8px]">{"Karir Status"}</p><p className="text-xs leading-none">{careerStatus}</p></div>
                    <div className="space-y-1"><p className="text-white/30 text-[8px]">{"Jenis Disabilitas"}</p><p className="text-xs leading-none">{disabilityType}</p></div>
                    <div className="space-y-1"><p className="text-white/30 text-[8px]">{"Domisili Kota"}</p><p className="text-xs leading-none flex items-center gap-2"><MapPin size={12} className="text-red-500"/> {city}</p></div>
                </div>
                <div className="pt-6 border-t border-white/10"><p className="text-[8px] italic text-slate-400">{"ID Talenta: "}{user.id.substring(0,12)}</p></div>
            </section>
        </div>
      </div>

      {/* MODAL WORK EXPERIENCE */}
      {showWorkModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in zoom-in-95">
          <div className="bg-white w-full max-w-lg p-10 rounded-[3rem] shadow-2xl space-y-6 relative">
             <button onClick={() => setShowWorkModal(false)} className="absolute right-8 top-8 text-slate-400 hover:text-slate-900"><X size={28}/></button>
             <h3 className="text-xl font-black uppercase italic text-slate-800 italic">{"Add Work Experience"}</h3>
             <div className="grid gap-4">
                <input placeholder="Nama Perusahaan" value={newWork.company_name} onChange={e => setNewWork({...newWork, company_name: e.target.value})} className="input-std" />
                <input placeholder="Posisi" value={newWork.position} onChange={e => setNewWork({...newWork, position: e.target.value})} className="input-std" />
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><label className="text-[8px] font-black uppercase text-slate-400">{"Mulai"}</label><input type="date" value={newWork.start_date} onChange={e => setNewWork({...newWork, start_date: e.target.value})} className="input-std text-[10px]" /></div>
                    <div className="space-y-1"><label className="text-[8px] font-black uppercase text-slate-400">{"Selesai"}</label><input type="date" disabled={newWork.is_current_work} value={newWork.end_date} onChange={e => setNewWork({...newWork, end_date: e.target.value})} className="input-std text-[10px]" /></div>
                </div>
                <label className="flex items-center gap-2 text-[10px] font-black uppercase cursor-pointer"><input type="checkbox" checked={newWork.is_current_work} onChange={e => setNewWork({...newWork, is_current_work: e.target.checked})} className="w-4 h-4" /> {"Masih bekerja di sini"}</label>
                <textarea placeholder="Deskripsi Tugas..." value={newWork.description} onChange={e => setNewWork({...newWork, description: e.target.value})} className="input-std text-xs min-h-[100px]" />
                <button onClick={handleAddWork} className="w-full h-14 bg-blue-600 text-white rounded-2xl font-black uppercase text-[11px]">{"Simpan Pengalaman"}</button>
             </div>
          </div>
        </div>
      )}

      {/* MODAL CERTIFICATION */}
      {showCertModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in zoom-in-95">
          <div className="bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl space-y-6 relative">
             <button onClick={() => setShowCertModal(false)} className="absolute right-8 top-8 text-slate-400 hover:text-slate-900"><X size={28}/></button>
             <h3 className="text-xl font-black uppercase italic text-slate-800">{"Add Certification"}</h3>
             <div className="grid gap-4">
                <input placeholder="Judul Sertifikat" value={newCert.name} onChange={e => setNewCert({...newCert, name: e.target.value})} className="input-std" />
                <input placeholder="Penyelenggara" value={newCert.organizer_name} onChange={e => setNewCert({...newCert, organizer_name: e.target.value})} className="input-std" />
                <input placeholder="Tahun" value={newCert.year} onChange={e => setNewCert({...newCert, year: e.target.value})} className="input-std" />
                <button onClick={handleAddCert} className="w-full h-14 bg-blue-600 text-white rounded-2xl font-black uppercase text-[11px]">{"Verify Certificate"}</button>
             </div>
          </div>
        </div>
      )}

      {/* MODAL RATING POPUP */}
      {showRatingId && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-white w-full max-w-md p-12 rounded-[3.5rem] shadow-2xl space-y-8 relative">
             <button onClick={() => setShowRatingId(null)} className="absolute right-10 top-10 text-slate-400 hover:text-slate-900"><X size={24}/></button>
             <h3 className="text-2xl font-black uppercase italic text-slate-800">{"Audit Budaya Inklusi"}</h3>
             <div className="space-y-5">
               {["accessibility", "culture", "management", "onboarding"].map(cat => (
                 <div key={cat} className="space-y-2">
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-widest"><label className="text-slate-400">{cat}</label><span className="text-blue-600">{(ratingScores as any)[cat]} / 5</span></div>
                   <input type="range" min="1" max="5" value={(ratingScores as any)[cat]} onChange={e => setRatingScores({...ratingScores, [cat]: parseInt(e.target.value)})} className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                 </div>
               ))}
               <textarea placeholder="Ceritakan pengalaman anda secara anonim..." value={ratingScores.comment} onChange={e => setRatingScores({...ratingScores, comment: e.target.value})} className="input-std text-xs min-h-[100px]" />
             </div>
             <button onClick={submitInclusionRating} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black uppercase text-[11px] shadow-xl shadow-blue-200 transition-transform active:scale-95">{"Kirim Audit Inklusi"}</button>
          </div>
        </div>
      )}
    </div>
  )
}
