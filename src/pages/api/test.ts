import type { NextApiRequest, NextApiResponse } from 'next';
import { generateTraining } from './generateTraining';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    // Activar modo de prueba
    process.env.TEST_MODE = 'true';

    const result = await generateTraining(req.body);

    // Desactivar modo de prueba
    process.env.TEST_MODE = 'false';

    res.status(200).json(result);
  } catch (error: unknown) {
    console.error('Error en prueba:', error);
    res.status(500).json({ 
      message: 'Error en la prueba', 
      details: error instanceof Error ? error.message : 'Error desconocido'
    });
  }
}