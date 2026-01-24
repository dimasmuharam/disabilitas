"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { 
  LayoutDashboard, Users2, Building2, Settings, Calculator,
  AlertTriangle, CheckCircle2, 
  FileSpreadsheet, FileText, Eye, Bell, ShieldCheck, Loader2,
  ArrowRight, Lock
} from "lucide-react";

import { exportGovTalentReport } from "./gov/export-logic";

// Sub-modul
import GovAnalyticsOverview from "./gov/analytics-overview";
import GovTalentDirectory from "./gov/talent-directory";
import GovPartnershipManager from "./gov/partnership-manager";
import GovProfileEditor from "./gov/profile-editor";
import GovSimulationModule from "./gov/simulation-module";
import GovAccountSettings from "./gov/account-settings";

export default function GovDashboard({ user }: { user: any }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [govData, setGovData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState({ percent: 0, missing: [] as string[] });
  const [announcement, setAnnouncement] = useState("");
  
  const headingRef = useRef<HTMLHeadingElement>(null);

  // 1. HITUNG KELENGKAPAN PROFIL SECARA DETAIL
  const calculateCompletion = useCallback((data: any) => {
    const fields = [
      { key: 'name', label: 'Nama Instansi' },
      { key: 'location', label: 'Wilayah Otoritas' },
      { key: 'description', label: 'Deskripsi' },
      { key: 'whatsapp_official', label: 'Kontak WhatsApp' },
      { key: 'official_seal_url', label: 'Logo Resmi' },
      { key: 'verification_document_link', label: 'Dokumen Verifikasi' }
    ];

    const missing = fields.filter(f => !data[f.key]).map(f => f.label);
    const percent = ((fields.length - missing.length) / fields.length) * 100;
    setProfileCompletion({ percent, missing });
  }, []);

  const fetchGovProfile = useCallback(async () => {
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
  }, [user.id, calculateCompletion]);

  useEffect(() => {
    fetchGovProfile();
  }, [fetchGovProfile]);

  // 2. MANAJEMEN AKSESIBILITAS: Pindah fokus ke Heading Modul
  useEffect(() => {
    if (headingRef.current) {
      headingRef.current.focus();
    }
  }, [activeTab]);

  // 3. LOGIKA EXPORT LAPORAN
  const handleExport = async (type: 'EXCEL' | 'PDF') => {
    if (!govData?.is_verified) {
      setAnnouncement("Gagal: Akses export hanya untuk instansi terverifikasi.");
      return;
    }
    if (!govData?.location) {
      setAnnouncement("Gagal: Wilayah otoritas belum ditentukan.");
      return;
    }
    setIsExporting(true);
    
    const result = await exportGovTalentReport(govData.location);
    
    if (result.success) {
      setAnnouncement(`Laporan ${type} wilayah ${govData.location} berhasil diunduh.`);
    }
    setIsExporting(false);
  };

  const handleSaveSuccess = () => {
    fetchGovProfile(); // Sync ulang data
    setAnnouncement("Profil berhasil diperbarui. Sinkronisasi data...");
  };

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center bg-slate-50" role="status">
      <Loader2 className="mb-4 animate-spin text-blue-600" size={48} />
      <p className="font-black uppercase italic tracking-widest text-slate-400">Sinkronisasi Otoritas Nasional...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <div className="sr-only" aria-live="polite">{announcement}</div>
      
      {/* TOP UTILITY BAR */}
      <nav className="sticky top-0 z-40 flex items-center justify-between border-b-4 border-slate-900 bg-white px-6 py-3 shadow-sm" aria-label="Navigasi Atas">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-slate-900" size={20} aria-hidden="true" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Portal Otoritas • {govData?.location || "Lokasi Belum Diset"}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="rounded-full p-2 text-slate-400 hover:bg-slate-100" aria-label="Notifikasi Sistem">
            <Bell size={20} />
          </button>
          <Link 
            href={`/government/${user.id}`} 
            target="_blank"
            className="flex items-center gap-2 rounded-xl border-2 border-slate-900 bg-white px-4 py-1.5 text-[10px] font-black uppercase italic shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
          >
            <Eye size={14} aria-hidden="true" /> Lihat Profil Publik
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 pt-10">
        
        {/* HEADER & ANALISIS KELENGKAPAN */}
        <header className="mb-12 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="text-left">
            <h1 
              ref={headingRef}
              tabIndex={-1}
              className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 outline-none md:text-5xl"
            >
              {!govData?.is_verified ? "Verifikasi Otoritas" : (
                <>
                  {activeTab === 'overview' && "Ringkasan Wilayah"}
                  {activeTab === 'directory' && "Database Talenta"}
                  {activeTab === 'partnership' && "Kemitraan Industri"}
                  {activeTab === 'simulation' && "Simulasi CASN"}
                  {activeTab === 'profile' && "Profil Otoritas"}
                  {activeTab === 'account' && "Keamanan Akun"}
                </>
              )}
            </h1>
            <div className="mt-2 flex items-center gap-3">
               <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                {govData?.name || "Instansi Pemerintah"}
              </p>
              {govData?.is_verified && <CheckCircle2 className="text-blue-600" size={16} />}
            </div>
          </div>

          {/* Widget Kelengkapan Profil */}
          {profileCompletion.percent < 100 && (
            <div 
              className="max-w-xs rounded-3xl border-4 border-slate-900 bg-white p-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]"
              role="region" 
              aria-labelledby="label-kelengkapan"
            >
              <div className="mb-4 flex items-center justify-between text-left">
                <span id="label-kelengkapan" className="text-[10px] font-black uppercase tracking-widest text-slate-500">Kelengkapan Data</span>
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
              <p className="mb-4 text-left text-[9px] font-bold leading-relaxed text-slate-400">
                <AlertTriangle size={10} className="mr-1 inline text-amber-500" />
                Data Kurang: <span className="text-slate-600">{profileCompletion.missing.join(", ")}</span>
              </p>
              <button 
                onClick={() => setActiveTab("profile")}
                className="w-full rounded-xl bg-slate-900 py-3 text-[10px] font-black uppercase text-white hover:bg-blue-600"
              >
                Lengkapi Profil
              </button>
            </div>
          )}
        </header>

        <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
          
          {/* SIDEBAR NAVIGATION */}
          <nav className="sticky top-24 flex h-fit flex-col gap-3" aria-label="Navigasi Utama">
            <NavButton 
              active={activeTab === 'overview'} 
              onClick={() => setActiveTab('overview')}
              icon={<LayoutDashboard size={20} />}
              label="Ringkasan"
              ariaLabel="Tampilkan Ringkasan Data Wilayah"
              disabled={!govData?.is_verified}
            />
            <NavButton 
              active={activeTab === 'directory'} 
              onClick={() => setActiveTab('directory')}
              icon={<Users2 size={20} />}
              label="Talenta"
              ariaLabel="Tampilkan Database Talenta Disabilitas"
              disabled={!govData?.is_verified}
            />
            <NavButton 
              active={activeTab === 'partnership'} 
              onClick={() => setActiveTab('partnership')}
              icon={<Building2 size={20} />}
              label="Kemitraan"
              ariaLabel="Tampilkan Manajemen Mitra Industri"
              disabled={!govData?.is_verified}
            />
            
            {govData?.category === "Kementerian/Lembaga" && (
              <div className="mt-4 border-t-4 border-dashed border-slate-100 pt-4">
                <NavButton 
                  active={activeTab === 'simulation'} 
                  onClick={() => setActiveTab('simulation')}
                  icon={<Calculator size={20} />}
                  label="Simulasi CASN"
                  ariaLabel="Buka Simulator Perencanaan Formasi"
                  disabled={!govData?.is_verified}
                />
              </div>
            )}

            <div className="my-4 border-t-4 border-slate-100 pt-4">
              <NavButton 
                active={activeTab === 'profile'} 
                onClick={() => setActiveTab('profile')}
                icon={<Settings size={20} />}
                label="Pengaturan"
                ariaLabel="Buka Pengaturan Profil Instansi"
              />
              <NavButton 
                active={activeTab === 'account'} 
                onClick={() => setActiveTab('account')}
                icon={<ShieldCheck size={20} />}
                label="Keamanan Akun"
                ariaLabel="Buka Pengaturan Akun dan Password"
              />
            </div>

            {/* EXPORT SECTION (Locked if not verified) */}
            <div className={`mt-6 rounded-3xl border-4 p-6 shadow-[8px_8px_0px_0px_rgba(59,130,246,1)] ${govData?.is_verified ? 'border-slate-900 bg-white' : 'border-slate-200 bg-slate-50 opacity-50'}`}>
              <p className="mb-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Laporan Wilayah</p>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  disabled={isExporting || !govData?.is_verified}
                  onClick={() => handleExport('EXCEL')}
                  className="flex flex-col items-center gap-2 rounded-xl border-2 border-slate-900 bg-slate-50 p-3 transition-all hover:bg-emerald-50 hover:text-emerald-600 disabled:cursor-not-allowed"
                >
                  <FileSpreadsheet size={20} />
                  <span className="text-[8px] font-black uppercase">Excel</span>
                </button>
                <button 
                  disabled={isExporting || !govData?.is_verified}
                  onClick={() => handleExport('PDF')}
                  className="flex flex-col items-center gap-2 rounded-xl border-2 border-slate-900 bg-slate-50 p-3 transition-all hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed"
                >
                  <FileText size={20} />
                  <span className="text-[8px] font-black uppercase">PDF</span>
                </button>
              </div>
            </div>
          </nav>

          {/* DYNAMIC CONTENT AREA */}
          <main className="min-h-[600px]" role="tabpanel" aria-labelledby={activeTab}>
            {!govData?.is_verified ? (
              <div className="space-y-8 animate-in fade-in duration-500">
                <section className="rounded-[3rem] border-4 border-amber-500 bg-amber-50 p-8 text-left shadow-xl">
                  <div className="flex items-center gap-6">
                    <div className="rounded-2xl bg-amber-500 p-4 text-white shadow-lg"><Lock size={32} /></div>
                    <div>
                      <h2 className="text-2xl font-black uppercase italic tracking-tighter text-amber-900">Otoritas Menunggu Verifikasi</h2>
                      <p className="mt-1 text-xs font-bold uppercase tracking-widest text-amber-700/70">Lengkapi dokumen resmi untuk membuka Database Wilayah</p>
                    </div>
                  </div>
                </section>
                
                <GovProfileEditor 
                  user={user} 
                  company={govData} // Mengirim govData sebagai prop company untuk pengecekan is_verified
                  onSaveSuccess={handleSaveSuccess} 
                />
              </div>
            ) : (
              <>
                {activeTab === "overview" && <GovAnalyticsOverview govData={govData} />}
                {activeTab === "directory" && <GovTalentDirectory govData={govData} />}
                {activeTab === "partnership" && <GovPartnershipManager govData={govData} />}
                {activeTab === "simulation" && govData?.category === "Kementerian/Lembaga" && (
                  <GovSimulationModule govData={govData} />
                )}
                {activeTab === "profile" && (
                  <GovProfileEditor 
                    user={user} 
                    company={govData}
                    onSaveSuccess={handleSaveSuccess} 
                  />
                )}
                {activeTab === "account" && <GovAccountSettings user={user} />}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon, label, ariaLabel, disabled = false }: { 
  active: boolean; 
  onClick: () => void; 
  icon: React.ReactNode; 
  label: string; 
  ariaLabel: string;
  disabled?: boolean;
}) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-current={active ? "page" : undefined}
      className={`group flex items-center gap-4 rounded-2xl border-4 p-4 outline-none transition-all focus:ring-4 focus:ring-blue-200 ${
        active 
        ? 'border-slate-900 bg-white shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]' 
        : 'border-transparent text-slate-400 hover:border-slate-200 hover:text-slate-600 disabled:opacity-30 disabled:hover:border-transparent'
      }`}
    >
      <div className={`transition-colors ${active ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600 group-disabled:text-slate-300'}`}>
        {icon}
      </div>
      <span className="text-sm font-black uppercase italic tracking-tight">
        {label}
      </span>
      {disabled && <Lock size={12} className="ml-auto opacity-40" />}
    </button>
  );
}