import { supabase } from "@/lib/supabase";
import { downloadCSV } from "../campus/export-helper";

/**
 * FUNGSI 1: Laporan Data Talenta Wilayah (Filter berdasarkan String Lokasi)
 */
export const exportGovTalentReport = async (locationName: string) => {
  if (!locationName) return { success: false, message: "Wilayah otoritas belum ditentukan." };

  try {
    // KLARIFIKASI: Di tabel profiles, kolomnya adalah 'city' (string)
    const { data: talents, error } = await supabase
      .from("profiles")
      .select(`
        full_name, 
        disability_type, 
        education_level, 
        major, 
        graduation_date, 
        career_status,
        city
      `)
      .eq("city", locationName); // Filter string langsung sesuai locations.ts

    if (error) throw error;

    const headers = [
      "Nama Lengkap", 
      "Ragam Disabilitas", 
      "Pendidikan", 
      "Program Studi", 
      "Tahun Lulus", 
      "Status Karir",
      "Kota Domisili"
    ];

    const rows = (talents || []).map(t => [
      t.full_name || "Tanpa Nama",
      t.disability_type || "Tidak Disebutkan",
      t.education_level || "-",
      t.major || "-",
      t.graduation_date || "-",
      t.career_status || "Job Seeker",
      t.city || locationName
    ]);

    const dateStr = new Date().toLocaleDateString('id-ID').replace(/\//g, '-');
    const fileName = `Laporan_Talenta_${locationName.replace(/\s+/g, '_')}_${dateStr}.csv`;
    
    downloadCSV(fileName, headers, rows);
    return { success: true };
  } catch (err) {
    console.error("Export Error:", err);
    return { success: false };
  }
};

/**
 * FUNGSI 2: Laporan Mitra Industri (Filter berdasarkan String Lokasi)
 */
export const exportGovCompanyReport = async (locationName: string) => {
  try {
    // Di tabel companies, kolomnya adalah 'location' (string)
    const { data: companies, error } = await supabase
      .from("companies")
      .select("name, industry, size, inclusion_score, uld_verified_at")
      .eq("location", locationName);

    if (error) throw error;

    const headers = ["Nama Perusahaan", "Industri", "Skala Bisnis", "Skor Inklusi", "Status Verifikasi"];
    const rows = (companies || []).map(c => [
      c.name,
      c.industry || "-",
      c.size || "-",
      c.inclusion_score || 0,
      c.uld_verified_at ? `Terverifikasi (${new Date(c.uld_verified_at).toLocaleDateString('id-ID')})` : "Belum Verifikasi"
    ]);

    const fileName = `Mitra_Industri_${locationName.replace(/\s+/g, '_')}.csv`;
    downloadCSV(fileName, headers, rows);
    return { success: true };
  } catch (err) {
    console.error("Export Error:", err);
    return { success: false };
  }
};