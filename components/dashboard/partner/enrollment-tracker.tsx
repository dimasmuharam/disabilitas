"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { 
  CheckCircle, XCircle, GraduationCap, 
  Download, Printer, ChevronDown, 
  FileText, ArrowLeft, BadgeCheck, User,
  ExternalLink, Search, Info, ChevronLeft, ChevronRight
} from "lucide-react";
import Link from "next/link";
import { generateEnrollmentPDF, exportEnrollmentToExcel } from "./enrollment-export-helper";

interface EnrollmentTrackerProps {
  partnerId: string;
  onBack: () => void;
  partnerName?: string;
}

export default function EnrollmentTracker({ partnerId, onBack, partnerName = "Mitra Pelatihan" }: EnrollmentTrackerProps) {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [trainings, setTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("applied");
  const [selectedTrainingId, setSelectedTrainingId] = useState<string>("all");
  
  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  // BULK SELECTION STATE
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);

  const fetchFilterData = useCallback(async () => {
    const { data } = await supabase
      .from("trainings")
      .select("id, title")
      .eq("partner_id", partnerId);
    if (data) setTrainings(data);
  }, [partnerId]);

  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("trainees")
        .select(`
          id, status, applied_at, top_skills, training_id,
          trainings (id, title),
          profiles (id, full_name, disability_type)
        `, { count: "exact" })
        .eq("partner_id", partnerId);

      if (filterStatus !== "all") query = query.eq("status", filterStatus);
      if (selectedTrainingId !== "all") query = query.eq("training_id", selectedTrainingId);

      // Logika Pagination
      const from = (currentPage - 1) * pageSize;
      const to = from + pageSize - 1;

      const { data, count, error } = await query
        .order("applied_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      setEnrollments(data || []);
      setTotalCount(count || 0);
      setSelectedIds([]); 
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [partnerId, filterStatus, selectedTrainingId, currentPage]);

  useEffect(() => {
    fetchFilterData();
    fetchEnrollments();
  }, [fetchEnrollments, fetchFilterData]);

  async function handleUpdateStatus(ids: string[], newStatus: string) {
    if (ids.length === 0) return;
    const confirmMsg = ids.length > 1 
      ? `Apakah Anda yakin ingin memproses ${ids.length} pendaftar sekaligus?` 
      : `Proses pendaftar ini?`;
    
    if (!confirm(confirmMsg)) return;

    setProcessing(true);
    try {
      const { error } = await supabase
        .from("trainees")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .in("id", ids);
      
      if (error) throw error;
      fetchEnrollments();
    } catch (err) {
      alert("Gagal memperbarui status.");
    } finally {
      setProcessing(false);
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-8 text-left animate-in fade-in duration-500">
      {/* HEADER ACTIONS */}
      <div className="flex flex-col justify-between gap-6 border-b-4 border-slate-900 pb-8 md:flex-row md:items-end">
        <div>
          <button onClick={onBack} className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900">
            <ArrowLeft size={16} /> Kembali
          </button>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900">Seleksi Pendaftar</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => exportEnrollmentToExcel(enrollments, partnerName)} className="flex items-center gap-2 rounded-2xl border-4 border-slate-900 bg-emerald-500 px-6 py-4 text-[10px] font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
            <Download size={18} /> Export Excel
          </button>
          <button onClick={() => generateEnrollmentPDF(enrollments, trainings, selectedTrainingId, partnerName)} disabled={selectedTrainingId === "all"} className="flex items-center gap-2 rounded-2xl border-4 border-slate-900 bg-blue-600 px-6 py-4 text-[10px] font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] disabled:opacity-50">
            <Printer size={18} /> Cetak Absensi
          </button>
        </div>
      </div>

      {/* ACCESSIVE BULK & QUICK ACTIONS */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] bg-slate-900 p-6 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase italic cursor-pointer">
            <input 
              type="checkbox" 
              className="h-5 w-5 rounded border-2 border-white bg-transparent"
              checked={selectedIds.length === enrollments.length && enrollments.length > 0}
              onChange={() => setSelectedIds(selectedIds.length === enrollments.length ? [] : enrollments.map(e => e.id))}
            />
            Pilih Halaman Ini ({selectedIds.length})
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          {/* BULK BUTTONS */}
          <button 
            disabled={selectedIds.length === 0 || processing}
            onClick={() => handleUpdateStatus(selectedIds, "accepted")}
            className="rounded-xl bg-emerald-600 px-5 py-3 text-[10px] font-black uppercase shadow-lg hover:bg-emerald-500 disabled:opacity-30"
          >
            Terima Terpilih
          </button>
          <button 
            disabled={selectedIds.length === 0 || processing}
            onClick={() => handleUpdateStatus(selectedIds, "rejected")}
            className="rounded-xl bg-red-600 px-5 py-3 text-[10px] font-black uppercase shadow-lg hover:bg-red-500 disabled:opacity-30"
          >
            Tolak Terpilih
          </button>
          <div className="h-10 w-[2px] bg-white/10 mx-2" />
          {/* QUICK ALL ACTIONS */}
          <button 
            disabled={enrollments.length === 0 || processing}
            onClick={() => handleUpdateStatus(enrollments.map(e => e.id), "accepted")}
            className="rounded-xl border-2 border-emerald-500 px-5 py-3 text-[10px] font-black uppercase text-emerald-500 hover:bg-emerald-500 hover:text-white"
          >
            Terima Semua Halaman Ini
          </button>
        </div>
      </div>

      {/* FILTER BOX */}
      <div className="grid grid-cols-1 gap-6 rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] md:grid-cols-2">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-slate-400">Program Pelatihan</label>
          <select value={selectedTrainingId} onChange={(e) => {setSelectedTrainingId(e.target.value); setCurrentPage(1);}} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-5 font-bold outline-none focus:border-slate-900">
            <option value="all">Semua Program</option>
            {trainings.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-slate-400">Status</label>
          <div className="flex gap-2 rounded-2xl bg-slate-100 p-2">
            {['applied', 'accepted', 'rejected', 'all'].map((s) => (
              <button key={s} onClick={() => {setFilterStatus(s); setCurrentPage(1);}} className={`flex-1 rounded-xl py-3 text-[10px] font-black uppercase transition-all ${filterStatus === s ? "bg-white text-slate-900 shadow-md" : "text-slate-400"}`}>
                {s === 'applied' ? 'Antrean' : s === 'accepted' ? 'Lolos' : s === 'rejected' ? 'Gagal' : 'Semua'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* LIST DATA */}
      <div className="grid grid-cols-1 gap-4">
        {enrollments.map((item) => (
          <div key={item.id} className={`group flex items-center gap-6 rounded-[2.5rem] border-4 p-6 transition-all ${selectedIds.includes(item.id) ? "border-blue-600 bg-blue-50" : "border-slate-900 bg-white shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]"}`}>
            <input 
              type="checkbox" 
              aria-label={`Pilih ${item.profiles?.full_name}`}
              className="h-6 w-6 cursor-pointer rounded border-2 border-slate-900"
              checked={selectedIds.includes(item.id)}
              onChange={() => toggleSelect(item.id)}
            />
            <div className="flex flex-1 flex-col justify-between gap-4 md:flex-row md:items-center">
              <div className="text-left">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter text-slate-900">{item.profiles?.full_name}</h3>
                <div className="mt-1 flex gap-2">
                  <span className="text-[10px] font-black uppercase text-slate-400 italic">{item.profiles?.disability_type}</span>
                  <span className="text-[10px] font-black uppercase text-blue-600 italic underline"># {item.trainings?.title}</span>
                </div>
              </div>
              <div className="flex gap-2">
                {item.status === 'applied' ? (
                  <>
                    <button onClick={() => handleUpdateStatus([item.id], "accepted")} className="rounded-xl bg-slate-900 px-6 py-3 text-[10px] font-black uppercase text-white hover:bg-emerald-600">Terima</button>
                    <button onClick={() => handleUpdateStatus([item.id], "rejected")} className="rounded-xl border-2 border-slate-900 bg-white px-6 py-3 text-[10px] font-black uppercase hover:bg-red-50">Tolak</button>
                  </>
                ) : (
                  <span className={`rounded-xl px-6 py-3 text-[10px] font-black uppercase ${item.status === 'accepted' ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'}`}>{item.status}</span>
                )}
                <Link href={`/talent/${item.profiles?.id}`} target="_blank" className="rounded-xl bg-slate-100 p-3 text-slate-400 hover:text-blue-600"><ExternalLink size={18}/></Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* PAGINATION CONTROLS */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 py-10">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="rounded-xl border-4 border-slate-900 bg-white p-4 text-slate-900 disabled:opacity-20"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-[12px] font-black uppercase italic tracking-widest">Halaman {currentPage} dari {totalPages}</span>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="rounded-xl border-4 border-slate-900 bg-white p-4 text-slate-900 disabled:opacity-20"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* FOOTER TIPS */}
      <div className="flex items-start gap-5 rounded-[2.5rem] border-b-8 border-blue-600 bg-slate-900 p-8 text-white shadow-2xl">
        <Info className="shrink-0 text-blue-400" size={24} />
        <div className="space-y-2 text-left">
          <p className="text-[11px] font-black uppercase italic leading-none tracking-[0.2em] text-blue-400">SOP Seleksi Massal</p>
          <p className="max-w-4xl text-xs font-bold leading-relaxed opacity-80 italic">
            Gunakan <strong>Checkbox</strong> untuk memilih talenta secara individu atau <strong>Pilih Halaman Ini</strong> untuk memproses 10 orang sekaligus. Navigasi halaman tersedia di bagian bawah jika pendaftar melebihi kapasitas layar.
          </p>
        </div>
      </div>
    </div>
  );
}