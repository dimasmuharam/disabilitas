import jsPDF from "jspdf";
import QRCode from "qrcode";

/**
 * Fungsi untuk generate sertifikat digital lengkap (Halaman Depan & Belakang)
 * Sesuai standar disabilitas.com untuk kebutuhan riset dan portofolio talenta.
 */
export const generateGraduationCertificate = async (item: any, partnerName: string) => {
  // Inisialisasi Dokumen Landscape A4
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  
  // Ambil data dari join table sesuai skema database
  const training = item.trainings || {};
  const profile = item.profiles || {};
  
  // 1. GENERATE QR CODE UNTUK VALIDASI
  // Link ini akan mengarah ke halaman verifikasi publik talenta
  const verificationUrl = `https://disabilitas.com/verify/cert/${item.id}`;
  let qrCodeDataUrl = "";
  try {
    qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      margin: 1,
      width: 100,
      color: { dark: "#0f172a", light: "#ffffff" }
    });
  } catch (err) {
    console.error("Gagal generate QR Code", err);
  }

  // ==========================================
  // --- HALAMAN 1: SERTIFIKAT UTAMA (DEPAN) ---
  // ==========================================

  // BORDER LUAR (NEOPUNK STYLE)
  doc.setDrawColor(15, 23, 42); // Slate-900
  doc.setLineWidth(1.5); 
  doc.rect(10, 10, 277, 190); // Border paling luar
  
  doc.setLineWidth(0.5); 
  doc.rect(12, 12, 273, 186); // Border dalam (aksen)

  // LOGO & HEADER
  doc.setFont("helvetica", "bold"); 
  doc.setFontSize(26); 
  doc.setTextColor(37, 99, 235); // Blue-600
  doc.text("disabilitas.com", 148.5, 30, { align: "center" });
  
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.setFontSize(9);
  doc.text("OFFICIAL IMPACT PARTNER ECOSYSTEM", 148.5, 35, { align: "center" });

  // JUDUL SERTIFIKAT
  doc.setTextColor(15, 23, 42); 
  doc.setFontSize(32); 
  doc.text("SERTIFIKAT KELULUSAN", 148.5, 58, { align: "center" });

  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text("Sertifikat ini diberikan kepada:", 148.5, 72, { align: "center" });

  // NAMA PENERIMA (BESAR & TEBAL)
  doc.setFontSize(40); 
  doc.setFont("helvetica", "bold");
  doc.text(profile.full_name?.toUpperCase() || "NAMA PESERTA", 148.5, 92, { align: "center" });

  // NARASI KELULUSAN
  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.text("Atas keberhasilannya dalam menyelesaikan program pelatihan:", 148.5, 108, { align: "center" });
  
  // NAMA PROGRAM PELATIHAN
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(37, 99, 235);
  doc.text(training.title || "Program Pelatihan", 148.5, 122, { align: "center" });

  // DETAIL WAKTU & DURASI (JP)
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  const startDate = training.start_date || "-";
  const endDate = training.end_date || "-";
  const totalHours = training.total_hours || "0";
  
  doc.text(`Diselenggarakan dari tanggal ${startDate} sampai ${endDate}`, 148.5, 132, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.text(`Total Durasi Pelatihan: ${totalHours} Jam Pelajaran (JP)`, 148.5, 138, { align: "center" });

  // KOMPETENSI (Diambil dari provided_skills di skema Mas)
  const skills = item.top_skills || training.provided_skills || [];
  if (skills.length > 0) {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("KOMPETENSI UTAMA:", 148.5, 154, { align: "center" });
    doc.setFont("helvetica", "italic");
    doc.setFontSize(11);
    doc.text(skills.join("  •  "), 148.5, 160, { align: "center" });
  }

  // QR CODE (Sisi Kiri Bawah)
  if (qrCodeDataUrl) {
    doc.addImage(qrCodeDataUrl, "PNG", 25, 155, 25, 25);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.text("Pindai untuk verifikasi", 37.5, 184, { align: "center" });
  }

  // TANDA TANGAN (Sisi Kanan Bawah)
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Diterbitkan oleh:`, 230, 155, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.text(partnerName, 230, 160, { align: "center" });
  
  doc.text("__________________________", 230, 178, { align: "center" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Authorized Signature", 230, 183, { align: "center" });


  // =============================================
  // --- HALAMAN 2: TRANSKRIP & SILABUS (BELAKANG) ---
  // =============================================

  doc.addPage();
  
  // Border Halaman Belakang
  doc.setDrawColor(15, 23, 42); 
  doc.setLineWidth(1); 
  doc.rect(10, 10, 277, 190);

  // Judul Transkrip
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("STRUKTUR KURIKULUM & MATERI PELATIHAN", 148.5, 25, { align: "center" });
  
  doc.setFontSize(12);
  doc.setTextColor(37, 99, 235);
  doc.text(training.title?.toUpperCase() || "DETAIL PROGRAM", 148.5, 32, { align: "center" });

  doc.setTextColor(15, 23, 42);
  doc.setLineWidth(0.5);
  doc.line(20, 38, 277, 38);

  // KONTEN SILABUS (Mengambil kolom syllabus dari skema Trainings)
  // Karena syllabus di database Mas bertipe 'text', kita lakukan auto-wrap
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  
  const syllabusContent = training.syllabus || "Detail kurikulum tidak tersedia secara spesifik.";
  
  // Pecah teks agar pas dengan lebar kertas
  const splitSyllabus = doc.splitTextToSize(syllabusContent, 240);
  
  // Jika teks terlalu panjang, kita letakkan mulai dari y=50
  doc.text(splitSyllabus, 25, 50);

  // FOOTER HALAMAN BELAKANG (Audit Trail)
  doc.setLineWidth(0.2);
  doc.line(20, 185, 277, 185);
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(148, 163, 184); // Slate-400
  const auditTrail = `Sertifikat Digital ini sah secara hukum di dalam ekosistem disabilitas.com. Dibuat secara otomatis untuk mendukung riset penyerapan tenaga kerja disabilitas pada ${new Date().toLocaleDateString('id-ID')}.`;
  doc.text(auditTrail, 148.5, 192, { align: "center" });

  // SAVE FILE
  const fileName = `Sertifikat_${profile.full_name?.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
};