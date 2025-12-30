"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
// ACTIONS
import { 
  getNationalStats, 
  getTransitionInsights, 
  getManualInputAudit 
} from "@/lib/actions/admin" 
// UI ICONS
import { 
  Users, Building2, BarChart3, ShieldCheck, Database, 
  GraduationCap, Download, AlertTriangle, LayoutDashboard, 
  FileText, CheckCircle, Trash2, Edit3, Lightbulb, Map, 
  Search, ExternalLink, UserCheck, Building, X, Save,
  FileSpreadsheet, ArrowRight
} from "lucide-react"

export default function AdminDashboard({ user }: { user: any }) {
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("snapshot")
  const [msg, setMsg] = useState("")
  const msgRef = useRef<HTMLDivElement>(null)
  
  // -- DATA STATE --
  const [nationalStats, setNationalStats] = useState<any>(null)
  const [transitionInsights, setTransitionInsights] = useState<any>(null)
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [allTalents, setAllTalents] = useState<any[]>([])
  const [allCompanies, setAllCompanies] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  // -- MODAL STATE --
  const [editItem, setEditItem] = useState<any>(null)
  const [editTable, setEditTable] = useState<string>("")
  const [isSavingEdit, setIsSavingEdit] = useState(false)

  useEffect(() => {
    loadAllAdminData()
  }, [])

  async function loadAllAdminData() {
    setLoading(true)
    try {
      const [nData, tData, aData, talentsRes, compsRes] = await Promise.all([
        getNationalStats(),
        getTransitionInsights(),
        getManualInputAudit(),
        supabase.from('profiles').select('*').eq('role', 'talent').order('created_at', { ascending: false }),
        supabase.from('companies').select('*').order('created_at', { ascending: false })
      ])
      
      setNationalStats(nData)
      setTransitionInsights(tData)
      setAuditLogs(aData)
      setAllTalents(talentsRes.data || [])
      setAllCompanies(compsRes.data || [])
    } catch (e) {
      console.error("Gagal sinkronisasi data:", e)
    } finally {
      setLoading(false)
    }
  }

  // --- FITUR EXPORT CSV (RISET BRIN) ---
  const exportToCSV = (data: any[], fileName: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map(obj => 
      Object.values(obj).map(val => `"${String(val).replace(/"/g, '""')}"`).join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${fileName}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    setMsg(`Berhasil mengekspor ${fileName} ke CSV.`);
  }

  // --- LOGIKA VERIFIKASI ---
  async function toggleVerify(table: string, id: string, currentStatus: boolean) {
    const { error } = await supabase.from(table).update({ is_verified: !currentStatus }).eq('id', id)
    if (!error) { setMsg("Status verifikasi diperbarui."); loadAllAdminData() }
  }

  // --- LOGIKA EDIT & DELETE ---
  const openEditModal = (item: any, tableName: string) => {
    setEditItem({ ...item })
    setEditTable(tableName)
  }

  async function handleUpdateData() {
    setIsSavingEdit(true)
    const { error } = await supabase.from(editTable).update(editItem).eq('id', editItem.id)
    if (!error) {
        setMsg(`Data ${editTable} berhasil dikoreksi.`);
        setEditItem(null);
        loadAllAdminData();
    }
    setIsSavingEdit(false)
  }

  async function handleDelete(table: string, id: string) {
    if(!confirm("Hapus data secara permanen dari database riset?")) return
    const { error } = await supabase.from(table).delete().eq('id', id)
    if (!error) { setMsg(`Data ${table} berhasil dihapus.`); loadAllAdminData() }
  }

  if (loading) return <div className="p-20 text-center font-black animate-pulse text-slate-400 italic">{"MENYIAPKAN COMMAND CENTER RISET..."}</div>

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER COMMAND CENTER */}
      <header className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-black tracking-tighter uppercase italic leading-none">{"Admin Command Center"}</h2>
          <p className="text-blue-400 text-[10px] font-black flex items-center gap-2 uppercase tracking-widest">
            <ShieldCheck size={14}/> {"Principal Researcher: "}{user.email} {" (BRIN)"}
          </p>
        </div>
        <nav className="flex bg-white/5 p-2 rounded-2xl gap-1 overflow-x-auto w-full md:w-auto">
          {[
            { id: "snapshot", label: "Overview", icon: LayoutDashboard },
            { id: "talent_mgmt", label: "Talenta", icon: Users },
            { id: "company_mgmt", label: "Mitra", icon: Building },
            { id: "audit", label: "Audit Manual", icon: AlertTriangle }
          ].map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 transition-all ${activeTab === t.id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/10'}`}>
              <t.icon size={14}/> {t.label}
            </button>
          ))}
        </nav>
      </header>

      {msg && <div ref={msgRef} tabIndex={-1} className="p-4 bg-blue-50 text-blue-700 text-[10px] font-black uppercase text-center rounded-2xl border border-blue-200 outline-none">{"✅ "}{msg}</div>}

      {/* TAB 1: SNAPSHOT */}
      {activeTab === "snapshot" && (
        <div className="space-y-8 animate-in slide-in-from-bottom-2">
            <div className="flex justify-between items-center px-4">
                <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">{"National Metrics"}</h3>
                <button onClick={() => exportToCSV(allTalents, 'Dataset_Talenta_Nasional')} className="bg-green-600 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase flex items-center gap-2 shadow-xl hover:bg-green-700 transition-all">
                    <FileSpreadsheet size={16}/> {"Export Dataset to CSV"}
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <Users className="text-blue-600 mb-2" size={24}/>
                    <h3 className="text-[9px] font-black text-slate-400 uppercase">{"Total Responden"}</h3>
                    <p className="text-4xl font-black">{allTalents.length}</p>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <Building2 className="text-purple-600 mb-2" size={24}/>
                    <h3 className="text-[9px] font-black text-slate-400 uppercase">{"Mitra Industri"}</h3>
                    <p className="text-4xl font-black">{allCompanies.length}</p>
                </div>
            </div>
        </div>
      )}

      {/* TAB 2: TALENT MANAGEMENT */}
      {activeTab === "talent_mgmt" && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-black uppercase italic text-blue-600 flex items-center gap-2"><Users/> {"Database Talenta Nasional"}</h3>
                <div className="relative"><Search className="absolute left-3 top-2.5 text-slate-400" size={16}/><input placeholder="Cari Nama/Kota..." className="input-std h-10 pl-10 text-[10px] w-64" onChange={e => setSearchQuery(e.target.value)} /></div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left" aria-label="Tabel Talent">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b">
                        <tr>
                            <th className="px-6 py-4">{"Nama & Ragam"}</th>
                            <th className="px-6 py-4">{"Pendidikan"}</th>
                            <th className="px-6 py-4">{"Consent"}</th>
                            <th className="px-6 py-4">{"Bukti"}</th>
                            <th className="px-6 py-4 text-center">{"Verifikasi"}</th>
                            <th className="px-6 py-4 text-center">{"Aksi"}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y text-[11px] font-bold">
                        {allTalents.filter(t => t.full_name?.toLowerCase().includes(searchQuery.toLowerCase())).map(t => (
                            <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="text-slate-900 font-black uppercase">{t.full_name}</div>
                                    <div className="text-[9px] text-blue-600 uppercase italic">{t.disability_type}</div>
                                </td>
                                <td className="px-6 py-4 text-slate-500 uppercase">{t.education_level} - {t.major}</td>
                                <td className="px-6 py-4">{t.has_informed_consent ? <span className="text-green-600">{"YES"}</span> : <span className="text-red-500">{"NO"}</span>}</td>
                                <td className="px-6 py-4">
                                    {t.document_disability_url && <button onClick={() => window.open(t.document_disability_url)} className="text-blue-600"><ExternalLink size={14}/></button>}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => toggleVerify('profiles', t.id, t.is_verified)} className={`px-4 py-1.5 rounded-full font-black text-[9px] uppercase ${t.is_verified ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                                        {t.is_verified ? "Verified" : "Verify"}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center gap-3">
                                        <button onClick={() => openEditModal(t, 'profiles')} className="text-slate-400 hover:text-blue-600"><Edit3 size={16}/></button>
                                        <button onClick={() => handleDelete('profiles', t.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={16}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {/* TAB 3: COMPANY MANAGEMENT */}
      {activeTab === "company_mgmt" && (
        <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6 animate-in fade-in">
            <h3 className="text-xl font-black uppercase italic text-purple-600 flex items-center gap-2"><Building size={24}/> {"Database Mitra Instansi"}</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 border-b">
                        <tr>
                            <th className="px-6 py-4">{"Nama Instansi"}</th>
                            <th className="px-6 py-4">{"Industri & Lokasi"}</th>
                            <th className="px-6 py-4 text-center">{"Verifikasi"}</th>
                            <th className="px-6 py-4 text-center">{"Aksi"}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y text-[11px] font-bold">
                        {allCompanies.map(c => (
                            <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4 font-black uppercase text-slate-900">{c.name}</td>
                                <td className="px-6 py-4 text-slate-500 uppercase">{c.industry} - {c.location}</td>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => toggleVerify('companies', c.id, c.is_verified)} className={`px-4 py-1.5 rounded-full font-black text-[9px] uppercase ${c.is_verified ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                                        {c.is_verified ? "Partner" : "Verify"}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex justify-center gap-3">
                                        <button onClick={() => openEditModal(c, 'companies')} className="text-slate-400 hover:text-blue-600"><Edit3 size={16}/></button>
                                        <button onClick={() => handleDelete('companies', c.id)} className="text-slate-400 hover:text-red-600"><Trash2 size={16}/></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {/* TAB 4: AUDIT MANUAL (Variabel Riset BRIN) */}
      {activeTab === "audit" && (
        <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6 animate-in fade-in">
          <div className="flex items-center gap-5 bg-orange-50 p-6 rounded-3xl border border-orange-100">
            <AlertTriangle className="text-orange-500 shrink-0" size={28}/>
            <div>
              <h3 className="text-sm font-black uppercase text-orange-900 leading-none mb-1">{"Manual Entry Audit Control"}</h3>
              <p className="text-[10px] font-bold text-orange-800 italic uppercase">{"Melacak data di luar daftar (Universitas/Kota) untuk diseragamkan."}</p>
            </div>
          </div>
          <div className="overflow-x-auto rounded-3xl border border-slate-100">
            <table className="w-full text-left">
              <thead className="bg-slate-900 text-slate-400 text-[10px] font-black uppercase">
                <tr><th className="px-8 py-5">{"Variabel"}</th><th className="px-8 py-5">{"Nilai Input User"}</th><th className="px-8 py-5">{"Kemunculan"}</th></tr>
              </thead>
              <tbody className="divide-y text-[11px] font-bold italic uppercase">
                {auditLogs.map((log, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-8 py-5 text-blue-600">{log.field_name}</td>
                    <td className="px-8 py-5 text-slate-900">{log.input_value}</td>
                    <td className="px-8 py-5 text-slate-500">{log.occurrence_count} {"Kali"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* MODAL UNIVERSAL EDITOR */}
      {editItem && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl p-10 space-y-6 relative animate-in zoom-in-95 duration-200">
                <button onClick={() => setEditItem(null)} className="absolute right-8 top-8 text-slate-400 hover:text-slate-900"><X size={24}/></button>
                <h4 className="text-xl font-black uppercase italic text-blue-600">{"Koreksi Data Database"}</h4>

                <div className="space-y-4 pt-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-500">{"Nama Lengkap / Instansi"}</label>
                        <input value={editTable === 'profiles' ? editItem.full_name : editItem.name} 
                               onChange={e => setEditItem({...editItem, [editTable === 'profiles' ? 'full_name' : 'name']: e.target.value})} 
                               className="input-std font-bold" />
                    </div>
                    {editTable === 'profiles' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">{"Major"}</label><input value={editItem.major || ""} onChange={e => setEditItem({...editItem, major: e.target.value})} className="input-std" /></div>
                            <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">{"University"}</label><input value={editItem.university || ""} onChange={e => setEditItem({...editItem, university: e.target.value})} className="input-std" /></div>
                        </div>
                    )}
                    <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500">{"Kota / Lokasi"}</label><input value={editItem.city || editItem.location || ""} onChange={e => setEditItem({...editItem, [editTable === 'profiles' ? 'city' : 'location']: e.target.value})} className="input-std" /></div>
                </div>

                <div className="flex gap-4 pt-6">
                    <button onClick={handleUpdateData} disabled={isSavingEdit} className="flex-1 h-14 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-2">
                        {isSavingEdit ? "SAVING..." : <><Save size={18}/> {"Update Database"}</>}
                    </button>
                    <button onClick={() => setEditItem(null)} className="px-8 h-14 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest">{"Batal"}</button>
                </div>
            </div>
        </div>
      )}

    </div>
  )
}
