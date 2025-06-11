import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { generateTrainingPrompt } from '@/lib/generateTrainingPrompt';
import { PlanData, PlanEntrenamiento, SemanaProgresion } from '@/types/plan';
import { validatePlan } from '@/lib/validatePlan';
import { v4 as uuidv4 } from 'uuid';
import { distribuirDias, distribuirDiasSeleccionados } from '@/utils/distributeTrainingDays';
import { typedEntries } from '@/utils/typedEntries';
import { obtenerParametrosEjercicio } from '@/lib/trainingParams';
import { obtenerNombreEjercicioAlias } from '@/lib/ejerciciosAlias';

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
  // Estructura avanzada IA
  cliente?: unknown;
  programacion?: unknown;
  entrenamiento?: unknown;
  cardio?: unknown;
  movilidad?: unknown;
  seguimiento?: unknown;
  nutricion?: unknown;
  disclaimer?: unknown;
}

function validarEstructuraParsed(parsed: ParsedPlan): boolean {
  if (!parsed) return false;
  // Estructura antigua
  if (
    parsed.plan_entrenamiento?.dias_entrenamiento || parsed.rutina
  ) {
    return true;
  }
  // Estructura avanzada
  if (
    parsed.entrenamiento && Array.isArray(parsed.entrenamiento)
  ) {
    return true;
  }
  return false;
}

