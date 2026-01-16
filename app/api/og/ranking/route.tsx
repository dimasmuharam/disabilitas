import { ImageResponse } from 'next/og';
import { supabase } from '@/lib/supabase';

export const runtime = 'edge';

export async function GET() {
  try {
    // 1. Ambil TOP 3 Kampus untuk ditampilkan di gambar
    const { data: topCampuses } = await supabase
      .from('campuses')
      .select('name, inclusion_score')
      .order('inclusion_score', { ascending: false })
      .limit(3);

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'center',
            backgroundColor: '#059669', // Emerald 600
            padding: '80px',
            borderBottom: '20px solid #0f172a', // Slate 900
          }}
        >
          {/* Logo / Header Area */}
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
            <div style={{ 
              backgroundColor: '#facc15', 
              padding: '10px 20px', 
              borderRadius: '12px',
              fontSize: '24px',
              fontWeight: '900',
              textTransform: 'uppercase',
              marginRight: '20px',
              border: '4px solid #0f172a'
            }}>
              Index 2026
            </div>
            <div style={{ fontSize: '32px', color: 'white', fontWeight: 'bold', letterSpacing: '0.1em' }}>
              DISABILITAS.COM
            </div>
          </div>

          {/* Main Title */}
          <div style={{ 
            fontSize: '80px', 
            fontWeight: '900', 
            color: 'white', 
            lineHeight: 1, 
            marginBottom: '60px',
            fontStyle: 'italic',
            textTransform: 'uppercase'
          }}>
            Top 50 Kampus <br /> Inklusif Indonesia
          </div>

          {/* Rankings Display */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
            {topCampuses?.map((campus, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                backgroundColor: 'white', 
                padding: '20px 40px', 
                borderRadius: '24px',
                border: '6px solid #0f172a',
                boxShadow: '10px 10px 0px 0px #0f172a'
              }}>
                <div style={{ fontSize: '40px', fontWeight: '900', marginRight: '30px', color: '#059669' }}>
                  #{index + 1}
                </div>
                <div style={{ fontSize: '36px', fontWeight: '800', flex: 1, color: '#0f172a', textTransform: 'uppercase' }}>
                  {campus.name}
                </div>
                <div style={{ fontSize: '36px', fontWeight: '900', color: '#059669' }}>
                  {campus.inclusion_score}%
                </div>
              </div>
            ))}
          </div>

          {/* Footer Branding */}
          <div style={{ marginTop: 'auto', display: 'flex', width: '100%', justifyContent: 'flex-end' }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'rgba(255,255,255,0.6)', letterSpacing: '0.2em' }}>
              WWW.DISABILITAS.COM
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      },
    );
  } catch (e: any) {
    return new Response(`Failed to generate image`, { status: 500 });
  }
}