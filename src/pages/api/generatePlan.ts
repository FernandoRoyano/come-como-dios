import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { generatePrompt } from '@/lib/generatePrompt';
import { validatePlan } from '@/lib/validatePlan';
import { Plan, PlanData, PlanEntrenamiento } from '@/types/plan';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

function calcularCaloriasDiarias({ peso, altura, edad, sexo, actividadFisica, objetivo }: { peso: number; altura: number; edad: number; sexo: string; actividadFisica: string; objetivo: string }): number {
  const tmb = sexo === 'masculino'
    ? 10 * peso + 6.25 * altura - 5 * edad + 5
    : 10 * peso + 6.25 * altura - 5 * edad - 161;

  const factoresActividad: Record<string, number> = {
    'sedentario': 1.2,
    'ligero': 1.375,
    'moderado': 1.55,
    'activo': 1.725,
    'muy activo': 2.0 // Incrementado para reflejar actividad física elevada
  };

  const factorActividad = factoresActividad[actividadFisica.toLowerCase()] || 1.2;

  let calorias = tmb * factorActividad;

  if (objetivo.toLowerCase() === 'ganar músculo') {
    calorias += 750; // Incrementado para reflejar mejor el objetivo de ganar músculo
  }

  if (calorias < 1500) {
    calorias = 1500; // Ajuste mínimo para evitar valores demasiado bajos
  } else if (calorias > 4500) {
    calorias = 4500; // Ajuste máximo para evitar valores extremos
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

  const caloriasPorComida = Math.round(caloriasRecomendadas / data.numeroComidas);

  const contexto = `
    Contexto del usuario:
    - Edad: ${data.edad} años
    - Peso: ${data.peso} kg
    - Altura: ${data.altura} cm
    - Sexo: ${data.sexo}
    - Actividad física: ${data.actividadFisica}
    - Objetivo: ${data.objetivo}
    - Restricciones alimenticias: ${data.restricciones.join(', ') || 'Ninguna'}
    - Alimentos no deseados: ${data.alimentosNoDeseados.join(', ') || 'Ninguno'}
    - Número de comidas: ${data.numeroComidas}
    - Calorías por comida: ${caloriasPorComida}
  `;

  const prompt = `${contexto}\n\n${generatePrompt({ ...data, caloriasRecomendadas })}`;

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
    throw new Error('No se encontraron los delimitadores de JSON esperados.');
  }

  const jsonString = content.slice(start + 17, end).trim();

  try {
    const parsed = JSON.parse(jsonString) as Plan;

    // Validar que el número de comidas generadas coincida con el solicitado
    if (parsed.comidas && parsed.comidas.length !== data.numeroComidas) {
      throw new Error(`El número de comidas generadas (${parsed.comidas.length}) no coincide con el solicitado (${data.numeroComidas}).`);
    }

    const entrenamiento: PlanEntrenamiento = {
      rutina: Object.fromEntries(
        Object.entries(parsed.dias).map(([key, dia]) => [
          key,
          {
            nombre: key,
            ejercicios: [], // Agregar lógica para ejercicios si es necesario
            duracion: 0,
            intensidad: 'media',
            calorias: 0,
          },
        ])
      ),
      progresion: {
        semanas: [],
      },
      consideraciones: {
        calentamiento: [],
        enfriamiento: [],
        descanso: '',
        notas: '',
      },
    };

    validatePlan(entrenamiento);
    return { plan: parsed };
  } catch (parseError: unknown) {
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

  if (typeof numeroComidas !== 'number' || numeroComidas < 1 || numeroComidas > 6) {
    return res.status(400).json({
      message: 'El número de comidas debe ser un número entre 1 y 6'
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
    res.status(500).json({ 
      message: 'Error generando el plan con IA.', 
      details: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    });
  }
}
