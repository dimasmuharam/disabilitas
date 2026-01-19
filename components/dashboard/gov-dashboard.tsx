"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { 
  LayoutDashboard, Users2, Building2, Settings, 
  ExternalLink, AlertTriangle, CheckCircle2, 
  FileSpreadsheet, FileText, Eye, Bell, ShieldCheck, Loader2
} from "lucide-react";

import GovAnalyticsOverview from "./gov/analytics-overview";
import GovTalentDirectory from "./gov/talent-directory";
import GovPartnershipManager from "./gov/partnership-manager";
import GovProfileEditor from "./gov/profile-editor";

export default function GovDashboard({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [govData, setGovData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileCompletion, setProfileCompletion] = useState({ percent: 0, missing: [] as string[] });
  
  const headingRef = useRef<HTMLHeadingElement>(null);

  // 1. HITUNG KELENGKAPAN PROFIL SECARA DETAIL
  const calculateCompletion = useCallback((data: any) => {
    const fields = [
      { key: 'name', label: 'Nama Instansi' },
      { key: 'location', label: 'Wilayah Otoritas' },
      { key: 'description', label: 'Deskripsi' },
      { key: 'whatsapp_official', label: 'Kontak WhatsApp' },
      { key: 'official_seal_url', label: 'Logo/Stempel' }
    ];
    const missing = fields.filter(f => !data[f]).map(f => f.label);
    const percent = ((fields.length - missing.length) / fields.length) * 100;
    setProfileCompletion({ percent, missing });
  }, []);

  const fetchGovProfile = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("government")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setGovData(data);
      calculateCompletion(data);
    }
    setLoading(false);
  }, [user.id, calculateCompletion]);

  useEffect(() => {
    fetchGovProfile();
  }, [fetchGovProfile]);

  // 2. MANAJEMEN FOKUS UNTUK SCREEN READER
  useEffect(() => {
    if (headingRef.current) {
      headingRef.current.focus();
    }
  }, [activeTab]);

  // 3. FUNGSI AUTO-CLOSE SETELAH SAVE
  const handleSaveSuccess = () => {
    fetchGovProfile(); // Refresh data terbaru
    setActiveTab("overview"); // Kembali ke ringkasan
  };

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center bg-slate-50" role="status" aria-label="Memuat Dashboard">
      <Loader2 className="mb-4 animate-spin text-blue-600" size={48} />
      <p className="font-black uppercase italic tracking-widest text-slate-400">Sinkronisasi Otoritas...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      
      {/* TOP UTILITY BAR */}
      <nav className="sticky top-0 z-40 flex items-center justify-between border-b-4 border-slate-900 bg-white px-6 py-3 shadow-sm" aria-label="Aksi Cepat">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-slate-900" size={20} aria-hidden="true" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Portal Resmi • {govData?.location || "Wilayah Belum Ditentukan"}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="rounded-full p-2 text-slate-400 hover:bg-slate-100" aria-label="Lihat Notifikasi">
            <Bell size={20} />
          </button>
          <a 
            href={`/government/${user.id}`} 
            target="_blank"
            className="flex items-center gap-2 rounded-xl border-2 border-slate-900 bg-white px-4 py-1.5 text-[10px] font-black uppercase italic shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
          >
            <Eye size={14} aria-hidden="true" /> Lihat Profil Publik
          </a>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 pt-10">
        
        {/* HEADER & PROGRESS PROFILE */}
        <header className="mb-12 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h1 
              ref={headingRef}
              tabIndex={-1}
              className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 outline-none md:text-5xl"
            >
              {activeTab === 'overview' && "Ringkasan Wilayah"}
              {activeTab === 'directory' && "Direktori Talenta"}
              {activeTab === 'partnership' && "Manajer Kemitraan"}
              {activeTab === 'profile' && "Profil Otoritas"}
            </h1>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              Admin: {govData?.name || "Pemerintah RI"}
            </p>
          </div>

          {/* Widget Kelengkapan Profil yang Aksesibel */}
          {profileCompletion.percent < 100 && (
            <div 
              className="max-w-xs rounded-3xl border-4 border-slate-900 bg-white p-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]"
              role="region" 
              aria-label="Status Kelengkapan Profil"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Kesiapan Profil</span>
                <span className="text-xs font-black text-blue-600">{Math.round(profileCompletion.percent)}%</span>
              </div>
              <div className="mb-4 h-4 w-full overflow-hidden rounded-full border-2 border-slate-900 bg-slate-100">
                <div 
                  className="h-full bg-blue-500 transition-all" 
                  style={{ width: `${profileCompletion.percent}%` }}
                  role="progressbar"
                  aria-valuenow={profileCompletion.percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                ></div>
              </div>
              <p className="mb-4 text-[9px] font-bold text-slate-400">
                Kurang: {profileCompletion.missing.join(", ")}
              </p>
              <button 
                onClick={() => setActiveTab("profile")}
                className="w-full rounded-xl bg-slate-900 py-3 text-[10px] font-black uppercase tracking-widest text-white hover:bg-blue-600"
              >
                Lengkapi Sekarang
              </button>
            </div>
          )}
        </header>

        <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
          
          {/* SIDEBAR NAVIGATION */}
          <nav className="sticky top-24 flex h-fit flex-col gap-3" aria-label="Menu Utama">
            <NavButton 
              active={activeTab === 'overview'} 
              onClick={() => setActiveTab('overview')}
              icon={<LayoutDashboard size={20} />}
              label="Overview"
              ariaLabel="Buka Ringkasan Statistik Wilayah"
            />
            <NavButton 
              active={activeTab === 'directory'} 
              onClick={() => setActiveTab('directory')}
              icon={<Users2 size={20} />}
              label="Talenta"
              ariaLabel="Buka Database Talenta Disabilitas"
            />
            <NavButton 
              active={activeTab === 'partnership'} 
              onClick={() => setActiveTab('partnership')}
              icon={<Building2 size={20} />}
              label="Kemitraan"
              ariaLabel="Buka Manajemen Kemitraan Industri"
            />
            <div className="my-4 border-t-4 border-slate-100 pt-4">
              <NavButton 
                active={activeTab === 'profile'} 
                onClick={() => setActiveTab('profile')}
                icon={<Settings size={20} />}
                label="Pengaturan"
                ariaLabel="Buka Pengaturan Profil dan Otoritas"
              />
            </div>

            {/* EXPORT LAPORAN - CLEAN VERSION */}
            <div className="mt-6 rounded-3xl border-4 border-slate-900 bg-white p-6 shadow-[8px_8px_0px_0px_rgba(59,130,246,1)]">
              <p className="mb-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Export Laporan</p>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  aria-label="Export Laporan ke Excel"
                  className="flex flex-col items-center gap-2 rounded-xl border-2 border-slate-900 bg-slate-50 p-3 transition-all hover:bg-emerald-50 hover:text-emerald-600"
                >
                  <FileSpreadsheet size={20} />
                  <span className="text-[8px] font-black">EXCEL</span>
                </button>
                <button 
                  aria-label="Export Laporan ke PDF"
                  className="flex flex-col items-center gap-2 rounded-xl border-2 border-slate-900 bg-slate-50 p-3 transition-all hover:bg-rose-50 hover:text-rose-600"
                >
                  <FileText size={20} />
                  <span className="text-[8px] font-black">PDF</span>
                </button>
              </div>
            </div>
          </nav>

          {/* DYNAMIC CONTENT AREA */}
          <main className="min-h-[600px]" role="tabpanel" aria-labelledby={activeTab}>
            {activeTab === "overview" && <GovAnalyticsOverview govData={govData} />}
            {activeTab === "directory" && <GovTalentDirectory govData={govData} />}
            {activeTab === "partnership" && <GovPartnershipManager govData={govData} />}
            {activeTab === "profile" && (
              <GovProfileEditor 
                user={user} 
                onSaveSuccess={handleSaveSuccess} 
              />
            )}
          </main>

        </div>
      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon, label, ariaLabel }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; ariaLabel: string }) {
  return (
    <button 
      onClick={onClick}
      aria-label={ariaLabel}
      aria-current={active ? "page" : undefined}
      className={`group flex items-center gap-4 rounded-2xl border-4 p-4 transition-all outline-none focus:ring-4 focus:ring-blue-200 ${
        active 
        ? 'border-slate-900 bg-white shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]' 
        : 'border-transparent text-slate-400 hover:border-slate-200 hover:text-slate-600'
      }`}
    >
      <div className={`transition-colors ${active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
        {icon}
      </div>
      <span className="text-sm font-black uppercase italic tracking-tight">
        {label}
      </span>
    </button>
  );
}