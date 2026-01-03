use client";

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
      { value: profData?.has_informed_consent, label: "Persetujuan Data (Informed Consent)", module: "Identitas" },
      { value: profData?.internet_quality, label: "Akses Internet di Rumah", module: "Sarana" },
      { value: profData?.used_assistive_tools?.length > 0 ? "filled" : null, label: "Alat Bantu Yang Digunakan Bekerja dan Sehari-hari", module: "Sarana" },
      { value: profData?.preferred_accommodations?.length > 0 ? "filled" : null, label: "Akomodasi Yang Diinginkan", module: "Sarana" },
      { value: profData?.career_status, label: "Status Karir Saat Ini", module: "Karir" },
      { value: profData?.work_preference, label: "Preferensi Lingkungan Kerja", module: "Karir" },
      { value: profData?.expected_salary, label: "Ekspektasi Gaji", module: "Karir" },
      { value: profData?.linkedin_url, label: "Tautan LinkedIn", module: "Karir" },
      { value: profData?.resume_url, label: "Unggahan CV/Resume", module: "Karir" },
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
      { value: profData?.skills?.length > 0 ? "filled" : null, label: "Daftar Keahlian Utama", module: "Skill" },
      { value: profData?.skill_acquisition_method, label: "Metode Perolehan Skill", module: "Skill" },
      { value: profData?.training_accessibility_rating, label: "Rating Aksesibilitas Pelatihan", module: "Skill" }
    ];

    const missing = checklist
      .filter(item => item.value === null || item.value === undefined || item.value === "" || item.value === false)
      .map(item => `${item.module}: ${item.label}`);

    setMissingFields(missing);

    const total = checklist.length;
    const filledCount = total - missing.length;
    setProgress(Math.round((filledCount / total) * 100));
  }

const exportPDF = async () => {
    const element = document.getElementById("cv-content");
    if (!element) return;

  const canvas = await html2canvas(element, { 
    scale: 2,
    useCORS: true, 
    allowTaint: true,
    backgroundColor: "#ffffff" 
  });
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`CV_${profile?.full_name?.replace(/\s+/g, '_')}.pdf`);
  };

const handleShare = async () => {
  const url = `https://disabilitas.com/talent/${user.id}`;
  const name = profile?.full_name || "Talenta Inklusif";
  const shareText = `Bangga menjadi bagian dari #TalentaInklusif di disabilitas.com! 💪 Cari lowongan dan bersama membangun ekosistem kerja inklusif dan Aksesibilitas Digital di Indonesia. Cek profil lengkap saya di disabilitas.com.`;

  if (navigator.share) {
    try {
      const element = document.getElementById("inclusion-card");
      if (element) {
        const canvas = await html2canvas(element, { 
          scale: 2,
          useCORS: true, 
          allowTaint: true,
          backgroundColor: "#ffffff" 
        });
        canvas.toBlob(async (blob) => {
          if (blob) {
            const file = new File([blob], `Inclusion_Card_${name}.png`, { type: "image/png" });
            await navigator.share({
              title: "Inclusion Talent Card",
              text: shareText,
              url: url,
              files: [file]
            });
          }
        });
      }
    } catch (err) {
      console.log("Share canceled", err);
    }
  } else {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
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
              {"\""}{profile?.bio || `Saya adalah Talenta Inklusif, komitmen secara profesional di lingkungan kerja yang inklusif dan aksesibel.`}{"\""}
            </div>
          </section>
        </div>
      );
    }
  };

  if (loading) return (
    <div className="p-20 text-center font-black italic tracking-widest text-slate-400">
      {"SINKRONISASI DATA..."}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20 font-sans">
      <div className="max-w-6xl mx-auto">
        {renderContent()}
      </div>
    </div>
  );
}