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
Objetivo general: ${objetivo}
Nivel de actividad física: ${actividadFisica}

Configuración del entrenamiento:
- Ubicación: ${entrenamiento.ubicacion}
- Nivel: ${entrenamiento.nivel}
- Días por semana: ${entrenamiento.diasEntrenamiento}
- Duración de sesión: ${entrenamiento.duracionSesion} minutos
- Objetivos específicos: ${entrenamiento.objetivos.join(', ')}
- Lesiones/Limitaciones: ${entrenamiento.lesiones.join(', ') || 'Ninguna'}
- Preferencias: ${entrenamiento.preferencias.join(', ') || 'Ninguna'}

Material disponible:
- Pesas: ${entrenamiento.material.pesas ? 'Sí' : 'No'}
- Bandas elásticas: ${entrenamiento.material.bandas ? 'Sí' : 'No'}
- Máquinas: ${entrenamiento.material.maquinas ? 'Sí' : 'No'}
- Barras: ${entrenamiento.material.barras ? 'Sí' : 'No'}
- Otro material: ${entrenamiento.material.otros.join(', ') || 'Ninguno'}

REGLAS ESTRICTAS DE VALIDACIÓN:\n${reglasDias}\n4. TODOS los ejercicios DEBEN incluir:\n   - Nombre del ejercicio\n   - Número de series\n   - Número de repeticiones\n   - Tiempo de descanso\n   - URL de imagen\n   - Notas técnicas\n5. El JSON DEBE ser válido y estar correctamente formateado\n6. TODOS los días especificados DEBEN estar incluidos\n7. NO se permiten días con menos ejercicios de los indicados (excepto descanso activo y domingo)\n\nFORMATO DE RESPUESTA:\nTu respuesta DEBE comenzar exactamente con:\n###JSON_START###\n\nY terminar exactamente con:\n###JSON_END###\n\nEntre estos delimitadores, DEBE haber SOLO un objeto JSON válido, sin ningún otro texto.

Instrucciones específicas para el plan:
1. Cada día de entrenamiento normal debe incluir entre 3 y 8 ejercicios diferentes
2. Los días de descanso activo deben incluir entre 1 y 3 ejercicios de movilidad y recuperación
3. El domingo es día de descanso completo sin ejercicios
4. Los ejercicios deben estar organizados por grupos musculares
5. Incluir ejercicios compuestos y de aislamiento
6. Especificar series, repeticiones y descanso entre series
7. Incluir ejercicios de calentamiento específicos para cada grupo muscular
8. Adaptar los ejercicios según el material disponible
9. Considerar las lesiones y limitaciones mencionadas
10. Incluir progresión semanal en intensidad o volumen
11. Añadir ejercicios de movilidad y estiramiento
12. Especificar técnica y puntos clave para cada ejercicio

Ejemplo del formato JSON esperado:

