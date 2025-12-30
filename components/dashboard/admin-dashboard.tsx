"use client"

import { useState, useEffect } from "react"
// INTEGRASI TOTAL: Memanggil fungsi sesuai file lib/actions/admin.ts milik Mas
import { 
  getNationalStats, 
  getTransitionInsights, 
  getManualInputAudit, 
  getLongitudinalTrends 
} from "@/lib/actions/admin" 
import { 
  Users, Building2, BarChart3, History, ShieldCheck, 
  Database, TrendingUp, GraduationCap, Download, 
  AlertTriangle, LayoutDashboard, ArrowRight, 
  Activity, PieChart
} from "lucide-react"

export default function AdminDashboard({ user }: { user: any }) {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("snapshot")
  
  // State disesuaikan dengan struktur return dari admin.ts
  const [nationalStats, setNationalStats] = useState<any>(null)
  const [transitionInsights, setTransitionInsights] = useState<any>(null)
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [longitudinalData, setLongitudinalData] = useState<any[]>([])

  useEffect(() => {
    loadRisetData()
  }, [])

  async function loadRisetData() {
    setLoading(true)
    try {
      const [nData, tData, aData, lData] = await Promise.all([
        getNationalStats(),
        getTransitionInsights(),
        getManualInputAudit(),
        getLongitudinalTrends()
      ])

      setNationalStats(nData)
      setTransitionInsights(tData)
      setAuditLogs(aData)
      setLongitudinalData(lData)
    } catch (e) {
      console.error("Gagal sinkronisasi data riset:", e)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !nationalStats) return <div className="p-20 text-center font-black animate-pulse text-slate-400 italic">{"MENYELARASKAN DATABASE RISET NASIONAL..."}</div>

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8">
      {/* HEADER PANEL */}
      <header className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tighter uppercase italic">{"Research and Audit Center"}</h2>
          <p className="text-blue-400 text-xs font-bold flex items-center gap-2 uppercase tracking-widest leading-none">
            <ShieldCheck size={14}/> {"Super Admin: "}{user.email}
          </p>
        </div>
        <nav className="flex bg-white/5 p-2 rounded-2xl gap-1 overflow-x-auto">
          {[
            { id: "snapshot", icon: <LayoutDashboard size={16}/>, label: "Snapshot" },
            { id: "research", icon: <BarChart3 size={16}/>, label: "Analisis Riset" },
            { id: "audit", icon: <Database size={16}/>, label: "Audit Data" },
            { id: "history", icon: <History size={16}/>, label: "Tren Karir" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
                activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/10'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* TAB 1: SNAPSHOT (DATA DARI getNationalStats) */}
      {activeTab === "snapshot" && (
        <section className="space-y-8 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200">
              <Users className="text-blue-600 mb-4" size={24}/>
              <h3 className="text-[10px] font-black uppercase text-slate-400">{"Total Talenta"}</h3>
              <p className="text-3xl font-black">{nationalStats.totalTalents}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200">
              <Activity className="text-green-600 mb-4" size={24}/>
              <h3 className="text-[10px] font-black uppercase text-slate-400">{"Sudah Bekerja"}</h3>
              <p className="text-3xl font-black">{nationalStats.employmentRate.employed}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200">
              <Search className="text-orange-500 mb-4" size={24}/>
              <h3 className="text-[10px] font-black uppercase text-slate-400">{"Mencari Kerja"}</h3>
              <p className="text-3xl font-black">{nationalStats.employmentRate.seeking}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200">
              <Building2 className="text-purple-600 mb-4" size={24}/>
              <h3 className="text-[10px] font-black uppercase text-slate-400">{"Mitra Industri"}</h3>
              <p className="text-3xl font-black">{nationalStats.totalCompanies}</p>
            </div>
          </div>

          {/* Disability Distribution Chart Riil */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h3 className="text-xs font-black uppercase text-slate-400 mb-6 flex items-center gap-2">
              <PieChart size={16}/> {"Distribusi Ragam Disabilitas (Data Server)"}
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <ul className="space-y-3">
                {Object.entries(nationalStats.disabilityDistribution).map(([type, count]: [any, any]) => {
                  const percentage = ((count / nationalStats.totalTalents) * 100).toFixed(1);
                  return (
                    <li key={type} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-black uppercase">
                        <span>{type}</span>
                        <span>{count} {"Jiwa ("}{percentage}{"%)"}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600" style={{ width: `${percentage}%` }} />
                      </div>
                    </li>
                  )
                })}
              </ul>
              <div className="bg-slate-50 p-6 rounded-3xl flex items-center justify-center italic text-slate-400 text-sm text-center">
                {"Data distribusi ini dihitung secara real-time berdasarkan kolom disability_type di database."}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* TAB 2: ANALISIS RISET (DATA DARI getTransitionInsights) */}
      {activeTab === "research" && transitionInsights && (
        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-10 animate-in fade-in">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-xl font-black uppercase italic text-blue-600">{"Analisis Transisi Karir"}</h2>
            <button className="text-[9px] font-black bg-slate-900 text-white px-6 py-2 rounded-xl flex items-center gap-2">
              <Download size={12}/> {"Export Riset CSV"}
            </button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-10">
             <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100 space-y-4">
                <h3 className="font-black text-blue-900 uppercase text-xs flex items-center gap-2">
                  <GraduationCap size={16}/> {"Narasi Otomatis Riset"}
                </h3>
                {/* Menampilkan narasi asli dari server action Mas */}
                <p className="text-sm text-blue-800 leading-relaxed italic font-medium">
                  {transitionInsights.narrative}
                </p>
                <div className="pt-4 border-t border-blue-200 text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                  {"Sumber: research_transition_analysis view"}
                </div>
             </div>

             <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{"Dataset Transisi Terkini"}</h3>
                <div className="overflow-hidden rounded-2xl border border-slate-100">
                  <table className="w-full text-[10px] text-left">
                    <thead className="bg-slate-50 font-black uppercase text-slate-400">
                      <tr>
                        <th className="p-3">{"Model Sekolah"}</th>
                        <th className="p-3">{"Status Karir"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y font-bold">
                      {transitionInsights.raw.slice(0, 5).map((d: any, i: number) => (
                        <tr key={i}>
                          <td className="p-3">{d.education_model || "N/A"}</td>
                          <td className="p-3 text-blue-600">{d.career_status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-[9px] italic text-slate-400">{"* Menampilkan 5 sampel data transisi terbaru."}</p>
             </div>
          </div>
        </section>
      )}

      {/* TAB 3: AUDIT DATA (DATA DARI getManualInputAudit) */}
      {activeTab === "audit" && (
        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6 animate-in fade-in">
          <div className="flex items-center gap-4 bg-orange-50 p-4 rounded-2xl border border-orange-100">
            <AlertTriangle className="text-orange-500" size={24}/>
            <div>
              <h3 className="text-xs font-black uppercase text-orange-900 leading-none mb-1">{"Audit Manual Input"}</h3>
              <p className="text-[10px] font-medium text-orange-800 italic">{"Data universitas/kota yang diinput manual oleh talenta."}</p>
            </div>
          </div>
          <table className="w-full text-sm text-left border rounded-2xl overflow-hidden">
            <thead className="bg-slate-900 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">{"Field"}</th>
                <th className="px-6 py-4">{"Value"}</th>
                <th className="px-6 py-4">{"Frekuensi"}</th>
              </tr>
            </thead>
            <tbody className="divide-y text-[11px] font-bold uppercase">
              {auditLogs.map((log, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-blue-600">{log.field_name}</td>
                  <td className="px-6 py-4">{log.input_value}</td>
                  <td className="px-6 py-4">{log.occurrence_count} {"Kali"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* TAB 4: TRENDS (DATA DARI getLongitudinalTrends) */}
      {activeTab === "history" && (
        <section className="space-y-8 animate-in fade-in">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-blue-600 mb-8 flex items-center gap-2">
              <TrendingUp size={18}/> {"Riwayat Perubahan Status Karir"}
            </h2>
            <div className="space-y-4">
              {longitudinalData.length > 0 ? longitudinalData.map((h, i) => (
                <div key={i} className="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase text-slate-400">{new Date(h.changed_at).toLocaleDateString()}</p>
                    <h4 className="text-xs font-black uppercase">{h.profiles?.full_name || "Talenta Anonim"}</h4>
                    <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase font-black">{h.profiles?.disability_type}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-400 line-through italic">{h.old_status}</span>
                    <ArrowRight size={14} className="text-blue-600"/>
                    <span className="text-[10px] font-black text-green-600 uppercase">{h.new_status}</span>
                  </div>
                </div>
              )) : <div className="p-10 text-center italic text-slate-400 font-medium">{"Belum ada rekaman transisi karir."}</div>}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
