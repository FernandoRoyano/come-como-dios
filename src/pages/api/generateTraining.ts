import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { generateTrainingPrompt } from '@/lib/generateTrainingPrompt';
import { PlanData, PlanEntrenamiento, SemanaProgresion } from '@/types/plan';
import { validatePlan } from '@/lib/validatePlan';
import { v4 as uuidv4 } from 'uuid';
import { distribuirDias, distribuirDiasSeleccionados } from '@/utils/distributeTrainingDays';
import { typedEntries } from '@/utils/typedEntries';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'test-api-key',
});

function handleError(res: NextApiResponse, error: unknown, customMessage: string) {
  console.error(customMessage, error instanceof Error ? error.message : error);
  res.status(500).json({
    message: customMessage,
    details: error instanceof Error ? error.message : 'Error desconocido',
    timestamp: new Date().toISOString(),
  });
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
  const diasEntrenamiento =
    parsed.plan_entrenamiento?.dias_entrenamiento || parsed.rutina;
  return Boolean(diasEntrenamiento && typeof diasEntrenamiento === 'object');
}

export async function generateTraining(data: PlanData & { diasSeleccionados?: string[] }) {
  const prompt = generateTrainingPrompt(data);
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4096,
    });

    const content = completion.choices[0].message?.content || '';
    const cleanContent = content.replace(/\n|\r/g, ' ').trim();

    const startMarker = '###JSON_START###';
    const endMarker = '###JSON_END###';
    let jsonString = '';

    const start = cleanContent.indexOf(startMarker);
    const end = cleanContent.indexOf(endMarker);

    if (start !== -1 && end !== -1) {
      jsonString = cleanContent.slice(start + startMarker.length, end).trim();
    } else {
      const possibleJson = cleanContent.match(/\{[\s\S]*\}/);
      if (possibleJson) {
        jsonString = possibleJson[0];
      } else {
        throw new Error('No se pudo extraer un JSON válido del contenido.');
      }
    }

    let parsed: ParsedPlan;
    try {
      parsed = JSON.parse(jsonString);
    } catch {
      throw new Error('El JSON recibido no es válido.');
    }

    if (!validarEstructuraParsed(parsed)) {
      throw new Error('El JSON recibido no tiene la estructura mínima esperada.');
    }

    const diasEntrenamiento =
      parsed.plan_entrenamiento?.dias_entrenamiento || parsed.rutina || {};

    // Usar los días seleccionados por el usuario si existen, si no, usar todosLosDias
    const todosLosDias = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
    const diasGenerados = typedEntries(diasEntrenamiento);
    const diasSeleccionados = data.diasSeleccionados && data.diasSeleccionados.length > 0
      ? distribuirDiasSeleccionados(data.diasSeleccionados)
      : distribuirDias(todosLosDias, diasGenerados.length);

    const rutinaDistribuida = Object.fromEntries(
      todosLosDias.map(dia => {
        const entrada = diasSeleccionados.includes(dia) ? diasGenerados.shift() : undefined;
        type Ejercicio = string | { nombre: string };
        const ejercicios: Ejercicio[] = Array.isArray(entrada?.[1]) ? (entrada[1] as Ejercicio[]) : [];

        return [
          dia,
          {
            nombre: dia,
            ejercicios: ejercicios.map(ejercicio => {
              const nombreEjercicio = typeof ejercicio === 'string' ? ejercicio : ejercicio.nombre;
              return {
                id: uuidv4(),
                nombre: nombreEjercicio,
                series: 3,
                repeticiones: '10-12',
                descripcion: '',
                material: '',
                musculos: [],
                notas: '',
                descanso: ''
              };
            }),
            duracion: ejercicios.length * 10,
            intensidad: 'media',
            calorias: ejercicios.length * 50
          }
        ];
      })
    );

    const progresionPorDefecto: { semanas: SemanaProgresion[] } = {
      semanas: Array(4).fill({
        semana: '',
        objetivo: '',
        detalles: ''
      })
    };

    const consideracionesPorDefecto: { calentamiento: string[]; enfriamiento: string[]; descanso: string; notas: string } = {
      calentamiento: [],
      enfriamiento: [],
      descanso: '',
      notas: ''
    };

    const progresionValida: { semanas: SemanaProgresion[] } = (() => {
      const progresion = parsed.plan_entrenamiento?.progresion;
      if (
        progresion &&
        typeof progresion === 'object' &&
        'semanas' in progresion &&
        Array.isArray((progresion as { semanas: unknown }).semanas)
      ) {
        return progresion as { semanas: SemanaProgresion[] };
      }
      return progresionPorDefecto;
    })();

    const consideracionesValidas: { calentamiento: string[]; enfriamiento: string[]; descanso: string; notas: string } = (() => {
      const consideraciones = parsed.plan_entrenamiento?.consideraciones;
      if (
        consideraciones &&
        typeof consideraciones === 'object' &&
        'calentamiento' in consideraciones &&
        'enfriamiento' in consideraciones &&
        'descanso' in consideraciones &&
        'notas' in consideraciones
      ) {
        return consideraciones as { calentamiento: string[]; enfriamiento: string[]; descanso: string; notas: string };
      }
      return consideracionesPorDefecto;
    })();

    const transformedPlan: PlanEntrenamiento = {
      rutina: rutinaDistribuida,
      progresion: progresionValida,
      consideraciones: consideracionesValidas
    };

    const isValid = validatePlan(transformedPlan);
    if (!isValid) {
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
      actividadFisica,
    } = req.body;

    const camposRequeridos = {
      entrenamiento: 'Configuración de entrenamiento',
      edad: 'Edad',
      peso: 'Peso',
      altura: 'Altura',
      sexo: 'Sexo',
      objetivo: 'Objetivo',
      actividadFisica: 'Actividad física',
    };

    const camposFaltantes = Object.entries(camposRequeridos)
      .filter(([key]) => !req.body[key])
      .map(([, label]) => label);

    if (camposFaltantes.length > 0) {
      return res.status(400).json({
        message: 'Faltan campos requeridos',
        campos: camposFaltantes,
      });
    }

    if (
      typeof edad !== 'number' ||
      typeof peso !== 'number' ||
      typeof altura !== 'number'
    ) {
      return res.status(400).json({
        message: 'Los campos edad, peso y altura deben ser números',
      });
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
      numeroComidas: 0,
    });

    res.status(200).json(result);
  } catch (error: unknown) {
    handleError(res, error, 'Error generando el plan de entrenamiento con IA.');
  }
}
