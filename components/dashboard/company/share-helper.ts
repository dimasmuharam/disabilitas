import html2canvas from "html2canvas";

/**
 * LOGIKA BERBAGI KARTU INKLUSI (SMART & VIRAL)
 */
export const handleShareInclusionCard = async (
  cardRef: React.RefObject<HTMLDivElement>, 
  company: any, 
  ratings: any,
  setIsProcessing: (val: boolean) => void,
  setAnnouncement: (msg: string) => void,
  mode: "native" | "whatsapp" = "native"
) => {
  if (!cardRef.current) return;
  
  setIsProcessing(true);
  setAnnouncement("Sedang memproses kartu inklusi instansi Anda...");

  try {
    const canvas = await html2canvas(cardRef.current, { 
      scale: 2, 
      useCORS: true, 
      backgroundColor: "#ffffff",
      logging: false 
    });

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    
    const url = `https://disabilitas.com/perusahaan/${company?.id}`;
    const score = ratings?.totalAvg ? ratings.totalAvg.toFixed(1) : "0.0";
    const caption = `Bangga! Instansi kami ${company?.name} memiliki Indeks Inklusi ${score}/5.0. Kami berkomitmen menciptakan ruang kerja yang aksesibel bagi semua talenta. Cek profil resmi kami di: ${url} #InklusiBisa #DisabilitasBisaWork #AksesibilitasTotal`;

    if (mode === "native" && blob && navigator.share) {
      const file = new File([blob], `Inclusion_Card_${company?.name}.png`, { type: "image/png" });
      await navigator.share({ 
        title: "Inclusion Identity Card", 
        text: caption, 
        files: [file] 
      });
    } else {
      // Fallback/Direct WhatsApp (Sangat berguna untuk Desktop)
      const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(caption)}`;
      window.open(waUrl, '_blank');
      setAnnouncement("Membuka WhatsApp untuk berbagi profil.");
    }
  } catch (err) {
    console.error("Share failed", err);
    setAnnouncement("Gagal memproses kartu inklusi.");
  } finally {
    setIsProcessing(false);
  }
};