"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
// RECHARTS UNTUK ANALISA VISUAL
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
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
  PieChart as PieIcon, ArrowRightLeft
} from "lucide-react"

export default function AdminDashboard({ user }: { user: any }) {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("national_stats")
  const [msg, setMsg] = useState("")
  
  // -- STATES DATA --
  const [nationalStats, setNationalStats] = useState<any>(null)
  const [transitionInsights, setTransitionInsights] = useState<any>(null)
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [allTalents, setAllTalents] = useState<any[]>([])
  const [allEntities, setAllEntities] = useState<any[]>([]) // Perusahaan, Kampus, Gov
  const [searchQuery, setSearchQuery] = useState("")

  // -- STATES MODAL --
  const [editItem, setEditItem] = useState<any>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)

  const COLORS = ["#2563eb", "#9333ea", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"]

  useEffect(() => { loadAllAdminData() }, [])

  async function loadAllAdminData() {
    setLoading(true)
    try {
      const [nData, iData, aData, talentsRes, entitiesRes] = await Promise.all([
        getNationalStats(),
        getTransitionInsights(),
        getManualInputAudit(),
        supabase.from("profiles").select("*").eq("role", "talent").order("created_at", { ascending: false }),
        supabase.from("companies").select("*").order("created_at", { ascending: false })
      ])
      setNationalStats(nData)
      setTransitionInsights(iData)
      setAuditLogs(aData)
      setAllTalents(talentsRes.data || [])
      setAllEntities(entitiesRes.data || [])
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  // --- LOGIKA KENDALI OTORITAS (GOV & CAMPUS LOCK) ---
  const handleLockAuthority = async (profileId: string, type: "agency" | "partner", value: string) => {
    const { error } = await setupAdminLock(profileId, type, value)
    if (!error) {
      setMsg(`Otoritas ${type} berhasil dikunci ke: ${value}`);
      loadAllAdminData();
    }
  }

  // DATA MAPPING UNTUK GRAFIK
  const chartDataDisability = nationalStats?.disabilityDistribution 
    ? Object.entries(nationalStats.disabilityDistribution).map(([name, value]) => ({ name, value }))
    : []

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-400 italic">{"MENSINKRONISASI KENDALI NASIONAL..."}</div>

  return (
    <div className="max-w-[1600px] mx-auto pb-20 space-y-8 px-6">
      
      {/* 1. HEADER & GLOBAL EXPORT */}
      <header role="banner" className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl flex flex-col xl:flex-row justify-between items-center gap-8">
        <div className="flex gap-6 items-center">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-lg"><ShieldCheck size={40} /></div>
          <div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter">{"Super Admin Command Center"}</h1>
            <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">{"Principal Researcher: Mas Dimas Prasetyo (BRIN Hub)"}</p>
          </div>
        </div>
        <div className="flex gap-4">
            <button onClick={() => setShowInviteModal(true)} className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 transition-all shadow-xl shadow-blue-900/40">
                <UserPlus size={18}/> {"Invite Partner / Gov"}
            </button>
            <button className="bg-white/10 hover:bg-white/20 border border-white/10 px-6 py-4 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2"><FileSpreadsheet size={18}/> {"Export Data Riset"}</button>
        </div>
      </header>

      {/* 2. TAB NAVIGATION (FULL ECOSYSTEM CONTROL) */}
      <nav role="tablist" className="flex gap-2 bg-slate-100 p-2 rounded-[2.5rem] overflow-x-auto border border-slate-200 no-scrollbar">
        {[
          { id: "national_stats", label: "National Analytics", icon: BarChart3 },
          { id: "user_mgmt", label: "Talent DB", icon: Users },
          { id: "entity_mgmt", label: "Companies & Partners", icon: Building2 },
          { id: "gov_campus_lock", label: "Authority Control", icon: Link2 },
          { id: "audit", label: "Audit Manual Input", icon: AlertTriangle }
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

      {/* 3. TAB: NATIONAL ANALYTICS (VISUAL + SR TABLE) */}
      {activeTab === "national_stats" && (
        <section className="space-y-10 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Visual Pie Chart */}
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                <h2 className="text-xl font-black uppercase italic text-slate-800 flex items-center gap-3"><PieIcon className="text-blue-600"/> {"Ragam Disabilitas Nasional"}</h2>
                <div className="h-[400px]" aria-hidden="true">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={chartDataDisability} innerRadius={80} outerRadius={130} paddingAngle={5} dataKey="value">
                                {chartDataDisability.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                {/* Tabel Aksesibel untuk NVDA */}
                <div className="sr-only">
                    <table>
                        <thead><tr><th>{"Jenis"}</th><th>{"Jumlah"}</th></tr></thead>
                        <tbody>{chartDataDisability.map(d => <tr key={d.name}><td>{d.name}</td><td>{d.value}</td></tr>)}</tbody>
                    </table>
                </div>
            </div>

            {/* Analisa Transisi & Trend */}
            <div className="bg-slate-900 p-10 rounded-[3rem] text-white space-y-10 shadow-2xl">
                <h2 className="text-xl font-black uppercase italic text-blue-400 flex items-center gap-3"><TrendingUp/> {"Research Insights"}</h2>
                <div className="space-y-8">
                    <div className="p-6 bg-white/5 rounded-2xl border border-white/10 italic text-sm leading-relaxed text-blue-100">
                        {transitionInsights?.narrative}
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="p-6 bg-blue-600/20 rounded-2xl">
                            <p className="text-[10px] font-black uppercase text-blue-400">{"Employed Talents"}</p>
                            <p className="text-4xl font-black mt-2">{nationalStats?.employmentRate?.employed}</p>
                        </div>
                        <div className="p-6 bg-purple-600/20 rounded-2xl">
                            <p className="text-[10px] font-black uppercase text-purple-400">{"Total Partner Hubs"}</p>
                            <p className="text-4xl font-black mt-2">{allEntities.length}</p>
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. TAB: AUTHORITY CONTROL (KENDALI DASHBOARD GOV & CAMPUS) */}
      {activeTab === "gov_campus_lock" && (
        <section className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8 animate-in fade-in">
          <h2 className="text-2xl font-black uppercase italic text-slate-800 flex items-center gap-3"><Link2 className="text-blue-600"/> {"Otoritas Dashboard Hub"}</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest italic">{"Gunakan menu ini untuk menugaskan (lock) user ke instansi pemerintah atau partner kampus tertentu."}</p>
          
          <div className="grid gap-4">
            {allTalents.filter(t => t.role === 'talent').slice(0, 10).map(t => (
              <div key={t.id} className="p-6 border border-slate-50 rounded-[2rem] flex flex-col lg:flex-row justify-between items-center gap-6 hover:bg-slate-50 transition-all group">
                <div>
                    <h3 className="font-black uppercase text-slate-800">{t.full_name}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">{t.email}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border">
                        <span className="text-[9px] font-black uppercase text-slate-400">{"Agency Lock:"}</span>
                        <input 
                            placeholder="Contoh: BKN"
                            className="text-[10px] font-black border-none focus:ring-0 uppercase w-24"
                            defaultValue={t.admin_agency_lock}
                            onBlur={(e) => handleLockAuthority(t.id, "agency", e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border">
                        <span className="text-[9px] font-black uppercase text-slate-400">{"Partner Lock:"}</span>
                        <input 
                            placeholder="Contoh: UI"
                            className="text-[10px] font-black border-none focus:ring-0 uppercase w-24"
                            defaultValue={t.admin_partner_lock}
                            onBlur={(e) => handleLockAuthority(t.id, "partner", e.target.value)}
                        />
                    </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. TAB: AUDIT MANUAL (STANDARDISASI DATA BRIN) */}
      {activeTab === "audit" && (
        <section className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-8 animate-in fade-in">
          <div className="flex items-center gap-6 bg-orange-600 text-white p-10 rounded-[2.5rem] shadow-xl shadow-orange-200">
            <AlertTriangle size={48}/>
            <div>
                <h2 className="text-2xl font-black uppercase italic leading-none">{"Data Harmonization Hub"}</h2>
                <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mt-1">{"Koreksi input manual universitas/kota agar sesuai dengan data-static.ts."}</p>
            </div>
          </div>
          <div className="overflow-hidden rounded-[2.5rem] border border-slate-100">
            <table className="w-full text-left">
                <thead className="bg-slate-900 text-slate-400 text-[10px] font-black uppercase">
                    <tr><th className="px-10 py-6">{"Field"}</th><th className="px-10 py-6">{"Raw User Input"}</th><th className="px-10 py-6 text-center">{"Frequency"}</th><th className="px-10 py-6 text-right">{"Action"}</th></tr>
                </thead>
                <tbody className="divide-y text-[12px] font-black italic uppercase">
                    {auditLogs.map((log, i) => (
                        <tr key={i} className="hover:bg-slate-50 transition-all">
                            <td className="px-10 py-6 text-blue-600">{log.field_name}</td>
                            <td className="px-10 py-6 text-slate-900">{log.input_value}</td>
                            <td className="px-10 py-6 text-center"><span className="bg-slate-100 px-4 py-2 rounded-xl">{log.occurrence_count}</span></td>
                            <td className="px-10 py-6 text-right"><button className="bg-slate-900 text-white px-6 py-2 rounded-xl text-[9px] font-black uppercase hover:bg-blue-600 transition-all">{"Merge to Master"}</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer role="contentinfo" className="text-center pt-20 border-t border-slate-100">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">{"© 2026 DISABILITAS.COM • BRIN RESEARCH INFRASTRUCTURE"}</p>
      </footer>

    </div>
  )
}
