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

  const material = entrenamiento.material || {};
  const listaMaterial = [
    ...(material.pesas ? ['pesas'] : []),
    ...(material.bandas ? ['bandas'] : []),
    ...(material.maquinas ? ['máquinas'] : []),
    ...(material.barras ? ['barras'] : []),
    ...(Array.isArray(material.otros) ? material.otros : [])
  ];

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

  return `IMPORTANTE: RESPONDE EXCLUSIVAMENTE con un bloque JSON válido, comenzando con ###JSON_START### y terminando con ###JSON_END###.

Genera un plan de entrenamiento personalizado para la siguiente persona:

Edad: ${edad} años
Peso: ${peso} kg
Altura: ${altura} cm
Sexo: ${sexo}
Objetivo: ${objetivo}
Nivel de actividad física: ${actividadFisica}

Configuración del entrenamiento:
- Ubicación: ${entrenamiento.ubicacion}
- Material disponible: ${materialesTexto}
- Nivel: ${entrenamiento.nivel}
- Días de entrenamiento: ${entrenamiento.diasEntrenamiento}
- Duración de la sesión: ${entrenamiento.duracionSesion} minutos
- Objetivos específicos: ${(entrenamiento.objetivos || []).join(', ') || 'no especificados'}
- Lesiones: ${(entrenamiento.lesiones || []).join(', ') || 'ninguna'}
- Preferencias: ${(entrenamiento.preferencias || []).join(', ') || 'ninguna'}

Reglas importantes:
${reglasDias}

###JSON_START###
{
  "plan_entrenamiento": {
    "usuario": {
      "edad": ${edad},
      "peso": ${peso},
      "altura": ${altura},
      "sexo": "${sexo}",
      "objetivo": "${objetivo}",
      "nivel_actividad": "${actividadFisica}"
    },
    "material_disponible": [${listaMaterial.map(m => `"${m}"`).join(', ')}],
    "dias_entrenamiento": {
      "lunes": [],
      "martes": [],
      "miercoles": [],
      "jueves": [],
      "viernes": [],
      "sabado": [],
      "domingo": []
    },
    "progresion": "",
    "consideraciones": ""
  }
}
###JSON_END###`;
}
