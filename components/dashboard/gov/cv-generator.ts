import { supabase } from "@/lib/supabase";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * FUNGSI: Generate CV Aksesibel (jspdf)
 * Output: PDF yang bisa dibaca screen reader & ukuran file sangat kecil
 */
export const generateGovTalentPDF = async (profileId: string, govName: string, govLogoUrl?: string) => {
  // 1. Ambil data lengkap talenta
  const { data: p, error } = await supabase
    .from("profiles")
    .select(`*, work_experiences (*)`)
    .eq("id", profileId)
    .single();

  if (error || !p) {
    alert("Data profil tidak ditemukan");
    return;
  }

  // 2. Inisialisasi jsPDF (A4)
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    putOnlyUsedFonts: true,
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // 3. HEADER - SISTEM KOP SURAT FORMAL
  // Garis Tebal Atas (Style Neubrutalism)
  doc.setLineWidth(1.5);
  doc.line(14, 15, pageWidth - 14, 15);

  // Logo Utama (Kiri - Logo Instansi jika ada)
  if (govLogoUrl) {
    try {
      doc.addImage(govLogoUrl, "PNG", 14, 18, 20, 20);
    } catch (e) { console.error("Logo Otoritas gagal dimuat"); }
  }

  // Nama Instansi & Judul
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.text("UNIT LAYANAN DISABILITAS (ULD)", pageWidth / 2, 23, { align: "center" });
  doc.text(govName.toUpperCase(), pageWidth / 2, 30, { align: "center" });
  
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(100);
  doc.text("Sistem Informasi Talenta Inklusi Nasional", pageWidth / 2, 35, { align: "center" });

  // Logo Platform (Kanan)
  doc.addImage("/logo.png", "PNG", pageWidth - 35, 18, 20, 8);

  // Garis Pemisah Kop
  doc.setLineWidth(0.5);
  doc.line(14, 42, pageWidth - 14, 42);

  // 4. JUDUL DOKUMEN
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(15, 23, 42);
  doc.text("CURRICULUM VITAE", pageWidth / 2, 55, { align: "center" });

  // 5. DATA PRIBADI (Table based for structure)
  autoTable(doc, {
    startY: 65,
    body: [
      ["Nama Lengkap", `: ${p.full_name?.toUpperCase()}`],
      ["Ragam Disabilitas", `: ${p.disability_type}`],
      ["Pendidikan", `: ${p.education_level} ${p.major || ''}`],
      ["Kota Domisili", `: ${p.city || '-'}`],
    ],
    theme: "plain",
    styles: { fontSize: 11, cellPadding: 1, font: "helvetica" },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 40 } },
  });

  // 6. RINGKASAN PROFIL
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("RINGKASAN PROFESIONAL", 14, (doc as any).lastAutoTable.finalY + 10);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const bio = p.bio || "Talenta berdedikasi dengan fokus pada kemandirian profesional.";
  const splitBio = doc.splitTextToSize(bio, pageWidth - 28);
  doc.text(splitBio, 14, (doc as any).lastAutoTable.finalY + 16);

  // 7. RIWAYAT KERJA (Tabel Formal)
  const workStartY = (doc as any).lastAutoTable.finalY + 35;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("RIWAYAT PEKERJAAN", 14, workStartY - 5);

  autoTable(doc, {
    startY: workStartY,
    head: [["Posisi", "Instansi/Perusahaan", "Periode"]],
    body: p.work_experiences?.length 
      ? p.work_experiences.map((w: any) => [w.position, w.company_name, `${w.start_date} - ${w.is_current_work ? 'Sekarang' : w.end_date}`])
      : [["Belum ada riwayat kerja formal terdaftar", "", ""]],
    headStyles: { fillColor: [15, 23, 42] },
    styles: { fontSize: 9 },
  });

  // 8. QR CODE VERIFIKASI (Gunakan Link Statis QR Server)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://disabilitas.com/talent/${p.id}`;
  const qrY = doc.internal.pageSize.getHeight() - 50;
  
  doc.addImage(qrCodeUrl, "JPEG", pageWidth - 40, qrY, 25, 25);
  doc.setFontSize(8);
  doc.text("Scan Verifikasi", pageWidth - 27.5, qrY + 30, { align: "center" });
  doc.text("Profil Talenta", pageWidth - 27.5, qrY + 33, { align: "center" });

  // 9. FOOTER
  const footerY = doc.internal.pageSize.getHeight() - 15;
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(`Dokumen ini divalidasi oleh Otoritas ${govName} melalui platform disabilitas.com`, 14, footerY);
  doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID')}`, pageWidth - 14, footerY, { align: "right" });

  // 10. SIMPAN
  doc.save(`CV_ULD_${p.full_name.replace(/\s+/g, '_')}.pdf`);
};