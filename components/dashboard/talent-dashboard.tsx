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

  // --- LOGIKA PROGRESS PROFILE ---
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
        const [recJobs, recTrains] = await Promise.all([
          supabase.from("jobs").select("*, companies(name)").eq("is_active", true).gt("expires_at", today).or(`location.ilike.%${prof.city}%,required_education_level.eq.${prof.education_level}`).limit(4),
          supabase.from("trainings").select("*, partners(name)").eq("is_published", true).gt("registration_deadline", today).or(`location.ilike.%${prof.city}%,target_disability.cs.{${prof.disability_type}}`).limit(4)
        ]);
        setRecommendedJobs(recJobs.data || []);
        setRecommendedTrainings(recTrains.data || []);
      }

      const [worksRes, certsRes, appsRes, trainsRes] = await Promise.all([
        supabase.from("work_experiences").select("*").eq("profile_id", user.id).order('start_date', { ascending: false }),
        supabase.from("certifications").select("*, trainings(total_hours, syllabus)").eq("profile_id", user.id).order('year', { ascending: false }),
        supabase.from("applications").select("*, jobs(id, slug, title, companies(name))").eq("applicant_id", user.id),
        supabase.from("trainees").select("*, trainings(id, slug, title, start_date, partners(name))").eq("profile_id", user.id)
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
      setActiveTab("overview"); // Kembali ke overview setelah sukses sinkronisasi
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case "identity": return <section aria-labelledby="mod-title"><h2 id="mod-title" ref={moduleHeaderRef} tabIndex={-1} className="sr-only">Pengaturan Identitas</h2><IdentityLegal user={user} profile={profile} onSuccess={fetchLatestData} /></section>;
      case "tech": return <section aria-labelledby="mod-title"><h2 id="mod-title" ref={moduleHeaderRef} tabIndex={-1} className="sr-only">Akses Teknologi</h2><TechAccess user={user} profile={profile} onSuccess={fetchLatestData} /></section>;
      case "career": return <section aria-labelledby="mod-title"><h2 id="mod-title" ref={moduleHeaderRef} tabIndex={-1} className="sr-only">Pengalaman Karir</h2><CareerExperience user={user} profile={profile} onSuccess={fetchLatestData} /></section>;
      case "academic": return <section aria-labelledby="mod-title"><h2 id="mod-title" ref={moduleHeaderRef} tabIndex={-1} className="sr-only">Riwayat Akademik</h2><AcademicBarriers user={user} profile={profile} onSuccess={fetchLatestData} /></section>;
      case "skills": return <section aria-labelledby="mod-title"><h2 id="mod-title" ref={moduleHeaderRef} tabIndex={-1} className="sr-only">Skill & Sertifikasi</h2><SkillsCertifications user={user} profile={profile} onSuccess={fetchLatestData} /></section>;
      case "settings": return <section aria-labelledby="mod-title"><h2 id="mod-title" ref={moduleHeaderRef} tabIndex={-1} className="sr-only">Pengaturan Akun</h2><AccountSettings user={user} onSuccess={fetchLatestData} /></section>;
      default: return (
        <div className="space-y-10 duration-500 animate-in fade-in">
          {/* TRACKING GRID */}
          <div className="grid gap-8 text-left md:grid-cols-2">
            {/* JOBS TRACKING */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-900">
                <Briefcase size={16} className="text-blue-600" /> Tracking Lamaran Kerja
              </h3>
              <div className="min-h-[300px] overflow-hidden rounded-[2.5rem] border-2 border-slate-100 bg-white shadow-inner">
                {appliedJobs.length > 0 ? (
                  <div className="divide-y divide-slate-50">
                    {appliedJobs.map((app) => (
                      <div key={app.id} className="p-6 transition-colors hover:bg-slate-50">
                        <div className="flex items-start justify-between gap-4">
                          <Link href={`/lowongan/${app.jobs?.slug || app.jobs?.id}`} className="group flex-1">
                            <p className="text-sm font-black uppercase text-slate-900 transition-colors group-hover:text-blue-600">{app.jobs?.title}</p>
                            <p className="text-[10px] font-bold uppercase text-slate-400">{app.jobs?.companies?.name}</p>
                          </Link>
                          <span className={`rounded-full border px-3 py-1 text-[8px] font-black uppercase ${
                            app.status === 'hired' ? 'border-emerald-100 bg-emerald-50 text-emerald-600' : 
                            app.status === 'rejected' ? 'border-red-100 bg-red-50 text-red-500' : 'border-blue-100 bg-blue-50 text-blue-600'
                          }`}>{app.status}</span>
                        </div>
                        {app.hrd_notes && (
                          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
                            <Clock size={14} className="mt-0.5 shrink-0 text-amber-600" />
                            <div className="space-y-1">
                              <p className="text-[9px] font-black uppercase text-amber-700">Pesan dari HRD / Jadwal:</p>
                              <p className="text-xs font-medium italic text-slate-600">{app.hrd_notes}</p>
                            </div>
                          </div>
                        )}
                        {app.status === 'hired' && !ratedJobs.includes(app.id) && (
                          <button onClick={() => setSelectedJobRating(app)} className="mt-3 flex items-center gap-2 text-[9px] font-black uppercase text-emerald-600 hover:text-emerald-700">
                            <Zap size={12} /> Beri Rating Inklusi Perusahaan
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : <div className="flex h-[300px] flex-col items-center justify-center p-10 text-[10px] font-bold uppercase italic opacity-30"><Briefcase size={32} className="mb-2"/> Belum ada lamaran.</div>}
              </div>
            </div>

            {/* TRAININGS TRACKING */}
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-900">
                <BookOpen size={16} className="text-emerald-600" /> Tracking Pelatihan
              </h3>
              <div className="min-h-[300px] overflow-hidden rounded-[2.5rem] border-2 border-slate-100 bg-white shadow-inner">
                {appliedTrainings.length > 0 ? (
                  <div className="divide-y divide-slate-50">
                    {appliedTrainings.map((reg) => (
                      <div key={reg.id} className="p-6 transition-colors hover:bg-slate-50">
                        <div className="flex items-start justify-between gap-4">
                          <Link href={`/pelatihan/${reg.trainings?.slug || reg.trainings?.id}`} className="group flex-1">
                            <p className="text-sm font-black uppercase text-slate-900 transition-colors group-hover:text-emerald-600">{reg.trainings?.title}</p>
                            <p className="text-[10px] font-bold uppercase text-slate-400">{reg.trainings?.partners?.name}</p>
                          </Link>
                          <span className={`rounded-full border px-3 py-1 text-[8px] font-black uppercase ${
                            reg.status === 'accepted' ? 'border-emerald-100 bg-emerald-50 text-emerald-600' : 'border-slate-100 bg-slate-50 text-slate-400'
                          }`}>{reg.status}</span>
                        </div>
                        {reg.status === 'accepted' && reg.trainings?.start_date && (
                          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4">
                            <Calendar size={14} className="shrink-0 text-emerald-600" />
                            <div className="space-y-1">
                              <p className="text-[9px] font-black uppercase text-emerald-700">Jadwal Pelaksanaan:</p>
                              <p className="text-xs font-bold text-slate-700">{new Date(reg.trainings.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                            </div>
                          </div>
                        )}
                        {reg.status === 'completed' && (
                          <div className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase text-emerald-600">
                            <BadgeCheck size={16} /> Sertifikat Tersedia di Modul Skill
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : <div className="flex h-[300px] flex-col items-center justify-center p-10 text-[10px] font-bold uppercase italic opacity-30"><BookOpen size={32} className="mb-2"/> Belum ada pelatihan.</div>}
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
                <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Peluang Karir Lokal</p>
                {recommendedJobs.length > 0 ? recommendedJobs.map((j) => (
                  <Link href={`/lowongan/${j.slug || j.id}`} key={j.id} className="group block rounded-[2rem] border-2 border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-blue-600">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-black uppercase leading-tight text-slate-900 transition-colors group-hover:text-blue-600">{j.title}</p>
                        <p className="text-[8px] font-bold uppercase text-slate-400">{j.companies?.name} | {j.location}</p>
                      </div>
                      <ArrowRight size={14} className="text-slate-200 transition-all group-hover:text-blue-600" />
                    </div>
                  </Link>
                )) : <div className="rounded-2xl bg-slate-50 p-4 text-center text-[9px] font-bold uppercase italic text-slate-400">Tidak ada peluang lokal tersedia.</div>}
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Pelatihan Relevan</p>
                {recommendedTrainings.length > 0 ? recommendedTrainings.map((t) => (
                  <Link href={`/pelatihan/${t.slug || t.id}`} key={t.id} className="group block rounded-[2rem] border-2 border-slate-100 bg-white p-5 shadow-sm transition-all hover:border-emerald-600">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-black uppercase leading-tight text-slate-900 transition-colors group-hover:text-emerald-600">{t.title}</p>
                        <p className="text-[8px] font-bold uppercase text-slate-400">{t.partners?.name} | {t.location}</p>
                      </div>
                      <ArrowRight size={14} className="text-slate-200 transition-all group-hover:text-emerald-600" />
                    </div>
                  </Link>
                )) : <div className="rounded-2xl bg-slate-50 p-4 text-center text-[9px] font-bold uppercase italic text-slate-400">Tidak ada pelatihan relevan.</div>}
              </div>
            </div>
          </section>
        </div>
      );
    }
  };

  if (loading) return <div role="status" className="animate-pulse p-20 text-center font-black uppercase italic tracking-[0.2em] text-slate-400">Menyinkronkan Portal Karir...</div>;

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 selection:bg-blue-100">
      <div className="mx-auto max-w-6xl space-y-8 px-4 pt-8 text-left">
        
        {/* HEADER PROFILE (DATA NAMA & BIO) */}
        <header className="rounded-[3.5rem] border-2 border-slate-900 bg-white p-10 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)]">
           <div className="flex flex-col items-start gap-8 md:flex-row md:items-center">
            <div className="relative rounded-[2rem] border-2 border-slate-900 bg-white p-3">
              <QRCodeSVG value={`https://disabilitytalent.id/talent/${user?.id}`} size={80} />
            </div>
            <div className="flex-1 space-y-2">
              <h1 className="text-4xl font-black uppercase italic leading-none tracking-tighter text-slate-900">
                {profile?.full_name || "Nama Belum Lengkap"}
              </h1>
              <p className="max-w-xl text-sm font-bold italic leading-relaxed text-slate-500">
                {profile?.summary || "Silakan lengkapi profil singkat Anda untuk mempermudah HRD mengenal Anda."}
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <MapPin size={12} /> {profile?.city || "Lokasi Belum Diatur"}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <Briefcase size={12} /> {profile?.career_status || "Status Belum Diatur"}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-3">
               <div className="flex items-center gap-2">
                 <div className="h-3 w-32 overflow-hidden rounded-full bg-slate-100 border border-slate-200">
                    <div className="h-full bg-blue-600" style={{ width: `${completionData.percent}%` }}></div>
                 </div>
                 <span className="text-xl font-black italic text-slate-900">{completionData.percent}%</span>
               </div>
               <p className="text-[8px] font-black uppercase text-slate-400">Kelengkapan Profil</p>
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
                activeTab === m.id ? 'border-slate-900 bg-slate-900 text-white' : 'border-transparent bg-white shadow-sm hover:border-slate-200'
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
              <button onClick={() => setActiveTab("overview")} className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-slate-900">
                <ChevronLeft size={14} /> Kembali ke Ringkasan
              </button>
            )}
            {renderContent()}
          </div>
          
          <aside className="space-y-8">
            {/* PROFESSIONAL HUB */}
            <div className="rounded-[3rem] border-t-[12px] border-blue-600 bg-slate-900 p-8 text-white shadow-2xl">
              <h3 className="mb-6 text-[10px] font-black uppercase tracking-widest text-blue-400">Professional Hub</h3>
              <div className="space-y-3">
                <Link href={`/talent/${user.id}`} target="_blank" className="flex items-center justify-center gap-3 rounded-2xl border border-white/5 bg-white/10 p-4 text-[10px] font-black uppercase transition-all hover:bg-white/20">
                  <ExternalLink size={18} /> Lihat Profil Publik
                </Link>
                <button onClick={() => generateProfessionalCV(profile, workExps, certifications)} disabled={isProcessing} className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white p-4 text-[10px] font-black uppercase text-slate-900 shadow-lg transition-all hover:bg-blue-50">
                  <FileDown size={18} /> {isProcessing ? "Menyusun PDF..." : "Cetak CV Profesional"}
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => handleNativeShare(user.id, profile)} className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 p-4 text-[8px] font-black uppercase transition-all hover:bg-emerald-700">
                    <Share2 size={16} /> Share
                  </button>
                  <button onClick={() => handleWhatsAppShare(user.id, profile)} className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] p-4 text-[8px] font-black uppercase transition-all hover:opacity-90">
                    <MessageCircle size={16} /> WhatsApp
                  </button>
                </div>
              </div>
            </div>

            {/* QUICK STATS */}
            <div className="rounded-[3rem] border-2 border-slate-100 bg-white p-8">
              <h3 className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase italic text-slate-400"><LayoutDashboard size={14}/> Ringkasan Aktivitas</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-3xl font-black text-slate-900">{stats.jobs}</p>
                  <p className="text-[8px] font-black uppercase text-slate-400">Lamaran</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-3xl font-black text-slate-900">{stats.trainings}</p>
                  <p className="text-[8px] font-black uppercase text-slate-400">Pelatihan</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {selectedJobRating && (
        <InclusionRatingModal job={selectedJobRating} userId={user.id} onClose={() => setSelectedJobRating(null)} onSuccess={() => { setSelectedJobRating(null); fetchLatestData(); }} />
      )}
    </div>
  );
}