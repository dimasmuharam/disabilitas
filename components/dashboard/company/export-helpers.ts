import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * EXPORT EXCEL (CSV) UNTUK HRD
 * Sinkronisasi dengan tabel: profiles, jobs, applications
 */
export const exportApplicantsToExcel = (applicants: any[], companyName: string) => {
  // Header yang selaras dengan kolom riset di database
  const headers = [
    "Nama Lengkap",
    "Posisi Dilamar",
    "Status Terakhir",
    "Email",
    "Telepon",
    "Jenjang Pendidikan",
    "Institusi/Universitas",
    "Jurusan",
    "Tahun Lulus",
    "Kota Domisili",
    "Keahlian Utama",
    "Alat Bantu Kerja",
    "Ekspektasi Gaji",
    "Catatan HRD (Notes)"
  ].join(",");

  const rows = applicants.map(app => {
    const p = app.profiles;
    
    // Helper sanitasi karakter agar tidak merusak kolom Excel
    const clean = (val: any) => {
      const stringVal = val ? String(val) : "";
      return `"${stringVal.replace(/"/g, '""')}"`;
    };
    
    // Sinkronisasi array dari PostgreSQL (profiles.skills & profiles.used_assistive_tools)
    const formatArray = (arr: any) => {
      if (!arr) return "";
      if (Array.isArray(arr)) return arr.join("; ");
      return String(arr);
    };

    return [
      clean(p?.full_name),
      clean(app.jobs?.title),
      clean(app.status),
      clean(p?.email),
      clean(p?.phone),
      clean(p?.education_level),
      clean(p?.university),
      clean(p?.major),
      clean(p?.graduation_date),
      clean(p?.city),
      clean(formatArray(p?.skills)),
      clean(formatArray(p?.used_assistive_tools)),
      clean(p?.expected_salary), // Ditambahkan sesuai kolom di tabel profiles
      clean(app.hrd_notes)
    ].join(",");
  }).join("\n");

  const blob = new Blob([headers + "\n" + rows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Laporan_Pelamar_${companyName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * GENERATE PROFESSIONAL CV AUDIT
 * Desain bersih, profesional, dan fokus pada kompetensi talenta
 */
export const generateProfessionalCV = (app: any, company: any) => {
  const doc = new jsPDF();
  const p = app.profiles;
  
  // 1. Header (Navy Dark - Branding Disabilitas.com)
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 45, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Disabilitas.com", 20, 20);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Platform Karir Inklusif & Pusat Riset Talenta", 20, 27);

  // 2. Metadata Dokumen (ID Audit untuk Admin)
  doc.setFontSize(8);
  doc.text(`AUDIT-ID: ${app.id.substring(0, 8).toUpperCase()}`, 155, 20);
  doc.text(`Status: ${app.status.toUpperCase()}`, 155, 25);
  doc.text(`Tgl Cetak: ${new Date().toLocaleDateString('id-ID')}`, 155, 30);

  // 3. Nama Talenta
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text((p.full_name || "NAMA TALENTA").toUpperCase(), 20, 60);

  // 4. Tabel Audit Detail (Sinkron dengan Skema Profiles & Jobs)
  autoTable(doc, {
    startY: 70,
    head: [["Kategori Audit", "Detail Konfirmasi Sistem"]],
    body: [
      ["Posisi Dilamar", app.jobs?.title || "-"],
      ["Email Kontak", p.email || "-"],
      ["Telepon", p.phone || "-"],
      ["Pendidikan Terakhir", `${p.education_level || "-"} - ${p.university || "-"}`],
      ["Bidang Keahlian / Jurusan", `${p.major || "-"} (Lulus: ${p.graduation_date || "-"})`],
      ["Lokasi Domisili", p.city || "-"],
      ["Keahlian Utama", Array.isArray(p.skills) ? p.skills.join(", ") : "-"],
      ["Alat Bantu Kerja", Array.isArray(p.used_assistive_tools) ? p.used_assistive_tools.join(", ") : "Tidak Ada"],
      ["Akomodasi Diharapkan", Array.isArray(p.preferred_accommodations) ? p.preferred_accommodations.join(", ") : "Sesuai Standar"],
      ["Catatan Internal HRD", app.hrd_notes || "Tidak ada catatan tambahan"]
    ],
    headStyles: { fillColor: [15, 23, 42], fontSize: 10 },
    bodyStyles: { textColor: [30, 41, 59], fontSize: 9 },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { cellPadding: 4 }
  });

  // 5. Footer Validasi Sistem
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setDrawColor(226, 232, 240);
  doc.line(20, finalY, 190, finalY);
  
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text("Dokumen ini dihasilkan secara otomatis dan merupakan representasi data talenta yang telah divalidasi sistem.", 20, finalY + 7);
  doc.text("Seluruh informasi ditujukan untuk kebutuhan rekrutmen profesional dan pengembangan talenta inklusif.", 20, finalY + 11);

  doc.save(`CV_Audit_${p.full_name.replace(/\s+/g, '_')}.pdf`);
};