"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { 
  Users, CheckCircle, XCircle, GraduationCap, 
  Mail, Phone, Download, Printer,
  MessageCircle, Info, ChevronDown, FileText
} from "lucide-react";

interface EnrollmentTrackerProps {
  partnerId: string;
  onBack: () => void;
}

export default function EnrollmentTracker({ partnerId, onBack }: EnrollmentTrackerProps) {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [trainings, setTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("applied");
  const [selectedTrainingId, setSelectedTrainingId] = useState<string>("all");

  const fetchFilterData = useCallback(async () => {
    const { data } = await supabase
      .from("trainings")
      .select("id, title, start_date")
      .eq("partner_id", partnerId);
    if (data) setTrainings(data);
  }, [partnerId]);

  const fetchEnrollments = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("trainees")
      .select(`
        *,
        trainings!inner (id, title, partner_id, start_date),
        profiles (full_name, email, phone, disability_type, gender, city)
      `)
      .eq("trainings.partner_id", partnerId);

    if (filterStatus !== "all") query = query.eq("status", filterStatus);
    if (selectedTrainingId !== "all") query = query.eq("training_id", selectedTrainingId);

    const { data } = await query.order("created_at", { ascending: false });
    if (data) setEnrollments(data);
    setLoading(false);
  }, [partnerId, filterStatus, selectedTrainingId]);

  useEffect(() => {
    fetchFilterData();
    fetchEnrollments();
  }, [fetchEnrollments, fetchFilterData]);

  const generatePDF = () => {
    const doc = new jsPDF();
    const activeTraining = trainings.find(t => t.id === selectedTrainingId);
    const orgName = "DISABILITAS.COM PARTNER";

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("DAFTAR HADIR PESERTA", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Penyelenggara: ${orgName}`, 105, 27, { align: "center" });
    doc.text(`Program: ${activeTraining?.title || "Semua Program"}`, 105, 32, { align: "center" });
    doc.text(`Tanggal: ${activeTraining?.start_date || "-"}`, 105, 37, { align: "center" });
    
    doc.line(20, 42, 190, 42);

    const tableRows = enrollments.map((item, index) => [
      index + 1,
      item.profiles?.full_name?.toUpperCase(),
      item.profiles?.city || "-",
      item.profiles?.gender === "Laki-laki" ? "L" : "P",
      item.profiles?.disability_type,
      `${index + 1}. .................`
    ]);

    (doc as any).autoTable({
      startY: 48,
      head: [['NO', 'NAMA LENGKAP', 'ASAL DAERAH', 'L/P', 'RAGAM DISABILITAS', 'TANDA TANGAN']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillGray: [40, 40, 40], textColor: 255, fontSize: 8, halign: 'center' },
      styles: { fontSize: 8, cellPadding: 3 }
    });

    doc.save(`Daftar_Hadir_${activeTraining?.title || 'Program'}.pdf`);
  };

  const exportToExcel = () => {
    const dataToExport = enrollments.map((item, index) => ({
      No: index + 1,
      Nama: item.profiles?.full_name,
      Email: item.profiles?.email,
      WhatsApp: item.profiles?.phone,
      Gender: item.profiles?.gender,
      Disabilitas: item.profiles?.disability_type,
      Status: item.status
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Peserta");
    XLSX.writeFile(workbook, "Data_Peserta_Pelatihan.xlsx");
  };

  async function updateStatus(id: string, newStatus: string) {
    const { error } = await supabase
      .from("trainees")
      .update({ status: newStatus, updated_at: new Date() })
      .eq("id", id);
    if (!error) fetchEnrollments();
  }

  return (
    <div className="space-y-6 text-left" role="region" aria-label="Manajemen Pendaftar">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-slate-900 pb-6">
        <div>
          <button 
            onClick={onBack}
            className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all"
            aria-label="Kembali ke Dashboard"
          >
            <ArrowLeft size={16} /> Kembali
          </button>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic text-slate-900">
            Seleksi Pendaftar
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportToExcel}
            disabled={selectedTrainingId === "all" || enrollments.length === 0}
            className="flex items-center gap-2 rounded-2xl border-4 border-slate-900 bg-emerald-500 px-6 py-3 text-[10px] font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-emerald-600 disabled:opacity-50"
          >
            <Download size={18} /> Export Excel
          </button>

          <button
            onClick={generatePDF}
            disabled={selectedTrainingId === "all" || enrollments.length === 0}
            className="flex items-center gap-2 rounded-2xl border-4 border-slate-900 bg-blue-600 px-6 py-3 text-[10px] font-black uppercase text-white shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] transition-all hover:bg-blue-700 disabled:opacity-50"
          >
            <Printer size={18} /> Cetak Daftar Hadir
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-[2rem] border-4 border-slate-900 bg-white shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
        <div className="space-y-2">
          <label htmlFor="prog-select" className="ml-1 text-[10px] font-black uppercase text-slate-400">Filter per Program</label>
          <div className="relative">
            <select 
              id="prog-select"
              value={selectedTrainingId}
              onChange={(e) => setSelectedTrainingId(e.target.value)}
              className="w-full appearance-none rounded-xl border-2 border-slate-100 bg-slate-50 p-4 font-bold outline-none focus:border-slate-900"
            >
              <option value="all">Semua Program Pelatihan</option>
              {trainings.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="stat-select" className="ml-1 text-[10px] font-black uppercase text-slate-400">Status Seleksi</label>
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
            {['applied', 'accepted', 'rejected', 'all'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`flex-1 rounded-lg py-3 text-[9px] font-black uppercase transition-all ${filterStatus === s ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
              >
                {s === 'applied' ? 'Menunggu' : s === 'accepted' ? 'Diterima' : s === 'rejected' ? 'Ditolak' : 'Semua'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center font-black uppercase italic text-slate-200 animate-pulse">Sinkronisasi Data...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {enrollments.length > 0 ? enrollments.map((item) => (
            <div key={item.id} className="group flex flex-col md:flex-row items-center justify-between gap-6 rounded-[2.5rem] border-4 border-slate-900 bg-white p-8 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)] transition-all hover:border-blue-600">
              <div className="flex items-center gap-6 flex-1">
                <div className="rounded-3xl bg-blue-50 p-5 text-blue-600 shadow-inner">
                  <GraduationCap size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase italic leading-none tracking-tighter text-slate-900">{item.profiles?.full_name}</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[9px] font-black uppercase text-slate-500">{item.profiles?.disability_type}</span>
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-[9px] font-black uppercase text-blue-600 italic">{item.trainings?.title}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {item.status === "applied" ? (
                  <>
                    <button 
                      onClick={() => updateStatus(item.id, "accepted")}
                      aria-label={`Terima pendaftaran ${item.profiles?.full_name}`}
                      className="rounded-2xl bg-slate-900 px-6 py-4 text-[10px] font-black uppercase text-white shadow-lg transition-all hover:bg-emerald-600"
                    >
                      Terima
                    </button>
                    <button 
                      onClick={() => updateStatus(item.id, "rejected")}
                      aria-label={`Tolak pendaftaran ${item.profiles?.full_name}`}
                      className="rounded-2xl border-4 border-slate-900 bg-white px-6 py-4 text-[10px] font-black uppercase text-slate-900 transition-all hover:bg-red-50 hover:text-red-600"
                    >
                      Tolak
                    </button>
                  </>
                ) : (
                  <span className={`rounded-xl px-4 py-2 text-[10px] font-black uppercase ${item.status === 'accepted' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {item.status === 'accepted' ? 'Sudah Diterima' : 'Sudah Ditolak'}
                  </span>
                )}
                <a 
                  href={`mailto:${item.profiles?.email}`}
                  aria-label={`Kirim email ke ${item.profiles?.full_name}`}
                  className="rounded-2xl bg-slate-100 p-4 text-slate-400 hover:text-slate-900 transition-all"
                >
                  <Mail size={20} />
                </a>
              </div>
            </div>
          )) : (
            <div className="rounded-[3rem] border-4 border-dashed border-slate-100 py-32 text-center">
              <p className="text-xl font-black uppercase italic text-slate-200">Tidak ada pendaftar ditemukan</p>
            </div>
          )}
        </div>
      )}

      <div className="rounded-3xl bg-slate-900 p-6 text-white flex items-start gap-4 border-b-8 border-blue-600">
        <Info className="shrink-0 text-blue-400" />
        <p className="text-[10px] font-bold uppercase leading-relaxed tracking-widest opacity-80">
          Gunakan fitur &quot;Cetak Daftar Hadir&quot; setelah menyaring status pendaftar menjadi &quot;Diterima&quot; 
          pada program tertentu untuk memudahkan absensi di lapangan.
        </p>
      </div>
    </div>
  );
}
