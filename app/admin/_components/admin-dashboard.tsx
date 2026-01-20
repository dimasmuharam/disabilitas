"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { 
  BarChart3, Users, ShieldCheck, AlertTriangle, 
  Loader2, ArrowLeft, ShieldAlert
} from "lucide-react"

// IMPORT MODUL MODULAR
import NationalAnalytics from "./modules/national-analytics"
import UserManagement from "./modules/user-management"
import AccessControl from "./modules/access-control"
import AuditHub from "./modules/audit-hub"

// IMPORT ACTIONS
import { 
  getNationalStats, 
  getManualInputAudit,
  manageAdminUser
} from "@/lib/actions/admin"

interface AdminDashboardProps {
  user: any;
  serverStats?: any;
  serverAudit?: any[];
  serverWhitelist?: any[];
}

export default function AdminDashboard({ user, serverStats, serverAudit, serverWhitelist }: AdminDashboardProps) {
  const [loading, setLoading] = useState(!serverStats)
  const [activeTab, setActiveTab] = useState("national_stats")
  const [msg, setMsg] = useState("")
  
  // REFS UNTUK AKSESIBILITAS
  const announcementRef = useRef<HTMLDivElement>(null)
  const moduleHeadingRef = useRef<HTMLDivElement>(null)

  // -- STATES DATA --
  const [stats, setStats] = useState<any>(serverStats || null)
  const [auditLogs, setAuditLogs] = useState<any[]>(serverAudit || [])
  const [allTalents, setAllTalents] = useState<any[]>([])
  const [whitelist, setWhitelist] = useState<any[]>(serverWhitelist || [])

  // Sinkronisasi Data Background
  useEffect(() => {
    loadBackgroundData()
  }, [])

  // Effect untuk Voice Announcement (NVDA)
  useEffect(() => {
    if (msg && announcementRef.current) {
      announcementRef.current.focus();
    }
  }, [msg])

  // EFFECT UNTUK AUTO-FOCUS SAAT PINDAH TAB
  useEffect(() => {
    if (moduleHeadingRef.current) {
      moduleHeadingRef.current.focus();
    }
  }, [activeTab])

  async function loadBackgroundData() {
    try {
      const { data: talents } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      
      setAllTalents(talents || []);
      setLoading(false);
    } catch (e) {
      console.error("Background sync error:", e);
    }
  }

  async function refreshData() {
    setMsg("Sinkronisasi database terbaru...");
    const [resStats, resAudit] = await Promise.all([
      getNationalStats(),
      getManualInputAudit()
    ]);
    setStats(resStats);
    setAuditLogs(resAudit || []);
    loadBackgroundData();
  }

  const handleUserAction = async (actionType: string, payload: any) => {
    // Proteksi Level Akses
    if (user.access_level === 'researcher' && (actionType === 'DELETE' || actionType === 'VERIFY')) {
      setMsg("Akses Ditolak: Level Periset hanya diizinkan membaca data.");
      return;
    }

    switch (actionType) {
      case "DELETE":
        if (confirm("Hapus data ini secara permanen dari ekosistem?")) {
          setMsg("Menghapus data...");
          const { error } = await manageAdminUser("DELETE", "profiles", { id: payload });
          if (!error) { setMsg("Data berhasil dihapus."); refreshData(); }
        }
        break;

      case "VERIFY":
        setMsg("Memproses verifikasi entitas...");
        const { error: vError } = await manageAdminUser("UPDATE", "profiles", { 
          id: payload, 
          verification_status: "verified",
          is_verified: true 
        });
        if (!vError) { setMsg("Entitas berhasil diverifikasi."); refreshData(); }
        break;

      case "ADD_WHITELIST":
        setMsg(`Mendaftarkan ${payload.email} ke sistem...`);
        // Logika penambahan ke tabel admin_whitelist via Supabase client
        const { error: wError } = await supabase.from("admin_whitelist").insert([payload]);
        if (!wError) { setMsg("Tim berhasil ditambahkan."); refreshData(); }
        break;
    }
  }

  if (loading && !stats) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4" role="status" aria-live="polite">
        <Loader2 className="size-12 animate-spin text-blue-600" />
        <p className="font-black uppercase italic tracking-widest text-slate-400">Menghubungkan ke Pusat Data...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 px-6 pb-20 duration-700 animate-in fade-in">
      
      {/* 0. LIVE REGION (NVDA) */}
      <div 
        ref={announcementRef} 
        className="sr-only" 
        role="status" 
        aria-live="assertive" 
        tabIndex={-1}
      >
        {msg}
      </div>

      {/* 1. HEADER */}
      <header role="banner" className="flex flex-col items-center justify-between gap-8 rounded-[3rem] border-4 border-slate-900 bg-slate-900 p-10 text-white shadow-[12px_12px_0px_0px_rgba(37,99,235,1)] xl:flex-row">
        <div className="flex items-center gap-6">
          <div className="size-20 flex items-center justify-center rounded-3xl bg-blue-600 shadow-lg" aria-hidden="true">
            <ShieldCheck size={40} />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase italic leading-none tracking-tighter text-white">Research Command Center</h1>
            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">
              {user?.full_name} • Access Level: <span className="text-white bg-blue-500 px-2 py-0.5 rounded-md">{user?.access_level}</span>
            </p>
          </div>
        </div>
        
        {/* Tombol Back to Overview (Hanya muncul jika tidak di tab utama) */}
        {activeTab !== "national_stats" && (
          <button 
            onClick={() => {
              setActiveTab("national_stats");
              setMsg("Kembali ke Ringkasan Statistik Nasional.");
            }}
            className="flex items-center gap-2 rounded-2xl bg-white px-6 py-4 text-[10px] font-black uppercase text-slate-900 shadow-xl transition-all hover:bg-blue-50"
            aria-label="Kembali ke Ringkasan Utama"
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
            { id: "authority", label: "Access Control", icon: ShieldAlert },
            { id: "audit", label: "Data Audit Hub", icon: AlertTriangle }
          ].map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
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

      {/* 3. MODULE CONTENT WITH FOCUS ANCHOR */}
      <main 
        id={`panel-${activeTab}`} 
        role="tabpanel" 
        tabIndex={-1} 
        ref={moduleHeadingRef} 
        className="min-h-[500px] outline-none"
        aria-labelledby={`tab-${activeTab}`}
      >
        {activeTab === "national_stats" && <NationalAnalytics stats={stats} />}
        
        {activeTab === "user_mgmt" && (
          <UserManagement 
            talents={allTalents} 
            onAction={handleUserAction} 
            canDelete={user.access_level === 'admin'} 
          />
        )}
        
        {activeTab === "authority" && (
          <AccessControl 
            whitelist={whitelist} 
            onAction={handleUserAction}
            currentAccess={user.access_level} 
          />
        )}
        
        {activeTab === "audit" && (
          <AuditHub 
            logs={auditLogs} 
            onMerge={refreshData}
            canAction={user.access_level !== 'researcher'} 
          />
        )}
      </main>
    </div>
  )
}