"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { 
  User, MapPin, Briefcase, GraduationCap, FileDown, BookOpen, Laptop, Wifi, ArrowRight, AlertCircle, CheckCircle2, Search, ChevronLeft, LayoutDashboard, Share2, ExternalLink, ShieldCheck, Clock
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
const [ratedJobs, setRatedJobs] = useState<string[]>([]); // Menyimpan list ID yang sudah dirating
  const [profile, setProfile] = useState(initialProfile);
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
const [recommendedTrainings, setRecommendedTrainings] = useState<any[]>([]);

  useEffect(() => {
        if (sessionStorage.getItem("pindahkan_fokus_ke_h1") === "true") {
      const heading = document.querySelector("h1");
      if (heading) {
        heading.setAttribute("tabIndex", "-1");
        heading.focus();
      }
      // Hapus penanda agar tidak terjadi fokus otomatis saat refresh halaman biasa
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
      // 1. Profil Dasar
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
if (prof) {
  setProfile({ ...prof }); // Menggunakan spread agar React deteksi perubahan
  calculateProgress(prof);

  // --- LOGIKA SMART MATCH FLEKSIBEL (OR) ---
  // Mencari lowongan yang: Kotanya sama OR Pendidikannya sama OR Jurusannya sama
  const { data: recJobs } = await supabase
    .from("jobs")
    .select("*, companies(name)")
    .eq("is_active", true)
    .or(`location.eq.${prof.city},required_education_level.eq.${prof.education_level},required_education_major.eq.${prof.major}`)
    .limit(4);
  setRecommendedJobs(recJobs || []);

  // Mencari pelatihan yang: Lokasinya sama OR Kategorinya sesuai jurusan
  const { data: recTrains } = await supabase
    .from("trainings")
    .select("*, partners(name)")
    .eq("is_published", true)
    .or(`location.eq.${prof.city},category.eq.${prof.major}`)
    .limit(4);
  setRecommendedTrainings(recTrains || []);
}

      // 2. Ambil Riwayat Pengalaman Kerja Lengkap
      const { data: works } = await supabase.from("work_experiences")
        .select("position, description, company_name, company_location, employment_type, start_date, end_date")
        .eq("profile_id", user.id)
        .order('start_date', { ascending: false });
      setWorkExps(works || []);

      // 3. Ambil Sertifikasi/Pelatihan Lengkap
      const { data: certs } = await supabase.from("certifications")
        .select("name, organizer_name, year, certificate_url")
        .eq("profile_id", user.id)
        .order('year', { ascending: false });
      setCertifications(certs || []);

      // 4. Tracking Dashboard (Lamaran & Pelatihan)
      const { data: apps } = await supabase.from("applications")
.select("id, status, created_at, jobs(title, companies(name))") // Ambil name dari table companies
.eq("applicant_id", user.id); // Pakai applicant_id
      setAppliedJobs(apps || []);

      const { data: trains } = await supabase.from("trainees")
.select("id, status, created_at, trainings(title, partners(name))") // Ambil name dari table partners
.eq("profile_id", user.id); // Ini sudah benar pakai profile_id sesuai skema
      setAppliedTrainings(trains || []);

      setStats({ jobs: apps?.length || 0, trainings: trains?.length || 0 });
    setStats({ jobs: apps?.length || 0, trainings: trains?.length || 0 });

      // --- TAMBAHAN LANGKAH C ---
      if (apps && apps.length > 0) {
        const ratedStatuses = await Promise.all(
          apps.map(async (app) => {
            const isRated = await checkIfAlreadyRated(user.id, app.id);
            return isRated ? app.id : null;
          })
        );
        setRatedJobs(ratedStatuses.filter(id => id !== null) as string[]);
      }
      // --------------------------

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

    const missing = checklist.filter(item => !item.value).map(item => `${item.module}: ${item.label}`);
    setMissingFields(missing);
    const total = checklist.length;
    const filledCount = total - missing.length;
    setProgress(Math.round((filledCount / total) * 100));
  }

  const getDisplayBio = () => {
    if (profile?.bio) return profile.bio;
    const name = profile?.full_name || "Talenta Inklusif";
    return `Saya adalah ${name}, profesional yang berkomitmen untuk berkontribusi di lingkungan kerja inklusif.`;
  };

  const exportPDF = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      const doc = new jsPDF();
      const name = profile?.full_name || "NAMA LENGKAP";
      const disability = profile?.disability_type || "Profesional Inklusif";
      const contact = `${profile?.city || '-'} | ${profile?.phone || '-'} | ${user?.email}`;

      // --- HEADER ---
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text(name.toUpperCase(), 20, 25);
      
      doc.setFontSize(11);
      doc.setTextColor(37, 99, 235);
      doc.text(disability.toUpperCase(), 20, 32);
      
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.setFont("helvetica", "normal");
      doc.text(contact, 20, 38);
      doc.line(20, 42, 190, 42);

      let yPos = 55;

      // --- RINGKASAN ---
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(0);
      doc.text("RINGKASAN PROFESIONAL", 20, yPos);
      yPos += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const splitBio = doc.splitTextToSize(getDisplayBio(), 170);
      doc.text(splitBio, 20, yPos);
      yPos += (splitBio.length * 5) + 10;

      // --- PENDIDIKAN (Data Profiles) ---
      doc.setFont("helvetica", "bold");
      doc.text("PENDIDIKAN TERAKHIR", 20, yPos);
      yPos += 7;
      doc.setFont("helvetica", "normal");
      doc.text(`${profile?.university || "-"}`, 20, yPos);
      doc.text(`${profile?.major || "-"} | Lulus: ${profile?.graduation_date || "-"}`, 20, yPos + 5);
      yPos += 15;

      // --- PENGALAMAN KERJA ---
      doc.setFont("helvetica", "bold");
      doc.text("RIWAYAT PEKERJAAN", 20, yPos);
      yPos += 7;
      if (workExps.length > 0) {
        workExps.forEach((exp) => {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.text(`${exp.position} (${exp.employment_type || 'N/A'})`, 20, yPos);
          doc.setFont("helvetica", "normal");
          doc.setTextColor(71, 85, 105);
          doc.text(`${exp.company_name} - ${exp.company_location || ''}`, 20, yPos + 5);
          doc.setFontSize(9);
          doc.text(`${exp.start_date} - ${exp.end_date || 'Sekarang'}`, 20, yPos + 10);
          
          if (exp.description) {
            doc.setTextColor(0);
            const splitDesc = doc.splitTextToSize(exp.description, 165);
            doc.text(splitDesc, 25, yPos + 15);
            yPos += (splitDesc.length * 5) + 18;
          } else {
            yPos += 18;
          }
          doc.setTextColor(0);
          if (yPos > 270) { doc.addPage(); yPos = 20; }
        });
      } else {
        doc.setFont("helvetica", "italic");
        doc.text("Belum ada riwayat kerja.", 20, yPos);
        yPos += 12;
      }

      // --- SERTIFIKASI ---
      yPos += 5;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("SERTIFIKASI & PELATIHAN", 20, yPos);
      yPos += 7;
      if (certifications.length > 0) {
        certifications.forEach((cert) => {
          doc.setFont("helvetica", "bold");
          doc.setFontSize(10);
          doc.text(cert.name, 20, yPos);
          doc.setFont("helvetica", "normal");
          doc.text(`${cert.organizer_name} | Tahun: ${cert.year}`, 20, yPos + 5);
          yPos += 12;
          if (yPos > 270) { doc.addPage(); yPos = 20; }
        });
      } else {
        doc.setFont("helvetica", "italic");
        doc.text("-", 20, yPos);
        yPos += 12;
      }

      // --- TEKNOLOGI ASISTIF ---
      yPos += 5;
      doc.setFont("helvetica", "bold");
      doc.text("ALAT BANTU & TEKNOLOGI ASISTIF", 20, yPos);
      yPos += 7;
      doc.setFont("helvetica", "normal");
      const tools = Array.isArray(profile?.used_assistive_tools) ? profile.used_assistive_tools.join(", ") : "-";
      doc.text(`Aksesibilitas: ${tools}`, 20, yPos);

      // --- FOOTER ---
      const pageHeight = doc.internal.pageSize.height;
      doc.setDrawColor(226, 232, 240);
      doc.line(20, pageHeight - 35, 190, pageHeight - 35);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text("Dokumen ini dihasilkan secara otomatis oleh disabilitas.com", 20, pageHeight - 25);
      doc.text(`Tautan Profil: https://disabilitas.com/talent/${user.id}`, 20, pageHeight - 20);

      doc.save(`CV_${name.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error("Gagal cetak CV:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShare = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    const url = `https://disabilitas.com/talent/${user.id}`;
    const name = profile?.full_name || "Talenta Inklusif";
    const shareText = `Bangga menjadi bagian dari #TalentaInklusif di disabilitas.com! 💪 Yuk gabung untuk dapat lowongan terbaik, dan Cek profil profesional saya di sini: ${url}`;

    const openWhatsApp = () => {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
    };

    if (navigator.share) {
      try {
        const element = document.getElementById("inclusion-card");
        if (element) {
          const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
          canvas.toBlob(async (blob) => {
            if (blob) {
              const file = new File([blob], `Inclusion_Card_${name}.png`, { type: "image/png" });
              try {
                await navigator.share({ title: "Inclusion Identity Card", text: shareText, url: url, files: [file] });
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
        case "settings": return <AccountSettings user={user} onSuccess={handleModuleSuccess} />;
      default: return (
        <div className="space-y-10 animate-in fade-in duration-500">
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

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2"><Briefcase size={16} className="text-blue-600" /> {"Tracking Lamaran"}</h3>
              <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] overflow-hidden min-h-[200px]">
                {appliedJobs.length > 0 ? (
                  <div className="divide-y divide-slate-50">
                    {appliedJobs.map((app) => (
<div key={app.id} className="p-5 flex justify-between items-center hover:bg-slate-50 transition-colors">
  <div className="flex-1">
    <p className="font-black text-slate-900 text-xs uppercase">{(app.jobs as any)?.title}</p>
    <p className="text-[9px] font-bold text-slate-400 uppercase">{(app.jobs as any)?.company_name}</p>
  </div>
  
  {/* --- TAMBAHAN LANGKAH D --- */}
  <div className="flex items-center gap-3">
    {(app.status === "accepted" || app.status === "rejected") && (
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setSelectedJobRating(app);
        }}
        disabled={ratedJobs.includes(app.id)}
        className={`text-[8px] font-black uppercase px-3 py-1 rounded-full transition-all ${
          ratedJobs.includes(app.id) 
          ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
          : "bg-amber-100 text-amber-700 hover:bg-amber-600 hover:text-white shadow-sm"
        }`}
      >
        {ratedJobs.includes(app.id) ? "Sudah Diaudit" : "Audit Inklusi"}
      </button>
    )}
    <span className="text-[8px] font-black uppercase px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
      {app.status}
    </span>
  </div>
  {/* -------------------------- */}
</div>
                    ))}
                  </div>
                ) : <div className="p-10 text-center text-[10px] font-bold text-slate-400 uppercase italic">{"Belum ada lamaran"}</div>}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2"><BookOpen size={16} className="text-emerald-600" /> {"Tracking Pelatihan"}</h3>
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
                ) : <div className="p-10 text-center text-[10px] font-bold text-slate-400 uppercase italic">{"Belum ada pendaftaran"}</div>}
              </div>
            </div>
          </div>

{/* SEKSI SMART MATCH DINAMIS */}
          <div className="space-y-6 pt-10 border-t-2 border-slate-50 font-black uppercase italic">
            <div className="flex items-center justify-between">
              <h3 className="text-xs tracking-widest text-slate-900 flex items-center gap-2">
                <Search size={16} className="text-blue-600" /> Rekomendasi Peluang (Smart Match)
              </h3>
              <span className="text-[8px] bg-blue-50 text-blue-600 px-3 py-1 rounded-full">Berdasarkan Profil Anda</span>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4 text-left">
                <p className="text-[10px] text-slate-400 tracking-widest">Lowongan Relevan</p>
                {recommendedJobs.length > 0 ? recommendedJobs.map((job) => (
                  <Link href={`/lowongan/${job.id}`} key={job.id} className="block p-5 bg-white border-2 border-slate-100 rounded-[2rem] hover:border-blue-600 transition-all group shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-xs text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">{job.title}</p>
                        <p className="text-[8px] text-slate-400 tracking-widest">{job.companies?.name} | {job.location}</p>
                      </div>
                    </div>
                  </Link>
                )) : (
                  <div className="p-8 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100 text-center">
                    <p className="text-[8px] text-slate-300">Lengkapi profil untuk melihat lowongan.</p>
                  </div>
                )}
              </div>

              <div className="space-y-4 text-left">
                <p className="text-[10px] text-slate-400 tracking-widest">Pelatihan & Kursus</p>
                {recommendedTrainings.length > 0 ? recommendedTrainings.map((train) => (
                  <Link href={`/training/${train.id}`} key={train.id} className="block p-5 bg-white border-2 border-slate-100 rounded-[2rem] hover:border-emerald-600 transition-all group shadow-sm">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-xs text-slate-900 group-hover:text-emerald-600 transition-colors leading-tight">{train.title}</p>
                        <p className="text-[8px] text-slate-400 tracking-widest">{train.partners?.name} | {train.location}</p>
                      </div>
                    </div>
                  </Link>
                )) : (
                  <div className="p-8 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100 text-center">
                    <p className="text-[8px] text-slate-300">Cek kembali setelah melengkapi profil.</p>
                  </div>
                )}
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
              <h1 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900">{progress === 100 ? "Profil Siap Kerja!" : "Kelengkapan Profil Talenta"}</h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{"Lengkapi Profil dan Raih Karir Impianmu"}</p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex-1 md:w-64 bg-slate-100 h-4 rounded-full overflow-hidden border border-slate-200" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                <div className={`h-full transition-all duration-1000 ${progress === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`} style={{ width: `${progress}%` }}></div>
              </div>
              <span className="font-black italic text-2xl text-slate-900 min-w-[60px]">{`${progress}%`}</span>
            </div>
          </div>

          {progress < 100 && missingFields.length > 0 && activeTab === "overview" && (
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
            <nav className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8 border-t border-slate-100 pt-8">
              {[
                { label: "Identitas", id: "identity", icon: User },
                { label: "Sarana", id: "tech", icon: Laptop },
                { label: "Karir", id: "career", icon: Briefcase },
                { label: "Akademik", id: "academic", icon: GraduationCap },
                { label: "Skill", id: "skills", icon: BookOpen },
                { label: "Akun", id: "settings", icon: ShieldCheck }
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
                  <Share2 size={18} /> {isProcessing ? "Memotret Kartu..." : "Share Kartu Talenta Inklusif"}
                </button>
              </div>
            </div>
          </aside>
        </div>

        <div className="opacity-0 pointer-events-none absolute -z-50 overflow-hidden h-0 w-0" aria-hidden="true">
           <div id="inclusion-card" className="p-10 bg-white w-[600px] h-[350px] text-slate-900 flex flex-col justify-between border-[12px] border-slate-900 rounded-[3rem] font-sans">
              <div className="flex justify-between items-center border-b-4 border-blue-600 pb-4">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-blue-600">{"disabilitas.com"}</h2>
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
                <div className="bg-slate-50 p-2 rounded-2xl border-2 border-slate-100"><QRCodeSVG value={`https://disabilitas.com/talent/${user.id}`} size={60} /></div>
              </div>
           </div>
        </div>
      </div>
      
      {/* --- TAMBAHAN LANGKAH E --- */}
      {selectedJobRating && (
        <InclusionRatingModal 
          job={selectedJobRating}
          userId={user.id}
          onClose={() => setSelectedJobRating(null)}
          onSuccess={() => {
            setSelectedJobRating(null);
            fetchLatestData(); 
          }}
        />
      )}
      {/* -------------------------- */}

    </div>
  );
}
