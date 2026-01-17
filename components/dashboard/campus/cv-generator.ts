import { supabase } from "@/lib/supabase";

export const generateProfessionalCV = async (profileId: string) => {
  // Ambil data dari tabel profiles dan tabel work_experiences
  const { data: p, error } = await supabase
    .from("profiles")
    .select(`
      *,
      work_experiences (*)
    `)
    .eq("id", profileId)
    .single();

  if (error || !p) {
    console.error("Gagal mengambil data CV:", error);
    return;
  }

  const printWindow = window.open("", "_blank", "width=800,height=900");
  if (!printWindow) return;

  const cvHtml = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>CV_${p.full_name?.replace(/\s+/g, '_')}</title>
      <style>
        @media print { @page { margin: 2cm; } body { color: #000; } .no-print { display: none; } }
        body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 40px; color: #333; max-width: 800px; margin: auto; }
        header { border-bottom: 4px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
        h1 { margin: 0; text-transform: uppercase; font-size: 2.5rem; letter-spacing: -1px; }
        h2 { border-bottom: 2px solid #eee; padding-bottom: 5px; margin-top: 30px; text-transform: uppercase; font-size: 1.1rem; letter-spacing: 1px; }
        .contact-info { margin-top: 10px; font-size: 0.9rem; font-weight: bold; }
        .disability-tag { background: #000; color: #fff; padding: 2px 8px; font-size: 0.7rem; vertical-align: middle; margin-left: 10px; }
        .section { margin-bottom: 25px; }
        .item { margin-bottom: 15px; }
        .item-title { font-weight: 800; font-size: 1rem; }
        .item-sub { color: #666; font-style: italic; font-size: 0.85rem; margin-bottom: 5px; }
      </style>
    </head>
    <body>
      <header>
        <h1>${p.full_name || 'Talenta Inklusi'}</h1>
        <div class="contact-info">
          ${p.email} | ${p.phone || ''} | ${p.city || ''}
          <span class="disability-tag">${p.disability_type || 'Disabilitas'}</span>
        </div>
      </header>

      <section class="section">
        <h2>Ringkasan Profesional</h2>
        <p>${p.bio || 'Talenta yang memiliki dedikasi tinggi dan latar belakang akademik yang kuat.'}</p>
      </section>

      <section class="section">
        <h2>Latar Belakang Akademik</h2>
        <div class="item">
          <div class="item-title">${p.education_level || ''} ${p.major || ''}</div>
          <div class="item-sub">${p.university || 'Perguruan Tinggi'} | Tahun Lulus: ${p.graduation_date || 'N/A'}</div>
          <p style="font-size: 0.85rem;">Status Karir Saat Ini: <strong>${p.career_status}</strong></p>
        </div>
      </section>

      <section class="section">
        <h2>Pengalaman Kerja</h2>
        ${p.work_experiences?.length ? p.work_experiences.map((w: any) => `
          <div class="item">
            <div class="item-title">${w.position} di ${w.company_name}</div>
            <div class="item-sub">${w.start_date || ''} - ${w.is_current_work ? 'Sekarang' : w.end_date || ''} | ${w.company_location || ''}</div>
            <p style="font-size: 0.9rem;">${w.description || ''}</p>
          </div>
        `).join('') : '<p>Belum ada riwayat kerja formal yang tercatat.</p>'}
      </section>

      <section class="section">
        <h2>Keahlian & Kompetensi</h2>
        <p>${p.skills?.join(' • ') || 'Kompetensi disesuaikan dengan latar belakang program studi.'}</p>
      </section>

      <footer style="margin-top: 60px; font-size: 0.65rem; color: #aaa; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
        Dokumen CV ini dihasilkan secara resmi melalui sistem verifikasi kampus ${p.university || 'Mitra'} <br>
        Verified ID: ${p.id} | disabilitas.com
      </footer>

      <script>
        window.onload = function() { 
          setTimeout(() => { window.print(); }, 500);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(cvHtml);
  printWindow.document.close();
};