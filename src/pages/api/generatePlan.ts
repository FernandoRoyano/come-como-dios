import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { generatePrompt } from '@/lib/generatePrompt';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const {
    edad,
    peso,
    altura,
    sexo,
    objetivo,
    restricciones,
    actividadFisica,
    intensidadTrabajo,
    numeroComidas,
  } = req.body;

  const prompt = generatePrompt({
    edad,
    peso,
    altura,
    sexo,
    objetivo,
    restricciones,
    actividadFisica,
    intensidadTrabajo,
    numeroComidas,
  });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4096,
    });

    const content = completion.choices[0].message?.content || '';

    // Extraer solo el bloque JSON entre los delimitadores definidos
    const start = content.indexOf('###JSON_START###');
    const end = content.indexOf('###JSON_END###');

    if (start === -1 || end === -1) {
      throw new Error('No se encontraron los delimitadores de JSON esperados.');
    }

    const jsonString = content.slice(start + 17, end).trim();
    const parsed = JSON.parse(jsonString);

    if (!Array.isArray(parsed.dias) || parsed.dias.length < 7) {
      throw new Error('⚠️ El plan no contiene los 7 días completos.');
    }

    res.status(200).json({ plan: parsed });
  } catch (error: any) {
    console.error('❌ Error al generar o parsear el plan:', error.message);
    res.status(500).json({ message: 'Error generando el plan con IA. Detalles: ' + error.message });
  }
}
