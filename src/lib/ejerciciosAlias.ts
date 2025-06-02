// Alias de ejercicios para mapear nombres comunes a los nombres del JSON
export const ALIAS_EJERCICIOS: Record<string, string> = {
  // Alias directos
  'prensa de piernas': 'Prensa en máquina 45°',
  'fondos': 'Fondos en suelo',
  'flexiones': 'Fondos en suelo',
  'sentadilla hack': 'Sentadilla jaka',
  // Alias de variantes
  'gemelos': 'Gemelos con mancuerna',
  'press inclinado': 'Press inclinado mancuernas',
  'curl femoral': 'Femoral en máquina',
  'curl de biceps en barra': 'Curl con barra',
  'press de banca inclinado': 'Press inclinado mancuernas',
  'extensión de pierna': 'Leg extension',
  'extensión de piernas': 'Leg extension',
  'plancha': 'Plancha frontal',
  'plancha frontal': 'Plancha frontal',
  'plancha lateral': 'Plancha lateral',
  'abdominales': 'Plancha frontal', // Si tienes un ejercicio específico de abdominales, cámbialo aquí
  'abdominales oblicuos': 'Plancha lateral', // O crea una entrada específica si tienes imagen
  'triceps en polea': 'Tríceps en polea',
  'extensión de triceps en polea': 'Tríceps en polea',
  'extension de triceps en polea': 'Tríceps en polea',
  'jalón al pecho': 'Jalón al pecho',
  'jalon al pecho': 'Jalón al pecho',
  // Puedes agregar más alias según necesidades
};

// Función para obtener el nombre real del ejercicio
export function obtenerNombreEjercicioAlias(nombre: string): string {
  const normalizado = nombre.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').trim();
  return ALIAS_EJERCICIOS[normalizado] || nombre;
}