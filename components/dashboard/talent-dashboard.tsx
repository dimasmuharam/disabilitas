"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { 
  User, Mail, MapPin, Briefcase, GraduationCap, Link as LinkIcon, 
  FileDown, Youtube, Save, Share2, Download, CheckCircle2, 
  AlertCircle, Search, Laptop, Smartphone, Wifi, ArrowUpRight, Plus, X, Linkedin
} from "lucide-react";
import { 
  DISABILITY_TYPES, WORK_MODES, CAREER_STATUSES, EDUCATION_LEVELS, 
  EDUCATION_MODELS, SCHOLARSHIP_TYPES, EDUCATION_BARRIERS, 
  ACCOMMODATION_TYPES, DISABILITY_TOOLS, SKILLS_LIST, 
  INDONESIA_CITIES, UNIVERSITIES 
} from "@/lib/data-static";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function TalentDashboard({ 
  user: authUser, 
  autoOpenProfile = false 
}: { 
  user: any; 
  autoOpenProfile?: boolean 
}) {
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  // -- STATE DATA PROFIL (SINKRON SKEMA DB) --
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [disabilityType, setDisabilityType] = useState("");
  const [careerStatus, setCareerStatus] = useState("");
  const [lastEducation, setLastEducation] = useState("");
  const [educationModel, setEducationModel] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [major, setMajor] = useState("");
  const [bio, setBio] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [docDisabilityUrl, setDocDisabilityUrl] = useState("");
  const [videoIntroUrl, setVideoIntroUrl] = useState("");
  const [scholarship, setScholarship] = useState("");
  const [hasLaptop, setHasLaptop] = useState(false);
  const [hasSmartphone, setHasSmartphone] = useState(false);
  const [hasWifi, setHasWifi] = useState(false);
  
  // -- STATE MULTI-VALUED (ARRAYS) --
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedBarriers, setSelectedBarriers] = useState<string[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [selectedAccommodations, setSelectedAccommodations] = useState<string[]>([]);
  const [workPref, setWorkPref] = useState("");
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    if (autoOpenProfile) {
      setIsEditing(true);
      window.scrollTo({ top: 150, behavior: 'smooth' });
    }
    fetchInitialData();
  }, [autoOpenProfile, authUser?.id]);

  async function fetchInitialData() {
    if (!authUser?.id) return;
    
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", authUser.id)
      .single();

    if (profile) {
      setFullName(profile.full_name || "");
      setDob(profile.date_of_birth || "");
      setGender(profile.gender || "");
      setPhone(profile.phone || "");
      setCity(profile.city || "");
      setDisabilityType(profile.disability_type || "");
      setCareerStatus(profile.career_status || "");
      setLastEducation(profile.education_level || "");
      setEducationModel(profile.education_model || "");
      setInstitutionName(profile.university || "");
      setMajor(profile.major || "");
      setBio(profile.bio || "");
      setLinkedinUrl(profile.linkedin_url || "");
      setPortfolioUrl(profile.portfolio_url || "");
      setResumeUrl(profile.resume_url || "");
      setDocDisabilityUrl(profile.document_disability_url || "");
      setVideoIntroUrl(profile.video_intro_url || "");
      setScholarship(profile.scholarship_type || "");
      setHasLaptop(profile.has_laptop || false);
      setHasSmartphone(profile.has_smartphone || false);
      setHasWifi(profile.internet_quality === "Ada Wifi/Kabel");
      setSelectedSkills(profile.skills || []);
      setSelectedBarriers(profile.education_barrier || []);
      setSelectedTools(profile.used_assistive_tools || []);
      setSelectedAccommodations(profile.preferred_accommodation || []);
      setWorkPref(profile.work_preference || "");
      setConsent(profile.has_informed_consent || false);
    }
    setLoading(false);
  }

  // VALIDASI GOOGLE DRIVE LINK (Shared Status)
  const checkDriveLink = (url: string) => {
    if (url && url.includes("drive.google.com") && !url.includes("usp=sharing")) {
      return false;
    }
    return true;
  };

  async function handleProfileSave() {
    if (!consent) {
      setMsg("❌ Mohon setujui Informed Consent.");
      return;
    }

    if (!checkDriveLink(resumeUrl) || !checkDriveLink(docDisabilityUrl)) {
      setMsg("⚠️ Link Google Drive harus berstatus 'Anyone with link'.");
      return;
    }

    setSaving(true);
    const updates = {
      id: authUser.id,
      full_name: fullName,
      date_of_birth: dob,
      gender,
      phone,
      city,
      disability_type: disabilityType,
      career_status: careerStatus,
      education_level: lastEducation,
      education_model: educationModel,
      university: institutionName,
      major,
      bio,
      linkedin_url: linkedinUrl,
      portfolio_url: portfolioUrl,
      resume_url: resumeUrl,
      document_disability_url: docDisabilityUrl,
      video_intro_url: videoIntroUrl,
      scholarship_type: scholarship,
      has_laptop: hasLaptop,
      has_smartphone: hasSmartphone,
      internet_quality: hasWifi ? "Ada Wifi/Kabel" : "Tidak Ada",
      skills: selectedSkills,
      education_barrier: selectedBarriers,
      used_assistive_tools: selectedTools,
      preferred_accommodation: selectedAccommodations,
      work_preference: workPref,
      has_informed_consent: true,
      updated_at: new Date(),
    };

    const { error } = await supabase.from("profiles").upsert(updates);
    if (!error) {
      setMsg("✅ Profil Bisnis Berhasil Diperbarui.");
      setIsEditing(false);
      fetchInitialData();
    } else {
      setMsg("❌ Gagal menyimpan data ke pusat data.");
    }
    setSaving(false);
    setTimeout(() => setMsg(""), 3000);
  }

  const exportPDF = async () => {
    const element = document.getElementById("cv-template");
    if (element) {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      pdf.addImage(imgData, "PNG", 0, 0, 210, 297);
      pdf.save(`CV_Business_${fullName.replace(/\s+/g, '_')}.pdf`);
    }
  };

  const shareProfile = () => {
    const text = `Halo! Saya ${fullName}, talenta profesional disabilitas (${disabilityType}). Cek profil lengkap dan ketersediaan saya di disabilitas.com untuk kolaborasi bisnis yang inklusif!`;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.origin + '/talent/' + authUser?.id)}&summary=${encodeURIComponent(text)}`, "_blank");
  };

  if (loading) return <div className="p-20 text-center font-black italic text-slate-400 animate-pulse">{"MENGHUBUNGKAN KE PUSAT DATA..."}</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 px-4 md:px-10 font-sans selection:bg-blue-100">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* HEADER DASHBOARD */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pt-10">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase leading-none">
              {"Talent"} <span className="text-blue-600 italic">{"Dashboard"}</span>
            </h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-4">
              {"Pusat Pengembangan Karir & Manajemen Profil"}
            </p>
          </div>
          <div className="flex gap-3">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2 shadow-xl shadow-slate-200 active:scale-95"
              >
                <User size={14} /> {"Edit Profil Lengkap"}
              </button>
            ) : (
              <button 
                onClick={() => setIsEditing(false)}
                className="bg-white text-red-600 border-2 border-red-100 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-50 transition-all shadow-xl shadow-red-50 active:scale-95"
              >
                {"Tutup & Batal"}
              </button>
            )}
          </div>
        </header>

        {msg && (
          <div className="animate-in fade-in slide-in-from-top-2 bg-blue-600 text-white p-5 rounded-2xl text-center font-black uppercase text-[10px] tracking-widest italic shadow-2xl border-b-4 border-blue-800">
            {msg}
          </div>
        )}

        {isEditing ? (
          /* ======================================================================== */
          /* FORM EDITING MODE - FULL FIELDS & ACCESSIBLE                             */
          /* ======================================================================== */
          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-200 shadow-2xl space-y-12 animate-in zoom-in-95 duration-300" role="form" aria-labelledby="form-title">
            
            <h3 id="form-title" className="font-black text-xs uppercase text-blue-600 italic border-b pb-4 tracking-widest">{"Data Personal & Preferensi Bisnis"}</h3>

            {/* SEKSI I: IDENTITAS & KONTAK */}
            <section className="space-y-8">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <label htmlFor="full_name" className="text-[10px] font-black uppercase text-slate-400">{"Nama Lengkap"}</label>
                  <input id="full_name" value={fullName} onChange={e => setFullName(e.target.value)} className="input-std font-bold" aria-required="true" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="dob" className="text-[10px] font-black uppercase text-slate-400">{"Tanggal Lahir"}</label>
                  <input id="dob" type="date" value={dob} onChange={e => setDob(e.target.value)} className="input-std font-bold" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="gender" className="text-[10px] font-black uppercase text-slate-400">{"Jenis Kelamin"}</label>
                  <select id="gender" value={gender} onChange={e => setGender(e.target.value)} className="input-std font-bold uppercase text-[10px]">
                    <option value="">{"Pilih Jenis Kelamin"}</option>
                    <option value="Laki-laki">{"Laki-laki"}</option>
                    <option value="Perempuan">{"Perempuan"}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-[10px] font-black uppercase text-slate-400">{"Nomor WhatsApp"}</label>
                  <input id="phone" value={phone} onChange={e => setPhone(e.target.value)} className="input-std font-bold" placeholder="Contoh: 0812345..." />
                </div>
                <div className="space-y-2">
                  <label htmlFor="city" className="text-[10px] font-black uppercase text-slate-400">{"Domisili Kota"}</label>
                  <input id="city" list="city-list" value={city} onChange={e => setCity(e.target.value)} className="input-std font-bold uppercase" />
                  <datalist id="city-list">{INDONESIA_CITIES.map(c => <option key={c} value={c} />)}</datalist>
                </div>
                <div className="space-y-2">
                  <label htmlFor="disability" className="text-[10px] font-black uppercase text-slate-400">{"Ragam Disabilitas"}</label>
                  <select id="disability" value={disabilityType} onChange={e => setDisabilityType(e.target.value)} className="input-std font-bold text-[10px]">
                    <option value="">{"Pilih Ragam"}</option>
                    {DISABILITY_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </section>

            {/* SEKSI II: AKADEMIK & HAMBATAN */}
            <section className="space-y-8 pt-8 border-t border-slate-100">
              <h3 className="font-black text-xs uppercase text-blue-600 italic border-b pb-4">{"Data Akademik & Beasiswa"}</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label htmlFor="edu_level" className="text-[10px] font-black uppercase text-slate-400">{"Pendidikan Terakhir"}</label>
                  <select id="edu_level" value={lastEducation} onChange={e => setLastEducation(e.target.value)} className="input-std font-bold text-[10px]">
                    {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="uni" className="text-[10px] font-black uppercase text-slate-400">
                    {lastEducation.includes("Sarjana") || lastEducation.includes("Diploma") ? "Nama Perguruan Tinggi" : "Nama Sekolah / Institusi"}
                  </label>
                  <input id="uni" list="uni-list" value={institutionName} onChange={e => setInstitutionName(e.target.value)} className="input-std font-bold uppercase" placeholder="Ketik nama institusi..." />
                  <datalist id="uni-list">{UNIVERSITIES.map(u => <option key={u} value={u} />)}</datalist>
                </div>
                <div className="space-y-2">
                  <label htmlFor="major" className="text-[10px] font-black uppercase text-slate-400">{"Program Studi / Jurusan"}</label>
                  <input id="major" value={major} onChange={e => setMajor(e.target.value)} className="input-std font-bold" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edu_model" className="text-[10px] font-black uppercase text-slate-400">{"Model Pendidikan"}</label>
                  <select id="edu_model" value={educationModel} onChange={e => setEducationModel(e.target.value)} className="input-std font-bold text-[10px]">
                    <option value="">{"Pilih Model"}</option>
                    {EDUCATION_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="scholar" className="text-[10px] font-black uppercase text-slate-400">{"Penerima Beasiswa"}</label>
                  <select id="scholar" value={scholarship} onChange={e => setScholarship(e.target.value)} className="input-std font-bold text-[10px]">
                    {SCHOLARSHIP_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </section>

            {/* SEKSI III: TEKNIS & AKSESIBILITAS */}
            <section className="space-y-8 pt-8 border-t border-slate-100">
              <h3 className="font-black text-xs uppercase text-blue-600 italic border-b pb-4">{"Sarana Teknis & Alat Bantu"}</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <label className="flex items-center gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
                  <input type="checkbox" checked={hasLaptop} onChange={e => setHasLaptop(e.target.checked)} className="w-6 h-6 rounded-lg" />
                  <span className="text-[10px] font-black uppercase">{"Memiliki Laptop"}</span>
                </label>
                <label className="flex items-center gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-colors">
                  <input type="checkbox" checked={hasSmartphone} onChange={e => setHasSmartphone(e.target.checked)} className="w-6 h-6 rounded-lg" />
                  <span className="text-[10px] font-black uppercase">{"Smartphone"}</span>
                </label>
                <label className="flex items-center gap-4 p-6 bg-blue-50 rounded-3xl border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors">
                  <input type="checkbox" checked={hasWifi} onChange={e => setHasWifi(e.target.checked)} className="w-6 h-6 rounded-lg" />
                  <span className="text-[10px] font-black uppercase text-blue-700">{"Wifi / Internet Rumah"}</span>
                </label>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-400">{"Alat Bantu yang Sering Digunakan"}</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {DISABILITY_TOOLS.map(t => (
                    <label key={t} className={`flex items-center gap-2 p-3 rounded-2xl border-2 transition-all cursor-pointer ${selectedTools.includes(t) ? 'border-blue-600 bg-blue-50' : 'border-slate-50 bg-white'}`}>
                      <input 
                        type="checkbox" 
                        checked={selectedTools.includes(t)} 
                        onChange={() => selectedTools.includes(t) ? setSelectedTools(selectedTools.filter(i => i !== t)) : setSelectedTools([...selectedTools, t])}
                        className="w-4 h-4"
                      />
                      <span className="text-[8px] font-bold uppercase text-slate-600 leading-tight">{t}</span>
                    </label>
                  ))}
                </div>
              </div>
            </section>

            {/* SEKSI IV: DOKUMEN & MEDIA */}
            <section className="space-y-8 pt-8 border-t border-slate-100">
              <h3 className="font-black text-xs uppercase text-blue-600 italic border-b pb-4">{"Dokumen Profesional & Video Intro"}</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label htmlFor="resume_url" className="text-[10px] font-black uppercase text-slate-400">{"Link Resume / CV (PDF di Drive)"}</label>
                  <input id="resume_url" value={resumeUrl} onChange={e => setResumeUrl(e.target.value)} className="input-std text-blue-600 font-bold" placeholder="https://drive.google.com/..." />
                </div>
                <div className="space-y-2">
                  <label htmlFor="doc_dis_url" className="text-[10px] font-black uppercase text-slate-400">{"Link Dokumen Disabilitas (Drive)"}</label>
                  <input id="doc_dis_url" value={docDisabilityUrl} onChange={e => setDocDisabilityUrl(e.target.value)} className="input-std text-blue-600 font-bold" placeholder="Contoh: Scan Kartu Disabilitas" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="port_url" className="text-[10px] font-black uppercase text-slate-400">{"Link Portofolio (Karya Terbaik)"}</label>
                  <input id="port_url" value={portfolioUrl} onChange={e => setPortfolioUrl(e.target.value)} className="input-std text-blue-600 font-bold" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="video_url" className="text-[10px] font-black uppercase text-slate-400">{"Tautan Video Perkenalan (YouTube)"}</label>
                  <input id="video_url" value={videoIntroUrl} onChange={e => setVideoIntroUrl(e.target.value)} className="input-std text-red-600 font-bold" placeholder="Contoh: https://youtube.com/watch?v=..." />
                </div>
              </div>
              
              {videoIntroUrl && videoIntroUrl.includes("v=") && (
                <div className="bg-slate-900 p-8 rounded-[3rem] shadow-2xl">
                  <p className="text-[10px] font-black text-blue-400 uppercase italic mb-6 tracking-widest text-center">{"Live Preview Video Intro"}</p>
                  <div className="max-w-2xl mx-auto aspect-video rounded-3xl overflow-hidden border-8 border-white/5">
                    <iframe 
                      width="100%" height="100%" 
                      src={`https://www.youtube.com/embed/${videoIntroUrl.split('v=')[1]?.split('&')[0]}`} 
                      frameBorder="0" allowFullScreen 
                    />
                  </div>
                </div>
              )}
            </section>

            {/* SEKSI CONSENT & SAVE */}
            <div className="p-10 bg-blue-600 rounded-[3rem] text-white space-y-6 shadow-2xl shadow-blue-200">
              <div className="flex gap-4 items-start">
                <input 
                  type="checkbox" 
                  id="consent" 
                  checked={consent} 
                  onChange={e => setConsent(e.target.checked)} 
                  className="w-8 h-8 rounded-xl cursor-pointer accent-white"
                />
                <label htmlFor="consent" className="text-xs font-bold leading-relaxed cursor-pointer">
                  {"Saya memberikan Informed Consent: Data yang saya berikan digunakan untuk tujuan pengembangan karir profesional di platform disabilitas.com dan setuju data tersebut dianalisis secara anonim demi kepentingan inklusivitas industri."}
                </label>
              </div>
              <button 
                onClick={handleProfileSave} 
                disabled={saving || !consent}
                className="w-full h-20 bg-white text-blue-600 rounded-[2.5rem] font-black uppercase tracking-widest text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-2xl flex items-center justify-center gap-4 disabled:opacity-50"
              >
                {saving ? "MENYIMPAN DATA..." : <><Save size={24}/> {"Perbarui Seluruh Profil Talent"}</>}
              </button>
            </div>

          </div>
        ) : (
          /* ======================================================================== */
          /* DISPLAY MODE: INCLUSION CARD & DASHBOARD STATS                          */
          /* ======================================================================== */
          <div className="grid lg:grid-cols-3 gap-10">
            
            {/* KIRI: INCLUSION CARD */}
            <div className="lg:col-span-1 space-y-6">
              <div 
                id="cv-template"
                ref={cardRef} 
                className="bg-white p-8 rounded-[3.5rem] border-2 border-slate-100 shadow-2xl relative overflow-hidden"
              >
                <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-6">
                  <img src="/logo.png" alt="Logo" className="h-6" />
                  <div className="text-right">
                    <p className="text-[7px] font-black uppercase text-blue-600">{"Inclusion Identity"}</p>
                    <p className="text-[6px] font-bold text-slate-400">{"Verified by disabilitas.com"}</p>
                  </div>
                </div>

                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-24 h-24 bg-slate-900 rounded-[2.5rem] flex items-center justify-center text-blue-400 text-3xl font-black italic shadow-inner border-4 border-slate-800">
                    {fullName ? fullName.charAt(0) : "T"}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none uppercase">{fullName || "Talenta"}</h2>
                    <p className="text-[9px] font-black uppercase text-blue-600 italic mt-2 tracking-widest">{disabilityType || "Ragam Disabilitas"}</p>
                  </div>
                </div>

                <div className="mt-8 space-y-3 border-t border-slate-50 pt-6">
                  <div className="flex items-center gap-3 text-slate-600">
                    <MapPin size={14} className="text-red-500" />
                    <span className="text-[8px] font-bold uppercase tracking-wider">{city || "Lokasi belum diatur"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Briefcase size={14} className="text-blue-500" />
                    <span className="text-[8px] font-bold uppercase tracking-wider">{careerStatus || "Status Pekerjaan"}</span>
                  </div>
                </div>

                <div className="mt-10 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
                  <QRCodeSVG value={`${typeof window !== 'undefined' ? window.location.origin : ''}/talent/${authUser?.id}`} size={70} />
                  <p className="text-[7px] font-black uppercase text-slate-400 mt-4 tracking-widest italic">{"Verify Digital Profile"}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button onClick={exportPDF} className="w-full bg-slate-900 text-white p-5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-blue-600 transition-all shadow-xl active:scale-95">
                  <FileDown size={16} /> {"Download PDF CV"}
                </button>
                <button onClick={shareProfile} className="w-full bg-blue-600 text-white p-5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2 hover:bg-slate-900 transition-all shadow-xl active:scale-95">
                  <Linkedin size={16} /> {"Share ke LinkedIn"}
                </button>
              </div>
            </div>

            {/* KANAN: JOB MATCHING ENGINE */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-slate-900 p-12 rounded-[3.5rem] text-white relative overflow-hidden shadow-2xl border-4 border-slate-800">
                <div className="relative z-10">
                  <h3 className="text-3xl font-black tracking-tighter uppercase italic leading-none">{"Smart Job"} <span className="text-blue-400">{"Matching"}</span></h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-6 bg-white/5 w-fit px-4 py-2 rounded-full">{"Analisis kecocokan berbasis keahlian & ragam disabilitas"}</p>
                  
                  <div className="mt-12 grid md:grid-cols-2 gap-8">
                    <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-all group cursor-pointer">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-600 rounded-2xl shadow-lg">
                           <Briefcase size={20} />
                        </div>
                        <span className="bg-green-500 text-[8px] font-black px-4 py-1.5 rounded-full text-white shadow-xl shadow-green-500/20">{"95% MATCH"}</span>
                      </div>
                      <h4 className="text-base font-black uppercase tracking-tight">{"Administrasi Perkantoran"}</h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-2">{"Sektor Pemerintahan / BUMN"}</p>
                    </div>

                    <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 hover:bg-white/10 transition-all group cursor-pointer">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg">
                           <Briefcase size={20} />
                        </div>
                        <span className="bg-yellow-500 text-[8px] font-black px-4 py-1.5 rounded-full text-white shadow-xl shadow-yellow-500/20">{"82% MATCH"}</span>
                      </div>
                      <h4 className="text-base font-black uppercase tracking-tight">{"Analisis Data Junior"}</h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-2">{"Sektor Teknologi (Startup)"}</p>
                    </div>
                  </div>
                </div>
                <div className="absolute top-[-20%] right-[-10%] w-80 h-80 bg-blue-600/10 blur-[120px] rounded-full animate-pulse"></div>
              </div>

              {/* STATS SUMMARY */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "Total Skill", val: selectedSkills.length, icon: <CheckCircle2 size={12}/> },
                  { label: "Alat Bantu", val: selectedTools.length, icon: <Laptop size={12}/> },
                  { label: "Akomodasi", val: selectedAccommodations.length, icon: <Smartphone size={12}/> },
                  { label: "Internet", val: hasWifi ? "Wifi" : "Lancar", icon: <Wifi size={12}/> }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-6 rounded-[2.5rem] border border-slate-100 text-center shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-center mb-2 text-blue-400 opacity-50">{stat.icon}</div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    <p className="text-2xl font-black text-slate-900 mt-2">{stat.val}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
      
      {/* GLOBAL STYLE UNTUK INPUT */}
      <style jsx global>{`
        .input-std {
          @apply w-full bg-[#F1F5F9] border-2 border-transparent rounded-[1.5rem] p-4 text-xs outline-none transition-all focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 placeholder:text-slate-400;
        }
      `}</style>
    </div>
  );
}