###JSON_START###
{
  "rutina": {
    "lunes": {
      "nombre": "Entrenamiento de Fuerza - Pecho y Tríceps",
      "duracion": 60,
      "intensidad": "Alta",
      "calorias": 400,
      "ejercicios": [
        {
          "nombre": "Press de Banca con Barra",
          "series": 4,
          "repeticiones": "8-10",
          "descanso": "90 segundos",
          "imagen": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/bench-press-muscles-worked.jpg",
          "notas": "Mantener los hombros retraídos y los pies firmes en el suelo",
          "material": "Barra y banco",
          "musculos": ["Pectoral mayor", "Tríceps", "Deltoides anterior"],
          "descripcion": "Ejercicio compuesto para el pecho y tríceps"
        },
        {
          "nombre": "Aperturas con Mancuernas",
          "series": 3,
          "repeticiones": "12-15",
          "descanso": "60 segundos",
          "imagen": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/dumbbell-fly-muscles-worked.jpg",
          "notas": "Mantener una ligera flexión en los codos",
          "material": "Mancuernas y banco",
          "musculos": ["Pectoral mayor", "Deltoides anterior"],
          "descripcion": "Ejercicio de aislamiento para el pecho"
        },
        {
          "nombre": "Press de Banca Inclinado",
          "series": 4,
          "repeticiones": "8-10",
          "descanso": "90 segundos",
          "imagen": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/incline-bench-press-muscles-worked.jpg",
          "notas": "Ajustar el banco a 30-45 grados"
        },
        {
          "nombre": "Extensiones de Tríceps en Polea",
          "series": 3,
          "repeticiones": "12-15",
          "descanso": "60 segundos",
          "imagen": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/tricep-pushdown-muscles-worked.jpg",
          "notas": "Mantener los codos cerca del cuerpo"
        },
        {
          "nombre": "Fondos en Paralelas",
          "series": 3,
          "repeticiones": "10-12",
          "descanso": "90 segundos",
          "imagen": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/dips-muscles-worked.jpg",
          "notas": "Inclinar el torso hacia adelante para enfatizar el pecho"
        },
        {
          "nombre": "Press Francés",
          "series": 3,
          "repeticiones": "10-12",
          "descanso": "60 segundos",
          "imagen": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/french-press-muscles-worked.jpg",
          "notas": "Mantener los brazos estables"
        }
      ]
    },
    "martes": {
      "nombre": "Entrenamiento de Fuerza - Piernas",
      "duracion": "75 minutos",
      "intensidad": "Alta",
      "calorias": "500-600",
      "ejercicios": [
        {
          "nombre": "Sentadillas con Barra",
          "series": 4,
          "repeticiones": "8-10",
          "descanso": "120 segundos",
          "imagen": "https://example.com/images/squat.jpg",
          "notas": "Mantener el pecho arriba y las rodillas alineadas"
        },
        {
          "nombre": "Peso Muerto Rumano",
          "series": 4,
          "repeticiones": "8-10",
          "descanso": "120 segundos",
          "imagen": "https://example.com/images/romanian-deadlift.jpg",
          "notas": "Mantener la espalda recta y las rodillas ligeramente flexionadas"
        },
        {
          "nombre": "Extensiones de Cuádriceps",
          "series": 3,
          "repeticiones": "12-15",
          "descanso": "60 segundos",
          "imagen": "https://example.com/images/leg-extension.jpg",
          "notas": "Contraer los cuádriceps en la parte superior"
        },
        {
          "nombre": "Curl de Femoral",
          "series": 3,
          "repeticiones": "12-15",
          "descanso": "60 segundos",
          "imagen": "https://example.com/images/leg-curl.jpg",
          "notas": "Mantener las caderas firmes en el banco"
        },
        {
          "nombre": "Elevaciones de Pantorrilla",
          "series": 4,
          "repeticiones": "15-20",
          "descanso": "45 segundos",
          "imagen": "https://example.com/images/calf-raise.jpg",
          "notas": "Hacer el movimiento completo"
        },
        {
          "nombre": "Zancadas con Mancuernas",
          "series": 3,
          "repeticiones": "10-12 por pierna",
          "descanso": "60 segundos",
          "imagen": "https://example.com/images/lunges.jpg",
          "notas": "Mantener el torso erguido"
        }
      ]
    },
    "miercoles": {
      "nombre": "Descanso activo",
      "ejercicios": [
        {
          "nombre": "Movilidad articular",
          "series": 1,
          "repeticiones": "10-15",
          "descripcion": "Ejercicios de movilidad para todas las articulaciones principales.",
          "material": "ninguno",
          "musculos": ["todo el cuerpo"],
          "notas": "Enfocarse en la calidad del movimiento y la respiración."
        },
        {
          "nombre": "Estiramientos dinámicos",
          "series": 1,
          "repeticiones": "8-10",
          "descripcion": "Estiramientos suaves en movimiento para mejorar la flexibilidad.",
          "material": "ninguno",
          "musculos": ["todo el cuerpo"],
          "notas": "No forzar los estiramientos, mantener un rango cómodo."
        },
        {
          "nombre": "Respiración controlada",
          "series": 1,
          "repeticiones": "5 minutos",
          "descripcion": "Ejercicios de respiración para mejorar la recuperación.",
          "material": "ninguno",
          "musculos": ["diafragma"],
          "notas": "Enfocarse en la respiración profunda y controlada."
        }
      ],
      "duracion": 30,
      "intensidad": "Baja",
      "calorias": 150
    },
    "jueves": {
      "nombre": "Entrenamiento de Fuerza - Hombros y Bíceps",
      "duracion": "60 minutos",
      "intensidad": "Alta",
      "calorias": "400-500",
      "ejercicios": [
        {
          "nombre": "Press Militar con Barra",
          "series": 4,
          "repeticiones": "8-10",
          "descanso": "90 segundos",
          "imagen": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/overhead-press-muscles-worked.jpg",
          "notas": "Mantener el core activo y la espalda recta"
        },
        {
          "nombre": "Elevaciones Laterales con Mancuernas",
          "series": 3,
          "repeticiones": "12-15",
          "descanso": "60 segundos",
          "imagen": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/lateral-raise-muscles-worked.jpg",
          "notas": "Mantener una ligera flexión en los codos"
        },
        {
          "nombre": "Elevaciones Frontales con Mancuernas",
          "series": 3,
          "repeticiones": "12-15",
          "descanso": "60 segundos",
          "imagen": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/front-raise-muscles-worked.jpg",
          "notas": "Controlar el movimiento en ambas fases"
        },
        {
          "nombre": "Curl de Bíceps con Barra",
          "series": 4,
          "repeticiones": "8-10",
          "descanso": "90 segundos",
          "imagen": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/barbell-curl-muscles-worked.jpg",
          "notas": "Mantener los codos cerca del cuerpo"
        },
        {
          "nombre": "Curl Martillo con Mancuernas",
          "series": 3,
          "repeticiones": "10-12",
          "descanso": "60 segundos",
          "imagen": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/hammer-curl-muscles-worked.jpg",
          "notas": "Mantener las muñecas neutras"
        },
        {
          "nombre": "Curl Inclinado con Mancuernas",
          "series": 3,
          "repeticiones": "10-12",
          "descanso": "60 segundos",
          "imagen": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/incline-curl-muscles-worked.jpg",
          "notas": "Ajustar el banco a 45 grados"
        }
      ]
    },
    "viernes": {
      "nombre": "Entrenamiento de Fuerza - Espalda y Tríceps",
      "duracion": "60 minutos",
      "intensidad": "Alta",
      "calorias": "400-500",
      "ejercicios": [
        {
          "nombre": "Dominadas",
          "series": 4,
          "repeticiones": "8-10",
          "descanso": "90 segundos",
          "imagen": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/pull-up-muscles-worked.jpg",
          "notas": "Si no se pueden hacer completas, usar bandas de asistencia"
        },
        {
          "nombre": "Remo con Barra",
          "series": 4,
          "repeticiones": "8-10",
          "descanso": "90 segundos",
          "imagen": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/barbell-row-muscles-worked.jpg",
          "notas": "Mantener la espalda recta y el core activo"
        },
        {
          "nombre": "Remo con Mancuernas",
          "series": 3,
          "repeticiones": "10-12",
          "descanso": "60 segundos",
          "imagen": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/dumbbell-row-muscles-worked.jpg",
          "notas": "Mantener el torso paralelo al suelo"
        },
        {
          "nombre": "Extensiones de Tríceps en Polea",
          "series": 3,
          "repeticiones": "12-15",
          "descanso": "60 segundos",
          "imagen": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/tricep-pushdown-muscles-worked.jpg",
          "notas": "Mantener los codos cerca del cuerpo"
        },
        {
          "nombre": "Extensiones de Tríceps con Mancuerna",
          "series": 3,
          "repeticiones": "12-15",
          "descanso": "60 segundos",
          "imagen": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/tricep-extension-muscles-worked.jpg",
          "notas": "Mantener el brazo superior estable"
        },
        {
          "nombre": "Fondos en Paralelas",
          "series": 3,
          "repeticiones": "10-12",
          "descanso": "90 segundos",
          "imagen": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/dips-muscles-worked.jpg",
          "notas": "Inclinar el torso hacia adelante para enfatizar el pecho"
        }
      ]
    },
    "sabado": {
      "nombre": "Entrenamiento de Fuerza - Piernas",
      "duracion": "75 minutos",
      "intensidad": "Alta",
      "calorias": "500-600",
      "ejercicios": [
        {
          "nombre": "Sentadillas con Barra",
          "series": 4,
          "repeticiones": "8-10",
          "descanso": "120 segundos",
          "imagen": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/squat-muscles-worked.jpg",
          "notas": "Mantener el pecho arriba y las rodillas alineadas"
        },
        {
          "nombre": "Peso Muerto Rumano",
          "series": 4,
          "repeticiones": "8-10",
          "descanso": "120 segundos",
          "imagen": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/romanian-deadlift-muscles-worked.jpg",
          "notas": "Mantener la espalda recta y las rodillas ligeramente flexionadas"
        },
        {
          "nombre": "Extensiones de Cuádriceps",
          "series": 3,
          "repeticiones": "12-15",
          "descanso": "60 segundos",
          "imagen": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/leg-extension-muscles-worked.jpg",
          "notas": "Contraer los cuádriceps en la parte superior"
        },
        {
          "nombre": "Curl de Femoral",
          "series": 3,
          "repeticiones": "12-15",
          "descanso": "60 segundos",
          "imagen": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/leg-curl-muscles-worked.jpg",
          "notas": "Mantener las caderas firmes en el banco"
        },
        {
          "nombre": "Elevaciones de Pantorrilla",
          "series": 4,
          "repeticiones": "15-20",
          "descanso": "45 segundos",
          "imagen": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/calf-raise-muscles-worked.jpg",
          "notas": "Hacer el movimiento completo"
        },
        {
          "nombre": "Zancadas con Mancuernas",
          "series": 3,
          "repeticiones": "10-12 por pierna",
          "descanso": "60 segundos",
          "imagen": "https://www.inspireusafoundation.org/wp-content/uploads/2022/03/lunges-muscles-worked.jpg",
          "notas": "Mantener el torso erguido"
        }
      ]
    },
    "domingo": {
      "nombre": "Descanso completo",
      "ejercicios": [],
      "duracion": 0,
      "intensidad": "Nula",
      "calorias": 0
    }
  },
  "progresion": {
    "semanas": [
      {
        "semana": 1,
        "objetivos": ["Aprender técnica", "Adaptación muscular", "Establecer bases"],
        "ajustes": ["Pesos ligeros", "Enfoque en forma", "Descansos más largos"]
      },
      {
        "semana": 2,
        "objetivos": ["Aumentar intensidad", "Mejorar técnica", "Progresar en pesos"],
        "ajustes": ["Aumentar pesos un 5%", "Reducir descansos", "Añadir series de calentamiento"]
      },
      {
        "semana": 3,
        "objetivos": ["Maximizar volumen", "Refinar técnica", "Aumentar intensidad"],
        "ajustes": ["Aumentar series", "Añadir ejercicios de aislamiento", "Optimizar descansos"]
      },
      {
        "semana": 4,
        "objetivos": ["Recuperación activa", "Evaluar progreso", "Preparar siguiente mesociclo"],
        "ajustes": ["Reducir volumen", "Mantener intensidad", "Enfocarse en técnica"]
      }
    ]
  },
  "consideraciones": {
    "calentamiento": [
      "5-10 minutos cardio ligero",
      "Movilidad articular de hombros y caderas",
      "Series de calentamiento progresivo"
    ],
    "enfriamiento": [
      "Estiramientos estáticos",
      "Foam rolling",
      "Respiración controlada"
    ],
    "descanso": "48 horas entre grupos musculares",
    "notas": "Ajustar pesos según progreso y sensación. Mantener un diario de entrenamiento."
  }
}
###JSON_END###

IMPORTANTE: Tu respuesta DEBE comenzar con ###JSON_START### y terminar con ###JSON_END###, y contener SOLO el JSON entre estos delimitadores.`;
}