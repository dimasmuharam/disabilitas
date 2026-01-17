"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { 
  User, MapPin, Briefcase, GraduationCap, FileDown, BookOpen, Laptop, 
  ArrowRight, AlertCircle, CheckCircle2, Search, ChevronLeft, 
  LayoutDashboard, Share2, ExternalLink, ShieldCheck, Clock, Timer, MessageCircle, Zap,
  BadgeCheck, Calendar, Info
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

// Import Modul Anak
import IdentityLegal from "./talent/identity-legal";
import TechAccess from "./talent/tech-access";
import CareerExperience from "./talent/career-experience";
import AcademicBarriers from "./talent/academic-barriers";
import SkillsCertifications from "./talent/skills-certifications";
import AccountSettings from "./talent/account-settings";
import InclusionRatingModal from "./talent/inclusion-rating-modal";
import { checkIfAlreadyRated } from "@/lib/actions/ratings";

// Import Helpers
import { handleNativeShare, handleWhatsAppShare } from "./talent/share-helper";
import { generateProfessionalCV } from "./talent/cv-helper";

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
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedJobRating, setSelectedJobRating] = useState<any>(null);
  const [ratedJobs, setRatedJobs] = useState<string[]>([]);
  const [profile, setProfile] = useState(initialProfile);
  const [recommendedJobs, setRecommendedJobs] = useState<any[]>([]);
  const [recommendedTrainings, setRecommendedTrainings] = useState<any[]>([]);

  // Ref untuk Focus Management Aksesibilitas
  const moduleHeaderRef = useRef<HTMLHeadingElement>(null);

  // --- LOGIKA PROGRESS PROFILE & DETEKSI KEKOSONGAN ---
  const completionData = useMemo(() => {
    if (!profile) return { percent: 0, missing: [] };
    const checks = [
      { v: profile.full_name, l: "Nama Lengkap", m: "Identitas" },
      { v: profile.city, l: "Kota Domisili", m: "Identitas" },
      { v: profile.disability_type, l: "Ragam Disabilitas", m: "Identitas" },
      { v: profile.resume_url, l: "Unggahan CV", m: "Karir" },
      { v: profile.career_status, l: "Status Karir", m: "Karir" },
      { v: profile.education_level, l: "Jenjang Pendidikan", m: "Akademik" },
      { v: profile.skills?.length > 0, l: "Daftar Keahlian", m: "Skill" }
    ];
    const missing = checks.filter(f => !f.v).map(f => `${f.m}: ${f.l}`);
    const percent = Math.round(((checks.length - missing.length) / checks.length) * 100);
    return { percent, missing };
  }, [profile]);

  useEffect(() => {
    if (autoOpenProfile) setActiveTab("identity");
    if (user?.id) fetchLatestData();
  }, [user?.id, autoOpenProfile]);

  // Efek Pindah Fokus saat Modul Dibuka
  useEffect(() => {
    if (activeTab !== "overview") {
      setTimeout(() => {
        moduleHeaderRef.current?.focus();
      }, 150);
    }
  }, [activeTab]);

  async function fetchLatestData() {
    try {
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (prof) {
        setProfile({ ...prof });
        const today = new Date().toISOString();
        
        // SMART-MATCH: Menggunakan skema or(...) yang fleksibel sesuai kolom DB
        const [recJobs, recTrains] = await Promise.all([
          supabase.from("jobs")
            .select("*, companies(id, name, slug)")
            .eq("is_active", true)
            .gt("expires_at", today)
            .or(`location.ilike.%${prof.city || ''}%,required_education_level.eq.${prof.education_level || ''}`)
            .limit(4),
          supabase.from("trainings")
            .select("*, partners(id, name, slug)")
            .eq("is_published", true)
            .gt("registration_deadline", today)
            .or(`location.ilike.%${prof.city || ''}%,target_disability.cs.{${prof.disability_type || ''}}`)
            .limit(4)
        ]);
        setRecommendedJobs(recJobs.data || []);
        setRecommendedTrainings(recTrains.data || []);
      }

      // TRACKING: Menyesuaikan pengambilan hrd_notes dari tabel applications & trainees
      const [worksRes, certsRes, appsRes, trainsRes] = await Promise.all([
        supabase.from("work_experiences").select("*").eq("profile_id", user.id).order('start_date', { ascending: false }),
        supabase.from("certifications").select("*, trainings(total_hours, syllabus)").eq("profile_id", user.id).order('year', { ascending: false }),
        supabase.from("applications").select("*, jobs(id, slug, title, companies(id, name, slug))").eq("applicant_id", user.id),
        supabase.from("trainees").select("*, trainings(id, slug, title, start_date, partners(id, name, slug))").eq("profile_id", user.id)
      ]);

      setWorkExps(worksRes.data || []);
      setCertifications(certsRes.data || []);
      setAppliedJobs(appsRes.data || []);
      setAppliedTrainings(trainsRes.data || []);
      setStats({ jobs: appsRes.data?.length || 0, trainings: trainsRes.data?.length || 0 });

      if (appsRes.data) {
        const ratedStatuses = await Promise.all(appsRes.data.map(async (app) => {
          const isRated = await checkIfAlreadyRated(user.id, app.id);
          return isRated ? app.id : null;
        }));
        setRatedJobs(ratedStatuses.filter(id => id !== null) as string[]);
      }
    } catch (e) { console.error("Sync Error:", e); } 
    finally { 
      setLoading(false); 
      setActiveTab("overview"); // UNIVERSAL AUTOCLOSE SETELAH SAVE
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }const renderContent = () => {
    switch (activeTab) {
      case "identity": return <IdentityLegal user={user} profile={profile} onSuccess={fetchLatestData} />;
      case "tech": return <TechAccess user={user} profile={profile} onSuccess={fetchLatestData} />;
      case "career": return <CareerExperience user={user} profile={profile} onSuccess={fetchLatestData} />;
      case "academic": return <AcademicBarriers user={user} profile={profile} onSuccess={fetchLatestData} />;
      case "skills": return <SkillsCertifications user={user} profile={profile} onSuccess={fetchLatestData} />;
      case "settings": return <AccountSettings user={user} onSuccess={fetchLatestData} />;
      default: return (
        <div className="space-y-10 duration-500 animate-in fade-in">
          
          {/* FITUR CEK KELENGKAPAN PROFIL (UNTUK SCREEN READER) */}
          {completionData.percent < 100 && (
            <div className="rounded-[2.5rem] border-2 border-amber-200 bg-amber-50 p-8 text-left" role="alert" aria-labelledby="completion-title">
              <h3 id="completion-title" className="mb-2 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-amber-800">
                <AlertCircle size={18} aria-hidden="true" /> Profil Belum Lengkap ({completionData.percent}%)
              </h3>
              <ul className="list-inside list-disc space-y-1">
                {completionData.missing.map((item, idx) => (
                  <li key={idx} className="text-xs font-bold text-amber-700">{item}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid gap-8 text-left md:grid-cols-2">
            {/* JOBS TRACKING */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-900">
                <Briefcase size={16} className="text-blue-600" /> Tracking Lamaran Kerja
              </h3>
              <div className="min-h-[300px] overflow-hidden rounded-[2.5rem] border-2 border-slate-100 bg-white">
                {appliedJobs.length > 0 ? (
                  <div className="divide-y divide-slate-50">
                    {appliedJobs.map((app) => (
                      <div key={app.id} className="p-6 transition-colors hover:bg-slate-50 text-left">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-1">
                            <Link href={`/lowongan/${app.jobs?.slug || app.jobs?.id}`} className="block text-sm font-black uppercase text-slate-900 hover:text-blue-600">
                              {app.jobs?.title}
                            </Link>
                            <Link href={`/company/${app.jobs?.companies?.slug || app.jobs?.companies?.id}`} className="text-[10px] font-bold uppercase text-slate-400 hover:text-blue-500 hover:underline">
                              {app.jobs?.companies?.name}
                            </Link>
                          </div>
                          <span className={`rounded-full border px-3 py-1 text-[8px] font-black uppercase ${
                            app.status === 'hired' ? 'border-emerald-100 bg-emerald-50 text-emerald-600' : 
                            app.status === 'rejected' ? 'border-red-100 bg-red-50 text-red-500' : 'border-blue-100 bg-blue-50 text-blue-600'
                          }`}>{app.status}</span>
                        </div>
                        {app.hrd_notes && (
                          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
                            <Clock size={14} className="mt-0.5 shrink-0 text-amber-600" />
                            <div className="space-y-1 text-left">
                              <p className="text-[9px] font-black uppercase text-amber-700 italic text-left">Pesan HRD:</p>
                              <p className="text-xs font-medium text-slate-600 text-left">{app.hrd_notes}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : <div className="flex h-[300px] items-center justify-center p-10 opacity-30 font-bold uppercase italic">Belum ada lamaran.</div>}
              </div>
            </div>

            {/* TRAININGS TRACKING */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-900">
                <BookOpen size={16} className="text-emerald-600" /> Tracking Pelatihan
              </h3>
              <div className="min-h-[300px] overflow-hidden rounded-[2.5rem] border-2 border-slate-100 bg-white">
                {appliedTrainings.length > 0 ? (
                  <div className="divide-y divide-slate-50">
                    {appliedTrainings.map((reg) => (
                      <div key={reg.id} className="p-6 transition-colors hover:bg-slate-50 text-left">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-1">
                            <Link href={`/pelatihan/${reg.trainings?.slug || reg.trainings?.id}`} className="block text-sm font-black uppercase text-slate-900 hover:text-emerald-600">
                              {reg.trainings?.title}
                            </Link>
                            <Link href={`/partner/${reg.trainings?.partners?.slug || reg.trainings?.partners?.id}`} className="text-[10px] font-bold uppercase text-slate-400 hover:text-emerald-500 hover:underline">
                              {reg.trainings?.partners?.name}
                            </Link>
                          </div>
                          <span className={`rounded-full border px-3 py-1 text-[8px] font-black uppercase ${
                            reg.status === 'accepted' ? 'border-emerald-100 bg-emerald-50 text-emerald-600' : 'border-slate-100 bg-slate-50 text-slate-400'
                          }`}>{reg.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <div className="flex h-[300px] items-center justify-center p-10 opacity-30 font-bold uppercase italic">Belum ada pelatihan.</div>}
              </div>
            </div>
          </div>

          {/* SMART MATCH SECTION */}
          <section className="space-y-6 border-t-2 border-slate-50 pt-10 text-left">
            <h3 className="flex items-center gap-2 text-xs font-black uppercase italic tracking-widest text-slate-900">
              <Zap size={16} className="text-amber-500" /> Rekomendasi Pintar (Smart-Match)
            </h3>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400 italic text-left">Peluang Karir Sesuai Domisili & Pendidikan</p>
                {recommendedJobs.map((j) => (
                  <div key={j.id} className="rounded-[2rem] border-2 border-slate-100 bg-white p-5 shadow-sm text-left">
                    <Link href={`/lowongan/${j.slug || j.id}`} className="block text-xs font-black uppercase hover:text-blue-600">{j.title}</Link>
                    <Link href={`/company/${j.companies?.slug || j.companies?.id}`} className="text-[8px] font-bold uppercase text-slate-400 hover:underline">{j.companies?.name}</Link>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400 italic text-left">Pelatihan Sesuai Ragam Disabilitas</p>
                {recommendedTrainings.map((t) => (
                  <div key={t.id} className="rounded-[2rem] border-2 border-slate-100 bg-white p-5 shadow-sm text-left">
                    <Link href={`/pelatihan/${t.slug || t.id}`} className="block text-xs font-black uppercase hover:text-emerald-600">{t.title}</Link>
                    <Link href={`/partner/${t.partners?.slug || t.partners?.id}`} className="text-[8px] font-bold uppercase text-slate-400 hover:underline">{t.partners?.name}</Link>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      );
    }
  };

  if (loading) return <div role="status" className="animate-pulse p-20 text-center font-black uppercase italic text-slate-400">Menyinkronkan Portal Karir...</div>;

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 selection:bg-blue-100">
      <div className="mx-auto max-w-6xl space-y-8 px-4 pt-8 text-left text-slate-900">
        
        {/* HEADER PROFILE (DATA NAMA & BIO) */}
        <header className="rounded-[3.5rem] border-2 border-slate-900 bg-white p-10 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)]">
           <div className="flex flex-col items-start gap-8 md:flex-row md:items-center text-left">
            <div className="relative rounded-[2rem] border-2 border-slate-900 bg-white p-3">
              <QRCodeSVG value={`https://disabilitytalent.id/talent/${user?.id}`} size={80} />
            </div>
            <div className="flex-1 space-y-2 text-left">
              <h1 className="text-4xl font-black uppercase italic leading-none tracking-tighter text-left">
                {profile?.full_name || "Nama Belum Lengkap"}
              </h1>
              <p className="max-w-xl text-sm font-bold italic leading-relaxed text-slate-500 text-left">
                {profile?.summary || profile?.bio || "Silakan lengkapi profil singkat Anda di menu Identitas."}
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <MapPin size={12} className="text-red-500" /> {profile?.city || "Lokasi Belum Diatur"}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <Briefcase size={12} className="text-blue-500" /> {profile?.career_status || "Status Belum Diatur"}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3 text-right">
               <div className="flex items-center gap-3">
                 <span className="text-3xl font-black italic leading-none">{completionData.percent}%</span>
                 <div className="h-4 w-32 overflow-hidden rounded-full border border-slate-200 bg-slate-100" role="progressbar" aria-valuenow={completionData.percent}>
                    <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${completionData.percent}%` }}></div>
                 </div>
               </div>
               <p className="text-[8px] font-black uppercase text-slate-400 italic text-right">Kelengkapan Profil</p>
            </div>
           </div>
        </header>

        {/* NAVIGATION TABS */}
        <nav className="grid grid-cols-3 gap-4 md:grid-cols-6" aria-label="Menu Dashboard">
          {[
            { label: "Identitas", id: "identity", icon: User },
            { label: "Sarana", id: "tech", icon: Laptop },
            { label: "Karir", id: "career", icon: Briefcase },
            { label: "Akademik", id: "academic", icon: GraduationCap },
            { label: "Skill", id: "skills", icon: BookOpen },
            { label: "Akun", id: "settings", icon: ShieldCheck }
          ].map((m) => (
            <button 
              key={m.id} 
              onClick={() => setActiveTab(m.id)} 
              aria-pressed={activeTab === m.id}
              className={`group flex flex-col items-center justify-center rounded-3xl border-2 p-4 transition-all ${
                activeTab === m.id ? 'border-slate-900 bg-slate-900 text-white shadow-lg' : 'border-transparent bg-white shadow-sm hover:border-slate-200'
              }`}
            >
              <m.icon className="mb-2" size={20} />
              <span className="text-[10px] font-black uppercase italic">{m.label}</span>
            </button>
          ))}
        </nav>

        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {activeTab !== "overview" && (
              <h2 ref={moduleHeaderRef} tabIndex={-1} className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase text-slate-900 outline-none">
                <ChevronLeft size={14} /> Memasuki Modul {activeTab}
              </h2>
            )}
            {renderContent()}
          </div>
          
          <aside className="space-y-8">
            {/* PROFESSIONAL HUB */}
            <div className="rounded-[3.5rem] border-t-[12px] border-blue-600 bg-slate-900 p-8 text-white shadow-2xl text-left">
              <h3 className="mb-6 text-[10px] font-black uppercase tracking-widest text-blue-400 italic">Professional Hub</h3>
              <div className="space-y-3">
                <Link href={`/talent/${user.id}`} target="_blank" className="flex items-center justify-center gap-3 rounded-2xl border border-white/5 bg-white/10 p-4 text-[10px] font-black uppercase transition-all hover:bg-white/20">
                  <ExternalLink size={18} /> Profil Publik
                </Link>
                <button onClick={() => generateProfessionalCV(profile, workExps, certifications)} disabled={isProcessing} className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white p-4 text-[10px] font-black uppercase text-slate-900 shadow-lg transition-all hover:bg-blue-50 text-left">
                  <FileDown size={18} /> {isProcessing ? "Menyusun..." : "Cetak CV"}
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => handleNativeShare(user.id, profile)} className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 p-4 text-[8px] font-black uppercase transition-all hover:bg-emerald-700">
                    <Share2 size={16} /> Share
                  </button>
                  <button onClick={() => handleWhatsAppShare(user.id, profile)} className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] p-4 text-[8px] font-black uppercase">
                    <MessageCircle size={16} /> WA
                  </button>
                </div>
              </div>
            </div>

            {/* RINGKASAN AKTIVITAS */}
            <div className="rounded-[3.5rem] border-2 border-slate-100 bg-white p-8 shadow-sm text-center">
              <h3 className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase italic leading-none tracking-widest text-slate-400"><LayoutDashboard size={14}/> Statistik</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-3xl bg-slate-50 p-4 text-center">
                  <p className="text-3xl font-black text-slate-900">{stats.jobs}</p>
                  <p className="text-[8px] font-black uppercase text-slate-400 italic text-center">Lamaran</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4 text-center">
                  <p className="text-3xl font-black text-slate-900">{stats.trainings}</p>
                  <p className="text-[8px] font-black uppercase text-slate-400 italic text-center">Pelatihan</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {selectedJobRating && (
        <InclusionRatingModal 
          job={selectedJobRating} 
          userId={user.id} 
          onClose={() => setSelectedJobRating(null)} 
          onSuccess={() => { setSelectedJobRating(null); fetchLatestData(); }} 
        />
      )}
    </div>
  );
}