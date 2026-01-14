import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateProfessionalCV = async (profile: any, workExps: any[], certifications: any[]) => {
  const doc = new jsPDF();
  const name = profile?.full_name || "NAMA LENGKAP";
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  // --- 1. HELPER: GENERATE EXECUTIVE SUMMARY OTOMATIS ---
  const getAutoSummary = () => {
    if (profile?.bio) return profile.bio;
    const majorInfo = profile?.major ? `lulusan ${profile.major}` : "profesional";
    const cityInfo = profile?.city ? `berdomisili di ${profile.city}` : "";
    return `Saya adalah seorang ${majorInfo} ${cityInfo} yang memiliki komitmen tinggi untuk berkontribusi secara profesional. Sebagai bagian dari talenta inklusif disabilitas.com, saya berfokus pada pengembangan kompetensi dan siap memberikan dampak positif bagi instansi/perusahaan melalui keahlian yang saya miliki.`;
  };

  // --- 2. HEADER / KOP PROFESIONAL ---
  doc.setFillColor(37, 99, 235); // Blue-600
  doc.rect(0, 0, pageWidth, 45, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text(name.toUpperCase(), 20, 25);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const subHeader = `${profile?.disability_type || 'Talenta Inklusif'} | ${profile?.city || '-'} | ${profile?.phone || '-'}`;
  doc.text(subHeader, 20, 32);

  // Branding Text (Sebagai pengganti logo.png jika file fisik belum dipanggil)
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("disabilitas.com", pageWidth - 55, 25);
  doc.setFontSize(8);
  doc.text("Professional Inclusion Profile", pageWidth - 55, 30);

  let yPos = 55;

  // --- 3. EXECUTIVE SUMMARY ---
  doc.setTextColor(37, 99, 235);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("RINGKASAN PROFESIONAL", 20, yPos);
  
  yPos += 6;
  doc.setTextColor(60, 60, 60);
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  const splitSummary = doc.splitTextToSize(getAutoSummary(), 170);
  doc.text(splitSummary, 20, yPos);
  
  yPos += (splitSummary.length * 5) + 10;

  // --- 4. RIWAYAT PENDIDIKAN ---
  doc.setTextColor(37, 99, 235);
  doc.setFont("helvetica", "bold");
  doc.text("PENDIDIKAN TERAKHIR", 20, yPos);
  
  autoTable(doc, {
    startY: yPos + 4,
    head: [['Institusi', 'Program Studi', 'Jenjang', 'Tahun Lulus']],
    body: [[
      profile?.university || "-",
      profile?.major || "-",
      profile?.education_level || "-",
      profile?.graduation_date || "-"
    ]],
    theme: 'plain',
    headStyles: { textColor: [100, 100, 100], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 10, textColor: [40, 40, 40] },
    margin: { left: 20 }
  });

  yPos = (doc as any).lastAutoTable.finalY + 12;

  // --- 5. RIWAYAT PEKERJAAN ---
  doc.setTextColor(37, 99, 235);
  doc.text("RIWAYAT PEKERJAAN", 20, yPos);
  
  if (workExps.length > 0) {
    const workBody = workExps.map(exp => [
      `${exp.position}\n${exp.company_name}`,
      `${exp.start_date} - ${exp.is_current_work ? 'Sekarang' : exp.end_date}`,
      exp.description || "-"
    ]);

    autoTable(doc, {
      startY: yPos + 4,
      head: [['Posisi & Instansi', 'Periode', 'Deskripsi Tugas']],
      body: workBody,
      theme: 'striped',
      headStyles: { fillColor: [241, 245, 249], textColor: [51, 65, 85] },
      bodyStyles: { fontSize: 9 },
      columnStyles: { 2: { cellWidth: 80 } },
      margin: { left: 20 }
    });
    yPos = (doc as any).lastAutoTable.finalY + 12;
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text("Belum ada riwayat pekerjaan terdaftar.", 20, yPos + 8);
    yPos += 20;
  }

  // --- 6. SERTIFIKASI ---
  if (yPos > 250) { doc.addPage(); yPos = 20; }
  doc.setTextColor(37, 99, 235);
  doc.setFont("helvetica", "bold");
  doc.text("SERTIFIKASI & KOMPETENSI", 20, yPos);
  
  if (certifications.length > 0) {
    const certBody = certifications.map(c => [c.name, c.organizer_name, c.year]);
    autoTable(doc, {
      startY: yPos + 4,
      head: [['Nama Sertifikasi', 'Penyelenggara', 'Tahun']],
      body: certBody,
      theme: 'plain',
      bodyStyles: { fontSize: 9 },
      margin: { left: 20 }
    });
    yPos = (doc as any).lastAutoTable.finalY + 12;
  } else {
    yPos += 12;
  }

  // --- 7. SKILLS & AKSESIBILITAS ---
  if (yPos > 240) { doc.addPage(); yPos = 20; }
  
  doc.setTextColor(37, 99, 235);
  doc.text("KEAHLIAN UTAMA", 20, yPos);
  doc.text("DUKUNGAN AKSESIBILITAS", 110, yPos);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(60);

  const skills = Array.isArray(profile?.skills) ? profile.skills.join(", ") : "-";
  const tools = Array.isArray(profile?.used_assistive_tools) ? profile.used_assistive_tools.join(", ") : "-";
  
  doc.text(doc.splitTextToSize(skills, 80), 20, yPos + 6);
  doc.text(doc.splitTextToSize(`Alat Bantu: ${tools}`, 80), 110, yPos + 6);

  // --- 8. FOOTER & QR CODE VALIDASI ---
  const footerY = pageHeight - 40;
  doc.setDrawColor(226, 232, 240);
  doc.line(20, footerY, pageWidth - 20, footerY);

  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text("Diterbitkan secara resmi oleh disabilitas.com pada " + new Date().toLocaleDateString('id-ID'), 20, footerY + 10);
  doc.text("Validitas dokumen: Scan QR Code di samping.", 20, footerY + 15);

  // QR Code Logic: Mengambil elemen QR dari dashboard dan menempelkannya ke PDF
  const qrElement = document.querySelector('canvas'); 
  if (qrElement) {
    const qrImage = qrElement.toDataURL("image/png");
    doc.addImage(qrImage, 'PNG', pageWidth - 45, footerY + 5, 25, 25);
  } else {
    // Fallback jika canvas tidak ditemukan, gambar kotak bordir biru
    doc.setDrawColor(37, 99, 235);
    doc.rect(pageWidth - 45, footerY + 5, 25, 25);
  }

  doc.save(`CV_Professional_${name.replace(/\s+/g, '_')}.pdf`);
};