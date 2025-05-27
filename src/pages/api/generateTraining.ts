import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { generateTrainingPrompt } from '@/lib/generateTrainingPrompt';
import { PlanData } from '@/types/plan';
import { validatePlan } from '@/lib/validatePlan';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'test-api-key',
});

function handleError(res: NextApiResponse, error: unknown, customMessage: string) {
  console.error(customMessage, error instanceof Error ? error.message : 'Error desconocido');
  res.status(500).json({ 
    message: customMessage, 
    details: error instanceof Error ? error.message : 'Error desconocido',
    timestamp: new Date().toISOString()
  });
}

function validarEstructuraParsed(parsed: any): boolean {
  if (!parsed) return false;

  // Revisar si existe al menos una de las estructuras esperadas
  const hasRutina = parsed.plan_entrenamiento?.dias_entrenamiento || parsed.rutina;
  const hasProgresion = parsed.plan_entrenamiento?.progresion || parsed.progresion;
  const hasConsideraciones = parsed.plan_entrenamiento?.consideraciones || parsed.consideraciones;

  // Agregar validación alternativa para estructuras inesperadas pero válidas
  const hasAlternativeStructure = parsed.plan_entrenamiento || parsed.rutina || parsed.progresion || parsed.consideraciones;

  return Boolean(hasRutina && hasProgresion && hasConsideraciones) || Boolean(hasAlternativeStructure);
}

export async function generateTraining(data: PlanData) {
  try {
    const prompt = generateTrainingPrompt(data);
    console.warn('Prompt generado:', prompt);

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 4096
      });
      console.warn('Respuesta de OpenAI:', completion);
      console.warn('Respuesta completa de OpenAI:', JSON.stringify(completion, null, 2));

      const content = completion.choices[0].message?.content || '';
      console.warn('Contenido recibido de OpenAI:', content);

      const cleanContent = content.replace(/\n|\r/g, ' ').trim();
      console.warn('Contenido limpio:', cleanContent);

      const startMarker = '###JSON_START###';
      const endMarker = '###JSON_END###';
      let start = cleanContent.indexOf(startMarker);
      const end = cleanContent.indexOf(endMarker);

      let jsonString = '';

      if (start !== -1 && end !== -1) {
        start += startMarker.length;
        jsonString = cleanContent.slice(start, end).trim();
        console.warn('JSON extraído:', jsonString);
      } else {
        const possibleJson = cleanContent.match(/\{[\s\S]*\}/);
        if (possibleJson) {
          jsonString = possibleJson[0];
          console.warn('JSON alternativo extraído:', jsonString);
        } else {
          console.error('No se pudo extraer un JSON válido del contenido:', cleanContent);
          throw new Error('No se pudo extraer un JSON válido del contenido.');
        }
      }

      let parsed;
      try {
        parsed = JSON.parse(jsonString);
        console.warn('JSON parseado:', parsed);
      } catch (parseError) {
        console.error('Error al parsear el JSON:', parseError);
        throw new Error('El JSON recibido no es válido.');
      }

      if (!validarEstructuraParsed(parsed)) {
        console.error('El JSON recibido no tiene la estructura mínima esperada:', parsed);
        console.warn('Respuesta completa de OpenAI para depuración:', JSON.stringify(completion, null, 2));
        throw new Error('El JSON recibido no tiene la estructura mínima esperada.');
      }

      const transformedPlan = {
        rutina: parsed.plan_entrenamiento?.dias_entrenamiento || parsed.rutina,
        progresion: parsed.plan_entrenamiento?.progresion || parsed.progresion,
        consideraciones: parsed.plan_entrenamiento?.consideraciones || parsed.consideraciones,
      };
      console.warn('Plan transformado:', transformedPlan);

      const isValid = validatePlan(transformedPlan);
      console.warn('Resultado de la validación del plan:', isValid);

      if (!isValid) {
        console.error('El plan transformado no tiene la estructura esperada:', transformedPlan);
        throw new Error('El plan transformado no tiene la estructura esperada.');
      }

      return { plan: transformedPlan };
    } catch (error) {
      console.error('Error en la generación del plan:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error en generateTraining:', error);
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

    const camposRequeridos = {
      entrenamiento: 'Configuración de entrenamiento',
      edad: 'Edad',
      peso: 'Peso',
      altura: 'Altura',
      sexo: 'Sexo',
      objetivo: 'Objetivo',
      actividadFisica: 'Actividad física'
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
