/**
 * inclusion-mapping.ts
 * Memisahkan indikator akomodasi berdasarkan role institusi.
 * Urutan index 0-13 harus tetap sinkron antar role untuk keperluan kalkulasi skor.
 */

export const ROLE_ACCOMMODATIONS = {
  // 1. VERSI CAMPUS (Pendidikan Tinggi)
  campus: [
    "Ramp, Lift, dan Jalur Mobilitas Aksesibel",
    "Toilet Khusus Disabilitas yang Standar",
    "Jalur Pemandu (Guiding Block) dan Penanda Tekstur",
    "Area Parkir dan Drop-off Prioritas Disabilitas",
    "Ruang Belajar Tenang dan Pencahayaan Kontras",
    "Website Portal Kampus Standar WCAG 2.1",
    "LMS (Learning Management System) Aksesibel",
    "Dokumen Digital Kuliah Format EPUB/Tagged-PDF",
    "Lisensi Software Alat Bantu (Screen Reader/Magnifier)",
    "Sistem Informasi Pengumuman Visual dan Audio",
    "Unit Layanan Disabilitas (ULD) Resmi Institusi",
    "Layanan Juru Bahasa Isyarat dan Notulensi Real-time",
    "Modifikasi Kurikulum dan Metode Ujian Fleksibel",
    "Pendampingan Karir dan Transisi Kerja (Job Coach)"
  ],

  // 2. VERSI COMPANY (Dunia Kerja/Default/Talent)
  company: [
    "Workstation & Jalur Mobilitas Kantor",
    "Toilet & Fasilitas Gedung Aksesibel",
    "Signage Braille & Jalur Pemandu Area Kantor",
    "Area Parkir & Lobby Prioritas Karyawan",
    "Ruang Tenang (Sensory Room) & Fokus",
    "Portal Karyawan & ERP Standar WCAG 2.1",
    "Tools Meeting Aksesibel (Captions/Reader)",
    "Dokumen SOP & Panduan Kerja Aksesibel",
    "Dukungan Lisensi Software Alat Bantu Kerja Digital",
    "Komunikasi Internal Multimodal (Audio/Teks)",
    "Kebijakan Rekrutmen Khusus Disabilitas",
    "Layanan JBI untuk Rapat & Pelatihan",
    "Akomodasi Deskripsi Kerja (Job-Carving)",
    "Program Mentoring & Career Path Inklusif"
  ],

  // 3. VERSI PARTNER (Lembaga Pelatihan/Kursus)
  partner: [
    "Area Pelatihan & Workshop Aksesibel",
    "Toilet Disabilitas di Lokasi Pelatihan",
    "Jalur Pemandu di Area Pusat Belajar",
    "Area Kedatangan Prioritas Peserta",
    "Meja Praktik & Alat Peraga Adaptif",
    "Platform E-Learning Standar WCAG 2.1",
    "Materi Video dengan Subtitle & JBI",
    "Modul Pelatihan Format Digital Aksesibel",
    "Akses Software Pembaca Layar Pelatihan",
    "Sistem Asesmen/Ujian yang Akomodatif",
    "Instruktur Terlatih Interaksi Disabilitas",
    "Layanan Pendampingan (Mentor/Shadow Teacher)",
    "Kurikulum Pelatihan Berbasis Industri",
    "Jaringan Mitra Penyalur Kerja (Placement)"
  ],

  // 4. VERSI GOVERNMENT (Pelayanan Publik)
  government: [
    "Ruang Pelayanan Publik Aksesibel",
    "Toilet Ramah Disabilitas di Area Publik",
    "Pedestrian & Jalur Pemandu Standar",
    "Area Parkir Khusus Layanan Publik",
    "Loket Pelayanan Prioritas & Ramah Sensori",
    "Situs Layanan Publik Standar WCAG 2.1",
    "Aplikasi Mobile Pelayanan Aksesibel",
    "Publikasi Data/Regulasi Format Aksesibel",
    "Kiosk Informasi dengan Pembaca Layar",
    "Sistem Peringatan Dini Visual & Audio",
    "Unit Layanan Inklusi / Pokja Disabilitas",
    "Petugas Pelayanan Fasih Bahasa Isyarat",
    "Regulasi & Anggaran Pro-Disabilitas",
    "Program Monitoring & Evaluasi Inklusi"
  ]
};