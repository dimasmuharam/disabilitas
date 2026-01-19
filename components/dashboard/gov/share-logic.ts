/**
 * Utility untuk menangani sharing performa inklusi wilayah
 */

interface ShareData {
  locationName: string;
  totalTalents: number;
  hiredTalents: number;
  hiredPercentage: string;
  url: string;
}

export const handleGovShare = async (data: ShareData) => {
  const { locationName, totalTalents, hiredTalents, hiredPercentage, url } = data;

  // 1. Susun Caption Viral (Template yang menggugah & profesional)
  const caption = `🇮🇩 AKSI NYATA INKLUSI: ${locationName.toUpperCase()}\n\n` +
    `Alhamdulillah, melalui ekosistem digital disabilitas.com, ULD ${locationName} terus berkomitmen mewujudkan kemandirian ekonomi.\n\n` +
    `📊 Progress Hari Ini:\n` +
    `• ${totalTalents} Talenta terverifikasi\n` +
    `• ${hiredTalents} Talenta telah terserap kerja (${hiredPercentage})\n\n` +
    `Mari berkolaborasi membangun ekosistem kerja yang setara. Cek profil inklusi wilayah kami di:\n${url}\n\n` +
    `#DisabilitasBisa #KerjaSetara #InklusiIndonesia #BRIN #TracerStudy`;

  // 2. Deteksi Fitur Native Share (Biasanya di Mobile/Tablet)
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
    // 3. Fallback untuk Desktop (Direct to WhatsApp Web)
    const encodedCaption = encodeURIComponent(caption);
    const whatsappUrl = `https://web.whatsapp.com/send?text=${encodedCaption}`;
    window.open(whatsappUrl, '_blank');
    return { success: true, method: 'whatsapp' };
  }
};