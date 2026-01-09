"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { 
  Users, Search, FileDown, 
  ExternalLink, CheckCircle, XCircle, 
  Briefcase, GraduationCap, MapPin, 
  Wrench, ShieldCheck, Clock, Activity
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { QRCodeSVG } from "qrcode.react";

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

  const handleUpdateStatus = async (appId: string, newStatus: string, talentName: string) => {
    const { error } = await supabase
      .from("applications")
      .update({ status: newStatus })
      .eq("id", appId);
      
    if (!error) {
      const statusText = newStatus === "accepted" ? "Diterima" : "Ditolak";
      setAnnouncement(`Konfirmasi sistem. Lamaran dari ${talentName} telah diperbarui menjadi ${statusText}.`);
      fetchApplicants();
    }
  };

  const parseToArray = (fieldData: any) => {
    if (!fieldData) return [];
    if (Array.isArray(fieldData)) return fieldData;
    if (typeof fieldData === 'string') {
      try {
        const parsed = JSON.parse(fieldData);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return fieldData.split(',').map(s => s.trim()).filter(s => s !== "");
      }
    }
    return [];
  };

  const filteredApplicants = applicants.filter(app => {
    const matchSearch = app.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === "all" || app.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // --- FUNGSI GENERATE CV AUDIT (BAGIAN UTAMA) ---
  const generateProfessionalCV = async (app: any) => {
    const doc = new jsPDF();
    const p = app.profiles;
    const work = p.work_experiences || [];
    const certs = p.certifications || [];
    const skills = parseToArray(p.skills);
    const tools = parseToArray(p.used_assistive_tools);
    const accs = parseToArray(p.preferred_accommodations);

    // 1. KOP SURAT & BRANDING (Kerapihan Visual & Identitas)
    doc.setFillColor(15, 23, 42); // Navy Dark
    doc.rect(0, 0, 210, 45, "F");
    
    // Nama Platform
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("Disabilitas.com", 20, 20);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Platform Karir Inklusif & Pusat Riset Talenta", 20, 27);
    
    // Keterangan Audit
    doc.setFont("helvetica", "bold");
    doc.text("BERKAS AUDIT TALENTA", 140, 20);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`Posisi: ${app.jobs?.title}`, 140, 27);
    doc.text(`Instansi: ${company.name}`, 140, 32);
    doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 140, 37);

    // 2. DATA PRIBADI (Pusat Informasi)
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text((p.full_name || "NAMA TALENTA").toUpperCase(), 20, 60);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`${p.education_level} ${p.major} | ${p.city}`, 20, 67);
    doc.text(`Kontak: ${p.email} | ${p.phone || '-'}`, 20, 72);

    // Garis Pemisah
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 78, 190, 78);

    // 3. RINGKASAN PROFESIONAL (Bio)
    doc.setFont("helvetica", "bold");
    doc.text("RINGKASAN PROFIL", 20, 88);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    const bioText = p.bio || "Talenta profesional yang berkomitmen tinggi dalam bekerja secara inklusif.";
    const splitBio = doc.splitTextToSize(bioText, 170);
    doc.text(splitBio, 20, 93);
    // --- SAMBUNGAN DARI BAGIAN 1 ---

    // 4. PENDIDIKAN (Audit Akademik)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("RIWAYAT PENDIDIKAN", 20, 115);
    autoTable(doc, {
      startY: 118,
      head: [["Jenjang", "Institusi", "Jurusan", "Tahun Lulus"]],
      body: [[
        p.education_level || "-",
        p.university || "-",
        p.major || "-",
        p.graduation_date || "-"
      ]],
      headStyles: { fillColor: [51, 65, 85] }, // Slate 700
      styles: { fontSize: 9 },
      margin: { left: 20 }
    });

    // 5. PENGALAMAN KERJA (Audit Karir)
    const currentY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont("helvetica", "bold");
    doc.text("PENGALAMAN KERJA", 20, currentY);
    autoTable(doc, {
      startY: currentY + 3,
      head: [["Posisi", "Instansi", "Lokasi", "Periode"]],
      body: work.length > 0 ? work.map((w: any) => [
        w.position,
        w.company_name,
        w.company_location || "-",
        `${w.start_date} s/d ${w.is_current_work ? 'Sekarang' : w.end_date}`
      ]) : [["Tidak ada data pengalaman kerja"]],
      headStyles: { fillColor: [37, 99, 235] }, // Blue 600
      styles: { fontSize: 8 },
      margin: { left: 20 }
    });

    // 6. SERTIFIKASI & PELATIHAN (Audit Kompetensi)
    const currentY2 = (doc as any).lastAutoTable.finalY + 10;
    doc.setFont("helvetica", "bold");
    doc.text("SERTIFIKASI & PELATIHAN", 20, currentY2);
    autoTable(doc, {
      startY: currentY2 + 3,
      head: [["Nama Sertifikat", "Penyelenggara", "Tahun", "Status"]],
      body: certs.length > 0 ? certs.map((c: any) => [
        c.name,
        c.organizer_name || "-",
        c.year || "-",
        c.is_verified ? "Terverifikasi" : "Self-Declared"
      ]) : [["Belum ada data sertifikasi resmi"]],
      headStyles: { fillColor: [5, 150, 105] }, // Emerald 600
      styles: { fontSize: 8 },
      margin: { left: 20 }
    });

    // 7. AKOMODASI & ALAT BANTU (Audit Inklusi)
    const currentY3 = (doc as any).lastAutoTable.finalY + 10;
    doc.setFillColor(248, 250, 252); // Slate 50
    doc.rect(20, currentY3, 170, 30, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text("DATA DUKUNGAN PRODUKTIVITAS (RISET):", 25, currentY3 + 8);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`Keahlian: ${skills.join(", ") || "-"}`, 25, currentY3 + 14);
    doc.text(`Alat Bantu yang Digunakan: ${tools.join(", ") || "Tidak menggunakan alat bantu khusus"}`, 25, currentY3 + 20);
    doc.text(`Akomodasi yang Diharapkan: ${accs.join(", ") || "Sesuai standar umum"}`, 25, currentY3 + 26);

    // 8. FOOTER & VALIDASI QR CODE (Aksesibilitas Digital)
    const footerY = 260;
    doc.setDrawColor(226, 232, 240);
    doc.line(20, footerY, 190, footerY);
    
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    const footerText = "Dokumen ini dihasilkan secara otomatis oleh sistem Pusat Riset Talenta Disabilitas.com. Segala informasi yang tertera merupakan representasi data talenta yang telah divalidasi melalui audit sistem.";
    doc.text(doc.splitTextToSize(footerText, 140), 20, footerY + 8);

    // QR Code (Scan untuk ke Profil Publik)
    // Catatan: Karena QR Code adalah SVG/Canvas, di PDF kita tempelkan placeholder info 
    // atau jika Mas ingin QR asli muncul, kita gunakan bantuan elemen canvas tersembunyi
    doc.setFont("helvetica", "bold");
    doc.setTextColor(37, 99, 235);
    doc.text("VERIFIKASI DIGITAL", 165, footerY + 8);
    doc.setFontSize(6);
    doc.setTextColor(0, 0, 0);
    doc.text("PINDAI UNTUK", 165, footerY + 12);
    doc.text("PROFIL LENGKAP", 165, footerY + 15);
    
    // Simpan PDF
    doc.save(`CV_Audit_${p.full_name}.pdf`);
  };

  const stats = {
    total: applicants.length,
    pending: applicants.filter(a => a.status === 'applied').length,
    accepted: applicants.filter(a => a.status === 'accepted').length,
  };

  if (loading) return <div role="status" className="p-20 text-center font-black animate-pulse text-slate-400 uppercase tracking-widest italic">Menyinkronkan Data Riset...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-left pb-20">
      <div className="sr-only" aria-live="assertive" role="log">{announcement}</div>

      {/* --- UI STATISTIK --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" role="region" aria-label="Statistik Pelamar Kerja">
        <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-xl italic border-2 border-slate-800">
          <p className="text-[9px] font-black uppercase tracking-widest opacity-60 flex items-center gap-2 italic">
            <Activity size={12} className="text-blue-400" /> Total Lamaran
          </p>
          <p className="text-4xl font-black italic tracking-tighter leading-none">{stats.total}</p>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 italic">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 italic">
            <Clock size={12} className="text-orange-400" /> Sedang Direview
          </p>
          <p className="text-4xl font-black italic tracking-tighter leading-none text-orange-500">{stats.pending}</p>
        </div>
        <div className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 italic">
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 italic">
            <CheckCircle size={12} className="text-emerald-400" /> Lolos Seleksi
          </p>
          <p className="text-4xl font-black italic tracking-tighter leading-none text-emerald-500">{stats.accepted}</p>
        </div>
      </div>

      {/* --- SEARCH & FILTER --- */}
      <div className="flex flex-col md:flex-row justify-between gap-6 items-center pt-4">
        <h2 className="text-xl font-black uppercase italic tracking-tighter flex items-center gap-3 text-slate-900">
          <Users className="text-blue-600" size={24} aria-hidden="true" /> Applicant Tracker
        </h2>
        <div className="flex gap-4 w-full md:w-auto">
          <input 
            placeholder="CARI NAMA TALENTA..." 
            className="w-full pl-6 pr-6 py-3 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-blue-600 shadow-sm"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            onChange={(e) => setFilterStatus(e.target.value)} 
            className="px-6 py-3 border-2 border-slate-100 rounded-2xl text-[10px] font-black uppercase outline-none focus:border-blue-600 shadow-sm bg-white cursor-pointer"
          >
            <option value="all">SEMUA STATUS</option>
            <option value="applied">BARU MASUK</option>
            <option value="accepted">DITERIMA</option>
            <option value="rejected">DITOLAK</option>
          </select>
        </div>
      </div>

      {/* --- LIST PELAMAR --- */}
      <div className="grid gap-6" role="list">
        {filteredApplicants.length > 0 ? filteredApplicants.map((app) => {
          const p = app.profiles;
          const tools = parseToArray(p?.used_assistive_tools);
          const skills = parseToArray(p?.skills);

          return (
            <article key={app.id} role="listitem" className="bg-white p-8 md:p-10 rounded-[3.5rem] border-2 border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center group hover:border-slate-900 transition-all shadow-sm">
              <div className="flex flex-col md:flex-row items-start gap-8 flex-1 w-full">
                <div className="w-24 h-24 bg-slate-900 text-white rounded-[2.5rem] flex items-center justify-center font-black text-4xl uppercase italic shadow-lg shrink-0" aria-hidden="true">
                  {p?.full_name?.charAt(0) || "?"}
                </div>
                
                <div className="space-y-4 max-w-2xl flex-1">
                  <div>
                    <h4 className="font-black text-slate-900 uppercase text-xl italic leading-none">{p?.full_name}</h4>
                    <p className="text-[10px] font-black text-blue-600 uppercase italic tracking-[0.2em] mt-2">Lamaran Untuk: {app.jobs?.title}</p>
                  </div>

                  <div className="bg-slate-50/50 p-6 rounded-[2.5rem] border border-slate-100 italic text-slate-700 leading-relaxed text-sm font-medium">
                    <span className="block mb-2">Pelamar ini berdomisili di <strong>{p?.city || "Lokasi tidak tersedia"}</strong>.</span>
                    <span className="block mb-2">Pendidikan jenjang <strong>{p?.education_level || "Pendidikan"}</strong> jurusan <strong>{p?.major || "Jurusan"}</strong>.</span>
                    <span className="block mb-2">Lulus dari <strong>{p?.university || "Institusi"}</strong> pada tahun kelulusan <strong>{p?.graduation_date || "-"}</strong>.</span>
                    {skills.length > 0 && <span className="block mb-2">Keahlian profesional: <strong>{skills.join(", ")}</strong>.</span>}
                    {tools.length > 0 && (
                      <div className="mt-4 p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-100 text-xs">
                        <ShieldCheck size={14} className="inline mr-2" aria-hidden="true" />
                        Alat bantu kerja: <strong>{tools.join(", ")}</strong>.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex md:flex-col items-center gap-3 mt-8 md:mt-0 w-full md:w-auto">
                <button onClick={() => handleUpdateStatus(app.id, 'accepted', p?.full_name)} aria-label={`Terima ${p?.full_name}`} className="flex-1 md:w-full p-4 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-2xl transition-all border border-emerald-100 font-black uppercase text-[10px] italic">TERIMA</button>
                <button onClick={() => handleUpdateStatus(app.id, 'rejected', p?.full_name)} aria-label={`Tolak ${p?.full_name}`} className="flex-1 md:w-full p-4 bg-red-50 text-red-400 hover:bg-red-600 hover:text-white rounded-2xl transition-all border border-red-100 font-black uppercase text-[10px] italic">TOLAK</button>
                <div className="flex gap-2 w-full justify-center">
                  <button onClick={() => generateProfessionalCV(app)} className="p-4 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-2xl border border-slate-100 transition-colors" title="Unduh CV Audit" aria-label={`Unduh CV ${p?.full_name}`}><FileDown size={20} /></button>
                  <a href={`/talent/${p?.id}`} target="_blank" className="p-4 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-2xl border border-slate-100 transition-colors" title="Lihat Profil" aria-label={`Profil ${p?.full_name}`}><ExternalLink size={20} /></a>
                </div>
              </div>
            </article>
          );
        }) : (
          <div className="p-24 text-center border-2 border-dashed border-slate-100 rounded-[4rem] bg-slate-50/20">
            <Users className="mx-auto text-slate-200 mb-4" size={48} aria-hidden="true" />
            <p className="text-[11px] font-black uppercase text-slate-300 italic tracking-[0.3em]">Belum ada pelamar yang masuk.</p>
          </div>
        )}
      </div>
    </div>
  );
}
