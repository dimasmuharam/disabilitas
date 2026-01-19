import { supabase } from "@/lib/supabase";

/**
 * FUNGSI: Generate CV Profesional ke PDF
 * Lengkap dengan QR Code Verifikasi & Logo Instansi
 */
export const generateGovTalentPDF = async (profileId: string, govName: string, govLogoUrl?: string) => {
  // 1. Ambil data lengkap talenta
  const { data: p, error } = await supabase
    .from("profiles")
    .select(`*, work_experiences (*)`)
    .eq("id", profileId)
    .single();

  if (error || !p) {
    console.error("Data profil tidak ditemukan");
    return;
  }

  // 2. Load html2pdf secara dinamis agar tidak error di Server-Side (Next.js)
  // @ts-ignore
  const html2pdf = (await import("html2pdf.js")).default;

  // 3. Buat Container HTML secara temporer untuk dirender ke PDF
  const element = document.createElement("div");
  element.style.padding = "40px";
  element.style.background = "#fff";
  element.style.color = "#000";
  element.style.fontFamily = "'Inter', 'Helvetica', sans-serif";
  element.style.position = "relative"; // Penting untuk absolute positioning di dalam PDF
  element.style.minHeight = "290mm"; // Mendekati tinggi A4

  // URL Profil Publik untuk QR Code
  const publicProfileUrl = `https://disabilitas.com/talent/${p.id}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(publicProfileUrl)}`;

  element.innerHTML = `
    <style>
      .cv-container { width: 100%; max-width: 800px; margin: 0 auto; }
      .header-grid { display: grid; grid-template-cols: 100px auto 100px; gap: 20px; align-items: center; border-bottom: 4px solid #000; padding-bottom: 20px; }
      .gov-logo { width: 80px; height: 80px; object-fit: contain; }
      .platform-logo { width: 100px; object-fit: contain; }
      .header-center { text-align: center; }
      .header-center h2 { margin: 0; font-size: 16px; text-transform: uppercase; letter-spacing: 1px; font-weight: 900; }
      .header-center p { margin: 2px 0; font-size: 10px; color: #666; font-style: italic; font-weight: bold; }
      
      .main-title { text-align: center; margin: 30px 0; font-size: 24px; font-weight: 900; letter-spacing: 2px; text-decoration: underline; }
      
      .section-title { background: #000; color: #fff; padding: 5px 15px; font-size: 11px; font-weight: bold; text-transform: uppercase; margin-top: 25px; display: inline-block; }
      .data-row { display: grid; grid-template-cols: 180px 20px auto; margin-top: 10px; font-size: 12px; border-bottom: 1px solid #f0f0f0; padding-bottom: 4px; }
      
      .work-item { margin-top: 15px; border-left: 3px solid #000; padding-left: 15px; }
      .work-pos { font-weight: 900; font-size: 13px; text-transform: uppercase; }
      .work-comp { font-style: italic; font-size: 11px; color: #555; font-weight: bold; }
      
      .qr-section { position: absolute; bottom: 80px; right: 40px; text-align: center; }
      .qr-text { font-size: 8px; font-weight: 900; margin-top: 5px; text-transform: uppercase; line-height: 1.2; }
      
      .footer-note { position: absolute; bottom: 30px; left: 40px; right: 40px; font-size: 9px; color: #777; border-top: 2px solid #000; padding-top: 10px; text-align: center; font-weight: bold; }
    </style>

    <div class="cv-container">
      <div class="header-grid">
        <div>${govLogoUrl ? `<img src="${govLogoUrl}" class="gov-logo">` : '<div style="width:80px;"></div>'}</div>
        <div class="header-center">
          <h2>UNIT LAYANAN DISABILITAS</h2>
          <h2>${govName}</h2>
          <p>Sistem Informasi Talenta Inklusi Nasional</p>
        </div>
        <div style="text-align: right;"><img src="https://disabilitas.com/logo-black.png" class="platform-logo"></div>
      </div>

      <div class="main-title">CURRICULUM VITAE</div>

      <div class="section-title">Informasi Pribadi</div>
      <div class="data-row"><div>Nama Lengkap</div><div>:</div><div style="font-weight: 900; text-transform: uppercase;">${p.full_name}</div></div>
      <div class="data-row"><div>Ragam Disabilitas</div><div>:</div><div>${p.disability_type}</div></div>
      <div class="data-row"><div>Pendidikan Terakhir</div><div>:</div><div>${p.education_level} ${p.major || ''}</div></div>
      <div class="data-row"><div>Tahun Kelulusan</div><div>:</div><div>${p.graduation_date || '-'}</div></div>

      <div class="section-title">Ringkasan Karir</div>
      <p style="font-size: 11px; line-height: 1.6; margin-top: 10px; text-align: justify; font-weight: 500;">
        ${p.bio || 'Talenta yang berdedikasi tinggi dengan fokus pada kemandirian profesional dan pengembangan keahlian berkelanjutan.'}
      </p>

      <div class="section-title">Riwayat Pekerjaan</div>
      ${p.work_experiences?.length ? p.work_experiences.map((w: any) => `
        <div class="work-item">
          <div class="work-pos">${w.position}</div>
          <div class="work-comp">${w.company_name} | ${w.start_date} - ${w.is_current_work ? 'Sekarang' : w.end_date}</div>
          <div style="font-size: 10px; margin-top: 4px; color: #333;">${w.description || ''}</div>
        </div>
      `).join('') : '<p style="font-size: 11px; margin-top: 10px; font-style: italic;">Belum tercatat riwayat kerja formal.</p>'}

      <div class="section-title">Kompetensi & Keahlian</div>
      <div style="font-size: 11px; margin-top: 10px; line-height: 1.6; font-weight: bold;">
        ${p.skills?.length ? p.skills.join(' • ') : 'Keahlian teknis dan soft skills sesuai kompetensi bidang.'}
      </div>

      <div class="qr-section">
        <img src="${qrCodeUrl}" width="80" height="80">
        <div class="qr-text">Scan Verifikasi<br>Profil Talenta</div>
      </div>

      <div class="footer-note">
        Dokumen ini diterbitkan secara digital oleh sistem manajemen talenta disabilitas.com dan divalidasi oleh otoritas ${govName}.<br>
        Dicetak pada tanggal: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
      </div>
    </div>
  `;

  // 4. Konfigurasi Ekspor PDF - Perbaikan Type Error Margin
  const opt = {
    // Menggunakan Casting as [number, number, number, number] untuk memuaskan TypeScript
    margin: [0, 0, 0, 0] as [number, number, number, number],
    filename: `CV_ULD_${p.full_name.replace(/\s+/g, '_')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      useCORS: true,
      letterRendering: true
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait' as const 
    }
  };

  // 5. Eksekusi dengan ts-ignore untuk menghindari error pada method chain html2pdf
  try {
    // @ts-ignore
    await html2pdf().set(opt).from(element).save();
  } catch (err) {
    console.error("PDF Generation Error:", err);
  }
};