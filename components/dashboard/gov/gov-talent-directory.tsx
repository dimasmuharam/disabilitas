"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Users2, Search, Filter, Printer, 
  FileSpreadsheet, UserCheck, Loader2, MapPin,
  ExternalLink, ChevronRight
} from "lucide-react";

interface GovTalentDirectoryProps {
  govData: any; // Data dari tabel government (termasuk location_id & category)
}

export default function GovTalentDirectory({ govData }: GovTalentDirectoryProps) {
  const [talents, setTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDisability, setFilterDisability] = useState("Semua");

  const fetchLocalTalents = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from("profiles").select("*");

      // LOGIKA FILTER BERDASARKAN KODE WILAYAH (location_id)
      if (govData.category.includes("Provinsi")) {
        // Jika ULD Provinsi, ambil semua yang city_id-nya berawalan sama (e.g., '32%')
        query = query.like("city_id", `${govData.location_id}%`);
      } else if (govData.category.includes("Kota/Kabupaten")) {
        // Jika ULD Kota, ambil yang city_id-nya sama persis
        query = query.eq("city_id", govData.location_id);
      }
      // Jika kementerian sektoral, biarkan tanpa filter wilayah (Nasional)

      const { data, error } = await query.order('full_name', { ascending: true });
      
      if (error) throw error;
      setTalents(data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [govData.category, govData.location_id]);

  useEffect(() => {
    if (govData?.location_id) {
      fetchLocalTalents();
    }
  }, [govData?.location_id, govData?.category, fetchLocalTalents]);

  const filteredData = talents.filter(t => {
    const matchName = t.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDisability = filterDisability === "Semua" || t.disability_type === filterDisability;
    return matchName && matchDisability;
  });

  return (
    <div className="space-y-8 duration-700 animate-in fade-in slide-in-from-bottom-4">
      
      {/* 1. INFO PANEL & EXPORT */}
      <div className="flex flex-col items-center justify-between gap-6 rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] md:flex-row">
        <div className="flex items-center gap-4">
          <div className="rounded-2xl bg-blue-600 p-4 text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
            <Users2 size={32} />
          </div>
          <div>
            <h3 className="text-2xl font-black uppercase italic tracking-tight text-slate-900">Database Talenta</h3>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
              <MapPin size={12} />
              <span>Yurisdiksi: {govData.location} ({govData.location_id})</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4">
          <button className="flex items-center gap-2 rounded-xl border-4 border-slate-900 bg-emerald-400 px-6 py-3 text-[10px] font-black uppercase italic shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all hover:translate-y-1 hover:shadow-none">
            <FileSpreadsheet size={18} /> Export Data
          </button>
        </div>
      </div>

      {/* 2. FILTER & SEARCH CONTROL */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="group relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-blue-600" size={20} />
          <input 
            type="text" 
            placeholder="Cari berdasarkan nama..." 
            className="w-full rounded-2xl border-4 border-slate-900 p-4 pl-12 font-bold outline-none transition-all focus:ring-4 focus:ring-blue-100"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select 
            onChange={(e) => setFilterDisability(e.target.value)}
            className="w-full cursor-pointer appearance-none rounded-2xl border-4 border-slate-900 bg-white p-4 pl-12 font-black uppercase italic outline-none focus:ring-4 focus:ring-blue-100"
          >
            <option value="Semua">Semua Ragam Disabilitas</option>
            <option value="Netra / Low Vision">Netra / Low Vision</option>
            <option value="Tuli / Wicara">Tuli / Wicara</option>
            <option value="Daksa">Daksa</option>
            <option value="Intelektual">Intelektual</option>
            <option value="Mental">Mental</option>
          </select>
        </div>

        <div className="flex items-center justify-center rounded-2xl border-4 border-slate-900 bg-slate-100 p-4">
          <span className="text-xs font-black uppercase italic">Total: {filteredData.length} Talenta Terdaftar</span>
        </div>
      </div>

      {/* 3. TALENT LIST TABLE */}
      <div className="overflow-hidden rounded-[2.5rem] border-4 border-slate-900 bg-white shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-6 p-24">
            <Loader2 className="animate-spin text-blue-600" size={48} />
            <p className="animate-pulse font-black uppercase italic tracking-widest text-slate-400">Menghubungkan Otoritas Wilayah...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead className="bg-slate-900 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                <tr>
                  <th className="p-6">Data Personal</th>
                  <th className="p-6">Ragam & Alat Bantu</th>
                  <th className="p-6">Pendidikan</th>
                  <th className="p-6">Status Karir</th>
                  <th className="p-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y-4 divide-slate-100">
                {filteredData.map((talent) => (
                  <tr key={talent.id} className="group transition-colors hover:bg-slate-50">
                    <td className="p-6">
                      <div className="font-black uppercase italic text-slate-900">{talent.full_name}</div>
                      <div className="text-[10px] font-bold uppercase tracking-tighter text-slate-400">{talent.city || 'Domisili tidak set'}</div>
                    </td>
                    <td className="p-6">
                      <div className="text-xs font-black uppercase text-blue-600">{talent.disability_type}</div>
                      <div className="text-[10px] font-bold uppercase text-slate-500">{talent.assistive_tool || 'Tanpa Alat Bantu'}</div>
                    </td>
                    <td className="p-6">
                      <div className="text-xs font-bold text-slate-700">{talent.education_level}</div>
                    </td>
                    <td className="p-6">
                      <span className={`inline-block rounded-lg border-2 border-slate-900 px-3 py-1 text-[9px] font-black uppercase shadow-[2px_2px_0px_0px_rgba(15,23,42,1)] ${
                        talent.career_status === 'Job Seeker' ? 'bg-amber-300' : 'bg-emerald-300'
                      }`}>
                        {talent.career_status}
                      </span>
                    </td>
                    <td className="p-6 text-center">
                      <button 
                        className="rounded-xl border-4 border-slate-900 p-3 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-slate-900 hover:text-white hover:shadow-none active:translate-y-1"
                        title="Detail Talenta"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && filteredData.length === 0 && (
          <div className="p-24 text-center">
            <div className="mb-6 inline-block rounded-full bg-slate-100 p-8">
              <Users2 className="text-slate-300" size={64} />
            </div>
            <h4 className="text-xl font-black uppercase italic text-slate-400">Data Tidak Ditemukan</h4>
            <p className="mt-2 text-xs font-bold uppercase text-slate-300">Belum ada talenta terdaftar untuk wilayah otoritas {govData.location}</p>
          </div>
        )}
      </div>
    </div>
  );
}