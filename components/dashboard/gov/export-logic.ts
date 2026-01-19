import { supabase } from "@/lib/supabase";
import * as XLSX from "xlsx"; // Pastikan sudah terinstall
import { jsPDF } from "jspdf"; // Pastikan sudah terinstall
import autoTable from "jspdf-autotable";

/**
 * FUNGSI 1: Export EXCEL (Menggunakan Library XLSX)
 */
export const exportGovExcel = async (locationName: string) => {
  try {
    const { data: talents } = await supabase
      .from("profiles")
      .select("full_name, disability_type, education_level, major, career_status")
      .eq("city", locationName);

    // Pembuatan Worksheet
    const worksheet = XLSX.utils.json_to_sheet(talents || []);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Talenta");

    // Download File
    XLSX.writeFile(workbook, `Laporan_ULD_${locationName.replace(/\s+/g, '_')}.xlsx`);
    return { success: true };
  } catch (err) {
    return { success: false };
  }
};

/**
 * FUNGSI 2: Export PDF (Menggunakan Library jsPDF)
 */
export const exportGovPDF = async (locationName: string, govName: string) => {
  try {
    const { data: talents } = await supabase
      .from("profiles")
      .select("full_name, disability_type, education_level, career_status")
      .eq("city", locationName);

    const doc = new jsPDF();
    
    // Header Laporan Resmi
    doc.setFontSize(18);
    doc.text("LAPORAN DATA TALENTA DISABILITAS", 14, 22);
    doc.setFontSize(11);
    doc.text(`Otoritas: ${govName}`, 14, 30);
    doc.text(`Wilayah: ${locationName}`, 14, 36);
    doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 14, 42);

    // Pembuatan Tabel PDF
    autoTable(doc, {
      startY: 50,
      head: [['Nama Lengkap', 'Ragam Disabilitas', 'Pendidikan', 'Status']],
      body: (talents || []).map(t => [
        t.full_name, 
        t.disability_type, 
        t.education_level, 
        t.career_status
      ]),
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42] } // Warna Slate-900 sesuai UI Mas
    });

    doc.save(`Laporan_ULD_${locationName}.pdf`);
    return { success: true };
  } catch (err) {
    return { success: false };
  }
};