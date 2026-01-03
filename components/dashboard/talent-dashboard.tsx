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
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (prof) {
        setProfile(prof);
        calculateProgress(prof);
      }

      const { count: jobCount } = await supabase
        .from("applications")
        .select("*", { count: 'exact', head: true })
        .eq("profile_id", user.id);

      const { count: trainingCount } = await supabase
        .from("trainees")
        .select("*", { count: 'exact', head: true })
        .eq("profile_id", user.id);

      setStats({
        jobs: jobCount || 0,
        trainings: trainingCount || 0
      });

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
  };

  function calculateProgress(profData: any) {
    const checklist = [
      { value: profData?.full_name, label: "Nama Lengkap", module: "Identitas" },
      { value: profData?.date_of_birth, label: "Tanggal Lahir", module: "Identitas" },
      { value: profData?.phone, label: "Nomor Telepon", module: "Identitas" },
      { value: profData?.gender, label: "Jenis Kelamin", module: "Identitas" },
      { value: profData?.city, label: "Kota Domisili", module: "Identitas" },
      { value: profData?.disability_type, label: "Ragam Disabilitas", module: "Identitas" },
      { value: profData?.document_disability_url, label: "Unggahan Dokumen Disabilitas", module: "Identitas" },
      { value: profData?.communication_preference, label: "Preferensi Komunikasi", module: "Identitas" },
      { value: profData?.has_informed_consent, label: "Informed Consent", module: "Identitas" },
      { value: profData?.internet_quality, label: "Akses Internet", module: "Sarana" },
      { value: profData?.used_assistive_tools?.length > 0 ? "filled" : null, label: "Alat Bantu", module: "Sarana" },
      { value: profData?.career_status, label: "Status Karir", module: "Karir" },
      { value: profData?.resume_url, label: "Unggahan CV", module: "Karir" },
      { value: profData?.education_level, label: "Jenjang Pendidikan", module: "Akademik" },
      { value: profData?.university, label: "Institusi Pendidikan", module: "Akademik" },
      { value: profData?.skills?.length > 0 ? "filled" : null, label: "Daftar Keahlian", module: "Skill" }
    ];

    const missing = checklist
      .filter(item => !item.value)
      .map(item => `${item.module}: ${item.label}`);

    setMissingFields(missing);
    const total = checklist.length;
    const filledCount = total - missing.length;
    setProgress(Math.round((filledCount / total) * 100));
  }

  const getDisplayBio = () => {
    if (profile?.bio) return profile.bio;
    const name = profile?.full_name || "Talenta Inklusif";
    return `Saya adalah ${name}, talenta profesional yang berkomitmen untuk berkontribusi di lingkungan kerja inklusif.`;
  };

  const exportPDF = async () => {
    const element = document.getElementById("cv-content");
    if (!element) return;
    try {
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`CV_${profile?.full_name || 'Talent'}.pdf`);
    } catch (err) {
      console.error("PDF Export failed", err);
    }
  };

  const handleShare = async () => {
    const url = `https://disabilitas.com/talent/${user.id}`;
    const shareText = `Bangga menjadi bagian dari #TalentaInklusif di disabilitas.com! Cek profil profesional saya di sini: ${url}`;

    if (navigator.share) {
      try {
        const element = document.getElementById("inclusion-card");
        if (element) {
          const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
          canvas.toBlob(async (blob) => {
            if (blob) {
              const file = new File([blob], `Inclusion_Card.png`, { type: "image/png" });
              await navigator.share({
                title: "Inclusion Identity Card",
                text: shareText,
                url: url,
                files: [file]
              });
            }
          });
        }
      } catch (err) {
        console.log("Share failed", err);
      }
    } else {
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
      window.open(waUrl, '_blank');
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
        <div className="space-y-8 animate-in fade-in duration-500">
          <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
              <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black italic shadow-lg shadow-blue-200 shrink-0">
                {profile?.full_name?.charAt(0) || "T"}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">{profile?.full_name || "Nama Belum Diisi"}</h1>
                  {progress === 100 && <CheckCircle2 className="text-emerald-500" size={24} />}
                </div>
                <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">{profile?.disability_type || "Ragam Disabilitas Belum Diisi"}</p>
                <div className="flex flex-wrap gap-6 pt-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">
                  <span className="flex items-center gap-2"><MapPin size={14} className="text-blue-600"/> {profile?.city || "N/A"}</span>
                  <span className="flex items-center gap-2"><Briefcase size={14} className="text-blue-600"/> {profile?.career_status || "N/A"}</span>
                  <span className="flex items-center gap-2"><GraduationCap size={14} className="text-blue-600"/> {profile?.education_level || "N/A"}</span>
                </div>
              </div>
            </div>
            <div className="mt-10 p-8 bg-slate-50 rounded-[2rem] border border-slate-100 italic text-sm text-slate-600 leading-relaxed text-justify relative">
              <span className="absolute -top-4 -left-2 text-6xl text-slate-200 font-serif">{"\""}</span>
              {getDisplayBio()}
            </div>
          </section>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white border-2 border-slate-100 rounded-[3rem] p-10 text-center space-y-4 hover:border-blue-600 transition-colors group">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-600 group-hover:scale-110 transition-transform"><Search size={32} /></div>
              <div className="space-y-1">
                <p className="text-2xl font-black text-slate-900 leading-none">{stats.jobs}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{"Smart Job Match"}</p>
              </div>
            </div>
            <div className="bg-white border-2 border-slate-100 rounded-[3rem] p-10 text-center space-y-4 hover:border-emerald-600 transition-colors group">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600 group-hover:scale-110 transition-transform"><BookOpen size={32} /></div>
              <div className="space-y-1">
                <p className="text-2xl font-black text-slate-900 leading-none">{stats.trainings}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{"Training Match"}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  if (loading) return <div className="p-20 text-center font-black italic tracking-widest text-slate-400 animate-pulse">{"SINKRONISASI DATA..."}</div>;

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20 font-sans">
      <div className="max-w-6xl mx-auto space-y-8 pt-8 px-4">
        <section className="bg-white border-2 border-slate-900 p-8 rounded-[3rem] shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">{"Kelengkapan Profil"}</h2>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{"Lengkapi data untuk riset & karir"}</p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex-1 md:w-64 bg-slate-100 h-4 rounded-full overflow-hidden border border-slate-200" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                <div className={`h-full transition-all duration-1000 ${progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`} style={{ width: `${progress}%` }}></div>
              </div>
              <span className="font-black italic text-2xl text-slate-900 min-w-[60px]">{`${progress}%`}</span>
            </div>
          </div>

          {progress < 100 && missingFields.length > 0 && (
            <div className="mt-8 p-6 bg-amber-50 rounded-2xl border border-amber-100">
              <h3 className="text-[10px] font-black uppercase text-amber-700 tracking-widest mb-4 flex items-center gap-2">
                <AlertCircle size={14} /> {"Data Yang Perlu Dilengkapi:"}
              </h3>
              <ul className="grid md:grid-cols-2 gap-x-8 gap-y-2 list-none">
                {missingFields.map((field, idx) => (
                  <li key={idx} className="text-[10px] font-bold text-slate-500 uppercase border-b border-amber-100 pb-1">
                    <span className="text-amber-700 font-black">{field.split(': ')[0]}:</span> {field.split(': ')[1]}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "overview" && (
            <nav className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8 border-t border-slate-100 pt-8">
              {[
                { label: "Identitas", id: "identity", icon: User },
                { label: "Sarana", id: "tech", icon: Laptop },
                { label: "Karir", id: "career", icon: Briefcase },
                { label: "Akademik", id: "academic", icon: GraduationCap },
                { label: "Skill", id: "skills", icon: BookOpen }
              ].map((m, i) => (
                <button 
                  key={i} 
                  onClick={() => setActiveTab(m.id)} 
                  className="bg-slate-50 border-2 border-transparent p-4 rounded-2xl hover:border-blue-600 transition-all text-center group"
                >
                  <m.icon className="mx-auto mb-2 text-slate-400 group-hover:text-blue-600 transition-colors" size={20} />
                  <p className="text-[9px] font-black uppercase text-slate-900">{m.label}</p>
                </button>
              ))}
            </nav>
          )}

          {activeTab !== "overview" && (
            <button 
              onClick={() => setActiveTab("overview")} 
              className="mt-6 flex items-center gap-2 text-xs font-black uppercase text-blue-600 hover:gap-3 transition-all"
            >
              <ChevronLeft size={16}/> {"Kembali ke Dashboard"}
            </button>
          )}
        </section>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">{renderContent()}</div>
          <aside className="space-y-6">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-6 shadow-xl">
              <h3 className="text-[10px] font-black uppercase text-blue-400 tracking-[0.2em]">{"Aksi Talenta"}</h3>
              <div className="space-y-3">
                <a 
                  href={`https://disabilitas.com/talent/${user.id}`} 
                  target="_blank" 
                  className="w-full bg-blue-600 hover:bg-blue-700 p-4 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-3 transition-all"
                >
                  <ExternalLink size={18} /> {"Lihat Profil Publik"}
                </a>
                <button 
                  onClick={exportPDF} 
                  className="w-full bg-white text-slate-900 hover:bg-slate-100 p-4 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-3 transition-all"
                >
                  <FileDown size={18} /> {"Cetak Dokumen CV"}
                </button>
                <button 
                  onClick={handleShare} 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white p-4 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-3 transition-all"
                >
                  <Share2 size={18} /> {"Share Kartu Profil"}
                </button>
              </div>
            </div>
          </aside>
        </div>

        <div className="hidden">
           <div id="cv-content" className="p-20 bg-white w-[210mm] min-h-[297mm] text-slate-900 relative font-sans">
              <div className="border-b-8 border-slate-900 pb-10">
                <h1 className="text-5xl font-black uppercase italic leading-none">{profile?.full_name}</h1>
                <p className="text-xl font-bold text-blue-600 uppercase mt-4 tracking-[0.3em]">{profile?.disability_type}</p>
              </div>
              <div className="mt-12 p-10 border-t-2 border-slate-100 flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-black uppercase">{"Verified Professional Talent"}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{"disabilitas.com/talent/"}{user.id}</p>
                </div>
                <QRCodeSVG value={`https://disabilitas.com/talent/${user.id}`} size={80} />
              </div>
           </div>

           <div id="inclusion-card" className="p-10 bg-white w-[600px] h-[350px] text-slate-900 relative flex flex-col justify-between border-[12px] border-slate-900 rounded-[3rem] font-sans">
              <div className="flex justify-between items-center border-b-4 border-blue-600 pb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter text-blue-600">{"disabilitas.com"}</h2>
                </div>
                <span className="text-[10px] font-black bg-blue-600 text-white px-4 py-1 rounded-full uppercase">{"Verified Talent"}</span>
              </div>
              
              <div className="flex-1 py-6">
                <p className="text-3xl font-black uppercase tracking-tighter text-slate-900">{profile?.full_name || "Nama Lengkap"}</p>
                <p className="text-lg font-bold text-blue-600 uppercase tracking-widest mt-1">{profile?.disability_type || "Ragam Disabilitas"}</p>
                <div className="text-[10px] font-bold text-slate-400 uppercase mt-4 flex items-center gap-4">
                  <span className="flex items-center gap-1"><MapPin size={12} /> {profile?.city || "Lokasi"}</span>
                  <span className="flex items-center gap-1"><GraduationCap size={12}/> {profile?.education_level || "Pendidikan"}</span>
                </div>
              </div>

              <div className="flex justify-between items-end pt-4 border-t-2 border-slate-100">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase text-slate-900">{"Inclusion Identity Card"}</p>
                  <p className="text-[7px] font-bold text-slate-400 uppercase tracking-[0.2em]">{"Scan to view professional portfolio"}</p>
                </div>
                <div className="bg-slate-50 p-2 rounded-2xl border-2 border-slate-100">
                  <QRCodeSVG value={`https://disabilitas.com/talent/${user.id}`} size={60} />
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
