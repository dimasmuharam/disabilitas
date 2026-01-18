// File: lib/data-static.ts
// Deskripsi: Basis data statis komprehensif untuk sinkronisasi riset disabilitas.com
import { ALL_UNIVERSITIES } from './constants/universities';
import { ALL_MAJORS } from './constants/majors';

export const USER_ROLES = {
  TALENT: "talent",
  COMPANY: "company",
  CAMPUS: "campus",
  PARTNER: "partner",
  GOVERNMENT: "government",
  ADMIN: "admin", 
} as const;

export const USER_ROLE_LABELS = [
  { id: USER_ROLES.TALENT, label: "Talenta Disabilitas" },
  { id: USER_ROLES.COMPANY, label: "Perusahaan / Pemberi Kerja" },
  { id: USER_ROLES.CAMPUS, label: "Perguruan Tinggi" },
  { id: USER_ROLES.PARTNER, label: "Mitra Pelatihan" },
  { id: USER_ROLES.GOVERNMENT, label: "Instansi Pemerintah" },
  { id: USER_ROLES.ADMIN, label: "Super Admin" },
 
];

// Tambahkan di bawah USER_ROLES
export const GOV_INSTANSI_CATEGORIES = [
  "ULD Ketenagakerjaan Provinsi",
  "ULD Ketenagakerjaan Kota/Kabupaten",
  "Kementerian Sektoral"
] as const;

// Tipe data untuk TypeScript (Opsional tapi sangat membantu)
export type GovCategory = typeof GOV_INSTANSI_CATEGORIES[number];

export const DISABILITY_TYPES = [
  "Netra / Low Vision",
  "Tuli / Wicara",
  "Daksa (Pengguna Kursi Roda)",
  "Daksa (Non-Kursi Roda)",
  "Intelektual",
  "Mental / Psikososial",
  "Autisme",
  "Ganda / Multi"
].sort();

export const WORK_MODES = [
  "WFO (Di Kantor)", 
  "Remote (WFH Penuh)", 
  "Hybrid (Kombinasi)"
];
export const EMPLOYMENT_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Freelance",
  "Internship",
  "Self-employed"
];

export const CAREER_STATUSES = [
  "Job Seeker",
  "Fresh Graduate",
  "Pegawai Swasta",
  "Pegawai BUMN / BUMD",
  "ASN (PNS / PPPK)",
  "Wiraswasta / Entrepreneur",
  "Freelancer / Tenaga Lepas",
  "Pelajar / Mahasiswa",
    "Belum Bekerja"
];
export const AGE_RANGES = [
  "18-24 Tahun",
  "25-34 Tahun",
  "35-44 Tahun",
  "Di atas 45 Tahun"
];

export const EMPLOYER_CATEGORIES = [
  "Instansi Pemerintah (ASN)",
  "Perusahaan Swasta",
  "BUMN dan BUMD",
  "Lembaga Nonprofit",
  "Lainnya"
];

export const COMPANY_SIZE_CATEGORIES = [
  "Mikro (1-10 Karyawan)",
  "Kecil (11-50 Karyawan)",
  "Menengah (51-250 Karyawan)",
  "Besar (Lebih dari 250 Karyawan)"
];
export const INDUSTRY_CATEGORIES = [
  "Perbankan & Keuangan", "Teknologi & IT", "Manufaktur", "Retail & Perdagangan",
  "Pendidikan", "Kesehatan", "Perhotelan & Pariwisata", "Konstruksi", "Logistik",
  "Media & Kreatif", "Pemerintahan", "LSM / Nonprofit"
].sort();

export const INCLUSION_RATING_QUESTIONS = [
  { id: "score_accessibility", label: "Aksesibilitas Fasilitas & Digital" },
  { id: "score_culture", label: "Budaya Inklusi di Tempat Kerja" },
  { id: "score_management", label: "Kebijakan & Dukungan Manajemen" },
  { id: "score_onboarding", label: "Kualitas Komunikasi & Onboarding" }
];
// LIST INSTANSI PEMERINTAH (ASN)
export const GOVERNMENT_AGENCIES_LIST = [
  "Kementerian Keuangan",
  "Kementerian Sosial",
  "Kementerian Ketenagakerjaan",
  "Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi",
  "Kementerian Hukum dan HAM",
  "Kementerian Kesehatan",
  "Kementerian PAN-RB",
  "Kementerian Komunikasi dan Digital",
  "Badan Kepegawaian Negara (BKN)",
  "Badan Riset dan Inovasi Nasional (BRIN)",
  "Pemerintah Provinsi Jakarta",
  "Pemerintah Provinsi Jawa Tengah",
  "Pemerintah Provinsi Jawa Timur",
  "Pemerintah Provinsi Jawa Barat"
].sort();

