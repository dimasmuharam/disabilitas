"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Search, GraduationCap, ArrowLeft, Filter, Download,
  Briefcase, ExternalLink, UserCheck, AlertCircle,
  Loader2, CheckCircle2, XCircle, ShieldCheck,
  Printer, ChevronLeft, ChevronRight, Square, CheckSquare,
  Undo2, UserX
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
  
  // FILTERS STATE
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDisability, setFilterDisability] = useState("all");
  const [filterEmployment, setFilterEmployment] = useState("all");
  const [filterAcademic, setFilterAcademic] = useState("all"); // Alumni vs Aktif

  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | null }>({ msg: "", type: null });
  
  // PAGINATION & SELECTION
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchTalents = useCallback(async () => {
    setLoading(true);
    const currentYear = new Date().getFullYear();
    try {
      let { data, error } = await supabase
        .from("profiles")
        .select(`
          id, full_name, major, disability_type, career_status, graduation_date, university,
          campus_verifications!left (
            status
          )
      .eq("university", campusName)
        `)        .order("full_name", { ascending: true });

      if (error) throw error;
      setTalents(data || []);
    } catch (error) {
      console.error("[TRACER_ERROR]:", error);
      setToast({ msg: "Gagal memuat data talenta", type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [campusName]);

  useEffect(() => { fetchTalents(); }, [fetchTalents]);

  const handleAction = async (ids: string[], status: 'verified' | 'rejected' | 'pending') => {
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
        msg: `${ids.length} Talenta diperbarui ke status ${status}`, 
        type: 'success' 
      });
      
      setSelectedIds([]);
      fetchTalents();
      setTimeout(() => setToast({ msg: "", type: null }), 4000);
    } catch (err) {
      setToast({ msg: "Gagal memproses aksi", type: 'error' });
    }
  };

  const filteredData = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return talents.filter(t => {
      const status = t.campus_verifications?.[0]?.status || 'unverified';
      const isAlumni = t.graduation_date && Number(t.graduation_date) <= currentYear;
      
      const matchesSearch = t.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            t.major?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === "all" || status === filterStatus;
      const matchesDisability = filterDisability === "all" || t.disability_type === filterDisability;
      const matchesEmployment = filterEmployment === "all" || t.career_status === filterEmployment;
      const matchesAcademic = filterAcademic === "all" || 
                              (filterAcademic === "alumni" && isAlumni) || 
                              (filterAcademic === "aktif" && !isAlumni);

      return matchesSearch && matchesStatus && matchesDisability && matchesEmployment && matchesAcademic;
    });
  }, [talents, searchTerm, filterStatus, filterDisability, filterEmployment, filterAcademic]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedData.length) setSelectedIds([]);
    else setSelectedIds(paginatedData.map(t => t.id));
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const exportToCSV = () => {
    const headers = ["Nama Lengkap", "Program Studi", "Ragam Disabilitas", "Status Karir", "Status Verifikasi"];
    const rows = filteredData.map(t => [
      t.full_name, t.major || "N/A", t.disability_type, t.career_status, t.campus_verifications?.[0]?.status || "pending"
    ]);
    downloadCSV(`Tracer_${campusName.replace(/\s+/g, '_')}.csv`, headers, rows);
  };

  return (
    <div className="text-left duration-700 animate-in fade-in">
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
          <button onClick={onBack} className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 transition-all hover:text-emerald-600">
            <ArrowLeft size={16} /> Dashboard Overview
          </button>
          <h2 className="text-5xl font-black uppercase italic leading-none tracking-tighter">Talent Tracer System</h2>
          <p className="mt-3 text-[11px] font-bold uppercase tracking-widest text-slate-400">
            Manajemen Alumni & Mahasiswa <span className="text-slate-900 underline decoration-emerald-400 decoration-4 underline-offset-4">{campusName}</span>
          </p>
        </div>
        <button onClick={exportToCSV} className="flex items-center gap-3 rounded-2xl border-4 border-slate-900 bg-white px-8 py-4 text-[11px] font-black uppercase italic shadow-[6px_6px_0px_0px_rgba(15,23,42,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none">
          <Download size={18} /> Export Tracer (.CSV)
        </button>
      </div>

      {/* FILTERS SECTION */}
      <div className="mb-10 space-y-4">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Cari nama atau program studi..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full rounded-[2rem] border-4 border-slate-900 bg-white py-5 pl-16 pr-8 text-sm font-bold shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] outline-none focus:ring-4 focus:ring-emerald-100"
            />
          </div>
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-3 animate-in zoom-in">
              <button onClick={() => handleAction(selectedIds, 'verified')} className="rounded-xl bg-emerald-600 px-5 py-3 text-[10px] font-black uppercase text-white shadow-lg transition-all hover:bg-slate-900">Verifikasi ({selectedIds.length})</button>
              <button onClick={() => handleAction(selectedIds, 'rejected')} className="rounded-xl bg-rose-500 px-5 py-3 text-[10px] font-black uppercase text-white shadow-lg transition-all hover:bg-slate-900">Tolak</button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Filter className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full appearance-none rounded-xl border-2 border-slate-900 bg-white py-3 pl-10 pr-8 text-[9px] font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] outline-none">
              <option value="all">Semua Verifikasi</option>
              <option value="pending">🚨 Pending</option>
              <option value="verified">✅ Verified</option>
              <option value="rejected">❌ Rejected</option>
            </select>
          </div>
          <div className="relative">
            <GraduationCap className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select value={filterAcademic} onChange={(e) => setFilterAcademic(e.target.value)} className="w-full appearance-none rounded-xl border-2 border-slate-900 bg-white py-3 pl-10 pr-8 text-[9px] font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] outline-none">
              <option value="all">Semua Angkatan</option>
              <option value="aktif">Mahasiswa Aktif</option>
              <option value="alumni">Alumni Disabilitas</option>
            </select>
          </div>
          <div className="relative">
            <ShieldCheck className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select value={filterDisability} onChange={(e) => setFilterDisability(e.target.value)} className="w-full appearance-none rounded-xl border-2 border-slate-900 bg-white py-3 pl-10 pr-8 text-[9px] font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] outline-none">
              <option value="all">Semua Ragam</option>
              <option value="Disabilitas Fisik">Fisik</option>
              <option value="Disabilitas Sensorik Netra">Sensorik Netra</option>
              <option value="Disabilitas Sensorik Rungu/Wicara">Sensorik Rungu</option>
              <option value="Disabilitas Intelektual">Intelektual</option>
              <option value="Disabilitas Mental">Mental</option>
            </select>
          </div>
          <div className="relative">
            <Briefcase className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select value={filterEmployment} onChange={(e) => setFilterEmployment(e.target.value)} className="w-full appearance-none rounded-xl border-2 border-slate-900 bg-white py-3 pl-10 pr-8 text-[9px] font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] outline-none">
              <option value="all">Semua Status Karir</option>
              <option value="Job Seeker">Mencari Kerja</option>
              <option value="Pegawai Swasta">Pegawai Swasta</option>
              <option value="ASN (PNS / PPPK)">ASN</option>
              <option value="Wiraswasta / Entrepreneur">Wiraswasta</option>
              <option value="Belum Bekerja">Belum Bekerja</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="overflow-hidden rounded-[3rem] border-4 border-slate-900 bg-white shadow-[20px_20px_0px_0px_rgba(15,23,42,1)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b-4 border-slate-900 bg-slate-50">
              <tr>
                <th className="px-8 py-6">
                  <div className="flex items-center justify-center">
                    <input type="checkbox" className="sr-only" id="select-all" checked={selectedIds.length === paginatedData.length && selectedIds.length > 0} onChange={toggleSelectAll} />
                    <label htmlFor="select-all" className="cursor-pointer">{selectedIds.length === paginatedData.length && selectedIds.length > 0 ? <CheckSquare size={24} className="text-emerald-600" /> : <Square size={24} className="text-slate-300" />}</label>
                  </div>
                </th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Identitas</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Akademik</th>
                <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Verifikasi</th>
                <th className="px-8 py-6 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">Manajemen</th>
              </tr>
            </thead>
            <tbody className="divide-y-4 divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="py-32 text-center"><Loader2 className="mx-auto animate-spin text-emerald-500" size={48} /></td></tr>
              ) : paginatedData.map((talent) => {
                const status = talent.campus_verifications?.[0]?.status || 'pending';
                const isSelected = selectedIds.includes(talent.id);
                const currentYear = new Date().getFullYear();
                const isAlumni = talent.graduation_date && Number(talent.graduation_date) <= currentYear;

                return (
                  <tr key={talent.id} className={`group transition-all ${isSelected ? 'bg-emerald-50/50' : 'hover:bg-slate-50'}`}>
                    <td className="px-8 py-6">
                      <div className="flex items-center justify-center">
                        <input type="checkbox" className="sr-only" id={`sel-${talent.id}`} checked={isSelected} onChange={() => toggleSelectOne(talent.id)} />
                        <label htmlFor={`sel-${talent.id}`} className="cursor-pointer">{isSelected ? <CheckSquare size={24} className="text-emerald-600" /> : <Square size={24} className="text-slate-200 group-hover:text-slate-400" />}</label>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="flex size-12 items-center justify-center rounded-xl border-2 border-slate-900 bg-slate-100 font-black uppercase text-slate-400">{talent.full_name?.charAt(0)}</div>
                        <div>
                          <p className="text-sm font-black uppercase leading-none">{talent.full_name}</p>
                          <div className="mt-1 flex items-center gap-2">
                             <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{talent.disability_type}</span>
                             <span className={`rounded px-1.5 py-0.5 text-[8px] font-black uppercase ${isAlumni ? 'bg-indigo-100 text-indigo-600' : 'bg-emerald-100 text-emerald-600'}`}>{isAlumni ? 'Alumni' : 'Aktif'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-[10px] font-black uppercase italic text-slate-600">{talent.major || "Belum Update"}</td>
                    <td className="px-8 py-6">
                      <div className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[9px] font-black uppercase tracking-widest ${status === 'verified' ? 'bg-emerald-100 text-emerald-700' : status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-orange-100 text-orange-700'}`}>
                        {status === 'verified' ? <CheckCircle2 size={12}/> : status === 'rejected' ? <XCircle size={12}/> : <AlertCircle size={12}/>} {status}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {status === 'pending' || status === 'rejected' ? (
                          <>
                            <button onClick={() => handleAction([talent.id], 'verified')} className="rounded-xl bg-emerald-600 p-2.5 text-white transition-all hover:bg-slate-900" aria-label="Verifikasi"><UserCheck size={18}/></button>
                            <button onClick={() => handleAction([talent.id], 'rejected')} className="rounded-xl border-2 border-slate-200 p-2.5 text-slate-400 transition-all hover:border-rose-500 hover:text-rose-500" aria-label="Tolak"><UserX size={18}/></button>
                          </>
                        ) : (
                          <button onClick={() => handleAction([talent.id], 'pending')} className="rounded-xl bg-orange-100 p-2.5 text-orange-600 transition-all hover:bg-orange-600 hover:text-white" aria-label="Batalkan Verifikasi"><Undo2 size={18}/></button>
                        )}
                        <div className="mx-1 h-6 w-px bg-slate-200" />
                        <button onClick={() => generateProfessionalCV(talent.id)} className="rounded-xl bg-slate-900 p-2.5 text-white transition-all hover:bg-emerald-600" aria-label="Cetak CV"><Printer size={18}/></button>
                        <a href={`/talent/${talent.id}`} target="_blank" className="rounded-xl border-2 border-slate-200 p-2.5 text-slate-400 transition-all hover:border-slate-900 hover:text-slate-900"><ExternalLink size={18}/></a>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* PAGINATION */}
      <div className="mt-12 flex flex-col items-center justify-between gap-6 px-4 md:flex-row">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total {filteredData.length} Data Terfilter</p>
        <div className="flex items-center gap-4">
          <button disabled={currentPage === 1} onClick={() => { setCurrentPage(p => p - 1); window.scrollTo(0, 400); }} className="size-12 rounded-2xl border-4 border-slate-900 bg-white transition-all disabled:opacity-20"><ChevronLeft size={24} /></button>
          <div className="text-xs font-black italic">Halaman {currentPage} dari {totalPages || 1}</div>
          <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => { setCurrentPage(p => p + 1); window.scrollTo(0, 400); }} className="size-12 rounded-2xl border-4 border-slate-900 bg-white transition-all disabled:opacity-20"><ChevronRight size={24} /></button>
        </div>
      </div>
    </div>
  );
}