"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
// Grafik Dinamis menggunakan Recharts
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from "recharts"

// ACTIONS
import { 
  getNationalStats, 
  getTransitionInsights, 
  getManualInputAudit 
} from "@/lib/actions/admin" 

import { 
  Users, Building2, BarChart3, ShieldCheck, Database, 
  GraduationCap, Landmark, AlertTriangle, LayoutDashboard, 
  TrendingUp, Accessibility, History, FileSpreadsheet, PieChart as PieIcon
} from "lucide-react"

export default function AdminDashboard({ user }: { user: any }) {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("national_stats")
  
  // DATA STATE
  const [nationalStats, setNationalStats] = useState<any>(null)
  const [transitionInsights, setTransitionInsights] = useState<any>(null)
  const [auditLogs, setAuditLogs] = useState<any[]>([])

  // KONFIGURASI WARNA GRAFIK INKLUSIF
  const COLORS = ["#2563eb", "#9333ea", "#06b6d4", "#10b981", "#f59e0b", "#ef4444"]

  useEffect(() => { loadResearchData() }, [])

  async function loadResearchData() {
    setLoading(true)
    try {
      const [nData, iData, aData] = await Promise.all([
        getNationalStats(),
        getTransitionInsights(),
        getManualInputAudit()
      ])
      setNationalStats(nData)
      setTransitionInsights(iData)
      setAuditLogs(aData)
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  // Format data untuk grafik dari object distribution
  const chartDataDisability = nationalStats?.disabilityDistribution 
    ? Object.entries(nationalStats.disabilityDistribution).map(([name, value]) => ({ name, value }))
    : []

  const chartDataEducation = nationalStats?.educationDistribution
    ? Object.entries(nationalStats.educationDistribution).map(([name, value]) => ({ name, value }))
    : []

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-400">{"MENGOLAH VISUALISASI DATA RISET..."}</div>

  return (
    <div className="max-w-[1600px] mx-auto pb-20 space-y-8 px-6">
      
      {/* HEADER */}
      <header role="banner" className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl flex flex-col lg:flex-row justify-between items-center gap-8">
        <div className="flex gap-6 items-center">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-lg"><Database size={40} /></div>
          <div className="space-y-1">
            <h1 className="text-3xl font-black uppercase italic tracking-tighter">{"Research Intelligence"}</h1>
            <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.3em]">{"Principal Investigator: Mas Dimas Prasetyo • BRIN"}</p>
          </div>
        </div>
      </header>

      {/* NAV TABLIST */}
      <nav role="tablist" className="flex gap-2 bg-slate-100 p-2 rounded-[2.5rem] overflow-x-auto border border-slate-200">
        {[
          { id: "national_stats", label: "National Stats", icon: BarChart3 },
          { id: "longitudinal", label: "Longitudinal", icon: TrendingUp },
          { id: "audit", label: "Audit Manual", icon: AlertTriangle }
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

      {/* CONTENT ANALYTICS */}
      {activeTab === "national_stats" && (
        <section className="space-y-10 animate-in fade-in duration-500">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* GRAFIK RAGAM DISABILITAS */}
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
              <h2 className="text-xl font-black uppercase italic text-slate-800 flex items-center gap-3"><PieIcon className="text-blue-600"/> {"Proporsi Ragam Disabilitas"}</h2>
              
              <div className="h-[350px] w-full" aria-hidden="true">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={chartDataDisability} innerRadius={80} outerRadius={120} paddingAngle={5} dataKey="value">
                      {chartDataDisability.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* VERSI AKSESIBEL (TABLE) UNTUK SCREEN READER */}
              <div className="sr-only">
                <h3>{"Data Tabel Ragam Disabilitas"}</h3>
                <table>
                  <thead><tr><th>{"Jenis"}</th><th>{"Jumlah"}</th></tr></thead>
                  <tbody>
                    {chartDataDisability.map(d => <tr key={d.name}><td>{d.name}</td><td>{d.value}</td></tr>)}
                  </tbody>
                </table>
              </div>
            </div>

            {/* GRAFIK JENJANG PENDIDIKAN */}
            <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-8">
              <h2 className="text-xl font-black uppercase italic text-slate-800 flex items-center gap-3"><GraduationCap className="text-purple-600"/> {"Distribusi Pendidikan"}</h2>
              
              <div className="h-[350px] w-full" aria-hidden="true">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartDataEducation}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold'}} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: '#f8fafc'}} />
                    <Bar dataKey="value" fill="#9333ea" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* VERSI AKSESIBEL */}
              <div className="sr-only">
                <h3>{"Data Tabel Pendidikan"}</h3>
                <table>
                  <thead><tr><th>{"Jenjang"}</th><th>{"Jumlah"}</th></tr></thead>
                  <tbody>
                    {chartDataEducation.map(e => <tr key={e.name}><td>{e.name}</td><td>{e.value}</td></tr>)}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* KPI CARDS (EMPLOYMENT) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-900 text-white p-10 rounded-[3rem] flex justify-between items-center shadow-2xl">
              <div>
                <p className="text-[10px] font-black uppercase text-blue-400">{"Total Terserap Kerja"}</p>
                <p className="text-6xl font-black mt-2">{nationalStats?.employmentRate?.employed || 0}</p>
              </div>
              <TrendingUp size={60} className="text-blue-600 opacity-50"/>
            </div>
            <div className="bg-blue-600 text-white p-10 rounded-[3rem] flex justify-between items-center shadow-2xl">
              <div>
                <p className="text-[10px] font-black uppercase text-blue-100">{"Job Seeker Aktif"}</p>
                <p className="text-6xl font-black mt-2">{nationalStats?.employmentRate?.seeking || 0}</p>
              </div>
              <Users size={60} className="text-white opacity-30"/>
            </div>
          </div>
        </section>
      )}

      {/* TAB LONGITUDINAL (LINE CHART UNTUK TREND) */}
      {activeTab === "longitudinal" && (
        <section className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm space-y-10 animate-in fade-in">
          <h2 className="text-xl font-black uppercase italic text-slate-800 flex items-center gap-3"><History size={24} className="text-blue-600"/> {"Trend Transisi Pendidikan ke Kerja"}</h2>
          
          <div className="h-[400px] w-full" aria-hidden="true">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={transitionInsights?.historyTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="changed_at" tickFormatter={(str) => new Date(str).toLocaleDateString()} tick={{fontSize: 10}} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="id" name="Pergerakan Karir" stroke="#2563eb" strokeWidth={4} dot={{r: 6}} activeDot={{r: 8}} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100 text-slate-700 italic text-sm">
            {"NARASI ANALISA: "}{transitionInsights?.narrative}
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="text-center pt-20">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">{"© 2026 DISABILITAS.COM • DATA INTELLIGENCE SYSTEM"}</p>
      </footer>

    </div>
  )
}