// LIST BUMN & BUMD
export const STATE_ENTERPRISES_LIST = [
  "Bank Rakyat Indonesia (BRI)",
  "Bank Mandiri",
  "Bank Negara Indonesia (BNI)",
  "Telkom Indonesia",
  "Pertamina",
  "PLN (Persero)",
  "Kereta Api Indonesia (KAI)",
  "Garuda Indonesia",
  "Angkasa Pura",
  "Pos Indonesia",
  "Bank DKI",
  "Bank Jateng",
  "Bank Jatim",
  "Transjakarta"
].sort();

// LIST PERUSAHAAN SWASTA (Inklusif)
export const PRIVATE_COMPANIES_LIST = [
  "Alfamat (Sumber Alfaria Trijaya)",
  "Bank Permata",
  "Indomaret (Indomarco Prismatama)",
  "Grab Indonesia",
  "Gojek (Goto Group)",
  "Unilever Indonesia",
  "Standard Chartered",
  "L'Oreal Indonesia",
  "IBM Indonesia",
  "Accenture Indonesia",
  "Siloam Hospitals",
  "Burgreens",
  "Thisable Enterprise",
"PT Dimaster Education Berprestasi",
  "Bank Danamon",
  "Maybank Indonesia",
  "Microsoft Indonesia",
  "Google Indonesia"
].sort();

// LIST LEMBAGA NONPROFIT (NGO/Organisasi Internasional)
export const NONPROFIT_ORG_LIST = [
  "PBB (United Nations)",
  "Yayasan Pembinaan Anak Cacat (YPAC)",
  "Persatuan Tuna Netra Indonesia (PERTUNI)",
  "Yayasan Mitra Netra",
  "Karya Tunanetra (Kartunet)",
  "Gerakan Kesejahteraan Tuna Rungu Indonesia (GERKATIN)",
  "Himpunan Wanita Disabilitas Indonesia (HWDI)",
  "Sigab Indonesia",
  "Pusat Rehabilitasi YAKKUM",
  "Save the Children Indonesia",
  "Wahana Visi Indonesia",
  "Dompet Dhuafa",
  "Kerjabilitas",
  "Rumah Zakat"
].sort();

// PERGURUAN TINGGI dan Jurusan
export const UNIVERSITIES = ALL_UNIVERSITIES.sort();
export const UNIVERSITY_MAJORS = ALL_MAJORS.sort();
// LEMBAGA PELATIHAN (TRAINING PARTNERS)
export const TRAINING_PARTNERS = [
  "Kementerian Komunikasi dan Digital (Komdigi)",
  "BBPVP Bekasi (Cevest)",
  "BBPVP Semarang",
  "BBPVP Bandung",
  "BBPVP Medan",
  "Pusat Pelatihan Kerja Daerah (PPKD) Jakarta",
  "Digitalent Scholarship",
  "Ruangguru (Lembaga Kursus Swasta)",
  "Binar Academy",
  "Hacktiv8",
  "Karya Tunanetra (Kartunet)",
  "Persatuan Tunanetra Indonesia (Pertuni)",
  "Mitra Lembaga Latihan Kerja (LLK) Daerah"
].sort();

export const EDUCATION_LEVELS = [
  "Tidak Sekolah",
  "SD / Sederajat",
  "SMP / Sederajat",
  "SMA / SMK / Sederajat",
  "Diploma (D1/D2/D3)",
  "Sarjana (S1 / D4)",
  "Magister (S2)",
  "Doktor (S3)"
];

export const EDUCATION_MODELS = [
  "Sekolah Luar Biasa (SLB)",
  "Sekolah Reguler / inklusi",
  "Home Schooling",
  "Pendidikan Informal / BLK"
];

export const SCHOLARSHIP_TYPES = [
  "Tanpa Beasiswa (Mandiri)",
  "Beasiswa Pemerintah (KIP-K/LPDP/Dsb)",
  "Beasiswa Swasta / Yayasan",
  "Beasiswa Luar Negeri",
  "Bantuan Sosial / Dinas Sosial"
];

export const EDUCATION_BARRIERS = [
  "Kendala Biaya / Ekonomi",
  "Jarak Sekolah atau Kampus Terlalu Jauh",
  "Ditolak oleh Pihak Sekolah atau Kampus",
  "Fasilitas Fisik Sekolah atau Kampus Tidak Aksesibel",
  "Kurangnya Tenaga Pendidik Khusus atau Disability Advisor",
  "Masalah Kesehatan",
  "Fokus Bekerja",
  "Faktor Lingkungan / Bullying"
].sort();

