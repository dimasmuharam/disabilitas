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

  // Fetch daftar program milik partner
  const fetchFilterData = useCallback(async () => {
    const { data } = await supabase
      .from("trainings")
      .select("id, title, start_date")
      .eq("partner_id", partnerId);
    if (data) setTrainings(data);
  }, [partnerId]);

  // Fetch pendaftar dengan join profiles (termasuk gender & city)
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

    const { data, error } = await query.order("created_at", { ascending: false });
    if (data) setEnrollments(data);
    setLoading(false);
  }, [partnerId, filterStatus, selectedTrainingId]);

  useEffect(() => {
    fetchFilterData();
    fetchEnrollments();
  }, [fetchEnrollments, fetchFilterData]);

  // LOGIC: CETAK PDF DAFTAR HADIR PROFESIONAL
  const generatePDF = () => {
    const doc = new jsPDF();
    const activeTraining = trainings.find(t => t.id === selectedTrainingId);
    const orgName = "FORUM ASN INKLUSIF"; // Nama organisasi utama sesuai context Mas Dimas

    // Header dengan Logo (Placeholder - Mas bisa ganti dengan base64 logo.png nantinya)
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("DAFTAR HADIR PESERTA", 105, 20, { align: "center" });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Penyelenggara: ${orgName}`, 105, 27, { align: "center" });
    doc.text(`Program: ${activeTraining?.title || "Semua Program"}`, 105, 32, { align: "center" });
    doc.text(`Tanggal: ${activeTraining?.start_date || "-"}`, 105, 37, { align: "center" });
    
    doc.line(20, 42, 190, 42); // Garis pemisah

    // Mapping Data untuk Tabel
    const tableRows = enrollments.map((item, index) => [
      index + 1,
      item.profiles?.full_name?.toUpperCase(),
      item.profiles?.city || "-",
      item.profiles?.gender === "Laki-laki" ? "L" : "P",
      item.profiles?.disability_type,
      `${index + 1}. .................` // Kolom Tanda Tangan
    ]);

    (doc as any).autoTable({
      startY: 48,
      head: [['NO', 'NAMA LENGKAP', 'ASAL DAERAH', 'L/P', 'RAGAM DISABILITAS', 'TANDA TANGAN']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillGray: [40, 40, 40], textColor: 255, fontSize: 8, halign: 'center' },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 50 },
        2: { cellWidth: 30 },
        3: { cellWidth: 10, halign: 'center' },
        4: { cellWidth: 40 },
        5: { cellWidth: 40 }
      },
      styles: { fontSize: 8, cellPadding: 3 }
    });

    doc.save(`Daftar_Hadir_${activeTraining?.title || 'Program'}.pdf`);
  };

  // LOGIC: EXPORT EXCEL
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
    XLSX.writeFile(workbook, "Data_Peserta.xlsx");
  };

  async function updateStatus(id: string, newStatus: string) {
    const { error } = await supabase.from("trainees").update({ status: newStatus, updated_at: new Date() }).eq("id", id);
    if (!error) fetchEnrollments();
  }return (
    <div className="space-y-6" role="region" aria-label="Pelacakan Pendaftaran Peserta">
      {/* HEADER & NAVIGASI */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-black pb-6">
        <div>
          <button 
            onClick={onBack}
            className="mb-2 flex items-center gap-2 text-sm font-bold hover:underline"
            aria-label="Kembali ke Dashboard Utama"
          >
            ← KEMBALI
          </button>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">
            Manajemen Pendaftar
          </h1>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Tombol Export Excel - Hanya aktif jika program dipilih */}
          <button
            onClick={exportToExcel}
            disabled={selectedTrainingId === "all" || enrollments.length === 0}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
            aria-label="Unduh data pendaftar ke file Excel"
          >
            <Download size={18} aria-hidden="true" /> EXPORT EXCEL
          </button>

          {/* Tombol Cetak PDF - Khusus untuk Daftar Hadir (Filter status 'accepted' otomatis disarankan di UI) */}
          <button
            onClick={generatePDF}
            disabled={selectedTrainingId === "all" || enrollments.length === 0}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
            aria-label="Cetak Daftar Hadir Format PDF"
          >
            <Printer size={18} aria-hidden="true" /> CETAK DAFTAR HADIR (PDF)
          </button>
        </div>
      </div>

      {/* FILTER PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-yellow-400 p-4 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex flex-col gap-2">
          <label htmlFor="program-filter" className="font-bold uppercase text-sm">Pilih Program:</label>
          <select 
            id="program-filter"
            value={selectedTrainingId}
            onChange={(e) => setSelectedTrainingId(e.target.value)}
            className="p-2 border-2 border-black font-bold focus:ring-4 focus:ring-black outline-none"
          >
            <option value="all">Semua Program (Preview Saja)</option>
            {trainings.map(t => (
              <option key={t.id} value={t.id}>{t.title}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="status-filter" className="font-bold uppercase text-sm">Status Kelulusan:</label>
          <select 
            id="status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="p-2 border-2 border-black font-bold focus:ring-4 focus:ring-black outline-none"
          >
            <option value="applied">Menunggu Review</option>
            <option value="accepted">Diterima (Lulus)</option>
            <option value="rejected">Ditolak</option>
            <option value="all">Semua Status</option>
          </select>
        </div>
      </div>

      {/* DATA TABLE */}
      {loading ? (
        <div className="p-10 text-center font-bold animate-pulse" aria-live="polite">Memuat data talenta...</div>
      ) : (
        <div className="overflow-x-auto border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
          <table className="w-full text-left border-collapse" aria-label="Tabel daftar pendaftar program">
            <thead className="bg-black text-white uppercase text-sm">
              <tr>
                <th className="p-4 border-r border-white/20">Nama Talenta</th>
                <th className="p-4 border-r border-white/20">Info Disabilitas</th>
                <th className="p-4 border-r border-white/20">Program</th>
                <th className="p-4">Aksi Strategis</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black">
              {enrollments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center font-bold text-gray-500">Tidak ada pendaftar ditemukan.</td>
                </tr>
              ) : (
                enrollments.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-black text-lg">{item.profiles?.full_name}</div>
                      <div className="text-sm font-bold opacity-70 flex gap-2">
                        <span>{item.profiles?.gender === "Laki-laki" ? "(L)" : "(P)"}</span>
                        <span>•</span>
                        <span>{item.profiles?.city || "Lokasi N/A"}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-black text-white px-2 py-1 text-xs font-bold uppercase">
                        {item.profiles?.disability_type}
                      </span>
                    </td>
                    <td className="p-4 italic font-medium">
                      {item.trainings?.title}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {item.status === "applied" && (
                          <>
                            <button 
                              onClick={() => updateStatus(item.id, "accepted")}
                              className="bg-green-500 p-2 border-2 border-black hover:bg-green-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                              title="Terima Peserta"
                              aria-label={`Terima ${item.profiles?.full_name}`}
                            >
                              <CheckCircle size={20} color="white" />
                            </button>
                            <button 
                              onClick={() => updateStatus(item.id, "rejected")}
                              className="bg-red-500 p-2 border-2 border-black hover:bg-red-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                              title="Tolak Peserta"
                              aria-label={`Tolak ${item.profiles?.full_name}`}
                            >
                              <XCircle size={20} color="white" />
                            </button>
                          </>
                        )}
                        <a 
                          href={`mailto:${item.profiles?.email}`}
                          className="bg-white p-2 border-2 border-black hover:bg-gray-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                          aria-label={`Kirim email ke ${item.profiles?.full_name}`}
                        >
                          <Mail size={20} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* FOOTER INFO */}
      <div className="bg-black text-white p-4 flex items-start gap-3 border-b-8 border-red-600">
        <Info className="shrink-0" />
        <p className="text-xs font-bold uppercase leading-tight">
          Catatan: Gunakan fitur "Cetak Daftar Hadir" setelah Anda menyaring status pendaftar menjadi "Diterima" 
          pada program tertentu untuk keperluan administratif lapangan.
        </p>
      </div>
    </div>
  );
}
