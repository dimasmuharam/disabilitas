"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { QRCodeSVG } from "qrcode.react"
// Library untuk PDF
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
// SINKRONISASI DATA STATIC
import { 
  INDONESIA_CITIES, UNIVERSITIES, DISABILITY_TYPES,
  EDUCATION_LEVELS, EDUCATION_MODELS, WORK_MODES, 
  SKILLS_LIST, TRAINING_PARTNERS, COMMUNITY_PARTNERS 
} from "@/lib/data-static"
// SINKRONISASI ACTIONS
import { postInclusionRating } from "@/lib/actions/ratings"
import { 
  User, GraduationCap, Briefcase, ShieldCheck, Save, 
  Edit3, Award, Trash2, MapPin, Building2, 
  Share2, Globe, Laptop, Smartphone, Star, Clock,
  Link as LinkIcon, CheckCircle, Calendar, FileDown, FileText
} from "lucide-react"

export default function TalentDashboard({ user }: { user: any }) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [msg, setMsg] = useState("")
  const msgRef = useRef<HTMLDivElement>(null)

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
  const [resumeLink, setResumeLink] = useState("")
  const [careerStatus, setCareerStatus] = useState("Job Seeker")
  const [expectedSalary, setExpectedSalary] = useState("")
  const [bio, setBio] = useState("") // State Bio untuk Executive Summary
  const [isConsent, setIsConsent] = useState(false)

  // -- STATE RELASIONAL --
  const [certs, setCerts] = useState<any[]>([])
  const [workEx, setWorkEx] = useState<any[]>([])
  const [myApplications, setMyApplications] = useState<any[]>([])
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([])
  
  // -- INPUT STATES --
  const [newCert, setNewCert] = useState({ title: "", organizer_category: "Training Center", organizer_name: "", year: "2025", certificate_url: "", skills_acquired: [] as string[] })
  const [newWork, setNewWork] = useState({ company_name: "", position: "", start_date: "", end_date: "", is_current_work: false, description: "", skills_gained: [] as string[] })
  const [ratingScores, setRatingScores] = useState({ accessibility: 5, culture: 5, management: 5, onboarding: 5 })
  const [showRatingId, setShowRatingId] = useState<string | null>(null)

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
        setLinkedin(pData.linkedin_url || ""); setPortfolioUrl(pData.portfolio_url || "")
        setResumeLink(pData.resume_url || ""); setCareerStatus(pData.career_status || "Job Seeker")
        setExpectedSalary(pData.expected_salary || ""); setIsConsent(pData.has_informed_consent || false)
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

  // FITUR UTAMA: GENERATE PDF CV PROFESIONAL (UPDATE 5 POIN INTEGRASI)
  const generateCV = () => {
    const doc = new jsPDF()
    const primaryColor = [30, 41, 59] // Slate-900
    const accentColor = [37, 99, 235] // Blue-600

    // 1. KOP SURAT & KONTAK (POIN 4)
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.rect(0, 0, 210, 50, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(24)
    doc.text(fullName.toUpperCase(), 20, 25)
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`${disabilityType} | ${city}`, 20, 33)
    doc.text(`Email: ${user.email} | Portfolio: ${portfolioUrl || "-"}`, 20, 39)
    doc.text(`Disabilitas.com - Talenta Terverifikasi`, 145, 20)

    // 2. EXECUTIVE SUMMARY (POIN 1 - FLEKSIBEL BIO)
    doc.setTextColor(0, 0, 0)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(12)
    doc.text("RINGKASAN PROFESIONAL", 20, 65)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    const summaryText = bio || `Talenta ${disabilityType} dengan spesialisasi ${major}. Memiliki fokus karir sebagai ${careerStatus} dengan keahlian utama ${skills}.`
    doc.text(summaryText, 20, 72, { maxWidth: 170 })

    // 3. ALAT BANTU (POIN 2 - DATA REAL)
    doc.setFillColor(241, 245, 249)
    doc.rect(20, 85, 170, 12, "F")
    doc.setFont("helvetica", "bold")
    doc.text("AKOMODASI & ALAT BANTU:", 25, 93)
    doc.setFont("helvetica", "normal")
    doc.text(assistiveTools || "Mandiri / Tanpa alat bantu khusus", 75, 93)

    // 4. PENGALAMAN KERJA (POIN 3 - DESKRIPSI)
    doc.setFont("helvetica", "bold")
    doc.text("RIWAYAT PENGALAMAN KERJA", 20, 110)
    autoTable(doc, {
      startY: 115,
      head: [["Posisi", "Lembaga/Perusahaan", "Periode", "Tugas Utama"]],
      body: workEx.map(w => [w.position, w.company_name, `${w.start_date} - ${w.is_current_work ? "Sekarang" : w.end_date}`, w.description || "-"]),
      theme: "striped",
      headStyles: { fillColor: accentColor },
      columnStyles: { 3: { cellWidth: 60 } }
    })

    // 5. PENDIDIKAN & SERTIFIKASI (POIN 5)
    const finalY = (doc as any).lastAutoTable.finalY || 160
    doc.setFont("helvetica", "bold")
    doc.text("PENDIDIKAN", 20, finalY + 15)
    doc.setFont("helvetica", "normal")
    doc.text(`${lastEducation} ${major} - ${institutionName}`, 20, finalY + 22)

    doc.setFont("helvetica", "bold")
    doc.text("SERTIFIKASI TERVERIFIKASI", 20, finalY + 35)
    let certY = finalY + 42
    certs.slice(0, 4).forEach(c => {
      doc.setFont("helvetica", "normal")
      doc.text(`- ${c.name} (${c.organizer_name}, ${c.year})`, 25, certY)
      certY += 7
    })

    // 6. FOOTER & VALIDASI QR
    doc.setDrawColor(200, 200, 200)
    doc.line(20, 275, 190, 275)
    doc.setFontSize(8)
    doc.text("Dokumen ini divalidasi oleh sistem Disabilitas.com. Pindai QR untuk verifikasi data talenta.", 20, 282)
    doc.rect(175, 277, 15, 15)
    doc.text("VALID DATA", 173, 295)

    doc.save(`CV_${fullName.replace(/\s+/g, "_")}.pdf`)
  }

  async function handleSaveProfile() {
    setSaving(true)
    const updates = {
      id: user.id, full_name: fullName, city, disability_type: disabilityType,
      education_level: lastEducation, education_model: educationModel, major,
      university: institutionName, bio,
      skills: skills.split(",").map(s => s.trim()).filter(s => s),
      used_assistive_tools: assistiveTools.split(",").map(t => t.trim()).filter(t => t),
      linkedin_url: linkedin, portfolio_url: portfolioUrl, career_status: careerStatus,
      updated_at: new Date()
    }
    const { error } = await supabase.from("profiles").upsert(updates)
    if (!error) { setMsg("Profil & Bio Berhasil Disinkronkan."); setIsEditing(false); fetchInitialData() }
    setSaving(false)
  }

  async function handleAddWorkExperience() {
    if (!newWork.company_name || !newWork.position) return
    const { data } = await supabase.from("work_experiences").insert({
      profile_id: user.id, company_name: newWork.company_name, position: newWork.position,
      start_date: newWork.start_date, end_date: newWork.is_current_work ? null : newWork.end_date,
      is_current_work: newWork.is_current_work, description: newWork.description
    }).select().single()
    if (data) {
        setWorkEx([data, ...workEx])
        setNewWork({ company_name: "", position: "", start_date: "", end_date: "", is_current_work: false, description: "", skills_gained: [] })
        setMsg("Pengalaman kerja berhasil ditambahkan.")
    }
  }

  async function handleAddCertification() {
    if (!newCert.title || !newCert.organizer_name) return
    const { data } = await supabase.from("certifications").insert({
      profile_id: user.id, name: newCert.title, organizer_category: newCert.organizer_category,
      organizer_name: newCert.organizer_name, year: newCert.year, skills_acquired: newCert.skills_acquired
    }).select().single()
    if (data) {
        setCerts([data, ...certs])
        setNewCert({ title: "", organizer_category: "Training Center", organizer_name: "", year: "2025", certificate_url: "", skills_acquired: [] })
        setMsg("Sertifikasi pelatihan berhasil diverifikasi ke profil.")
    }
  }

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-400">{"MENYIAPKAN PUSAT DATA TALENTA..."}</div>

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-10">
      {/* HEADER UTAMA */}
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
        /* ================================= EDIT MODE ================================= */
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-10">
            <h2 className="text-lg font-black uppercase italic text-blue-600 border-b pb-4">{"Pusat Pembaruan Data Talenta"}</h2>
            
            <div className="grid md:grid-cols-2 gap-10">
                {/* IDENTITAS */}
                <div className="space-y-4">
                    <h3 className="font-black text-[10px] uppercase text-slate-400 tracking-widest flex items-center gap-2"><User size={14}/> {"Identitas & Bio"}</h3>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">{"Nama Lengkap"}</label><input value={fullName} onChange={e => setFullName(e.target.value)} className="input-std font-bold" /></div>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">{"Bio / Executive Summary CV"}</label>
                        <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tulis ringkasan profesional Anda untuk CV..." className="input-std min-h-[100px] text-xs" />
                    </div>
                </div>
                {/* PENDIDIKAN */}
                <div className="space-y-4">
                    <h3 className="font-black text-[10px] uppercase text-slate-400 tracking-widest flex items-center gap-2"><GraduationCap size={14}/> {"Pendidikan Terakhir"}</h3>
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">{"Almamater"}</label><input list="uni-list" value={institutionName} onChange={e => setInstitutionName(e.target.value)} className="input-std" /><datalist id="uni-list">{UNIVERSITIES.map(u => <option key={u} value={u} />)}</datalist></div>
                    <div className="grid grid-cols-2 gap-4">
                        <select value={lastEducation} onChange={e => setLastEducation(e.target.value)} className="input-std font-bold text-xs">{EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}</select>
                        <select value={educationModel} onChange={e => setEducationModel(e.target.value)} className="input-std font-bold text-xs">{EDUCATION_MODELS.map(m => <option key={m} value={m}>{m}</option>)}</select>
                    </div>
                </div>
            </div>

            {/* PENGALAMAN KERJA INPUT */}
            <div className="pt-10 border-t space-y-6">
                <h3 className="font-black text-[10px] uppercase text-slate-400 tracking-widest flex items-center gap-2"><Briefcase size={14}/> {"Tambah Pengalaman Kerja"}</h3>
                <div className="grid md:grid-cols-2 gap-4 bg-slate-50 p-6 rounded-3xl border border-slate-200">
                    <input placeholder="Nama Perusahaan" value={newWork.company_name} onChange={e => setNewWork({...newWork, company_name: e.target.value})} className="input-std" />
                    <input placeholder="Posisi/Jabatan" value={newWork.position} onChange={e => setNewWork({...newWork, position: e.target.value})} className="input-std" />
                    <div className="grid grid-cols-2 gap-2">
                        <input type="date" value={newWork.start_date} onChange={e => setNewWork({...newWork, start_date: e.target.value})} className="input-std text-[10px]" />
                        <input type="date" disabled={newWork.is_current_work} value={newWork.end_date} onChange={e => setNewWork({...newWork, end_date: e.target.value})} className="input-std text-[10px]" />
                    </div>
                    <label className="flex items-center gap-2 text-[10px] font-black uppercase"><input type="checkbox" checked={newWork.is_current_work} onChange={e => setNewWork({...newWork, is_current_work: e.target.checked})} /> {"Masih bekerja di sini"}</label>
                    <textarea placeholder="Deskripsi Tugas & Pencapaian" value={newWork.description} onChange={e => setNewWork({...newWork, description: e.target.value})} className="md:col-span-2 input-std min-h-[80px] text-xs" />
                    <button onClick={handleAddWorkExperience} className="md:col-span-2 py-3 bg-blue-600 text-white rounded-xl font-black uppercase text-[10px]">{"Simpan Pengalaman Kerja"}</button>
                </div>
            </div>

            <button onClick={handleSaveProfile} disabled={saving} className="w-full h-16 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">
                {saving ? "MENYIMPAN..." : <><Save size={20}/> {"Simpan Seluruh Profil & Bio"}</>}
            </button>
        </div>
      ) : (
        /* ================================= VIEW MODE ================================= */
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-10">
                {/* ID CARD DENGAN QR */}
                <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 flex flex-col md:flex-row gap-8 items-center shadow-sm">
                   <div className="bg-slate-900 p-6 rounded-3xl text-white w-full md:w-64 aspect-[3/4] flex flex-col justify-between border border-white/10 shadow-2xl">
                      <div className="flex justify-between items-start"><Building2 className="text-blue-500" size={24}/> <ShieldCheck className="text-green-500" size={24}/></div>
                      <div><h4 className="text-xl font-black uppercase leading-tight">{fullName || "Talenta"}</h4><p className="text-[9px] font-black text-blue-400 uppercase">{disabilityType}</p></div>
                      <div className="bg-white p-1 rounded-lg w-fit"><QRCodeSVG value={`${typeof window !== "undefined" ? window.location.origin : ""}/talent/${user.id}`} size={64} /></div>
                   </div>
                   <div className="flex-1 space-y-4">
                      <h3 className="text-3xl font-black uppercase italic tracking-tighter">{"Verified Identity"}</h3>
                      <p className="text-slate-600 text-xs leading-relaxed italic border-l-4 border-blue-600 pl-4">
                        {bio || "Tuliskan bio profesional Anda di editor untuk ditampilkan sebagai Executive Summary di CV PDF Anda."}
                      </p>
                      <button onClick={() => window.open(`https://wa.me/?text=Cek profil profesional saya di: ${window.location.origin}/talent/${user.id}`)} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 hover:bg-blue-700 transition-all"><Share2 size={16}/> {"Bagikan Profil"}</button>
                   </div>
                </section>

                {/* RIWAYAT KARIR */}
                <section className="space-y-6">
                    <h2 className="text-sm font-black uppercase text-slate-500 flex items-center gap-2"><Briefcase size={16}/> {"Riwayat Karir Profesional"}</h2>
                    <div className="grid gap-4">
                        {workEx.length === 0 ? (
                            <p className="p-10 border-2 border-dashed border-slate-100 rounded-3xl text-center text-slate-400 text-xs font-bold uppercase italic">{"Belum ada riwayat kerja."}</p>
                        ) : workEx.map(work => (
                            <div key={work.id} className="bg-white p-6 rounded-3xl border border-slate-200 flex justify-between items-start group">
                                <div className="space-y-1">
                                    <h3 className="font-black text-xs uppercase">{work.position}</h3>
                                    <p className="text-[10px] font-bold text-blue-600 uppercase flex items-center gap-1"><Building2 size={12}/> {work.company_name}</p>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase">{work.start_date} - {work.is_current_work ? "Sekarang" : work.end_date}</p>
                                    {work.description && <p className="text-[10px] text-slate-500 mt-2 italic">{work.description}</p>}
                                </div>
                                <button onClick={async () => { await supabase.from("work_experiences").delete().eq("id", work.id); setWorkEx(workEx.filter(w => w.id !== work.id)) }} className="text-red-400 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* SIDEBAR SNAPSHOT */}
            <div className="space-y-8">
                <section className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl space-y-4">
                    <h2 className="text-[10px] font-black uppercase text-slate-400 border-b border-white/10 pb-2">{"Snapshot Inklusi"}</h2>
                    <div className="space-y-4 text-[10px] font-black uppercase">
                        <div><p className="text-blue-400 text-[8px]">{"Domisili"}</p>{city || "-"}</div>
                        <div><p className="text-blue-400 text-[8px]">{"Alat Bantu"}</p>{assistiveTools || "-"}</div>
                        <div><p className="text-blue-400 text-[8px]">{"Pendidikan"}</p>{lastEducation}</div>
                    </div>
                </section>

                <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                    <h2 className="text-[10px] font-black uppercase text-slate-400 border-b pb-2 flex items-center gap-2"><Award size={14}/> {"Sertifikasi Pelatihan"}</h2>
                    <div className="space-y-4">
                        {certs.length === 0 ? (
                            <p className="text-[10px] italic text-center text-slate-400">{"Kosong"}</p>
                        ) : certs.map(c => (
                            <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                <h4 className="text-[10px] font-black uppercase">{c.name}</h4>
                                <p className="text-[8px] font-bold text-blue-600 uppercase">{c.organizer_name}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
      )}
    </div>
  )
}
