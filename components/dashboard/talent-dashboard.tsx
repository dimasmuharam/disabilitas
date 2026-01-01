"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  User, MapPin, Briefcase, GraduationCap, 
  FileDown, BookOpen, Laptop, Wifi, 
  AlertCircle, CheckCircle2, Linkedin, Search,
  ChevronLeft, LayoutDashboard, Share2
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Import Modul Anak (Pastikan file-file ini ada di folder components/dashboard/talent/)
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
  const [activeTab, setActiveTab] = useState("dashboard"); // State navigasi
  const [profile, setProfile] = useState(initialProfile);

  useEffect(() => {
    if (user?.id) {
      fetchLatestData();
    }
  }, [user?.id, profile]);

  async function fetchLatestData() {
    try {
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (prof) setProfile(prof);

      const { count: jobCount } = await supabase.from("applications").select("*", { count: 'exact', head: true }).eq("profile_id", user.id);
      const { count: trainingCount } = await supabase.from("trainees").select("*", { count: 'exact', head: true }).eq("profile_id", user.id);

      setStats({ jobs: jobCount || 0, trainings: trainingCount || 0 });
      calculateProgress(prof || profile);
    } catch (error) {
      console.error("Error stats:", error);
    } finally {
      setLoading(false);
    }
  }

  function calculateProgress(profData: any) {
    const fields = [
      profData?.full_name, profData?.city, profData?.disability_type, 
      profData?.bio, profData?.education_level, profData?.has_laptop,
      profData?.resume_url, profData?.has_informed_consent
    ];
    const filled = fields.filter(f => f !== null && f !== undefined && f !== "").length;
    setProgress(Math.round((filled / fields.length) * 100));
  }

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
    const viralCaption = `Halo Rekan HRD! Saya ${profile?.full_name || 'Talenta Inklusif'}, seorang profesional ${profile?.disability_type || ''}. Cek profil profesional dan kompetensi saya di Disabilitas.com melalui link berikut: ${url} #TalentaInklusif #DisabilitasBekerja #InclusionMatters`;
    
    switch (platform) {
      case 'wa': window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(viralCaption)}`, '_blank'); break;
      case 'li': window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank'); break;
      case 'fb': window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank'); break;
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "identity": return <IdentityLegal user={user} profile={profile} onSuccess={fetchLatestData} />;
      case "tech": return <TechAccess user={user} profile={profile} onSuccess={fetchLatestData} />;
      case "career": return <CareerExperience user={user} profile={profile} onSuccess={fetchLatestData} />;
      case "academic": return <AcademicBarriers user={user} profile={profile} onSuccess={fetchLatestData} />;
      case "skills": return <SkillsCertifications user={user} profile={profile} onSuccess={fetchLatestData} />;
      default: return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black italic shadow-lg shadow-blue-200">
                {profile?.full_name?.charAt(0) || "T"}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{profile?.full_name}</h1>
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
            {profile?.bio && (
              <div className="mt-10 p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                <h3 className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">{"Executive Summary"}</h3>
                <p className="text-sm font-medium text-slate-600 leading-relaxed italic">{"\""}{profile.bio}{"\""}</p>
              </div>
            )}
          </section>

          {/* NAVIGASI MODUL - PERBAIKAN BROKEN LINKS */}
          <nav className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { label: "Identitas", id: "identity", icon: User, done: !!profile?.full_name },
              { label: "Sarana", id: "tech", icon: Laptop, done: !!profile?.has_laptop },
              { label: "Karir", id: "career", icon: Briefcase, done: !!profile?.career_status },
              { label: "Akademik", id: "academic", icon: GraduationCap, done: !!profile?.education_level },
              { label: "Skill", id: "skills", icon: BookOpen, done: !!profile?.skills?.length }
            ].map((m, i) => (
              <button key={i} onClick={() => setActiveTab(m.id)} className="bg-white border-2 border-slate-100 p-6 rounded-[2rem] hover:border-blue-600 transition-all group text-center shadow-sm">
                <m.icon className="mx-auto mb-3 text-slate-400 group-hover:text-blue-600 transition-colors" size={24} />
                <p className="text-[10px] font-black uppercase text-slate-900">{m.label}</p>
                {m.done ? <CheckCircle2 size={12} className="text-emerald-500 mx-auto mt-2" /> : <div className="h-1 w-4 bg-slate-100 mx-auto mt-2 rounded-full" />}
              </button>
            ))}
          </nav>

          <div className="grid md:grid-cols-2 gap-8 mt-12">
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

  if (loading) return <div className="p-20 text-center font-black italic tracking-widest text-slate-400">{"SINKRONISASI DATA EKOSISTEM..."}</div>;

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20 font-sans">
      <div className="max-w-6xl mx-auto space-y-8 pt-8 px-4">
        
        {/* BACK TO DASHBOARD OVERVIEW */}
        {activeTab !== "dashboard" && (
          <button onClick={() => setActiveTab("dashboard")} className="flex items-center gap-2 text-xs font-black uppercase text-blue-600 hover:text-slate-900 transition-all">
            <ChevronLeft size={16}/> {"Kembali ke Overview"}
          </button>
        )}

        <section role="alert" className="bg-white border-2 border-slate-900 p-8 rounded-[2rem] shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <h2 className="text-xl font-black italic uppercase tracking-tighter text-slate-900">{"Kelengkapan Profil Anda"}</h2>
              <p className="text-xs font-bold text-slate-500 uppercase">{"Lengkapi profil untuk akurasi Smart Match"}</p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex-1 md:w-64 bg-slate-100 h-4 rounded-full overflow-hidden border border-slate-200">
                <div className="bg-blue-600 h-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
              </div>
              <span className="font-black italic text-xl text-slate-900">{`${progress}%`}</span>
            </div>
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {renderContent()}
          </div>

          <aside className="space-y-6">
            {/* INCLUSION CARD & MULTI-SHARE TOOLS - DIPERTAHANKAN TOTAL */}
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-6 shadow-2xl">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-400">{"Professional Tools"}</h3>
              <div className="space-y-3">
                <button onClick={exportPDF} className="w-full bg-white text-slate-900 p-4 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-3 hover:bg-blue-600 hover:text-white transition-all shadow-lg">
                  <FileDown size={18} /> {"Cetak CV (PDF)"}
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => handleShare('wa')} className="bg-emerald-600 p-3 rounded-xl font-black uppercase text-[8px] hover:bg-emerald-700 transition-all">{"WhatsApp"}</button>
                  <button onClick={() => handleShare('li')} className="bg-blue-700 p-3 rounded-xl font-black uppercase text-[8px] hover:bg-blue-800 transition-all">{"LinkedIn"}</button>
                </div>
              </div>
              <div className="flex items-center gap-4 pt-4 border-t border-slate-800">
                <div className="bg-white p-2 rounded-xl">
                  <QRCodeSVG value={`https://disabilitas.com/talent/${user.id}`} size={50} />
                </div>
                <p className="text-[8px] font-bold text-slate-500 leading-tight uppercase">{"Scan QR untuk Public Profile Talent"}</p>
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">{"Aktivitas Saya"}</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-slate-50 rounded-2xl">
                    <p className="text-2xl font-black italic text-slate-900">{stats.jobs}</p>
                    <p className="text-[8px] font-black uppercase text-slate-400">{"Lamaran Kerja"}</p>
                  </div>
                  <div className="text-center p-4 bg-slate-50 rounded-2xl">
                    <p className="text-2xl font-black italic text-slate-900">{stats.trainings}</p>
                    <p className="text-[8px] font-black uppercase text-slate-400">{"Pelatihan"}</p>
                  </div>
                </div>
            </div>
          </aside>
        </div>

        {/* HIDDEN TEMPLATE PDF */}
        <div className="hidden">
           <div id="cv-content" className="p-20 bg-white w-[210mm] text-slate-900 font-sans">
              <div className="flex justify-between items-start border-b-8 border-slate-900 pb-10">
                 <div className="space-y-2">
                    <h1 className="text-5xl font-black uppercase tracking-tighter italic">{profile?.full_name}</h1>
                    <p className="text-xl font-bold text-blue-600 uppercase tracking-[0.3em]">{profile?.disability_type}</p>
                 </div>
                 <QRCodeSVG value={`https://disabilitas.com/talent/${user.id}`} size={100} />
              </div>
              <div className="mt-12">
                 <h2 className="text-xs font-black uppercase bg-slate-900 text-white px-4 py-1 inline-block italic mb-4">{"Executive Summary"}</h2>
                 <p className="text-sm italic text-slate-700">{profile?.bio}</p>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
