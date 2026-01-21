"use client"

import { useState, useEffect, useRef } from "react"
import { 
  BarChart3, Users, ShieldCheck, AlertTriangle, 
  Loader2, ArrowLeft 
} from "lucide-react"

// IMPORT MODUL MODULAR
import NationalAnalytics from "./modules/national-analytics"
import UserManagement from "./modules/user-management"
import AuditHub from "./modules/audit-hub"

// IMPORT ACTIONS
import { 
  getRawResearchData, 
  getManualInputAudit,
  getAllSystemUsers,
  manageUserAuth,
  manageAdminUser
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
  const moduleHeadingRef = useRef<HTMLDivElement>(null)

  // -- STATES DATA --
  const [stats, setStats] = useState<any>(serverStats || [])
  const [auditLogs, setAuditLogs] = useState<any[]>(serverAudit || [])
  const [allUsers, setAllUsers] = useState<any[]>([])

  // Sinkronisasi Data Gabungan untuk User Management
  useEffect(() => {
    refreshData()
  }, [])

  useEffect(() => {
    if (msg && announcementRef.current) {
      announcementRef.current.focus();
    }
  }, [msg])

  useEffect(() => {
    if (moduleHeadingRef.current) {
      moduleHeadingRef.current.focus();
    }
  }, [activeTab])

  async function refreshData() {
    if (!loading) setMsg("Sinkronisasi database terbaru...");
    
    try {
      const [resProfiles, resAudit, resUnified] = await Promise.all([
        getRawResearchData(),
        getManualInputAudit(),
        getAllSystemUsers() // Fungsi sakti gabungan 5 tabel
      ]);

      setStats(resProfiles);
      setAuditLogs(resAudit || []);
      setAllUsers(resUnified || []);
      setLoading(false);
    } catch (e) {
      console.error("Refresh error:", e);
      setLoading(false);
    }
  }

  const handleUserAction = async (actionType: string, payload: any) => {
    setMsg("Memproses perintah administrator...");
    let result: any = { error: null };

    try {
      switch (actionType) {
        case "DELETE_USER":
          if (confirm("Hapus user ini secara permanen dari AUTH dan DATABASE?")) {
            result = await manageUserAuth("DELETE_USER", payload);
          }
          break;

        case "RESET_PASSWORD":
          // payload pada aksi ini adalah email user
          result = await manageUserAuth("RESET_PASSWORD", "", payload);
          break;

        case "SUSPEND_USER":
          result = await manageUserAuth("BAN_USER", payload);
          break;

        case "VERIFY_EMAIL":
          result = await manageUserAuth("VERIFY_EMAIL", payload);
          break;
        
        // Aksi verifikasi profil di tabel masing-masing
        case "VERIFY":
          result = await manageAdminUser("UPDATE", "profiles", { 
            id: payload, 
            verification_status: "verified",
            is_verified: true 
          });
          break;

        default:
          console.warn("Action not recognized");
      }

      if (result?.error) {
        setMsg("Gagal: " + (result.error.message || result.error));
      } else {
        setMsg("Operasi berhasil dijalankan.");
        refreshData();
      }
    } catch (err: any) {
      setMsg("Terjadi kesalahan sistem.");
    }
  }

  if (loading && (!stats || stats.length === 0)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4" role="status">
        <Loader2 className="size-12 animate-spin text-blue-600" />
        <p className="font-black uppercase italic tracking-widest text-slate-400 text-[10px]">Menghubungkan ke Pusat Data BRIN...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 px-6 pb-20 duration-700 animate-in fade-in">
      
      {/* 0. LIVE REGION (NVDA) */}
      <div ref={announcementRef} className="sr-only" role="status" aria-live="assertive" tabIndex={-1}>
        {msg}
      </div>

      {/* 1. HEADER */}
      <header role="banner" className="flex flex-col items-center justify-between gap-8 rounded-[3rem] border-4 border-slate-900 bg-slate-900 p-10 text-white shadow-[12px_12px_0px_0px_rgba(37,99,235,1)] xl:flex-row text-left">
        <div className="flex items-center gap-6">
          <div className="size-20 flex items-center justify-center rounded-3xl bg-blue-600 shadow-lg" aria-hidden="true">
            <ShieldCheck size={40} />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase italic leading-none tracking-tighter text-white">Research Command Center</h1>
            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">
              {user?.full_name || 'Administrator'} • <span className="text-white opacity-80">{user?.email}</span>
            </p>
          </div>
        </div>
        
        {activeTab !== "national_stats" && (
          <button 
            onClick={() => {
              setActiveTab("national_stats");
              setMsg("Kembali ke Ringkasan Statistik Nasional.");
            }}
            className="flex items-center gap-2 rounded-2xl bg-white px-6 py-4 text-[10px] font-black uppercase text-slate-900 shadow-xl transition-all hover:bg-blue-50"
          >
            <ArrowLeft size={16} /> Back to Overview
          </button>
        )}
      </header>

      {/* 2. TABS NAVIGATION */}
      <nav aria-label="Navigasi Utama Dashboard">
        <div role="tablist" className="no-scrollbar flex gap-3 overflow-x-auto rounded-[2.5rem] border-4 border-slate-900 bg-slate-100 p-3 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
          {[
            { id: "national_stats", label: "National Analytics", icon: BarChart3 },
            { id: "user_mgmt", label: "User Management", icon: Users },
            { id: "audit", label: "Data Audit Hub", icon: AlertTriangle }
          ].map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setMsg(`Membuka modul ${tab.label}`);
              }}
              className={`flex items-center gap-3 whitespace-nowrap rounded-[1.8rem] px-8 py-5 text-[10px] font-black uppercase tracking-widest transition-all
                ${activeTab === tab.id 
                  ? "bg-slate-900 text-white shadow-lg translate-y-[-2px]" 
                  : "text-slate-500 hover:bg-white hover:text-slate-900"}`}
            >
              <tab.icon size={18} aria-hidden="true" /> {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* 3. MODULE CONTENT */}
      <main 
        id={`panel-${activeTab}`} 
        role="tabpanel" 
        tabIndex={-1} 
        ref={moduleHeadingRef} 
        className="min-h-[500px] outline-none"
      >
        {activeTab === "national_stats" && <NationalAnalytics rawData={stats} />}
        
        {activeTab === "user_mgmt" && (
          <UserManagement 
            allUsers={allUsers} 
            onAction={handleUserAction} 
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