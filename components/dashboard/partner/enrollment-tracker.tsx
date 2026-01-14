"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Users, CheckCircle, XCircle, GraduationCap, 
  Mail, Download, Printer, ChevronDown, 
  FileText, ArrowLeft, BadgeCheck, Clock, User,
  ExternalLink, Search
} from "lucide-react";
import Link from "next/link";

// Import Fungsi Export dari file helper yang kita buat sebelumnya
import { generateEnrollmentPDF, exportEnrollmentToExcel } from "./enrollment-export-helper";

interface EnrollmentTrackerProps {
  partnerId: string;
  onBack: () => void;
  partnerName?: string; // Menangkap nama partner untuk kebutuhan KOP Surat
}

export default function EnrollmentTracker({ partnerId, onBack, partnerName = "Mitra Pelatihan" }: EnrollmentTrackerProps) {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [trainings, setTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("applied");
  const [selectedTrainingId, setSelectedTrainingId] = useState<string>("all");

  // 1. Ambil daftar program pelatihan milik partner untuk dropdown filter
  const fetchFilterData = useCallback(async () => {
    const { data } = await supabase
      .from("trainings")
      .select("id, title, start_date, location")
      .eq("partner_id", partnerId);
    if (data) setTrainings(data);
  }, [partnerId]);

  // 2. Ambil data pendaftar (Trainees) dengan sinkronisasi ke tabel Profiles
  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("trainees")
        .select(`
          id, 
          status, 
          notes, 
          applied_at, 
          top_skills, 
          training_id,
          trainings (id, title, start_date, location),
          profiles (id, full_name, email, phone, disability_type, gender, city)
        `)
        .eq("partner_id", partnerId);

      // Filter Status (Sesuai SOP: applied, accepted, rejected)
      if (filterStatus !== "all") {
        query = query.eq("status", filterStatus);
      }
      
      // Filter per Program Pelatihan
      if (selectedTrainingId !== "all") {
        query = query.eq("training_id", selectedTrainingId);
      }

      const { data, error } = await query.order("applied_at", { ascending: false });
      
      if (error) throw error;
      setEnrollments(data || []);
    } catch (err) {
      console.error("Fetch Enrollment Error:", err);
    } finally {
      setLoading(false);
    }
  }, [partnerId, filterStatus, selectedTrainingId]);

  useEffect(() => {
    fetchFilterData();
    fetchEnrollments();
  }, [fetchEnrollments, fetchFilterData]);

  // 3. Fungsi untuk Update Status (Terima/Tolak)
  async function updateStatus(id: string, newStatus: string) {
    const { error } = await supabase
      .from("trainees")
      .update({ 
        status: newStatus, 
        updated_at: new Date().toISOString() 
      })
      .eq("id", id);
    
    if (!error) {
      // Refresh data setelah update agar UI sinkron
      fetchEnrollments();
    } else {
      console.error("Update Status Error:", error);
    }
  }

  return (
    <div className="space-y-8 text-left animate-in fade-in duration-500">
      {/* HEADER: Navigasi dan Aksi Ekspor */}
      <div className="flex flex-col justify-between gap-6 border-b-4 border-slate-900 pb-8 md:flex-row md:items-end">
        <div>
          <button 
            onClick={onBack} 
            className="mb-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all"
          >
            <ArrowLeft size={16} /> Kembali ke Dashboard
          </button>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">
            Seleksi Pendaftar
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => exportEnrollmentToExcel(enrollments, partnerName)}
            disabled={enrollments.length === 0}
            className="flex items-center gap-2 rounded-2xl border-4 border-slate-900 bg-emerald-500 px-6 py-4 text-[10px] font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-emerald-600 disabled:opacity-50"
          >
            <Download size={18} /> Export Arsip
          </button>
          <button
            onClick={() => generateEnrollmentPDF(enrollments, trainings, selectedTrainingId, partnerName)}
            disabled={enrollments.length === 0 || selectedTrainingId === "all"}
            className="flex items-center gap-2 rounded-2xl border-4 border-slate-900 bg-blue-600 px-6 py-4 text-[10px] font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-blue-700 disabled:opacity-50"
          >
            <Printer size={18} /> Cetak Absensi
          </button>
        </div>
      </div>

      {/* FILTER BAR: Program & Status */}
      <div className="grid grid-cols-1 gap-6 rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] md:grid-cols-2">
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
            <GraduationCap size={14} /> Pilih Program
          </label>
          <div className="relative">
            <select 
              value={selectedTrainingId} 
              onChange={(e) => setSelectedTrainingId(e.target.value)} 
              className="w-full appearance-none rounded-2xl border-2 border-slate-100 bg-slate-50 p-5 font-bold outline-none focus:border-slate-900 transition-all"
            >
              <option value="all">Semua Program Pelatihan</option>
              {trainings.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
            <BadgeCheck size={14} /> Status Seleksi
          </label>
          <div className="flex gap-2 rounded-2xl bg-slate-100 p-2">
            {[
              { id: 'applied', label: 'Antrean' },
              { id: 'accepted', label: 'Diterima' },
              { id: 'rejected', label: 'Ditolak' },
              { id: 'all', label: 'Semua' }
            ].map((s) => (
              <button 
                key={s.id} 
                onClick={() => setFilterStatus(s.id)} 
                className={`flex-1 rounded-xl py-3 text-[10px] font-black uppercase transition-all ${filterStatus === s.id ? "bg-white text-slate-900 shadow-md" : "text-slate-400 hover:text-slate-600"}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* HASIL DATA */}
      {loading ? (
        <div className="py-32 text-center font-black uppercase italic text-slate-300 animate-pulse">Menghubungkan Data...</div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {enrollments.length > 0 ? enrollments.map((item) => (
            <div key={item.id} className="group rounded-[3rem] border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] hover:border-blue-600 transition-all">
              <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
                
                {/* Info Talenta */}
                <div className="flex flex-1 items-start gap-6">
                  <div className="rounded-[2rem] bg-slate-100 p-6 text-slate-900 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <User size={32} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="text-3xl font-black uppercase italic tracking-tighter text-slate-900 leading-none">
                        {item.profiles?.full_name}
                      </h3>
                      <span className={`text-[10px] font-black uppercase italic ${item.status === 'accepted' ? 'text-emerald-500' : item.status === 'rejected' ? 'text-red-500' : 'text-blue-500'}`}>
                        • {item.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-100 px-4 py-1.5 text-[10px] font-black uppercase text-slate-500 border border-slate-200">
                        {item.profiles?.disability_type}
                      </span>
                      <span className="rounded-full bg-blue-50 px-4 py-1.5 text-[10px] font-black uppercase text-blue-600 italic">
                        {item.trainings?.title}
                      </span>
                      <span className="flex items-center gap-1.5 rounded-full bg-slate-50 px-4 py-1.5 text-[10px] font-black uppercase text-slate-400">
                        <Clock size={12} /> {new Date(item.applied_at).toLocaleDateString('id-ID')}
                      </span>
                    </div>
                    {/* RISET: Top Skills */}
                    {item.top_skills?.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {item.top_skills.map((skill: string, i: number) => (
                          <span key={i} className="text-[9px] font-bold uppercase text-slate-300">#{skill}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tombol Aksi */}
                <div className="flex w-full items-center gap-3 md:w-auto">
                  {item.status === "applied" ? (
                    <div className="flex flex-1 gap-2 md:flex-none">
                      <button 
                        onClick={() => updateStatus(item.id, "accepted")} 
                        className="flex-1 rounded-2xl bg-slate-900 px-8 py-5 text-[11px] font-black uppercase text-white shadow-lg transition-all hover:bg-emerald-600 active:scale-95"
                      >
                        Terima
                      </button>
                      <button 
                        onClick={() => updateStatus(item.id, "rejected")} 
                        className="flex-1 rounded-2xl border-4 border-slate-900 bg-white px-8 py-5 text-[11px] font-black uppercase text-slate-900 transition-all hover:bg-red-50 hover:text-red-600 active:scale-95"
                      >
                        Tolak
                      </button>
                    </div>
                  ) : (
                    <div className={`flex flex-1 items-center gap-2 rounded-2xl px-8 py-5 text-[11px] font-black uppercase md:flex-none ${item.status === 'accepted' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {item.status === 'accepted' ? <CheckCircle size={18}/> : <XCircle size={18}/>}
                      {item.status === 'accepted' ? 'Diterima' : 'Ditolak'}
                    </div>
                  )}
                  
                  <Link 
                    href={`/talent/${item.profiles?.id}`} 
                    target="_blank" 
                    className="rounded-2xl bg-slate-100 p-5 text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                    title="Lihat Profil Lengkap"
                  >
                    <ExternalLink size={22} />
                  </Link>
                </div>
              </div>
            </div>
          )) : (
            <div className="py-40 text-center rounded-[4rem] border-4 border-dashed border-slate-100">
              <Search className="mx-auto mb-4 text-slate-100" size={48} />
              <p className="text-2xl font-black uppercase italic text-slate-200">Data pendaftar tidak ditemukan</p>
            </div>
          )}
        </div>
      )}

      {/* FOOTER INFO: Sesuai instruksi untuk tidak membicarakan riset di platform */}
      <div className="flex items-start gap-5 rounded-[2.5rem] border-b-8 border-blue-600 bg-slate-900 p-8 text-white shadow-2xl">
        <Info className="shrink-0 text-blue-400" size={24} />
        <div className="space-y-2">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-400 italic leading-none">Panduan Administrasi</p>
          <p className="max-w-4xl text-xs font-bold leading-relaxed opacity-80 italic">
            Gunakan fitur <strong>Export Arsip</strong> untuk mendownload data pendaftar lengkap dalam format Excel. Fitur <strong>Cetak Absensi</strong> (PDF) akan aktif otomatis saat Anda memfilter data berdasarkan satu program pelatihan yang spesifik.
          </p>
        </div>
      </div>
    </div>
  );
}