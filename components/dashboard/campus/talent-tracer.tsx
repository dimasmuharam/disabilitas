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
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | null }>({ msg: "", type: null });
  
  // STATE PAGINATION & SELECTION
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // 1. AMBIL DATA TALENTA (Sinkronisasi dengan University ID)
  const fetchTalents = useCallback(async () => {
    setLoading(true);
    try {
      // Query mengambil profil yang terafiliasi dengan campusId (UUID)
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

  // 2. LOGIKA AKSI (VERIFY / REJECT) - BISA INDIVIDU MAUPUN MASSAL
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

      // Feedback Aksesibel (Screen Reader akan membacakan ini lewat aria-live)
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

  // 3. FILTER & PAGINATION LOGIC
  const filteredData = useMemo(() => {
    return talents.filter(t => {
      const status = t.campus_verifications?.[0]?.status || 'unverified';
      const isWorking = !['Job Seeker', 'Belum Bekerja'].includes(t.career_status);
      const matchesSearch = t.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            t.major?.toLowerCase().includes(searchTerm.toLowerCase());

      if (filterStatus === "verified") return status === 'verified' && matchesSearch;
      if (filterStatus === "unverified") return status === 'pending' && matchesSearch;
      if (filterStatus === "rejected") return status === 'rejected' && matchesSearch;
      if (filterStatus === "working") return isWorking && matchesSearch;
      return matchesSearch;
    });
  }, [talents, searchTerm, filterStatus]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // 4. SELECTION HELPERS
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
      {/* ACCESSIBLE NOTIFICATION BOX */}
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
          <button 
            onClick={onBack} 
            className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-emerald-600 transition-all"
            aria-label="Kembali ke Dashboard Utama"
          >
            <ArrowLeft size={16} /> Dashboard Overview
          </button>
          <h2 className="text-5xl font-black uppercase italic tracking-tighter leading-none">Talent Tracer System</h2>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Manajemen Alumni & Verifikasi Akademik <span className="text-slate-900 underline decoration-emerald-400 decoration-4 underline-offset-4">{campusName}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-4">
          <button 
            onClick={exportToCSV} 
            className="flex items-center gap-3 rounded-2xl border-4 border-slate-900 bg-white px-8 py-4 text-[11px] font-black uppercase italic shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
          >
            <Download size={18} /> Export Tracer (.CSV)
          </button>
        </div>
      </div>

      {/* SEARCH & FILTERS & BULK ACTIONS */}
      <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <label htmlFor="search-talent" className="sr-only">Cari Nama atau Jurusan</label>
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

        <div className="flex items-center gap-4">
          <div className="relative min-w-[200px]">
            <Filter className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select 
              aria-label="Filter berdasarkan status"
              value={filterStatus}
              onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
              className="w-full appearance-none rounded-2xl border-4 border-slate-900 bg-white py-4 pl-14 pr-10 text-[10px] font-black uppercase tracking-widest outline-none shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]"
            >
              <option value="all">Semua Status</option>
              <option value="unverified">🚨 Pending Verifikasi</option>
              <option value="verified">✅ Sudah Verified</option>
              <option value="rejected">❌ Ditolak</option>
              <option value="working">💼 Sudah Bekerja</option>
            </select>
          </div>

          {selectedIds.length > 0 && (
            <div className="flex items-center gap-3 animate-in fade-in zoom-in duration-300">
              <div className="h-10 w-[2px] bg-slate-200 mx-2" />
              <button 
                onClick={() => handleAction(selectedIds, 'verified')} 
                className="bg-emerald-600 text-white px-5 py-3 rounded-xl font-black uppercase text-[10px] shadow-lg hover:bg-slate-900 transition-all"
              >
                Verifikasi {selectedIds.length} Orang
              </button>
              <button 
                onClick={() => handleAction(selectedIds, 'rejected')} 
                className="bg-rose-500 text-white px-5 py-3 rounded-xl font-black uppercase text-[10px] shadow-lg hover:bg-slate-900 transition-all"
              >
                Tolak
              </button>
            </div>
          )}
        </div>
      </div>

      {/* DATA TABLE (NEOBRUTALISM STYLE) */}
      <div className="overflow-hidden rounded-[3rem] border-4 border-slate-900 bg-white shadow-[20px_20px_0px_0px_rgba(15,23,42,1)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" role="grid">
            <thead className="border-b-4 border-slate-900 bg-slate-50">
              <tr>
                <th className="px-8 py-6">
                  <button 
                    onClick={toggleSelectAll} 
                    aria-label={selectedIds.length === paginatedData.length ? "Batal pilih semua" : "Pilih semua talenta di halaman ini"}
                    className="transition-transform active:scale-90"
                  >
                    {selectedIds.length === paginatedData.length && selectedIds.length > 0 ? 
                      <CheckSquare size={24} className="text-emerald-600" /> : 
                      <Square size={24} className="text-slate-300" />
                    }
                  </button>
                </th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Info Talenta</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Akademik</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Verifikasi</th>
                <th className="px-8 py-6 text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y-4 divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-32 text-center">
                    <Loader2 className="mx-auto animate-spin text-emerald-500" size={48} />
                    <p className="mt-4 font-black uppercase italic text-slate-300 tracking-tighter text-xl">Menghubungkan Database...</p>
                  </td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((talent) => {
                  const status = talent.campus_verifications?.[0]?.status || 'unverified';
                  const isSelected = selectedIds.includes(talent.id);

                  return (
                    <tr key={talent.id} className={`group transition-all ${isSelected ? 'bg-emerald-50/50' : 'hover:bg-slate-50'}`}>
                      <td className="px-8 py-6">
                        <button 
                          onClick={() => toggleSelectOne(talent.id)} 
                          aria-label={`Pilih ${talent.full_name}`}
                          className="active:scale-90 transition-transform"
                        >
                          {isSelected ? 
                            <CheckSquare size={24} className="text-emerald-600" /> : 
                            <Square size={24} className="text-slate-200 group-hover:text-slate-400" />
                          }
                        </button>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-slate-900 bg-slate-100 font-black text-slate-400 uppercase">
                            {talent.full_name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-black uppercase tracking-tight text-slate-900 leading-none">{talent.full_name}</p>
                            <p className="mt-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">{talent.disability_type}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase italic text-slate-600">
                          <GraduationCap size={14} className="text-emerald-500" />
                          {talent.major || "Belum Update"}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[9px] font-black uppercase tracking-widest ${
                          status === 'verified' ? 'bg-emerald-100 text-emerald-700' : 
                          status === 'rejected' ? 'bg-rose-100 text-rose-700' : 
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {status === 'verified' ? <CheckCircle2 size={12}/> : status === 'rejected' ? <XCircle size={12}/> : <AlertCircle size={12}/>}
                          {status}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center justify-center gap-3">
                          {status !== 'verified' && (
                            <button 
                              onClick={() => handleAction([talent.id], 'verified')} 
                              className="rounded-xl bg-emerald-600 p-2.5 text-white shadow-md hover:bg-slate-900 transition-all"
                              aria-label={`Verifikasi ${talent.full_name}`}
                            >
                              <UserCheck size={18}/>
                            </button>
                          )}
                          {status !== 'rejected' && (
                            <button 
                              onClick={() => handleAction([talent.id], 'rejected')} 
                              className="rounded-xl border-2 border-slate-200 p-2.5 text-slate-400 hover:border-rose-500 hover:text-rose-500 transition-all"
                              aria-label={`Tolak verifikasi ${talent.full_name}`}
                            >
                              <XCircle size={18}/>
                            </button>
                          )}
                          <div className="h-6 w-[1px] bg-slate-200 mx-1" />
                          <button 
                            onClick={() => generateProfessionalCV(talent.id)} 
                            className="rounded-xl bg-slate-900 p-2.5 text-white shadow-md hover:bg-emerald-600 transition-all"
                            aria-label={`Cetak CV Profesional ${talent.full_name}`}
                            title="Cetak CV"
                          >
                            <Printer size={18}/>
                          </button>
                          <a 
                            href={`/talent/${talent.id}`} 
                            target="_blank" 
                            className="rounded-xl border-2 border-slate-200 p-2.5 text-slate-400 hover:border-slate-900 hover:text-slate-900 transition-all"
                            aria-label={`Buka Profil Publik ${talent.full_name}`}
                          >
                            <ExternalLink size={18}/>
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-32 text-center opacity-30">
                    <ShieldCheck size={64} className="mx-auto mb-4" />
                    <p className="text-2xl font-black uppercase italic tracking-tighter">Tidak Ada Data Ditemukan</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION CONTROLS */}
      <div className="mt-12 flex flex-col items-center justify-between gap-6 px-4 md:flex-row">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400" aria-live="polite">
          Menampilkan {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredData.length)} dari {filteredData.length} Alumni
        </p>
        
        <div className="flex items-center gap-4">
          <button 
            disabled={currentPage === 1} 
            onClick={() => { setCurrentPage(p => p - 1); window.scrollTo(0, 400); }}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border-4 border-slate-900 bg-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] disabled:opacity-20 disabled:shadow-none hover:bg-slate-50 transition-all"
            aria-label="Halaman Sebelumnya"
          >
            <ChevronLeft size={24} />
          </button>
          
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => { setCurrentPage(page); window.scrollTo(0, 400); }}
                className={`h-12 w-12 rounded-2xl border-4 border-slate-900 font-black transition-all ${
                  currentPage === page ? 'bg-slate-900 text-white shadow-none' : 'bg-white text-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] hover:translate-x-0.5 hover:translate-y-0.5'
                }`}
              >
                {page}
              </button>
            )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
          </div>

          <button 
            disabled={currentPage === totalPages || totalPages === 0} 
            onClick={() => { setCurrentPage(p => p + 1); window.scrollTo(0, 400); }}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border-4 border-slate-900 bg-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] disabled:opacity-20 disabled:shadow-none hover:bg-slate-50 transition-all"
            aria-label="Halaman Berikutnya"
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}