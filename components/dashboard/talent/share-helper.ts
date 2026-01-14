import html2canvas from "html2canvas";

/**
 * Helper untuk menyusun teks caption yang profesional & persuasif
 */
const getShareCaption = (profile: any, url: string) => {
  const name = profile?.full_name || "Talenta Inklusif";
  const topSkills = Array.isArray(profile?.skills) && profile.skills.length > 0 
    ? profile.skills.slice(0, 2).join(" & ") 
    : "berbagai keahlian profesional";

  return `Halo rekan profesional! Saya bangga menjadi bagian dari #TalentaInklusif di disabilitas.com. 💪

Saya siap berkontribusi dan berkolaborasi dengan keahlian ${topSkills}. Mari kita bersama-sama membangun ekosistem kerja yang setara, aksesibel, dan bermartabat bagi semua.

Bagi rekan-rekan disabilitas lainnya, yuk tunjukkan kompetensi kalian dan bergabung di platform ini untuk raih peluang karir impian!

Cek profil profesional saya di sini: ${url}`;
};

/**
 * FUNGSI 1: Native Share (Utama untuk Mobile/HP)
 * Mendukung pengiriman Gambar Kartu Identitas + Teks
 */
export const handleNativeShare = async (userId: string, profile: any) => {
  const url = `https://disabilitas.com/talent/${userId}`;
  const name = profile?.full_name || "Talenta";
  const shareText = getShareCaption(profile, url);
  const targetElement = document.getElementById("inclusion-card-capture");

  try {
    if (!targetElement) throw new Error("Element card tidak ditemukan");

    // Potret kartu menjadi gambar
    const canvas = await html2canvas(targetElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    canvas.toBlob(async (blob) => {
      if (blob && navigator.share && navigator.canShare) {
        const file = new File([blob], `Inclusion_Card_${name.replace(/\s+/g, '_')}.png`, { type: "image/png" });
        
        // Cek apakah browser mendukung share file gambar
        if (navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: "Inclusion Identity Card",
              text: shareText,
            });
          } catch (err) {
            // Jika user cancel, buka WhatsApp sebagai fallback
            handleWhatsAppShare(userId, profile);
          }
        } else {
          // Jika browser mendukung share teks tapi bukan file
          await navigator.share({ title: "Inclusion Identity", text: shareText, url: url });
        }
      } else {
        // Fallback terakhir: Download gambar + Buka WA
        const dataUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `Inclusion_Card_${name}.png`;
        link.href = dataUrl;
        link.click();
        handleWhatsAppShare(userId, profile);
      }
    }, "image/png");
  } catch (error) {
    console.error("Share Error:", error);
    handleWhatsAppShare(userId, profile);
  }
};

/**
 * FUNGSI 2: WhatsApp Share (Khusus Desktop / PC)
 * Fokus pada pengiriman teks caption persuasif + Link Profil
 */
export const handleWhatsAppShare = (userId: string, profile: any) => {
  const url = `https://disabilitas.com/talent/${userId}`;
  const shareText = getShareCaption(profile, url);
  
  // Deteksi apakah sedang di desktop atau mobile untuk link WA yang tepat
  const waLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
  window.open(waLink, '_blank');
};