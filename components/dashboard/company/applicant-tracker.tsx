"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Users, Search, Filter, FileDown, 
  ExternalLink, CheckCircle, XCircle, 
  Clock, Briefcase, Download, Mail, Phone
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ApplicantTracker({ company }: { company: any }) {
  const [loading, setLoading] = useState(true);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    fetchApplicants();
  }, [company.id]);

  async function fetchApplicants() {
    setLoading(true);
    const { data } = await supabase
      .from("applications")
      .select(`
        *,
        jobs ( title ),
        profiles ( 
          *,
          work_experiences (*),
          trainees (
            status,
            trainings (*)
          )
        )
      `)
      .eq("company_id", company.id)
      .order("created_at", { ascending: false });

    if (data) setApplicants(data);
    setLoading(false);
  }

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    const { error } = await supabase.from("applications").update({ status: newStatus }).eq("id", appId);
    if (!error) {
      setAnnouncement(`{"Status berhasil diubah menjadi "}${newStatus}`);
      fetchApplicants();
    }
  };

  // --- FUNGSI CETAK CV AKSESIBEL ---
  const generateProfessionalCV = async (app: any) => {
    const doc = new jsPDF();
    const p = app.profiles;
    const work = p.work_experiences || [];
    const trainings = p.trainees?.filter((t: any) => t.status === "completed") || [];

    // 1. KOP SURAT & LOGO PLACEHOLDER
    doc.setFillColor(15, 23, 42); // Slate 900
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text(`{"CURRICULUM VITAE - DISABILITAS.COM"}`, 20, 20);
    doc.setFontSize(10);
    doc.text(`{"Melamar Posisi: "}${app.jobs?.title} | {"Perusahaan: "}${company.name}`, 20, 30);

    // 2. BIODATA UTAMA (Heading 1)
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text(p.full_name.toUpperCase(), 20, 55);
    doc.setFontSize(10);
    doc.text(`${p.disability_type} | ${p.city} | ${p.email}`, 20, 62);

    // 3. EXECUTIVE SUMMARY
    doc.setFontSize(12);
    doc.text(`{"RINGKASAN PROFIL"}`, 20, 75);
    doc.setFontSize(9);
    const summary = p.summary || `{"Talenta profesional yang berkomitmen dan siap berkontribusi secara inklusif."}`;
    const splitSummary = doc.splitTextToSize(summary, 170);
    doc.text(splitSummary, 20, 82);

    // 4. RIWAYAT KERJA (Table)
    doc.setFontSize(12);
    doc.text(`{"PENGALAMAN KERJA"}`, 20, 110);
    autoTable(doc, {
      startY: 115,
      head: [[`{"Posisi"}`, `{"Instansi"}`, `{"Tahun"}`]],
      body: work.map((w: any) => [w.position, w.company_name, `${w.start_year} - ${w.is_current_work ? 'Sekarang' : w.end_year}`]),
      headStyles: { fillColor: [37, 99, 235] },
    });

    // 5. RIWAYAT PELATIHAN (Official & Verified)
    const finalY = (doc as any).lastAutoTable.finalY || 150;
    doc.setFontSize(12);
    doc.text(`{"PELATIHAN & SERTIFIKASI"}`, 20, finalY + 15);
    autoTable(doc, {
      startY: finalY + 20,
      head: [[`{"Nama Pelatihan"}`, `{"Penyelenggara"}`, `{"Status"}`]],
      body: trainings.map((t: any) => [t.trainings?.title, t.trainings?.organizer_name || 'Partner', `{"VERIFIED"}`]),
      headStyles: { fillColor: [5, 150, 105] },
    });

    // 6. INFORMASI KHUSUS (AKOMODASI & ALAT BANTU)
    const finalY2 = (doc as any).lastAutoTable.finalY || 200;
    doc.setFillColor(248, 250, 252); // Slate 50
    doc.rect(20, finalY2 + 10, 170, 35, "F");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.text(`{"Akomodasi yang diharapkan: "}${p.expected_accommodation || 'Sesuai standar'}`, 25, finalY2 + 20);
    doc.text(`{"Alat bantu yang digunakan: "}${p.assistive_tools || 'Tidak ada'}`, 25, finalY2 + 30);

    // 7. QR CODE & FOOTER
    const qrUrl = `https://disabilitas.com/talent/${p.id}`;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`{"Scan untuk melihat portofolio digital talenta ini"}`, 140, 280);
    // Note: Untuk QR Code di PDF via jsPDF butuh library tambahan atau image base64. 
    // Sementara kita beri teks URL yang bisa di-klik.
    doc.setTextColor(37, 99, 235);
    doc.text(qrUrl, 140, 285);

    doc.save(`{"CV_Audit_"}${p.full_name}.pdf`);
    setAnnouncement(`{"CV "}${p.full_name}{" berhasil diunduh."}`);
  };

  const filteredApplicants = applicants.filter(app => {
    const matchSearch = app.profiles?.full_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || app.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in">
      <div className="sr-only" aria-live="polite" role="status">{announcement}</div>

      <div className="flex flex-col md:flex-row justify-between gap-6">
        <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3">
          <Users className="text-blue-600" size={24} /> {"Applicant Tracker"}
        </h2>
        <div className="flex gap-4">
          <input 
            placeholder="Cari nama..." 
            className="input-std text-[10px] w-64"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select onChange={(e) => setFilterStatus(e.target.value)} className="input-std text-[10px]">
            <option value="all">{"Semua Status"}</option>
            <option value="pending">{"Pending"}</option>
            <option value="accepted">{"Accepted"}</option>
            <option value="rejected">{"Rejected"}</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredApplicants.map((app) => (
          <div key={app.id} className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 flex flex-col md:flex-row justify-between items-center group hover:border-slate-900 transition-all">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-2xl uppercase">
                {app.profiles?.full_name.charAt(0)}
              </div>
              <div>
                <h4 className="font-black text-slate-900 uppercase text-sm">{app.profiles?.full_name}</h4>
                <p className="text-[10px] font-bold text-blue-600 uppercase italic">{app.jobs?.title}</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase">{app.profiles?.disability_type} • {app.profiles?.city}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <button 
                onClick={() => generateProfessionalCV(app)}
                className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-xl transition-all"
                title="Cetak CV Audit"
              >
                <FileDown size={20} />
              </button>
              <button 
                onClick={() => handleUpdateStatus(app.id, 'accepted')}
                className="p-3 bg-emerald-50 text-emerald-400 hover:text-emerald-600 rounded-xl"
              >
                <CheckCircle size={20} />
              </button>
              <button 
                onClick={() => handleUpdateStatus(app.id, 'rejected')}
                className="p-3 bg-red-50 text-red-300 hover:text-red-600 rounded-xl"
              >
                <XCircle size={20} />
              </button>
              <a href={`/talent/${app.profiles?.id}`} target="_blank" className="p-3 text-slate-300 hover:text-slate-900">
                <ExternalLink size={20} />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
