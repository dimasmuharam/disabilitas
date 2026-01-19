import { supabase } from "@/lib/supabase";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * FUNGSI 1: Export EXCEL (Nama disesuaikan untuk Dashboard)
 * Sebelumnya: exportGovExcel -> Sekarang: exportGovTalentReport
 */
export const exportGovTalentReport = async (locationName: string) => {
  try {
    const { data: talents, error } = await supabase
      .from("profiles")
      .select("full_name, disability_type, education_level, major, career_status")
      .eq("city", locationName);

    if (error) throw error;

    // Pembuatan Worksheet menggunakan library XLSX
    const worksheet = XLSX.utils.json_to_sheet(talents || []);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data Talenta");

    // Download File dengan nama wilayah yang bersih
    const fileName = `Laporan_Talenta_${locationName.replace(/\s+/g, '_')}_2026.xlsx`;
    XLSX.writeFile(workbook, fileName);

    return { success: true };
  } catch (err) {
    console.error("Excel Export Error:", err);
    return { success: false };
  }
};

/**
 * FUNGSI 2: Export PDF (Nama disesuaikan untuk Dashboard)
 * Sebelumnya: exportGovPDF -> Sekarang: exportGovCompanyReport
 * (Meskipun namanya 'CompanyReport' di dashboard, isinya tetap laporan talenta wilayah sesuai kebutuhan ULD)
 */
export const exportGovCompanyReport = async (locationName: string, govName: string = "Instansi Pemerintah") => {
  try {
    const { data: talents, error } = await supabase
      .from("profiles")
      .select("full_name, disability_type, education_level, career_status")
      .eq("city", locationName);

    if (error) throw error;

    const doc = new jsPDF();
    
    // Header Laporan Resmi bergaya Neubrutalism (Slate-900)
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42); // Warna Slate-900
    doc.text("LAPORAN DATA TALENTA WILAYAH", 14, 22);
    
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Otoritas: ${govName}`, 14, 30);
    doc.text(`Wilayah: ${locationName}`, 14, 36);
    doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID')}`, 14, 42);

    // Pembuatan Tabel PDF menggunakan jsPDF-autotable
    autoTable(doc, {
      startY: 50,
      head: [['Nama Lengkap', 'Ragam Disabilitas', 'Pendidikan', 'Status Karir']],
      body: (talents || []).map(t => [
        t.full_name || "-", 
        t.disability_type || "-", 
        t.education_level || "-", 
        t.career_status || "-"
      ]),
      theme: 'striped',
      headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
      styles: { fontSize: 9 }
    });

    doc.save(`Laporan_PDF_${locationName.replace(/\s+/g, '_')}.pdf`);
    return { success: true };
  } catch (err) {
    console.error("PDF Export Error:", err);
    return { success: false };
  }
};