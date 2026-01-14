"use client";

import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { 
  User, MapPin, Briefcase, GraduationCap, FileDown, BookOpen, Laptop, 
  ArrowRight, AlertCircle, CheckCircle2, Search, ChevronLeft, 
  LayoutDashboard, Share2, ExternalLink, ShieldCheck, Clock, Timer, MessageCircle, Zap
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

  // --- LOGIKA PROGRESS & ITEM BELUM TERISI (AKSESIBEL) ---
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
    if (sessionStorage.getItem("pindahkan_fokus_ke_h1") === "true") {
      const heading = document.querySelector("h1");
      if (heading) {
        heading.setAttribute("tabIndex", "-1");
        heading.focus();
      }
      sessionStorage.removeItem("pindahkan_fokus_ke_h1");
    }
    if (autoOpenProfile) setActiveTab("identity");
    if (user?.id) fetchLatestData();
  }, [user?.id, autoOpenProfile]);

  async function fetchLatestData() {
    try {
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      if (prof) {
        setProfile({ ...prof });

        // --- SMART MATCH v2.2 (Hanya yang belum expired) ---
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
        supabase.from("certifications").select("*").eq("profile_id", user.id).order('year', { ascending: false }),
        supabase.from("applications").select("*, jobs(title, companies(name))").eq("applicant_id", user.id),
        supabase.from("trainees").select("*, trainings(title, partners(name))").eq("profile_id", user.id)
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
    finally { setLoading(false); }
  }

  const handleModuleSuccess = () => {
    fetchLatestData();
    setActiveTab("overview");
    window.scrollTo({ top: 0, behavior: "smooth" });
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
          {/* PROFILE SUMMARY */}
          <section className="relative overflow-hidden rounded-[3rem] border-2 border-slate-900 bg-white p-10 shadow-sm text-left">
            <div className="flex flex-col items-start gap-8 md:flex-row">
              <div className="flex size-20 shrink-0 items-center justify-center rounded-3xl bg-blue-600 text-3xl font-black italic text-white shadow-xl">{profile?.full_name?.charAt(0) || "T"}</div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900">{profile?.full_name || "Lengkapi Profil"}</h2>
                  {completionData.percent === 100 && <CheckCircle2 className="text-emerald-500" size={24} />}
                </div>
                <p className="text-sm font-bold uppercase tracking-widest text-blue-600 italic">{profile?.disability_type || "Ragam Belum Diisi"}</p>
                <div className="flex flex-wrap gap-6 pt-4 text-[10px] font-black uppercase text-slate-400">
                  <span className="flex items-center gap-2"><MapPin size={14} className="text-blue-600"/> {profile?.city || "N/A"}</span>
                  <span className="flex items-center gap-2"><Briefcase size={14} className="text-blue-600"/> {profile?.career_status || "Job Seeker"}</span>
                </div>
              </div>
            </div>
          </section>

          {/* TRACKING GRID */}
          <div className="grid gap-8 md:grid-cols-2 text-left">
            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-900"><Briefcase size={16} className="text-blue-600" /> Tracking Lamaran</h3>
              <div className="min-h-[220px] rounded-[2.5rem] border-2 border-slate-100 bg-white overflow-hidden">
                {appliedJobs.length > 0 ? (
                  <div className="divide-y divide-slate-50">
                    {appliedJobs.map((app) => (
                      <div key={app.id} className="flex items-center justify-between p-5 hover:bg-slate-50">
                        <div>
                          <p className="text-xs font-black uppercase text-slate-900">{app.jobs?.title}</p>
                          <p className="text-[9px] font-bold uppercase text-slate-400">{app.jobs?.companies?.name}</p>
                        </div>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-[8px] font-black uppercase text-blue-600">{app.status}</span>
                      </div>
                    ))}
                  </div>
                ) : <div className="p-10 text-center text-[10px] font-bold uppercase italic text-slate-300">Belum ada lamaran terkirim.</div>}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-900"><BookOpen size={16} className="text-emerald-600" /> Tracking Pelatihan</h3>
              <div className="min-h-[220px] rounded-[2.5rem] border-2 border-slate-100 bg-white overflow-hidden">
                {appliedTrainings.length > 0 ? (
                  <div className="divide-y divide-slate-50">
                    {appliedTrainings.map((reg) => (
                      <div key={reg.id} className="flex items-center justify-between p-5 hover:bg-slate-50">
                        <div>
                          <p className="text-xs font-black uppercase text-slate-900">{reg.trainings?.title}</p>
                          <p className="text-[9px] font-bold uppercase text-slate-400">{reg.trainings?.partners?.name}</p>
                        </div>
                        <span className="rounded-full bg-emerald-50 px-3 py-1 text-[8px] font-black uppercase text-emerald-600">{reg.status}</span>
                      </div>
                    ))}
                  </div>
                ) : <div className="p-10 text-center text-[10px] font-bold uppercase italic text-slate-300">Belum ada pelatihan diikuti.</div>}
              </div>
            </div>
          </div>

          {/* SMART MATCH */}
          <section className="space-y-6 border-t-2 border-slate-50 pt-10 text-left">
            <h3 className="flex items-center gap-2 text-xs font-black uppercase italic tracking-widest text-slate-900"><Search size={16} className="text-blue-600" /> Rekomendasi Pintar</h3>
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-slate-400">Lowongan Pekerjaan</p>
                {recommendedJobs.map((j) => (
                  <Link href={`/lowongan/${j.slug || j.id}`} key={j.id} className="group block rounded-[2rem] border-2 border-slate-100 bg-white p-5 hover:border-blue-600 transition-all shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-black uppercase text-slate-900 group-hover:text-blue-600 leading-tight">{j.title}</p>
                        <p className="text-[8px] font-bold uppercase text-slate-400">{j.companies?.name} | {j.location}</p>
                      </div>
                      <ArrowRight size={14} className="text-slate-200 group-hover:text-blue-600" />
                    </div>
                  </Link>
                ))}
              </div>
              <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-slate-400">Program Pelatihan</p>
                {recommendedTrainings.map((t) => (
                  <Link href={`/pelatihan/${t.slug || t.id}`} key={t.id} className="group block rounded-[2rem] border-2 border-slate-100 bg-white p-5 hover:border-emerald-600 transition-all shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-black uppercase text-slate-900 group-hover:text-emerald-600 leading-tight">{t.title}</p>
                        <p className="text-[8px] font-bold uppercase text-slate-400">{t.partners?.name} | {t.location}</p>
                      </div>
                      <ArrowRight size={14} className="text-slate-200 group-hover:text-emerald-600" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        </div>
      );
    }
  };

  if (loading) return <div className="p-20 text-center font-black italic tracking-widest text-slate-400 animate-pulse">SINKRONISASI DATA...</div>;

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 font-sans selection:bg-blue-100">
      <div className="mx-auto max-w-6xl space-y-8 px-4 pt-8">
        
        {/* HEADER PROGRESS (AKSESIBEL TOTAL) */}
        <section className="rounded-[3.5rem] border-2 border-slate-900 bg-white p-10 shadow-[10px_10px_0px_0px_rgba(15,23,42,1)]">
          <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="text-left space-y-1">
              <h1 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900">Talent Dashboard</h1>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 italic">Pusat Karir & Pengembangan Kompetensi</p>
            </div>
            <div className="flex w-full items-center gap-4 md:w-auto">
              <div className="h-4 flex-1 overflow-hidden rounded-full border border-slate-200 bg-slate-100 md:w-64" role="progressbar" aria-valuenow={completionData.percent} aria-valuemin={0} aria-valuemax={100}>
                <div className={`h-full transition-all duration-1000 ${completionData.percent === 100 ? 'bg-emerald-500' : 'bg-blue-600'}`} style={{ width: `${completionData.percent}%` }}></div>
              </div>
              <span className="text-3xl font-black italic text-slate-900" aria-live="polite">{`${completionData.percent}%`}</span>
            </div>
          </div>

          {/* LIST ITEM BELUM TERISI (Aksesibilitas Tinggi) */}
          {activeTab === "overview" && completionData.missing.length > 0 && (
            <div className="mt-8 rounded-3xl border-2 border-amber-100 bg-amber-50/50 p-8 text-left" aria-live="polite">
              <h2 className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-700">
                <AlertCircle size={14} /> Data Yang Perlu Dilengkapi:
              </h2>
              <ul className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                {completionData.missing.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-500">
                    <span className="size-1.5 rounded-full bg-amber-400"></span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === "overview" && (
            <nav className="mt-10 grid grid-cols-2 gap-4 border-t border-slate-100 pt-10 md:grid-cols-6">
              {[
                { label: "Identitas", id: "identity", icon: User },
                { label: "Sarana", id: "tech", icon: Laptop },
                { label: "Karir", id: "career", icon: Briefcase },
                { label: "Akademik", id: "academic", icon: GraduationCap },
                { label: "Skill", id: "skills", icon: BookOpen },
                { label: "Akun", id: "settings", icon: ShieldCheck }
              ].map((m) => (
                <button key={m.id} onClick={() => setActiveTab(m.id)} aria-label={`Buka modul ${m.label}`} className="group rounded-3xl border-2 border-transparent bg-slate-50 p-5 text-center transition-all hover:border-blue-600 hover:bg-white shadow-sm hover:shadow-md">
                  <m.icon className="mx-auto mb-2 text-slate-400 group-hover:text-blue-600 transition-colors" size={24} />
                  <p className="text-[10px] font-black uppercase text-slate-900">{m.label}</p>
                </button>
              ))}
            </nav>
          )}

          {activeTab !== "overview" && (
            <button onClick={() => setActiveTab("overview")} aria-label="Kembali ke overview dashboard" className="mt-8 flex items-center gap-2 text-xs font-black uppercase text-blue-600 hover:gap-3 transition-all">
              <ChevronLeft size={16}/> Kembali ke Dashboard
            </button>
          )}
        </section>

        <div className="grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">{renderContent()}</div>
          
          <aside className="space-y-8 text-left">
            {/* AKSI PROFESIONAL */}
            <div className="rounded-[3rem] bg-slate-900 p-8 text-white shadow-2xl border-t-[12px] border-blue-600">
              <h3 className="mb-6 text-[10px] font-black uppercase tracking-widest text-blue-400">Professional Hub</h3>
              <div className="space-y-3">
                <Link href={`/talent/${user.id}`} target="_blank" className="flex items-center justify-center gap-3 rounded-2xl bg-white/10 p-4 text-[10px] font-black uppercase hover:bg-white/20 transition-all border border-white/5">
                  <ExternalLink size={18} /> Lihat Profil Publik
                </Link>
                <button onClick={() => generateProfessionalCV(profile, workExps, certifications)} disabled={isProcessing} className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white p-4 text-[10px] font-black uppercase text-slate-900 hover:bg-blue-50 transition-all shadow-lg">
                  <FileDown size={18} /> {isProcessing ? "Menyusun PDF..." : "Cetak CV Profesional"}
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => handleNativeShare(user.id, profile)} className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 p-4 text-[8px] font-black uppercase hover:bg-emerald-700 transition-all">
                    <Share2 size={16} /> Native Share
                  </button>
                  <button onClick={() => handleWhatsAppShare(user.id, profile)} className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] p-4 text-[8px] font-black uppercase hover:opacity-90 transition-all">
                    <MessageCircle size={16} /> WhatsApp
                  </button>
                </div>
              </div>
            </div>

            {/* RINGKASAN RISET */}
            <div className="rounded-[3rem] border-2 border-slate-200 bg-white p-8 shadow-sm">
              <h3 className="mb-6 flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 italic tracking-widest"><LayoutDashboard size={14}/> Ringkasan Aktivitas</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-3xl font-black text-slate-900 leading-none">{stats.jobs}</p>
                  <p className="mt-2 text-[8px] font-black text-slate-400 uppercase italic">Lamaran</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100">
                  <p className="text-3xl font-black text-slate-900 leading-none">{stats.trainings}</p>
                  <p className="mt-2 text-[8px] font-black text-slate-400 uppercase italic">Pelatihan</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* HIDDEN CAPTURE AREA */}
      <div className="pointer-events-none absolute -z-50 overflow-hidden opacity-0" aria-hidden="true">
         <div id="inclusion-card-capture" className="flex h-[400px] w-[700px] flex-col justify-between border-[16px] border-slate-900 bg-white p-12 text-slate-900">
            <div className="flex items-center justify-between border-b-4 border-blue-600 pb-6 text-left">
               <h2 className="text-3xl font-black uppercase italic tracking-tighter text-blue-600 leading-none">disabilitas.com</h2>
               <span className="rounded-full bg-blue-600 px-6 py-2 text-xs font-black uppercase text-white shadow-lg">Verified Talent</span>
            </div>
            <div className="flex flex-1 items-center gap-10 py-8 text-left">
               <div className="flex size-32 shrink-0 items-center justify-center rounded-3xl bg-slate-900 text-5xl font-black italic text-white shadow-2xl">{profile?.full_name?.charAt(0)}</div>
               <div className="space-y-2">
                  <p className="text-4xl font-black uppercase italic tracking-tighter leading-none">{profile?.full_name}</p>
                  <p className="text-xl font-bold uppercase tracking-widest text-blue-600">{profile?.disability_type || 'Profesional Inklusif'}</p>
                  <div className="flex items-center gap-4 text-[10px] font-black uppercase text-slate-400 italic">
                     <span>{profile?.city || 'Lokasi N/A'}</span>
                     <span className="size-2 rounded-full bg-slate-200"></span>
                     <span>{profile?.education_level || 'Pendidikan N/A'}</span>
                  </div>
               </div>
            </div>
            <div className="flex items-end justify-between border-t-2 border-slate-100 pt-6 text-left">
               <div className="space-y-1">
                  <p className="text-[11px] font-black uppercase leading-none">Inclusion Identity Card 2026</p>
                  <p className="max-w-[300px] text-[8px] font-bold uppercase text-slate-400 leading-tight">Terdaftar dalam ekosistem pemberdayaan karir inklusif disabilitas.com</p>
               </div>
               <div className="rounded-2xl border-4 border-slate-900 p-2 shadow-xl bg-white"><QRCodeSVG value={`https://disabilitas.com/talent/${user.id}`} size={70} /></div>
            </div>
         </div>
      </div>

      {selectedJobRating && (
        <InclusionRatingModal job={selectedJobRating} userId={user.id} onClose={() => setSelectedJobRating(null)} onSuccess={() => { setSelectedJobRating(null); fetchLatestData(); }} />
      )}
    </div>
  );
}