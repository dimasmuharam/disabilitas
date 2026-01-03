"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  User, MapPin, Briefcase, GraduationCap, 
  FileDown, BookOpen, Laptop, Wifi, 
  AlertCircle, CheckCircle2, Linkedin, Search,
  ChevronLeft, LayoutDashboard, Share2, ExternalLink
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Import Modul Anak
import IdentityLegal from "./talent/identity-legal";
import TechAccess from "./talent/tech-access";
import CareerExperience from "./talent/career-experience";
import AcademicBarriers from "./talent/academic-barriers";
import SkillsCertifications from "./talent/skills-certifications";

interface TalentDashboardProps {
  user: any;
  profile: any;
  autoOpenProfile?: boolean;
}

export default function TalentDashboard({ user, profile: initialProfile }: TalentDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ jobs: 0, trainings: 0 });
  const [progress, setProgress] = useState(0);
const [missingFields, setMissingFields] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("overview"); 
  const [profile, setProfile] = useState(initialProfile);

  useEffect(() => {
    if (user?.id) {
      fetchLatestData();
    }
  }, [user?.id]);

  async function fetchLatestData() {
    try {
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (prof) {
        setProfile(prof);
        calculateProgress(prof);
      }

      const { count: jobCount } = await supabase.from("applications").select("*", { count: 'exact', head: true }).eq("profile_id", user.id);
      const { count: trainingCount } = await supabase.from("trainees").select("*", { count: 'exact', head: true }).eq("profile_id", user.id);

      setStats({ jobs: jobCount || 0, trainings: trainingCount || 0 });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleModuleSuccess = () => {
    fetchLatestData(); 
    setActiveTab("overview"); 
    window.scrollTo({ top: 0, behavior: "smooth" });
function calculateProgress(profData: any) {
    // Mapping dengan pengelompokan Modul untuk navigasi kognitif yang lebih baik
    const checklist = [
      // 1. MODUL IDENTITAS
      { value: profData?.full_name, label: "Nama Lengkap", module: "Identitas" },
      { value: profData?.date_of_birth, label: "Tanggal Lahir", module: "Identitas" },
      { value: profData?.phone, label: "Nomor Telepon", module: "Identitas" },
      { value: profData?.gender, label: "Jenis Kelamin", module: "Identitas" },
      { value: profData?.city, label: "Kota Domisili", module: "Identitas" },
      { value: profData?.disability_type, label: "Ragam Disabilitas", module: "Identitas" },
      { value: profData?.document_disability_url, label: "Unggahan Dokumen Disabilitas", module: "Identitas" },
      { value: profData?.communication_preference, label: "Preferensi Komunikasi", module: "Identitas" },
      { value: profData?.has_informed_consent, label: "Persetujuan Data (Informed Consent)", module: "Identitas" },

      // 2. MODUL SARANA
      { value: profData?.internet_quality, label: "Akses Internet di Rumah", module: "Sarana" },
      { value: profData?.used_assistive_tools?.length > 0 ? "filled" : null, label: "Alat Bantu Yang Digunakan Bekerja dan Sehari-hari", module: "Sarana" },
      { value: profData?.preferred_accommodations?.length > 0 ? "filled" : null, label: "Akomodasi Yang Diinginkan", module: "Sarana" },

      // 3. MODUL KARIR
      { value: profData?.career_status, label: "Status Karir Saat Ini", module: "Karir" },
      { value: profData?.work_preference, label: "Preferensi Lingkungan Kerja", module: "Karir" },
      { value: profData?.expected_salary, label: "Ekspektasi Gaji", module: "Karir" },
      { value: profData?.linkedin_url, label: "Tautan LinkedIn", module: "Karir" },
      { value: profData?.resume_url, label: "Unggahan CV/Resume", module: "Karir" },

      // 4. MODUL AKADEMIK
      { value: profData?.education_level, label: "Jenjang Pendidikan", module: "Akademik" },
      { value: profData?.university, label: "Nama Kampus/Sekolah", module: "Akademik" },
      { value: profData?.major, label: "Program Studi/Jurusan", module: "Akademik" },
      { value: profData?.graduation_date, label: "Tahun Kelulusan", module: "Akademik" },
      { value: profData?.education_model, label: "Model Pendidikan", module: "Akademik" },
      { value: profData?.scholarship_type, label: "Tipe pembiayaan pendidikan", module: "Akademik" },
      { value: profData?.education_barrier?.length > 0 ? "filled" : null, label: "Hambatan Pendidikan", module: "Akademik" },
      { value: profData?.academic_support_received?.length > 0 ? "filled" : null, label: "Dukungan Akademik", module: "Akademik" },
      { value: profData?.academic_assistive_tools?.length > 0 ? "filled" : null, label: "Alat Bantu Belajar", module: "Akademik" },
      { value: profData?.study_relevance, label: "Linearitas Pendidikan", module: "Akademik" },

      // 5. MODUL SKILL 
      { value: profData?.skills?.length > 0 ? "filled" : null, label: "Daftar Keahlian Utama", module: "Skill" },
      { value: profData?.skill_acquisition_method, label: "Metode Perolehan Skill", module: "Skill" },
      { value: profData?.training_accessibility_rating, label: "Rating Aksesibilitas Pelatihan", module: "Skill" }
    ];

    // Kita simpan string yang sudah mengandung nama modul: "Modul: Field"
    const missing = checklist
      .filter(item => item.value === null || item.value === undefined || item.value === "" || item.value === false)
      .map(item => `${item.module}: ${item.label}`);

    setMissingFields(missing);
    
    const total = checklist.length;
    const filledCount = total - missing.length;
    setProgress(Math.round((filledCount / total) * 100));
  }  };
  // FITUR: GENERATE BIO OTOMATIS JIKA KOSONG (UNTUK CV & DASHBOARD)
  const getDisplayBio = () => {
    if (profile?.bio) return profile.bio;
    
    const name = profile?.full_name || "Talenta Inklusif";
    const disability = profile?.disability_type ? `dengan ragam ${profile.disability_type}` : "";
    const city = profile?.city ? `berdomisili di ${profile.city}` : "";
    const edu = profile?.education_level ? `Lulusan ${profile.education_level}` : "";
    
    return `Saya adalah ${name} ${disability}, ${city}. ${edu}. Saya berkomitmen untuk berkontribusi secara profesional di lingkungan kerja yang inklusif.`;
  };

  const exportPDF = async () => {
    const element = document.getElementById("cv-content");
    if (!element) return;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`CV_${profile?.full_name?.replace(/\s+/g, '_')}.pdf`);
  };

  const handleShare = (platform: string) => {
    const url = `https://disabilitas.com/talent/${user.id}`;
    const viralCaption = `Halo Rekan HRD! Saya ${profile?.full_name || 'Talenta Inklusif'}. Cek profil profesional saya di: ${url}`;
    switch (platform) {
      case 'wa': window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(viralCaption)}`, '_blank'); break;
      case 'li': window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank'); break;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "identity": return <IdentityLegal user={user} profile={profile} onSuccess={handleModuleSuccess} />;
      case "tech": return <TechAccess user={user} profile={profile} onSuccess={handleModuleSuccess} />;
      case "career": return <CareerExperience user={user} profile={profile} onSuccess={handleModuleSuccess} />;
      case "academic": return <AcademicBarriers user={user} profile={profile} onSuccess={handleModuleSuccess} />;
      case "skills": return <SkillsCertifications user={user} profile={profile} onSuccess={handleModuleSuccess} />;
      default: return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* HEADER PROFILE CARD */}
          <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm relative">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black italic shadow-lg shadow-blue-200">
                {profile?.full_name?.charAt(0) || "T"}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{profile?.full_name || "Nama Belum Diisi"}</h1>
                  {progress === 100 && <CheckCircle2 className="text-emerald-500" size={24} />}
                </div>
                <p className="text-sm font-bold text-blue-600 uppercase tracking-[0.2em]">{profile?.disability_type || "Ragam Disabilitas Belum Diisi"}</p>
                <div className="flex flex-wrap gap-6 pt-4 text-[10px] font-black uppercase text-slate-400">
                  <span className="flex items-center gap-2"><MapPin size={14} className="text-slate-900"/> {profile?.city || "Lokasi N/A"}</span>
                  <span className="flex items-center gap-2"><Briefcase size={14} className="text-slate-900"/> {profile?.career_status || "Status N/A"}</span>
                  <span className="flex items-center gap-2"><GraduationCap size={14} className="text-slate-900"/> {profile?.education_level || "Pendidikan N/A"}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-10 p-8 bg-slate-50 rounded-[2rem] border border-slate-100 italic text-sm text-slate-600 leading-relaxed text-justify">
              {"\""}{getDisplayBio()}{"\""}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
                  <QRCodeSVG value={`https://disabilitas.com/talent/${user.id}`} size={40} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-900">{"Public Profile ID"}</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{"Scan untuk membagikan portofolio"}</p>
                </div>
              </div>
            </div>
          </section>

          {/* SMART MATCH SECTION */}
          <div className="grid md:grid-cols-2 gap-8 mt-4">
            <div className="space-y-6">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 flex items-center gap-3">{"Smart Job"} <span className="text-blue-600">{"Match"}</span></h3>
              <div className="bg-white border-2 border-slate-100 rounded-[3rem] p-10 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-600"><Search size={32} /></div>
                <p className="text-xs font-bold text-slate-400 uppercase">{"Belum ada rekomendasi lowongan yang cocok."}</p>
              </div>
            </div>
            <div className="space-y-6">
              <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 flex items-center gap-3">{"Training"} <span className="text-emerald-600">{"Match"}</span></h3>
              <div className="bg-white border-2 border-slate-100 rounded-[3rem] p-10 text-center space-y-4 shadow-sm">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600"><BookOpen size={32} /></div>
                <p className="text-xs font-bold text-slate-400 uppercase">{"Cek rekomendasi pelatihan untuk upgrade skill."}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  if (loading) return <div className="p-20 text-center font-black italic tracking-widest text-slate-400">{"SINKRONISASI DATA..."}</div>;

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20 font-sans">
      <div className="max-w-6xl mx-auto space-y-8 pt-8 px-4">
        
        {/* PROGRESS BOX & NARASI DINAMIS */}
        <section className="bg-white border-2 border-slate-900 p-8 rounded-[3rem] shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">
                {progress === 100 ? "Profil Anda Sudah Sempurna!" : "Kelengkapan Profil Talenta"}
              </h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {progress === 100 
                  ? "Data Anda siap dipromosikan ke mitra perusahaan inklusif." 
                  : "Lengkapi data di bawah untuk meningkatkan akurasi Smart Job and training Match."}
              </p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
<div 
  className="flex-1 md:w-64 bg-slate-100 h-4 rounded-full overflow-hidden border border-slate-200"
  role="progressbar"
  aria-valuenow={progress}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label={`{"Tingkat keterisian profil talenta Anda saat ini adalah ${progress} persen"}`}
>
  <div 
    className={`h-full transition-all duration-1000 ${progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`} 
    style={{ width: `${progress}%` }}
  ></div>
</div>
              <span className="font-black italic text-2xl text-slate-900">{`${progress}%`}</span>
            </div>
          </div>
        {/* --- TEMPELKAN KODE DAFTAR MISSING FIELDS DI SINI --- */}
        {progress < 100 && missingFields.length > 0 && (
          <div className="mt-8 p-6 bg-amber-50 rounded-2xl border border-amber-100" role="complementary">
            <h3 className="text-[10px] font-black uppercase text-amber-700 tracking-widest mb-4 flex items-center gap-2">
              <AlertCircle size={14} /> {"Data Yang Perlu Dilengkapi:"}
            </h3>
            <ul className="grid md:grid-cols-2 gap-x-8 gap-y-2 list-disc list-inside">
              {missingFields.map((field, idx) => (
<li key={idx} className="text-[10px] font-bold text-slate-500 uppercase tracking-tight list-none border-b border-amber-100/50 pb-1">
  <span className="text-amber-700 font-black">{field.split(': ')[0]}:</span> {field.split(': ')[1]}
</li>
              ))}
            </ul>
          </div>
        )}

          {/* TOMBOL MODUL PINDAH KE SINI (DI BAWAH JUDUL/PROGRESS) */}
          {activeTab === "overview" && (
            <nav className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8 border-t border-slate-100 pt-8">
              {[
                { label: "Identitas", id: "identity", icon: User, done: !!profile?.full_name },
                { label: "Sarana", id: "tech", icon: Laptop, done: !!profile?.has_laptop },
                { label: "Karir", id: "career", icon: Briefcase, done: !!profile?.career_status },
                { label: "Akademik", id: "academic", icon: GraduationCap, done: !!profile?.education_level },
                { label: "Skill", id: "skills", icon: BookOpen, done: !!(profile?.skills?.length > 0) }
              ].map((m, i) => (
                <button key={i} onClick={() => setActiveTab(m.id)} className="bg-slate-50 border-2 border-transparent p-4 rounded-2xl hover:border-blue-600 hover:bg-white transition-all group text-center shadow-sm">
                  <m.icon className="mx-auto mb-2 text-slate-400 group-hover:text-blue-600 transition-colors" size={20} />
                  <p className="text-[9px] font-black uppercase text-slate-900 tracking-tighter">{m.label}</p>
                  {m.done && <CheckCircle2 size={10} className="text-emerald-500 mx-auto mt-1" />}
                </button>
              ))}
            </nav>
          )}

          {activeTab !== "overview" && (
            <button onClick={() => setActiveTab("overview")} className="mt-6 flex items-center gap-2 text-xs font-black uppercase text-blue-600 hover:text-slate-900 transition-all group">
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform"/> {"Kembali ke Overview"}
            </button>
          )}
        </section>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {renderContent()}
          </div>

          <aside className="space-y-6">
            {/* PROFILE TOOLS */}
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-6 shadow-2xl">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-400">{"Aksi Talenta"}</h3>
              <div className="space-y-3">
                <a href={`https://disabilitas.com/talent/${user.id}`} target="_blank" rel="noopener noreferrer" className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-3 hover:bg-white hover:text-slate-900 transition-all">
                  <ExternalLink size={18} /> {"Lihat Profil Publik"}
                </a>
                <button onClick={exportPDF} className="w-full bg-white text-slate-900 p-4 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-3 hover:bg-blue-600 hover:text-white transition-all shadow-lg">
                  <FileDown size={18} /> {"Cetak CV (PDF)"}
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => handleShare('wa')} className="bg-emerald-600 p-3 rounded-xl font-black uppercase text-[8px] hover:bg-emerald-700 transition-all flex items-center justify-center">{"WhatsApp"}</button>
                  <button onClick={() => handleShare('li')} className="bg-blue-700 p-3 rounded-xl font-black uppercase text-[8px] hover:bg-blue-800 transition-all flex items-center justify-center">{"LinkedIn"}</button>
                </div>
              </div>
            </div>

            {/* STATISTIK AKTIVITAS */}
            <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{"Aktivitas Saya"}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-2xl font-black italic text-slate-900">{stats.jobs}</p>
                    <p className="text-[8px] font-black uppercase text-slate-400">{"Lamaran"}</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-2xl font-black italic text-slate-900">{stats.trainings}</p>
                    <p className="text-[8px] font-black uppercase text-slate-400">{"Pelatihan"}</p>
                  </div>
                </div>
            </div>
          </aside>
        </div>

        {/* HIDDEN TEMPLATE PDF */}
        <div className="hidden">
           <div id="cv-content" className="p-20 bg-white w-[210mm] min-h-[297mm] text-slate-900 font-sans relative">
              <div className="flex justify-between items-start border-b-8 border-slate-900 pb-10">
                 <div className="space-y-2">
                    <h1 className="text-5xl font-black uppercase tracking-tighter italic">{profile?.full_name}</h1>
                    <p className="text-xl font-bold text-blue-600 uppercase tracking-[0.3em]">{profile?.disability_type}</p>
                 </div>
              </div>
              <div className="mt-12">
                 <h2 className="text-xs font-black uppercase bg-slate-900 text-white px-4 py-1 inline-block italic mb-4">{"Executive Summary"}</h2>
                 <p className="text-sm italic text-slate-700 leading-relaxed text-justify">{getDisplayBio()}</p>
              </div>
              <div className="absolute bottom-20 left-20 right-20 pt-10 border-t-2 border-slate-100 flex items-center gap-6">
                 <QRCodeSVG value={`https://disabilitas.com/talent/${user.id}`} size={80} />
                 <div>
                    <p className="text-xs font-black uppercase">{"Verified Talent Profile"}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{"Disabilitas.com — Portofolio Profesional Inklusif"}</p>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
