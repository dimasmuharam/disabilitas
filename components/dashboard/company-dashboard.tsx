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
  
  // ARIA Announcement & Fokus untuk Screen Reader
  const [announcement, setAnnouncement] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    fetchDashboardData();
  }, [company?.id]);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      if (!company?.id || company?.is_placeholder) {
        setLoading(false);
        return;
      }

      const [statsData, ratingData] = await Promise.all([
        getCompanyStats(company.id),
        getCompanyRatingAggregate(company.id)
      ]);
      setStats(statsData || { jobCount: 0, applicantCount: 0 });
      setRatings(ratingData);

      const { data: reviews } = await supabase
        .from("inclusion_ratings")
        .select("comment_anonymous, created_at")
        .eq("company_id", company.id)
        .not("comment_anonymous", "is", null)
        .order("created_at", { ascending: false })
        .limit(3);
      setAnonReviews(reviews || []);

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

      const { data: comp } = await supabase.from("companies").select("*").eq("id", company.id).single();
      if (comp) setCompany(comp);

    } catch (error) {
      console.error("Dashboard Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleActionSuccess = async (msg: string) => {
    setAnnouncement(msg);
    await fetchDashboardData();
    setActiveTab("overview");
    
    // AKSESIBILITAS: Scroll ke atas dan pindahkan fokus
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      headerRef.current?.focus();
      setAnnouncement("");
    }, 500);
  };

  const handleShareCard = async () => {
    if (!cardRef.current || isProcessing) return;
    setIsProcessing(true);
    setAnnouncement(`{"Sedang memproses kartu inklusi..."}`);

    try {
      const canvas = await html2canvas(cardRef.current, { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: "#ffffff",
        logging: false 
      });
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      
      // PERBAIKAN: Gunakan rute /perusahaan/
      const url = `https://disabilitas.com/perusahaan/${company?.id}`;
      const score = ratings?.totalAvg ? ratings.totalAvg.toFixed(1) : "0.0";
      const caption = `{"Bangga! Instansi kami memiliki Indeks Inklusi "}${score}{"/5.0. Cek profil kami: "}${url}{" #InklusiBisa #DisabilitasBisaWork"}`;

      if (blob && navigator.share) {
        const file = new File([blob], `{"Inclusion_Card_"}${company?.name || 'Instansi'}.png`, { type: "image/png" });
        await navigator.share({ title: "Inclusion Identity Card", text: caption, files: [file] });
      } else {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(caption)}`, '_blank');
      }
    } catch (err) {
      console.error("Share failed", err);
      setAnnouncement(`{"Gagal memproses gambar. Silakan coba lagi."}`);
    } finally {
      setIsProcessing(false);
    }
  };
  // --- KODE BARU: LOGIKA PROGRESS KELENGKAPAN (SINKRON DATA-STATIC) ---
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

  const renderOverview = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* WIDGET PROGRESS KELENGKAPAN */}
      {completionScore < 100 && (
        <section className="bg-amber-50 border-2 border-amber-900/10 rounded-[2.5rem] p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-amber-100" />
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={251.2} strokeDashoffset={251.2 - (251.2 * completionScore) / 100} className="text-amber-600 transition-all duration-1000" />
              </svg>
              <span className="absolute font-black text-amber-900 text-lg">{completionScore}%</span>
            </div>
            <div className="flex-1 space-y-3">
              <h3 className="text-sm font-black uppercase text-amber-900 tracking-tight">{"Lengkapi Profil Inklusi Instansi"}</h3>
              <div className="flex flex-wrap gap-2">
                {missingItems.map((item, idx) => (
                  <span key={idx} className="px-3 py-1 bg-white border border-amber-200 rounded-full text-[8px] font-black uppercase text-amber-700">{"✕ "}{item}</span>
                ))}
              </div>
            </div>
            <button onClick={() => setActiveTab("profile")} className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] shadow-xl hover:scale-105 transition-all">{"Lengkapi Sekarang"}</button>
          </div>
        </section>
      )}

      {/* ACTION BUTTONS (FIXED ROUTE) */}
      <div className="flex flex-wrap gap-4">
        <a href={`/perusahaan/${company?.id}`} target="_blank" className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-white border-2 border-slate-900 rounded-2xl font-black uppercase text-[10px] shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:bg-slate-50 transition-all">
          <ExternalLink size={18} /> {"Lihat Profil Publik"}
        </a>
        <button onClick={handleShareCard} disabled={isProcessing || !company?.id} className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] shadow-[4px_4px_0px_0px_rgba(5,150,105,0.3)] hover:bg-emerald-700 transition-all disabled:opacity-50">
          <Share2 size={18} /> {isProcessing ? "Memproses..." : "Share Inclusion Card"}
        </button>
      </div>

      {/* STATS GRID */}
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

      {/* FEEDBACK & CARD RENDERING (HIDDEN) */}
      <div className="absolute -left-[9999px] top-0">
        <div ref={cardRef} className="w-[600px] h-[350px] bg-white p-10 flex flex-col justify-between border-[12px] border-slate-900 rounded-[3rem] font-sans">
          <div className="flex justify-between items-center border-b-4 border-blue-600 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black italic">{"D"}</div>
              <h2 className="text-xl font-black italic uppercase tracking-tighter text-blue-600">{"disabilitas.com"}</h2>
            </div>
          </div>
          <div className="flex-1 py-6 flex justify-between items-center">
            <div className="space-y-1">
              <p className="text-2xl font-black uppercase text-slate-900">{company?.name || "Instansi"}</p>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">{company?.industry || "Inklusi"}</p>
            </div>
            <div className="bg-slate-50 p-3 rounded-2xl border-2 border-slate-100">
              {company?.id && <QRCodeSVG value={`https://disabilitas.com/perusahaan/${company.id}`} size={80} />}
            </div>
          </div>
          <p className="text-[8px] font-black uppercase text-slate-400">{"Inclusion Identity Card — © 2026 Powered by disabilitas.com"}</p>
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div className="p-20 text-center flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="font-black animate-pulse text-slate-400 italic text-[10px] tracking-widest uppercase">{"MENYIAPKAN DASHBOARD..."}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto px-4 pt-8 space-y-8">
        <div className="sr-only" aria-live="polite" role="status">{announcement}</div>

        <header className="bg-white border-2 border-slate-900 p-8 rounded-[3rem] shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] flex flex-col lg:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center text-white shrink-0"><Building2 size={36} /></div>
            <div>
              <h1 ref={headerRef} tabIndex={-1} className="text-2xl font-black italic uppercase tracking-tighter focus:outline-none">
                {company?.name || "Lengkapi Profil Anda"}
              </h1>
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">{company?.industry || "Instansi Baru"}</p>
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

        <main className="min-h-[70vh]">
          {activeTab === "overview" && renderOverview()}
          {activeTab === "simulator" && <RecruitmentSimulator company={company} />}
          {activeTab === "jobs" && <JobManager company={company} onSuccess={() => handleActionSuccess(`{"Lowongan diperbarui!"}`)} />}
          {activeTab === "applicants" && <ApplicantTracker company={company} />}
          {activeTab === "profile" && <ProfileEditor company={company} user={user} onSuccess={() => handleActionSuccess(`{"Profil diperbarui!"}`)} />}
          {activeTab === "settings" && <AccountSettings user={user} onSuccess={() => handleActionSuccess(`{"Akun diperbarui!"}`)} />}
        </main>
        <div className="h-20" aria-hidden="true" />
      </div>
    </div>
  );
}
