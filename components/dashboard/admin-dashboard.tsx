"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
// Grafik Dinamis Recharts
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from "recharts"

// ACTIONS INTEGRASI NASIONAL
import { 
  getNationalStats, 
  getTransitionInsights, 
  getManualInputAudit,
  manageAdminUser,
  setupAdminLock
} from "@/lib/actions/admin" 

import { 
  Users, Building2, BarChart3, ShieldCheck, Database, 
  GraduationCap, Landmark, AlertTriangle, LayoutDashboard, 
  TrendingUp, Accessibility, History, FileSpreadsheet, 
  UserPlus, Search, X, Save, Edit3, Trash2, Link2, 
  PieChart as PieIcon, Cpu, FileText, AlertCircle
} from "lucide-react"

export default function AdminDashboard({ user }: { user: any }) {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("national_stats")
  const [msg, setMsg] = useState("")
  
  // -- STATES DATA --
  const [stats, setStats] = useState<any>(null)
  const [transitionInsights, setTransitionInsights] = useState<any>(null)
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [allTalents, setAllTalents] = useState<any[]>([])
  const [allEntities, setAllEntities] = useState<any[]>([]) 
  const [searchQuery, setSearchQuery] = useState("")

  const COLORS = ["#2563eb", "#9333ea", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899"]

  useEffect(() => { 
    console.log('[ADMIN-DASHBOARD] Initializing with user:', { id: user?.id, email: user?.email, role: user?.role })
    loadAllAdminData() 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function loadAllAdminData() {
    console.log('[ADMIN-DASHBOARD] Loading admin data...')
    setLoading(true)
    try {
      const [nData, iData, aData, talentsRes, entitiesRes] = await Promise.all([
        getNationalStats(),
        getTransitionInsights(),
        getManualInputAudit(),
        supabase.from("profiles").select("*").eq("role", "talent").order("created_at", { ascending: false }),
        supabase.from("companies").select("*").order("created_at", { ascending: false })
      ])
      setStats(nData)
      setTransitionInsights(iData)
      setAuditLogs(aData)
      setAllTalents(talentsRes.data || [])
      setAllEntities(entitiesRes.data || [])
    } catch (e) { console.error("Sync Error:", e) } finally { setLoading(false) }
  }

  // --- LOGIKA KENDALI OTORITAS ---
  const handleLockAuthority = async (profileId: string, type: "agency" | "partner", value: string) => {
    const { error } = await setupAdminLock(profileId, type, value)
    if (!error) { setMsg(`Otoritas ${type} dikunci ke: ${value}`); loadAllAdminData(); }
  }

  // --- UI COMPONENTS: STAT TABLE (AKSESIBEL UNTUK NVDA) ---
  const StatTable = ({ title, icon: Icon, data, color }: { title: string, icon: any, data: any, color: string }) => (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-6">
      <h3 className={`text-sm font-black uppercase italic flex items-center gap-3 ${color}`}>
        <Icon size={20} /> {title}
      </h3>
      <div className="overflow-hidden rounded-2xl border border-slate-50">
        <table className="w-full text-left text-[11px]">
          <thead className="bg-slate-50 text-slate-400 font-black uppercase">
            <tr><th className="px-4 py-3">{"Variabel"}</th><th className="px-4 py-3 text-right">{"Jumlah"}</th></tr>
          </thead>
          <tbody className="divide-y">
            {data && Object.entries(data).map(([key, val]: any) => (
              <tr key={key} className="hover:bg-slate-50 font-bold uppercase">
                <td className="px-4 py-3 text-slate-600">{key}</td>
                <td className="px-4 py-3 text-right text-slate-900">{val}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-400 italic">{"MENSINKRONISASI PUSAT DATA NASIONAL..."}</div>

  return (
    <div className="max-w-[1600px] mx-auto pb-20 space-y-8 px-6">
      
      {/* 1. HEADER */}
      <header role="banner" className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-8">
        <div className="flex gap-6 items-center">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-lg"><ShieldCheck size={40} /></div>
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter leading-none">{"Research Command Center"}</h1>
            <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">{"Principal Investigator: Mas Dimas Prasetyo (BRIN Hub)"}</p>
          </div>
        </div>
        <div className="flex gap-4">
            <button onClick={() => {}} className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 transition-all shadow-xl shadow-blue-900/40"><UserPlus size={18}/> {"Invite Partner"}</button>
            <button className="bg-white/10 hover:bg-white/20 border border-white/10 px-6 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 text-white"><FileSpreadsheet size={18}/> {"Download Dataset"}</button>
        </div>
      </header>

      {/* 2. TAB NAVIGATION */}
      <nav role="tablist" className="flex gap-2 bg-slate-100 p-2 rounded-[2.5rem] overflow-x-auto border border-slate-200 no-scrollbar">
        {[
          { id: "national_stats", label: "National Analytics", icon: BarChart3 },
          { id: "user_mgmt", label: "User Management", icon: Users },
          { id: "authority", label: "Authority Control", icon: Link2 },
          { id: "audit", label: "Manual Input Audit", icon: AlertTriangle }
        ].map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-8 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap
              ${activeTab === tab.id ? "bg-white shadow-xl text-blue-600" : "text-slate-500 hover:bg-white/50"}`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </nav>

      {msg && <div role="alert" className="p-4 bg-blue-50 text-blue-700 text-[10px] font-black uppercase text-center rounded-2xl border border-blue-200 animate-in zoom-in-95">{"✅ "}{msg}</div>}

      {/* 3. DYNAMIC CONTENT AREA */}

      {/* TAB 1: NATIONAL ANALYTICS (LENGKAP SEMUA VARIABEL) */}
      {activeTab === "national_stats" && (
        <section className="space-y-12 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
              <h2 className="text-xl font-black uppercase italic text-slate-800 flex items-center gap-3"><PieIcon className="text-blue-600"/> {"Ragam Disabilitas"}</h2>
              <div className="h-[350px] w-full" aria-hidden="true">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={Object.entries(stats?.disabilityDist || {}).map(([name, value]) => ({ name, value }))} innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value">
                      {Object.entries(stats?.disabilityDist || {}).map((_, index) => <Cell key={`c-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip /><Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-slate-900 p-10 rounded-[3rem] text-white flex flex-col justify-center shadow-2xl">
              <h2 className="text-xl font-black uppercase italic text-blue-400 flex items-center gap-3"><TrendingUp/> {"Research Summary"}</h2>
              <div className="mt-8 space-y-8">
                <div className="p-6 bg-white/5 rounded-3xl border border-white/10 italic text-blue-100 text-sm">{transitionInsights?.narrative}</div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="p-6 bg-blue-600/20 rounded-3xl text-center"><p className="text-[10px] font-black uppercase text-blue-400">{"Total Responden"}</p><p className="text-4xl font-black">{stats?.totalTalents}</p></div>
                  <div className="p-6 bg-purple-600/20 rounded-3xl text-center"><p className="text-[10px] font-black uppercase text-purple-400">{"Terserap Kerja"}</p><p className="text-4xl font-black">{stats?.employmentRate?.employed}</p></div>
                </div>
              </div>
            </div>
          </div>

          {/* GRID VARIABEL RISET "MAHAL" */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <StatTable title="Model Pendidikan" icon={GraduationCap} data={stats?.eduModelDist} color="text-blue-600" />
            <StatTable title="Hambatan Utama" icon={AlertCircle} data={stats?.barrierDist} color="text-red-600" />
            <StatTable title="Pendanaan Studi" icon={FileText} data={stats?.scholarshipDist} color="text-orange-600" />
            <StatTable title="Alat Bantu" icon={Cpu} data={stats?.toolsDist} color="text-indigo-600" />
            <StatTable title="Akomodasi Diminta" icon={Accessibility} data={stats?.accDist} color="text-rose-600" />
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white flex flex-col justify-center">
                <h3 className="text-sm font-black uppercase italic text-blue-400">{"Aset Digital"}</h3>
                <div className="mt-4 space-y-4">
                  <div className="flex justify-between items-end border-b border-white/10 pb-2"><span className="text-[9px] font-black uppercase">{"Laptop"}</span><span className="text-3xl font-black text-blue-500">{stats?.digitalAssets?.laptop}</span></div>
                  <div className="flex justify-between items-end"><span className="text-[9px] font-black uppercase">{"Smartphone"}</span><span className="text-3xl font-black text-emerald-500">{stats?.digitalAssets?.smartphone}</span></div>
                </div>
            </div>
          </div>
        </section>
      )}

      {/* TAB 2: USER MANAGEMENT (TALENT DB) */}
      {activeTab === "user_mgmt" && (
        <section className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8 animate-in fade-in">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <h2 className="text-2xl font-black uppercase italic text-blue-600 flex items-center gap-3"><Users size={28}/> {"Database Talenta"}</h2>
            <div className="relative w-full md:w-96"><Search className="absolute left-4 top-3.5 text-slate-400" size={18}/><input placeholder="Cari Nama / Email..." className="input-std h-14 pl-12 text-xs font-bold uppercase" onChange={e => setSearchQuery(e.target.value)} /></div>
          </div>
          <div className="overflow-x-auto rounded-[2.5rem] border">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-slate-400 text-[10px] font-black uppercase">
                <tr><th className="px-8 py-5">{"Talenta"}</th><th className="px-8 py-5">{"Status"}</th><th className="px-8 py-5 text-center">{"Action"}</th></tr>
              </thead>
              <tbody className="divide-y text-[11px] font-black uppercase">
                {allTalents.filter(t => t.full_name?.toLowerCase().includes(searchQuery.toLowerCase())).map(t => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="px-8 py-5"><p className="text-slate-900">{t.full_name}</p><p className="text-[9px] text-blue-500 tracking-widest">{t.disability_type}</p></td>
                    <td className="px-8 py-5"><span className={`px-4 py-1.5 rounded-full text-[8px] ${t.is_verified ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"}`}>{t.is_verified ? "Verified" : "Pending"}</span></td>
                    <td className="px-8 py-5 text-center"><div className="flex justify-center gap-4"><button className="text-slate-400 hover:text-blue-600"><Edit3 size={18}/></button><button onClick={async () => { await manageAdminUser("DELETE", "profiles", {id: t.id}); loadAllAdminData(); }} className="text-slate-300 hover:text-red-500"><Trash2 size={18}/></button></div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 3: AUTHORITY CONTROL (LOCK GOV/CAMPUS) */}
      {activeTab === "authority" && (
        <section className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8 animate-in fade-in">
          <h2 className="text-2xl font-black uppercase italic text-slate-800 flex items-center gap-3"><Link2 className="text-blue-600"/> {"Otoritas Dashboard"}</h2>
          <div className="grid gap-4">
            {allTalents.slice(0, 10).map(t => (
              <div key={t.id} className="p-6 border border-slate-50 rounded-[2rem] flex flex-col lg:flex-row justify-between items-center gap-6 hover:bg-slate-50">
                <div><h3 className="font-black uppercase text-slate-800">{t.full_name}</h3><p className="text-[10px] text-slate-400 font-bold uppercase">{t.email}</p></div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border"><span className="text-[9px] font-black uppercase text-slate-400">{"Agency:"}</span><input className="text-[10px] font-black border-none uppercase w-20" defaultValue={t.admin_agency_lock} onBlur={(e) => handleLockAuthority(t.id, "agency", e.target.value)} /></div>
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border"><span className="text-[9px] font-black uppercase text-slate-400">{"Partner:"}</span><input className="text-[10px] font-black border-none uppercase w-20" defaultValue={t.admin_partner_lock} onBlur={(e) => handleLockAuthority(t.id, "partner", e.target.value)} /></div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* TAB 4: DATA AUDIT (MANUAL INPUT MERGE) */}
      {activeTab === "audit" && (
        <section className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8 animate-in fade-in">
          <div className="bg-orange-600 text-white p-10 rounded-[2.5rem] flex items-center gap-8 shadow-xl shadow-orange-200">
            <AlertTriangle size={48}/><div className="space-y-1"><h2 className="text-2xl font-black uppercase italic">{"Data Standardization Hub"}</h2><p className="text-xs font-bold opacity-80 uppercase tracking-widest">{"Koreksi input manual universitas agar data riset valid."}</p></div>
          </div>
          <div className="overflow-hidden rounded-[2.5rem] border border-slate-100">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-slate-400 text-[10px] font-black uppercase">
                <tr><th className="px-10 py-6">{"Field"}</th><th className="px-10 py-6">{"Raw Input"}</th><th className="px-10 py-6 text-center">{"Freq"}</th><th className="px-10 py-6 text-right">{"Action"}</th></tr>
              </thead>
              <tbody className="divide-y text-[12px] font-black italic uppercase">
                {auditLogs.map((log, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-all">
                    <td className="px-10 py-6 text-blue-600">{log.field_name}</td>
                    <td className="px-10 py-6 text-slate-900">{log.input_value}</td>
                    <td className="px-10 py-6 text-center"><span className="bg-slate-100 px-4 py-2 rounded-xl">{log.occurrence_count}</span></td>
                    <td className="px-10 py-6 text-right"><button className="bg-slate-900 text-white px-6 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-blue-600 transition-all">{"Merge"}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer role="contentinfo" className="text-center pt-20 border-t border-slate-100">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">{"© 2026 DISABILITAS.COM • RESEARCH INTELLIGENCE HUB V.2.0"}</p>
      </footer>
    </div>
  )
}
