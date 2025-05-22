import type { NextApiRequest, NextApiResponse } from 'next';
import { generateTraining } from './generateTraining';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    // Datos de prueba
    const testData = {
      entrenamiento: {
        ubicacion: 'gimnasio',
        material: {
          pesas: true,
          bandas: true,
          maquinas: true,
          barras: true,
          otros: []
        },
        nivel: 'intermedio',
        diasEntrenamiento: 5,
        duracionSesion: 60,
        objetivos: ['ganar masa muscular', 'mejorar fuerza'],
        lesiones: [],
        preferencias: ['ejercicios compuestos']
      },
      edad: 30,
      peso: 75,
      altura: 175,
      sexo: 'masculino',
      objetivo: 'ganar masa muscular',
      actividadFisica: 'moderada'
    };

    // Activar modo de prueba
    process.env.TEST_MODE = 'true';

    const result = await generateTraining(testData);

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