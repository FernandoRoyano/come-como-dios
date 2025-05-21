import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { generatePrompt } from '@/lib/generatePrompt';
import { validatePlan } from '@/lib/validatePlan';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

interface PlanData {
  edad: number;
  peso: number;
  altura: number;
  sexo: string;
  objetivo: string;
  restricciones: string[];
  actividadFisica: string;
  intensidadTrabajo: string;
  numeroComidas: number;
}

export async function generatePlan(data: PlanData) {
  const prompt = generatePrompt(data);

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
    console.error('Contenido recibido:', content);
    throw new Error('No se encontraron los delimitadores de JSON esperados.');
  }

  const jsonString = content.slice(start + 17, end).trim();

  // Limpiar posibles comentarios o caracteres no válidos
  const cleanJsonString = jsonString
    .replace(/\/\/.*$/gm, '') // Eliminar comentarios de una línea
    .replace(/\/\*[\s\S]*?\*\//g, '') // Eliminar comentarios multilínea
    .replace(/,(\s*[}\]])/g, '$1') // Eliminar comas trailing
    .replace(/\n/g, ' ') // Eliminar saltos de línea
    .replace(/\r/g, '') // Eliminar retornos de carro
    .replace(/\t/g, ' ') // Eliminar tabulaciones
    .replace(/\[\.\.\.\]/g, '[]') // Reemplazar [...] con []
    .replace(/\.\.\./g, ''); // Eliminar otros puntos suspensivos

  try {
    const parsed = JSON.parse(cleanJsonString);
    validatePlan(parsed);
    return { plan: parsed };
  } catch (parseError: any) {
    console.error('Error parseando JSON:', parseError);
    console.error('JSON recibido:', cleanJsonString);
    throw new Error(`Error en el formato JSON del plan generado: ${parseError.message}`);
  }
}

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

  const camposRequeridos = {
    edad: 'Edad',
    peso: 'Peso',
    altura: 'Altura',
    sexo: 'Sexo',
    objetivo: 'Objetivo',
    actividadFisica: 'Actividad física',
    intensidadTrabajo: 'Intensidad del trabajo',
    numeroComidas: 'Número de comidas'
  };

  const camposFaltantes = Object.entries(camposRequeridos)
    .filter(([key]) => !req.body[key])
    .map(([_, label]) => label);

  if (camposFaltantes.length > 0) {
    return res.status(400).json({
      message: 'Faltan campos requeridos',
      campos: camposFaltantes
    });
  }

  if (typeof edad !== 'number' || typeof peso !== 'number' || typeof altura !== 'number') {
    return res.status(400).json({
      message: 'Los campos edad, peso y altura deben ser números'
    });
  }

  if (typeof numeroComidas !== 'number' || numeroComidas < 3 || numeroComidas > 6) {
    return res.status(400).json({
      message: 'El número de comidas debe ser un número entre 3 y 6'
    });
  }

  try {
    const result = await generatePlan({
      edad,
      peso,
      altura,
      sexo,
      objetivo,
      restricciones: Array.isArray(restricciones) ? restricciones : [],
      actividadFisica,
      intensidadTrabajo,
      numeroComidas,
    });

    res.status(200).json(result);
  } catch (error: any) {
    console.error('❌ Error al generar o parsear el plan:', error.message);
    res.status(500).json({ 
      message: 'Error generando el plan con IA.', 
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
