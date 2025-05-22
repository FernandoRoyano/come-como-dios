import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: 'Hola, ¿cómo estás?' }],
      temperature: 0.7,
      max_tokens: 100,
    });

    const content = completion.choices[0].message?.content || '';
    res.status(200).json({ message: content });
  } catch (error: unknown) {
    console.error('Error en la prueba:', error instanceof Error ? error.message : 'Error desconocido');
    res.status(500).json({ 
      message: 'Error en la prueba de IA.',
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
} 