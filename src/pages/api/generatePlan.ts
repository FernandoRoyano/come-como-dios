import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { generatePrompt } from '@/lib/generatePrompt';
import { validatePlan } from '@/lib/validatePlan';
import { Plan, PlanData } from '@/types/plan';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

function calcularCaloriasDiarias({ peso, altura, edad, sexo, actividadFisica, objetivo }: { peso: number; altura: number; edad: number; sexo: string; actividadFisica: string; objetivo: string }): number {
  // Ecuación de Mifflin-St Jeor para TMB
  const tmb = sexo === 'masculino'
    ? 10 * peso + 6.25 * altura - 5 * edad + 5
    : 10 * peso + 6.25 * altura - 5 * edad - 161;

  // Factores de actividad física más específicos
  const factoresActividad: { [key: string]: number } = {
    'sedentario': 1.2,
    'ligero': 1.375,
    'moderado': 1.55,
    'activo': 1.725,
    'muy activo': 1.9
  };

  const factorActividad = factoresActividad[actividadFisica.toLowerCase()] || 1.2; // Por defecto, sedentario

  // Calorías base según actividad física
  let calorias = tmb * factorActividad;

  // Ajustes según el objetivo del usuario
  if (objetivo.toLowerCase() === 'perder peso') {
    calorias -= 500; // Déficit calórico típico
  } else if (objetivo.toLowerCase() === 'ganar músculo') {
    calorias += 500; // Superávit calórico típico
  }

  // Validaciones adicionales para garantizar un rango razonable
  if (calorias < 1200) {
    console.warn('Calorías calculadas demasiado bajas, ajustando a 1200.');
    calorias = 1200;
  } else if (calorias > 4000) {
    console.warn('Calorías calculadas demasiado altas, ajustando a 4000.');
    calorias = 4000;
  }

  return Math.round(calorias);
}

export async function generatePlan(data: PlanData) {
  const caloriasRecomendadas = calcularCaloriasDiarias({
    peso: data.peso,
    altura: data.altura,
    edad: data.edad,
    sexo: data.sexo,
    actividadFisica: data.actividadFisica,
    objetivo: data.objetivo
  });

  console.warn('Calorías diarias recomendadas calculadas:', caloriasRecomendadas);

  const prompt = generatePrompt({ ...data, caloriasRecomendadas });

  const completion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 4096
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

  try {
    const parsed = JSON.parse(jsonString) as Plan;
    validatePlan(parsed);
    return { plan: parsed };
  } catch (parseError: unknown) {
    console.error('Error parseando JSON:', parseError);
    console.error('JSON recibido:', jsonString);
    throw new Error(`Error en el formato JSON del plan generado: ${parseError instanceof Error ? parseError.message : 'Error desconocido'}`);
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
    .map(([, label]) => label);

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
      servicios: { nutricion: true, entrenamiento: false },
      edad,
      peso,
      altura,
      sexo,
      objetivo,
      restricciones: Array.isArray(restricciones) ? restricciones : [],
      actividadFisica,
      intensidadTrabajo,
      numeroComidas,
      alimentosNoDeseados: Array.isArray(req.body.alimentosNoDeseados) ? req.body.alimentosNoDeseados : [],
    });

    res.status(200).json(result);
  } catch (error: unknown) {
    console.error('❌ Error al generar o parsear el plan:', error instanceof Error ? error.message : 'Error desconocido');
    res.status(500).json({ 
      message: 'Error generando el plan con IA.', 
      details: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    });
  }
}
