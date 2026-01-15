import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * EXPORT EXCEL (CSV) UNTUK HRD
 * Dioptimalkan untuk komparasi horizontal di spreadsheet
 */
export const exportApplicantsToExcel = (applicants: any[], companyName: string) => {
  // Header yang lebih detail untuk kebutuhan sortir HRD
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
    "Catatan HRD (Notes)"
  ].join(",");

  const rows = applicants.map(app => {
    const p = app.profiles;
    // Helper untuk menangani karakter spesial di CSV agar data tidak berantakan
    const clean = (val: any) => {
      const stringVal = val ? String(val) : "";
      return `"${stringVal.replace(/"/g, '""')}"`;
    };
    
    // Parse data array (skills & tools)
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
      clean(p?.graduation_date), // Ditambahkan untuk komparasi senioritas
      clean(p?.city),
      clean(formatArray(p?.skills)),
      clean(formatArray(p?.used_assistive_tools)),
      clean(app.hrd_notes)
    ].join(",");
  }).join("\n");

  const blob = new Blob([headers + "\n" + rows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `Data_Pelamar_${companyName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * GENERATE PROFESSIONAL CV AUDIT
 * Digunakan HRD untuk lampiran fisik/arsip digital per pelamar
 */
export const generateProfessionalCV = (app: any, company: any) => {
  const doc = new jsPDF();
  const p = app.profiles;
  
  // 1. Header Styling (Navy Dark sesuai Branding)
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 45, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("Disabilitas.com", 20, 20);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Platform Karir Inklusif & Pusat Riset Talenta", 20, 27);

  // 2. Info Dokumen
  doc.setFontSize(8);
  doc.text(`ID Lamaran: ${app.id.substring(0, 8)}`, 150, 20);
  doc.text(`Dicetak untuk: ${company.name}`, 150, 25);

  // 3. Nama Talenta
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text((p.full_name || "NAMA TALENTA").toUpperCase(), 20, 60);

  // 4. Tabel Audit Detail
  autoTable(doc, {
    startY: 70,
    head: [["Kategori Audit", "Informasi Konfirmasi"]],
    body: [
      ["Posisi Yang Dilamar", app.jobs?.title || "-"],
      ["Status Aplikasi", app.status.toUpperCase()],
      ["Email & Kontak", `${p.email} / ${p.phone || "-"}`],
      ["Pendidikan Terakhir", `${p.education_level} - ${p.university}`],
      ["Jurusan & Tahun Lulus", `${p.major || "-"} (${p.graduation_date || "-"})`],
      ["Domisili", p.city || "-"],
      ["Keahlian Utama", Array.isArray(p.skills) ? p.skills.join(", ") : "-"],
      ["Alat Bantu Kerja", Array.isArray(p.used_assistive_tools) ? p.used_assistive_tools.join(", ") : "Tidak Ada"],
      ["Catatan Khusus HRD", app.hrd_notes || "Tidak ada catatan tambahan"]
    ],
    headStyles: { fillColor: [51, 65, 85] },
    bodyStyles: { textColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    styles: { cellPadding: 4, fontSize: 9 }
  });

  // 5. Footer Validasi
  const finalY = (doc as any).lastAutoTable.finalY + 20;
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("Dokumen ini divalidasi oleh sistem Disabilitas.com sebagai ringkasan profil talenta.", 20, finalY);

  doc.save(`CV_Audit_${p.full_name.replace(/\s+/g, '_')}.pdf`);
};