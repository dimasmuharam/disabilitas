/**
 * Utility untuk menangani sharing performa inklusi wilayah
 * Mendukung mode Media Sosial (Viral) dan mode Laporan Formal (Pimpinan)
 */

interface ShareData {
  locationName: string;
  totalTalents: number;
  hiredTalents: number;
  hiredPercentage: string;
  url: string;
  mode?: 'viral' | 'formal'; // Tambahan mode
}

export const handleGovShare = async (data: ShareData) => {
  const { locationName, totalTalents, hiredTalents, hiredPercentage, url, mode = 'viral' } = data;

  let caption = "";

  if (mode === 'formal') {
    // TEMPLATE FORMAL: Untuk dikirim ke WhatsApp Grup Kedinasan / Atasan
    caption = `Yth. Pimpinan,\n\n` +
      `Melaporkan perkembangan Program Penguatan Ekosistem Inklusi di wilayah ${locationName}:\n\n` +
      `1. Total Talenta Terdata: ${totalTalents} Orang\n` +
      `2. Talenta Terserap Kerja: ${hiredTalents} Orang\n` +
      `3. Persentase Keterserapan: ${hiredPercentage}\n\n` +
      `Data lengkap dapat dipantau secara real-time melalui dashboard ULD di tautan berikut:\n${url}\n\n` +
      `Demikian laporan ini disampaikan untuk menjadi periksa. Terima kasih.\n\n` +
      `#ULD${locationName.replace(/\s+/g, '')} #LaporanInklusi`;
  } else {
    // TEMPLATE VIRAL: Untuk Media Sosial (Branding)
    caption = `🇮🇩 AKSI NYATA INKLUSI: ${locationName.toUpperCase()}\n\n` +
      `Alhamdulillah, melalui ekosistem digital disabilitas.com, ULD ${locationName} terus berkomitmen mewujudkan kemandirian ekonomi.\n\n` +
      `📊 Progress Hari Ini:\n` +
      `• ${totalTalents} Talenta terverifikasi\n` +
      `• ${hiredTalents} Talenta telah terserap kerja (${hiredPercentage})\n\n` +
      `Mari berkolaborasi membangun ekosistem kerja yang setara. Cek profil inklusi wilayah kami di:\n${url}\n\n` +
      `#DisabilitasBisa #KerjaSetara #InklusiIndonesia #BRIN #TracerStudy`;
  }

  // 1. Deteksi Fitur Native Share (Utama untuk Mobile)
  if (navigator.share) {
    try {
      await navigator.share({
        title: `Laporan Inklusi ${locationName}`,
        text: caption,
        url: url,
      });
      return { success: true, method: 'native' };
    } catch (err) {
      console.log("User cancelled share");
      return { success: false };
    }
  } else {
    // 2. Fallback WhatsApp Universal (Bekerja di Web & Mobile)
    const encodedCaption = encodeURIComponent(caption);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedCaption}`;
    window.open(whatsappUrl, '_blank');
    return { success: true, method: 'whatsapp' };
  }
};