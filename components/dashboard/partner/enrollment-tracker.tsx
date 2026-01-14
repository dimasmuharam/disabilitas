"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Users, CheckCircle, XCircle, GraduationCap, 
  Mail, Download, Printer, ChevronDown, 
  FileText, ArrowLeft, BadgeCheck, Clock, User,
  ExternalLink, Search, Info, CheckSquare, Square
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
  
  // State untuk Bulk Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);

  const fetchFilterData = useCallback(async () => {
    const { data } = await supabase
      .from("trainings")
      .select("id, title, start_date, location")
      .eq("partner_id", partnerId);
    if (data) setTrainings(data);
  }, [partnerId]);

  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("trainees")
        .select(`
          id, status, notes, applied_at, top_skills, training_id,
          trainings (id, title, start_date, location),
          profiles (id, full_name, email, phone, disability_type, gender, city)
        `)
        .eq("partner_id", partnerId);

      if (filterStatus !== "all") query = query.eq("status", filterStatus);
      if (selectedTrainingId !== "all") query = query.eq("training_id", selectedTrainingId);

      const { data, error } = await query.order("applied_at", { ascending: false });
      if (error) throw error;
      setEnrollments(data || []);
      setSelectedIds([]); // Reset seleksi setiap kali data berubah
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, [partnerId, filterStatus, selectedTrainingId]);

  useEffect(() => {
    fetchFilterData();
    fetchEnrollments();
  }, [fetchEnrollments, fetchFilterData]);

  // FUNGSI UPDATE STATUS (SINGLE & BULK)
  async function updateStatus(ids: string[], newStatus: string) {
    if (ids.length === 0) return;
    setProcessing(true);
    try {
      const { error } = await supabase
        .from("trainees")
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString() 
        })
        .in("id", ids); // Menggunakan .in() agar bisa handle satu atau banyak ID sekaligus
      
      if (error) throw error;
      alert(`Berhasil memperbarui ${ids.length} pendaftar menjadi ${newStatus}`);
      fetchEnrollments();
    } catch (err) {
      alert("Gagal memperbarui status. Pastikan koneksi stabil.");
      console.error(err);
    } finally {
      setProcessing(false);
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === enrollments.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(enrollments.map(e => e.id));
    }
  };

  return (
    <div className="space-y-8 text-left animate-in fade-in duration-500">
      <div className="flex flex-col justify-between gap-6 border-b-4 border-slate-900 pb-8 md:flex-row md:items-end">
        <div>
          <button onClick={onBack} className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">
            <ArrowLeft size={16} /> Kembali
          </button>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter leading-none text-slate-900 italic">
            Seleksi Pendaftar
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={() => exportEnrollmentToExcel(enrollments, partnerName)} disabled={enrollments.length === 0} className="flex items-center gap-2 rounded-2xl border-4 border-slate-900 bg-emerald-500 px-6 py-4 text-[10px] font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-emerald-600">
            <Download size={18} /> Export Arsip
          </button>
          <button onClick={() => generateEnrollmentPDF(enrollments, trainings, selectedTrainingId, partnerName)} disabled={selectedTrainingId === "all" || enrollments.length === 0} className="flex items-center gap-2 rounded-2xl border-4 border-slate-900 bg-blue-600 px-6 py-4 text-[10px] font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-blue-700">
            <Printer size={18} /> Cetak Absensi
          </button>
        </div>
      </div>

      {/* BULK ACTION BAR - Muncul saat ada yang dipilih */}
      {selectedIds.length > 0 && (
        <div className="sticky top-4 z-50 flex items-center justify-between rounded-3xl border-4 border-slate-900 bg-blue-600 p-6 text-white shadow-2xl animate-in slide-in-from-top-4">
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-white px-4 py-1 text-[12px] font-black text-blue-600">
              {selectedIds.length} Dipilih
            </div>
            <p className="text-[10px] font-black uppercase italic">Terapkan tindakan massal untuk pendaftar yang dipilih?</p>
          </div>
          <div className="flex gap-2">
            <button 
              disabled={processing}
              onClick={() => updateStatus(selectedIds, "accepted")}
              className="rounded-xl bg-slate-900 px-6 py-3 text-[10px] font-black uppercase hover:bg-emerald-500 transition-all disabled:opacity-50"
            >
              Terima Masal
            </button>
            <button 
              disabled={processing}
              onClick={() => updateStatus(selectedIds, "rejected")}
              className="rounded-xl border-2 border-white bg-transparent px-6 py-3 text-[10px] font-black uppercase hover:bg-red-500 hover:border-red-500 transition-all disabled:opacity-50"
            >
              Tolak Masal
            </button>
            <button onClick={() => setSelectedIds([])} className="text-[10px] font-black uppercase underline ml-2">Batal</button>
          </div>
        </div>
      )}

      {/* FILTER BOX */}
      <div className="grid grid-cols-1 gap-6 rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] md:grid-cols-2">
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-slate-400">Pilih Program</label>
          <select value={selectedTrainingId} onChange={(e) => setSelectedTrainingId(e.target.value)} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 p-5 font-bold outline-none focus:border-slate-900">
            <option value="all">Semua Program Pelatihan</option>
            {trainings.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-black uppercase text-slate-400">Status Seleksi</label>
          <div className="flex gap-2 rounded-2xl bg-slate-100 p-2">
            {['applied', 'accepted', 'rejected', 'all'].map((s) => (
              <button key={s} onClick={() => setFilterStatus(s)} className={`flex-1 rounded-xl py-3 text-[10px] font-black uppercase transition-all ${filterStatus === s ? "bg-white text-slate-900 shadow-md" : "text-slate-400 hover:text-slate-600"}`}>
                {s === 'applied' ? 'Antrean' : s === 'accepted' ? 'Lolos' : s === 'rejected' ? 'Gagal' : 'Semua'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-4">
        <button onClick={toggleSelectAll} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-slate-900">
          {selectedIds.length === enrollments.length && enrollments.length > 0 ? <CheckSquare size={18} className="text-blue-600" /> : <Square size={18} />}
          Pilih Semua
        </button>
        <p className="text-[10px] font-black uppercase text-slate-400 italic">Total: {enrollments.length} Pendaftar</p>
      </div>

      {/* LIST DATA */}
      {loading ? (
        <div className="py-32 text-center font-black uppercase italic text-slate-300 animate-pulse">Menghubungkan Data...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {enrollments.length > 0 ? enrollments.map((item) => (
            <div key={item.id} className={`group flex flex-col items-center justify-between gap-8 rounded-[3rem] border-4 bg-white p-8 transition-all md:flex-row ${selectedIds.includes(item.id) ? "border-blue-600 shadow-[8px_8px_0px_0px_rgba(37,99,235,1)]" : "border-slate-900 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]"}`}>
              <div className="flex flex-1 items-start gap-6">
                <button onClick={() => toggleSelect(item.id)} className="mt-2 text-slate-200 hover:text-blue-600 transition-colors">
                  {selectedIds.includes(item.id) ? <CheckSquare size={32} className="text-blue-600" /> : <Square size={32} />}
                </button>
                <div className="space-y-2 text-left">
                  <div className="flex items-center gap-3">
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900">{item.profiles?.full_name}</h3>
                    <span className={`text-[10px] font-black uppercase italic ${item.status === 'accepted' ? 'text-emerald-500' : item.status === 'rejected' ? 'text-red-500' : 'text-blue-500'}`}>• {item.status}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-4 py-1.5 text-[10px] font-black uppercase text-slate-500">{item.profiles?.disability_type}</span>
                    <span className="rounded-full bg-blue-50 px-4 py-1.5 text-[10px] font-black uppercase text-blue-600">{item.trainings?.title}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {item.status === "applied" && (
                  <div className="flex gap-2">
                    <button onClick={() => updateStatus([item.id], "accepted")} className="rounded-2xl bg-slate-900 px-8 py-5 text-[11px] font-black uppercase text-white shadow-lg transition-all hover:bg-emerald-600">Terima</button>
                    <button onClick={() => updateStatus([item.id], "rejected")} className="rounded-2xl border-4 border-slate-900 bg-white px-8 py-5 text-[11px] font-black uppercase text-slate-900 hover:bg-red-50">Tolak</button>
                  </div>
                )}
                <Link href={`/talent/${item.profiles?.id}`} target="_blank" className="rounded-2xl bg-slate-100 p-5 text-slate-400 hover:bg-blue-600 hover:text-white transition-all">
                  <ExternalLink size={22} />
                </Link>
              </div>
            </div>
          )) : (
            <div className="py-40 text-center rounded-[4rem] border-4 border-dashed border-slate-100">
              <p className="text-2xl font-black uppercase italic text-slate-200">Tidak ada pendaftar</p>
            </div>
          )}
        </div>
      )}

      {/* FOOTER */}
      <div className="flex items-start gap-5 rounded-[2.5rem] border-b-8 border-blue-600 bg-slate-900 p-8 text-white shadow-2xl">
        <Info className="shrink-0 text-blue-400" size={24} />
        <div className="space-y-2 text-left">
          <p className="text-[11px] font-black uppercase italic tracking-[0.2em] text-blue-400">SOP Seleksi Massal</p>
          <p className="max-w-4xl text-xs font-bold leading-relaxed opacity-80 italic">
            Gunakan kotak centang di sisi kiri nama talenta untuk memilih beberapa pendaftar sekaligus. Tombol <strong>Tindakan Massal</strong> akan muncul secara otomatis di bagian atas layar untuk memproses seleksi lebih cepat.
          </p>
        </div>
      </div>
    </div>
  );
}