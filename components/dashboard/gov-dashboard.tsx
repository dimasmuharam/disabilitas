"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { 
  LayoutDashboard, Users2, Building2, Settings, Calculator,
  AlertTriangle, CheckCircle2, 
  FileSpreadsheet, FileText, Eye, Bell, ShieldCheck, Loader2,
  ArrowRight, Lock, MapPin, Search, AlertCircle, XCircle
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

  // 1. HITUNG KELENGKAPAN PROFIL
  const calculateCompletion = useCallback((data: any) => {
    const fields = [
      { key: 'name', label: 'Nama Instansi' },
      { key: 'location', label: 'Wilayah Otoritas' },
      { key: 'description', label: 'Deskripsi' },
      { key: 'whatsapp_official', label: 'Kontak WhatsApp' },
      { key: 'official_seal_url', label: 'Logo Resmi' }
    ];

    const missing = fields.filter(f => !data[f.key]).map(f => f.label);
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
      // Jika belum verified, paksa ke tab profile
      if (!data.is_verified) {
        setActiveTab("profile");
      }
    }
    setLoading(false);
  }, [user.id, calculateCompletion]);

  useEffect(() => {
    fetchGovProfile();
  }, [fetchGovProfile]);

  useEffect(() => {
    if (headingRef.current) {
      headingRef.current.focus();
    }
  }, [activeTab]);

  const handleExport = async (type: 'EXCEL' | 'PDF') => {
    if (!govData?.location) {
      setAnnouncement("Gagal: Wilayah otoritas belum ditentukan.");
      return;
    }
    setIsExporting(true);
    setAnnouncement(`Menyiapkan laporan ${type}...`);
    
    const result = await exportGovTalentReport(govData.location);
    
    if (result.success) {
      setAnnouncement(`Laporan ${type} wilayah ${govData.location} berhasil diunduh.`);
    }
    setIsExporting(false);
  };

  const handleSaveSuccess = () => {
    fetchGovProfile();
    setAnnouncement("Data berhasil diperbarui.");
  };

  if (loading) return (
    <div className="flex h-screen flex-col items-center justify-center bg-[#F8FAFC]" role="status">
      <Loader2 className="mb-4 animate-spin text-blue-600" size={48} />
      <p className="font-black uppercase italic tracking-widest text-slate-400 animate-pulse">Sinkronisasi Data Otoritas...</p>
    </div>
  );

  const isVerified = govData?.is_verified;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans text-slate-900">
      <div className="sr-only" aria-live="polite">{announcement}</div>
      
      {/* TOP UTILITY BAR */}
      <nav className="sticky top-0 z-40 flex items-center justify-between border-b-4 border-slate-900 bg-white px-6 py-3 shadow-sm" aria-label="Navigasi Atas">
        <div className="flex items-center gap-2">
          <ShieldCheck className={isVerified ? "text-blue-600" : "text-slate-400"} size={20} />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            {isVerified ? `Portal OMP • ${govData?.location}` : "Verifikasi Otoritas Diperlukan"}
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="rounded-full p-2 text-slate-400 hover:bg-slate-100" aria-label="Notifikasi Sistem">
            <Bell size={20} />
          </button>
          
          {isVerified && (
            <Link 
              href={`/government/${user.id}`} 
              target="_blank"
              className="flex items-center gap-2 rounded-xl border-2 border-slate-900 bg-white px-4 py-1.5 text-[10px] font-black uppercase italic shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
            >
              <Eye size={14} /> Profil Publik
            </Link>
          )}
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-6 pt-10">
        
        {/* HEADER SECTION */}
        <header className="mb-12 flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
               <h1 
                ref={headingRef}
                tabIndex={-1}
                className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 outline-none md:text-5xl"
              >
                {!isVerified ? "Verifikasi Otoritas" : (
                  <>
                    {activeTab === 'overview' && "Ringkasan Wilayah"}
                    {activeTab === 'directory' && "Database Talenta"}
                    {activeTab === 'partnership' && "Kemitraan Industri"}
                    {activeTab === 'profile' && "Profil Otoritas"}
                    {activeTab === 'account' && "Keamanan Akun"}
                    {activeTab === 'simulation' && "Simulasi Formasi"}
                  </>
                )}
              </h1>
              {isVerified && <CheckCircle2 className="text-blue-600" size={32} />}
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
              {govData?.name || "Instansi Pemerintah"}
            </p>
          </div>

          {/* Widget Kelengkapan */}
          {(!isVerified || profileCompletion.percent < 100) && (
            <div className="max-w-xs rounded-3xl border-4 border-slate-900 bg-white p-6 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Kesiapan Data</span>
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
              {profileCompletion.missing.length > 0 && (
                <p className="mb-4 text-[9px] font-bold leading-relaxed text-slate-400 italic">
                  <AlertTriangle size={10} className="mr-1 inline text-amber-500" />
                  Lengkapi: {profileCompletion.missing.join(", ")}
                </p>
              )}
            </div>
          )}
        </header>

        <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
          
          {/* SIDEBAR NAVIGATION */}
          <aside className="space-y-6">
            <nav className="sticky top-24 flex flex-col gap-3" aria-label="Navigasi Utama">
              {isVerified ? (
                <>
                  <NavButton 
                    active={activeTab === 'overview'} 
                    onClick={() => setActiveTab('overview')}
                    icon={<LayoutDashboard size={20} />}
                    label="Ringkasan"
                    ariaLabel="Tampilkan Ringkasan Data Wilayah"
                  />
                  <NavButton 
                    active={activeTab === 'directory'} 
                    onClick={() => setActiveTab('directory')}
                    icon={<Users2 size={20} />}
                    label="Database Talenta"
                    ariaLabel="Tampilkan Database Talenta"
                  />
                  <NavButton 
                    active={activeTab === 'partnership'} 
                    onClick={() => setActiveTab('partnership')}
                    icon={<Building2 size={20} />}
                    label="Mitra Industri"
                    ariaLabel="Tampilkan Manajemen Mitra"
                  />
                  
                  {govData?.category === "Kementerian/Lembaga" && (
                    <NavButton 
                      active={activeTab === 'simulation'} 
                      onClick={() => setActiveTab('simulation')}
                      icon={<Calculator size={20} />}
                      label="Simulasi Formasi"
                      ariaLabel="Buka Simulator Formasi CASN"
                    />
                  )}

                  <div className="my-4 border-t-4 border-dashed border-slate-200 pt-4" />
                  
                  <NavButton 
                    active={activeTab === 'profile'} 
                    onClick={() => setActiveTab('profile')}
                    icon={<Settings size={20} />}
                    label="Profil Instansi"
                    ariaLabel="Buka Pengaturan Profil"
                  />
                  <NavButton 
                    active={activeTab === 'account'} 
                    onClick={() => setActiveTab('account')}
                    icon={<ShieldCheck size={20} />}
                    label="Keamanan Akun"
                    ariaLabel="Buka Pengaturan Akun"
                  />

                  {/* EXPORT SECTION */}
                  <div className="mt-6 rounded-3xl border-4 border-slate-900 bg-white p-6 shadow-[8px_8px_0px_0px_rgba(59,130,246,1)]">
                    <p className="mb-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Export Data Wilayah</p>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        disabled={isExporting}
                        onClick={() => handleExport('EXCEL')}
                        className="flex flex-col items-center gap-2 rounded-xl border-2 border-slate-900 bg-slate-50 p-3 transition-all hover:bg-emerald-50 hover:text-emerald-600 disabled:opacity-50"
                      >
                        <FileSpreadsheet size={20} />
                        <span className="text-[8px] font-black uppercase">Excel</span>
                      </button>
                      <button 
                        disabled={isExporting}
                        onClick={() => handleExport('PDF')}
                        className="flex flex-col items-center gap-2 rounded-xl border-2 border-slate-900 bg-slate-50 p-3 transition-all hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                      >
                        <FileText size={20} />
                        <span className="text-[8px] font-black uppercase">PDF</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-[2.5rem] border-4 border-dashed border-slate-200 p-8 text-center">
                  <Lock className="mx-auto mb-4 text-slate-300" size={40} />
                  <p className="text-[10px] font-black uppercase italic leading-relaxed text-slate-400">
                    Fitur Analitik & Database akan terbuka setelah verifikasi admin selesai.
                  </p>
                </div>
              )}
            </nav>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="min-h-[60vh] transition-all duration-500">
            {!isVerified ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                
                {/* LOGIKA PESAN VERIFIKASI (PENDING VS REJECTED) */}
                {govData?.verification_status === 'rejected' ? (
                  <div className="flex items-center gap-6 rounded-[3rem] border-4 border-red-500 bg-red-50 p-10 shadow-xl transition-all">
                    <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-red-500 text-white shadow-lg">
                      <XCircle size={40} />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-black uppercase italic tracking-tighter text-red-900">Verifikasi Ditolak</h2>
                      <p className="text-sm font-bold leading-relaxed text-red-800">
                        Alasan Admin: <span className="underline italic">{govData?.admin_notes || "Dokumen atau informasi tidak valid."}</span>
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-red-600/60 mt-2">
                        Silakan perbarui data profil atau dokumen resmi Anda di bawah untuk pengajuan ulang.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-6 rounded-[3rem] border-4 border-amber-500 bg-amber-50 p-10 shadow-xl transition-all">
                    <div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg">
                      <AlertCircle size={40} />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-black uppercase italic tracking-tighter text-amber-900">Menunggu Verifikasi</h2>
                      <p className="text-sm font-bold leading-relaxed text-amber-800/80">
                        Pastikan Anda telah mengisi <strong>Wilayah Otoritas</strong> dan mengunggah <strong>Dokumen Resmi</strong> pada form di bawah ini. Admin akan melakukan validasi dalam 1-2 hari kerja.
                      </p>
                    </div>
                  </div>
                )}

                <GovProfileEditor 
                  user={user} 
                  govData={govData} 
                  onSaveSuccess={handleSaveSuccess} 
                />
              </div>
            ) : (
              <div className="animate-in fade-in duration-500">
                {activeTab === "overview" && <GovAnalyticsOverview govData={govData} />}
                {activeTab === "directory" && <GovTalentDirectory govData={govData} />}
                {activeTab === "partnership" && <GovPartnershipManager govData={govData} />}
                {activeTab === "simulation" && govData?.category === "Kementerian/Lembaga" && <GovSimulationModule govData={govData} />}
                {activeTab === "profile" && (
                  <GovProfileEditor 
                    user={user} 
                    govData={govData}
                    onSaveSuccess={handleSaveSuccess} 
                  />
                )}
                {activeTab === "account" && <GovAccountSettings user={user} />}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// NavButton Component
function NavButton({ active, onClick, icon, label, ariaLabel }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; ariaLabel: string }) {
  return (
    <button 
      onClick={onClick}
      aria-label={ariaLabel}
      aria-current={active ? "page" : undefined}
      className={`group flex items-center gap-4 rounded-2xl border-4 p-4 outline-none transition-all focus:ring-4 focus:ring-blue-200 ${
        active 
        ? 'border-slate-900 bg-white shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] translate-x-[-2px] translate-y-[-2px]' 
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