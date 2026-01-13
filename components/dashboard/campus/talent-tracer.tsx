"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Search, Users, GraduationCap, MapPin, 
  ExternalLink, ArrowLeft, Filter, Download,
  Briefcase, FileText, UserCheck, AlertCircle
} from "lucide-react";

interface TalentTracerProps {
  campusName: string;
  campusId: string;
  onBack: () => void;
}

export default function TalentTracer({ campusName, campusId, onBack }: TalentTracerProps) {
  const [talents, setTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all"); // all, working, looking

  const fetchTalents = useCallback(async () => {
    setLoading(true);
    try {
      // Query ke profil talenta yang nama universitasnya sama dengan kampus ini
      let query = supabase
        .from("profiles")
        .select("*")
        .eq("university", campusName)
        .order("full_name", { ascending: true });

      if (filterType === "working") {
        query = query.eq("is_working", true);
      } else if (filterType === "looking") {
        query = query.eq("is_working", false);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTalents(data || []);
    } catch (error) {
      console.error("[TRACER_ERROR]:", error);
    } finally {
      setLoading(false);
    }
  }, [campusName, filterType]);

  useEffect(() => {
    fetchTalents();
  }, [fetchTalents]);

  // Filter Client Side untuk Search Bar
  const filteredTalents = talents.filter(t => 
    t.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.major?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* HEADER CONTROL */}
      <div className="mb-8 flex flex-col gap-6 border-b-4 border-slate-900 pb-8 md:flex-row md:items-end md:justify-between">
        <div className="text-left">
          <button onClick={onBack} className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900">
            <ArrowLeft size={16} /> Kembali ke Dashboard
          </button>
          <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">Talent Tracer Study</h2>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-emerald-600">
            Pemetaan Alumni & Mahasiswa: <span className="text-slate-900">{campusName}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase hover:border-slate-900 transition-all">
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="relative md:col-span-2">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Cari Nama Mahasiswa atau Program Studi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border-4 border-slate-900 bg-white py-4 pl-14 pr-6 text-sm font-bold outline-none shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full appearance-none rounded-2xl border-4 border-slate-900 bg-white py-4 pl-14 pr-6 text-sm font-bold outline-none shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"
          >
            <option value="all">Semua Status</option>
            <option value="working">Sudah Bekerja</option>
            <option value="looking">Mencari Kerja</option>
          </select>
        </div>
      </div>

      {/* TALENT LIST TABLE */}
      <div className="overflow-hidden rounded-[2.5rem] border-4 border-slate-900 bg-white shadow-[12px_12px_0px_0px_rgba(15,23,42,1)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b-4 border-slate-900 bg-slate-50">
              <tr>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Nama Talenta</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Program Studi</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Disabilitas</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-6 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Profil</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center font-black uppercase italic text-slate-300">
                    Menyinkronkan data profil talenta...
                  </td>
                </tr>
              ) : filteredTalents.length > 0 ? (
                filteredTalents.map((talent) => (
                  <tr key={talent.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-slate-200 border-2 border-slate-900 flex items-center justify-center font-black text-slate-600">
                          {talent.full_name?.charAt(0)}
                        </div>
                        <p className="font-black text-slate-900 uppercase tracking-tight">{talent.full_name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-600 uppercase">
                        <GraduationCap size={14} className="text-emerald-600" />
                        {talent.major || "Belum Diisi"}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="rounded-lg bg-slate-100 px-3 py-1 text-[9px] font-black uppercase text-slate-500">
                        {talent.disability_type || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      {talent.is_working ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-black text-[9px] uppercase tracking-widest">
                          <UserCheck size={14} /> Bekerja
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-blue-600 font-black text-[9px] uppercase tracking-widest">
                          <Briefcase size={14} /> Mencari Kerja
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <a 
                        href={`/talent/${talent.id}`} 
                        target="_blank"
                        className="inline-flex size-10 items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-slate-400 hover:border-slate-900 hover:text-slate-900 transition-all shadow-sm"
                      >
                        <ExternalLink size={16} />
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="text-slate-200" size={48} />
                      <p className="font-black uppercase italic text-slate-300">Tidak ada talenta yang terdeteksi dari almamater ini.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SUMMARY BOX */}
      {!loading && filteredTalents.length > 0 && (
        <div className="mt-8 flex justify-end">
          <div className="rounded-2xl bg-slate-900 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-xl">
            Total Temuan: {filteredTalents.length} Jiwa
          </div>
        </div>
      )}
    </div>
  );
}
