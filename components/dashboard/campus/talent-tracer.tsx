"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Search, GraduationCap, ArrowLeft, Filter, Download,
  Briefcase, ExternalLink, UserCheck, AlertCircle,
  Loader2, CheckCircle2, XCircle, ShieldCheck,
  Printer, ChevronLeft, ChevronRight, Square, CheckSquare,
  FileText, MoreHorizontal
} from "lucide-react";

// IMPORT HELPER LOKAL
import { downloadCSV } from "./export-helper";
import { generateProfessionalCV } from "./cv-generator";

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
  const [filterDisability, setFilterDisability] = useState("all");
  const [filterEmployment, setFilterEmployment] = useState("all");
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | null }>({ msg: "", type: null });
  
  // STATE PAGINATION & SELECTION
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 1. AMBIL DATA TALENTA (Sinkronisasi dengan University ID)
  const fetchTalents = useCallback(async () => {
    setLoading(true);
    try {
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
      setToast({ msg: "Gagal memuat data talenta", type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [campusId]);

  useEffect(() => { fetchTalents(); }, [fetchTalents]);

  // 2. LOGIKA AKSI (VERIFY / REJECT)
  const handleAction = async (ids: string[], status: 'verified' | 'rejected') => {
    try {
      const upserts = ids.map(id => ({
        campus_id: campusId,
        profile_id: id,
        status: status,
        verified_at: status === 'verified' ? new Date().toISOString() : null
      }));

      const { error } = await supabase.from("campus_verifications").upsert(upserts);
      if (error) throw error;

      setToast({ 
        msg: `${ids.length} Talenta berhasil ${status === 'verified' ? 'diverifikasi' : 'ditolak'}`, 
        type: 'success' 
      });
      
      setSelectedIds([]);
      fetchTalents();
      setTimeout(() => setToast({ msg: "", type: null }), 4000);
    } catch (err) {
      setToast({ msg: "Gagal memproses perubahan status", type: 'error' });
    }
  };

  // 3. FILTER LOGIC (DIPERLUAS)
  const filteredData = useMemo(() => {
    return talents.filter(t => {
      const status = t.campus_verifications?.[0]?.status || 'unverified';
      const matchesSearch = t.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            t.major?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === "all" || 
                           (filterStatus === "unverified" && (status === "pending" || status === "unverified")) ||
                           (filterStatus === "verified" && status === "verified") ||
                           (filterStatus === "rejected" && status === "rejected") ||
                           (filterStatus === "working" && !['Job Seeker', 'Belum Bekerja'].includes(t.career_status));

      const matchesDisability = filterDisability === "all" || t.disability_type === filterDisability;
      const matchesEmployment = filterEmployment === "all" || t.career_status === filterEmployment;

      return matchesSearch && matchesStatus && matchesDisability && matchesEmployment;
    });
  }, [talents, searchTerm, filterStatus, filterDisability, filterEmployment]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // 4. SELECTION HELPERS (AKSESIBEL)
  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedData.length) setSelectedIds([]);
    else setSelectedIds(paginatedData.map(t => t.id));
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // 5. EXPORT HANDLER
  const exportToCSV = () => {
    const headers = ["Nama Lengkap", "Program Studi", "Ragam Disabilitas", "Status Karir", "Status Verifikasi"];
    const rows = filteredData.map(t => [
      t.full_name, t.major || "N/A", t.disability_type, t.career_status, t.campus_verifications?.[0]?.status || "pending"
    ]);
    downloadCSV(`Tracer_${campusName.replace(/\s+/g, '_')}.csv`, headers, rows);
  };

  return (
    <div className="text-left animate-in fade-in duration-700">
      {/* TOAST NOTIFICATION */}
      <div aria-live="polite" className="sr-only">{toast.msg}</div>
      {toast.msg && (
        <div className={`fixed bottom-10 right-10 z-50 flex items-center gap-3 rounded-2xl border-4 border-slate-900 px-6 py-4 font-black uppercase italic shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] ${toast.type === 'success' ? 'bg-emerald-400' : 'bg-rose-400'}`}>
          {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="mb-10 flex flex-col gap-8 border-b-4 border-slate-900 pb-10 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <button onClick={onBack} className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-emerald-600 transition-all">
            <ArrowLeft size={16} /> Dashboard Overview
          </button>
          <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none">Talent Tracer System</h2>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Manajemen Alumni <span className="text-slate-900 underline decoration-emerald-400 decoration-4 underline-offset-4">{campusName}</span>
          </p>
        </div>
        <button onClick={exportToCSV} className="flex items-center gap-3 rounded-2xl border-4 border-slate-900 bg-white px-8 py-4 text-[11px] font-black uppercase italic shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
          <Download size={18} /> Export Tracer (.CSV)
        </button>
      </div>

      {/* SEARCH & FILTERS SECTION */}
      <div className="mb-10 space-y-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              id="search-talent"
              type="text" 
              placeholder="Cari talenta atau program studi..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full rounded-[2rem] border-4 border-slate-900 bg-white py-5 pl-16 pr-8 text-sm font-bold shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] outline-none focus:ring-4 focus:ring-emerald-100"
            />
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-3 animate-in fade-in zoom-in duration-300">
              <button onClick={() => handleAction(selectedIds, 'verified')} className="bg-emerald-600 text-white px-5 py-3 rounded-xl font-black uppercase text-[10px] shadow-lg hover:bg-slate-900 transition-all">
                Verifikasi {selectedIds.length} Orang
              </button>
              <button onClick={() => handleAction(selectedIds, 'rejected')} className="bg-rose-500 text-white px-5 py-3 rounded-xl font-black uppercase text-[10px] shadow-lg hover:bg-slate-900 transition-all">
                Tolak
              </button>
            </div>
          )}
        </div>

        {/* TRIPLE FILTERS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative">
            <Filter className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select aria-label="Filter Status Verifikasi" value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} className="w-full appearance-none rounded-2xl border-4 border-slate-900 bg-white py-4 pl-14 pr-10 text-[10px] font-black uppercase tracking-widest outline-none shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
              <option value="all">Semua Status Verifikasi</option>
              <option value="unverified">🚨 Pending Verifikasi</option>
              <option value="verified">✅ Sudah Verified</option>
              <option value="rejected">❌ Ditolak</option>
              <option value="working">💼 Sudah Bekerja</option>
            </select>
          </div>

          <div className="relative">
            <Briefcase className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select aria-label="Filter Ragam Disabilitas" value={filterDisability} onChange={(e) => { setFilterDisability(e.target.value); setCurrentPage(1); }} className="w-full appearance-none rounded-2xl border-4 border-slate-900 bg-white py-4 pl-14 pr-10 text-[10px] font-black uppercase tracking-widest outline-none shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
              <option value="all">Semua Ragam Disabilitas</option>
              <option value="Disabilitas Fisik">Disabilitas Fisik</option>
              <option value="Disabilitas Sensorik Netra">Disabilitas Sensorik Netra</option>
              <option value="Disabilitas Sensorik Rungu/Wicara">Disabilitas Sensorik Rungu/Wicara</option>
              <option value="Disabilitas Intelektual">Disabilitas Intelektual</option>
              <option value="Disabilitas Mental">Disabilitas Mental</option>
            </select>
          </div>

          <div className="relative">
            <GraduationCap className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select aria-label="Filter Status Pekerjaan" value={filterEmployment} onChange={(e) => { setFilterEmployment(e.target.value); setCurrentPage(1); }} className="w-full appearance-none rounded-2xl border-4 border-slate-900 bg-white py-4 pl-14 pr-10 text-[10px] font-black uppercase tracking-widest outline-none shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
              <option value="all">Semua Status Karir</option>
              <option value="Job Seeker">Mencari Kerja</option>
              <option value="Fresh Graduate">Fresh Graduate</option>
              <option value="Pegawai Swasta">Pegawai Swasta</option>
              <option value="ASN (PNS / PPPK)">ASN (PNS / PPPK)</option>
              <option value="Wiraswasta / Entrepreneur">Wiraswasta</option>
              <option value="Belum Bekerja">Belum Bekerja</option>
            </select>
          </div>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="overflow-hidden rounded-[3rem] border-4 border-slate-900 bg-white shadow-[20px_20px_0px_0px_rgba(15,23,42,1)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="border-b-4 border-slate-900 bg-slate-50">
              <tr>
                <th className="px-8 py-6">
                  <div className="flex items-center justify-center">
                    <input type="checkbox" className="sr-only" id="select-all-top" checked={selectedIds.length === paginatedData.length && selectedIds.length > 0} onChange={toggleSelectAll} />
                    <label htmlFor="select-all-top" className="cursor-pointer">
                      {selectedIds.length === paginatedData.length && selectedIds.length > 0 ? <CheckSquare size={24} className="text-emerald-600" /> : <Square size={24} className="text-slate-300" />}
                    </label>
                  </div>
                </th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Info Talenta</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Program Studi</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="px-8 py-6 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y-4 divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="py-32 text-center"><Loader2 className="mx-auto animate-spin text-emerald-500" size={48} /></td></tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((talent) => {
                  const status = talent.campus_verifications?.[0]?.status || 'unverified';
                  const isSelected = selectedIds.includes(talent.id);
                  return (
                    <tr key={talent.id} className={`group transition-all ${isSelected ? 'bg-emerald-50/50' : 'hover:bg-slate-50'}`}>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center">
                          <input type="checkbox" className="sr-only" id={`sel-${talent.id}`} checked={isSelected} onChange={() => toggleSelectOne(talent.id)} />
                          <label htmlFor={`sel-${talent.id}`} className="cursor-pointer">
                            {isSelected ? <CheckSquare size={24} className="text-emerald-600" /> : <Square size={24} className="text-slate-200 group-hover:text-slate-400" />}
                          </label>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-slate-900 bg-slate-100 font-black text-slate-400 uppercase">{talent.full_name?.charAt(0)}</div>
                          <div>
                            <p className="text-sm font-black uppercase tracking-tight text-slate-900 leading-none">{talent.full_name}</p>
                            <p className="mt-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">{talent.disability_type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-[10px] font-black uppercase italic text-slate-600">{talent.major || "Belum Update"}</td>
                      <td className="px-8 py-6">
                        <div className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[9px] font-black uppercase tracking-widest ${status === 'verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
                          {status === 'verified' ? <CheckCircle2 size={12}/> : <AlertCircle size={12}/>} {status}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => handleAction([talent.id], 'verified')} className="rounded-xl bg-emerald-600 p-2.5 text-white hover:bg-slate-900 transition-all" aria-label="Verifikasi"><UserCheck size={18}/></button>
                          <button onClick={() => generateProfessionalCV(talent.id)} className="rounded-xl bg-slate-900 p-2.5 text-white hover:bg-emerald-600 transition-all" aria-label="Cetak CV"><Printer size={18}/></button>
                          <a href={`/talent/${talent.id}`} target="_blank" className="rounded-xl border-2 border-slate-200 p-2.5 text-slate-400 hover:border-slate-900 hover:text-slate-900 transition-all"><ExternalLink size={18}/></a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan={5} className="py-32 text-center opacity-30 font-black uppercase italic">Tidak Ada Data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}
      <div className="mt-12 flex flex-col items-center justify-between gap-6 px-4 md:flex-row">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Menampilkan {paginatedData.length} dari {filteredData.length} Talenta</p>
        <div className="flex items-center gap-4">
          <button disabled={currentPage === 1} onClick={() => { setCurrentPage(p => p - 1); window.scrollTo(0, 400); }} className="h-12 w-12 rounded-2xl border-4 border-slate-900 bg-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] disabled:opacity-20 transition-all"><ChevronLeft size={24} /></button>
          <div className="flex gap-2 font-black italic">Halaman {currentPage}</div>
          <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => { setCurrentPage(p => p + 1); window.scrollTo(0, 400); }} className="h-12 w-12 rounded-2xl border-4 border-slate-900 bg-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] disabled:opacity-20 transition-all"><ChevronRight size={24} /></button>
        </div>
      </div>
    </div>
  );
}