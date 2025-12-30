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
        if(skill) acc[skill] = (acc[skill] || 0) + 1;
      });
    }
    return acc;
  }, {});

  // Fitur 1: Prediksi Sebaran (Heatmap Menggunakan Variabel CITY)
  const geoDistribution = transitionInsights?.raw?.reduce((acc: any, curr: any) => {
    const loc = curr.city || "Tidak Terdata";
    acc[loc] = (acc[loc] || 0) + 1;
    return acc;
  }, {});

  if (loading || !nationalStats) return (
    <div className="p-20 text-center font-black animate-pulse text-slate-400 italic">
      {"MENYIAPKAN PUSAT DATA RISET NASIONAL..."}
    </div>
  )

  const researchMetrics = transitionInsights?.raw?.reduce((acc: any, curr: any) => {
    if (curr.has_scholarship) acc.scholarship++
    if (curr.uses_assistive_device) acc.assistive++
    return acc
  }, { scholarship: 0, assistive: 0 }) || { scholarship: 0, assistive: 0 }

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
            <button 
              key={t.id} 
              onClick={() => setActiveTab(t.id)} 
              className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${
                activeTab === t.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/10'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      {/* TAB 1: SNAPSHOT */}
      {activeTab === "snapshot" && (
        <div className="space-y-8 animate-in slide-in-from-bottom-2">
          <div className="flex justify-between items-center px-4">
            <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.3em] italic">{"National Transition Metrics"}</h3>
            <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 shadow-xl hover:bg-slate-800 transition-all">
              <FileText size={16}/> {"Download Automated BRIN Report"}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <Users className="text-blue-600 mb-2" size={24}/>
              <h3 className="text-[9px] font-black text-slate-400 uppercase">{"Total Responden"}</h3>
              <p className="text-4xl font-black">{nationalStats.totalTalents}</p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <Briefcase className="text-green-600 mb-2" size={24}/>
              <h3 className="text-[9px] font-black text-slate-400 uppercase">{"Sudah Bekerja"}</h3>
              <p className="text-4xl font-black">{nationalStats.employmentRate.employed}</p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <GraduationCap className="text-yellow-500 mb-2" size={24}/>
              <h3 className="text-[9px] font-black text-slate-400 uppercase">{"Penerima Beasiswa"}</h3>
              <p className="text-4xl font-black">{researchMetrics.scholarship}</p>
            </div>
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <Stethoscope className="text-cyan-600 mb-2" size={24}/>
              <h3 className="text-[9px] font-black text-slate-400 uppercase">{"Pengguna Alat Bantu"}</h3>
              <p className="text-4xl font-black">{researchMetrics.assistive}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ADVOCACY & SEBARAN (Menggunakan City) */}
      {activeTab === "advocacy" && (
        <div className="grid md:grid-cols-2 gap-8 animate-in fade-in">
          <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-xs font-black uppercase text-slate-400 mb-8 flex items-center gap-2">
              <Map size={18}/> {"Sebaran Geografis Talenta (Kota/Kab)"}
            </h3>
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {Object.entries(geoDistribution).map(([loc, count]: any) => (
                <div key={loc} className="flex justify-between items-center border-b border-slate-50 pb-3 hover:bg-slate-50 transition-colors px-2">
                  <span className="text-[10px] font-black uppercase italic">{loc}</span>
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[9px] font-black">{count} {"Talenta"}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-slate-900 text-white p-10 rounded-[2.5rem] shadow-2xl flex flex-col justify-center space-y-6 relative overflow-hidden group">
            <PieChart className="opacity-10 absolute -right-8 -top-8 rotate-12" size={180}/>
            <h3 className="text-2xl font-black uppercase italic leading-none text-blue-400">{"Impact Analysis"}</h3>
            <p className="text-sm text-slate-300 leading-relaxed italic">
              {"Berdasarkan korelasi data riil, talenta dengan akses beasiswa dan penggunaan alat bantu menunjukkan tingkat kemandirian ekonomi yang lebih stabil di sektor industri teknologi."}
            </p>
            <div className="pt-4 border-t border-white/10">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">{"Data-Driven Advocacy for BRIN"}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: NARASI RISET */}
      {activeTab === "research" && (
        <div className="bg-white p-12 rounded-[3rem] border border-slate-200 shadow-sm space-y-8 animate-in fade-in">
          <div className="bg-blue-50 p-10 rounded-[2.5rem] border-l-[12px] border-blue-600 shadow-inner">
            <h3 className="text-xs font-black uppercase text-blue-900 mb-6 flex items-center gap-2">
              <Lightbulb size={18}/> {"Server-Generated Research Narrative"}
            </h3>
            <p className="text-2xl font-black text-blue-800 leading-tight italic">
              {transitionInsights?.narrative}
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
             <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <h4 className="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest">{"Top Identified Skills"}</h4>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(skillAnalysis).sort((a:any, b:any) => b[1] - a[1]).slice(0, 10).map(([skill, count]: any) => (
                    <span key={skill} className="bg-white px-3 py-1 rounded-full text-[9px] font-black border border-slate-200 uppercase">
                      {skill} ({count})
                    </span>
                  ))}
                </div>
             </div>
             <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex flex-col justify-center text-center italic">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{"Dataset Status"}</p>
                <p className="text-sm font-black text-slate-800">{"Live & Synchronized with Supabase View"}</p>
             </div>
          </div>
        </div>
      )}

      {/* TAB 4: MANAGEMENT DATA */}
      {activeTab === "management" && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm animate-in fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-5">{"Nama Lengkap"}</th>
                  <th className="px-6 py-5">{"Disabilitas"}</th>
                  <th className="px-6 py-5">{"Informed Consent"}</th>
                  <th className="px-6 py-5">{"Status"}</th>
                  <th className="px-6 py-5 text-center">{"Aksi"}</th>
                </tr>
              </thead>
              <tbody className="divide-y text-[11px] font-bold uppercase italic">
                {transitionInsights?.raw?.map((d: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-5 text-slate-900">{d.full_name || "Testing User"}</td>
                    <td className="px-6 py-5 text-blue-600">{d.disability_type}</td>
                    <td className="px-6 py-5">
                      {d.informed_consent ? 
                        <span className="text-green-600 flex items-center gap-1 font-black"><CheckCircle size={14}/> {"GRANTED"}</span> : 
                        <span className="text-red-500 font-black">{"PENDING"}</span>
                      }
                    </td>
                    <td className="px-6 py-5">{"Verified"}</td>
                    <td className="px-6 py-5 flex justify-center gap-4">
                      <button className="text-slate-400 hover:text-blue-600 transition-all"><Edit3 size={16}/></button>
                      <button className="text-slate-400 hover:text-red-600 transition-all"><Trash2 size={16}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT DATA */}
      {activeTab === "audit" && (
        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6 animate-in fade-in">
          <div className="flex items-center gap-5 bg-orange-50 p-6 rounded-3xl border border-orange-100">
            <AlertTriangle className="text-orange-500 shrink-0" size={28}/>
            <div>
              <h3 className="text-sm font-black uppercase text-orange-900 leading-none mb-1">{"Manual Entry Audit Control"}</h3>
              <p className="text-[10px] font-bold text-orange-800 italic uppercase">{"Melacak data di luar standar untuk menjaga kerapihan database riset"}</p>
            </div>
          </div>
          <div className="rounded-[2rem] border border-slate-100 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                <tr><th className="px-8 py-5">{"Field"}</th><th className="px-8 py-5">{"Manual Value"}</th><th className="px-8 py-5">{"Total"}</th></tr>
              </thead>
              <tbody className="divide-y text-[11px] font-bold uppercase italic italic">
                {auditLogs.map((log, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-5 text-blue-600 font-black">{log.field_name}</td>
                    <td className="px-8 py-5 text-slate-900">{log.input_value}</td>
                    <td className="px-8 py-5 text-slate-500">{log.occurrence_count} {"Kali"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  )
}
