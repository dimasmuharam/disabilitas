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
    if (company?.id) {
      fetchApplicants();
    }
  }, [company?.id]);

  async function fetchApplicants() {
    setLoading(true);
    // SINKRONISASI QUERY: Mengambil data melalui relasi jobs.company_id
    const { data, error } = await supabase
      .from("applications")
      .select(`
        *,
        jobs!inner ( 
          title,
          company_id
        ),
        profiles ( 
          *,
          work_experiences (*),
          certifications (*)
        )
      `)
      .eq("jobs.company_id", company.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch Applicants Error:", error);
    } else {
      setApplicants(data || []);
    }
    setLoading(false);
  }

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    const { error } = await supabase
      .from("applications")
      .update({ status: newStatus })
      .eq("id", appId);
      
    if (!error) {
      setAnnouncement(`Status berhasil diubah menjadi ${newStatus}`);
      fetchApplicants();
    }
  };

  const generateProfessionalCV = async (app: any) => {
    const doc = new jsPDF();
    const p = app.profiles;
    const work = p.work_experiences || [];
    const certs = p.certifications || [];

    // 1. HEADER CV
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("CURRICULUM VITAE - DISABILITAS.COM", 20, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Posisi: ${app.jobs?.title} | Perusahaan: ${company.name}`, 20, 30);

    // 2. BIODATA UTAMA
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text((p.full_name || "NAMA TALENTA").toUpperCase(), 20, 55);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`${p.disability_type || 'Talenta'} | ${p.city || '-'} | ${p.email || '-'}`, 20, 62);

    // 3. RINGKASAN PROFIL (Sesuai kolom 'bio')
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("RINGKASAN PROFIL", 20, 75);
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    const summary = p.bio || "Talenta profesional yang berkomitmen dan siap berkontribusi secara inklusif.";
    const splitSummary = doc.splitTextToSize(summary, 170);
    doc.text(splitSummary, 20, 82);

    // 4. RIWAYAT KERJA
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("PENGALAMAN KERJA", 20, 110);
    autoTable(doc, {
      startY: 115,
      head: [["Posisi", "Instansi", "Lokasi", "Periode"]],
      body: work.map((w: any) => [
        w.position, 
        w.company_name, 
        w.company_location || "-",
        `${w.start_date} - ${w.is_current_work ? 'Sekarang' : w.end_date}`
      ]),
      headStyles: { fillColor: [37, 99, 235] },
      theme: 'grid'
    });

    // 5. SERTIFIKASI (Sesuai kolom 'certifications')
    const finalY = (doc as any).lastAutoTable.finalY || 150;
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("SERTIFIKASI & PELATIHAN", 20, finalY + 15);
    autoTable(doc, {
      startY: finalY + 20,
      head: [["Nama Sertifikasi", "Penyelenggara", "Tahun"]],
      body: certs.map((c: any) => [c.name, c.organizer_name, c.year]),
      headStyles: { fillColor: [5, 150, 105] },
      theme: 'grid'
    });

    // 6. INFORMASI AKSESIBILITAS (Sesuai Skema Database Mas)
    const finalY2 = (doc as any).lastAutoTable.finalY || 210;
    doc.setFillColor(248, 250, 252);
    doc.rect(20, finalY2 + 10, 170, 35, "F");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    
    // Convert Array to String untuk PDF
    const accs = Array.isArray(p.preferred_accommodations) ? p.preferred_accommodations.join(", ") : "Sesuai standar";
    const tools = Array.isArray(p.used_assistive_tools) ? p.used_assistive_tools.join(", ") : "Tidak ada";

    doc.text(`Akomodasi yang diharapkan: ${accs}`, 25, finalY2 + 20);
    doc.text(`Alat bantu yang digunakan: ${tools}`, 25, finalY2 + 30);

    // 7. FOOTER & LINK
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Profil digital talenta ini dapat diakses pada tautan berikut:", 20, 280);
    doc.setTextColor(37, 99, 235);
    doc.text(`https://disabilitas.com/talent/${p.id}`, 20, 285);

    doc.save(`CV_Audit_${p.full_name}.pdf`);
  };

  const filteredApplicants = applicants.filter(app => {
    const matchSearch = app.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || app.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) return <div className="p-20 text-center font-black italic text-slate-400 animate-pulse uppercase tracking-widest">Memuat Data Pelamar...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in text-left">
      <div className="sr-only" aria-live="polite" role="status">{announcement}</div>

      <div className="flex flex-col md:flex-row justify-between gap-6 items-center">
        <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3">
          <Users className="text-blue-600" size={24} /> Applicant Tracker
        </h2>
        <div className="flex gap-4">
          <input 
            placeholder="Cari nama..." 
            className="px-4 py-2 border-2 border-slate-100 rounded-xl text-[10px] font-bold uppercase outline-none focus:border-blue-600 w-64"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            onChange={(e) => setFilterStatus(e.target.value)} 
            className="px-4 py-2 border-2 border-slate-100 rounded-xl text-[10px] font-bold uppercase outline-none focus:border-blue-600"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredApplicants.length > 0 ? filteredApplicants.map((app) => (
          <div key={app.id} className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 flex flex-col md:flex-row justify-between items-center group hover:border-slate-900 transition-all shadow-sm">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black text-2xl uppercase italic">
                {app.profiles?.full_name?.charAt(0) || "?"}
              </div>
              <div>
                <h4 className="font-black text-slate-900 uppercase text-sm italic">{app.profiles?.full_name}</h4>
                <p className="text-[10px] font-bold text-blue-600 uppercase italic leading-none mb-1">{app.jobs?.title}</p>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                  {app.profiles?.disability_type} • {app.profiles?.city}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <button 
                onClick={() => generateProfessionalCV(app)}
                className="p-3 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all shadow-sm"
                title="Cetak CV Audit"
              >
                <FileDown size={20} />
              </button>
              <button 
                onClick={() => handleUpdateStatus(app.id, 'accepted')}
                className="p-3 bg-emerald-50 text-emerald-400 hover:text-white hover:bg-emerald-500 rounded-xl transition-all shadow-sm"
                title="Terima Pelamar"
              >
                <CheckCircle size={20} />
              </button>
              <button 
                onClick={() => handleUpdateStatus(app.id, 'rejected')}
                className="p-3 bg-red-50 text-red-300 hover:text-white hover:bg-red-500 rounded-xl transition-all shadow-sm"
                title="Tolak Pelamar"
              >
                <XCircle size={20} />
              </button>
              <a 
                href={`/talent/${app.profiles?.id}`} 
                target="_blank" 
                className="p-3 text-slate-300 hover:text-slate-900 transition-all"
                title="Lihat Profil Publik"
              >
                <ExternalLink size={20} />
              </a>
            </div>
          </div>
        )) : (
          <div className="p-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem]">
            <p className="text-[10px] font-black uppercase text-slate-300 italic tracking-[0.2em]">Belum Ada Pelamar Yang Masuk</p>
          </div>
        )}
      </div>
    </div>
  );
}
