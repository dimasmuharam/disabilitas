// File: lib/data-static.ts
// Deskripsi: Basis data statis komprehensif untuk sinkronisasi riset disabilitas.com
// Aturan: Menggunakan format string bersih, menghindari tanda kutip ganda dalam teks narasi.

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

// BARU: KATEGORI KARIR UNTUK MONITORING ASN & INDUSTRI
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

// KATEGORI PEMBERI KERJA (Ringkas & Strategis)
export const EMPLOYER_CATEGORIES = [
  "Instansi Pemerintah (ASN)",
  "Perusahaan Swasta",
  "BUMN dan BUMD",
  "Lembaga Nonprofit",
  "Lainnya"
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
  "Rumah Zakat"
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
  "universitas",
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
  "Jarak Sekolah Terlalu Jauh",
  "Ditolak oleh Pihak Sekolah",
  "Fasilitas Sekolah Tidak Aksesibel",
  "Kurangnya Tenaga Pendidik Khusus",
  "Masalah Kesehatan",
  "Fokus Bekerja",
  "Faktor Lingkungan / Bullying"
].sort();

export const ACCOMMODATION_TYPES = [
  "Materi Format Braille / Audio",
  "Pendampingan Juru Bahasa Isyarat",
  "Waktu Ujian / Kerja Tambahan",
  "Aksesibilitas Fisik (Ramp/Lift)",
  "Modifikasi Kurikulum / Tugas",
  "Software Alat Bantu (Screen Reader)",
  "Ruang Kerja / Belajar Tenang (Sensory)",
  "Lampu Penerangan Tinggi (Low Vision)"
].sort();

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

// BARU: LIST INSTANSI PEMERINTAH (UNTUK TARGET LOCK GOV DASHBOARD)
export const GOVERNMENT_AGENCIES = [
  "Kementerian Keuangan",
  "Kementerian Pendidikan, Kebudayaan, Riset, dan Teknologi",
  "Kementerian Sosial",
  "Kementerian Ketenagakerjaan",
  "Badan Kepegawaian Negara (BKN)",
  "Kementerian PAN-RB",
  "BRIN",
  "Pemerintah Provinsi Jakarta",
  "Pemerintah Provinsi Jawa Tengah",
  "Kementerian Kesehatan",
  "Kementerian Hukum dan HAM"
].sort();

// KATEGORI 1: PERGURUAN TINGGI
export const UNIVERSITIES = [
  "Universitas Indonesia (UI)", "Universitas Gadjah Mada (UGM)", "Institut Teknologi Bandung (ITB)", 
  "Institut Pertanian Bogor (IPB)", "Universitas Brawijaya (UB)", "Universitas Airlangga (UNAIR)", 
  "Universitas Padjadjaran (UNPAD)", "Universitas Diponegoro (UNDIP)", "Institut Teknologi Sepuluh Nopember (ITS)", 
  "Universitas Sebelas Maret (UNS)", "Universitas Hasanuddin (UNHAS)", "Universitas Sumatera Utara (USU)", 
  "Universitas Andalas (UNAND)", "Universitas Sriwijaya (UNSRI)", "Universitas Lampung (UNILA)",
  "Universitas Syiah Kuala (USK)", "Universitas Riau (UNRI)", "Universitas Jambi (UNJA)", 
  "Universitas Bengkulu (UNIB)", "Universitas Tanjungpura (UNTAN)", "Universitas Lambung Makurat (ULM)",
  "Universitas Mulawarman (UNMUL)", "Universitas Sam Ratulangi (UNSRAT)", "Universitas Tadulako (UNTAD)",
  "Universitas Halu Oleo (UHO)", "Universitas Negeri Gorontalo (UNG)", "Universitas Negeri Jakarta (UNJ)",
  "Universitas Pendidikan Indonesia (UPI)", "Universitas Negeri Yogyakarta (UNY)", "Universitas Negeri Semarang (UNNES)",
  "Universitas Negeri Malang (UM)", "Universitas Negeri Surabaya (UNESA)", "Universitas Negeri Makassar (UNM)",
  "Universitas Negeri Medan (UNIMED)", "Universitas Negeri Padang (UNP)", "Universitas Udayana (UNUD)",
  "Universitas Mataram (UNRAM)", "Universitas Nusa Cendana (UNDANA)", "Universitas Pattimura (UNPATTI)",
  "Universitas Cendrawasih (UNCEN)", "Universitas Terbuka (UT)",
  "UIN Syarif Hidayatullah Jakarta", "UIN Sunan Kalijaga Yogyakarta", "UIN Sunan Ampel Surabaya", 
  "UIN Maulana Malik Ibrahim Malang", "UIN Alauddin Makassar", "UIN Raden Fatah Palembang", "UIN Ar-Raniry Banda Aceh",
  "Universitas Telkom (Tel-U)", "Universitas Bina Nusantara (Binus)", "Universitas Muhammadiyah Yogyakarta (UMY)",
  "Universitas Muhammadiyah Malang (UMM)", "Universitas Muhammadiyah Surakarta (UMS)", "Universitas Islam Indonesia (UII)",
  "Universitas Katolik Parahyangan (Unpar)", "Universitas Katolik Indonesia Atma Jaya", "Universitas Trisakti",
  "Universitas Tarumanagara (Untar)", "Universitas Pelita Harapan (UPH)", "Universitas Mercu Buana",
  "Universitas Gunadarma", "Universitas Kristen Satya Wacana (UKSW)", "Universitas Pasundan (Unpas)"
].sort();

// KATEGORI 2: LEMBAGA PELATIHAN & PEMERINTAH (TRAINING PARTNERS)
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
  "Mitra Lembaga Latihan Kerja (LLK) Daerah"
].sort();

// KATEGORI 3: ORGANISASI & KOMUNITAS DISABILITAS (COMMUNITY PARTNERS)
export const COMMUNITY_PARTNERS = [
  "Forum ASN Inklusif",
  "Konekin (Koneksi Inklusi)",
  "Kartunet (Karya Tunanetra)",
  "Persatuan Tuna Netra Indonesia (PERTUNI)",
  "Gerakan Kesejahteraan Tuna Rungu Indonesia (GERKATIN)",
  "Himpunan Wanita Disabilitas Indonesia (HWDI)",
  "Persatuan Penyandang Disabilitas Indonesia (PPDI)",
  "Yayasan Pembinaan Anak Cacat (YPAC)",
  "Diffalink",
  "Dnetwork",
  "Kerjabilitas",
  "Paradifa",
  "Sigab Indonesia",
  "Pusat Layanan Disabilitas (PLD) Kampus"
].sort();

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
