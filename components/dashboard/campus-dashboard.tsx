"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { 
  UNIVERSITIES, TRAINING_PARTNERS, COMMUNITY_PARTNERS 
} from "@/lib/data-static"
import { 
  Users, CheckCircle, Globe, Building2, PieChart, MapPin, 
  TrendingUp, Award, ExternalLink, ShieldCheck, Search
} from "lucide-react"

export default function CampusDashboard({ user }: { user: any }) {
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState<string | null>(null)
  const [stats, setStats] = useState({ 
    total: 0, hired: 0, wfh: 0, wfo: 0,
    disabilityMap: {} as Record<string, number>,
    ownedSkills: {} as Record<string, number>,
    marketDemandedSkills: ["Digital Marketing", "Analisis Data / Statistik", "Web Development"]
  })
  const [pendingCerts, setPendingCerts] = useState<any[]>([])
  
  const isSuperAdmin = user?.role === "super_admin"
  const [myCampus, setMyCampus] = useState(user?.partner_institution || "Universitas Indonesia (UI)") 
  const [partnerType, setPartnerType] = useState("University")

  const ALL_PARTNERS = [...UNIVERSITIES, ...TRAINING_PARTNERS, ...COMMUNITY_PARTNERS].sort();

  useEffect(() => {
    fetchPartnerData()
  }, [myCampus, partnerType])

  async function fetchPartnerData() {
    setLoading(true)
    try {
      // 1. AMBIL DATA SERTIFIKAT UNTUK VERIFIKASI
      const { data: certs } = await supabase
        .from("certifications")
        .select("*, profiles(full_name, disability_type)")
        .eq("organizer_name", myCampus)
        .order("created_at", { ascending: false })
      
      if (certs) setPendingCerts(certs)

      // 2. HITUNG STATISTIK (SINKRON DENGAN BENCHMARK)
      let talentIds: string[] = []
      if (partnerType === "University") {
        const { data: profiles } = await supabase.from("profiles").select("id").eq("university", myCampus)
        if (profiles) talentIds = profiles.map(p => p.id)
      } else {
        if (certs) talentIds = Array.from(new Set(certs.map(c => c.profile_id)))
      }

      if (talentIds.length > 0) {
        const { data: detailData } = await supabase.from("profiles").select("*").in("id", talentIds)
        if (detailData) {
          const dMap: Record<string, number> = {}
          const sMap: Record<string, number> = {}
          detailData.forEach(item => {
            if (item.disability_type) dMap[item.disability_type] = (dMap[item.disability_type] || 0) + 1
            if (item.skills) item.skills.forEach((s: string) => { sMap[s] = (sMap[s] || 0) + 1 })
          });
          setStats(prev => ({
            ...prev,
            total: detailData.length,
            hired: detailData.filter(d => d.career_status === "Employed").length,
            wfh: detailData.filter(d => d.work_preference !== "WFO (Di Kantor)").length,
            wfo: detailData.filter(d => d.work_preference === "WFO (Di Kantor)").length,
            disabilityMap: dMap,
            ownedSkills: sMap
          }))
        }
      }
    } catch (e) { console.error(e) } finally { setLoading(false) }
  }

  // FITUR UTAMA: VERIFIKASI SERTIFIKAT
  async function handleVerify(certId: string) {
    setVerifying(certId)
    // Di sini kita berasumsi ada kolom 'is_verified' di tabel certifications
    const { error } = await supabase
      .from("certifications")
      .update({ is_verified: true, verified_at: new Date(), verified_by: myCampus })
      .eq("id", certId)
    
    if (!error) {
      setPendingCerts(pendingCerts.map(c => c.id === certId ? { ...c, is_verified: true } : c))
    }
    setVerifying(null)
  }

  return (
    <div className="space-y-10 pb-20">
      {/* HEADER & FILTER */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">
          {"Pusat Verifikasi & Analisa Partner"}
        </h2>
        {isSuperAdmin && (
          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <select value={partnerType} onChange={(e) => setPartnerType(e.target.value)} className="input-std">
              <option value="University">{"Perguruan Tinggi"}</option>
              <option value="Training Center">{"Lembaga Pelatihan"}</option>
              <option value="Organization">{"Organisasi / Komunitas"}</option>
            </select>
            <input list="partners" value={myCampus} onChange={(e) => setMyCampus(e.target.value)} className="input-std" placeholder="Cari Lembaga..." />
            <datalist id="partners">{ALL_PARTNERS.map(p => <option key={p} value={p} />)}</datalist>
          </div>
        )}
      </div>

      {/* STATS SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900 text-white p-8 rounded-[2rem]">
          <Users className="text-blue-400 mb-2" size={24} />
          <p className="text-[9px] font-black uppercase opacity-60">{"Total Alumni"}</p>
          <h3 className="text-3xl font-black">{stats.total}</h3>
        </div>
        <div className="bg-blue-600 text-white p-8 rounded-[2rem]">
          <CheckCircle className="text-white/50 mb-2" size={24} />
          <p className="text-[9px] font-black uppercase opacity-60">{"Terserap Kerja"}</p>
          <h3 className="text-3xl font-black">{stats.hired}</h3>
        </div>
        {/* ... stats lainnya ... */}
      </div>

      {/* MODUL VERIFIKASI (FITUR UTAMA PARTNER) */}
      <section className="bg-white p-10 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <ShieldCheck className="text-blue-600" size={28} />
          <div>
            <h3 className="font-black uppercase italic tracking-tighter text-xl">{"Verifikasi Sertifikat Alumni"}</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase">{"Validasi klaim pelatihan talenta untuk akurasi data riset"}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                <th className="px-6 pb-2">{"Talenta"}</th>
                <th className="px-6 pb-2">{"Nama Sertifikasi"}</th>
                <th className="px-6 pb-2">{"Bukti"}</th>
                <th className="px-6 pb-2">{"Aksi"}</th>
              </tr>
            </thead>
            <tbody>
              {pendingCerts.map(cert => (
                <tr key={cert.id} className="bg-slate-50 rounded-2xl group transition-all hover:bg-slate-100">
                  <td className="px-6 py-4 rounded-l-2xl">
                    <p className="text-xs font-black uppercase text-slate-700">{cert.profiles?.full_name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">{cert.profiles?.disability_type}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-black uppercase text-blue-600">{cert.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase">{"Tahun: "}{cert.year}</p>
                  </td>
                  <td className="px-6 py-4">
                    {cert.certificate_url ? (
                      <a href={cert.certificate_url} target="_blank" className="flex items-center gap-1 text-[9px] font-black text-slate-500 hover:text-blue-600 uppercase">
                        <ExternalLink size={12}/> {"Buka File"}
                      </a>
                    ) : "-"}
                  </td>
                  <td className="px-6 py-4 rounded-r-2xl">
                    {cert.is_verified ? (
                      <span className="flex items-center gap-1 text-[9px] font-black text-green-600 uppercase bg-green-50 px-3 py-1 rounded-full w-fit">
                        <CheckCircle size={12}/> {"Verified"}
                      </span>
                    ) : (
                      <button 
                        onClick={() => handleVerify(cert.id)}
                        disabled={verifying === cert.id}
                        className="px-4 py-2 bg-slate-900 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all"
                      >
                        {verifying === cert.id ? "..." : "Verifikasi"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pendingCerts.length === 0 && (
            <div className="p-20 text-center text-slate-400 font-black uppercase italic text-xs">{"Belum ada pengajuan verifikasi."}</div>
          )}
        </div>
      </section>

      {/* ANALISA SKILL GAP & LAINNYA TETAP ADA DI BAWAH SINI ... */}
    </div>
  )
}
