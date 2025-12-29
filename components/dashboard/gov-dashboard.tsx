"use client"
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export default function GovDashboard({ user }: { user: any }) {
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNationalStats()
  }, [])

  async function fetchNationalStats() {
    // Ambil SEMUA data profil (Hanya kolom disabilitas) untuk dihitung
    const { data } = await supabase.from('profiles').select('disability_category')
    
    if (data) {
        // Hitung Grouping Manual (Client Side Aggregation)
        const counts: any = {
            "Sensorik Netra": 0, "Sensorik Rungu": 0, "Fisik": 0, 
            "Intelektual": 0, "Mental": 0, "Non-Disabilitas": 0, "Total": data.length
        }

        data.forEach((p: any) => {
            if(p.disability_category && counts[p.disability_category] !== undefined) {
                counts[p.disability_category]++
            }
        })
        setStats(counts)
    }
    setLoading(false)
  }

  // Komponen Grafik Batang Sederhana (Accessible HTML Chart)
  const Bar = ({ label, value, total }: { label: string, value: number, total: number }) => {
     const percent = total > 0 ? (value / total) * 100 : 0
     return (
        <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
                <span>{label}</span>
                <span className="font-bold">{value} Org</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 dark:bg-slate-700">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${percent}%` }}></div>
            </div>
        </div>
     )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 p-6 rounded-lg border border-slate-200 dark:border-slate-800">
        <h2 className="text-xl font-bold mb-2">Statistik Nasional Disabilitas</h2>
        <p className="text-slate-600 mb-6">Data real-time dari registrasi talenta di seluruh Indonesia.</p>
        
        {loading ? <p>Menghitung data nasional...</p> : (
            <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Ringkasan Angka */}
                    <div className="bg-blue-900 text-white p-6 rounded-lg shadow-lg">
                        <h3 className="text-lg opacity-80">Total Talenta Terdaftar</h3>
                        <p className="text-5xl font-bold mt-2">{stats["Total"] || 0}</p>
                        <p className="text-sm mt-4 opacity-70">Update: Realtime</p>
                    </div>

                    {/* Grafik Batang */}
                    <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-800/50">
                        <h3 className="font-bold mb-4">Sebaran Ragam Disabilitas</h3>
                        <Bar label="Sensorik Netra" value={stats["Sensorik Netra"] || 0} total={stats["Total"]} />
                        <Bar label="Sensorik Rungu" value={stats["Sensorik Rungu"] || 0} total={stats["Total"]} />
                        <Bar label="Fisik / Daksa" value={stats["Fisik"] || 0} total={stats["Total"]} />
                        <Bar label="Intelektual" value={stats["Intelektual"] || 0} total={stats["Total"]} />
                        <Bar label="Mental" value={stats["Mental"] || 0} total={stats["Total"]} />
                    </div>
                </div>

                <div className="mt-8">
                    <h3 className="font-bold mb-2">Analisis Kebijakan</h3>
                    <p className="text-sm text-slate-600">
                        *Data ini dapat digunakan sebagai dasar pengajuan kuota formasi CPNS/BUMN sesuai UU No. 8/2016.
                        Jika data 'Fisik' mendominasi, disarankan memperbanyak aksesibilitas bangunan fisik di kantor pemerintah.
                    </p>
                </div>
            </>
        )}
      </div>
    </div>
  )
}
