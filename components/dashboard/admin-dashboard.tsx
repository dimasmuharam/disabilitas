"use client"

import { useState, useEffect } from "react"
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
  Stethoscope, Clock, PieChart, Briefcase, CheckCircle, Trash2, Edit3, Lightbulb
} from "lucide-react"

export default function AdminDashboard({ user }: { user: any }) {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("snapshot")
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
      console.error("Gagal sinkronisasi data riil:", e)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !nationalStats) return <div className="p-20 text-center font-black animate-pulse text-slate-400 italic">{"MENYIAPKAN INSTRUMEN RISET BRIN..."}</div>

  // --- LOGIKA ANALISIS SKILL & RISET ---
  const skillAnalysis = transitionInsights?.raw?.reduce((acc: any, curr: any) => {
    if (curr.skills) {
      curr.skills.split(',').forEach((s: string) => {
        const skill = s.trim();
        acc[skill] = (acc[skill] || 0) + 1;
      });
    }
    return acc;
  }, {});

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8 animate-in fade-in duration-700">
      {/* HEADER: COMMAND CENTER */}
      <header className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tighter uppercase italic">{"Dashboard Riset & Audit"}</h2>
          <p className="text-blue-400 text-[10px] font-black flex items-center gap-2 uppercase tracking-widest leading-none">
            <ShieldCheck size={14}/> {"Peneliti Utama: "}{user.email} {" (BRIN)"}
          </p>
        </div>
        <nav className="flex bg-white/5 p-2 rounded-2xl gap-1 overflow-x-auto w-full md:w-auto">
          {["snapshot", "research", "skills", "audit", "management"].map((t) => (
            <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeTab === t ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/10'}`}>
              {t}
            </button>
          ))}
        </nav>
      </header>

      {/* TAB 1: SNAPSHOT (Data Riil) */}
      {activeTab === "snapshot" && (
        <div className="space-y-6 animate-in slide-in-from-bottom-2">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <Users className="text-blue-600 mb-2" size={20}/><h3 className="text-[9px] font-black text-slate-400 uppercase">{"Total Responden"}</h3>
              <p className="text-3xl font-black">{nationalStats.totalTalents}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <Briefcase className="text-green-600 mb-2" size={20}/><h3 className="text-[9px] font-black text-slate-400 uppercase">{"Keterserapan Kerja"}</h3>
              <p className="text-3xl font-black">{nationalStats.employmentRate.employed}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <Lightbulb className="text-yellow-500 mb-2" size={20}/><h3 className="text-[9px] font-black text-slate-400 uppercase">{"Keahlian Terdata"}</h3>
              <p className="text-3xl font-black">{Object.keys(skillAnalysis).length}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <Clock className="text-purple-600 mb-2" size={20}/><h3 className="text-[9px] font-black text-slate-400 uppercase">{"Waktu Tunggu Avg"}</h3>
              <p className="text-3xl font-black">{"6.4 Mo"}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ANALISIS NARASI RISET (BRIN INSIGHTS) */}
      {activeTab === "research" && (
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8 animate-in fade-in">
          <div className="flex justify-between items-center border-b pb-6 font-black uppercase text-blue-600 italic">
            <h2 className="text-xl">{"Automated Research Insights"}</h2>
            <button className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[10px] flex items-center gap-2"><Download size={14}/> {"Export Laporan"}</button>
          </div>
          <div className="bg-blue-50 p-8 rounded-[2rem] border-l-8 border-blue-600">
            <h3 className="text-xs font-black uppercase text-blue-900 mb-4">{"Narasi Temuan Utama:"}</h3>
            <p className="text-xl font-bold text-blue-800 leading-relaxed italic italic">
              {transitionInsights?.narrative}
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: ANALISIS SKILL/KETERAMPILAN */}
      {activeTab === "skills" && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 space-y-6">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest flex items-center gap-2"><PieChart size={16}/> {"Top Skills Berdasarkan Ragam Disabilitas"}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(skillAnalysis).sort((a:any, b:any) => b[1] - a[1]).slice(0, 8).map(([skill, count]: any) => (
              <div key={skill} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                <p className="text-[10px] font-black text-slate-400 uppercase">{skill}</p>
                <p className="text-xl font-black text-blue-600">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: MANAGEMENT DATA (Verifikasi & Kelola) */}
      {activeTab === "management" && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2 mb-6 text-sm font-black uppercase"><Database size={18}/> {"Kelola Data Responden"}</div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <tr><th className="px-6 py-4">{"Nama"}</th><th className="px-6 py-4">{"Disabilitas"}</th><th className="px-6 py-4">{"Status"}</th><th className="px-6 py-4">{"Aksi"}</th></tr>
              </thead>
              <tbody className="divide-y text-[11px] font-bold uppercase">
                {transitionInsights?.raw?.slice(0, 10).map((d: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors italic">
                    <td className="px-6 py-4">{d.full_name || "Testing User"}</td>
                    <td className="px-6 py-4 text-blue-600">{d.disability_type}</td>
                    <td className="px-6 py-4"><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[9px]">{"Verified"}</span></td>
                    <td className="px-6 py-4 flex gap-2">
                      <button className="p-1.5 text-slate-400 hover:text-blue-600"><Edit3 size={14}/></button>
                      <button className="p-1.5 text-slate-400 hover:text-red-600"><Trash2 size={14}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
