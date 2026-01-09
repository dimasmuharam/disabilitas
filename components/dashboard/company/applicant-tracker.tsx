"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Users, Search, Filter, FileDown, 
  ExternalLink, CheckCircle, XCircle, 
  Clock, Briefcase, Download, Mail, Phone,
  BarChart3, PieChart, Activity
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
    // QUERY OPTIMIZED: Mengambil data pelamar berdasarkan company_id di tabel applications
    const { data, error } = await supabase
      .from("applications")
      .select(`
        *,
        jobs ( title ),
        profiles ( 
          *,
          work_experiences (*),
          certifications (*)
        )
      `)
      .eq("company_id", company.id)
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

  // --- LOGIKA KALKULASI STATISTIK (DIBUTUHKAN UNTUK RISET) ---
  const stats = {
    total: applicants.length,
    pending: applicants.filter(a => a.status === 'applied').length,
    accepted: applicants.filter(a => a.status === 'accepted').length,
    tuli: applicants.filter(a => a.profiles?.disability_type?.toLowerCase().includes('tuli')).length,
    daksa: applicants.filter(a => a.profiles?.disability_type?.toLowerCase().includes('daksa')).length,
    netra: applicants.filter(a => a.profiles?.disability_type?.toLowerCase().includes('netra')).length,
    mental: applicants.filter(a => a.profiles?.disability_type?.toLowerCase().includes('mental') || a.profiles?.disability_type?.toLowerCase().includes('intelektual')).length,
  };

  // --- FUNGSI CETAK CV AUDIT PROFESIONAL ---
  const generateProfessionalCV = async (app: any) => {
    const doc = new jsPDF();
    const p = app.profiles;
    const work = p.work_experiences || [];
    const certs = p.certifications || [];

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("CURRICULUM VITAE - DISABILITAS.COM", 20, 20);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Posisi: ${app.jobs?.title} | Perusahaan: ${company.name}`, 20, 30);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text((p.full_name || "NAMA TALENTA").toUpperCase(), 20, 55);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`${p.disability_type || 'Talenta'} | ${p.city || '-'} | ${p.email || '-'}`, 20, 62);

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("RINGKASAN PROFIL", 20, 75);
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    const summary = p.bio || "Talenta profesional yang berkomitmen dan siap berkontribusi secara inklusif.";
    const splitSummary = doc.splitTextToSize(summary, 170);
    doc.text(splitSummary, 20, 82);

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

    const finalY2 = (doc as any).lastAutoTable.finalY || 210;
    doc.setFillColor(248, 250, 252);
    doc.rect(20, finalY2 + 10, 170, 35, "F");
    doc.setFontSize(10);
    doc.setTextColor(15, 23, 42);
    doc.setFont("helvetica", "bold");
    
    const accs = Array.isArray(p.preferred_accommodations) && p.preferred_accommodations.length > 0 
      ? p.preferred_accommodations.join(", ") 
      : "Sesuai standar umum";
    const tools = Array.isArray(p.used_assistive_tools) && p.used_assistive_tools.length > 0 
      ? p.used_assistive_tools.join(", ") 
      : "Tidak menggunakan alat bantu khusus";

    doc.text(`Akomodasi yang diharapkan: ${accs}`, 25, finalY2 + 20);
    doc.text(`Alat bantu yang digunakan: ${tools}`, 25, finalY2 + 30);

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Profil digital lengkap dapat diakses pada tautan berikut:", 20, 280);
    doc.setTextColor(37, 99, 235);
    doc.text(`https://disabilitas.com/talent/${p.id}`, 20, 285);

    doc.save(`CV_Audit_${p.full_name}.pdf`);
  };

  const filteredApplicants = applicants.filter(app => {
    const matchSearch = app.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || app.status === filterStatus;
    return matchSearch && matchStatus;
  });

  if (loading) return <div className="p-20 text-center font-black italic text-slate-400 animate-pulse uppercase tracking-widest">Sinkronisasi Data Riset...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in text-left pb-20">
      <div className="sr-only" aria-live="polite" role="status">{announcement}</div>

      {/* --- SECTION 1: STATISTIK RINGKAS --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-xl flex flex-col justify-center">
          <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1 flex items-center gap-2 italic">
            <Activity size={12} className="text-blue-400" /> Total Pelamar
          </p>
          <p className="text-4xl font-black italic tracking-tighter leading-none">{stats.total}</p>
        </div>
        
        <div className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 flex flex-col justify-center shadow-sm">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-2 italic">
            <Clock size={12} className="text-orange-400" /> Pending Review
          </p>
          <p className="text-4xl font-black italic tracking-tighter leading-none text-orange-500">{stats.pending}</p>
        </div>

        <div className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 flex flex-col justify-center shadow-sm">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 flex items-center gap-2 italic">
            <CheckCircle size={12} className="text-emerald-400" /> Talenta Diterima
          </p>
          <p className="text-4xl font-black italic tracking-tighter leading-none text-emerald-500">{stats.accepted}</p>
        </div>

        <div className="bg-blue-50 p-6 rounded-[2.5rem] border-2 border-blue-100 flex flex-col justify-center">
          <p className="text-[9px] font-black uppercase tracking-widest text-blue-600 mb-1 flex items-center gap-2 italic">
            <PieChart size={12} /> Ragam Dominan
          </p>
          <p className="text-[10px] font-black italic uppercase leading-tight text-blue-900 mt-1">
            {stats.tuli >= stats.daksa && stats.tuli >= stats.netra ? "Talenta Tuli" : 
             stats.daksa >= stats.tuli && stats.daksa >= stats.netra ? "Talenta Daksa" : "Talenta Netra"}
          </p>
        </div>
      </div>

      {/* --- SECTION 2: HEADER & FILTER --- */}
      <div className="flex flex-col md:flex-row justify-between gap-6 items-center pt-4">
        <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3 text-slate-900">
          <Users className="text-blue-600" size={24} /> Applicant Tracker
        </h2>
        <div className="flex gap-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={16} />
            <input 
              placeholder="Cari nama talenta..." 
              className="pl-11 pr-6 py-3 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-blue-600 w-64 shadow-sm bg-white"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            onChange={(e) => setFilterStatus(e.target.value)} 
            className="px-6 py-3 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-blue-600 shadow-sm cursor-pointer bg-white"
          >
            <option value="all">Semua Status</option>
            <option value="applied">Baru Masuk</option>
            <option value="accepted">Diterima</option>
            <option value="rejected">Ditolak</option>
          </select>
        </div>
      </div>

      {/* --- SECTION 3: DAFTAR PELAMAR --- */}
      <div className="grid gap-4">
        {filteredApplicants.length > 0 ? filteredApplicants.map((app) => (
          <div key={app.id} className="bg-white p-6 rounded-[3rem] border-2 border-slate-100 flex flex-col md:flex-row justify-between items-center group hover:border-slate-900 transition-all shadow-sm">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-slate-900 text-white rounded-[1.8rem] flex items-center justify-center font-black text-3xl uppercase italic shadow-lg group-hover:scale-105 transition-transform duration-300">
                {app.profiles?.full_name?.charAt(0) || "?"}
              </div>
              <div>
                <h4 className="font-black text-slate-900 uppercase text-base italic leading-tight">{app.profiles?.full_name}</h4>
                <p className="text-[11px] font-black text-blue-600 uppercase italic mb-1">{app.jobs?.title}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                   <span className="px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-black uppercase italic text-slate-500">{app.profiles?.disability_type}</span>
                   <span className="px-3 py-1 bg-slate-100 rounded-lg text-[9px] font-black uppercase italic text-slate-500">{app.profiles?.city}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6 md:mt-0">
              <button 
                onClick={() => generateProfessionalCV(app)}
                className="p-4 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all shadow-sm border border-transparent hover:border-blue-100 group/btn"
                title="Cetak CV Audit"
              >
                <FileDown size={22} className="group-hover/btn:scale-110 transition-transform" />
              </button>
              <button 
                onClick={() => handleUpdateStatus(app.id, 'accepted')}
                className="p-4 bg-emerald-50 text-emerald-400 hover:text-white hover:bg-emerald-500 rounded-2xl transition-all shadow-sm border border-transparent hover:border-emerald-100 group/btn"
                title="Terima Pelamar"
              >
                <CheckCircle size={22} className="group-hover/btn:scale-110 transition-transform" />
              </button>
              <button 
                onClick={() => handleUpdateStatus(app.id, 'rejected')}
                className="p-4 bg-red-50 text-red-300 hover:text-white hover:bg-red-500 rounded-2xl transition-all shadow-sm border border-transparent hover:border-red-100 group/btn"
                title="Tolak Pelamar"
              >
                <XCircle size={22} className="group-hover/btn:scale-110 transition-transform" />
              </button>
              <a 
                href={`/talent/${app.profiles?.id}`} 
                target="_blank" 
                className="p-4 text-slate-200 hover:text-slate-900 transition-all"
                title="Lihat Profil Publik"
              >
                <ExternalLink size={22} />
              </a>
            </div>
          </div>
        )) : (
          <div className="p-24 text-center border-2 border-dashed border-slate-100 rounded-[4rem] bg-slate-50/20">
            <Users className="mx-auto text-slate-200 mb-4" size={48} />
            <p className="text-[11px] font-black uppercase text-slate-300 italic tracking-[0.3em]">Belum Ada Lamaran Yang Perlu Dimonitor</p>
          </div>
        )}
      </div>
    </div>
  );
}
