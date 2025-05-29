import { PlanEntrenamiento, DiaEntrenamiento } from '@/types/plan';

export function validatePlan(plan: PlanEntrenamiento): boolean {
  if (!plan || typeof plan !== 'object') return false;

  const { rutina, progresion, consideraciones } = plan;

  if (!rutina || typeof rutina !== 'object') return false;

  const isRutinaValida = Object.entries(rutina).every(([_, dia]: [string, DiaEntrenamiento]) => {
    if (
      !dia ||
      typeof dia !== 'object' ||
      typeof dia.nombre !== 'string' ||
      !Array.isArray(dia.ejercicios) ||
      typeof dia.duracion !== 'number' ||
      typeof dia.intensidad !== 'string' ||
      typeof dia.calorias !== 'number'
    ) {
      return false;
    }

    const ejerciciosValidos = dia.ejercicios.every((ejercicio) => {
      if (!ejercicio || typeof ejercicio !== 'object') return false;

      return (
        typeof ejercicio.id === 'string' &&
        typeof ejercicio.nombre === 'string' &&
        typeof ejercicio.series === 'number' &&
        typeof ejercicio.repeticiones === 'string' &&
        typeof ejercicio.descripcion === 'string' &&
        typeof ejercicio.material === 'string' &&
        Array.isArray(ejercicio.musculos) &&
        typeof ejercicio.notas === 'string' &&
        typeof ejercicio.descanso === 'string'
      );
    });

    return ejerciciosValidos;
  });

  const progresionOk =
    progresion === undefined || typeof progresion === 'string';
  const consideracionesOk =
    consideraciones === undefined || typeof consideraciones === 'string';

  return isRutinaValida && progresionOk && consideracionesOk;
}
