"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter, useSearchParams } from "next/navigation"
import { 
  INDONESIA_CITIES, 
  UNIVERSITIES, 
  DISABILITY_TOOLS, 
  DISABILITY_TYPES,
  EDUCATION_LEVELS,
  EDUCATION_MODELS,
  SCHOLARSHIP_TYPES,
  EDUCATION_BARRIERS,
  ACCOMMODATION_TYPES,
  SKILLS_LIST
} from "@/lib/data-static"
import { 
  User, GraduationCap, Briefcase, FileText, 
  ShieldCheck, Save, CheckCircle, Info, MapPin, Tool
} from "lucide-react"

export default function TalentDashboard({ user }: { user: any }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState("")
  const [showConsentModal, setShowConsentModal] = useState(false)

  // -- DATA STATE (SINKRON DENGAN SQL & DATA-STATIC) --
  const [fullName, setFullName] = useState("")
  const [city, setCity] = useState("")
  const [gender, setGender] = useState("Laki-laki")
  const [disabilityType, setDisabilityType] = useState("")
  
  // Pendidikan & Riset
  const [lastEducation, setLastEducation] = useState("")
  const [educationModel, setEducationModel] = useState("")
  const [institutionName, setInstitutionName] = useState("")
  const [scholarshipType, setScholarshipType] = useState("")
  const [educationBarrier, setEducationBarrier] = useState("")
  
  // Keahlian & Aksesibilitas (Multi-input handling)
  const [skills, setSkills] = useState("") 
  const [assistiveTools, setAssistiveTools] = useState("") 
  const [accommodations, setAccommodations] = useState("")

  // Verifikasi & Link
  const [linkedin, setLinkedin] = useState("")
  const [portfolioLink, setPortfolioLink] = useState("")
  const [resumeLink, setResumeLink] = useState("")
  const [proofLink, setProofLink] = useState("")
  const [isConsent, setIsConsent] = useState(false)

  useEffect(() => {
    getProfile()
  }, []) 

  async function getProfile() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setFullName(data.full_name || "")
        setCity(data.city || "")
        setGender(data.gender || "Laki-laki")
        setDisabilityType(data.disability_type || "")
        setLastEducation(data.education_level || "")
        setEducationModel(data.education_model || "")
        setInstitutionName(data.university || "")
        setScholarshipType(data.scholarship_type || "")
        setEducationBarrier(data.education_barrier || "")
        
        // Handling Array to String untuk UI
        setSkills(data.skills ? data.skills.join(", ") : "")
        setAssistiveTools(data.used_assistive_tools ? data.used_assistive_tools.join(", ") : "")
        setAccommodations(data.preferred_accommodations ? data.preferred_accommodations.join(", ") : "")
        
        setLinkedin(data.linkedin_url || "")
        setPortfolioLink(data.portfolio_url || "")
        setResumeLink(data.resume_url || "")
        setProofLink(data.document_disability_url || "")
        setIsConsent(data.has_informed_consent || false)

        // Jika belum pernah consent, tampilkan modal
        if (!data.has_informed_consent) {
            setShowConsentModal(true)
        }
      } else {
        setShowConsentModal(true) // User baru
      }
    } catch (error) {
      console.error("Error loading profile", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!isConsent) {
        setMsg("Anda harus menyetujui Informed Consent untuk melanjutkan.")
        return
    }

    setSaving(true)
    setMsg("")

    const updates = {
      id: user.id,
      full_name: fullName,
      city,
      gender,
      disability_type: disabilityType,
      education_level: lastEducation,
      education_model: educationModel,
      university: institutionName,
      scholarship_type: scholarshipType,
      education_barrier: educationBarrier,
      // Array Processing
      skills: skills.split(",").map(s => s.trim()).filter(s => s !== ""),
      used_assistive_tools: assistiveTools.split(",").map(t => t.trim()).filter(t => t !== ""),
      preferred_accommodations: accommodations.split(",").map(a => a.trim()).filter(a => a !== ""),
      // Links
      linkedin_url: linkedin,
      portfolio_url: portfolioLink,
      resume_url: resumeLink,
      document_disability_url: proofLink,
      has_informed_consent: isConsent,
      updated_at: new Date(),
    }

    const { error } = await supabase.from('profiles').upsert(updates)
    
    if (error) {
      setMsg("Gagal menyimpan: " + error.message)
    } else {
      setMsg("Profil berhasil disinkronkan dengan sistem riset.")
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    setSaving(false)
  }

  if (loading) return <div className="p-20 text-center animate-pulse italic text-slate-500">Menyelaraskan data talenta...</div>

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* MODAL INFORMED CONSENT (STEP 0) */}
      {showConsentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-8 shadow-2xl border border-blue-100 dark:border-slate-800">
            <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200">
              <ShieldCheck className="text-white h-8 w-8" />
            </div>
            <h2 className="text-2xl font-black mb-4 tracking-tighter">Informed Consent</h2>
            <div className="text-sm text-slate-600 dark:text-slate-400 space-y-4 leading-relaxed mb-8">
              <p>Selamat datang di <strong>disabilitas.com</strong>. Sebelum melengkapi profil, kami memerlukan persetujuan Anda terkait pengelolaan data.</p>
              <p>Data Anda akan digunakan untuk:
                <br />1. Menghubungkan Anda dengan pemberi kerja inklusif.
                <br />2. Pengembangan sistem layanan aksesibilitas di platform ini.
                <br />3. Pengolahan data statistik (anonim) demi advokasi kebijakan inklusivitas nasional.
              </p>
              <p className="italic font-medium">Kami menjamin kerahasiaan identitas pribadi Anda dalam setiap publikasi hasil riset.</p>
            </div>
            <button 
              onClick={() => {setIsConsent(true); setShowConsentModal(false)}}
              className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 uppercase tracking-widest"
            >
              Saya Setuju & Lanjutkan
            </button>
          </div>
        </div>
      )}

      {/* HEADER DASHBOARD */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tighter italic">TALENT DASHBOARD</h1>
          <p className="text-slate-500 font-medium">Lengkapi variabel kepakaran dan pendidikan Anda untuk sinkronisasi riset.</p>
        </div>
        {msg && (
          <div className="px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs font-bold animate-bounce">
            {msg}
          </div>
        )}
      </div>

      <form onSubmit={handleUpdateProfile} className="space-y-8">
        {/* SECTION 1: IDENTITAS (SOP HYBRID) */}
        <section className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="flex items-center gap-2 text-lg font-black mb-6 uppercase tracking-tight text-blue-600">
            <User size={20} /> Identitas Dasar
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Nama Lengkap</label>
              <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="input-std font-bold" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Kota Domisili (Hybrid)</label>
              <input list="city-list" value={city} onChange={e => setCity(e.target.value)} className="input-std" placeholder="Ketik kota..." />
              <datalist id="city-list">{INDONESIA_CITIES.map(c => <option key={c} value={c} />)}</datalist>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Ragam Disabilitas (Hybrid)</label>
              <input list="dis-list" value={disabilityType} onChange={e => setDisabilityType(e.target.value)} className="input-std" placeholder="Pilih atau ketik baru..." />
              <datalist id="dis-list">{DISABILITY_TYPES.map(t => <option key={t} value={t} />)}</datalist>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Jenis Kelamin</label>
              <select value={gender} onChange={e => setGender(e.target.value)} className="input-std">
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>
          </div>
        </section>

        {/* SECTION 2: PENDIDIKAN INKLUSIF (RISET CORE) */}
        <section className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="flex items-center gap-2 text-lg font-black mb-6 uppercase tracking-tight text-purple-600">
            <GraduationCap size={22} /> Dimensi Pendidikan
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Jenjang Terakhir</label>
              <select value={lastEducation} onChange={e => setLastEducation(e.target.value)} className="input-std font-bold">
                <option value="">-- Pilih --</option>
                {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Model Sekolah (Riset)</label>
              <select value={educationModel} onChange={e => setEducationModel(e.target.value)} className="input-std">
                <option value="">-- Pilih --</option>
                {EDUCATION_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-1 md:col-span-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Nama Institusi (Hybrid)</label>
              <input list="uni-list" value={institutionName} onChange={e => setInstitutionName(e.target.value)} className="input-std" placeholder="Ketik nama universitas/sekolah..." />
              <datalist id="uni-list">{UNIVERSITIES.map(u => <option key={u} value={u} />)}</datalist>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Sumber Pendanaan / Beasiswa</label>
              <select value={scholarshipType} onChange={e => setScholarshipType(e.target.value)} className="input-std">
                <option value="">-- Pilih --</option>
                {SCHOLARSHIP_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Hambatan Pendidikan Utama</label>
              <select value={educationBarrier} onChange={e => setEducationBarrier(e.target.value)} className="input-std">
                <option value="">-- Pilih --</option>
                {EDUCATION_BARRIERS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
          </div>
        </section>

        {/* SECTION 3: SKILL & AKSESIBILITAS */}
        <section className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="flex items-center gap-2 text-lg font-black mb-6 uppercase tracking-tight text-orange-600">
            <Briefcase size={20} /> Keahlian & Akomodasi
          </h3>
          <div className="space-y-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex justify-between">
                Keahlian (Pisahkan dengan koma) <span>Hybrid</span>
              </label>
              <textarea 
                value={skills} 
                onChange={e => setSkills(e.target.value)} 
                className="input-std h-24 text-sm" 
                placeholder="Contoh: Administrasi, Coding, Pijat, Analisis Data..." 
              />
              <p className="text-[10px] italic text-slate-400">Saran: {SKILLS_LIST.slice(0, 5).join(", ")}...</p>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Alat Bantu yang Dikuasai</label>
              <input list="tool-list" value={assistiveTools} onChange={e => setAssistiveTools(e.target.value)} className="input-std" placeholder="NVDA, Kursi Roda Elektrik, dll..." />
              <datalist id="tool-list">{DISABILITY_TOOLS.map(t => <option key={t} value={t} />)}</datalist>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Akomodasi yang Dibutuhkan</label>
              <input list="acc-list" value={accommodations} onChange={e => setAccommodations(e.target.value)} className="input-std" placeholder="Juru Bahasa Isyarat, Ramp, dll..." />
              <datalist id="acc-list">{ACCOMMODATION_TYPES.map(a => <option key={a} value={a} />)}</datalist>
            </div>
          </div>
        </section>

        {/* SECTION 4: VALIDASI & VERIFIKASI */}
        <section className="bg-slate-50 dark:bg-slate-950 p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-inner">
          <h3 className="flex items-center gap-2 text-lg font-black mb-6 uppercase tracking-tight text-slate-700 dark:text-slate-300">
            <FileText size={20} /> Verifikasi & Tautan
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Link CV (Google Drive)</label>
              <input type="url" value={resumeLink} onChange={e => setResumeLink(e.target.value)} className="input-std text-blue-600 underline" placeholder="https://drive.google.com/..." />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Bukti Disabilitas (KTA OPD/Surat)</label>
              <input type="url" value={proofLink} onChange={e => setProofLink(e.target.value)} className="input-std" placeholder="Tautan file dokumen..." />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Link LinkedIn</label>
              <input type="url" value={linkedin} onChange={e => setLinkedin(e.target.value)} className="input-std" placeholder="https://linkedin.com/in/..." />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Link Portofolio</label>
              <input type="url" value={portfolioLink} onChange={e => setPortfolioLink(e.target.value)} className="input-std" placeholder="Link karya/projek..." />
            </div>
          </div>
        </section>

        {/* SUBMIT SECTION */}
        <div className="pt-6">
          <button 
            type="submit" 
            disabled={saving}
            className="w-full h-16 bg-blue-600 text-white rounded-2xl font-black text-xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 flex items-center justify-center gap-3 uppercase tracking-tighter"
          >
            {saving ? "Sinkronisasi..." : <><Save /> Simpan & Aktifkan Profil</> }
          </button>
          <p className="text-center text-[10px] text-slate-400 mt-4 uppercase font-bold tracking-widest">Data Anda dilindungi oleh kebijakan Informed Consent Disabilitas.com</p>
        </div>
      </form>
    </div>
  )
}
