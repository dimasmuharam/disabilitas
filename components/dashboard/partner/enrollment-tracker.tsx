"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { 
  CheckCircle, 
  Download, 
  Printer, 
  ArrowLeft, 
  ExternalLink, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  AlertCircle, 
  Loader2
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
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  
  // STATUS AKSESIBILITAS & NOTIFIKASI
  const [announcement, setAnnouncement] = useState("");
  const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // FUNGSI TOGGLE SELECT
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

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
          id, status, applied_at, training_id,
          trainings (id, title),
          profiles (id, full_name, disability_type, city, gender)
        `, { count: "exact" })
        .eq("partner_id", partnerId);

      if (filterStatus !== "all") query = query.eq("status", filterStatus);
      if (selectedTrainingId !== "all") query = query.eq("training_id", selectedTrainingId);

      const from = (currentPage - 1) * pageSize;
      const { data, count, error } = await query
        .order("applied_at", { ascending: false })
        .range(from, from + pageSize - 1);

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

  // FUNGSI UPDATE STATUS MASSAL
  async function handleUpdateStatus(ids: string[], newStatus: string) {
    if (ids.length === 0) return;
    setProcessing(true);
    setAnnouncement(`Sedang memproses ${ids.length} pendaftar...`);
    
    try {
      const { error } = await supabase
        .from("trainees")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .in("id", ids);
      
      if (error) throw error;
      
      const successText = `${ids.length} pendaftar berhasil di-${newStatus === 'accepted' ? 'terima' : 'tolak'}.`;
      setAnnouncement(successText);
      setStatusMessage({ type: 'success', text: successText });
      
      setTimeout(() => setStatusMessage(null), 5000);
      fetchEnrollments();
    } catch (err) {
      setStatusMessage({ type: 'error', text: "Gagal memperbarui status. Silakan coba lagi." });
    } finally {
      setProcessing(false);
    }
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-8 text-left">
      <div className="sr-only" aria-live="polite" role="status">
        {announcement}
      </div>

      {/* HEADER */}
      <div className="flex flex-col justify-between gap-6 border-b-4 border-slate-900 pb-8 md:flex-row md:items-end">
        <div>
          <button 
            onClick={onBack} 
            className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 outline-none transition-all hover:text-slate-900 focus:ring-2 focus:ring-blue-600"
          >
            <ArrowLeft size={16} /> Kembali
          </button>
          <h1 className="text-4xl font-black italic leading-none uppercase tracking-tighter text-slate-900">Seleksi Pendaftar</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          {/* TOMBOL CETAK - SINKRON DENGAN HELPER (4 PARAMETER) */}
          <button 
            disabled={selectedTrainingId === "all" || enrollments.length === 0}
            onClick={() => generateEnrollmentPDF(enrollments, trainings, selectedTrainingId, partnerName)} 
            className="flex items-center gap-2 rounded-2xl border-4 border-slate-900 bg-white px-6 py-4 text-[10px] font-black uppercase text-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-20"
          >
            <Printer size={18} /> Cetak Daftar Hadir
          </button>
          
          <button 
            onClick={() => exportEnrollmentToExcel(enrollments, partnerName)} 
            className="flex items-center gap-2 rounded-2xl border-4 border-slate-900 bg-emerald-500 px-6 py-4 text-[10px] font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-emerald-600"
          >
            <Download size={18} /> Export Excel
          </button>
        </div>
      </div>

      {/* NOTIFIKASI */}
      {statusMessage && (
        <div 
          className={`flex animate-in fade-in slide-in-from-top-4 items-center gap-4 rounded-2xl border-4 p-6 ${
            statusMessage.type === 'success' ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-red-500 bg-red-50 text-red-800'
          }`}
          role="alert"
        >
          {statusMessage.type === 'success' ? <CheckCircle size={24}/> : <AlertCircle size={24}/>}
          <p className="text-sm font-bold italic uppercase">{statusMessage.text}</p>
        </div>
      )}

      {/* BULK ACTION BAR */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-[2rem] bg-slate-900 p-6 text-white shadow-xl">
        <div className="flex items-center gap-4">
          <label className="flex cursor-pointer select-none items-center gap-3 text-[10px] font-black italic uppercase">
            <input 
              type="checkbox" 
              className="size-6 rounded border-2 border-white bg-transparent accent-blue-500"
              checked={selectedIds.length === enrollments.length && enrollments.length > 0}
              onChange={() => setSelectedIds(selectedIds.length === enrollments.length ? [] : enrollments.map(e => e.id))}
            />
            Pilih Halaman Ini ({selectedIds.length})
          </label>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            disabled={selectedIds.length === 0 || processing}
            onClick={() => handleUpdateStatus(selectedIds, "accepted")}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-[10px] font-black uppercase shadow-lg transition-all hover:bg-emerald-500 disabled:opacity-20"
          >
            {processing ? <Loader2 className="animate-spin" size={14}/> : 'Terima Terpilih'}
          </button>
          <button 
            disabled={selectedIds.length === 0 || processing}
            onClick={() => handleUpdateStatus(selectedIds, "rejected")}
            className="rounded-xl bg-red-600 px-6 py-3 text-[10px] font-black uppercase shadow-lg transition-all hover:bg-red-500 disabled:opacity-20"
          >
            Tolak Terpilih
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="grid grid-cols-1 gap-6 rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] md:grid-cols-2">
        <div className="space-y-3">
          <label htmlFor="training-filter" className="text-[10px] font-black uppercase text-slate-400">Program Pelatihan</label>
          <select 
            id="training-filter" 
            value={selectedTrainingId} 
            onChange={(e) => {setSelectedTrainingId(e.target.value); setCurrentPage(1);}} 
            className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-5 font-bold outline-none transition-all focus:border-slate-900 focus:bg-white"
          >
            <option value="all">Semua Program</option>
            {trainings.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-slate-400">Status Seleksi</label>
          <div className="flex gap-2 rounded-2xl bg-slate-100 p-2" role="radiogroup">
            {['applied', 'accepted', 'rejected'].map((s) => (
              <button 
                key={s} 
                onClick={() => {setFilterStatus(s); setCurrentPage(1);}} 
                className={`flex-1 rounded-xl py-3 text-[10px] font-black uppercase transition-all ${filterStatus === s ? "bg-white text-slate-900 shadow-md" : "text-slate-400 hover:text-slate-600"}`}
              >
                {s === 'applied' ? 'Antrean' : s === 'accepted' ? 'Lolos' : 'Gagal'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* LIST PENDAFTAR */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-32 text-center font-black italic uppercase text-slate-300 animate-pulse">Menghubungkan Database...</div>
        ) : enrollments.length > 0 ? (
          enrollments.map((item) => (
            <div 
              key={item.id} 
              className={`group flex items-center gap-6 rounded-[2.5rem] border-4 p-6 transition-all ${
                selectedIds.includes(item.id) ? "border-blue-600 bg-blue-50" : "border-slate-900 bg-white shadow-[6px_6px_0px_0px_rgba(15,23,42,1)]"
              }`}
            >
              <input 
                type="checkbox" 
                className="size-8 cursor-pointer rounded-lg border-2 border-slate-900 accent-blue-600 focus:ring-4 focus:ring-blue-100"
                checked={selectedIds.includes(item.id)}
                onChange={() => toggleSelect(item.id)}
              />
              <div className="flex flex-1 flex-col justify-between gap-4 md:flex-row md:items-center">
                <div className="text-left">
                  <h3 className="text-2xl font-black italic leading-none uppercase tracking-tighter text-slate-900">{item.profiles?.full_name}</h3>
                  <p className="mt-1 text-[10px] font-black italic uppercase text-slate-400">
                    {item.profiles?.disability_type} • <span className="text-blue-600 underline">{item.trainings?.title}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  {item.status === 'applied' ? (
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleUpdateStatus([item.id], "accepted")} 
                        className="rounded-xl bg-slate-900 px-6 py-3 text-[10px] font-black uppercase text-white transition-all hover:bg-emerald-600"
                      >
                        Terima
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus([item.id], "rejected")} 
                        className="rounded-xl border-2 border-slate-900 bg-white px-6 py-3 text-[10px] font-black uppercase text-slate-900 transition-all hover:border-red-600 hover:bg-red-50 hover:text-red-600"
                      >
                        Tolak
                      </button>
                    </div>
                  ) : (
                    <div className={`rounded-xl px-6 py-3 text-[10px] font-black italic uppercase ${
                      item.status === 'accepted' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {item.status === 'accepted' ? 'Diterima' : 'Ditolak'}
                    </div>
                  )}
                  <Link 
                    href={`/talent/${item.profiles?.id}`} 
                    target="_blank" 
                    className="rounded-xl bg-slate-100 p-3 text-slate-400 transition-all hover:text-blue-600"
                  >
                    <ExternalLink size={20}/>
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex animate-in zoom-in flex-col items-center justify-center rounded-[4rem] border-4 border-dashed border-slate-100 py-40 text-center">
            <Search size={64} className="mb-6 text-slate-100" />
            <h3 className="text-2xl font-black italic tracking-tighter text-slate-300 uppercase">
              Data Tidak Ditemukan
            </h3>
          </div>
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-6 py-10">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="rounded-2xl border-4 border-slate-900 bg-white p-5 text-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-slate-50 disabled:opacity-20"
          >
            <ChevronLeft size={24} />
          </button>
          <span className="text-[14px] font-black italic tracking-widest text-slate-900 uppercase">
            {currentPage} <span className="mx-2 text-slate-300">/</span> {totalPages}
          </span>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="rounded-2xl border-4 border-slate-900 bg-white p-5 text-slate-900 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-slate-50 disabled:opacity-20"
          >
            <ChevronRight size={24} />
          </button>
        </nav>
      )}
    </div>
  );
}