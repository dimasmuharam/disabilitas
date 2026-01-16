import { ImageResponse } from 'next/og';
import { supabase } from '@/lib/supabase';

export const runtime = 'edge';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return new Response('Missing ID', { status: 400 });

    // 1. Ambil data spesifik kampus tersebut
    const { data: campus } = await supabase
      .from('campuses')
      .select('name, location, inclusion_score, inclusion_score_physical, inclusion_score_digital, inclusion_score_output')
      .eq('id', id)
      .single();

    if (!campus) return new Response('Campus Not Found', { status: 404 });

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            backgroundColor: '#ffffff',
            padding: '60px',
            border: '20px solid #0f172a', // Slate 900
          }}
        >
          {/* SISI KIRI: IDENTITAS UTAMA */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
            <div style={{ backgroundColor: '#059669', color: 'white', padding: '10px 20px', borderRadius: '12px', fontSize: '20px', fontWeight: '900', width: 'fit-content', marginBottom: '20px' }}>
                CERTIFIED INCLUSIVE 2026
            </div>
            <div style={{ fontSize: '70px', fontWeight: '900', color: '#0f172a', lineHeight: 1, textTransform: 'uppercase', marginBottom: '10px' }}>
              {campus.name}
            </div>
            <div style={{ fontSize: '30px', color: '#64748b', fontWeight: 'bold', marginBottom: '40px' }}>
              {campus.location}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ fontSize: '100px', fontWeight: '900', color: '#059669', marginRight: '20px' }}>
                    {campus.inclusion_score}%
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>National</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a' }}>Inclusion Score</div>
                </div>
            </div>
          </div>

          {/* SISI KANAN: RADAR / BREAKDOWN SCORE */}
          <div style={{ display: 'flex', flexDirection: 'column', width: '350px', justifyContent: 'center', gap: '20px' }}>
            {[
              { label: 'FISIK', score: campus.inclusion_score_physical, color: '#059669' },
              { label: 'DIGITAL', score: campus.inclusion_score_digital, color: campus.inclusion_score_digital < 50 ? '#ea580c' : '#2563eb' },
              { label: 'OUTPUT', score: campus.inclusion_score_output, color: '#9333ea' }
            ].map((item) => (
              <div key={item.label} style={{ display: 'flex', flexDirection: 'column', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '24px', border: '4px solid #0f172a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: '900', color: '#64748b' }}>{item.label}</div>
                    <div style={{ fontSize: '24px', fontWeight: '900', color: item.color }}>{item.score}%</div>
                </div>
                <div style={{ width: '100%', height: '12px', backgroundColor: '#e2e8f0', borderRadius: '10px', marginTop: '10px', display: 'flex' }}>
                    <div style={{ width: `${item.score}%`, height: '100%', backgroundColor: item.color, borderRadius: '10px' }} />
                </div>
              </div>
            ))}
            
            <div style={{ marginTop: '20px', fontSize: '16px', fontWeight: 'bold', color: '#0f172a', textAlign: 'center', opacity: 0.5 }}>
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