import { PlanData } from '@/types/plan';

export function generateTrainingPrompt(data: PlanData): string {
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

  // Validar propiedades de entrenamiento
  const material = entrenamiento.material || {};
  const otrosMateriales = Array.isArray(material.otros) ? material.otros.join(', ') : 'Ninguno';

  // Adaptar reglas según los días de entrenamiento
  let reglasDias = '';
  if (entrenamiento.diasEntrenamiento === 1) {
    reglasDias = `1. Cada día normal DEBE tener entre 3 y 8 ejercicios\n2. Los días de descanso activo DEBEN tener 1-2 ejercicios\n3. El domingo NO debe tener ejercicios`;
  } else if (entrenamiento.diasEntrenamiento === 2) {
    reglasDias = `1. Cada día normal DEBE tener entre 4 y 8 ejercicios\n2. Los días de descanso activo DEBEN tener 2-3 ejercicios\n3. El domingo NO debe tener ejercicios`;
  } else {
    reglasDias = `1. Cada día normal DEBE tener EXACTAMENTE 6 ejercicios\n2. Los días de descanso activo DEBEN tener EXACTAMENTE 2-3 ejercicios\n3. El domingo NO debe tener ejercicios`;
  }

  return `IMPORTANTE: DEBES responder SOLO con un bloque JSON válido, comenzando con ###JSON_START### y terminando con ###JSON_END###.

Genera un plan de entrenamiento personalizado y detallado para una persona con las siguientes características:

Edad: ${edad} años
Peso: ${peso} kg
Altura: ${altura} cm
Sexo: ${sexo}
Objetivo: ${objetivo}
Nivel de actividad física: ${actividadFisica}

Configuración del entrenamiento:
- Material disponible: ${otrosMateriales}

${reglasDias}`;
}