// AKOMODASI YANG DITERIMA DARI INSTITUSI (Pendidikan)
export const ACADEMIC_SUPPORT_RECEIVED = [
  "Penyediaan Juru Bahasa Isyarat oleh institusi pendidikan",
  "Pendampingan Khusus dari Unit Layanan Disabilitas (ULD)",
  "Modifikasi Materi Ujian (Braille/Audio/Large Print)",
  "Aksesibilitas Fisik Gedung (Ramp/Lift/Toilet)",
  "Fleksibilitas Waktu Pengerjaan Tugas & Ujian",
  "Penyediaan Jasa Notetaker (Pencatat Kuliah)",
  "Tidak Ada Dukungan dari Pihak Institusi",
  "Lainnya"
];

// TEKNOLOGI BANTU YANG DIGUNAKAN UNTUK BELAJAR (Mandiri)
export const ACADEMIC_ASSISTIVE_TOOLS = [
  "Software Pembaca Layar (Screen Reader)",
  "Aplikasi Perekam & Transkrip Kuliah",
  "Alat Bantu Dengar / Cochlear Implant",
  "Mesin Ketik Braille / Slate & Stylus",
  "Perangkat Magnifier (Pembesar Teks)",
  "Laptop/Tablet dengan Fitur Aksesibilitas Khusus",
  "Aplikasi Pengubah Teks ke Suara (Text-to-Speech)",
  "Lainnya"
];

// KESESUAIAN BIDANG STUDI
export const STUDY_RELEVANCE_LEVELS = [
  "Sangat Relevan (Bekerja sesuai jurusan)",
  "Cukup Relevan (Bekerja di bidang terkait)",
  "Kurang Relevan (Hanya sebagian kecil ilmu terpakai)",
  "Tidak Relevan (Bekerja di bidang berbeda total)",
  "Belum Bekerja"
];
export const ACCOMMODATION_TYPES = [
  // KLASTER 1: AKSESIBILITAS FISIK (BOBOT 30%)
  "Ramp, Lift, dan Jalur Mobilitas Aksesibel",
  "Toilet Khusus Disabilitas yang Standar",
  "Jalur Pemandu (Guiding Block) dan Penanda Tekstur",
  "Area Parkir dan Drop-off Prioritas Disabilitas",
  "Ruang Belajar Tenang dan Pencahayaan Kontras",

  // KLASTER 2: AKSESIBILITAS DIGITAL (BOBOT 40% - SALES TRIGGER)
  "Website Portal Kampus Standar WCAG 2.1",
  "LMS (Learning Management System) Aksesibel",
  "Dokumen Digital Kuliah Format EPUB/Tagged-PDF",
  "Lisensi Software Alat Bantu (Screen Reader/Magnifier)",
  "Sistem Informasi Pengumuman Visual dan Audio",

  // KLASTER 3: AKOMODASI AKADEMIK & OUTPUT (BOBOT 30%)
  "Unit Layanan Disabilitas (ULD) Resmi Institusi",
  "Layanan Juru Bahasa Isyarat dan Notulensi Real-time",
  "Modifikasi Kurikulum dan Metode Ujian Fleksibel",
  "Pendampingan Karir dan Transisi Kerja (Job Coach)"
];

export const DISABILITY_TOOLS = [
  "Screen Reader - NVDA",
  "Screen Reader - JAWS",
  "Screen Reader - VoiceOver",
  "Screen Reader - TalkBack",
  "Magnifier (Kaca Pembesar Digital)",
  "Refreshable Braille Display",
  "Tongkat Putih",
  "Kursi Roda Manual",
  "Kursi Roda Elektrik",
  "Alat Bantu Dengar (Hearing Aid)",
  "Cochlear Implant",
  "Aplikasi Speech-to-Text",
  "Bahasa Isyarat (BISINDO)",
  "Bahasa Isyarat (SIBI)",
  "Kruk / Walker / Tripod",
  "Prostetik (Tangan/Kaki Palsu)",
  "Ortotik (Penyangga Tubuh)",
  "Software Prediksi Kata",
  "Fidget Tools / Noise Cancelling (Sensory)",
  "Tanpa Alat Bantu"
].sort();

export const SKILLS_LIST = [
  "Administrasi Perkantoran",
  "Data Entry & Processing",
  "Copywriting / Content Writing",
  "Digital Marketing",
  "Social Media Management",
  "Graphic Design",
  "Video Editing",
  "Web Development (Frontend/Backend)",
  "Mobile App Development",
  "Software Testing / QA",
  "Digital Accessibility Audit (WCAG)",
  "Customer Service / Telemarketing",
  "Public Speaking / MC",
  "Accounting / Bookkeeping",
  "Human Resources",
  "Project Management",
  "Penerjemah Bahasa Isyarat",
  "Penerjemah Bahasa Asing",
  "Analisis Data / Statistik",
  "Keterampilan Tangan / Kerajinan",
  "Culinary / Tata Boga"
].sort();

