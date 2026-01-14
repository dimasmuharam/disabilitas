import html2canvas from "html2canvas";

/**
 * Menyusun Caption Viral & Inspiratif untuk Partner
 */
const getPartnerCaption = (partner: any, stats: any) => {
  return `Bangga berkontribusi untuk masa depan Indonesia yang setara! 🇮🇩✨

Melalui sinergi bersama disabilitas.com, kami di ${partner?.name} telah berkomitmen penuh sebagai mitra penyedia pelatihan inklusif. Hingga saat ini, kami telah memberdayakan ${stats.total} talenta disabilitas dengan tingkat keterserapan kerja mencapai ${stats.rate}%.

Ini bukan sekadar angka, melainkan langkah nyata dalam membuka gerbang kesempatan bagi setiap orang untuk mandiri dan bermartabat secara ekonomi. 💼💪

Bagi lembaga atau instansi lainnya, mari bergabung di ekosistem inklusi terbesar di Indonesia! Bersama kita wujudkan aksesibilitas tanpa batas.

Pantau rekam jejak dampak kami di: https://disabilitas.com/partner/${partner?.id}

#TalentaInklusif #IndonesiaAksesibel #KemitraanStrategis #SDGs #DisabilitasBisa #EqualOpportunity`;
};

/**
 * Share Native (HP) dengan File Gambar
 */
export const handlePartnerNativeShare = async (partner: any, stats: any) => {
  const target = document.getElementById("partner-impact-card");
  const caption = getPartnerCaption(partner, stats);

  try {
    if (!target) throw new Error("Card element not found");
    
    const canvas = await html2canvas(target, { 
      scale: 2, 
      useCORS: true, 
      backgroundColor: "#ffffff",
      logging: false 
    });

    canvas.toBlob(async (blob) => {
      if (blob && navigator.share && navigator.canShare) {
        const file = new File([blob], `Impact_Card_${partner?.name?.replace(/\s+/g, '_')}.png`, { type: "image/png" });
        
        if (navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: "Disability Impact Card",
              text: caption,
            });
          } catch (err) {
            handlePartnerWhatsAppShare(partner, stats);
          }
        } else {
          await navigator.share({ title: "Impact Card", text: caption });
        }
      } else {
        handlePartnerWhatsAppShare(partner, stats);
      }
    }, "image/png");
  } catch (e) {
    console.error("Capture failed:", e);
    handlePartnerWhatsAppShare(partner, stats);
  }
};

/**
 * Share WhatsApp (PC & Fallback)
 */
export const handlePartnerWhatsAppShare = (partner: any, stats: any) => {
  const caption = getPartnerCaption(partner, stats);
  const waLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(caption)}`;
  window.open(waLink, '_blank');
};