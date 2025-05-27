import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { generateTrainingPrompt } from '@/lib/generateTrainingPrompt';
import { PlanData } from '@/types/plan'; // Eliminado PlanEntrenamiento porque no se usa

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function generateTraining(data: PlanData) {
  try {
    console.warn('Generando plan de entrenamiento con datos:', data);
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
      console.warn('Modo de prueba activado, retornando datos de prueba');
      return { plan: testData };
    }

    console.warn('Iniciando generación de plan de entrenamiento...');
    console.warn('Entorno actual:', process.env.NODE_ENV);

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 4096
      });

      console.warn('Respuesta completa de OpenAI recibida:', completion);

      const content = completion.choices[0].message?.content || '';

      if (!content) {
        console.error('No se recibió contenido de la IA');
        throw new Error('No se recibió respuesta de la IA');
      }

      console.warn('Contenido recibido (primeros 200 caracteres):', content.substring(0, 200));

      // Limpiar el contenido de posibles caracteres no deseados
      const cleanContent = content.replace(/[\n\r]+/g, ' ').trim();

      console.warn('Contenido limpio (primeros 200 caracteres):', cleanContent.substring(0, 200));

      // Buscar delimitadores de JSON
      const startMarker = '###JSON_START###';
      const endMarker = '###JSON_END###';
      let start = cleanContent.indexOf(startMarker);
      const end = cleanContent.indexOf(endMarker); // Cambiado let a const

      if (start === -1 || end === -1) {
        console.error('Delimitadores no encontrados en el contenido:', cleanContent);
        throw new Error('No se encontraron los delimitadores de JSON esperados.');
      }

      start += startMarker.length;
      const jsonString = cleanContent.slice(start, end).trim();

      console.warn('JSON extraído (primeros 200 caracteres):', jsonString.substring(0, 200));

      const parsed = JSON.parse(jsonString);
      console.warn('JSON parseado exitosamente:', parsed);

      return { plan: parsed };
    } catch (error) {
      console.error('Error durante la generación del plan:', error);
      throw error;
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
    const {
      entrenamiento,
      edad,
      peso,
      altura,
      sexo,
      objetivo,
      actividadFisica
    } = req.body;

    console.warn('Recibida petición para generar plan de entrenamiento');
    console.warn('Datos recibidos:', {
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

    console.warn('Plan generado exitosamente');
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