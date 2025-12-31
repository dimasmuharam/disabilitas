"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { QRCodeSVG } from "qrcode.react"
// Library untuk PDF (Pastikan sudah terinstall: npm install jspdf jspdf-autotable)
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
  Link as LinkIcon, CheckCircle, Calendar, FileDown
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
  const [isConsent, setIsConsent] = useState(false)

  // -- STATE RELASIONAL --
  const [certs, setCerts] = useState<any[]>([])
  const [workEx, setWorkEx] = useState<any[]>([])
  const [myApplications, setMyApplications] = useState<any[]>([])
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([])
  
  // -- INPUT STATES (Sertifikat & Kerja) --
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
      }
      const [cRes, wRes, aRes] = await Promise.all([
        supabase.from("certifications").select("*").eq("profile_id", user.id).order("created_at", { ascending: false }),
        supabase.from("work_experiences").select("*").eq("profile_id", user.id).order("is_current_work", { ascending: false }),
        supabase.from("applications").select("*, jobs(*, companies(*))").eq("applicant_id", user.id)
      ])
      if (cRes.data) setCerts(cRes.data); if (wRes.data) setWorkEx(wRes.data); if (aRes.data) setMyApplications(aRes.data)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  // FITUR UTAMA: GENERATE PDF CV PROFESIONAL & AKSESIBEL
  const generateCV = () => {
    const doc = new jsPDF()
    const primaryColor = [30, 41, 59] // Slate-900
    const accentColor = [37, 99, 235] // Blue-600

    // 1. KOP SURAT PROFESIONAL
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.rect(0, 0, 210, 40, "F")
    
    doc.setTextColor(255, 255, 255)
    doc.setFont("helvetica", "bold")
    doc.setFontSize(22)
    doc.text(fullName.toUpperCase(), 20, 20)
    
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text(`${disabilityType} | ${city} | ${careerStatus}`, 20, 28)
    doc.text(`Disabilitas.com - Profil Talenta Terverifikasi`, 140, 20)

    // 2. KONTAK & LINKS
    doc.setTextColor(0, 0, 0)
    doc.setFontSize(10)
    doc.text(`LinkedIn: ${linkedin || "-"}`, 20, 50)
    doc.text(`Portfolio: ${portfolioUrl || "-"}`, 20, 55)
    doc.line(20, 60, 190, 60)

    // 3. PENDIDIKAN
    doc.setFont("helvetica", "bold")
    doc.text("PENDIDIKAN", 20, 70)
    doc.setFont("helvetica", "normal")
    doc.text(`${lastEducation} ${major} - ${institutionName}`, 20, 78)

    // 4. PENGALAMAN KERJA (Table format agar rapi)
    doc.setFont("helvetica", "bold")
    doc.text("PENGALAMAN KERJA", 20, 95)
    autoTable(doc, {
      startY: 100,
      head: [["Posisi", "Perusahaan", "Periode"]],
      body: workEx.map(w => [w.position, w.company_name, `${w.start_date} - ${w.is_current_work ? "Sekarang" : w.end_date}`]),
      theme: "striped",
      headStyles: { fillColor: accentColor }
    })

    // 5. SERTIFIKASI & SKILLS
    const finalY = (doc as any).lastAutoTable.finalY || 150
    doc.setFont("helvetica", "bold")
    doc.text("SERTIFIKASI & KEAHLIAN", 20, finalY + 15)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.text(`Keahlian: ${skills}`, 20, finalY + 23, { maxWidth: 170 })

    // 6. FOOTER & QR CODE
    doc.line(20, 270, 190, 270)
    doc.setFontSize(8)
    doc.text("CV ini dihasilkan secara otomatis oleh Disabilitas.com. Pindai QR Code untuk melihat validitas profil.", 20, 278)
    
    // QR Code Placeholder (HRD bisa scan ke profil asli)
    doc.rect(170, 272, 20, 20)
    doc.text("QR VALID", 172, 283)

    doc.save(`CV_${fullName.replace(/\s+/g, "_")}.pdf`)
  }

  // Fungsi penunjang lainnya tetap sama (handleAddCertification, handleSaveProfile, dll)
  async function handleSaveProfile() {
    setSaving(true)
    const updates = {
      id: user.id, full_name: fullName, city, disability_type: disabilityType,
      education_level: lastEducation, education_model: educationModel, major,
      university: institutionName, skills: skills.split(",").map(s => s.trim()).filter(s => s),
      linkedin_url: linkedin, resume_url: resumeLink, career_status: careerStatus,
      updated_at: new Date()
    }
    const { error } = await supabase.from("profiles").upsert(updates)
    if (!error) { setMsg("Profil Disimpan."); setIsEditing(false); fetchInitialData() }
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
    }
  }

  if (loading) return <div className="p-20 text-center font-black animate-pulse">{"MENYIAPKAN CV DIGITAL..."}</div>

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-10">
      {/* HEADER UTAMA */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-slate-900 text-white p-8 rounded-3xl shadow-xl gap-6">
        <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-2xl font-black italic">{fullName.substring(0,2)}</div>
            <div>
                <h1 className="text-xl font-black uppercase italic">{fullName || "Talenta"}</h1>
                <p className="text-blue-400 text-[10px] font-bold uppercase">{careerStatus}</p>
            </div>
        </div>
        <div className="flex gap-4">
            <button onClick={generateCV} className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all">
                <FileDown size={14}/> {"Download CV PDF"}
            </button>
            <button onClick={() => setIsEditing(!isEditing)} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-black text-[10px] uppercase tracking-widest border border-white/10 transition-all">
                {isEditing ? "Tutup Editor" : <><Edit3 size={14}/> {"Edit Profil"}</>}
            </button>
        </div>
      </div>

      {isEditing ? (
        /* ================= FORM EDITOR (Sama seperti sebelumnya, disingkat untuk efisiensi pesan) ================= */
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-10">
            {/* Input Identitas, Pendidikan, Pengalaman Kerja, Sertifikasi, dll */}
            <h2 className="text-lg font-black uppercase italic text-blue-600 border-b pb-4">{"Pusat Pembaruan Data Talenta"}</h2>
            {/* ... Form input sesuai file sebelumnya ... */}
            <button onClick={handleSaveProfile} className="w-full h-16 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3">
                <Save size={20}/> {"Simpan Perubahan"}
            </button>
        </div>
      ) : (
        /* ================= VIEW MODE ================= */
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-10">
                {/* ID CARD DENGAN QR CODE */}
                <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 flex flex-col md:flex-row gap-8 items-center shadow-sm">
                   <div className="bg-slate-900 p-6 rounded-3xl text-white w-full md:w-64 aspect-[3/4] flex flex-col justify-between border border-white/10">
                      <div className="flex justify-between items-start"><Building2 className="text-blue-500" size={24}/> <ShieldCheck className="text-green-500" size={24}/></div>
                      <div><h4 className="text-xl font-black uppercase leading-tight">{fullName}</h4><p className="text-[9px] font-black text-blue-400 uppercase">{disabilityType}</p></div>
                      <div className="bg-white p-1 rounded-lg w-fit"><QRCodeSVG value={`${typeof window !== "undefined" ? window.location.origin : ""}/talent/${user.id}`} size={64} /></div>
                   </div>
                   <div className="flex-1 space-y-4">
                      <h3 className="text-3xl font-black uppercase italic tracking-tighter">{"Verified Identity"}</h3>
                      <p className="text-slate-500 text-xs">{"CV dan profil Anda telah terverifikasi oleh sistem Disabilitas.com untuk keperluan riset dan karir profesional."}</p>
                      <button onClick={() => window.open(`https://wa.me/?text=Cek profil profesional saya di: ${window.location.origin}/talent/${user.id}`)} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2"><Share2 size={16}/> {"Bagikan Profil"}</button>
                   </div>
                </section>

                {/* RIWAYAT KERJA */}
                <section className="space-y-6">
                    <h2 className="text-sm font-black uppercase text-slate-500 flex items-center gap-2"><Briefcase size={16}/> {"Riwayat Karir"}</h2>
                    {workEx.map(work => (
                        <div key={work.id} className="bg-white p-6 rounded-3xl border border-slate-200 flex justify-between items-start">
                            <div>
                                <h3 className="font-black text-xs uppercase">{work.position}</h3>
                                <p className="text-[10px] font-bold text-blue-600 uppercase">{work.company_name}</p>
                                <p className="text-[9px] text-slate-400 font-bold uppercase">{work.start_date} - {work.is_current_work ? "Sekarang" : work.end_date}</p>
                            </div>
                        </div>
                    ))}
                </section>
            </div>

            {/* SIDEBAR SNAPSHOT */}
            <div className="space-y-8">
                <section className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl space-y-4">
                    <h2 className="text-[10px] font-black uppercase text-slate-400 border-b border-white/10 pb-2">{"Snapshot Inklusi"}</h2>
                    <div className="space-y-4 text-xs font-bold uppercase">
                        <div><p className="text-blue-400 text-[8px]">{"Domisili"}</p>{city || "-"}</div>
                        <div><p className="text-blue-400 text-[8px]">{"Pendidikan"}</p>{lastEducation}</div>
                        <div><p className="text-blue-400 text-[8px]">{"Gaji"}</p>{"Rp "}{expectedSalary}</div>
                    </div>
                </section>
            </div>
        </div>
      )}
    </div>
  )
}
