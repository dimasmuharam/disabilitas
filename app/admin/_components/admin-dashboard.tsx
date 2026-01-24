"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { 
  BarChart3, Users, ShieldCheck, AlertTriangle, 
  Loader2, ArrowLeft, TrendingUp, ClipboardCheck 
} from "lucide-react"

// IMPORT MODUL MODULAR
import NationalAnalytics from "./modules/national-analytics"
import UserManagement from "./modules/user-management"
import TransitionHiringAnalytics from "./modules/transition-hiring-analytics"
import LongitudinalCareerResearch from "./modules/longitudinal-career-research"
import InstitutionVerificationHub from "./modules/institution-verification-hub"
import AuditHub from "./modules/audit-hub"

// IMPORT ACTIONS
import { 
  getRawResearchData, 
  getManualInputAudit,
  getAllSystemUsers,
  manageUserAuth,
  manageAdminUser,
  getVerificationQueue // Action baru untuk antrean lembaga
} from "@/lib/actions/admin"

interface AdminDashboardProps {
  user: any;
  serverStats?: any; 
  serverAudit?: any[];
}

export default function AdminDashboard({ user, serverStats, serverAudit }: AdminDashboardProps) {
  const [loading, setLoading] = useState(!serverStats)
  const [activeTab, setActiveTab] = useState("national_stats")
  const [msg, setMsg] = useState("")
  
  const announcementRef = useRef<HTMLDivElement>(null)
  const moduleHeadingRef = useRef<HTMLHeadingElement>(null)

  // -- STATES DATA --
  const [stats, setStats] = useState<any>(serverStats || { profiles: [], researchLogs: [], careerTimeline: [] })
  const [auditLogs, setAuditLogs] = useState<any[]>(serverAudit || [])
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [verificationQueue, setVerificationQueue] = useState<any[]>([])

  /**
   * REFRESH DATA PUSAT (Sync V4)
   * Mengambil data riset, log audit, data user terpadu, dan antrean verifikasi lembaga.
   */
  const refreshData = useCallback(async () => {
    if (!loading) setMsg("Menyinkronkan data pusat...");
    
    try {
      const [resProfiles, resAudit, resUnified, resQueue] = await Promise.all([
        getRawResearchData(),
        getManualInputAudit(),
        getAllSystemUsers(),
        getVerificationQueue()
      ]);

      setStats(resProfiles);
      setAuditLogs(resAudit || []);
      setAllUsers(resUnified || []);
      setVerificationQueue(resQueue || []);
      
      setLoading(false);
      setMsg("Data pusat berhasil diperbarui.");
    } catch (e) {
      console.error("Sync error:", e);
      setMsg("Gagal menyinkronkan data. Silakan periksa koneksi.");
      setLoading(false);
    }
  }, [loading])

  // Sinkronisasi Awal
  useEffect(() => {
    refreshData()
  }, [refreshData])

  // Fokus aksesibilitas untuk NVDA/Screen Reader saat ada pesan status
  useEffect(() => {
    if (msg && announcementRef.current) {
      announcementRef.current.focus();
    }
  }, [msg])

  // Fokus aksesibilitas otomatis ke Judul Modul saat tab berubah
  useEffect(() => {
    if (moduleHeadingRef.current) {
      moduleHeadingRef.current.focus();
    }
  }, [activeTab])

  /**
   * HANDLER AKSI USER (AUTH & DATABASE)
   */
  const handleUserAction = async (actionType: string, payload: any) => {
    setMsg("Memproses perintah administrator...");
    let result: any = { error: null };

    try {
      switch (actionType) {
        case "DELETE_USER":
          if (confirm("PERINGATAN: Hapus user ini dari AUTH & DATABASE? Tindakan ini permanen.")) {
            result = await manageUserAuth("DELETE_USER", payload);
          }
          break;
        case "RESET_PASSWORD":
          result = await manageUserAuth("RESET_PASSWORD", "", payload);
          break;
        case "SUSPEND_USER":
          result = await manageUserAuth("BAN_USER", payload);
          break;
        case "VERIFY_EMAIL":
          result = await manageUserAuth("VERIFY_EMAIL", payload);
          break;
        case "RESEND_CONFIRMATION":
          result = await manageUserAuth("RESEND_CONFIRMATION", "", payload);
          break;
        case "BULK_VERIFY":
          result = await manageAdminUser("BULK_UPDATE", "profiles", { 
            ids: payload, 
            verification_status: "verified",
            is_verified: true 
          });
          break;
        case "BULK_DELETE":
          if (confirm(`Hapus ${payload.length} data terpilih secara permanen?`)) {
            result = await manageAdminUser("BULK_DELETE", "profiles", payload);
          }
          break;
        case "VERIFY":
          result = await manageAdminUser("UPDATE", "profiles", { 
            id: payload, 
            verification_status: "verified",
            is_verified: true 
          });
          break;
        default:
          console.warn("Aksi tidak dikenali:", actionType);
          return;
      }

      if (result?.error) {
        setMsg("Gagal: " + (result.error.message || result.error));
      } else {
        setMsg("Operasi sukses dilaksanakan.");
        refreshData();
      }
    } catch (err: any) {
      setMsg("Kesalahan sistem: " + err.message);
    }
  }

  // State loading awal
  if (loading && (!stats?.profiles || stats.profiles.length === 0)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4" role="status" aria-label="Memuat Dashboard">
        <Loader2 className="size-12 animate-spin text-blue-600" />
        <p className="text-[10px] font-black uppercase italic tracking-widest text-slate-400">
          Menghubungkan ke Command Center...
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 px-6 pb-20 duration-700 animate-in fade-in">
      
      {/* 0. LIVE ANNOUNCEMENT (Aksesibilitas NVDA) */}
      <div 
        ref={announcementRef} 
        className="sr-only" 
        role="status" 
        aria-live="assertive" 
        tabIndex={-1}
      >
        {msg}
      </div>

      {/* 1. HEADER UTAMA */}
      <header role="banner" className="flex flex-col items-center justify-between gap-8 rounded-[3rem] border-4 border-slate-900 bg-slate-900 p-10 text-left text-white shadow-[12px_12px_0px_0px_rgba(37,99,235,1)] xl:flex-row">
        <div className="flex items-center gap-6">
          <div className="flex size-20 items-center justify-center rounded-3xl bg-blue-600 shadow-lg" aria-hidden="true">
            <ShieldCheck size={40} />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase italic leading-none tracking-tighter text-white">Research Command Center</h1>
            <div className="mt-2 flex items-center gap-3">
               <span className="rounded-md bg-blue-500/20 px-2 py-1 text-[8px] font-black uppercase text-blue-400">Admin Authorized</span>
               <p className="text-[10px] font-black uppercase tracking-wider text-white opacity-80">
                {user?.full_name} • {user?.email}
               </p>
            </div>
          </div>
        </div>
        
        {activeTab !== "national_stats" && (
          <button 
            onClick={() => {
              setActiveTab("national_stats");
              setMsg("Kembali ke Analisis Nasional.");
            }}
            className="flex items-center gap-2 rounded-2xl bg-white px-6 py-4 text-[10px] font-black uppercase text-slate-900 shadow-xl transition-all hover:bg-blue-50"
            aria-label="Kembali ke Analisis Nasional"
          >
            <ArrowLeft size={16} aria-hidden="true" /> Back to Overview
          </button>
        )}
      </header>

      {/* 2. NAVIGASI MODUL */}
      <nav aria-label="Menu Utama Admin">
        <div role="tablist" className="no-scrollbar flex gap-3 overflow-x-auto rounded-[2.5rem] border-4 border-slate-900 bg-slate-100 p-3 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
          {[
            { id: "national_stats", label: "National Analytics", icon: BarChart3 },
            { id: "user_mgmt", label: "User Management", icon: Users },
            { id: "hiring_analytics", label: "Hiring Research", icon: BarChart3 },
            { id: "longitudinal_research", label: "Longitudinal Study", icon: TrendingUp },
            { id: "institution_verify", label: "Institution Verify", icon: ClipboardCheck },
            { id: "audit", label: "Data Audit Hub", icon: AlertTriangle }
          ].map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              onClick={() => {
                setActiveTab(tab.id);
                setMsg(`Membuka modul ${tab.label}`);
              }}
              className={`flex items-center gap-3 whitespace-nowrap rounded-[1.8rem] px-8 py-5 text-[10px] font-black uppercase tracking-widest transition-all
                ${activeTab === tab.id 
                  ? "translate-y-[-2px] bg-slate-900 text-white shadow-lg" 
                  : "text-slate-500 hover:bg-white hover:text-slate-900"}`}
            >
              <tab.icon size={18} aria-hidden="true" /> {tab.label}
              {tab.id === 'institution_verify' && verificationQueue.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-[8px] px-2 py-0.5 rounded-full animate-pulse">
                  {verificationQueue.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>

      {/* 3. KONTEN MODUL */}
      <main 
        id={`panel-${activeTab}`} 
        role="tabpanel" 
        className="min-h-[600px] outline-none"
        aria-labelledby={`heading-${activeTab}`}
      >
        {/* HEADING MODUL UNTUK FOKUS AKSESIBILITAS */}
        <h2 
          id={`heading-${activeTab}`}
          ref={moduleHeadingRef}
          tabIndex={-1}
          className="sr-only"
        >
          {activeTab.replace('_', ' ').toUpperCase()} Module Loaded
        </h2>

        {activeTab === "national_stats" && <NationalAnalytics rawData={stats.profiles || []} />}        
        
        {activeTab === "user_mgmt" && (
          <UserManagement 
            allUsers={allUsers} 
            onAction={handleUserAction} 
          />
        )}
        
        {activeTab === "hiring_analytics" && (
          <TransitionHiringAnalytics logs={stats.researchLogs || []} />
        )}

        {activeTab === "longitudinal_research" && (
          <LongitudinalCareerResearch careerTimeline={stats.careerTimeline || []} />
        )}

        {activeTab === "institution_verify" && (
          <InstitutionVerificationHub 
            queue={verificationQueue} 
            onRefresh={refreshData} 
          />
        )}
        
        {activeTab === "audit" && (
          <AuditHub 
            logs={auditLogs} 
            onMerge={refreshData}
            canAction={true} 
          />
        )}
      </main>
    </div>
  )
}