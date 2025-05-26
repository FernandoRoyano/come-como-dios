import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { generateTrainingPrompt } from '@/lib/generateTrainingPrompt';
import { PlanEntrenamiento, PlanData } from '@/types/plan';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function generateTraining(data: PlanData) {
  try {
    console.log('Generando plan de entrenamiento con datos:', data);
    const prompt = generateTrainingPrompt(data);

    // Datos de prueba para verificar el sistema
    const testData = {
      rutina: {
        lunes: {
          nombre: "Entrenamiento de Fuerza - Pecho y Tríceps",
          duracion: 60,
          intensidad: "Alta",
          calorias: 400,
          ejercicios: [
            {
              nombre: "Press de Banca con Barra",
              series: 4,
              repeticiones: "8-10",
              descanso: "90 segundos",
              imagen: "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/bench-press-muscles-worked.jpg",
              notas: "Mantener los hombros retraídos y los pies firmes en el suelo",
              material: "Barra y banco",
              musculos: ["Pectoral mayor", "Tríceps", "Deltoides anterior"],
              descripcion: "Ejercicio compuesto para el pecho y tríceps"
            },
            {
              nombre: "Aperturas con Mancuernas",
              series: 3,
              repeticiones: "12-15",
              descanso: "60 segundos",
              imagen: "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/dumbbell-fly-muscles-worked.jpg",
              notas: "Mantener una ligera flexión en los codos",
              material: "Mancuernas y banco",
              musculos: ["Pectoral mayor", "Deltoides anterior"],
              descripcion: "Ejercicio de aislamiento para el pecho"
            },
            {
              nombre: "Fondos en Paralelas",
              series: 3,
              repeticiones: "10-12",
              descanso: "90 segundos",
              imagen: "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/dips-muscles-worked.jpg",
              notas: "No balancear el cuerpo, bajar controladamente",
              material: "Paralelas",
              musculos: ["Tríceps", "Pectoral menor"],
              descripcion: "Ejercicio para tríceps y pecho"
            },
            {
              nombre: "Press de Banca Inclinado con Mancuernas",
              series: 4,
              repeticiones: "8-10",
              descanso: "90 segundos",
              imagen: "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/incline-dumbbell-press-muscles-worked.jpg",
              notas: "No arquear la espalda, controlar el movimiento",
              material: "Mancuernas y banco inclinado",
              musculos: ["Pectoral superior", "Deltoides anterior"],
              descripcion: "Enfocado en la parte superior del pecho"
            },
            {
              nombre: "Press Francés con Barra",
              series: 3,
              repeticiones: "10-12",
              descanso: "60 segundos",
              imagen: "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/skullcrusher-muscles-worked.jpg",
              notas: "Codos fijos, bajar la barra controladamente",
              material: "Barra",
              musculos: ["Tríceps"],
              descripcion: "Aislamiento de tríceps"
            },
            {
              nombre: "Cuerda en Polea para Tríceps",
              series: 3,
              repeticiones: "12-15",
              descanso: "45 segundos",
              imagen: "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/triceps-rope-pushdown-muscles-worked.jpg",
              notas: "Separar la cuerda al final del movimiento",
              material: "Polea y cuerda",
              musculos: ["Tríceps"],
              descripcion: "Trabajo de tríceps en polea"
            }
          ]
        }
      },
      progresion: {
        semanas: [
          {
            semana: 1,
            objetivos: ["Aprender técnica", "Adaptación muscular"],
            ajustes: ["Pesos ligeros", "Enfoque en forma"]
          }
        ]
      },
      consideraciones: {
        calentamiento: ["5-10 minutos cardio ligero", "Movilidad articular"],
        enfriamiento: ["Estiramientos estáticos", "Foam rolling"],
        descanso: "48 horas entre grupos musculares",
        notas: "Ajustar pesos según progreso"
      }
    };

    // En modo de prueba, retornar los datos de prueba
    if (process.env.NODE_ENV === 'development' && process.env.TEST_MODE === 'true') {
      console.log('Modo de prueba activado, retornando datos de prueba');
      return { plan: testData };
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4096
    });

    const content = completion.choices[0].message?.content || '';

    if (!content) {
      console.error('No se recibió contenido de la IA');
      throw new Error('No se recibió respuesta de la IA');
    }

    console.log('Respuesta de la IA recibida, procesando...');
    console.log('Longitud del contenido:', content.length);
    console.log('Primeros 100 caracteres:', content.substring(0, 100));

    // Limpiar el contenido de posibles caracteres no deseados
    const cleanContent = content.replace(/[\u200B-\u200D\uFEFF]/g, '');

    // Buscar los delimitadores de manera más flexible
    const startMarker = '###JSON_START###';
    const endMarker = '###JSON_END###';
    
    let start = cleanContent.indexOf(startMarker);
    let end = cleanContent.indexOf(endMarker);

    // Si no se encuentran los delimitadores exactos, intentar con variaciones
    if (start === -1 || end === -1) {
      console.log('Buscando delimitadores alternativos...');
      const possibleStartMarkers = [
        '###JSON_START###',
        'JSON_START',
        'START_JSON',
        '{'
      ];
      const possibleEndMarkers = [
        '###JSON_END###',
        'JSON_END',
        'END_JSON',
        '}'
      ];

      for (const marker of possibleStartMarkers) {
        start = cleanContent.indexOf(marker);
        if (start !== -1) {
          start += marker.length;
          break;
        }
      }

      for (const marker of possibleEndMarkers) {
        end = cleanContent.indexOf(marker, start);
        if (end !== -1) break;
      }
    } else {
      start += startMarker.length;
    }

    if (start === -1 || end === -1) {
      console.error('Contenido recibido:', cleanContent);
      throw new Error('No se encontraron los delimitadores de JSON esperados.');
    }

    // Extraer y limpiar el JSON
    let jsonString = cleanContent.slice(start, end).trim();
    
    // Limpiar el JSON de posibles caracteres no deseados
    jsonString = jsonString
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Eliminar caracteres invisibles
      .replace(/[\n\r]+/g, ' ') // Reemplazar saltos de línea con espacios
      .replace(/\s+/g, ' ') // Normalizar espacios
      .trim();

    console.log('JSON extraído (primeros 200 caracteres):', jsonString.substring(0, 200));

    try {
      const parsed = JSON.parse(jsonString) as PlanEntrenamiento;
      // Validar que el plan tenga todos los días requeridos
      const diasRequeridos = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
      const diasFaltantes = diasRequeridos.filter(dia => !parsed.rutina[dia]);
      if (diasFaltantes.length > 0) {
        console.warn('Días faltantes:', diasFaltantes);
        // No lanzar error, solo advertir
      }
      // Validar que cada día tenga la cantidad correcta de ejercicios
      for (const [dia, entrenamiento] of Object.entries(parsed.rutina)) {
        console.log(`Validando día ${dia}:`, {
          nombre: entrenamiento.nombre,
          numEjercicios: entrenamiento.ejercicios.length,
          esDescanso: entrenamiento.nombre?.toLowerCase().includes('descanso'),
          ejercicios: entrenamiento.ejercicios.map(e => ({
            nombre: e.nombre,
            series: e.series,
            repeticiones: e.repeticiones
          }))
        });
        // No validar domingo
        if (dia === 'domingo') continue;
        // Validar días de descanso activo
        if (entrenamiento.nombre?.toLowerCase().includes('descanso activo')) {
          if (entrenamiento.ejercicios.length < 2) {
            console.warn(`El día ${dia} (descanso activo) tiene menos de 2 ejercicios`);
          }
          continue;
        }
        // Validar días normales
        if (entrenamiento.ejercicios.length < 3) {
          console.warn(`El día ${dia} tiene menos de 3 ejercicios (tiene ${entrenamiento.ejercicios.length})`);
        }
      }
      console.log('Plan validado exitosamente');
      return { plan: parsed };
    } catch (parseError: unknown) {
      // Log extendido solo en desarrollo
      console.error('Error parseando JSON:', parseError);
      console.error('JSON recibido:', jsonString);
      if (process.env.NODE_ENV === 'development') {
        console.error('Respuesta completa de la IA:', cleanContent);
      }
      throw new Error(`Error en el formato JSON del plan generado: ${parseError instanceof Error ? parseError.message : 'Error desconocido'}`);
    }
  } catch (error: unknown) {
    console.error('Error en generateTraining:', error);
    throw error;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  try {
    console.log('Recibida petición para generar plan de entrenamiento');
    const {
      entrenamiento,
      edad,
      peso,
      altura,
      sexo,
      objetivo,
      actividadFisica
    } = req.body;

    console.log('Datos recibidos:', {
      entrenamiento,
      edad,
      peso,
      altura,
      sexo,
      objetivo,
      actividadFisica
    });

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
      // Campos requeridos por PlanData pero no usados en entrenamiento
      servicios: { nutricion: false, entrenamiento: true },
      restricciones: [],
      alimentosNoDeseados: [],
      intensidadTrabajo: '',
      numeroComidas: 0
    });

    console.log('Plan generado exitosamente');
    res.status(200).json(result);
  } catch (error: unknown) {
    console.error('❌ Error al generar o parsear el plan:', error instanceof Error ? error.message : 'Error desconocido');
    res.status(500).json({ 
      message: 'Error generando el plan de entrenamiento con IA.', 
      details: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    });
  }
}