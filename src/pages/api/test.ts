import type { NextApiRequest, NextApiResponse } from 'next';
import { generatePlan } from './generatePlan';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const testData = {
    edad: 30,
    peso: 70,
    altura: 175,
    sexo: "masculino",
    objetivo: "perder peso",
    restricciones: ["sin gluten"],
    actividadFisica: "moderada",
    intensidadTrabajo: "sedentario",
    numeroComidas: 5
  };

  try {
    const result = await generatePlan(testData);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ 
      message: 'Error en la prueba', 
      details: error.message 
    });
  }
} 