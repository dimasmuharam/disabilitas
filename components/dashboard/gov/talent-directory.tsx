"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Users2, Search, Filter, FileSpreadsheet, 
  MapPin, Loader2, ExternalLink, Globe 
} from "lucide-react";
import { PROVINCE_MAP } from "@/lib/constants/locations";
import { exportGovTalentReport } from "./export-logic";
import { generateGovTalentPDF } from "./cv-generator";

interface GovTalentDirectoryProps {
  govData: any; 
}

export default function GovTalentDirectory({ govData }: GovTalentDirectoryProps) {
  const [talents, setTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDisability, setFilterDisability] = useState("Semua");
  const [isExporting, setIsExporting] = useState(false);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  // Identifikasi Level Otoritas
const isPusat = govData.location === "Nasional" || govData.category === "Kementerian/Lembaga";
  const isProvinsi = govData.category.includes("Provinsi");

  const fetchLocalTalents = useCallback(async () => {
    setLoading(true);
    try {
      // SINKRONISASI QUERY: Menarik data profil talenta
      let query = supabase.from("profiles").select("*");

      // LOGIKA MULTI-LEVEL FILTER
      if (isPusat) {
        // Pusat: Akses Nasional (Tanpa filter lokasi)
      } else if (isProvinsi) {
        // Provinsi: Filter berdasarkan peta kota dalam provinsi
        const citiesInProvince = PROVINCE_MAP[govData.location] || [];
        query = query.in("city", citiesInProvince);
      } else {
        // Kota/Kabupaten: Filter kota spesifik
        query = query.eq("city", govData.location);
      }

      const { data, error } = await query.order('full_name', { ascending: true });
      if (error) throw error;
      setTalents(data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [govData, isPusat, isProvinsi]);

  useEffect(() => {
    fetchLocalTalents();
  }, [fetchLocalTalents]);

  const handleDownloadCV = async (talentId: string) => {
    setIsGenerating(talentId);
    try {
      // Memasukkan Logo Resmi Pemerintah ke dalam CV yang di-generate
      await generateGovTalentPDF(talentId, govData.name, govData.official_seal_url);
    } catch (err) {
      alert("Gagal membuat CV. Silakan coba lagi.");
    } finally {
      setIsGenerating(null);
    }
  };

  const filteredData = talents.filter(t => {
    const matchName = t.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDisability = filterDisability === "Semua" || t.disability_type === filterDisability;
    return matchName && matchDisability;
  });

  const handleExportClick = async () => {
    setIsExporting(true);
    // Masukkan cakupan lokasi untuk laporan Excel
    await exportGovTalentReport(isPusat ? "Nasional" : govData.location);
    setIsExporting(false);
  };

  return (
    <div className="space-y-8 duration-700 animate-in fade-in slide-in-from-bottom-4">
      
      {/* 1. INFO PANEL & EXPORT */}
      <div className="flex flex-col items-center justify-between gap-6 rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[12px_12px_0px_0px_rgba(15,23,42,1)] md:flex-row">
        <div className="flex items-center gap-4">
          <div className={`rounded-2xl p-4 text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] ${isPusat ? 'bg-indigo-600' : 'bg-blue-600'}`}>
            {isPusat ? <Globe size={32} /> : <Users2 size={32} />}
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase italic tracking-tight text-slate-900">
              {isPusat ? "Database Talenta Nasional" : "Database Talenta Lokal"}
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
              <MapPin size={12} />
              <span>{isPusat ? "Cakupan: Seluruh Indonesia" : `Cakupan Wilayah: ${govData.location}`}</span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={handleExportClick}
          disabled={isExporting}
          className="flex items-center gap-2 rounded-xl border-4 border-slate-900 bg-emerald-400 px-6 py-3 text-[10px] font-black uppercase italic shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all hover:translate-y-1 hover:shadow-none"
        >
          {isExporting ? <Loader2 className="animate-spin" size={18} /> : <FileSpreadsheet size={18} />}
          {isExporting ? "Memproses Data..." : "Export Laporan Wilayah"}
        </button>
      </div>

      {/* 2. FILTER & SEARCH CONTROL */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="group relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Cari nama talenta..." 
            className="w-full rounded-2xl border-4 border-slate-900 p-4 pl-12 font-bold outline-none focus:ring-4 focus:ring-blue-100"
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
          <span className="text-xs font-black uppercase italic">Populasi Terdeteksi: {filteredData.length} Jiwa</span>
        </div>
      </div>

      {/* 3. TALENT TABLE */}
      <div className="overflow-hidden rounded-[2.5rem] border-4 border-slate-900 bg-white shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-6 p-24">
            <Loader2 className="animate-spin text-blue-600" size={48} />
            <p className="font-black uppercase italic text-slate-400">Sinkronisasi Database...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead className="bg-slate-900 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                <tr>
                  <th className="p-6">Informasi Talenta</th>
                  <th className="p-6">Ragam</th>
                  <th className="p-6">Pendidikan</th>
                  <th className="p-6">Lokasi</th>
                  <th className="p-6 text-center">Dokumen</th>
                </tr>
              </thead>
              <tbody className="divide-y-4 divide-slate-100">
                {filteredData.map((talent) => (
                  <tr key={talent.id} className="group transition-colors hover:bg-slate-50">
                    <td className="p-6">
                      <div className="font-black uppercase italic text-slate-900">{talent.full_name}</div>
                      <div className="text-[10px] font-bold uppercase text-slate-400">{talent.career_status}</div>
                    </td>
                    <td className="p-6">
                      <div className="text-xs font-black uppercase text-blue-600">{talent.disability_type}</div>
                    </td>
                    <td className="p-6">
                      <div className="text-xs font-bold text-slate-700">{talent.education_level || "-"}</div>
                      <div className="max-w-[150px] truncate text-[9px] text-slate-400">{talent.major}</div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-600">
                        <MapPin size={12} className="text-slate-400" />
                        {talent.city}
                      </div>
                    </td>
                    <td className="p-6 text-center">
                      <button 
                        onClick={() => handleDownloadCV(talent.id)}
                        disabled={isGenerating === talent.id}
                        className="mx-auto flex items-center gap-2 rounded-xl border-4 border-slate-900 bg-white p-3 font-black uppercase italic shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-slate-900 hover:text-white hover:shadow-none"
                      >
                        {isGenerating === talent.id ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <ExternalLink size={16} />
                        )}
                        <span className="text-[9px]">CV Resmi</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}