import { PlanEntrenamiento, DiaEntrenamiento, SemanaProgresion } from '@/types/plan';

export function validatePlan(plan: any): boolean {
  if (!plan || typeof plan !== 'object') {
    return false;
  }

  const { rutina, progresion, consideraciones } = plan as PlanEntrenamiento;

  if (!rutina || typeof rutina !== 'object') {
    return false;
  }

  const isRutinaValid = Object.entries(rutina).every(([dia, diaEntrenamiento]) => {
    const entrenamiento = diaEntrenamiento as DiaEntrenamiento;
    if (!entrenamiento || typeof entrenamiento !== 'object') {
      return false;
    }

    const { nombre, ejercicios, duracion, intensidad, calorias } = entrenamiento;
    if (
      typeof nombre !== 'string' ||
      !Array.isArray(ejercicios) ||
      typeof duracion !== 'number' ||
      typeof intensidad !== 'string' ||
      typeof calorias !== 'number'
    ) {
      return false;
    }

    return ejercicios.every(ejercicio => {
      const { nombre, series, repeticiones, descanso } = ejercicio;
      return (
        typeof nombre === 'string' &&
        typeof series === 'number' &&
        typeof repeticiones === 'string' &&
        typeof descanso === 'string'
      );
    });
  });

  if (!isRutinaValid) {
    return false;
  }

  if (!progresion || !Array.isArray(progresion.semanas)) {
    return false;
  }

  const isProgresionValid = progresion.semanas.every((semana: SemanaProgresion) => {
    const { semana: numeroSemana, objetivos, ajustes } = semana;
    return (
      typeof numeroSemana === 'number' &&
      Array.isArray(objetivos) &&
      Array.isArray(ajustes)
    );
  });

  if (!isProgresionValid) {
    return false;
  }

  if (!consideraciones || typeof consideraciones !== 'object') {
    return false;
  }

  const { calentamiento, enfriamiento, descanso, notas } = consideraciones;
  if (
    !Array.isArray(calentamiento) ||
    !Array.isArray(enfriamiento) ||
    typeof descanso !== 'string' ||
    typeof notas !== 'string'
  ) {
    return false;
  }

  return true;
}
