"use client";

import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Building2, Briefcase, Users, Star, 
  TrendingUp, AlertCircle, CheckCircle2, 
  LayoutDashboard, FileText, Settings, Search,
  ShieldCheck, LogOut, MapPin, Zap, ExternalLink, Share2,
  MessageSquare, Quote
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
  
  // ARIA Announcement untuk Screen Reader
  const [announcement, setAnnouncement] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (company?.id) {
      fetchDashboardData();
    }
  }, [company?.id]);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      // 1. Ambil data statistik & rating agregat
      const [statsData, ratingData] = await Promise.all([
        getCompanyStats(company.id),
        getCompanyRatingAggregate(company.id)
      ]);
      setStats(statsData);
      setRatings(ratingData);

      // 2. Ambil Feedback Anonim Terbaru
      const { data: reviews } = await supabase
        .from("inclusion_ratings")
        .select("comment_anonymous, created_at")
        .eq("company_id", company.id)
        .not("comment_anonymous", "is", null)
        .order("created_at", { ascending: false })
        .limit(3);
      setAnonReviews(reviews || []);

      // 3. Smart Insight: Trending Skills di Lokasi Perusahaan
      const { data: talentSkills } = await supabase
        .from("profiles")
        .select("skills")
        .eq("city", company.location || "Jakarta Selatan");
      
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

      // 4. Sinkronkan Data Profil Terbaru
      const { data: comp } = await supabase.from("companies").select("*").eq("id", company.id).single();
      if (comp) setCompany(comp);

    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleActionSuccess = (msg: string) => {
    setAnnouncement(msg);
    fetchDashboardData();
    setActiveTab("overview");
    setTimeout(() => setAnnouncement(""), 3000);
  };

  const handleShareCard = async () => {
    if (!cardRef.current || isProcessing) return;
    setIsProcessing(true);
    setAnnouncement(`{"Sedang memproses kartu inklusi..."}`);

    try {
      const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      const url = `https://disabilitas.com/company/${company.id}`;
      const caption = `{"Bangga! Instansi kami memiliki Indeks Inklusi "}${ratings?.totalAvg.toFixed(1) || "0.0"}{"/5.0. Cek profil kami: "}${url}{" #InklusiBisa"}`;

      if (blob && navigator.share) {
        const file = new File([blob], `{"Inclusion_Card_"}${company.name}.png`, { type: "image/png" });
        await navigator.share({ title: "Inclusion Identity Card", text: caption, files: [file] });
      } else {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(caption)}`, '_blank');
      }
    } catch (err) {
      console.error("Share failed", err);
    } finally {
      setIsProcessing(false);
    }
  };
  const gap = (() => {
    const total = company?.total_employees || 0;
    const dis = company?.total_employees_with_disability || 0;
    const mandateMin = Math.ceil(total * 0.01);
    return { 
      percent: total > 0 ? ((dis / total) * 100).toFixed(1) : "0.0", 
      need: mandateMin > dis ? mandateMin - dis : 0 
    };
  })();

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* 1. BRANDING ACTIONS */}
      <div className="flex flex-wrap gap-4">
        <a href={`/company/${company.id}`} target="_blank" className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-white border-2 border-slate-900 rounded-2xl font-black uppercase text-[10px] shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:bg-slate-50 transition-all">
          <ExternalLink size={18} /> {"Lihat Profil Publik"}
        </a>
        <button 
          onClick={handleShareCard} 
          disabled={isProcessing}
          className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-[4px_4px_0px_0px_rgba(5,150,105,0.3)] hover:bg-emerald-700 transition-all disabled:opacity-50"
        >
          <Share2 size={18} /> {isProcessing ? "Memproses..." : "Share Inclusion Card"}
        </button>
      </div>

      {/* 2. TRENDING INSIGHT & INDEX */}
      <div className="grid lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 bg-slate-900 rounded-[3rem] p-10 text-white border-2 border-slate-800 shadow-xl overflow-hidden relative">
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-2 bg-blue-600/20 text-blue-400 w-fit px-4 py-1 rounded-full border border-blue-600/30">
              <Zap size={14} fill="currentColor" />
              <p className="text-[9px] font-black uppercase tracking-widest">{"Trending Talent Insight"}</p>
            </div>
            <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">{"Talenta di Lokasi Anda"}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {trendingSkills.map((s, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                  <p className="text-[8px] font-black text-slate-400 uppercase mb-1">{s.skill}</p>
                  <p className="text-xl font-black text-blue-400">{s.count}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="bg-white p-10 rounded-[3rem] border-2 border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] flex flex-col justify-center text-center">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-2">{"Inclusion Index"}</p>
          <h3 className="text-6xl font-black text-slate-900">{ratings ? ratings.totalAvg.toFixed(1) : "0.0"}</h3>
          <div className="flex justify-center gap-1 mt-4">
            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={16} className={ratings?.totalAvg >= s ? "text-amber-500 fill-amber-500" : "text-slate-100"} />)}
          </div>
        </div>
      </div>

      {/* 3. QUICK STATS GRID */}
      <div className="grid md:grid-cols-4 gap-6">
        {[
          { label: "Lowongan", val: stats.jobCount, icon: Briefcase, color: "text-blue-600" },
          { label: "Pelamar", val: stats.applicantCount, icon: Users, color: "text-emerald-600" },
          { label: "Kuota 1%", val: `${gap.percent}%`, icon: ShieldCheck, color: "text-indigo-600" },
          { label: "Kekurangan", val: gap.need, icon: TrendingUp, color: "text-red-600" },
        ].map((item, idx) => (
          <div key={idx} className="bg-white p-6 rounded-[2rem] border-2 border-slate-100 shadow-sm flex items-center gap-5">
            <div className={`p-4 rounded-2xl bg-slate-50 ${item.color}`}><item.icon size={24} /></div>
            <div>
              <p className="text-[9px] font-black uppercase text-slate-400">{item.label}</p>
              <p className="text-2xl font-black text-slate-900">{item.val}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 4. FEEDBACK ANONIM TALENTA */}
      <section className="bg-white p-10 rounded-[3rem] border-2 border-slate-100 shadow-sm">
        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-3 mb-8">
          <MessageSquare className="text-blue-600" size={20} /> {"Feedback Anonim Talenta"}
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          {anonReviews.map((rev, i) => (
            <div key={i} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 relative">
              <Quote className="absolute top-4 right-4 text-slate-200" size={32} />
              <p className="text-xs italic text-slate-600 leading-relaxed mb-6">{"\""}{rev.comment_anonymous}{"\""}</p>
              <p className="text-[9px] font-black uppercase text-slate-400">{new Date(rev.created_at).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      </section>

      {/* --- HIDDEN INCLUSION CARD FOR SHARE RENDERING --- */}
      <div className="absolute -left-[9999px] top-0">
        <div ref={cardRef} className="w-[600px] h-[350px] bg-white p-10 flex flex-col justify-between border-[12px] border-slate-900 rounded-[3rem] font-sans">
          <div className="flex justify-between items-center border-b-4 border-blue-600 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black italic font-sans">{"D"}</div>
              <h2 className="text-xl font-black italic uppercase tracking-tighter text-blue-600">{"disabilitas.com"}</h2>
            </div>
            <span className="text-[9px] font-black bg-emerald-500 text-white px-4 py-1 rounded-full uppercase">{"Verified Partner"}</span>
          </div>
          <div className="flex-1 py-6 flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-2xl font-black uppercase text-slate-900">{company?.name || "Instansi"}</p>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{company?.industry || "Sektor Industri"}</p>
              <div className="mt-4 flex gap-6">
                <div><p className="text-[8px] font-black text-slate-400 uppercase">{"Inclusion Index"}</p><p className="text-xl font-black">{ratings?.totalAvg.toFixed(1) || "0.0"}</p></div>
                <div><p className="text-[8px] font-black text-slate-400 uppercase">{"Quota Progress"}</p><p className="text-xl font-black">{gap.percent}{"%"}</p></div>
              </div>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border-2 border-slate-100">
              <QRCodeSVG value={`https://disabilitas.com/company/${company?.id}`} size={80} />
            </div>
          </div>
          <div className="border-t-2 border-slate-100 pt-4 flex justify-between items-center">
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">{"Inclusion Identity Card — © 2026"}</p>
            <p className="text-[8px] font-bold italic text-blue-600">{"Powered by disabilitas.com"}</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-400 italic">{"MENYIAPKAN DASHBOARD..."}</div>;

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto px-4 pt-8 space-y-8">
        
        {/* LIVE ANNOUNCEMENT REGION */}
        <div className="sr-only" aria-live="polite" role="status">{announcement}</div>

        {/* NAVIGATION HEADER */}
        <header className="bg-white border-2 border-slate-900 p-8 rounded-[3rem] shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center text-white shrink-0"><Building2 size={36} /></div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black italic uppercase tracking-tighter">{company?.name}</h1>
                {company?.is_verified && <CheckCircle2 className="text-blue-600" size={20} />}
              </div>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{company?.industry}</p>
            </div>
          </div>
          <nav className="flex flex-wrap justify-center gap-2 p-2 bg-slate-50 rounded-[2.5rem] border border-slate-100">
            {[
              { id: "overview", label: "Overview", icon: LayoutDashboard },
              { id: "simulator", label: "Simulator", icon: Search },
              { id: "jobs", label: "Jobs", icon: FileText },
              { id: "applicants", label: "Applicants", icon: Users },
              { id: "profile", label: "Profile", icon: Settings },
              { id: "settings", label: "Account", icon: ShieldCheck },
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-xl scale-105' : 'text-slate-400 hover:text-slate-900'}`}>
                {<tab.icon size={16} />} {tab.label}
              </button>
            ))}
          </nav>
        </header>

        {/* MAIN DYNAMIC CONTENT */}
        <main className="min-h-[60vh]">
          {activeTab === "overview" && renderOverview()}
          {activeTab === "simulator" && <RecruitmentSimulator company={company} />}
          {activeTab === "jobs" && <JobManager company={company} onSuccess={() => handleActionSuccess(`{"Lowongan berhasil diterbitkan!"}`)} />}
          {activeTab === "applicants" && <ApplicantTracker company={company} />}
          {activeTab === "profile" && <ProfileEditor company={company} user={user} onSuccess={() => handleActionSuccess(`{"Profil instansi diperbarui!"}`)} />}
          {activeTab === "settings" && <AccountSettings user={user} onSuccess={() => handleActionSuccess(`{"Pengaturan akun disimpan!"}`)} />}
        </main>

        <footer className="pt-10 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center opacity-40">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{"© 2026 disabilitas.com — BRIN Research Complementary"}</p>
          <button onClick={() => supabase.auth.signOut()} className="flex items-center gap-2 text-[10px] font-black uppercase text-red-600 hover:underline"><LogOut size={14} /> {"Keluar"}</button>
        </footer>
      </div>
    </div>
  );
}
