"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  LayoutDashboard, Users2, Building2, Settings, 
  ExternalLink, AlertTriangle, CheckCircle2, 
  Share2, Download, Eye, Bell, ShieldCheck
} from "lucide-react";

// Import Sub-modul yang telah kita buat
import GovAnalyticsOverview from "./gov/gov-analytics-overview";
import GovTalentDirectory from "./gov/gov-talent-directory";
import GovPartnershipManager from "./gov/gov-partnership-manager";
import GovProfileEditor from "./gov/gov-profile-editor";

export default function GovDashboard({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [govData, setGovData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [profileCompletion, setProfileCompletion] = useState(0);

  useEffect(() => {
    fetchGovProfile();
  }, [user.id]);

  const fetchGovProfile = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("government")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setGovData(data);
      calculateCompletion(data);
    }
    setLoading(false);
  };

  const calculateCompletion = (data: any) => {
    const fields = ['name', 'location_id', 'description', 'whatsapp_official', 'official_seal_url'];
    const filled = fields.filter(f => !!data[f]).length;
    setProfileCompletion((filled / fields.length) * 100);
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-slate-50">
      <div className="text-center">
        <div className="mb-4 h-16 w-16 animate-spin rounded-full border-8 border-slate-200 border-t-blue-600 mx-auto"></div>
        <p className="font-black uppercase italic text-slate-400 tracking-widest">Otoritas Terverifikasi...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      
      {/* 1. TOP UTILITY BAR (Aksesibilitas & Quick Actions) */}
      <div className="sticky top-0 z-40 border-b-4 border-slate-900 bg-white px-6 py-3 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-slate-900 p-2 text-white">
            <ShieldCheck size={20} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Official Government Portal • {govData?.location || "Wilayah Belum Diset"}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="rounded-full p-2 hover:bg-slate-100 transition-colors text-slate-400">
            <Bell size={20} />
          </button>
          <a 
            href={`/government/${user.id}`} 
            target="_blank"
            className="flex items-center gap-2 rounded-xl border-2 border-slate-900 bg-white px-4 py-1.5 text-[10px] font-black uppercase italic shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            <Eye size={14} /> Lihat Profil Publik
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pt-10">
        
        {/* 2. HEADER & PROFILE CHECKER */}
        <header className="mb-12 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 md:text-5xl">
              {activeTab === 'overview' && "Dashboard Otoritas"}
              {activeTab === 'directory' && "Database Talenta"}
              {activeTab === 'partnership' && "Kemitraan Industri"}
              {activeTab === 'profile' && "Pengaturan Instansi"}
            </h1>
            <p className="mt-2 font-bold text-slate-400 uppercase text-xs tracking-[0.2em]">
              Selamat Datang, Admin {govData?.name || "Instansi Baru"}
            </p>
          </div>

          {/* Widget Kelengkapan Profil */}
          {profileCompletion < 100 && (
            <div className="flex items-center gap-6 rounded-3xl border-4 border-slate-900 bg-amber-50 p-6 shadow-[8px_8px_0px_0px_rgba(245,158,11,1)]">
              <AlertTriangle className="text-amber-500 shrink-0" size={32} />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Lengkapi Profil Otoritas</p>
                <div className="mt-1 h-3 w-48 overflow-hidden rounded-full border-2 border-slate-900 bg-white">
                  <div className="h-full bg-amber-400 transition-all" style={{ width: `${profileCompletion}%` }}></div>
                </div>
              </div>
              <button 
                onClick={() => setActiveTab("profile")}
                className="rounded-xl bg-slate-900 px-4 py-2 text-[10px] font-black uppercase text-white hover:bg-amber-600 transition-colors"
              >
                Lengkapi
              </button>
            </div>
          )}
        </header>

        <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
          
          {/* 3. MAIN NAVIGATION (SIDEBAR STYLE) */}
          <nav className="flex flex-col gap-3 h-fit sticky top-24">
            <NavButton 
              active={activeTab === 'overview'} 
              onClick={() => setActiveTab('overview')}
              icon={<LayoutDashboard size={20} />}
              label="Ringkasan Wilayah"
            />
            <NavButton 
              active={activeTab === 'directory'} 
              onClick={() => setActiveTab('directory')}
              icon={<Users2 size={20} />}
              label="Database Talenta"
            />
            <NavButton 
              active={activeTab === 'partnership'} 
              onClick={() => setActiveTab('partnership')}
              icon={<Building2 size={20} />}
              label="Mitra Industri"
            />
            <div className="my-4 border-t-4 border-slate-100 pt-4">
              <NavButton 
                active={activeTab === 'profile'} 
                onClick={() => setActiveTab('profile')}
                icon={<Settings size={20} />}
                label="Profil & Otoritas"
              />
            </div>

            {/* QUICK ACTIONS PANEL */}
            <div className="mt-6 rounded-3xl border-4 border-slate-900 bg-blue-600 p-6 text-white shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
              <h4 className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-4 text-center">Export Laporan Riset</h4>
              <div className="grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center gap-2 rounded-xl bg-white/20 p-3 transition-colors hover:bg-white/30">
                  <Download size={20} />
                  <span className="text-[8px] font-black uppercase">CSV</span>
                </button>
                <button className="flex flex-col items-center gap-2 rounded-xl bg-white/20 p-3 transition-colors hover:bg-white/30">
                  <Share2 size={20} />
                  <span className="text-[8px] font-black uppercase">Share</span>
                </button>
              </div>
            </div>
          </nav>

          {/* 4. DYNAMIC CONTENT AREA */}
          <main className="min-h-[600px]">
            {activeTab === "overview" && <GovAnalyticsOverview govData={govData} />}
            {activeTab === "directory" && <GovTalentDirectory govData={govData} />}
            {activeTab === "partnership" && <GovPartnershipManager govData={govData} />}
            {activeTab === "profile" && <GovProfileEditor user={user} />}
          </main>

        </div>
      </div>
    </div>
  );
}

// Sub-komponen Navigasi agar kode bersih
function NavButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`group flex items-center gap-4 rounded-2xl border-4 p-4 transition-all ${
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