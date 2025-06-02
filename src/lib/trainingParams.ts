// Parámetros avanzados de series, repeticiones y descanso según tipo de ejercicio o grupo muscular
// Se puede ampliar según necesidades

export type TipoEjercicio =
  | 'multiarticular'
  | 'aislamiento'
  | 'core'
  | 'pierna'
  | 'empuje'
  | 'traccion'
  | 'cardio'
  | 'movilidad';

export interface ParametrosEjercicio {
  series: number;
  repeticiones: string;
  descanso: string;
}

// Mapeo por tipo general
export const parametrosPorTipo: Record<TipoEjercicio, ParametrosEjercicio> = {
  multiarticular: { series: 4, repeticiones: '6-10', descanso: '90-120s' },
  aislamiento:    { series: 3, repeticiones: '10-15', descanso: '45-60s' },
  core:           { series: 3, repeticiones: '15-20', descanso: '30-45s' },
  pierna:         { series: 4, repeticiones: '8-15', descanso: '90-120s' },
  empuje:         { series: 4, repeticiones: '8-12', descanso: '60-90s' },
  traccion:       { series: 4, repeticiones: '8-12', descanso: '60-90s' },
  cardio:         { series: 1, repeticiones: '10-20 min', descanso: '-' },
  movilidad:      { series: 2, repeticiones: '10-15', descanso: '30s' },
};

// Asociación de ejercicios a tipo (puede mejorarse con más granularidad)
export const tipoPorEjercicio: Record<string, TipoEjercicio> = {
  // Multiarticulares
  'sentadilla': 'multiarticular',
  'peso muerto': 'multiarticular',
  'press de banca': 'empuje',
  'press militar': 'empuje',
  'dominadas': 'traccion',
  'pull ups': 'traccion',
  'remo con barra': 'traccion',
  'zancadas': 'pierna',
  'prensa en máquina 45°': 'pierna',
  'hip thrust': 'pierna',
  'fondos': 'empuje',
  'flexiones': 'empuje',
  'plancha': 'core',
  'abdominales': 'core',
  'abdominales oblicuos': 'core',
  'curl de bíceps': 'aislamiento',
  'curl femoral': 'aislamiento',
  'gemelos': 'aislamiento',
  'extensión de tríceps': 'aislamiento',
  'elevación de talones': 'aislamiento',
  'remo invertido prono': 'traccion',
  'press inclinado': 'empuje',
  'press de hombros': 'empuje',
  'sentadilla hack': 'pierna',
  'peso muerto sumo': 'multiarticular',
  'fondos en paralelas': 'empuje',
  'extensión de tríceps en polea': 'aislamiento',
  'extensión de tríceps con mancuerna': 'aislamiento',
  'peso muerto a una pierna': 'pierna',
  // ...agregar más según necesidades
};

// Función para obtener los parámetros según el nombre del ejercicio
export function obtenerParametrosEjercicio(nombre: string): ParametrosEjercicio {
  const nombreKey = nombre.toLowerCase().normalize('NFD').replace(/\s+/g, ' ').replace(/[^a-zA-Z0-9 ]/g, '').trim();
  const tipo = tipoPorEjercicio[nombreKey] || 'multiarticular';
  return parametrosPorTipo[tipo] || parametrosPorTipo['multiarticular'];
}
