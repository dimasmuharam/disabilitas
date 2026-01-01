"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  User, MapPin, Briefcase, GraduationCap, 
  FileDown, BookOpen, Laptop, LayoutDashboard,
  AlertCircle, CheckCircle2, Linkedin, Search, Loader2,
  ChevronRight, QRCode, Settings, Star
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// Import Modul Anak (Pastikan file ini sudah ada di folder /talent)
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
  const [activeTab, setActiveTab] = useState("dashboard");
  const [profile, setProfile] = useState(initialProfile);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ jobs: 0, trainings: 0 });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (user?.id) {
      fetchLatestProfile();
      fetchAggregatedStats();
    }
  }, [user?.id]);

  useEffect(() => {
    calculateProgress();
  }, [profile]);

  async function fetchLatestProfile() {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (data) setProfile(data);
  }

  async function fetchAggregatedStats() {
    try {
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
      console.error("Stats Error:", error);
    } finally {
      setLoading(false);
    }
  }

  function calculateProgress() {
    const fields = [
      profile?.full_name, profile?.city, profile?.disability_type, 
      profile?.bio, profile?.education_level, profile?.has_laptop,
      profile?.has_informed_consent
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

  const renderContent = () => {
    switch (activeTab) {
      case "identity":
        return <IdentityLegal user={user} profile={profile} onSuccess={fetchLatestProfile} />;
      case "tech":
        return <TechAccess user={user} profile={profile} onSuccess={fetchLatestProfile} />;
      case "career":
        return <CareerExperience user={user} profile={profile} onSuccess={fetchLatestProfile} />;
      case "academic":
        return <AcademicBarriers user={user} profile={profile} onSuccess={fetchLatestProfile} />;
      case "skills":
        return <SkillsCertifications user={user} profile={profile} onSuccess={fetchLatestProfile} />;
      default:
        return (
          <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* WELCOME BANNER */}
            <section className="bg-slate-900 text-white p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-500">
                <LayoutDashboard size={180} />
              </div>
              <div className="relative z-10 space-y-4">
                <h2 className="text-2xl font-black uppercase italic tracking-tighter text-blue-400">{"Selamat Datang Kembali,"}</h2>
                <h1 className="text-6xl font-black uppercase tracking-tighter leading-none">
                  {profile?.full_name || user.email?.split("@")[0]}
                </h1>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] pt-4">
                  {"Dashboard Talenta • Aksesibilitas Penuh Aktif"}
                </p>
              </div>
            </section>

            {/* QUICK STATS */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm flex items-center gap-6 hover:border-blue-600 transition-all group">
                <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all"><Search size={28}/></div>
                <div>
                  <p className="text-3xl font-black italic">{stats.jobs}</p>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{"Lowongan Dilamar"}</p>
                </div>
              </div>
              <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm flex items-center gap-6 hover:border-emerald-600 transition-all group">
                <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all"><BookOpen size={28}/></div>
                <div>
                  <p className="text-3xl font-black italic">{stats.trainings}</p>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{"Pelatihan Diikuti"}</p>
                </div>
              </div>
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-dashed border-slate-200 flex items-center gap-6">
                <div className="bg-white p-4 rounded-2xl text-slate-400 shadow-sm"><Star size={28}/></div>
                <div>
                  <p className="text-3xl font-black italic text-slate-900">{progress}%</p>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{"Kelengkapan Profil"}</p>
                </div>
              </div>
            </section>

            <div className="grid lg:grid-cols-2 gap-10">
               {/* MINI CV PREVIEW */}
               <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-8">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">{"Professional Identity"}</h3>
                  <div className="space-y-4">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{"Ragam Disabilitas"}</p>
                    <p className="text-xl font-black uppercase italic text-blue-600">{profile?.disability_type || "Belum Diisi"}</p>
                  </div>
                  <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                    <button onClick={exportPDF} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-blue-600 transition-all flex items-center gap-3">
                      <FileDown size={16}/> {"Download PDF CV"}
                    </button>
                    <QRCodeSVG value={`https://disabilitas.com/talent/${user.id}`} size={60} />
                  </div>
               </div>

               {/* BIO BOX */}
               <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-8">
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">{"Executive Summary"}</h3>
                  <p className="text-slate-600 italic font-medium leading-relaxed">
                    {profile?.bio ? `"${profile.bio}"` : "Belum ada bio singkat. Lengkapi profil Anda untuk mempermudah HRD mengenal Anda."}
                  </p>
               </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 py-10 grid lg:grid-cols-[300px_1fr] gap-10">
        
        {/* SIDE NAVIGATION */}
        <aside className="space-y-6">
          <div className="bg-white p-4 rounded-[3rem] border-2 border-slate-100 shadow-sm space-y-2 sticky top-10">
            <h3 className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">{"Menu Utama"}</h3>
            {[
              { id: "dashboard", label: "Overview", icon: <LayoutDashboard size={18} /> },
              { id: "identity", label: "Identitas", icon: <User size={18} /> },
              { id: "tech", label: "Sarana Kerja", icon: <Laptop size={18} /> },
              { id: "career", label: "Karir & Kerja", icon: <Briefcase size={18} /> },
              { id: "academic", label: "Akademik", icon: <GraduationCap size={18} /> },
              { id: "skills", label: "Kompetensi", icon: <Star size={18} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-3xl font-black uppercase text-[10px] tracking-widest transition-all ${
                  activeTab === tab.id 
                    ? "bg-slate-900 text-white shadow-2xl shadow-slate-200 scale-[1.03]" 
                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* PROGRESS CARD */}
          <div className="bg-blue-600 p-8 rounded-[3rem] text-white space-y-4 shadow-xl shadow-blue-100">
             <h4 className="text-[10px] font-black uppercase tracking-widest opacity-80">{"Profile Progress"}</h4>
             <div className="text-4xl font-black italic">{progress}%</div>
             <div className="bg-blue-800 h-2 rounded-full overflow-hidden">
                <div className="bg-white h-full transition-all duration-1000" style={{ width: `${progress}%` }} />
             </div>
             <p className="text-[9px] font-bold uppercase leading-tight opacity-70">
               {"Lengkapi semua modul untuk mendapatkan lencana terverifikasi."}
             </p>
          </div>
        </aside>

        {/* MAIN AREA */}
        <main className="min-h-[800px]">
          {renderContent()}
        </main>
      </div>

      {/* HIDDEN PREVIEW FOR PDF GENERATION */}
      <div className="hidden">
        <div id="cv-content" className="p-20 bg-white w-[210mm] min-h-[297mm] text-slate-900 font-sans">
          <div className="flex justify-between items-start border-b-8 border-slate-900 pb-10">
            <div className="space-y-2">
              <h1 className="text-5xl font-black uppercase tracking-tighter italic">{profile?.full_name}</h1>
              <p className="text-xl font-bold text-blue-600 uppercase tracking-[0.3em]">{profile?.disability_type}</p>
            </div>
            <QRCodeSVG value={`https://disabilitas.com/talent/${user.id}`} size={100} />
          </div>
          <div className="mt-12 grid grid-cols-3 gap-16">
            <div className="col-span-2 space-y-12">
              <section>
                <h2 className="text-xs font-black uppercase bg-slate-900 text-white px-4 py-1 inline-block italic mb-4">{"Executive Summary"}</h2>
                <p className="text-sm leading-relaxed font-medium text-slate-700 italic border-l-4 border-slate-100 pl-6">{profile?.bio}</p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
