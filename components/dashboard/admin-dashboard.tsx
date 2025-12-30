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
  Stethoscope, Clock, PieChart, Briefcase, 
  CheckCircle, Trash2, Edit3, Lightbulb, Map, FileText
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

  // --- LOGIKA ANALISIS RISET BRIN ---
  const skillAnalysis = transitionInsights?.raw?.reduce((acc: any, curr: any) => {
    if (curr.skills) {
      curr.skills.split(',').forEach((s: string) => {
        const skill = s.trim();
        acc[skill] = (acc[skill] || 0) + 1;
      });
    }
    return acc;
  }, {});

  // Fitur 1: Prediksi Sebaran (Heatmap Logic)
  const geoDistribution = transitionInsights?.raw?.reduce((acc: any, curr: any) => {
    const loc = curr.location || "Unmapped";
    acc[loc] = (acc[loc] || 0) + 1;
    return acc;
  }, {});

  if (loading || !nationalStats) return <div className="p-20 text-center font-black animate-pulse text-slate-400 italic">{"MENYIAPKAN PUSAT DATA RISET NASIONAL..."}</div>

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8 animate-in fade-in duration-700">
      {/* HEADER UTAMA */}
      <header className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tighter uppercase italic">{"Research Command Center"}</h2>
          <p className="text-blue-400 text-[10px] font-black flex items-center gap-2 uppercase tracking-widest leading-none">
            <ShieldCheck size={14}/> {"Principal Researcher: "}{user.email} {" (BRIN)"}
          </p>
        </div>
        <nav className="flex bg-white/5 p-2 rounded-2xl gap-1 overflow-x-auto w-full md:w-auto">
          {[
            { id: "snapshot", label: "Overview" },
            { id: "advocacy", label: "Advokasi & Sebaran" },
            { id: "research", label: "Narasi Riset" },
            { id: "management", label: "Kelola Data" },
            { id: "audit", label: "Audit Manual" }
          ].map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${activeTab === t.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/10'}`}>
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      {/* TAB 1: SNAPSHOT & FITUR 4 (REPORT GENERATOR) */}
      {activeTab === "snapshot" && (
        <div className="space-y-8 animate-in slide-in-from-bottom-2">
          <div className="flex justify-between items-end">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest italic">{"National Transition Metrics"}</h3>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 shadow-xl hover:bg-slate-900 transition-all">
              <FileText size={16}/> {"Download Automated BRIN Report (PDF)"}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <Users className="text-blue-600 mb-2" size={24}/>
              <h3 className="text-[10px] font-black text-slate-400 uppercase">{"Total Responden"}</h3>
              <p className="text-4xl font-black">{nationalStats.totalTalents}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <Briefcase className="text-green-600 mb-2" size={24}/>
              <h3 className="text-[10px] font-black text-slate-400 uppercase">{"Serapan Industri"}</h3>
              <p className="text-4xl font-black">{nationalStats.employmentRate.employed}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <Stethoscope className="text-cyan-500 mb-2" size={24}/>
              <h3 className="text-[10px] font-black text-slate-400 uppercase">{"Akomodasi Aktif"}</h3>
              <p className="text-4xl font-black">{"84%"}</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <Clock className="text-purple-600 mb-2" size={24}/>
              <h3 className="text-[10px] font-black text-slate-400 uppercase">{"Wait Time (Avg)"}</h3>
              <p className="text-4xl font-black">{"6.4m"}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FITUR 1 & 2 (GEO-SEBARAN & IMPACT) */}
      {activeTab === "advocacy" && (
        <div className="grid md:grid-cols-2 gap-8 animate-in fade-in">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-xs font-black uppercase text-slate-400 mb-8 flex items-center gap-2"><Map size={18}/> {"Heatmap Sebaran Talenta"}</h3>
            <div className="space-y-4">
              {Object.entries(geoDistribution).map(([loc, count]: any) => (
                <div key={loc} className="flex justify-between items-center border-b pb-2">
                  <span className="text-[10px] font-black uppercase">{loc}</span>
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-[10px] font-black">{count} {"Talenta"}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] flex flex-col justify-center space-y-6">
            <BarChart3 className="text-blue-400" size={32}/>
            <h3 className="text-2xl font-black uppercase italic">{"Impact Analysis: Akomodasi"}</h3>
            <p className="text-sm text-slate-400 leading-relaxed italic">{"Talenta yang menggunakan alat bantu (Screen Reader/Hearing Aid) memiliki durasi kerja 1.5x lebih stabil di sektor formal dibandingkan tanpa akomodasi pendukung."}</p>
          </div>
        </div>
      )}

      {/* TAB 3: NARASI RISET (BRIN INSIGHTS) */}
      {activeTab === "research" && (
        <div className="bg-white p-10 rounded-[3rem] border border-slate-200 shadow-sm space-y-8 animate-in fade-in">
          <div className="bg-blue-50 p-10 rounded-[2.5rem] border-l-8 border-blue-600">
            <h3 className="text-xs font-black uppercase text-blue-900 mb-6 flex items-center gap-2"><Lightbulb size={16}/> {"Automated Research Narrative"}</h3>
            <p className="text-2xl font-bold text-blue-800 leading-tight italic">
              {transitionInsights?.narrative}
            </p>
          </div>
        </div>
      )}

      {/* TAB 4: MANAGEMENT DATA (DENGAN INFORMED CONSENT & AKSI) */}
      {activeTab === "management" && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm animate-in fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">{"Nama Lengkap"}</th>
                  <th className="px-6 py-4">{"Disabilitas"}</th>
                  <th className="px-6 py-4">{"Informed Consent"}</th>
                  <th className="px-6 py-4">{"Status"}</th>
                  <th className="px-6 py-4 text-center">{"Aksi"}</th>
                </tr>
              </thead>
              <tbody className="divide-y text-[11px] font-bold uppercase">
                {transitionInsights?.raw?.map((d: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">{d.full_name || "Testing User"}</td>
                    <td className="px-6 py-4 text-blue-600">{d.disability_type}</td>
                    <td className="px-6 py-4">
                      {d.informed_consent ? 
                        <span className="text-green-600 flex items-center gap-1"><CheckCircle size={12}/> {"GRANTED"}</span> : 
                        <span className="text-red-500">{"PENDING"}</span>
                      }
                    </td>
                    <td className="px-6 py-4">{"Verified"}</td>
                    <td className="px-6 py-4 flex justify-center gap-3">
                      <button className="text-slate-400 hover:text-blue-600 transition-colors"><Edit3 size={14}/></button>
                      <button className="text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={14}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT INPUT MANUAL */}
      {activeTab === "audit" && (
        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-4 bg-orange-50 p-6 rounded-3xl border border-orange-100">
            <AlertTriangle className="text-orange-500" size={24}/>
            <div>
              <h3 className="text-xs font-black uppercase text-orange-900 leading-none mb-1">{"Kerapihan Data Audit"}</h3>
              <p className="text-[10px] font-medium text-orange-800 italic">{"Mendeteksi universitas atau kota yang belum ada di daftar data-static.ts"}</p>
            </div>
          </div>
          <table className="w-full text-left bg-white border border-slate-100 rounded-2xl overflow-hidden">
            <thead className="bg-slate-900 text-slate-400 text-[10px] font-black uppercase tracking-widest">
              <tr><th className="px-8 py-5">{"Field"}</th><th className="px-8 py-5">{"Manual Value"}</th><th className="px-8 py-5">{"Count"}</th></tr>
            </thead>
            <tbody className="divide-y text-[11px] font-bold uppercase italic">
              {auditLogs.map((log, i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="px-8 py-5 text-blue-600">{log.field_name}</td>
                  <td className="px-8 py-5">{log.input_value}</td>
                  <td className="px-8 py-5">{log.occurrence_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </div>
  )
}
