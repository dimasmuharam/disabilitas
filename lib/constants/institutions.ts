// /lib/constants/institutions.ts
import { PROVINCE_MAP } from './locations';

export const KEMENTERIAN_KOORDINATOR = [
  "Kementerian Koordinator Bidang Politik dan Keamanan",
  "Kementerian Koordinator Bidang Hukum, HAM, Imigrasi, dan Pemasyarakatan",
  "Kementerian Koordinator Bidang Perekonomian",
  "Kementerian Koordinator Bidang Pembangunan Manusia dan Kebudayaan",
  "Kementerian Koordinator Bidang Infrastruktur dan Pembangunan Kewilayahan",
  "Kementerian Koordinator Bidang Pemberdayaan Masyarakat",
  "Kementerian Koordinator Bidang Pangan"
];

export const KEMENTERIAN_TEKNIS = [
  "Kementerian Sekretariat Negara",
  "Kementerian Dalam Negeri",
  "Kementerian Luar Negeri",
  "Kementerian Pertahanan",
  "Kementerian Agama",
  "Kementerian Hukum",
  "Kementerian Hak Asasi Manusia",
  "Kementerian Imigrasi dan Pemasyarakatan",
  "Kementerian Keuangan",
  "Kementerian Pendidikan Dasar dan Menengah",
  "Kementerian Pendidikan Tinggi, Sains, dan Teknologi",
  "Kementerian Kebudayaan",
  "Kementerian Kesehatan",
  "Kementerian Sosial",
  "Kementerian Ketenagakerjaan",
  "Kementerian Pelindungan Pekerja Migran Indonesia/BNP2TKI",
  "Kementerian Perindustrian",
  "Kementerian Perdagangan",
  "Kementerian Energi dan Sumber Daya Mineral",
  "Kementerian Pekerjaan Umum",
  "Kementerian Perumahan dan Kawasan Permukiman",
  "Kementerian Desa dan Pembangunan Daerah Tertinggal",
  "Kementerian Transmigrasi",
  "Kementerian Perhubungan",
  "Kementerian Komunikasi dan Digital",
  "Kementerian Pertanian",
  "Kementerian Kehutanan",
  "Kementerian Kelautan dan Perikanan",
  "Kementerian Agraria dan Tata Ruang/BPN",
  "Kementerian Perencanaan Pembangunan Nasional/Bappenas",
  "Kementerian Pendayagunaan Aparatur Negara dan Reformasi Birokrasi",
  "Kementerian Badan Usaha Milik Negara",
  "Kementerian Kependudukan dan Pembangunan Keluarga/BKKBN",
  "Kementerian Lingkungan Hidup/Badan Pengendalian Lingkungan Hidup",
  "Kementerian Investasi dan Hilirisasi/BKPM",
  "Kementerian Koperasi",
  "Kementerian Usaha Mikro, Kecil, dan Menengah",
  "Kementerian Pariwisata",
  "Kementerian Ekonomi Kreatif/Badan Ekonomi Kreatif",
  "Kementerian Pemberdayaan Perempuan dan Perlindungan Anak",
  "Kementerian Pemuda dan Olahraga"
];

export const LEMBAGA_TINGGI_NEGARA = [
  "Kejaksaan Agung Republik Indonesia",
  "Tentara Nasional Indonesia (TNI)",
  "Kepolisian Negara Republik Indonesia (POLRI)",
  "Badan Intelijen Negara (BIN)",
  "Staf Kepresidenan (KSP)",
  "Kantor Komunikasi Kepresidenan",
  "Badan Strategis Percepatan Penanggulangan Kemiskinan",
  "Badan Gizi Nasional",
  "Badan Karantina Indonesia",
  "Badan Meteorologi, Klimatologi, dan Geofisika (BMKG)",
  "Badan Narkotika Nasional (BNN)",
  "Badan Nasional Penanggulangan Bencana (BNPB)",
  "Badan Nasional Penanggulangan Terorisme (BNPT)",
  "Badan Pencarian dan Pertolongan (BASARNAS)",
  "Badan Pengawas Obat dan Makanan (BPOM)",
  "Badan Riset dan Inovasi Nasional (BRIN)",
  "Badan Pusat Statistik (BPS)",
  "Arsip Nasional Republik Indonesia (ANRI)"
];

// Generate Daftar Pemerintah Provinsi
export const PEMDA_PROVINSI = Object.keys(PROVINCE_MAP).map(prov => `Pemprov ${prov}`);

// Generate Daftar Pemerintah Kota/Kabupaten
export const PEMDA_KAB_KOTA = Array.from(
  new Set(Object.values(PROVINCE_MAP).flat())
).map(city => `Pemda ${city}`);

// GABUNGAN SEMUA UNTUK GOVERNMENT_AGENCIES_LIST
export const ALL_GOV_INSTITUTIONS = [
  ...KEMENTERIAN_KOORDINATOR,
  ...KEMENTERIAN_TEKNIS,
  ...LEMBAGA_TINGGI_NEGARA,
  ...PEMDA_PROVINSI,
  ...PEMDA_KAB_KOTA
].sort();