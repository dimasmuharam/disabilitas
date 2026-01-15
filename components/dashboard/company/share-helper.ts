import html2canvas from "html2canvas";

/**
 * LOGIKA GENERATE & SHARE INCLUSION CARD
 * Memisahkan proses rendering gambar dari komponen UI Utama
 */
export const handleShareInclusionCard = async (
  cardRef: React.RefObject<HTMLDivElement>, 
  company: any, 
  ratings: any,
  setIsProcessing: (val: boolean) => void,
  setAnnouncement: (msg: string) => void
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
    const caption = `Bangga! Instansi kami memiliki Indeks Inklusi ${score}/5.0 di Disabilitas.com. Cek profil kami: ${url} #InklusiBisa #DisabilitasBisaWork`;

    if (blob && navigator.share) {
      const file = new File([blob], `Inclusion_Card_${company?.name || 'Instansi'}.png`, { type: "image/png" });
      await navigator.share({ 
        title: "Inclusion Identity Card", 
        text: caption, 
        files: [file] 
      });
      setAnnouncement("Berhasil membuka menu berbagi.");
    } else {
      // Fallback ke WhatsApp jika navigator.share tidak didukung
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(caption)}`, '_blank');
      setAnnouncement("Membuka WhatsApp untuk berbagi.");
    }
  } catch (err) {
    console.error("Share failed", err);
    setAnnouncement("Gagal memproses gambar kartu inklusi.");
  } finally {
    setIsProcessing(false);
  }
};