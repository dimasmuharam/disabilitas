import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

export const generateEnrollmentPDF = (enrollments: any[], trainings: any[], selectedTrainingId: string, partnerName: string) => {
  const doc = new jsPDF();
  const activeTraining = trainings.find(t => t.id === selectedTrainingId);
  
  // 1. KOP SURAT & LOGO TEXT
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(37, 99, 235); // Blue-600
  doc.text("disabilitas.com", 105, 15, { align: "center" });
  
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // Slate-400
  doc.text("OFFICIAL IMPACT PARTNER ECOSYSTEM", 105, 20, { align: "center" });
  
  doc.setLineWidth(0.5);
  doc.line(20, 25, 190, 25); // Garis Pembatas Kop

  // 2. JUDUL & INFORMASI PROGRAM
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.setFont("helvetica", "bold");
  doc.text("DAFTAR HADIR PESERTA", 105, 35, { align: "center" });
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  // Detail Pelaksanaan
  const startYInfo = 45;
  doc.text(`Mitra Penyelenggara : ${partnerName}`, 20, startYInfo);
  doc.text(`Program Pelatihan    : ${activeTraining?.title || "Semua Program"}`, 20, startYInfo + 6);
  doc.text(`Waktu Pelaksanaan : ${activeTraining?.start_date || "-"}`, 20, startYInfo + 12);
  doc.text(`Lokasi / Tempat       : ${activeTraining?.location || "Online/Sesuai Jadwal"}`, 20, startYInfo + 18);

  // 3. TABEL DAFTAR HADIR (DENGAN KOLOM TANDA TANGAN)
  const tableRows = enrollments.map((item, index) => [
    index + 1,
    item.profiles?.full_name?.toUpperCase(),
    item.profiles?.city || "-",
    item.profiles?.gender === "male" ? "L" : "P",
    item.profiles?.disability_type,
    `${index + 1}. .................` // Kolom Tanda Tangan
  ]);

  (doc as any).autoTable({
    startY: 70,
    head: [['NO', 'NAMA LENGKAP', 'KOTA', 'L/P', 'RAGAM DISABILITAS', 'TANDA TANGAN']],
    body: tableRows,
    theme: 'grid',
    headStyles: { 
      fillColor: [15, 23, 42], 
      textColor: 255, 
      fontSize: 9, 
      fontStyle: 'bold',
      halign: 'center' 
    },
    styles: { 
      fontSize: 8, 
      cellPadding: 4,
      valign: 'middle'
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      3: { halign: 'center', cellWidth: 10 },
      5: { cellWidth: 40 } // Lebar kolom tanda tangan
    }
  });

  // 4. FOOTER UNTUK TANDA TANGAN PANITIA
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.text("Dicetak pada: " + new Date().toLocaleDateString('id-ID'), 20, finalY);
  doc.text("Tanda Tangan Panitia,", 150, finalY, { align: "center" });
  doc.text("..........................................", 150, finalY + 25, { align: "center" });

  doc.save(`Daftar_Hadir_${partnerName}_${activeTraining?.title || 'Program'}.pdf`);
};

export const exportEnrollmentToExcel = (enrollments: any[], partnerName: string) => {
  // Format data yang lebih lengkap untuk arsip
  const dataToExport = enrollments.map((item, index) => ({
    "No": index + 1,
    "ID Pendaftaran": item.id,
    "Nama Lengkap": item.profiles?.full_name,
    "Email": item.profiles?.email,
    "WhatsApp": item.profiles?.phone,
    "Kota": item.profiles?.city,
    "Gender": item.profiles?.gender === "male" ? "Laki-laki" : "Perempuan",
    "Ragam Disabilitas": item.profiles?.disability_type,
    "Program Pelatihan": item.trainings?.title,
    "Status Seleksi": item.status,
    "Keahlian Utama": item.top_skills ? item.top_skills.join(", ") : "-",
    "Tanggal Daftar": item.applied_at,
    "Catatan Admin": item.notes || "-"
  }));
  
  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Arsip Pendaftar");
  
  // Set lebar kolom agar rapi saat dibuka
  const wscols = [
    {wch:5}, {wch:20}, {wch:30}, {wch:30}, {wch:15}, 
    {wch:15}, {wch:15}, {wch:25}, {wch:30}, {wch:15}, 
    {wch:30}, {wch:25}, {wch:30}
  ];
  worksheet['!cols'] = wscols;

  XLSX.writeFile(workbook, `Arsip_Lengkap_${partnerName}.xlsx`);
};