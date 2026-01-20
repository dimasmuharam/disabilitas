"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { 
  BarChart3, Users, Link2, AlertTriangle, 
  ShieldCheck, UserPlus, FileSpreadsheet, 
  Loader2 
} from "lucide-react"

// IMPORT MODUL MODULAR
import NationalAnalytics from "./admin/national-analytics"
import UserManagement from "./admin/user-management"
import AuthorityControl from "./admin/authority-control"
import AuditHub from "./admin/audit-hub"

// IMPORT ACTIONS (Fungsi Server-Side)
import { 
  getNationalStats, 
  getTransitionInsights, 
  getManualInputAudit,
  setupAdminLock,
  manageAdminUser
} from "@/lib/actions/admin"

interface AdminDashboardProps {
  user: any
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("national_stats")
  const [msg, setMsg] = useState("")
  const announcementRef = useRef<HTMLDivElement>(null)

  // -- STATES DATA --
  const [stats, setStats] = useState<any>(null)
  const [transitionInsights, setTransitionInsights] = useState<any>(null)
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [allTalents, setAllTalents] = useState<any[]>([])
  const [allEntities, setAllEntities] = useState<any[]>([])

  // Sinkronisasi Data Saat Pertama Kali Dibuka
  useEffect(() => {
    loadAllAdminData()
  }, [])

  // Mengumumkan perubahan status ke Screen Reader (NVDA)
  useEffect(() => {
    if (msg && announcementRef.current) {
      announcementRef.current.focus();
    }
  }, [msg])

  async function loadAllAdminData() {
    setLoading(true)
    try {
      // Kita panggil data secara paralel agar cepat
      // Gunakan Action Server (getNationalStats) untuk tembus RLS
      const [nData, iData, aData, talentsRes, entitiesRes] = await Promise.all([
        getNationalStats(),
        getTransitionInsights(),
        getManualInputAudit(),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("companies").select("*").order("created_at", { ascending: false })
      ])

      setStats(nData)
      setTransitionInsights(iData)
      setAuditLogs(Array.isArray(aData) ? aData : [])
      setAllTalents(talentsRes.data || [])
      setAllEntities(entitiesRes.data || [])
      
    } catch (e) {
      console.error("[ADMIN-SYNC-ERROR]:", e)
      setMsg("Terjadi kegagalan sinkronisasi data pusat.")
    } finally {
      setLoading(false)
    }
  }

  const handleLockAuthority = async (profileId: string, type: "agency" | "partner", value: string) => {
    setMsg(`Sedang memperbarui otoritas ${type}...`);
    const { error } = await setupAdminLock(profileId, type, value)
    if (!error) {
      setMsg(`Otoritas ${type} berhasil diperbarui.`);
      loadAllAdminData();
    } else {
      setMsg("Gagal memperbarui otoritas.");
    }
  }

  const handleDeleteUser = async (profileId: string) => {
    if (confirm("Hapus user ini secara permanen?")) {
      setMsg("Sedang menghapus data user...");
      const { error } = await manageAdminUser("DELETE", "profiles", { id: profileId });
      if (!error) {
        setMsg("User berhasil dihapus.");
        loadAllAdminData();
      } else {
        setMsg("Gagal menghapus user.");
      }
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4" role="status" aria-live="polite">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="font-black uppercase italic tracking-widest text-slate-400">Mensinkronisasi Pusat Data Nasional...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 px-6 pb-20 duration-700 animate-in fade-in">
      
      {/* LIVE REGION UNTUK NVDA */}
      <div 
        ref={announcementRef}
        className="sr-only" 
        role="status" 
        aria-live="assertive" 
        tabIndex={-1}
      >
        {msg}
      </div>

      {/* 1. HEADER (Landmark Banner) */}
      <header role="banner" className="flex flex-col items-center justify-between gap-8 rounded-[3rem] border-4 border-slate-900 bg-slate-900 p-10 text-white shadow-[12px_12px_0px_0px_rgba(37,99,235,1)] xl:flex-row">
        <div className="flex items-center gap-6">
          <div className="flex size-24 items-center justify-center rounded-3xl bg-blue-600 shadow-lg outline outline-4 outline-white/10" aria-hidden="true">
            <ShieldCheck size={48} />
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase italic leading-none tracking-tighter text-white">Research Command Center</h1>
            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">
              Principal Investigator: {user?.full_name || "Administrator"} • BRIN Intelligence Hub
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <button aria-label="Undang Partner Baru" className="flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-[10px] font-black uppercase text-white shadow-xl transition-all hover:translate-y-1">
            <UserPlus size={18} aria-hidden="true"/> Invite Partner
          </button>
          <button aria-label="Unduh Dataset Lengkap" className="flex items-center gap-2 rounded-2xl border-4 border-white/10 bg-white/10 px-6 py-4 text-[10px] font-black uppercase text-white transition-all hover:bg-white/20">
            <FileSpreadsheet size={18} aria-hidden="true"/> Export Dataset
          </button>
        </div>
      </header>

      {/* 2. NAVIGATION TABS */}
      <nav aria-label="Menu Utama Dashboard Admin">
        <div role="tablist" className="no-scrollbar flex gap-3 overflow-x-auto rounded-[2.5rem] border-4 border-slate-900 bg-slate-100 p-3 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
          {[
            { id: "national_stats", label: "National Analytics", icon: BarChart3 },
            { id: "user_mgmt", label: "User Management", icon: Users },
            { id: "authority", label: "Authority Control", icon: Link2 },
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
                setMsg(`Beralih ke halaman ${tab.label}`);
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

      {/* 3. CONTENT AREA */}
      <main id={`panel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`} className="min-h-[500px]">
        {activeTab === "national_stats" && (
          <NationalAnalytics stats={stats} />
        )}

        {activeTab === "user_mgmt" && (
          <UserManagement 
            talents={allTalents} 
            onAction={handleDeleteUser} 
          />
        )}

        {activeTab === "authority" && (
          <AuthorityControl 
            users={allTalents} 
            onLock={handleLockAuthority} 
          />
        )}

        {activeTab === "audit" && (
          <AuditHub 
            logs={auditLogs} 
            onMerge={(log: any) => setMsg(`Memproses penggabungan data: ${log.input_value}`)} 
          />
        )}
      </main>
    </div>
  )
}