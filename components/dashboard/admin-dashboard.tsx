"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { 
  BarChart3, Users, Link2, AlertTriangle, 
  ShieldCheck, UserPlus, FileSpreadsheet, 
  Loader2, CheckCircle2 
} from "lucide-react"

// IMPORT MODUL MODULAR (Pastikan file ini sudah ada di folder /admin/)
import NationalAnalytics from "./admin/national-analytics"
import UserManagement from "./admin/user-management"
import AuthorityControl from "./admin/authority-control"
import AuditHub from "./admin/audit-hub"

// IMPORT ACTIONS
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

  // -- STATES DATA --
  const [stats, setStats] = useState<any>(null)
  const [transitionInsights, setTransitionInsights] = useState<any>(null)
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [allTalents, setAllTalents] = useState<any[]>([])
  const [allEntities, setAllEntities] = useState<any[]>([])

  useEffect(() => {
    loadAllAdminData()
  }, [])

  async function loadAllAdminData() {
    setLoading(true)
    try {
      // Sinkronisasi data dari berbagai tabel sesuai skema (profiles, companies, logs)
      const [nData, iData, aData, talentsRes, entitiesRes] = await Promise.all([
        getNationalStats(),
        getTransitionInsights(),
        getManualInputAudit(),
        supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        supabase.from("companies").select("*").order("created_at", { ascending: false })
      ])

      setStats(nData)
      setTransitionInsights(iData)
      setAuditLogs(aData || [])
      setAllTalents(talentsRes.data || [])
      setAllEntities(entitiesRes.data || [])
    } catch (e) {
      console.error("[ADMIN-SYNC-ERROR]:", e)
    } finally {
      setLoading(false)
    }
  }

  // --- HANDLER ACTIONS ---
  const handleLockAuthority = async (profileId: string, type: "agency" | "partner", value: string) => {
    const { error } = await setupAdminLock(profileId, type, value)
    if (!error) {
      setMsg(`Otoritas ${type} untuk user tersebut telah dikunci.`);
      setTimeout(() => setMsg(""), 3000);
      loadAllAdminData();
    }
  }

  const handleDeleteUser = async (profileId: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus user ini secara permanen dari sistem?")) {
      const { error } = await manageAdminUser("DELETE", "profiles", { id: profileId });
      if (!error) {
        setMsg("User berhasil dihapus.");
        loadAllAdminData();
      }
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-blue-600" size={48} />
        <p className="font-black uppercase italic tracking-widest text-slate-400">Mensinkronisasi Pusat Data Nasional...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 px-6 pb-20 duration-700 animate-in fade-in">
      
      {/* 1. HERO HEADER (COMMAND CENTER STYLE) */}
      <header className="flex flex-col items-center justify-between gap-8 rounded-[3rem] border-4 border-slate-900 bg-slate-900 p-10 text-white shadow-[12px_12px_0px_0px_rgba(37,99,235,1)] xl:flex-row">
        <div className="flex items-center gap-6">
          <div className="flex size-24 items-center justify-center rounded-3xl bg-blue-600 shadow-lg outline outline-4 outline-white/10">
            <ShieldCheck size={48} />
          </div>
          <div>
            <h1 className="text-4xl font-black uppercase italic leading-none tracking-tighter">Research Command Center</h1>
            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">
              Principal Investigator: {user?.full_name || "Admin"} • BRIN Intelligence Hub
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 text-[10px] font-black uppercase shadow-xl hover:translate-y-1 transition-all active:translate-y-0">
            <UserPlus size={18}/> Invite Partner
          </button>
          <button className="flex items-center gap-2 rounded-2xl border-4 border-white/10 bg-white/10 px-6 py-4 text-[10px] font-black uppercase text-white hover:bg-white/20 transition-all">
            <FileSpreadsheet size={18}/> Export Dataset
          </button>
        </div>
      </header>

      {/* 2. NAVIGATION TABS */}
      <nav className="no-scrollbar flex gap-3 overflow-x-auto rounded-[2.5rem] border-4 border-slate-900 bg-slate-100 p-3 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
        {[
          { id: "national_stats", label: "National Analytics", icon: BarChart3 },
          { id: "user_mgmt", label: "User Management", icon: Users },
          { id: "authority", label: "Authority Control", icon: Link2 },
          { id: "audit", label: "Data Audit Hub", icon: AlertTriangle }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 whitespace-nowrap rounded-[1.8rem] px-8 py-5 text-[10px] font-black uppercase tracking-widest transition-all
              ${activeTab === tab.id 
                ? "bg-slate-900 text-white shadow-lg translate-y-[-2px]" 
                : "text-slate-500 hover:bg-white hover:text-slate-900"}`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </nav>

      {/* ALERT FEEDBACK */}
      {msg && (
        <div className="flex items-center justify-center gap-3 rounded-2xl border-4 border-emerald-500 bg-emerald-50 p-4 text-[10px] font-black uppercase text-emerald-700 animate-in slide-in-from-top-4">
          <CheckCircle2 size={16} /> {msg}
        </div>
      )}

      {/* 3. MODULAR CONTENT AREA */}
      <main className="min-h-[500px]">
        {activeTab === "national_stats" && (
          <NationalAnalytics stats={stats} transitionInsights={transitionInsights} />
        )}

        {activeTab === "user_mgmt" && (
          <UserManagement 
            talents={allTalents} 
            entities={allEntities} 
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
            onMerge={(log: any) => console.log("Merging log:", log)} 
          />
        )}
      </main>

      {/* FOOTER */}
      <footer className="border-t-4 border-slate-100 pt-16 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">
          © 2026 DISABILITAS.COM • RESEARCH INTELLIGENCE HUB V.2.0.4
        </p>
      </footer>
    </div>
  )
}