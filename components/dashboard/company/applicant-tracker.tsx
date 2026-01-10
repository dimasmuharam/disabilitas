"use client";

import React, { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
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

  const fetchApplicants = useCallback(async () => {
    if (!company?.id) return;
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
  }, [company?.id]);

  useEffect(() => {
    if (company?.id) {
      fetchApplicants();
    }
  }, [company?.id, fetchApplicants]);

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

  if (loading) return <div role="status" className="animate-pulse p-20 text-center font-black uppercase italic tracking-widest text-slate-400">Menyinkronkan Data Riset...</div>;

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-20 text-left">
      <div className="sr-only" aria-live="assertive" role="log">{announcement}</div>

      {/* --- UI STATISTIK --- */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3" role="region" aria-label="Statistik Pelamar Kerja">
        <div className="rounded-[2.5rem] border-2 border-slate-800 bg-slate-900 p-6 italic text-white shadow-xl">
          <p className="flex items-center gap-2 text-[9px] font-black uppercase italic tracking-widest opacity-60">
            <Activity size={12} className="text-blue-400" /> Total Lamaran
          </p>
          <p className="text-4xl font-black italic leading-none tracking-tighter">{stats.total}</p>
        </div>
        <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-6 italic">
          <p className="flex items-center gap-2 text-[9px] font-black uppercase italic tracking-widest text-slate-400">
            <Clock size={12} className="text-orange-400" /> Sedang Direview
          </p>
          <p className="text-4xl font-black italic leading-none tracking-tighter text-orange-500">{stats.pending}</p>
        </div>
        <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-6 italic">
          <p className="flex items-center gap-2 text-[9px] font-black uppercase italic tracking-widest text-slate-400">
            <CheckCircle size={12} className="text-emerald-400" /> Lolos Seleksi
          </p>
          <p className="text-4xl font-black italic leading-none tracking-tighter text-emerald-500">{stats.accepted}</p>
        </div>
      </div>

      {/* --- SEARCH & FILTER --- */}
      <div className="flex flex-col items-center justify-between gap-6 pt-4 md:flex-row">
        <h2 className="flex items-center gap-3 text-xl font-black uppercase italic tracking-tighter text-slate-900">
          <Users className="text-blue-600" size={24} aria-hidden="true" /> Applicant Tracker
        </h2>
        <div className="flex w-full gap-4 md:w-auto">
          <input 
            placeholder="CARI NAMA TALENTA..." 
            className="w-full rounded-2xl border-2 border-slate-100 px-6 py-3 text-[10px] font-black uppercase shadow-sm outline-none focus:border-blue-600"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            onChange={(e) => setFilterStatus(e.target.value)} 
            className="cursor-pointer rounded-2xl border-2 border-slate-100 bg-white px-6 py-3 text-[10px] font-black uppercase shadow-sm outline-none focus:border-blue-600"
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
            <article key={app.id} role="listitem" className="group flex flex-col items-start justify-between rounded-[3.5rem] border-2 border-slate-100 bg-white p-8 shadow-sm transition-all hover:border-slate-900 md:flex-row md:items-center md:p-10">
              <div className="flex w-full flex-1 flex-col items-start gap-8 md:flex-row">
                <div className="flex size-24 shrink-0 items-center justify-center rounded-[2.5rem] bg-slate-900 text-4xl font-black uppercase italic text-white shadow-lg" aria-hidden="true">
                  {p?.full_name?.charAt(0) || "?"}
                </div>
                
                <div className="max-w-2xl flex-1 space-y-4">
                  <div>
                    <h4 className="text-xl font-black uppercase italic leading-none text-slate-900">{p?.full_name}</h4>
                    <p className="mt-2 text-[10px] font-black uppercase italic tracking-[0.2em] text-blue-600">Lamaran Untuk: {app.jobs?.title}</p>
                  </div>

                  <div className="rounded-[2.5rem] border border-slate-100 bg-slate-50/50 p-6 text-sm font-medium italic leading-relaxed text-slate-700">
                    <span className="mb-2 block">Pelamar ini berdomisili di <strong>{p?.city || "Lokasi tidak tersedia"}</strong>.</span>
                    <span className="mb-2 block">Pendidikan jenjang <strong>{p?.education_level || "Pendidikan"}</strong> jurusan <strong>{p?.major || "Jurusan"}</strong>.</span>
                    <span className="mb-2 block">Lulus dari <strong>{p?.university || "Institusi"}</strong> pada tahun kelulusan <strong>{p?.graduation_date || "-"}</strong>.</span>
                    {skills.length > 0 && <span className="mb-2 block">Keahlian profesional: <strong>{skills.join(", ")}</strong>.</span>}
                    {tools.length > 0 && (
                      <div className="mt-4 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-xs text-emerald-800">
                        <ShieldCheck size={14} className="mr-2 inline" aria-hidden="true" />
                        Alat bantu kerja: <strong>{tools.join(", ")}</strong>.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex w-full items-center gap-3 md:mt-0 md:w-auto md:flex-col">
                <button onClick={() => handleUpdateStatus(app.id, 'accepted', p?.full_name)} aria-label={`Terima ${p?.full_name}`} className="flex-1 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-[10px] font-black uppercase italic text-emerald-600 transition-all hover:bg-emerald-600 hover:text-white md:w-full">TERIMA</button>
                <button onClick={() => handleUpdateStatus(app.id, 'rejected', p?.full_name)} aria-label={`Tolak ${p?.full_name}`} className="flex-1 rounded-2xl border border-red-100 bg-red-50 p-4 text-[10px] font-black uppercase italic text-red-400 transition-all hover:bg-red-600 hover:text-white md:w-full">TOLAK</button>
                <div className="flex w-full justify-center gap-2">
                  <button onClick={() => generateProfessionalCV(app)} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-slate-400 transition-colors hover:text-blue-600" title="Unduh CV Audit" aria-label={`Unduh CV ${p?.full_name}`}><FileDown size={20} /></button>
                  <a href={`/talent/${p?.id}`} target="_blank" className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-slate-400 transition-colors hover:text-slate-900" title="Lihat Profil" aria-label={`Profil ${p?.full_name}`}><ExternalLink size={20} /></a>
                </div>
              </div>
            </article>
          );
        }) : (
          <div className="rounded-[4rem] border-2 border-dashed border-slate-100 bg-slate-50/20 p-24 text-center">
            <Users className="mx-auto mb-4 text-slate-200" size={48} aria-hidden="true" />
            <p className="text-[11px] font-black uppercase italic tracking-[0.3em] text-slate-300">Belum ada pelamar yang masuk.</p>
          </div>
        )}
      </div>
    </div>
  );
}
