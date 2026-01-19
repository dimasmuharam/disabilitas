import { supabase } from "@/lib/supabase";
import { downloadCSV } from "../campus/export-helper"; // Kita re-use helper yang sudah ada

/**
 * FUNGSI 1: Ekspor Laporan Standar Kemenaker (Excel/CSV)
 * Menghasilkan data agregat dan detail untuk laporan periodik ULD.
 */
export const exportGovTalentReport = async (locationId: string, locationName: string) => {
  try {
    // 1. Ambil data talenta berdasarkan wilayah ULD
    const { data: talents, error } = await supabase
      .from("profiles")
      .select(`
        full_name, 
        major, 
        disability_type, 
        career_status, 
        education_level, 
        graduation_date,
        city
      `)
      .eq("city_id", locationId); // Filter otomatis per wilayah

    if (error) throw error;

    // 2. Susun Header Laporan Resmi
    const headers = [
      "Nama Lengkap", 
      "Ragam Disabilitas", 
      "Pendidikan Terakhir", 
      "Program Studi", 
      "Tahun Lulus", 
      "Status Karir saat ini",
      "Wilayah Domisili"
    ];

    // 3. Mapping Data
    const rows = (talents || []).map(t => [
      t.full_name,
      t.disability_type,
      t.education_level || "N/A",
      t.major || "N/A",
      t.graduation_date || "N/A",
      t.career_status,
      t.city
    ]);

    // 4. Eksekusi Download
    const fileName = `Laporan_ULD_${locationName.replace(/\s+/g, '_')}_2026.csv`;
    downloadCSV(fileName, headers, rows);

    return { success: true };
  } catch (err) {
    console.error("Export Error:", err);
    return { success: false };
  }
};

/**
 * FUNGSI 2: Ekspor Data Perusahaan Mitra Wilayah
 */
export const exportGovCompanyReport = async (locationName: string) => {
  try {
    const { data: companies, error } = await supabase
      .from("companies")
      .select("name, industry, size, inclusion_score, uld_verified_at")
      .eq("location", locationName);

    if (error) throw error;

    const headers = ["Nama Perusahaan", "Industri", "Skala", "Skor Inklusi", "Tanggal Verifikasi ULD"];
    const rows = (companies || []).map(c => [
      c.name,
      c.industry,
      c.size,
      c.inclusion_score,
      c.uld_verified_at ? new Date(c.uld_verified_at).toLocaleDateString('id-ID') : "Belum Verifikasi"
    ]);

    downloadCSV(`Daftar_Mitra_Industri_${locationName}.csv`, headers, rows);
    return { success: true };
  } catch (err) {
    return { success: false };
  }
};