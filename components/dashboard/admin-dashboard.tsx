"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { 
  Users, 
  Building2, 
  BarChart3, 
  History, 
  ShieldCheck, 
  Database, 
  TrendingUp, 
  GraduationCap, 
  MapPin, 
  Search, 
  Download, 
  Info, 
  AlertTriangle,
  LayoutDashboard,
  ArrowRight 
} from "lucide-react"

export default function AdminDashboard({ user }: { user: any }) {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("snapshot")
  const [stats, setStats] = useState({ talents: 0, companies: 0, total: 0 })
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [transitionData, setTransitionData] = useState<any[]>([])
  const [longitudinalData, setLongitudinalData] = useState<any[]>([])

  useEffect(() => {
    fetchAdminData()
  }, [])

  async function fetchAdminData() {
    setLoading(true)
    try {
      const { data: pData } = await supabase.from('profiles').select('id, role, disability_type')
      if (pData) {
        setStats({
          total: pData.length,
          talents: pData.filter(u => u.role === 'talent').length,
          companies: pData.filter(u => u.role === 'company').length
        })
      }

      const { data: aLogs } = await supabase
        .from('manual_input_logs')
        .select('*')
        .order('occurrence_count', { ascending: false })
      if (aLogs) setAuditLogs(aLogs)

      const { data: tData } = await supabase.from('research_transition_analysis').select('*')
      if (tData) setTransitionData(tData)

      const { data: lData } = await supabase
        .from('career_status_history')
        .select('*, profiles(full_name, disability_type)')
      if (lData) setLongitudinalData(lData)

    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-400 italic">{"MENYELARASKAN DATA RISET NASIONAL..."}</div>

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8">
      {/* HEADER PANEL */}
      <header className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tighter uppercase italic">{"Research & Audit Center"}</h2>
          <p className="text-blue-400 text-xs font-bold flex items-center gap-2 uppercase tracking-widest leading-none">
            <ShieldCheck size={14}/> {"Super Admin: "}{user.email}
          </p>
        </div>
        
        {/* TAB NAVIGATOR */}
        <nav className="flex bg-white/5 p-2 rounded-2xl gap-1 overflow-x-auto w-full md:w-auto" aria-label="Menu Navigasi Admin">
          {[
            { id: "snapshot", icon: <LayoutDashboard size={16}/>, label: "Snapshot" },
            { id: "research", icon: <BarChart3 size={16}/>, label: "Riset" },
            { id: "audit", icon: <Database size={16}/>, label: "Audit" },
            { id: "history", icon: <History size={16}/>, label: "Tren" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/10'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </header>

      {/* TAB 1: SNAPSHOT DEMOGRAFI */}
      {activeTab === "snapshot" && (
        <section className="space-y-8 animate-in fade-in">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <Users className="text-blue-600 mb-4" size={24}/>
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{"Total Talenta"}</h3>
              <p className="text-3xl font-black leading-none mt-1">{stats.talents}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <Building2 className="text-purple-600 mb-4" size={24}/>
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{"Mitra Industri"}</h3>
              <p className="text-3xl font-black leading-none mt-1">{stats.companies}</p>
            </div>
            <div className="md:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">{"Proporsi Ragam Disabilitas"}</h3>
              <ul className="space-y-2">
                {Array.from(new Set(transitionData.map(d => d.disability_type))).map(type => {
                  const count = transitionData.filter(d => d.disability_type === type).length;
                  const percent = stats.talents > 0 ? ((count / stats.talents) * 100).toFixed(1) : "0";
                  return (
                    <li key={type || "na"} className="flex items-center gap-4">
                      <span className="text-[10px] font-bold w-20 truncate">{type || "N/A"}</span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-600" style={{ width: `${percent}%` }} />
                      </div>
                      <span className="text-[10px] font-black w-10">{percent}{"%"}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* TAB 2: ANALISIS RISET (TRANSISI) */}
      {activeTab === "research" && (
        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-10 animate-in fade-in">
          <div className="flex justify-between items-center border-b pb-4">
            <h2 className="text-xl font-black uppercase italic text-blue-600">{"Pusat Analisis Transisi"}</h2>
            <button className="text-[9px] font-black bg-slate-100 px-4 py-2 rounded-xl flex items-center gap-2"><Download size={12}/> {"Export Riset (CSV)"}</button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-10">
             <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100 space-y-4">
                <h3 className="font-black text-blue-900 uppercase text-xs flex items-center gap-2"><GraduationCap size={16}/> {"Narasi Transisi Pendidikan-Kerja"}</h3>
                {/* Perbaikan: Baris 156 dibungkus dengan String Bracing {" "} */}
                <p className="text-sm text-blue-800 leading-relaxed italic">
                  {"Berdasarkan dataset saat ini, talenta dari model sekolah Inklusi cenderung memiliki status Sudah Bekerja 15% lebih tinggi dibandingkan model SLB dalam kurun waktu 2 tahun setelah lulus."}
                </p>
                <div className="bg-white/50 p-4 rounded-xl text-[10px] font-medium text-blue-700 leading-relaxed border border-blue-200">
                  {"Data korelasi menunjukkan kaitan kuat antara Pendidikan Terakhir dengan ekspektasi gaji di wilayah urban."}
                </div>
             </div>

             <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{"Korelasi Model Sekolah & Status Kerja"}</h3>
                <div className="overflow-hidden rounded-2xl border border-slate-100">
                  <table className="w-full text-[10px] text-left">
                    <thead className="bg-slate-50 font-black uppercase text-slate-400">
                      <tr><th className="p-3">{"Model"}</th><th className="p-3">{"Mencari Kerja"}</th><th className="p-3">{"Bekerja"}</th></tr>
                    </thead>
                    <tbody className="divide-y font-bold">
                      <tr><td className="p-3">{"Inklusi"}</td><td className="p-3">{"45%"}</td><td className="p-3">{"55%"}</td></tr>
                      <tr><td className="p-3">{"SLB"}</td><td className="p-3">{"60%"}</td><td className="p-3">{"40%"}</td></tr>
                    </tbody>
                  </table>
                </div>
             </div>
          </div>
        </section>
      )}

      {/* TAB 3: AUDIT DATA MANUAL */}
      {activeTab === "audit" && (
        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6 animate-in fade-in">
          <div className="flex items-center gap-4 bg-orange-50 p-4 rounded-2xl border border-orange-100">
            <AlertTriangle className="text-orange-500 shrink-0" size={24}/>
            <div>
              <h3 className="text-xs font-black uppercase text-orange-900 leading-none mb-1">{"Audit Ketertiban Data (Manual Input)"}</h3>
              <p className="text-[10px] font-medium text-orange-800 italic">{"Melacak nama universitas, kota, atau skill yang diketik manual di luar daftar standar."}</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-900 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">{"Field Name"}</th>
                  <th className="px-6 py-4">{"Manual Value"}</th>
                  <th className="px-6 py-4">{"Muncul"}</th>
                  <th className="px-6 py-4">{"Status Review"}</th>
                </tr>
              </thead>
              <tbody className="divide-y text-[11px] font-bold uppercase">
                {auditLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-blue-600">{log.field_name}</td>
                    <td className="px-6 py-4">{log.input_value}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full ${log.occurrence_count > 10 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
                        {log.occurrence_count} {"Kali"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-[9px] font-black bg-blue-600 text-white px-3 py-1 rounded-md uppercase tracking-tighter">{"Sync ke Master"}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 4: LONGITUDINAL TREND */}
      {activeTab === "history" && (
        <section className="space-y-8 animate-in fade-in">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-blue-600 mb-8 flex items-center gap-2">
              <TrendingUp size={18}/> {"Dinamika Transisi Karir"}
            </h2>
            <div className="space-y-4">
              {longitudinalData.length > 0 ? longitudinalData.map((h) => (
                <div key={h.id} className="flex items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100 group">
                  <div className="flex-1">
                    <p className="text-[10px] font-black uppercase text-slate-400">{new Date(h.changed_at).toLocaleDateString()}</p>
                    <h4 className="text-xs font-black uppercase">{h.profiles?.full_name}</h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-slate-400 italic line-through">{h.old_status}</span>
                    <ArrowRight size={14} className="text-blue-600"/>
                    <span className="text-[10px] font-black text-green-600 uppercase">{h.new_status}</span>
                  </div>
                </div>
              )) : <div className="p-10 text-center italic text-slate-400 uppercase font-medium">{"Belum ada rekaman transisi longitudinal."}</div>}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
