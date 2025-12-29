"use client"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { UNIVERSITIES } from "@/lib/data-static"

export default function CampusDashboard({ user }: { user: any }) {
  const [stats, setStats] = useState({ total: 0, wfo: 0, wfh: 0 })
  const [loading, setLoading] = useState(true)
  const [myCampus, setMyCampus] = useState("Universitas Indonesia (UI)") // Default placeholder

  useEffect(() => {
    fetchStats()
  }, [myCampus])

  async function fetchStats() {
    setLoading(true)
    // HITUNG: Berapa profil yang institution_name-nya sama dengan kampus saya
    const { data } = await supabase
        .from('profiles')
        .select('work_preference')
        .eq('institution_name', myCampus) // Filter by campus name
    
    if (data) {
        setStats({
            total: data.length,
            wfo: data.filter(d => d.work_preference === 'wfo').length,
            wfh: data.filter(d => d.work_preference === 'wfh' || d.work_preference === 'hybrid').length
        })
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold mb-4">Tracer Study & Alumni Monitor</h2>
        
        {/* Filter Kampus (Simulasi Admin Login sebagai Kampus Tertentu) */}
        <div className="mb-6 p-4 bg-slate-50 rounded border">
            <label className="block text-sm font-bold mb-2">Pantau Data Kampus:</label>
            <input list="universities" value={myCampus} onChange={(e) => setMyCampus(e.target.value)} className="input-std" />
            <datalist id="universities">{UNIVERSITIES.map(u => <option key={u} value={u} />)}</datalist>
            <p className="text-xs text-slate-500 mt-1">Ganti nama kampus di atas untuk melihat simulasi data alumni mereka.</p>
        </div>
        
        {loading ? <p>Menghitung data...</p> : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded bg-blue-50 border-blue-100">
                    <h3 className="text-sm font-bold text-blue-800">Total Alumni Terdaftar</h3>
                    <p className="text-3xl font-bold text-blue-900">{stats.total} <span className="text-sm font-normal">Mahasiswa</span></p>
                </div>
                <div className="p-4 border rounded bg-green-50 border-green-100">
                    <h3 className="text-sm font-bold text-green-800">Siap Kerja Remote/Hybrid</h3>
                    <p className="text-3xl font-bold text-green-900">{stats.wfh}</p>
                </div>
                <div className="p-4 border rounded bg-orange-50 border-orange-100">
                    <h3 className="text-sm font-bold text-orange-800">Preferensi WFO (Kantor)</h3>
                    <p className="text-3xl font-bold text-orange-900">{stats.wfo}</p>
                </div>
            </div>
        )}

        <div className="mt-6">
            <h3 className="font-bold mb-2">Sebaran Jurusan (Top 3)</h3>
            <div className="h-40 bg-slate-100 rounded flex items-center justify-center text-slate-400 border border-dashed border-slate-300">
               {stats.total > 0 ? "Grafik akan muncul saat data > 10 alumni" : "Belum ada data alumni yang mendaftar"}
            </div>
        </div>
      </div>
    </div>
  )
}
