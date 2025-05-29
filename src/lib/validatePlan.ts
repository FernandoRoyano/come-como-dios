import { PlanEntrenamiento, DiaEntrenamiento, SemanaProgresion } from '@/types/plan';

export function validatePlan(plan: PlanEntrenamiento): boolean {
  if (!plan || typeof plan !== 'object') {
    return false;
  }

  const { rutina, progresion, consideraciones } = plan;

  if (!rutina || typeof rutina !== 'object') {
    return false;
  }

  const isRutinaValid = Object.entries(rutina).every(([dia, ejercicios]) => {
    if (!Array.isArray(ejercicios)) {
      return false;
    }

    return ejercicios.every(ejercicio => {
      if (typeof ejercicio === 'string') {
        return true;
      }

      if (typeof ejercicio === 'object' && ejercicio !== null) {
        const { nombre, repeticiones, duracion } = ejercicio;
        return (
          typeof nombre === 'string' &&
          (typeof repeticiones === 'number' || repeticiones === undefined) &&
          (typeof duracion === 'string' || duracion === undefined)
        );
      }

      return false;
    });
  });

  if (!isRutinaValid) {
    return false;
  }

  // Progresión y consideraciones son opcionales y pueden ser cadenas
  if (progresion && typeof progresion !== 'string') {
    return false;
  }

  if (consideraciones && typeof consideraciones !== 'string') {
    return false;
  }

  return true;
}