export const INDONESIA_CITIES = [
  "Jakarta Pusat", "Jakarta Selatan", "Jakarta Barat", "Jakarta Timur", "Jakarta Utara", "Kepulauan Seribu",
  "Bogor", "Kota Bogor", "Depok", "Tangerang", "Kota Tangerang", "Tangerang Selatan", "Bekasi", "Kota Bekasi",
  "Bandung", "Kota Bandung", "Cimahi", "Sumedang", "Garut", "Tasikmalaya", "Ciamis", "Cianjur", "Sukabumi", "Cirebon",
  "Semarang", "Kota Semarang", "Surakarta (Solo)", "Magelang", "Salatiga", "Purwokerto", "Cilacap", "Kebumen", "Tegal",
  "Yogyakarta", "Sleman", "Bantul", "Kulon Progo", "Gunungkidul",
  "Surabaya", "Malang", "Kota Malang", "Batu", "Sidoarjo", "Gresik", "Mojokerto", "Pasuruan", "Probolinggo", "Jember", "Banyuwangi", "Kediri", "Madiun",
  "Banda Aceh", "Lhokseumawe", "Medan", "Pematangsiantar", "Binjai", "Padang", "Bukittinggi", "Pekanbaru", "Dumai", "Batam", "Tanjungpinang", 
  "Jambi", "Palembang", "Lubuklinggau", "Bengkulu", "Bandar Lampung", "Metro", "Pangkal Pinang",
  "Pontianak", "Singkawang", "Banjarmasin", "Banjarbaru", "Palangkaraya", "Samarinda", "Balikpapan", "Bontang", "Tarakan",
  "Makassar", "Parepare", "Palopo", "Manado", "Bitung", "Tomohon", "Palu", "Kendari", "Gorontalo", "Mamuju",
  "Denpasar", "Badung", "Gianyar", "Mataram", "Kupang",
  "Ambon", "Tual", "Ternate", "Tidore", "Jayapura", "Kota Jayapura", "Merauke", "Mimika", "Sorong", "Manokwari"
].sort();

// VARIABEL RISET KEAHLIAN & PELATIHAN
export const SKILL_ACQUISITION_METHODS = [
  "Pendidikan Formal (Sekolah/Kuliah)",
  "Pelatihan Khusus Disabilitas (NGO/Komunitas)",
  "Pelatihan Umum (LKP/LPK/Kursus)",
  "Autodidak / Belajar Mandiri",
  "Pengalaman Kerja Langsung"
];

export const TRAINING_ACCESSIBILITY_SCORES = [
  { value: 1, label: "1 - Sangat Tidak Aksesibel" },
  { value: 2, label: "2 - Kurang Aksesibel" },
  { value: 3, label: "3 - Cukup" },
  { value: 4, label: "4 - Aksesibel" },
  { value: 5, label: "5 - Sangat Aksesibel (Materi Inklusif & Instruktur Paham)" }
];

export const SKILL_IMPACT_LEVELS = [
  "Sangat Berdampak (Membantu mendapat kerja/kenaikan posisi)",
  "Cukup Berdampak (Membantu pengerjaan tugas harian)",
  "Belum Berdampak (Hanya sekadar menambah wawasan)"
];
export const INCLUSIVE_JOB_TEMPLATE = `[STANDAR INKLUSIVITAS KERJA]

Kami percaya pada kesetaraan peluang bagi semua talenta. Instansi kami membuka pintu bagi rekan-rekan disabilitas untuk berkarya di posisi ini.

KOMITMEN AKOMODASI:
Kami menyediakan akomodasi layak yang mencakup (namun tidak terbatas pada):
1. Aksesibilitas Digital: Dokumen ramah pembaca layar (screen reader) dan sistem internal berbasis web yang aksesibel.
2. Lingkungan Fisik: Penyesuaian akses mobilitas di area kerja.
3. Dukungan Kerja: Pendampingan mentor atau penyesuaian instruksi kerja sesuai ragam disabilitas.

KUALIFIKASI KHUSUS:
Kami mengutamakan kandidat yang mandiri dalam penggunaan alat bantu mobilitas atau teknologi asistif masing-masing.

Informasi ini disediakan untuk mendukung transparansi rekrutmen dan riset inklusivitas di Indonesia.`;
