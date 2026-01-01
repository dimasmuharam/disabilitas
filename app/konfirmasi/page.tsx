// Tambahkan logika pesan ini di dalam ConfirmContent()
const getMessage = (role: string, name: string) => {
  const sapaan = `Halo, ${name || "User"}!`;
  
  switch(role) {
    case 'company':
      return {
        title: "Akses Bisnis Aktif",
        desc: `${sapaan} Akun perusahaan Anda telah siap. Mulai temukan talenta disabilitas terbaik untuk memperkuat inklusivitas bisnis Anda.`,
        btn: "Masuk ke Dashboard Bisnis"
      };
    case 'government':
      return {
        title: "Otoritas Diverifikasi",
        desc: `${sapaan} Akun instansi pemerintah Anda telah aktif. Akses data monitoring dan kebijakan inklusif sekarang.`,
        btn: "Buka Panel Monitoring"
      };
    case 'campus_partner':
      return {
        title: "Kemitraan Aktif",
        desc: `${sapaan} Akun mitra pendidikan Anda telah diverifikasi. Mari mulai sinkronisasi data lulusan dan peluang karir.`,
        btn: "Masuk ke Portal Mitra"
      };
    default: // Talent
      return {
        title: "Akun Talenta Aktif",
        desc: `${sapaan} Selamat bergabung! Akun Anda telah aktif. Mari lengkapi profil profesional Anda untuk menarik perhatian perekrut.`,
        btn: "Lengkapi Profil Sekarang"
      };
  }
};
