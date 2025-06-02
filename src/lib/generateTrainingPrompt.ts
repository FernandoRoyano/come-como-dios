import fs from 'fs';
import path from 'path';
import { PlanData } from '@/types/plan';

/**
 * Genera un bloque JSON de ejemplo con un plan semanal estándar.
 */
function generatePlanExampleJSON(): string {
  return `###JSON_START###
{
  "plan_entrenamiento": {
    "usuario": {
      "edad": 30,
      "peso": 70,
      "altura": 175,
      "sexo": "masculino",
      "objetivo": "ganancia_musculo",
      "nivel_actividad": "moderado"
    },
    "material_disponible": ["pesas", "bandas"],
    "dias_entrenamiento": {
      "lunes": ["Press de banca", "Sentadillas", "Peso muerto", "Flexiones", "Dominadas", "Curl de bíceps"],
      "martes": ["Press militar", "Zancadas", "Remo con barra", "Fondos", "Elevaciones laterales", "Tríceps en polea"],
      "miercoles": ["Sentadilla frontal", "Prensa de piernas", "Peso muerto rumano", "Abdominales", "Curl femoral", "Gemelos"],
      "jueves": ["Press inclinado", "Pull ups", "Extensión de tríceps", "Elevación de talones", "Plancha", "Abdominales oblicuos"],
      "viernes": ["Press de hombros", "Sentadilla hack", "Dominadas agarre cerrado", "Flexiones diamante", "Curl de bíceps en barra", "Extensión de tríceps en polea"],
      "sabado": ["Press de banca inclinado", "Peso muerto sumo", "Fondos en paralelas", "Curl martillo", "Extensión de tríceps con mancuerna", "Peso muerto a una pierna"],
      "domingo": []
    },
    "progresion": {
      "semanas": [
        {"semana": "1", "objetivo": "Adaptación", "detalles": "Familiarización con los ejercicios y técnica"},
        {"semana": "2", "objetivo": "Incremento de carga", "detalles": "Aumentar ligeramente el peso y mantener técnica"},
        {"semana": "3", "objetivo": "Volumen", "detalles": "Aumentar repeticiones y series"},
        {"semana": "4", "objetivo": "Recuperación", "detalles": "Reducir intensidad para favorecer recuperación"}
      ]
    },
    "consideraciones": {
      "calentamiento": ["5 min cardio suave", "Movilidad articular"],
      "enfriamiento": ["Estiramientos generales", "Respiración profunda"],
      "descanso": "Dormir al menos 7 horas por noche",
      "notas": "Ajustar pesos según capacidad y evitar dolor articular"
    }
  }
}
###JSON_END###`;
}

/**
 * Genera el prompt completo para generar un plan de entrenamiento personalizado.
 */
export function generateTrainingPrompt(data: PlanData): string {
  // Leer SOLO el resumen del libro
  let libroReferencia = '';
  try {
    const libroPath = path.join(process.cwd(), 'src/data/libro_powerexplosive_resumido.txt');
    libroReferencia = fs.readFileSync(libroPath, 'utf8');
  } catch (e) {
    libroReferencia = '';
  }

  const {
    entrenamiento,
    edad,
    peso,
    altura,
    sexo,
    objetivo,
    actividadFisica
  } = data;

  if (!entrenamiento) {
    throw new Error('No se proporcionaron datos de entrenamiento');
  }

  const material = entrenamiento.material || {};
  const listaMaterial = [
    material.pesas && 'pesas',
    material.bandas && 'bandas',
    material.maquinas && 'máquinas',
    material.barras && 'barras',
    ...(Array.isArray(material.otros) ? material.otros : [])
  ].filter(Boolean);

  const materialesTexto = listaMaterial.length > 0 ? listaMaterial.join(', ') : 'ninguno';

  let reglasDias = '';
  switch (entrenamiento.diasEntrenamiento) {
    case 1:
      reglasDias = `1. Cada día normal DEBE tener entre 3 y 8 ejercicios.
2. Los días de descanso activo DEBEN tener 1-2 ejercicios.
3. El domingo NO debe tener ejercicios.`;
      break;
    case 2:
      reglasDias = `1. Cada día normal DEBE tener entre 4 y 8 ejercicios.
2. Los días de descanso activo DEBEN tener 2-3 ejercicios.
3. El domingo NO debe tener ejercicios.`;
      break;
    default:
      reglasDias = `1. Cada día normal DEBE tener EXACTAMENTE 6 ejercicios.
2. Los días de descanso activo DEBEN tener EXACTAMENTE 2-3 ejercicios.
3. El domingo NO debe tener ejercicios.`;
  }

  const objetivos = (entrenamiento.objetivos || []).join(', ') || 'no especificados';
  const lesiones = (entrenamiento.lesiones || []).join(', ') || 'ninguna';
  const preferencias = (entrenamiento.preferencias || []).join(', ') || 'ninguna';

  return `INSTRUCCIONES DE REFERENCIA (extraídas del libro PowerExplosive):\n${libroReferencia}\n\nIMPORTANTE: RESPONDE EXCLUSIVAMENTE con un bloque JSON válido, comenzando con ###JSON_START### y terminando con ###JSON_END###.\n\nATENCIÓN: El JSON debe cumplir TODAS estas reglas:\n- Todas las claves y strings entre comillas dobles\n- Números sin comillas\n- NO debe haber errores de sintaxis\n- Cada elemento de un objeto debe estar separado por una coma, incluyendo los días de la semana (lunes, martes, ... sábado, domingo)\n- Revisa que no falte ninguna coma entre días\n- NO incluyas comentarios, encabezados ni texto fuera del bloque JSON\n- El bloque debe ser parseable directamente con JSON.parse en JavaScript\n\nGenera un plan de entrenamiento personalizado para la siguiente persona:\n\nEdad: ${edad} años\nPeso: ${peso} kg\nAltura: ${altura} cm\nSexo: ${sexo}\nObjetivo: ${objetivo}\nNivel de actividad física: ${actividadFisica}\n\nConfiguración del entrenamiento:\n- Ubicación: ${entrenamiento.ubicacion}\n- Material disponible: ${materialesTexto}\n- Nivel: ${entrenamiento.nivel}\n- Días de entrenamiento: ${entrenamiento.diasEntrenamiento}\n- Duración de la sesión: ${entrenamiento.duracionSesion} minutos\n- Objetivos específicos: ${objetivos}\n- Lesiones: ${lesiones}\n- Preferencias: ${preferencias}\n\nReglas importantes:\n${reglasDias}\n\n${generatePlanExampleJSON()}`;
}
