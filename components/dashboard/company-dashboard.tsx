"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Building2, Briefcase, Users, Star, 
  TrendingUp, AlertCircle, CheckCircle2, 
  LayoutDashboard, FileText, Settings, Search,
  ShieldCheck, LogOut, MapPin, Zap, ExternalLink, Share2,
  MessageSquare, Quote, Accessibility
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";

// SINKRONISASI ACTIONS
import { getCompanyStats } from "@/lib/actions/company";
import { getCompanyRatingAggregate } from "@/lib/actions/ratings";

// IMPORT MODUL ANAK
import ProfileEditor from "./company/profile-editor";
import JobManager from "./company/job-manager";
import ApplicantTracker from "./company/applicant-tracker";
import RecruitmentSimulator from "./company/recruitment-simulator";
import AccountSettings from "./company/account-settings";

export default function CompanyDashboard({ user, company: initialCompany }: { user: any, company: any }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [company, setCompany] = useState(initialCompany);
  const [stats, setStats] = useState({ jobCount: 0, applicantCount: 0 });
  const [ratings, setRatings] = useState<any>(null);
  const [anonReviews, setAnonReviews] = useState<any[]>([]);
  const [trendingSkills, setTrendingSkills] = useState<{skill: string, count: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [announcement, setAnnouncement] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (user?.id) fetchDashboardData();
  }, [user?.id]);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      const targetId = user?.id;
      if (!targetId) return;

      // 1. Ambil Profil Terbaru (Direct Database Sync)
      const { data: latestComp } = await supabase
        .from("companies")
        .select("*")
        .eq("id", targetId)
        .single();

      if (latestComp) setCompany(latestComp);

      // 2. Ambil Statistik & Rating
      const [statsData, ratingData] = await Promise.all([
        getCompanyStats(targetId),
        getCompanyRatingAggregate(targetId)
      ]);
      setStats(statsData || { jobCount: 0, applicantCount: 0 });
      setRatings(ratingData);

      // 3. Feedback Anonim
      const { data: reviews } = await supabase
        .from("inclusion_ratings")
        .select("comment_anonymous, created_at")
        .eq("company_id", targetId)
        .not("comment_anonymous", "is", null)
        .order("created_at", { ascending: false })
        .limit(3);
      setAnonReviews(reviews || []);

      // 4. Insight Talenta Sekitar
      const { data: talentSkills } = await supabase
        .from("profiles")
        .select("skills")
        .eq("city", latestComp?.location || "Jakarta Selatan");
      
      if (talentSkills) {
        const skillCounts: Record<string, number> = {};
        talentSkills.forEach(t => {
          t.skills?.forEach((s: string) => {
            skillCounts[s] = (skillCounts[s] || 0) + 1;
          });
        });
        const sorted = Object.entries(skillCounts)
          .map(([skill, count]) => ({ skill, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 3);
        setTrendingSkills(sorted);
      }
    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleActionSuccess = async (msg: string) => {
    setAnnouncement(msg);
    setTimeout(async () => {
      await fetchDashboardData();
      setActiveTab("overview");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 300);
  };
  // --- LOGIKA PROGRESS KELENGKAPAN PROFIL (UNTUK DATA RISET) ---
  const calculateCompletion = () => {
    if (!company || company.is_placeholder) return { score: 0, missing: ["Profil Belum Dibuat"] };
    
    const checklist = [
      { key: 'name', label: 'Nama Instansi', weight: 20 },
      { key: 'industry', label: 'Sektor Industri', weight: 15 },
      { key: 'category', label: 'Kategori Instansi', weight: 15 },
      { key: 'location', label: 'Lokasi/Kota', weight: 15 },
      { key: 'description', label: 'Deskripsi/Visi Inklusi', weight: 15 },
      { key: 'master_accommodations_provided', label: 'Data Akomodasi Master', weight: 20 }
    ];

    let score = 0;
    let missing: string[] = [];

    checklist.forEach(item => {
      const value = company[item.key];
      const isEmpty = !value || (Array.isArray(value) && value.length === 0) || value === "";
      
      if (!isEmpty) {
        score += item.weight;
      } else {
        missing.push(item.label);
      }
    });

    return { score, missing };
  };

  // SINKRONISASI DATABASE: Ambil skor langsung dari kolom database Mas
  const accScore = company?.inclusion_score || 0;
  const { score: completionScore, missing: missingItems } = calculateCompletion();

  const gap = (() => {
    const total = company?.total_employees || 0;
    const dis = company?.total_employees_with_disability || 0;
    const mandateMin = Math.ceil(total * 0.01);
    return { 
      percent: total > 0 ? ((dis / total) * 100).toFixed(1) : "0.0", 
      need: mandateMin > dis ? mandateMin - dis : 0 
    };
  })();

  const handleShareCard = async () => {
    if (!cardRef.current || isProcessing) return;
    setIsProcessing(true);
    setAnnouncement("Sedang memproses kartu inklusi...");

    try {
      const canvas = await html2canvas(cardRef.current, { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: "#ffffff",
        logging: false 
      });
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      
      const url = `https://disabilitas.com/perusahaan/${company?.id}`;
      const score = ratings?.totalAvg ? ratings.totalAvg.toFixed(1) : "0.0";
      const caption = `Bangga! Instansi kami memiliki Indeks Inklusi ${score}/5.0. Cek profil kami: ${url} #InklusiBisa #DisabilitasBisaWork`;

      if (blob && navigator.share) {
        const file = new File([blob], `Inclusion_Card_${company?.name || 'Instansi'}.png`, { type: "image/png" });
        await navigator.share({ title: "Inclusion Identity Card", text: caption, files: [file] });
      } else {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(caption)}`, '_blank');
      }
    } catch (err) {
      console.error("Share failed", err);
      setAnnouncement("Gagal memproses gambar.");
    } finally {
      setIsProcessing(false);
    }
  };

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. PROGRESS WIDGETS (PROFIL & AKSESIBILITAS) */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Widget Kelengkapan Profil */}
        <section className="bg-amber-50 border-2 border-amber-900/10 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-amber-100" />
                <circle cx="40" cy="40" r="35" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={219.9} strokeDashoffset={219.9 - (219.9 * completionScore) / 100} className="text-amber-600 transition-all duration-1000" />
              </svg>
              <span className="absolute font-black text-amber-900 text-sm">{completionScore}%</span>
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase text-amber-900 tracking-widest">{"Kelengkapan Profil"}</h3>
              <p className="text-[9px] font-bold text-amber-800/60 uppercase mt-1">{"Data riset instansi"}</p>
              {completionScore < 100 && (
                <button onClick={() => setActiveTab("profile")} className="mt-3 text-[9px] font-black text-amber-700 underline uppercase">{"Lengkapi Data"}</button>
              )}
            </div>
          </div>
        </section>

        {/* Widget Accessibility Score (AMBIL DARI DATABASE) */}
        <section className="bg-blue-50 border-2 border-blue-900/10 rounded-[2.5rem] p-8 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-white rounded-3xl border-2 border-blue-100 text-blue-600">
              <Accessibility size={32} />
            </div>
            <div>
              <h3 className="text-[10px] font-black uppercase text-blue-900 tracking-widest">{"Accessibility Score"}</h3>
              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-black text-blue-600">{accScore}</p>
                <p className="text-[9px] font-bold text-blue-400 uppercase">{"/ 100 Points"}</p>
              </div>
              <p className="text-[8px] font-bold text-blue-800/40 uppercase tracking-tighter mt-1">{"Skor Otomatis dari Database"}</p>
            </div>
          </div>
        </section>
      </div>

      {/* 2. ACTION BUTTONS */}
      <div className="flex flex-wrap gap-4">
        <a href={`/perusahaan/${company?.id}`} target="_blank" className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-white border-2 border-slate-900 rounded-2xl font-black uppercase text-[10px] shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:bg-slate-50 transition-all">
          <ExternalLink size={18} /> {"Lihat Profil Publik"}
        </a>
        <button onClick={handleShareCard} disabled={isProcessing || !company?.id} className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-[4px_4px_0px_0px_rgba(5,150,105,0.3)] hover:bg-emerald-700 transition-all">
          <Share2 size={18} /> {isProcessing ? "Memproses..." : "Share Inclusion Card"}
        </button>
      </div>
      {/* 3. TRENDING & RATING INDEX */}
      <div className="grid lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 bg-slate-900 rounded-[3rem] p-10 text-white border-2 border-slate-800 shadow-xl overflow-hidden relative">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-2 bg-blue-600/20 text-blue-400 w-fit px-4 py-1 rounded-full border border-blue-600/30">
              <Zap size={14} fill="currentColor" />
              <p className="text-[9px] font-black uppercase tracking-widest">{"Trending Talent Insight"}</p>
            </div>
            <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">{"Talenta di Lokasi Anda"}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {trendingSkills.length > 0 ? trendingSkills.map((s, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1">{s.skill}</p>
                  <p className="text-xl font-black text-blue-400">{s.count}</p>
                </div>
              )) : (
                <p className="text-[10px] text-slate-500 italic">{"Mencari data talenta sekitar..."}</p>
              )}
            </div>
          </div>
        </section>

        <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] text-center flex flex-col justify-center">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-2">{"Inclusion Index"}</p>
          <h3 className="text-6xl font-black text-slate-900">{ratings ? ratings.totalAvg.toFixed(1) : "0.0"}</h3>
          <div className="flex justify-center gap-1 mt-4">
            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} className={ratings?.totalAvg >= s ? "text-amber-500 fill-amber-500" : "text-slate-100"} />)}
          </div>
        </div>
      </div>

      {/* 4. STATS GRID & LOGIKA KUOTA INKLUSIF (1% MANDATE) */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-sm flex items-center gap-5">
          <div className="p-4 rounded-2xl bg-blue-50 text-blue-600"><Briefcase size={24} /></div>
          <div>
            <p className="text-[9px] font-black uppercase text-slate-400">{"Lowongan"}</p>
            <p className="text-2xl font-black text-slate-900">{stats.jobCount}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-sm flex items-center gap-5">
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-600"><Users size={24} /></div>
          <div>
            <p className="text-[9px] font-black uppercase text-slate-400">{"Pelamar"}</p>
            <p className="text-2xl font-black text-slate-900">{stats.applicantCount}</p>
          </div>
        </div>

        {/* LOGIKA KUOTA 1% YANG DIPERBAIKI */}
        <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-sm flex items-center gap-5 md:col-span-2">
          <div className={`p-4 rounded-2xl ${gap.need <= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
            {gap.need <= 0 ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
          </div>
          <div className="flex-1">
            <p className="text-[9px] font-black uppercase text-slate-400">{"Status Kuota Inklusi (Min. 1%)"}</p>
            <div className="flex items-center justify-between">
              <p className="text-xl font-black text-slate-900">
                {gap.need <= 0 ? "Sudah Terpenuhi" : `Butuh ${gap.need} Talenta Lagi`}
              </p>
              <span className="text-[9px] font-bold px-3 py-1 bg-slate-100 rounded-full text-slate-600 uppercase">
                {gap.percent}% Disabilitas
              </span>
            </div>
            <p className="text-[8px] font-bold text-slate-400 mt-1 italic uppercase tracking-tighter">
              {gap.need <= 0 
                ? "Bagus! Teruskan rekrutmen melampaui batas minimum untuk inklusivitas total." 
                : "Ayo capai ambang batas 1% sebagai langkah awal kepatuhan inklusi."}
            </p>
          </div>
        </div>
      </div>

      {/* HIDDEN INCLUSION CARD - HANYA UNTUK GENERATE GAMBAR SHARE */}
      <div className="fixed -top-[9999px] -left-[9999px] opacity-0 pointer-events-none" aria-hidden="true">
        <div ref={cardRef} className="w-[800px] h-[450px] bg-white p-12 flex flex-col justify-between border-[16px] border-slate-900 rounded-[4rem] font-sans">
          <div className="flex justify-between items-center border-b-4 border-blue-600 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white text-xl font-black italic">{"D"}</div>
              <h2 className="text-2xl font-black italic uppercase tracking-tighter text-blue-600">{"disabilitas.com"}</h2>
            </div>
            <div className="flex gap-4 items-center">
              <span className="text-[10px] font-black bg-blue-600 text-white px-5 py-1.5 rounded-full uppercase">{"Acc. Score: "}{accScore}</span>
              <span className="text-[10px] font-black bg-emerald-500 text-white px-5 py-1.5 rounded-full uppercase">{"Verified Partner"}</span>
            </div>
          </div>
          <div className="flex-1 py-10 flex justify-between items-center">
            <div className="space-y-2">
              <p className="text-4xl font-black uppercase text-slate-900 tracking-tighter leading-none">{company?.name || "Instansi"}</p>
              <p className="text-sm font-bold text-blue-600 uppercase tracking-[0.2em]">{company?.industry || "Sektor Industri"}</p>
              <div className="mt-8 flex gap-10">
                <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{"Inclusion Index"}</p><p className="text-3xl font-black">{ratings?.totalAvg.toFixed(1) || "0.0"}</p></div>
                <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{"Quota Status"}</p><p className="text-3xl font-black">{gap.percent}{"%"}</p></div>
              </div>
            </div>
            <div className="bg-slate-50 p-5 rounded-[2rem] border-4 border-slate-100 shadow-sm">
              {company?.id && <QRCodeSVG value={`https://disabilitas.com/perusahaan/${company.id}`} size={120} />}
            </div>
          </div>
          <div className="border-t-2 border-slate-100 pt-6 flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest">
            <p>{"Inclusion Identity Card — © 2026"}</p>
            <p className="italic text-blue-600">{"#InklusiBisa #DisabilitasBisaWork"}</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div className="p-20 text-center flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="font-black animate-pulse text-slate-400 italic text-[10px] tracking-widest uppercase">{"MENGHUBUNGKAN DATA RISET..."}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto px-4 pt-8 space-y-8">
        <div className="sr-only" aria-live="polite" role="status">{announcement}</div>

        <header className="bg-white border-2 border-slate-900 p-8 rounded-[3rem] shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center text-white shrink-0 shadow-lg"><Building2 size={36} /></div>
            <div>
              <div className="flex items-center gap-3">
                <h1 ref={headerRef} tabIndex={-1} className="text-2xl font-black italic uppercase tracking-tighter focus:outline-none">
                  {company?.name || "Instansi Baru"}
                </h1>
                {company?.is_verified && <CheckCircle2 className="text-blue-600" size={20} />}
              </div>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{company?.industry || "Menunggu Data Profil"}</p>
            </div>
          </div>
          <nav className="flex flex-wrap justify-center gap-2 p-2 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-inner">
            {[
              { id: "overview", label: "Overview", icon: LayoutDashboard },
              { id: "simulator", label: "Simulator", icon: Search },
              { id: "jobs", label: "Jobs", icon: FileText },
              { id: "applicants", label: "Applicants", icon: Users },
              { id: "profile", label: "Profile", icon: Settings },
              { id: "settings", label: "Account", icon: ShieldCheck },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-xl scale-105' : 'text-slate-400 hover:text-slate-900 hover:bg-white'}`}>
                {<tab.icon size={16} />} {tab.label}
              </button>
            ))}
          </nav>
        </header>

        <main className="min-h-[70vh]">
          {activeTab === "overview" && renderOverview()}
          {activeTab === "simulator" && <RecruitmentSimulator company={company} />}
          {activeTab === "jobs" && <JobManager company={company} onSuccess={() => handleActionSuccess(`{"Lowongan diperbarui!"}`)} />}
          {activeTab === "applicants" && <ApplicantTracker company={company} />}
          {activeTab === "profile" && <ProfileEditor company={company} user={user} onSuccess={() => handleActionSuccess(`{"Profil diperbarui!"}`)} />}
          {activeTab === "settings" && <AccountSettings user={user} onSuccess={() => handleActionSuccess(`{"Akun diperbarui!"}`)} />}
        </main>
      </div>
    </div>
  );
}
