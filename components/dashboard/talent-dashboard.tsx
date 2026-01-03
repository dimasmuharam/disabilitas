"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  User, MapPin, Briefcase, GraduationCap, 
  FileDown, BookOpen, Laptop, Wifi, 
  AlertCircle, CheckCircle2, Search,
  ChevronLeft, Share2, ExternalLink, Clock
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState({ jobs: 0, trainings: 0 });
  const [appliedJobs, setAppliedJobs] = useState<any[]>([]);
  const [appliedTrainings, setAppliedTrainings] = useState<any[]>([]);
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

      // 1. Tracking Lamaran Kerja (Tabel: applications)
      const { data: applications, count: jobCount } = await supabase
        .from("applications")
        .select("id, status, created_at, jobs(title, company_name)")
        .eq("profile_id", user.id);
      setAppliedJobs(applications || []);

      // 2. Tracking Pendaftaran Pelatihan (Tabel: trainees)
      const { data: traineeReg, count: trainingCount } = await supabase
        .from("trainees")
        .select("id, status, created_at, trainings(title, organizer_name)")
        .eq("profile_id", user.id);
      setAppliedTrainings(traineeReg || []);

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
    const disability = profile?.disability_type ? `dengan ragam ${profile.disability_type}` : "";
    const city = profile?.city ? `berdomisili di ${profile.city}` : "";
    return `Saya adalah ${name} ${disability}, ${city}. Saya berkomitmen untuk berkontribusi secara profesional di lingkungan kerja yang inklusif.`;
  };

  const exportPDF = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const doc = new jsPDF();
      const name = profile?.full_name || "Talenta Inklusif";
      const disability = profile?.disability_type || "Profesional Inklusif";
      const url = `https://disabilitas.com/talent/${user.id}`;

      // Header Branding
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.text(name.toUpperCase(), 20, 30);
      
      doc.setFontSize(14);
      doc.setTextColor(37, 99, 235);
      doc.text(disability.toUpperCase(), 20, 40);
      
      doc.setDrawColor(15, 23, 42);
      doc.setLineWidth(0.5);
      doc.line(20, 45, 190, 45);

      // Section: Executive Summary
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.text("EXECUTIVE SUMMARY", 20, 55);
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const splitBio = doc.splitTextToSize(getDisplayBio(), 170);
      doc.text(splitBio, 20, 62);

      // Section: Skill & Tech
      doc.setFont("helvetica", "bold");
      doc.text("KOMPETENSI & TEKNOLOGI", 20, 90);
      doc.setFont("helvetica", "normal");
      doc.text(`Keahlian: ${profile?.skills?.join(", ") || "-"}`, 20, 97);
      doc.text(`Alat Bantu: ${profile?.used_assistive_tools?.join(", ") || "-"}`, 20, 104);

      // Footer Validasi
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("Dokumen ini dihasilkan secara otomatis oleh sistem disabilitas.com", 20, 275);
      doc.text(`Profil Digital: ${url}`, 20, 280);

      doc.save(`CV_${name.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error("Gagal generate PDF aksesibel:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = async () => {
    const url = `https://disabilitas.com/talent/${user.id}`;
    const name = profile?.full_name || "Talenta Inklusif";
    const shareText = `Bangga menjadi bagian dari #TalentaInklusif di disabilitas.com! 💪 Mari bersama membangun ekosistem kerja inklusif di Indonesia. Cek profil profesional saya di sini: ${url}`;

    const openWhatsApp = () => {
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
      window.open(waUrl, '_blank');
    };

    if (isProcessing) return;
    setIsProcessing(true);

    if (navigator.share) {
      try {
        const element = document.getElementById("inclusion-card");
        if (element) {
          const canvas = await html2canvas(element, { 
            scale: 2, useCORS: true, backgroundColor: "#ffffff" 
          });
          
          canvas.toBlob(async (blob) => {
            if (blob) {
              const file = new File([blob], `Inclusion_Card_${name}.png`, { type: "image/png" });
              try {
                await navigator.share({
                  title: "Inclusion Identity Card",
                  text: shareText,
                  url: url,
                  files: [file]
                });
              } catch (err) { openWhatsApp(); }
            } else { openWhatsApp(); }
            setIsProcessing(false);
          }, "image/png");
        }
      } catch (err) { openWhatsApp(); setIsProcessing(false); }
    } else {
      openWhatsApp();
      setIsProcessing(false);
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
        <div className="space-y-10 animate-in fade-in duration-500">
          {/* HEADER PROFILE CARD */}
          <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black italic shadow-lg shadow-blue-200 shrink-0">
                {profile?.full_name?.charAt(0) || "T"}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">{profile?.full_name || "Nama Belum Diisi"}</h2>
                  {progress === 100 && <CheckCircle2 className="text-emerald-500" size={24} />}
                </div>
                <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">{profile?.disability_type || "Ragam Disabilitas Belum Diisi"}</p>
                <div className="flex flex-wrap gap-6 pt-4 text-[10px] font-black uppercase text-slate-400">
                  <span className="flex items-center gap-2"><MapPin size={14} className="text-blue-600"/> {profile?.city || "N/A"}</span>
                  <span className="flex items-center gap-2"><Briefcase size={14} className="text-blue-600"/> {profile?.career_status || "N/A"}</span>
                  <span className="flex items-center gap-2"><GraduationCap size={14} className="text-blue-600"/> {profile?.education_level || "N/A"}</span>
                </div>
              </div>
            </div>
            <div className="mt-10 p-8 bg-slate-50 rounded-[2rem] border border-slate-100 italic text-sm text-slate-600 leading-relaxed text-justify">
              {"\""}{getDisplayBio()}{"\""}
            </div>
          </section>

          {/* COMBO TRACKING */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Tracking Lowongan */}
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                <Briefcase size={16} className="text-blue-600" /> {"Tracking Lamaran"}
              </h3>
              <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden min-h-[200px]">
                {appliedJobs.length > 0 ? (
                  <div className="divide-y divide-slate-50">
                    {appliedJobs.map((app) => (
                      <div key={app.id} className="p-5 flex justify-between items-center hover:bg-slate-50 transition-colors">
                        <div>
                          <p className="font-black text-slate-900 text-xs uppercase">{(app.jobs as any)?.title}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">{(app.jobs as any)?.company_name}</p>
                        </div>
                        <span className="text-[8px] font-black uppercase px-3 py-1 bg-blue-50 text-blue-600 rounded-full">{app.status}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-10 text-center text-[10px] font-bold text-slate-400 uppercase italic">{"Belum ada lamaran"}</div>
                )}
              </div>
            </div>

            {/* Tracking Pelatihan */}
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                <BookOpen size={16} className="text-emerald-600" /> {"Tracking Pelatihan"}
              </h3>
              <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden min-h-[200px]">
                {appliedTrainings.length > 0 ? (
                  <div className="divide-y divide-slate-50">
                    {appliedTrainings.map((reg) => (
                      <div key={reg.id} className="p-5 flex justify-between items-center hover:bg-slate-50 transition-colors">
                        <div>
                          <p className="font-black text-slate-900 text-xs uppercase">{(reg.trainings as any)?.title}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">{(reg.trainings as any)?.organizer_name}</p>
                        </div>
                        <span className="text-[8px] font-black uppercase px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full">{reg.status}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-10 text-center text-[10px] font-bold text-slate-400 uppercase italic">{"Belum ada pendaftaran"}</div>
                )}
              </div>
            </div>
          </div>

          {/* SMART RECOMMENDATIONS */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-900 p-10 rounded-[3rem] text-center space-y-4 shadow-xl hover:scale-[1.02] transition-transform">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto text-white shadow-lg shadow-blue-500/20"><Search size={32} /></div>
              <h4 className="text-lg font-black text-white italic uppercase tracking-tighter">{"Smart Job Match"}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase">{"Rekomendasi lowongan yang sesuai profil Anda."}</p>
            </div>
            <div className="bg-slate-900 p-10 rounded-[3rem] text-center space-y-4 shadow-xl hover:scale-[1.02] transition-transform">
              <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center mx-auto text-white shadow-lg shadow-emerald-500/20"><BookOpen size={32} /></div>
              <h4 className="text-lg font-black text-white italic uppercase tracking-tighter">{"Training Match"}</h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase">{"Tingkatkan keahlian dengan kursus pilihan."}</p>
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
        
        {/* TOP PROGRESS CARD */}
        <section className="bg-white border-2 border-slate-900 p-8 rounded-[3rem] shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-1">
              <h1 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">
                {progress === 100 ? "Profil Siap Kerja!" : "Kelengkapan Profil Talenta"}
              </h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{"Lengkapi data untuk riset & ekosistem bisnis inklusif"}</p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex-1 md:w-64 bg-slate-100 h-4 rounded-full overflow-hidden border border-slate-200" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={`Pencapaian profil ${progress} persen`}>
                <div className={`h-full transition-all duration-1000 ${progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`} style={{ width: `${progress}%` }}></div>
              </div>
              <span className="font-black italic text-2xl text-slate-900 min-w-[60px]">{`${progress}%`}</span>
            </div>
          </div>

          {progress < 100 && missingFields.length > 0 && (
            <div className="mt-8 p-6 bg-amber-50 rounded-2xl border border-amber-100">
              <h3 className="text-[10px] font-black uppercase text-amber-700 tracking-widest mb-4 flex items-center gap-2"><AlertCircle size={14} /> {"Data Yang Perlu Dilengkapi:"}</h3>
              <ul className="grid md:grid-cols-2 gap-x-8 gap-y-2">
                {missingFields.map((field, idx) => (
                  <li key={idx} className="text-[10px] font-bold text-slate-500 uppercase border-b border-amber-100/50 pb-1">
                    <span className="text-amber-700 font-black">{field.split(': ')[0]}:</span> {field.split(': ')[1]}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "overview" && (
            <nav className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8 border-t border-slate-100 pt-8" aria-label="Menu Modul Profil">
              {[
                { label: "Identitas", id: "identity", icon: User },
                { label: "Sarana", id: "tech", icon: Laptop },
                { label: "Karir", id: "career", icon: Briefcase },
                { label: "Akademik", id: "academic", icon: GraduationCap },
                { label: "Skill", id: "skills", icon: BookOpen }
              ].map((m) => (
                <button key={m.id} onClick={() => setActiveTab(m.id)} className="bg-slate-50 border-2 border-transparent p-4 rounded-2xl hover:border-blue-600 transition-all text-center group">
                  <m.icon className="mx-auto mb-2 text-slate-400 group-hover:text-blue-600 transition-colors" size={20} />
                  <p className="text-[9px] font-black uppercase text-slate-900">{m.label}</p>
                </button>
              ))}
            </nav>
          )}

          {activeTab !== "overview" && (
            <button onClick={() => setActiveTab("overview")} className="mt-6 flex items-center gap-2 text-xs font-black uppercase text-blue-600 hover:gap-3 transition-all">
              <ChevronLeft size={16}/> {"Kembali ke Dashboard Utama"}
            </button>
          )}
        </section>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">{renderContent()}</div>
          <aside className="space-y-6">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-6 shadow-xl relative overflow-hidden">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-400">{"Aksi Talenta"}</h3>
              <div className="space-y-3">
                <a href={`https://disabilitas.com/talent/${user.id}`} target="_blank" className="w-full bg-blue-600 hover:bg-blue-700 p-4 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-3 transition-all">
                  <ExternalLink size={18} /> {"Lihat Profil Publik"}
                </a>
                <button onClick={exportPDF} disabled={isProcessing} className="w-full bg-white text-slate-900 p-4 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-3 hover:bg-slate-100 transition-all disabled:opacity-50">
                  <FileDown size={18} /> {isProcessing ? "Menyusun Dokumen..." : "Cetak CV Aksesibel"}
                </button>
                <button onClick={handleShare} disabled={isProcessing} className="w-full bg-emerald-600 p-4 rounded-2xl font-black uppercase text-[10px] flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-lg shadow-emerald-900/20">
                  <Share2 size={18} /> {isProcessing ? "Memotret Kartu..." : "Share Kartu Identitas"}
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* TEMPLATE TERSEMBUNYI UNTUK INCLUSION CARD (IMAGE ONLY) */}
        <div className="opacity-0 pointer-events-none absolute -z-50 overflow-hidden h-0 w-0" aria-hidden="true">
           <div id="inclusion-card" className="p-10 bg-white w-[600px] h-[350px] text-slate-900 flex flex-col justify-between border-[12px] border-slate-900 rounded-[3rem] font-sans">
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
                  <span>{profile?.city || "Lokasi"}</span>
                  <span className="w-1.5 h-1.5 bg-slate-200 rounded-full"></span>
                  <span>{profile?.education_level || "Pendidikan"}</span>
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
