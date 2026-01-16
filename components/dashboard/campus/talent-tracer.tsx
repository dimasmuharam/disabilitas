"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Search, GraduationCap, ArrowLeft, Filter, Download,
  Briefcase, ExternalLink, UserCheck, AlertCircle,
  Loader2, CheckCircle2, XCircle, ShieldCheck
} from "lucide-react";

// IMPORT HELPER LOKAL (Pastikan file export-helper.ts ada di folder yang sama)
import { downloadCSV } from "./export-helper";

interface TalentTracerProps {
  campusName: string;
  campusId: string;
  onBack: () => void;
}

export default function TalentTracer({ campusName, campusId, onBack }: TalentTracerProps) {
  const [talents, setTalents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); 

  const fetchTalents = useCallback(async () => {
    setLoading(true);
    try {
      // SINKRONISASI: Menggunakan university_id (UUID) agar data 100% akurat
      let { data, error } = await supabase
        .from("profiles")
        .select(`
          id, full_name, major, disability_type, career_status,
          campus_verifications!left (
            status
          )
        `)
        .eq("university_id", campusId)
        .order("full_name", { ascending: true });

      if (error) throw error;
      setTalents(data || []);
    } catch (error) {
      console.error("[TRACER_ERROR]:", error);
    } finally {
      setLoading(false);
    }
  }, [campusId]);

  useEffect(() => { fetchTalents(); }, [fetchTalents]);

  const handleVerify = async (profileId: string, status: 'verified' | 'rejected') => {
    try {
      const { error } = await supabase
        .from("campus_verifications")
        .upsert({
          campus_id: campusId,
          profile_id: profileId,
          status: status,
          verified_at: status === 'verified' ? new Date().toISOString() : null
        });

      if (error) throw error;
      fetchTalents(); 
    } catch (err) {
      console.error("Verification failed", err);
    }
  };

  const filteredData = talents.filter(t => {
    const isVerified = t.campus_verifications?.[0]?.status === 'verified';
    const isWorking = !['Job Seeker', 'Belum Bekerja'].includes(t.career_status);
    const matchesSearch = t.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.major?.toLowerCase().includes(searchTerm.toLowerCase());

    if (filterStatus === "verified") return isVerified && matchesSearch;
    if (filterStatus === "unverified") return !isVerified && matchesSearch;
    if (filterStatus === "working") return isWorking && matchesSearch;
    return matchesSearch;
  });

  // MENGGUNAKAN HELPER downloadCSV (Lebih rapi & aman dari error karakter)
  const exportToCSV = () => {
    const headers = ["Nama Lengkap", "Program Studi", "Ragam Disabilitas", "Status Karir", "Status Verifikasi"];
    const rows = filteredData.map(t => [
      t.full_name,
      t.major || "Belum Diisi",
      t.disability_type,
      t.career_status,
      t.campus_verifications?.[0]?.status || "pending"
    ]);

    const fileName = `Tracer_Study_${campusName.replace(/\s+/g, '_')}_2026.csv`;
    downloadCSV(fileName, headers, rows);
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
      <div className="mb-8 flex flex-col gap-6 border-b-4 border-slate-900 pb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <button onClick={onBack} className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">
            <ArrowLeft size={16} /> Dashboard Overview
          </button>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter leading-none">Alumni Tracer Study</h2>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-emerald-600">
            Database Validasi Akademik: <span className="text-slate-900">{campusName}</span>
          </p>
        </div>

        <button 
          onClick={exportToCSV}
          className="flex items-center justify-center gap-2 rounded-2xl border-4 border-slate-900 bg-white px-6 py-4 text-[11px] font-black uppercase italic shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
        >
          <Download size={16} /> Export Data (.CSV)
        </button>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Cari Nama Mahasiswa atau Jurusan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border-4 border-slate-900 bg-white py-5 pl-14 pr-6 text-sm font-bold outline-none shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] focus:ring-4 focus:ring-emerald-100"
          />
        </div>
        <div className="relative md:col-span-2">
          <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full appearance-none rounded-2xl border-4 border-slate-900 bg-white py-5 pl-14 pr-6 text-sm font-black uppercase outline-none shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]"
          >
            <option value="all">Semua Mahasiswa</option>
            <option value="unverified">🚨 Butuh Verifikasi</option>
            <option value="verified">✅ Sudah Terverifikasi</option>
            <option value="working">💼 Sudah Bekerja</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-[3rem] border-4 border-slate-900 bg-white shadow-[15px_15px_0px_0px_rgba(15,23,42,1)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left" role="grid">
            <thead className="border-b-4 border-slate-900 bg-slate-50">
              <tr>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Identitas Talenta</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Program Studi</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status & Verifikasi</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y-4 divide-slate-900/5">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-24 text-center">
                    <Loader2 className="mx-auto animate-spin text-slate-300" size={48} />
                    <p className="mt-4 font-black uppercase italic text-slate-300">Sinkronisasi Jalur Tracer...</p>
                  </td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((talent) => {
                  const isVerified = talent.campus_verifications?.[0]?.status === 'verified';
                  const isPending = !talent.campus_verifications?.[0]?.status || talent.campus_verifications?.[0]?.status === 'pending';
                  
                  return (
                    <tr key={talent.id} className="group hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-6 text-left">
                        <div className="flex items-center gap-4">
                          <div className="size-14 rounded-2xl border-2 border-slate-900 bg-slate-100 flex items-center justify-center font-black text-xl text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all">
                            {talent.full_name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-lg uppercase tracking-tight text-slate-900 leading-none">{talent.full_name}</p>
                            <p className="mt-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">{talent.disability_type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-left">
                        <div className="flex items-center gap-2 text-xs font-black uppercase italic text-slate-600">
                          <GraduationCap size={16} className="text-emerald-500" />
                          {talent.major || "N/A"}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-left">
                        <div className="space-y-2">
                          <div className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-[9px] font-black uppercase tracking-widest ${isVerified ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                            {isVerified ? <CheckCircle2 size={12}/> : <AlertCircle size={12}/>}
                            {isVerified ? "Terverifikasi" : "Belum Verifikasi"}
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 italic">Status: {talent.career_status}</p>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center gap-2">
                          {isPending ? (
                            <button 
                              onClick={() => handleVerify(talent.id, 'verified')}
                              className="rounded-xl bg-emerald-600 p-3 text-white shadow-lg hover:bg-slate-900 transition-all focus:ring-4 focus:ring-emerald-200"
                              title="Verifikasi Mahasiswa"
                            >
                              <UserCheck size={20} />
                            </button>
                          ) : (
                            <a 
                              href={`/talent/${talent.id}`} 
                              target="_blank"
                              className="rounded-xl border-2 border-slate-200 p-3 text-slate-400 hover:border-slate-900 hover:text-slate-900 transition-all"
                              aria-label="Lihat Profil Lengkap"
                            >
                              <ExternalLink size={20} />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="py-24 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                      <ShieldCheck size={64} />
                      <p className="font-black uppercase italic text-2xl tracking-tighter">Data Kosong</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}