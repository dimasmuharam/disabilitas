export const INCLUSION_INDICATORS = {
  campus: [
    // FISIK (0-4)
    "Ramp, Lift, dan Jalur Mobilitas Aksesibel",
    "Toilet Khusus Disabilitas Standar",
    "Jalur Pemandu (Guiding Block) & Penanda Tekstur",
    "Area Parkir & Drop-off Prioritas",
    "Ruang Belajar Tenang & Cahaya Kontras",
    // DIGITAL (5-9)
    "Website Portal Kampus Standar WCAG 2.1",
    "LMS (Learning Management System) Aksesibel",
    "Dokumen Digital Kuliah (EPUB/Tagged-PDF)",
    "Lisensi Software Alat Bantu (Screen Reader)",
    "Informasi Pengumuman Visual & Audio",
    // OUTPUT/KEBIJAKAN (10-13)
    "Unit Layanan Disabilitas (ULD) Resmi",
    "Layanan JBI & Notulensi Real-time",
    "Modifikasi Kurikulum & Ujian Fleksibel",
    "Pendampingan Karir & Job Coach"
  ],
  company: [
    // FISIK (0-4)
    "Workstation & Jalur Mobilitas Kantor",
    "Toilet & Fasilitas Gedung Aksesibel",
    "Signage Braille & Jalur Pemandu Area Kantor",
    "Area Parkir & Lobby Prioritas Karyawan",
    "Ruang Tenang (Sensory Room) & Fokus",
    // DIGITAL (5-9)
    "Portal Karyawan & ERP Standar WCAG 2.1",
    "Tools Meeting Aksesibel (Captions/Reader)",
    "Dokumen SOP & Panduan Kerja Aksesibel",
    "Dukungan Lisensi Software Alat Bantu Kerja",
    "Komunikasi Internal Multimodal (Audio/Teks)",
    // OUTPUT/KEBIJAKAN (10-13)
    "Kebijakan Afirmasi Rekrutmen Disabilitas",
    "Layanan JBI untuk Rapat & Pelatihan",
    "Akomodasi Deskripsi Kerja (Job-Carving)",
    "Program Mentoring & Career Path Inklusif"
  ],
  partner: [
    // FISIK (0-4)
    "Area Pelatihan & Workshop Aksesibel",
    "Toilet Disabilitas di Lokasi Pelatihan",
    "Jalur Pemandu di Area Pusat Belajar",
    "Area Kedatangan Prioritas Peserta",
    "Meja Praktik & Alat Peraga Adaptif",
    // DIGITAL (5-9)
    "Platform E-Learning Standar WCAG 2.1",
    "Materi Video dengan Subtitle & JBI",
    "Modul Pelatihan Format Digital Aksesibel",
    "Akses Software Pembaca Layar Pelatihan",
    "Sistem Asesmen/Ujian yang Akomodatif",
    // OUTPUT/KEBIJAKAN (10-13)
    "Instruktur Terlatih Interaksi Disabilitas",
    "Layanan Pendampingan (Mentor/Shadow)",
    "Kurikulum Pelatihan Berbasis Industri",
    "Jaringan Mitra Penyalur Kerja (Placement)"
  ],
  government: [
    // FISIK (0-4)
    "Ruang Pelayanan Publik Aksesibel",
    "Toilet Ramah Disabilitas di Area Publik",
    "Pedestrian & Jalur Pemandu Standar",
    "Area Parkir Khusus Layanan Publik",
    "Loket Pelayanan Prioritas & Ramah Sensori",
    // DIGITAL (5-9)
    "Situs Layanan Publik Standar WCAG 2.1",
    "Aplikasi Mobile Pelayanan Aksesibel",
    "Publikasi Data/Regulasi Format Aksesibel",
    "Kiosk Informasi dengan Pembaca Layar",
    "Sistem Peringatan Dini Visual & Audio",
    // OUTPUT/KEBIJAKAN (10-13)
    "Unit Layanan Inklusi / Pokja Disabilitas",
    "Petugas Pelayanan Fasih Bahasa Isyarat",
    "Regulasi & Anggaran Pro-Disabilitas",
    "Program Pemberdayaan & Monitoring Inklusi"
  ]
};

  export const getInclusionLabel = (index: number, role: string = 'company') => {
  // Mapping role ke kunci yang tersedia
  const roleMap: Record<string, string> = {
    'talent': 'company',
    'company': 'company',
    'partner': 'partner',
    'campus': 'campus',
    'government': 'government'
  };

  const activeRole = roleMap[role] || 'company'; // Default ke company
  const set = INCLUSION_INDICATORS[activeRole as keyof typeof INCLUSION_INDICATORS];
  
  return set[index] || "Indikator Tidak Terdefinisi";
};
 