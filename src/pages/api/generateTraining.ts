// src/pages/api/generateTraining.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { generateTrainingPrompt } from '@/lib/generateTrainingPrompt';
import { PlanData } from '@/types/plan';
import { validatePlan } from '@/lib/validatePlan';
import { v4 as uuidv4 } from 'uuid';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'test-api-key',
});

function handleError(res: NextApiResponse, error: unknown, customMessage: string) {
  console.error('[ERROR API]', {
    message: customMessage,
    details: error instanceof Error ? error.message : error,
    timestamp: new Date().toISOString(),
  });
  res.status(500).json({ message: customMessage });
}

interface ParsedPlan {
  plan_entrenamiento?: {
    dias_entrenamiento?: unknown;
    progresion?: unknown;
    consideraciones?: unknown;
  };
  rutina?: unknown;
  progresion?: unknown;
  consideraciones?: unknown;
}

function validarEstructuraParsed(parsed: ParsedPlan): boolean {
  if (!parsed) return false;

  const rutina = parsed.plan_entrenamiento?.dias_entrenamiento || parsed.rutina;

  return (
    rutina &&
    typeof rutina === 'object' &&
    Object.values(rutina).some((dia) => Array.isArray(dia) && dia.length > 0)
  );
}

export async function generateTraining(data: PlanData) {
  try {
    const prompt = generateTrainingPrompt(data);
    console.warn('Prompt generado:', prompt);

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4096,
    });

    if (!completion.choices || !completion.choices[0]?.message?.content) {
      throw new Error('La respuesta de OpenAI no contiene un mensaje válido.');
    }

    const content = completion.choices[0].message.content;
    const cleanContent = content.replace(/\n|\r/g, ' ').trim();

    const jsonMatch = cleanContent.match(/###JSON_START###([\s\S]*?)###JSON_END###/) || cleanContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No se pudo extraer un JSON válido del contenido.');
    }

    const jsonString = jsonMatch[1]?.trim() || jsonMatch[0];

    let parsed: ParsedPlan;
    try {
      parsed = JSON.parse(jsonString);
    } catch (parseError) {
      throw new Error('El JSON recibido no es válido.');
    }

    if (!validarEstructuraParsed(parsed)) {
      console.error('[ERROR estructura mínima]', { parsed });
      throw new Error('El JSON recibido no tiene la estructura mínima esperada.');
    }

    const rutinaBase = parsed.plan_entrenamiento?.dias_entrenamiento || parsed.rutina || {};
    const rutinaTransformada = Object.fromEntries(
      Object.entries(rutinaBase).map(([dia, ejercicios]) => [
        dia,
        {
          nombre: dia,
          ejercicios: Array.isArray(ejercicios)
            ? ejercicios.map((ejercicio) => {
                if (typeof ejercicio === 'string') {
                  return {
                    id: uuidv4(), nombre: ejercicio, series: 3,
                    repeticiones: '10-12', descripcion: '', material: '', musculos: [], notas: '', descanso: ''
                  };
                } else if (typeof ejercicio === 'object' && ejercicio !== null) {
                  return {
                    id: uuidv4(),
                    nombre: ejercicio.nombre || 'Ejercicio sin nombre',
                    series: ejercicio.series || 3,
                    repeticiones: ejercicio.repeticiones || '10-12',
                    descripcion: ejercicio.descripcion || '',
                    material: ejercicio.material || '',
                    musculos: ejercicio.musculos || [],
                    notas: ejercicio.notas || '',
                    descanso: ejercicio.descanso || '',
                  };
                }
                return { id: uuidv4(), nombre: 'Ejercicio desconocido', series: 0, repeticiones: '', descripcion: '', material: '', musculos: [], notas: '', descanso: '' };
              })
            : [],
          duracion: Array.isArray(ejercicios) ? ejercicios.length * 10 : 0,
          intensidad: 'media',
          calorias: Array.isArray(ejercicios) ? ejercicios.length * 50 : 0,
        },
      ])
    );

    const transformedPlan = {
      rutina: rutinaTransformada,
      progresion: parsed.plan_entrenamiento?.progresion || parsed.progresion || 'Progresión no proporcionada.',
      consideraciones: parsed.plan_entrenamiento?.consideraciones || parsed.consideraciones || 'Consideraciones no proporcionadas.',
    };

    if (!validatePlan(transformedPlan)) {
      console.error('[ERROR validación]', transformedPlan);
      throw new Error('El plan transformado no tiene la estructura esperada.');
    }

    return { plan: transformedPlan };
  } catch (error) {
    console.error('[ERROR generateTraining]', error);
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    const {
      entrenamiento,
      edad,
      peso,
      altura,
      sexo,
      objetivo,
      actividadFisica
    } = req.body;

    if (!entrenamiento || !edad || !peso || !altura || !sexo || !objetivo || !actividadFisica) {
      return res.status(400).json({ message: 'Faltan campos requeridos en el cuerpo de la petición.' });
    }

    const result = await generateTraining({
      entrenamiento,
      edad,
      peso,
      altura,
      sexo,
      objetivo,
      actividadFisica,
      servicios: { nutricion: false, entrenamiento: true },
      restricciones: [],
      alimentosNoDeseados: [],
      intensidadTrabajo: '',
      numeroComidas: 0
    });

    res.status(200).json(result);
  } catch (error: unknown) {
    handleError(res, error, 'Error generando el plan de entrenamiento con IA.');
  }
}
