"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { 
  User, Mail, MapPin, Briefcase, GraduationCap, Link as LinkIcon, 
  FileText, Youtube, Save, Share2, Download, CheckCircle2, 
  AlertCircle, Search, Laptop, Smartphone, Wifi, ArrowUpRight, Plus, X 
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
  user, 
  autoOpenProfile = false 
}: { 
  user: any; 
  autoOpenProfile?: boolean 
}) {
  const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  // FORM STATES (Sinkron dengan Database Schema)
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
  
  // MULTI-SELECT STATES
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedBarriers, setSelectedBarriers] = useState<string[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [selectedAccommodations, setSelectedAccommodations] = useState<string[]>([]);
  const [workPref, setWorkPref] = useState("");
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  async function fetchInitialData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
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
    }
    setLoading(false);
  }

  // VALIDASI GOOGLE DRIVE LINK
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
      setMsg("⚠️ Pastikan Link Google Drive Anda berstatus 'Anyone with link'.");
      return;
    }

    setSaving(true);
    const updates = {
      id: user.id,
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
      setMsg("❌ Gagal menyimpan data.");
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
      pdf.save(`CV_Inklusif_${fullName.replace(" ", "_")}.pdf`);
    }
  };

  const shareProfile = () => {
    const text = `Halo! Saya ${fullName}, talenta disabilitas dengan ragam ${disabilityType}. Cek profil profesional saya di disabilitas.com untuk kolaborasi bisnis! #DisabilitasBekerja #Inklusi`;
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${encodeURIComponent(text)}`, "_blank");
  };

  if (loading) return <div className="p-20 text-center font-black italic">{"Memuat Dashboard Talenta..."}</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans selection:bg-blue-100">
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* HEADER DASHBOARD */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 uppercase">
              {"Talent"} <span className="text-blue-600 italic">{"Dashboard"}</span>
            </h1>
            <p className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-2">
              {"Pusat Manajemen Karir & Data Riset Inklusi"}
            </p>
          </div>
          <div className="flex gap-3">
            {!isEditing ? (
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all flex items-center gap-2 shadow-xl shadow-slate-200"
              >
                <User size={14} /> {"Edit Profil Lengkap"}
              </button>
            ) : (
              <button 
                onClick={() => setIsEditing(false)}
                className="bg-white text-red-600 border-2 border-red-100 px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-50 transition-all shadow-xl shadow-red-50"
              >
                {"Batal"}
              </button>
            )}
          </div>
        </header>

        {msg && (
          <div className="animate-bounce bg-blue-600 text-white p-4 rounded-2xl text-center font-black uppercase text-[10px] tracking-widest italic">
            {msg}
          </div>
        )}

        {isEditing ? (
          /* FORM EDITING MODE - FULL FIELDS */
          <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-2xl space-y-12">
            
            {/* SEKSI 1: IDENTITAS DASAR */}
            <section className="space-y-8">
              <h3 className="font-black text-xs uppercase text-blue-600 italic border-b pb-4">{"I. Identitas & Kontak"}</h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="space-y-2">
                  <label htmlFor="full_name" className="text-[10px] font-black uppercase text-slate-400">{"Nama Lengkap"}</label>
                  <input id="full_name" value={fullName} onChange={e => setFullName(e.target.value)} className="input-std font-bold" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="dob" className="text-[10px] font-black uppercase text-slate-400">{"Tanggal Lahir"}</label>
                  <input id="dob" type="date" value={dob} onChange={e => setDob(e.target.value)} className="input-std font-bold" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="gender" className="text-[10px] font-black uppercase text-slate-400">{"Jenis Kelamin"}</label>
                  <select id="gender" value={gender} onChange={e => setGender(e.target.value)} className="input-std font-bold uppercase text-[10px]">
                    <option value="">{"Pilih"}</option>
                    <option value="Laki-laki">{"Laki-laki"}</option>
                    <option value="Perempuan">{"Perempuan"}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-[10px] font-black uppercase text-slate-400">{"WhatsApp (Aktif)"}</label>
                  <input id="phone" value={phone} onChange={e => setPhone(e.target.value)} className="input-std font-bold" placeholder="08..." />
                </div>
                <div className="space-y-2">
                  <label htmlFor="city" className="text-[10px] font-black uppercase text-slate-400">{"Domisili Kota"}</label>
                  <input id="city" list="city-list" value={city} onChange={e => setCity(e.target.value)} className="input-std font-bold uppercase" />
                  <datalist id="city-list">{INDONESIA_CITIES.map(c => <option key={c} value={c} />)}</datalist>
                </div>
                <div className="space-y-2">
                  <label htmlFor="disability" className="text-[10px] font-black uppercase text-slate-400">{"Ragam Disabilitas"}</label>
                  <select id="disability" value={disabilityType} onChange={e => setDisabilityType(e.target.value)} className="input-std font-bold text-[10px]">
                    {DISABILITY_TYPES.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
            </section>

            {/* SEKSI 2: PENDIDIKAN & AKADEMIK */}
            <section className="space-y-8 pt-8 border-t border-slate-100">
              <h3 className="font-black text-xs uppercase text-blue-600 italic border-b pb-4">{"II. Pendidikan & Hambatan"}</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label htmlFor="edu_level" className="text-[10px] font-black uppercase text-slate-400">{"Pendidikan Terakhir"}</label>
                  <select id="edu_level" value={lastEducation} onChange={e => setLastEducation(e.target.value)} className="input-std font-bold text-[10px]">
                    {EDUCATION_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="uni" className="text-[10px] font-black uppercase text-slate-400">
                    {lastEducation.includes("Sarjana") || lastEducation.includes("Diploma") ? "Nama Kampus" : "Nama Sekolah / Institusi"}
                  </label>
                  <input id="uni" list="uni-list" value={institutionName} onChange={e => setInstitutionName(e.target.value)} className="input-std font-bold uppercase" placeholder="Ketik nama institusi..." />
                  <datalist id="uni-list">{UNIVERSITIES.map(u => <option key={u} value={u} />)}</datalist>
                </div>
                <div className="space-y-2">
                  <label htmlFor="major" className="text-[10px] font-black uppercase text-slate-400">{"Program Studi / Jurusan"}</label>
                  <input id="major" value={major} onChange={e => setMajor(e.target.value)} className="input-std font-bold" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="scholar" className="text-[10px] font-black uppercase text-slate-400">{"Status Beasiswa"}</label>
                  <select id="scholar" value={scholarship} onChange={e => setScholarship(e.target.value)} className="input-std font-bold text-[10px]">
                    {SCHOLARSHIP_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-400">{"Hambatan Selama Pendidikan"}</label>
                <div className="flex flex-wrap gap-2">
                  {EDUCATION_BARRIERS.map(b => (
                    <button 
                      key={b} 
                      onClick={() => selectedBarriers.includes(b) ? setSelectedBarriers(selectedBarriers.filter(i => i !== b)) : setSelectedBarriers([...selectedBarriers, b])}
                      className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase transition-all ${selectedBarriers.includes(b) ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* SEKSI 3: KOMPUTASI & AKSESIBILITAS */}
            <section className="space-y-8 pt-8 border-t border-slate-100">
              <h3 className="font-black text-xs uppercase text-blue-600 italic border-b pb-4">{"III. Teknis & Akomodasi"}</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <label className="flex items-center gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer">
                  <input type="checkbox" checked={hasLaptop} onChange={e => setHasLaptop(e.target.checked)} className="w-6 h-6" />
                  <span className="text-[10px] font-black uppercase">{"Ada Laptop"}</span>
                </label>
                <label className="flex items-center gap-4 p-6 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer">
                  <input type="checkbox" checked={hasSmartphone} onChange={e => setHasSmartphone(e.target.checked)} className="w-6 h-6" />
                  <span className="text-[10px] font-black uppercase">{"Ada Smartphone"}</span>
                </label>
                <label className="flex items-center gap-4 p-6 bg-blue-50 rounded-2xl border border-blue-100 cursor-pointer">
                  <input type="checkbox" checked={hasWifi} onChange={e => setHasWifi(e.target.checked)} className="w-6 h-6" />
                  <span className="text-[10px] font-black uppercase text-blue-700">{"Ada Wifi di Rumah"}</span>
                </label>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase text-slate-400">{"Alat Bantu / Teknologi Asistif"}</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {DISABILITY_TOOLS.map(t => (
                    <label key={t} className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all cursor-pointer ${selectedTools.includes(t) ? 'border-blue-600 bg-blue-50' : 'border-slate-100 bg-white'}`}>
                      <input 
                        type="checkbox" 
                        checked={selectedTools.includes(t)} 
                        onChange={() => selectedTools.includes(t) ? setSelectedTools(selectedTools.filter(i => i !== t)) : setSelectedTools([...selectedTools, t])}
                        className="w-4 h-4"
                      />
                      <span className="text-[9px] font-bold uppercase text-slate-600">{t}</span>
                    </label>
                  ))}
                </div>
              </div>
            </section>

            {/* SEKSI 4: DOKUMEN & VIDEO INTRO */}
            <section className="space-y-8 pt-8 border-t border-slate-100">
              <h3 className="font-black text-xs uppercase text-blue-600 italic border-b pb-4">{"IV. Portofolio & Video Intro"}</h3>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label htmlFor="resume_url" className="text-[10px] font-black uppercase text-slate-400">{"Link Resume (Google Drive PDF)"}</label>
                  <input id="resume_url" value={resumeUrl} onChange={e => setResumeUrl(e.target.value)} className="input-std text-blue-600 font-bold" placeholder="Pastikan akses: Anyone with link" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="doc_dis_url" className="text-[10px] font-black uppercase text-slate-400">{"Link Dokumen Disabilitas (G-Drive)"}</label>
                  <input id="doc_dis_url" value={docDisabilityUrl} onChange={e => setDocDisabilityUrl(e.target.value)} className="input-std text-blue-600 font-bold" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="port_url" className="text-[10px] font-black uppercase text-slate-400">{"Link Portofolio / Website"}</label>
                  <input id="port_url" value={portfolioUrl} onChange={e => setPortfolioUrl(e.target.value)} className="input-std text-blue-600 font-bold" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="video_url" className="text-[10px] font-black uppercase text-slate-400">{"Link YouTube Video Intro"}</label>
                  <input id="video_url" value={videoIntroUrl} onChange={e => setVideoIntroUrl(e.target.value)} className="input-std text-red-600 font-bold" placeholder="https://youtube.com/watch?v=..." />
                </div>
              </div>

              {/* VIDEO PREVIEW */}
              {videoIntroUrl && videoIntroUrl.includes("v=") && (
                <div className="bg-slate-900 p-6 rounded-[2.5rem] space-y-4">
                  <p className="text-[10px] font-black text-white uppercase italic">{"Preview Video Intro Anda:"}</p>
                  <div className="aspect-video rounded-2xl overflow-hidden border-4 border-white/10">
                    <iframe 
                      width="100%" height="100%" 
                      src={`https://www.youtube.com/embed/${videoIntroUrl.split('v=')[1]?.split('&')[0]}`} 
                      frameBorder="0" allowFullScreen 
                    />
                  </div>
                </div>
              )}
            </section>

            {/* PERSETUJUAN & SAVE */}
            <div className="p-10 bg-blue-600 rounded-[3rem] text-white space-y-6">
              <div className="flex gap-4 items-start">
                <input 
                  type="checkbox" 
                  id="consent" 
                  checked={consent} 
                  onChange={e => setConsent(e.target.checked)} 
                  className="w-8 h-8 rounded-lg cursor-pointer"
                />
                <label htmlFor="consent" className="text-xs font-bold leading-relaxed">
                  {"Saya menyetujui Informed Consent: Data ini digunakan untuk tujuan bisnis rekrutmen dan riset inklusi di disabilitas.com secara aman."}
                </label>
              </div>
              <button 
                onClick={handleProfileSave} 
                disabled={saving || !consent}
                className="w-full h-20 bg-white text-blue-600 rounded-[2rem] font-black uppercase tracking-widest text-sm hover:scale-[1.02] transition-all shadow-2xl flex items-center justify-center gap-4"
              >
                {saving ? "Menyimpan Data..." : <><Save size={24}/> {"Perbarui Profil Talent Sekarang"}</>}
              </button>
            </div>

          </div>
        ) : (
          /* DISPLAY MODE: INCLUSION CARD & DASHBOARD */
          <div className="grid lg:grid-cols-3 gap-10">
            
            {/* KIRI: INCLUSION CARD (IDENTITY) */}
            <div className="lg:col-span-1 space-y-6">
              <div 
                id="cv-template"
                ref={cardRef} 
                className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-2xl relative overflow-hidden"
              >
                {/* KOP & LOGO */}
                <div className="flex justify-between items-center mb-8 border-b pb-6">
                  <img src="/logo.png" alt="Logo" className="h-8" />
                  <div className="text-right">
                    <p className="text-[8px] font-black uppercase text-blue-600">{"Digital Inclusion Identity"}</p>
                    <p className="text-[7px] font-bold text-slate-400">{"Verified by disabilitas.com"}</p>
                  </div>
                </div>

                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center text-white text-3xl font-black">
                    {fullName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">{fullName}</h2>
                    <p className="text-[10px] font-black uppercase text-blue-600 italic">{disabilityType}</p>
                  </div>
                </div>

                <div className="mt-8 space-y-4 border-t border-slate-50 pt-6">
                  <div className="flex items-center gap-3 text-slate-600">
                    <MapPin size={14} className="text-blue-500" />
                    <span className="text-[9px] font-bold uppercase">{city || "Lokasi belum diatur"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-600">
                    <Briefcase size={14} className="text-blue-500" />
                    <span className="text-[9px] font-bold uppercase">{careerStatus || "Status belum diatur"}</span>
                  </div>
                </div>

                {/* QR CODE - MENGARAH KE PROFIL PUBLIK */}
                <div className="mt-10 flex flex-col items-center justify-center p-6 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                  <QRCodeSVG value={`https://disabilitas.com/talent/${user?.id}`} size={80} />
                  <p className="text-[8px] font-black uppercase text-slate-400 mt-4 italic">{"Scan to View Public Profile"}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button onClick={exportPDF} className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-2">
                  <Download size={16} /> {"Download PDF CV"}
                </button>
                <button onClick={shareProfile} className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-2">
                  <Share2 size={16} /> {"Share to Social Media"}
                </button>
              </div>
            </div>

            {/* KANAN: JOB MATCHING & STATS */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-slate-900 p-10 rounded-[3rem] text-white relative overflow-hidden">
                <div className="relative z-10">
                  <h3 className="text-2xl font-black tracking-tighter uppercase italic">{"Smart Job Matching"}</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2">{"Rekomendasi lowongan berdasarkan keahlian Anda"}</p>
                  
                  <div className="mt-10 grid md:grid-cols-2 gap-6">
                    {/* CONTOH MATCHING ITEM */}
                    <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-all cursor-pointer group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-600 rounded-xl">
                           <Briefcase size={18} />
                        </div>
                        <span className="bg-green-500 text-[8px] font-black px-3 py-1 rounded-full">{"95% MATCH"}</span>
                      </div>
                      <h4 className="text-sm font-black uppercase">{"Data Entry Specialist"}</h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">{"Kementerian Keuangan"}</p>
                    </div>

                    <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 hover:bg-white/10 transition-all cursor-pointer group">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-600 rounded-xl">
                           <Briefcase size={18} />
                        </div>
                        <span className="bg-yellow-500 text-[8px] font-black px-3 py-1 rounded-full">{"80% MATCH"}</span>
                      </div>
                      <h4 className="text-sm font-black uppercase">{"Content Writer"}</h4>
                      <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">{"Binar Academy"}</p>
                    </div>
                  </div>
                </div>
                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full"></div>
              </div>

              {/* STATS PENDUKUNG */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 text-center">
                  <p className="text-[8px] font-black text-slate-400 uppercase">{"Skill Anda"}</p>
                  <p className="text-xl font-black text-blue-600">{selectedSkills.length}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 text-center">
                  <p className="text-[8px] font-black text-slate-400 uppercase">{"Alat Bantu"}</p>
                  <p className="text-xl font-black text-blue-600">{selectedTools.length}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 text-center">
                  <p className="text-[8px] font-black text-slate-400 uppercase">{"Akomodasi"}</p>
                  <p className="text-xl font-black text-blue-600">{selectedAccommodations.length}</p>
                </div>
                <div className="bg-white p-6 rounded-3xl border border-slate-100 text-center">
                  <p className="text-[8px] font-black text-slate-400 uppercase">{"WiFi Rumah"}</p>
                  <p className="text-xl font-black text-blue-600">{hasWifi ? "ADA" : "TIDAK"}</p>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
      
      {/* GLOBAL CSS FOR INPUTS */}
      <style jsx global>{`
        .input-std {
          @apply w-full bg-[#F1F5F9] border-2 border-transparent rounded-2xl p-4 text-xs outline-none transition-all focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100;
        }
      `}</style>
    </div>
  );
}
