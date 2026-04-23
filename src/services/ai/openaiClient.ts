export interface RouteCommentaryInput {
  mobilityProfile: string;
  inclusivityIndex: number;
  barrierCount: number;
  barrierTypeCounts: Record<string, number>;
  distance: string;
  duration: string;
  warnings: string[];
}

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const MODEL = 'gpt-4o-mini';

function formatBarrierTypeCounts(counts: Record<string, number>): string {
  const entries = Object.entries(counts).filter(([, value]) => value > 0);
  if (entries.length === 0) return 'Maneə növü aşkarlanmadı.';
  return entries.map(([key, value]) => `${key}: ${value}`).join(', ');
}

export async function getRouteCommentary(input: RouteCommentaryInput): Promise<string | null> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) return null;

  const prompt = [
    'Aşağıdakı marşrut məlumatına əsasən Azərbaycan dilində 2-3 cümləlik şəxsiləşdirilmiş şərh yaz.',
    'Üslub praktiki və aydın olsun, istifadəçiyə ehtiyat məqamlarını bildir.',
    'Qısa yaz, marker və siyahı istifadə etmə.',
    '',
    `Mobillik profili: ${input.mobilityProfile}`,
    `İnkluzivlik indeksi: ${input.inclusivityIndex}`,
    `Maneə sayı: ${input.barrierCount}`,
    `Maneə növləri: ${formatBarrierTypeCounts(input.barrierTypeCounts)}`,
    `Məsafə: ${input.distance}`,
    `Müddət: ${input.duration}`,
    `Xəbərdarlıqlar: ${input.warnings.length > 0 ? input.warnings.join(' | ') : 'Yoxdur'}`,
  ].join('\n');

  try {
    const response = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.4,
        messages: [
          {
            role: 'system',
            content:
              'Sən AURA üçün inkluziv marşrut köməkçisisən. Cavab yalnız Azərbaycan dilində 2-3 cümlə olsun.',
          },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!response.ok) return null;
    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content?.trim();
    return content && content.length > 0 ? content : null;
  } catch {
    return null;
  }
}
