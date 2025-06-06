import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { generatePrompt } from '@/lib/generatePrompt';
import { validatePlan } from '@/lib/validatePlan';
import { Plan, PlanData, PlanEntrenamiento } from '@/types/plan';
import { calcularMacrosDeDescripcion } from '@/lib/foodDataCentral';

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

  // LOG para depuración: muestra la respuesta completa de la IA
  console.log('Respuesta completa de la IA:', content);

  // Extraer solo el bloque JSON entre los delimitadores definidos
  const start = content.indexOf('###JSON_START###');
  const end = content.indexOf('###JSON_END###');

  let jsonString = '';
  if (start !== -1 && end !== -1) {
    jsonString = content.slice(start + 17, end).trim();
  } else {
    // Fallback: intenta extraer el primer bloque JSON válido del texto
    const possibleJson = content.match(/\{[\s\S]*\}/);
    if (possibleJson) {
      jsonString = possibleJson[0];
      console.warn('[IA WARNING] No se encontraron delimitadores, se extrajo el primer bloque JSON del texto.');
    } else {
      throw new Error('No se encontraron los delimitadores de JSON esperados ni un bloque JSON válido en la respuesta.');
    }
  }

  // Limpieza avanzada del JSON generado por la IA antes de parsear
  function limpiarJsonIA(json: string): string {
    let limpio = json;
    // Elimina comentarios tipo // y /* */
    limpio = limpio.replace(/\/\/.*$/gm, '');
    limpio = limpio.replace(/\/\*[\s\S]*?\*\//g, '');
    // Elimina líneas o fragmentos con solo '...' o similares
    limpio = limpio.replace(/^\s*\.\.\..*$/gm, '');
    limpio = limpio.replace(/\.\.\./g, '');
    // Elimina comas finales antes de llaves/corchetes de cierre
    limpio = limpio.replace(/,\s*([}\]])/g, '$1');
    // Elimina saltos de línea innecesarios
    limpio = limpio.replace(/\r?\n/g, ' ');
    // Reemplaza comillas simples por dobles
    limpio = limpio.replace(/'/g, '"');
    // Fuerza comillas dobles en todas las claves (solo fuera de strings)
    limpio = limpio.replace(/([,{\s])(\w+)(\s*):/g, '$1"$2"$3:');
    // Elimina dobles comillas seguidas
    limpio = limpio.replace(/"{2,}/g, '"');
    // Elimina valores tipo "x", null, o vacíos por 0 en macros
    limpio = limpio.replace(/(:\s*)("x"|null|''|""|undefined)/g, '$10');
    // Elimina cualquier texto antes/después del primer y último corchete
    const firstBrace = limpio.indexOf('{');
    const lastBrace = limpio.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      limpio = limpio.slice(firstBrace, lastBrace + 1);
    }
    return limpio.trim();
  }

  let parsed: Plan;
  try {
    parsed = JSON.parse(jsonString) as Plan;
  } catch (parseError1) {
    // Fallback: intenta limpiar el JSON antes de parsear
    try {
      const limpio = limpiarJsonIA(jsonString);
      parsed = JSON.parse(limpio) as Plan;
      console.warn('[IA WARNING] El JSON de la IA fue limpiado automáticamente antes de parsear.');
    } catch (parseError2) {
      // Fallback: intenta reemplazar comillas simples por dobles y limpiar
      try {
        const fixedJson = jsonString.replace(/'/g, '"');
        const limpio = limpiarJsonIA(fixedJson);
        parsed = JSON.parse(limpio) as Plan;
        console.warn('[IA WARNING] El JSON de la IA fue limpiado y corregido de comillas simples.');
      } catch (parseError3) {
        // Log completo para depuración
        console.error('[IA ERROR] JSON inválido recibido de la IA:', jsonString);
        throw new Error(`Error en el formato JSON del plan generado: ${parseError1 instanceof Error ? parseError1.message : 'Error desconocido'}\nJSON bruto recibido:\n${jsonString}`);
      }
    }
  }

  // Validación de tipos para macronutrientes (robusta: fuerza a 0 si no es número)
  if (parsed.macronutrientes) {
    const m = parsed.macronutrientes;
    m.calorias = typeof m.calorias === 'number' && isFinite(m.calorias) ? m.calorias : 0;
    m.proteinas = typeof m.proteinas === 'number' && isFinite(m.proteinas) ? m.proteinas : 0;
    m.carbohidratos = typeof m.carbohidratos === 'number' && isFinite(m.carbohidratos) ? m.carbohidratos : 0;
    m.grasas = typeof m.grasas === 'number' && isFinite(m.grasas) ? m.grasas : 0;
  }

  // Validación robusta de estructura
  // 1. Comidas debe ser array o null
  if (parsed.comidas && !Array.isArray(parsed.comidas)) {
    console.warn('[IA WARNING] El campo "comidas" no es un array. Valor recibido:', parsed.comidas);
    parsed.comidas = [];
  }
  // 2. Dias debe ser objeto
  if (!parsed.dias || typeof parsed.dias !== 'object' || Array.isArray(parsed.dias)) {
    console.warn('[IA WARNING] El campo "dias" no es un objeto. Valor recibido:', parsed.dias);
    parsed.dias = {};
  }

  // Validar que el número de comidas generadas coincida con el solicitado
  if (parsed.comidas && parsed.comidas.length !== data.numeroComidas) {
    throw new Error(`El número de comidas generadas (${parsed.comidas.length}) no coincide con el solicitado (${data.numeroComidas}).`);
  }

  // --- FILTRO DE DIETA Y RESTRICCIONES ---
  // Detectar tipo de dieta a partir de restricciones (vegana, vegetariana, keto, mediterranea)
  let tipoDieta: string | undefined = undefined;
  if (Array.isArray(data.restricciones)) {
    const lower = data.restricciones.map(r => r.toLowerCase());
    if (lower.includes('vegana')) tipoDieta = 'vegana';
    else if (lower.includes('vegetariana')) tipoDieta = 'vegetariana';
    else if (lower.includes('keto')) tipoDieta = 'keto';
    else if (lower.includes('mediterranea') || lower.includes('mediterránea')) tipoDieta = 'mediterranea';
  }

  // Recalcular calorías y macros de cada comida usando FoodData Central FILTRADA
  // Recopilar ingredientes no encontrados
  let ingredientesNoEncontrados: string[] = [];
  if (parsed.dias) {
    for (const diaKey of Object.keys(parsed.dias)) {
      const dia = parsed.dias[diaKey];
      const comidaKeys = ['desayuno', 'almuerzo', 'cena'];
      for (const comidaKey of comidaKeys) {
        const comida = (dia as any)[comidaKey];
        if (comida && typeof comida === 'object') {
          let macros = { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0, detalles: [], noEncontrados: [] };
          if (typeof comida.descripcion === 'string' && comida.descripcion.trim().length > 0) {
            macros = require('@/lib/foodDataCentral').calcularMacrosDeDescripcionFiltrado(comida.descripcion, { tipoDieta, restricciones: data.restricciones });
            if (macros.noEncontrados && macros.noEncontrados.length > 0) {
              ingredientesNoEncontrados.push(...macros.noEncontrados);
            }
          }
          comida.calorias = Math.round(macros.calorias);
          comida.proteinas = Math.round(macros.proteinas);
          comida.carbohidratos = Math.round(macros.carbohidratos);
          comida.grasas = Math.round(macros.grasas);
        } else if (comida !== undefined) {
          console.warn(`[IA WARNING] La comida '${comidaKey}' del día '${diaKey}' no es un objeto válido. Valor recibido:`, comida);
        }
      }
      if (Array.isArray((dia as any).snacks)) {
        for (const snack of (dia as any).snacks) {
          if (snack && typeof snack === 'object') {
            let macros = { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0, detalles: [], noEncontrados: [] };
            if (typeof snack.descripcion === 'string' && snack.descripcion.trim().length > 0) {
              macros = require('@/lib/foodDataCentral').calcularMacrosDeDescripcionFiltrado(snack.descripcion, { tipoDieta, restricciones: data.restricciones });
              if (macros.noEncontrados && macros.noEncontrados.length > 0) {
                ingredientesNoEncontrados.push(...macros.noEncontrados);
              }
            }
            snack.calorias = Math.round(macros.calorias);
            snack.proteinas = Math.round(macros.proteinas);
            snack.carbohidratos = Math.round(macros.carbohidratos);
            snack.grasas = Math.round(macros.grasas);
          } else if (snack !== undefined) {
            console.warn(`[IA WARNING] Un snack del día '${diaKey}' no es un objeto válido. Valor recibido:`, snack);
          }
        }
      } else if ((dia as any).snacks !== undefined) {
        console.warn(`[IA WARNING] El campo 'snacks' del día '${diaKey}' no es un array. Valor recibido:`, (dia as any).snacks);
      }
    }
  }

  // Eliminar duplicados y limpiar espacios
  ingredientesNoEncontrados = Array.from(new Set(ingredientesNoEncontrados.map(i => i.trim().toLowerCase())));

  const entrenamiento: PlanEntrenamiento = {
    rutina: Object.fromEntries(
      Object.entries(parsed.dias).map(([key]) => [
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

  // --- RELLENO AUTOMÁTICO DE DÍAS FALTANTES ---
  const DIAS_SEMANA = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
  if (parsed.dias && typeof parsed.dias === 'object') {
    const diasActuales = Object.keys(parsed.dias);
    if (diasActuales.length > 0) {
      const primerDia = parsed.dias[diasActuales[0]];
      for (const dia of DIAS_SEMANA) {
        if (!parsed.dias[dia]) {
          // Copia el primer día existente, pero cambia el nombre del día
          parsed.dias[dia] = JSON.parse(JSON.stringify(primerDia));
        }
      }
    }
  }

  validatePlan(entrenamiento);
  return { plan: parsed, ingredientesNoEncontrados };
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
    console.error('Error en /api/generatePlan:', error);
    res.status(500).json({ 
      message: 'Error generando el plan con IA.', 
      details: error instanceof Error ? error.message : 'Error desconocido',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
  }
}
