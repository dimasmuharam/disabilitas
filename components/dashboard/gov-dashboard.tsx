"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { 
  DISABILITY_TYPES, 
  EDUCATION_LEVELS 
} from "@/lib/data-static"
import { 
  BarChart3, FileSearch, Printer, ShieldCheck, 
  Users2, TrendingUp, Building, Globe2, PieChart
} from "lucide-react"

export default function GovDashboard({ user }: { user: any }) {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("statistics") // statistics | simulation | monitoring
  const [nationalStats, setNationalStats] = useState<any>({})
  
  // Validasi dan set agency_name dengan fallback
  const agencyName = user?.agency_name || user?.user_metadata?.agency_name || "Kementerian"
  
  // -- STATE SIMULASI --
  const [targetEducation, setTargetEducation] = useState("S1")
  const [targetDisability, setTargetDisability] = useState("Semua")
  const [maxAge, setMaxAge] = useState(35)
  const [simulationResult, setSimulationResult] = useState<any[]>([])
  const [isSimulating, setIsSimulating] = useState(false)

  // -- STATE MONITORING INTERNAL (HANYA INSTANSI LOGIN) --
  const [internalAsnData, setInternalAsnData] = useState<any[]>([])

  // Log untuk debugging
  useEffect(() => {
    console.log('[GOV-DASHBOARD] User data:', { 
      role: user?.role, 
      agency_name: user?.agency_name,
      email: user?.email 
    })
  }, [user])

  useEffect(() => {
    fetchGlobalData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchGlobalData() {
    setLoading(true)
    try {
      console.log('[GOV-DASHBOARD] Fetching data for agency:', agencyName)
      
      // 1. Ambil Statistik Nasional untuk Tab "Statistik" & "Simulasi"
      const { data: allProfiles } = await supabase.from("profiles").select("disability_type, education_level, date_of_birth, career_status, current_agency")
      
      if (allProfiles) {
        // Hitung statistik nasional sederhana
        const counts: any = { total: allProfiles.length }
        DISABILITY_TYPES.forEach(t => {
          counts[t] = allProfiles.filter(p => p.disability_type === t).length
        })
        setNationalStats(counts)

        // 2. Filter data Monitoring Karir (Hanya yang satu instansi dengan user login)
        const internal = allProfiles.filter(p => 
          p.career_status === "ASN" && 
          p.current_agency === agencyName 
        )
        setInternalAsnData(internal)
        console.log('[GOV-DASHBOARD] Internal ASN data found:', internal.length)
      }
    } catch (e) { 
      console.error('[GOV-DASHBOARD] Error fetching data:', e) 
    } finally { 
      setLoading(false) 
    }
  }

  // Fungsi Simulasi (Nasional)
  async function handleRunSimulation() {
    setIsSimulating(true)
    const { data } = await supabase.from("profiles").select("*")
    if (data) {
      const filtered = data.filter(p => {
        const age = p.date_of_birth ? new Date().getFullYear() - new Date(p.date_of_birth).getFullYear() : 99
        const matchEdu = targetEducation === "Semua" || p.education_level === targetEducation
        const matchDis = targetDisability === "Semua" || p.disability_type === targetDisability
        return matchEdu && matchDis && age <= maxAge
      })
      setSimulationResult(filtered)
    }
    setIsSimulating(false)
  }

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-400">{"Sinkronisasi Data Nasional..."}</div>

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* HEADER & NAVIGASI */}
      <div className="bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-slate-900 rounded-2xl text-blue-400"><Building size={32}/></div>
          <div>
            <h2 className="text-xl font-black uppercase italic tracking-tighter">{"Gov Dashboard"}</h2>
            <p className="text-[10px] font-bold text-slate-500 uppercase">{"Instansi: "}{agencyName}</p>
          </div>
        </div>
        <nav className="flex bg-slate-100 p-2 rounded-2xl gap-1">
          {[
            { id: "statistics", label: "Statistik", icon: <PieChart size={14}/> },
            { id: "simulation", label: "Simulasi", icon: <FileSearch size={14}/> },
            { id: "monitoring", label: "Karir ASN", icon: <TrendingUp size={14}/> }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)} 
              className={`px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === tab.id ? "bg-blue-600 text-white shadow-md" : "text-slate-500 hover:bg-white"}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* TAB 1: STATISTIK NASIONAL */}
      {activeTab === "statistics" && (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in slide-in-from-bottom-4">
          <div className="md:col-span-2 lg:col-span-2 bg-slate-900 text-white p-10 rounded-[2.5rem] relative overflow-hidden">
            <h3 className="text-4xl font-black tracking-tighter mb-2">{nationalStats.total}</h3>
            <p className="text-[10px] font-black uppercase text-blue-400 tracking-widest">{"Total Talenta Terdaftar Nasional"}</p>
            <Globe2 className="absolute -right-10 -bottom-10 opacity-10" size={200}/>
          </div>
          {DISABILITY_TYPES.slice(0, 2).map(type => (
            <div key={type} className="bg-white p-8 rounded-[2.5rem] border border-slate-200">
              <p className="text-[9px] font-black uppercase text-slate-400 mb-1">{type}</p>
              <h4 className="text-3xl font-black">{nationalStats[type] || 0}</h4>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: SIMULASI FORMASI (NASIONAL) */}
      {activeTab === "simulation" && (
        <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in">
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] space-y-6">
            <h3 className="font-black uppercase italic text-xs text-blue-400">{"Simulator Kebutuhan CASN"}</h3>
            <div className="space-y-4">
              <select value={targetEducation} onChange={e => setTargetEducation(e.target.value)} className="w-full bg-white/10 border-none rounded-xl p-3 text-xs font-bold text-white uppercase italic">
                {EDUCATION_LEVELS.map(e => <option key={e} value={e} className="text-black">{e}</option>)}
              </select>
              <input type="number" value={maxAge} onChange={e => setMaxAge(parseInt(e.target.value))} className="w-full bg-white/10 border-none rounded-xl p-3 text-xs font-bold" placeholder="Batas Usia" />
              <button onClick={handleRunSimulation} className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all">{"Cek Ketersediaan"}</button>
            </div>
          </div>
          <div className="lg:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-200 flex flex-col justify-center items-center text-center">
             <span className="text-9xl font-black tracking-tighter text-slate-900">{simulationResult.length}</span>
             <p className="font-black uppercase italic text-blue-600">{"Talenta Nasional Tersedia"}</p>
             {simulationResult.length > 0 && <button className="mt-6 flex items-center gap-2 px-6 py-3 bg-slate-100 rounded-xl text-[9px] font-black uppercase"><Printer size={14}/> {"Cetak Policy Brief"}</button>}
          </div>
        </div>
      )}

      {/* TAB 3: MONITORING KARIR (INTERNAL INSTANSI) */}
      {activeTab === "monitoring" && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-blue-600 text-white p-10 rounded-[2.5rem]">
            <h3 className="text-2xl font-black italic uppercase">{"Internal Career Tracker"}</h3>
            <p className="text-sm opacity-80 mt-2">{"Menampilkan data ASN Disabilitas khusus di lingkungan "}{agencyName}</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200">
              <p className="text-[10px] font-black text-slate-400 uppercase">{"Jumlah Personel"}</p>
              <h4 className="text-4xl font-black">{internalAsnData.length}</h4>
            </div>
            {/* List atau grafik perkembangan karir internal bisa ditambahkan di sini */}
          </div>

          {internalAsnData.length === 0 && (
            <div className="p-20 text-center border-2 border-dashed border-slate-200 rounded-[2.5rem]">
              <p className="text-xs font-bold text-slate-400 uppercase italic">{"Belum ada data ASN disabilitas yang tercatat di instansi ini."}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