function transformarPlanAvanzadoAPlanEntrenamiento(parsed: ParsedPlan): PlanEntrenamiento {
  const diasSemana = [
    'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo',
    'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
  ];
  const rutina: Record<string, any> = {};
  if (Array.isArray(parsed.entrenamiento)) {
    for (const dia of parsed.entrenamiento) {
      let nombreDia = (dia.dia || dia.nombre || '').toString().toLowerCase();
      if (!diasSemana.includes(nombreDia)) {
        const encontrado = diasSemana.find(d => (dia.dia || dia.nombre || '').toLowerCase().includes(d.toLowerCase()));
        if (encontrado) nombreDia = encontrado.toLowerCase();
      }
      if (!nombreDia) continue;
      let ejercicios = Array.isArray(dia.ejercicios)
        ? dia.ejercicios.map((ej: any) => ({
            id: uuidv4(),
            // Normaliza y mapea el nombre usando alias
            nombre: obtenerNombreEjercicioAlias(ej.nombre || ''),
            series: typeof ej.series === 'number' ? ej.series : 3,
            repeticiones: ej.repeticiones ? ej.repeticiones.toString() : (typeof ej.reps === 'number' ? ej.reps.toString() : '10'),
            descripcion: ej.descripcion || '',
            material: ej.material || '',
            musculos: Array.isArray(ej.grupo_muscular) ? ej.grupo_muscular : (ej.grupo_muscular ? [ej.grupo_muscular] : []),
            notas: ej.notas || '',
            descanso: ej.descanso_seg ? `${ej.descanso_seg}s` : (ej.descanso || ''),
            imagen: ''
          }))
        : [];
      // Elimina duplicados por nombre estándar
      const nombresUnicos = new Set<string>();
      ejercicios = ejercicios.filter((ej: any) => {
        if (nombresUnicos.has(ej.nombre.toLowerCase())) return false;
        nombresUnicos.add(ej.nombre.toLowerCase());
        return true;
      });
      rutina[nombreDia] = {
        nombre: dia.dia || dia.nombre || '',
        ejercicios,
        duracion: typeof dia.duracion === 'number' ? dia.duracion : ejercicios.length * 10,
        intensidad: dia.intensidad || 'media',
        calorias: typeof dia.calorias === 'number' ? dia.calorias : ejercicios.length * 50
      };
    }
  }
  // Progresión
  let progresion: { semanas: SemanaProgresion[] } = { semanas: [] };
  if (parsed.programacion && typeof parsed.programacion === 'object' && 'tipo_progresion' in (parsed.programacion as any)) {
    const prog = parsed.programacion as any;
    progresion = {
      semanas: [
        {
          semana: '1',
          objetivo: typeof prog.tipo_progresion === 'string' ? prog.tipo_progresion : '',
          detalles: JSON.stringify(prog)
        }
      ]
    };
  } else if (parsed.progresion && typeof parsed.progresion === 'object' && Array.isArray((parsed.progresion as any).semanas)) {
    progresion = parsed.progresion as { semanas: SemanaProgresion[] };
  }
  // Consideraciones
  let consideraciones: { calentamiento: string[]; enfriamiento: string[]; descanso: string; notas: string } = {
    calentamiento: [], enfriamiento: [], descanso: '', notas: ''
  };
  if (parsed.movilidad && typeof parsed.movilidad === 'object') {
    const mov = parsed.movilidad as any;
    consideraciones.calentamiento = [
      mov.tipo ? String(mov.tipo) : '',
      ...(Array.isArray(mov.zonas_prioritarias) ? mov.zonas_prioritarias : [])
    ].filter(Boolean);
    consideraciones.enfriamiento = [];
  }
  if (parsed.cardio && typeof parsed.cardio === 'object') {
    consideraciones.notas += `Cardio: ${JSON.stringify(parsed.cardio)}\n`;
  }
  if (parsed.disclaimer) {
    consideraciones.notas += `\n${parsed.disclaimer}`;
  }
  if (parsed.consideraciones && typeof parsed.consideraciones === 'object') {
    consideraciones = { ...consideraciones, ...(parsed.consideraciones as any) };
  }
  return {
    rutina,
    progresion,
    consideraciones
  };
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

    // LOG: Mostrar el contenido bruto recibido de la IA
    console.log('[IA RAW RESPONSE]', cleanContent);

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
        // LOG: No se pudo extraer JSON
        console.error('[ERROR] No se pudo extraer un JSON válido del contenido:', cleanContent);
        throw new Error('No se pudo extraer un JSON válido del contenido.');
      }
    }

    // LOG: Mostrar el JSON extraído antes de parsear
    console.log('[IA JSON EXTRACTED]', jsonString);

    let parsed: ParsedPlan;
    try {
      parsed = JSON.parse(jsonString);
    } catch (e) {
      // LOG: Error al parsear JSON
      console.error('[ERROR] El JSON recibido no es válido. Respuesta bruta de la IA:', jsonString);
      const error = new Error('El JSON recibido no es válido. Respuesta bruta de la IA: ' + jsonString);
      (error as any).rawContent = jsonString;
      throw error;
    }

    if (!validarEstructuraParsed(parsed)) {
      // LOG: Estructura mínima no válida
      console.error('[ERROR] El JSON recibido no tiene la estructura mínima esperada:', parsed);
      throw new Error('El JSON recibido no tiene la estructura mínima esperada.');
    }

    // --- Transformación según estructura ---
    let transformedPlan: PlanEntrenamiento;
    if (parsed.entrenamiento && Array.isArray(parsed.entrenamiento)) {
      // Estructura avanzada IA
      transformedPlan = transformarPlanAvanzadoAPlanEntrenamiento(parsed);
    } else {
      // Estructura antigua (compatibilidad)
      const diasEntrenamiento =
        parsed.plan_entrenamiento?.dias_entrenamiento || parsed.rutina || {};
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
          if (!ejercicios.length) {
            return [
              dia,
              {
                nombre: dia + ' (descanso)',
                ejercicios: [
                  {
                    id: uuidv4(),
                    nombre: 'Movilidad articular general',
                    series: 2,
                    repeticiones: '10-15',
                    descripcion: 'Rutina suave de movilidad para todas las articulaciones principales.',
                    material: 'Esterilla',
                    musculos: ['general'],
                    notas: 'Realizar movimientos suaves y controlados.',
                    descanso: '30s',
                    imagen: ''
                  },
                  {
                    id: uuidv4(),
                    nombre: 'Estiramientos globales',
                    series: 1,
                    repeticiones: '10-15 min',
                    descripcion: 'Estiramientos estáticos de cuerpo completo.',
                    material: 'Esterilla',
                    musculos: ['general'],
                    notas: 'Mantener cada estiramiento 20-30 segundos.',
                    descanso: '-',
                    imagen: ''
                  }
                ],
                duracion: 20,
                intensidad: 'muy baja',
                calorias: 50
              }
            ];
          }
          return [
            dia,
            {
              nombre: dia,
              ejercicios: ejercicios.map(ejercicio => {
                const nombreEjercicio = typeof ejercicio === 'string' ? ejercicio : ejercicio.nombre;
                const params = obtenerParametrosEjercicio(nombreEjercicio);
                return {
                  id: uuidv4(),
                  nombre: nombreEjercicio || '',
                  series: params.series,
                  repeticiones: params.repeticiones,
                  descripcion: '',
                  material: '',
                  musculos: [],
                  notas: '',
                  descanso: params.descanso || '',
                  imagen: ''
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
      transformedPlan = {
        rutina: rutinaDistribuida,
        progresion: progresionValida,
        consideraciones: consideracionesValidas
      };
    }

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
    // Si el error tiene contenido bruto, inclúyelo en la respuesta
    if (error && typeof error === 'object' && 'rawContent' in error) {
      return res.status(500).json({
        message: 'Error generando el plan de entrenamiento con IA.',
        details: error instanceof Error ? error.message : 'Error desconocido',
        rawContent: (error as any).rawContent,
        timestamp: new Date().toISOString(),
      });
    }
    handleError(res, error, 'Error generando el plan de entrenamiento con IA.');
  }
}
