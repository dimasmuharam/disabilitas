/**
 * Helper Lokal: Social Media & WhatsApp Sharing
 * Didesain untuk viralitas dan citra positif institusi
 */

interface ShareData {
  name: string;
  total: number;
  rate: number;
  score: number;
  url: string;
}

export const shareToWhatsApp = (data: ShareData) => {
  const caption = `*LAPORAN INKLUSI AKADEMIK 2026*%0A%0A*${data.name}* telah terverifikasi sebagai institusi inklusif di disabilitas.com.%0A%0A📊 *Statistik:*%0A- Mahasiswa Disabilitas: ${data.total} jiwa%0A- Employment Rate: ${data.rate}%%0A- Skor Inklusi: ${data.score}%%0A%0ACek selengkapnya: ${data.url}`;
  
  window.open(`https://wa.me/?text=${caption}`, "_blank");
};

export const shareNative = async (data: ShareData) => {
  const text = `[ACADEMIC REPORT 2026] ${data.name} berkomitmen mendukung pendidikan inklusif. Skor Inklusi kami: ${data.score}%. Cek di disabilitas.com!`;
  
  try {
    if (navigator.share) {
      await navigator.share({
        title: data.name,
        text: text,
        url: data.url,
      });
    } else {
      shareToWhatsApp(data);
    }
  } catch (err) {
    console.log("Native share cancelled or failed");
  }
};