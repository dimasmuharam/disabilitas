"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  User, MapPin, Briefcase, GraduationCap, 
  FileDown, BookOpen, Laptop, Wifi, 
  AlertCircle, CheckCircle2, Search,
  ChevronLeft, LayoutDashboard, Share2, ExternalLink, ShieldCheck, Clock
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
import AccountSettings from "./talent/account-settings";
import InclusionRatingModal from "./talent/inclusion-rating-modal";
import { checkIfAlreadyRated } from "@/lib/actions/ratings";

interface TalentDashboardProps {
  user: any;
  profile: any;
  autoOpenProfile?: boolean;
}

export default function TalentDashboard({ user, profile: initialProfile, autoOpenProfile }: TalentDashboardProps) {
  const [loading, setLoading] = useState(!initialProfile);
  const [isProcessing, setIsProcessing] = useState(false);
  const [stats, setStats] = useState({ jobs: 0, trainings: 0 });
  const [appliedJobs, setAppliedJobs] = useState<any[]>([]);
  const [appliedTrainings, setAppliedTrainings] = useState<any[]>([]);
  const [workExps, setWorkExps] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [progress, setProgress] = useState(0);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedJobRating, setSelectedJobRating] = useState<any>(null);
  const [ratedJobs, setRatedJobs] = useState<string[]>([]);
  const [profile, setProfile] = useState(initialProfile);

  useEffect(() => {
    if (sessionStorage.getItem("pindahkan_fokus_ke_h1") === "true") {
      const heading = document.querySelector("h1");
      if (heading) {
        heading.setAttribute("tabIndex", "-1");
        heading.focus();
      }
      sessionStorage.removeItem("pindahkan_fokus_ke_h1");
    }

    if (autoOpenProfile) {
      setActiveTab("identity");
    }

    if (user?.id) {
      fetchLatestData();
    }
  }, [user?.id]);

  async function fetchLatestData() {
    try {
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (prof) {
        setProfile({ ...prof }); 
        calculateProgress(prof);
      }

      const { data: works } = await supabase.from("work_experiences").select("*").eq("profile_id", user.id).order('start_date', { ascending: false });
      setWorkExps(works || []);

      const { data: certs } = await supabase.from("certifications").select("*").eq("profile_id", user.id).order('year', { ascending: false });
      setCertifications(certs || []);

      const { data: apps } = await supabase.from("applications").select("id, status, created_at, jobs(title, companies(name))").eq("applicant_id", user.id);
      setAppliedJobs(apps || []);

      const { data: trains } = await supabase.from("trainees").select("id, status, created_at, trainings(title, partners(name))").eq("profile_id", user.id);
      setAppliedTrainings(trains || []);

      setStats({ jobs: apps?.length || 0, trainings: trains?.length || 0 });

      if (apps && apps.length > 0) {
        const ratedStatuses = await Promise.all(
          apps.map(async (app) => {
            const isRated = await checkIfAlreadyRated(user.id, app.id);
            return isRated ? app.id : null;
          })
        );
        setRatedJobs(ratedStatuses.filter(id => id !== null) as string[]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleModuleSuccess = () => {
    setTimeout(() => {
      fetchLatestData();
      setActiveTab("overview");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 500);
  };

  function calculateProgress(profData: any) {
    const checklist = [
      { value: profData?.full_name, label: "Nama Lengkap", module: "Identitas" },
      { value: profData?.date_of_birth, label: "Tanggal Lahir", module: "Identitas" },
      { value: profData?.phone, label: "Nomor Telepon", module: "Identitas" },
      { value: profData?.gender, label: "Jenis Kelamin", module: "Identitas" },
      { value: profData?.city, label: "Kota Domisili", module: "Identitas" },
      { value: profData?.disability_type, label: "Ragam Disabilitas", module: "Identitas" },
      { value: profData?.document_disability_url, label: "Unggahan Dokumen", module: "Identitas" },
      { value: profData?.communication_preference, label: "Preferensi Komunikasi", module: "Identitas" },
      { value: profData?.has_informed_consent, label: "Informed Consent", module: "Identitas" },
      { value: profData?.internet_quality, label: "Akses Internet", module: "Sarana" },
      { value: Array.isArray(profData?.used_assistive_tools) && profData.used_assistive_tools.length > 0 ? "filled" : null, label: "Alat Bantu", module: "Sarana" },
      { value: profData?.career_status, label: "Status Karir", module: "Karir" },
      { value: profData?.resume_url, label: "Unggahan CV", module: "Karir" },
      { value: profData?.education_level, label: "Jenjang Pendidikan", module: "Akademik" },
      { value: profData?.university, label: "Institusi Pendidikan", module: "Akademik" },
      { value: Array.isArray(profData?.skills) && profData.skills.length > 0 ? "filled" : null, label: "Daftar Keahlian", module: "Skill" }
    ];
    const missing = checklist.filter(item => !item.value).map(item => `${item.module}: ${item.label}`);
    setMissingFields(missing);
    setProgress(Math.round(((checklist.length - missing.length) / checklist.length) * 100));
  }

  const getDisplayBio = () => profile?.bio || `Saya adalah ${profile?.full_name || "Talenta Inklusif"}, profesional yang siap berkontribusi.`;

  const exportPDF = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const doc = new jsPDF();
      const name = (profile?.full_name || "NAMA LENGKAP").toUpperCase();
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text(name, 20, 25);
      doc.setFontSize(11);
      doc.setTextColor(37, 99, 235);
      doc.text((profile?.disability_type || "PROFESIONAL").toUpperCase(), 20, 32);
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(`${profile?.city || '-'} | ${profile?.phone || '-'} | ${user?.email}`, 20, 38);
      doc.line(20, 42, 190, 42);
      doc.save(`CV_Aksesibel_${profile?.full_name?.replace(/\s+/g, '_')}.pdf`);
    } catch (err) { console.error(err); } finally { setIsProcessing(false); }
  };
  // FITUR SHARE (YANG TADI KETINGGALAN)
  const handleShare = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    const url = `https://disabilitas.com/talent/${user.id}`;
    const name = profile?.full_name || "Talenta Inklusif";
    const shareText = `Cek profil profesional saya di #TalentaInklusif disabilitas.com: ${url}`;

    if (navigator.share) {
      try {
        const element = document.getElementById("inclusion-card");
        if (element) {
          const canvas = await html2canvas(element, { scale: 2, useCORS: true });
          canvas.toBlob(async (blob) => {
            if (blob) {
              const file = new File([blob], `Card_${name}.png`, { type: "image/png" });
              await navigator.share({ title: "Inclusion Card", text: shareText, url: url, files: [file] });
            }
            setIsProcessing(false);
          });
        }
      } catch (err) {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
        setIsProcessing(false);
      }
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
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
      case "settings": return <AccountSettings user={user} onSuccess={handleModuleSuccess} />;
      default: return (
        <div className="space-y-10 animate-in fade-in duration-500 text-left italic font-medium">
          <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-900 shadow-sm relative overflow-hidden">
            <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
              <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white text-3xl font-black shrink-0">
                {profile?.full_name?.charAt(0) || "T"}
              </div>
              <div className="flex-1 space-y-2">
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase leading-none">{profile?.full_name || "Lengkapi Profil"}</h2>
                <p className="text-sm font-bold text-blue-600 uppercase tracking-widest">{profile?.disability_type || "Ragam Disabilitas"}</p>
                <div className="flex flex-wrap gap-6 pt-4 text-[10px] font-black uppercase text-slate-400">
                  <span className="flex items-center gap-2"><MapPin size={14} className="text-blue-600"/> {profile?.city || "N/A"}</span>
                  <span className="flex items-center gap-2"><Briefcase size={14} className="text-blue-600"/> {profile?.career_status || "N/A"}</span>
                </div>
              </div>
            </div>
            <div className="mt-10 p-8 bg-slate-50 rounded-[2rem] border border-slate-100 italic text-sm text-slate-600 leading-relaxed">
              <strong>{getDisplayBio()}</strong>
            </div>
          </section>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2 italic"><Briefcase size={16} className="text-blue-600" /> Tracking Lamaran</h3>
              <div className="bg-white border-2 border-slate-900 rounded-[2.5rem] overflow-hidden min-h-[200px]">
                {appliedJobs.length > 0 ? (
                  <div className="divide-y-2 divide-slate-50">
                    {appliedJobs.map((app) => (
                      <div key={app.id} className="p-6 flex justify-between items-center hover:bg-slate-50 transition-all font-black uppercase">
                        <div className="space-y-1">
                          <p className="text-slate-900 text-xs italic">{app.jobs?.title}</p>
                          <p className="text-[9px] text-slate-400 tracking-widest">{app.jobs?.companies?.name}</p>
                        </div>
                        <span className="text-[8px] px-3 py-1 bg-blue-50 text-blue-600 rounded-lg italic">{app.status}</span>
                      </div>
                    ))}
                  </div>
                ) : <div className="p-20 text-center text-[10px] font-black text-slate-300 uppercase italic tracking-widest">Belum ada lamaran.</div>}
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2 italic"><BookOpen size={16} className="text-emerald-600" /> Tracking Pelatihan</h3>
              <div className="bg-white border-2 border-slate-900 rounded-[2.5rem] overflow-hidden min-h-[200px]">
                {appliedTrainings.length > 0 ? (
                  <div className="divide-y-2 divide-slate-50 font-black uppercase italic">
                    {appliedTrainings.map((reg) => (
                      <div key={reg.id} className="p-6 flex justify-between items-center hover:bg-slate-50 transition-all">
                        <div>
                          <p className="text-slate-900 text-xs">{reg.trainings?.title}</p>
                          <p className="text-[9px] text-slate-400 tracking-widest">{reg.trainings?.partners?.name}</p>
                        </div>
                        <span className="text-[8px] px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg">{reg.status}</span>
                      </div>
                    ))}
                  </div>
                ) : <div className="p-20 text-center text-[10px] font-black text-slate-300 uppercase italic tracking-widest">Belum ada pelatihan.</div>}
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  if (loading) return <div className="p-20 text-center font-black italic tracking-widest text-slate-400 animate-pulse uppercase">SINKRONISASI DATA...</div>;

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 font-sans text-left selection:bg-blue-100">
      <div className="max-w-6xl mx-auto space-y-8 pt-8 px-6">
        <section className="bg-white border-2 border-slate-900 p-8 rounded-[3.5rem] shadow-[10px_10px_0px_0px_rgba(15,23,42,1)] relative overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
            <div className="space-y-1">
              <h1 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 leading-none">{progress === 100 ? "Profil Sempurna!" : "Optimalkan Profil Anda"}</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] italic">Data lengkap mendukung akurasi rekrutmen inklusif.</p>
            </div>
            <div className="flex items-center gap-6 w-full md:w-auto bg-slate-50 p-4 rounded-3xl border border-slate-100">
              <div className="flex-1 md:w-64 bg-slate-200 h-3 rounded-full overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                <div className={`h-full transition-all duration-1000 ${progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`} style={{ width: `${progress}%` }}></div>
              </div>
              <span className="font-black italic text-3xl text-slate-900">{`${progress}%`}</span>
            </div>
          </div>

          {activeTab === "overview" && (
            <nav className="grid grid-cols-3 md:grid-cols-6 gap-4 mt-12 border-t-2 border-slate-50 pt-10">
              {[
                { label: "Identitas", id: "identity", icon: User },
                { label: "Sarana", id: "tech", icon: Laptop },
                { label: "Karir", id: "career", icon: Briefcase },
                { label: "Akademik", id: "academic", icon: GraduationCap },
                { label: "Skill", id: "skills", icon: BookOpen },
                { label: "Pengaturan", id: "settings", icon: ShieldCheck }
              ].map((m) => (
                <button key={m.id} onClick={() => setActiveTab(m.id)} className="bg-white border-2 border-slate-100 p-6 rounded-3xl hover:border-slate-900 transition-all text-center group active:scale-95 shadow-sm">
                  <m.icon className="mx-auto mb-3 text-slate-400 group-hover:text-blue-600 transition-colors" size={24} />
                  <p className="text-[9px] font-black uppercase text-slate-900 tracking-widest italic">{m.label}</p>
                </button>
              ))}
            </nav>
          )}

          {activeTab !== "overview" && (
            <button onClick={() => setActiveTab("overview")} className="mt-10 flex items-center gap-2 text-[10px] font-black uppercase text-blue-600 italic tracking-widest border-b-2 border-blue-100 pb-1">
              <ChevronLeft size={16}/> Dashboard Utama
            </button>
          )}
        </section>

        <div className="grid lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-2">{renderContent()}</div>
          <aside className="space-y-8 sticky top-8">
            <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white space-y-8 shadow-2xl relative overflow-hidden font-black uppercase tracking-tighter italic">
              <h3 className="text-[10px] text-blue-400 border-b border-white/10 pb-4">Opsi Talenta</h3>
              <div className="space-y-4 relative z-10">
                <a href={`/talent/${user.id}`} target="_blank" className="w-full bg-blue-600 hover:bg-blue-700 py-5 rounded-[2rem] text-[10px] flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all">
                  <ExternalLink size={18} /> Profil Publik
                </a>
                <button onClick={exportPDF} disabled={isProcessing} className="w-full bg-white text-slate-900 py-5 rounded-[2rem] text-[10px] flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all disabled:opacity-50">
                  <FileDown size={18} /> {isProcessing ? "Menyusun Data..." : "Cetak Resume"}
                </button>
                <button onClick={handleShare} disabled={isProcessing} className="w-full bg-emerald-600 py-5 rounded-[2rem] text-[10px] flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all shadow-emerald-900/20">
                  <Share2 size={18} /> Share Card
                </button>
              </div>
            </div>
          </aside>
        </div>

        {/* IDENTITY CARD ASSET (HIDDEN FOR SCREENSHOT) */}
        <div className="opacity-0 pointer-events-none absolute -z-50 overflow-hidden h-0 w-0" aria-hidden="true">
           <div id="inclusion-card" className="p-12 bg-white w-[800px] h-[450px] text-slate-900 border-[16px] border-slate-900 rounded-[4rem] font-sans flex flex-col justify-between italic font-black">
              <h2 className="text-4xl text-blue-600 border-b-8 border-blue-600 pb-4">disabilitas.com</h2>
              <div className="flex-1 py-10">
                <p className="text-5xl uppercase tracking-tighter">{profile?.full_name || "TALENTA"}</p>
                <p className="text-2xl text-blue-600 uppercase tracking-widest mt-2">{profile?.disability_type || "RAGAM DISABILITAS"}</p>
              </div>
              <div className="flex justify-between items-end border-t-4 border-slate-100 pt-8">
                <p className="text-xs uppercase text-slate-400">Identity Card | {user.id.slice(0,8)}</p>
                <QRCodeSVG value={`https://disabilitas.com/talent/${user.id}`} size={80} />
              </div>
           </div>
        </div>
      </div>
      
      {selectedJobRating && (
        <InclusionRatingModal job={selectedJobRating} userId={user.id} onClose={() => setSelectedJobRating(null)}
          onSuccess={() => { setSelectedJobRating(null); fetchLatestData(); }} />
      )}
    </div>
  );
}
