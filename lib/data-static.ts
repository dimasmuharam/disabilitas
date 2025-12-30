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
  "Sekolah Inklusi",
  "Sekolah Reguler",
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
  // Jabodetabek
  "Jakarta Pusat", "Jakarta Selatan", "Jakarta Barat", "Jakarta Timur", "Jakarta Utara", "Kepulauan Seribu",
  "Bogor", "Kota Bogor", "Depok", "Tangerang", "Kota Tangerang", "Tangerang Selatan", "Bekasi", "Kota Bekasi",
  // Jawa & DIY
  "Bandung", "Kota Bandung", "Cimahi", "Sumedang", "Garut", "Tasikmalaya", "Ciamis", "Cianjur", "Sukabumi", "Cirebon",
  "Semarang", "Kota Semarang", "Surakarta (Solo)", "Magelang", "Salatiga", "Purwokerto", "Cilacap", "Kebumen", "Tegal",
  "Yogyakarta", "Sleman", "Bantul", "Kulon Progo", "Gunungkidul",
  "Surabaya", "Malang", "Kota Malang", "Batu", "Sidoarjo", "Gresik", "Mojokerto", "Pasuruan", "Probolinggo", "Jember", "Banyuwangi", "Kediri", "Madiun",
  // Sumatera
  "Banda Aceh", "Lhokseumawe", "Medan", "Pematangsiantar", "Binjai", "Padang", "Bukittinggi", "Pekanbaru", "Dumai", "Batam", "Tanjungpinang", 
  "Jambi", "Palembang", "Lubuklinggau", "Bengkulu", "Bandar Lampung", "Metro", "Pangkal Pinang",
  // Kalimantan
  "Pontianak", "Singkawang", "Banjarmasin", "Banjarbaru", "Palangkaraya", "Samarinda", "Balikpapan", "Bontang", "Tarakan",
  // Sulawesi
  "Makassar", "Parepare", "Palopo", "Manado", "Bitung", "Tomohon", "Palu", "Kendari", "Gorontalo", "Mamuju",
  // Bali & Nusa Tenggara
  "Denpasar", "Badung", "Gianyar", "Mataram", "Kupang",
  // Maluku & Papua
  "Ambon", "Tual", "Ternate", "Tidore", "Jayapura", "Kota Jayapura", "Merauke", "Mimika", "Sorong", "Manokwari"
].sort();

export const UNIVERSITIES = [
  "Universitas Indonesia (UI)", "Universitas Gadjah Mada (UGM)", "Institut Teknologi Bandung (ITB)", 
  "Institut Pertanian Bogor (IPB)", "Universitas Brawijaya (UB)", "Universitas Airlangga (UNAIR)", 
  "Universitas Padjadjaran (UNPAD)", "Universitas Diponegoro (UNDIP)", "Institut Teknologi Sepuluh Nopember (ITS)", 
  "Universitas Sebelas Maret (UNS)", "Universitas Hasanuddin (UNHAS)", "Universitas Sumatera Utara (USU)", 
  "Universitas Andalas (UNAND)", "Universitas Sriwijaya (UNSRI)", "Universitas Lampung (UNILA)",
  "Universitas Syiah Kuala (USK)", "Universitas Riau (UNRI)", "Universitas Jambi (UNJA)", 
  "Universitas Bengkulu (UNIB)", "Universitas Tanjungpura (UNTAN)", "Universitas Lambung Mangkurat (ULM)",
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
export const INCLUSIVE_JOB_TEMPLATE = `[STANDAR INKLUSIVITAS KERJA]

Kami percaya pada kesetaraan peluang bagi semua talenta. Instansi kami membuka pintu bagi rekan-rekan disabilitas untuk berkarya di posisi ini.

KOMITMEN AKOMODASI:
Kami menyediakan akomodasi layak yang mencakup (namun tidak terbatas pada):
1. Aksesibilitas Digital: Dokumen ramah pembaca layar (screen reader) dan sistem internal berbasis web yang aksesibel.
2. Lingkungan Fisik: (Contoh: Ramp kursi roda, toilet aksesibel, atau ruang kerja tenang).
3. Dukungan Kerja: (Contoh: Jam kerja fleksibel, penyediaan Juru Bahasa Isyarat untuk rapat penting, atau pendampingan mentor).

KUALIFIKASI KHUSUS:
Kami mengutamakan kandidat yang mandiri dalam penggunaan alat bantu mobilitas atau teknologi asistif masing-masing.

Informasi ini disediakan untuk mendukung transparansi rekrutmen dan riset inklusivitas di Indonesia.`;
