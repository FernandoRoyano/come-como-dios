export interface Comida {
  nombre: string;
  descripcion: string;
  calorias: number;
  proteinas: number;
  carbohidratos: number;
  grasas: number;
}

export interface Dia {
  desayuno: Comida;
  almuerzo: Comida;
  cena: Comida;
  snacks?: Comida[];
}

export interface Plan {
  dias: {
    [key: string]: Dia;
  };
  listaCompra: {
    [key: string]: string[];
  };
  macronutrientes: {
    calorias: number;
    proteinas: number;
    carbohidratos: number;
    grasas: number;
  };
  restricciones?: string[];
  objetivo?: string;
  numeroComidas?: number;
  comidas?: Comida[]; // Nueva propiedad para almacenar las comidas generadas
}

export interface Ejercicio {
  id: string; // Identificador único para el ejercicio
  nombre: string;
  series: number;
  repeticiones: string;
  descripcion?: string;
  material?: string;
  musculos?: string[];
  notas?: string;
  imagen?: string;
  descanso?: string;
}

export interface DiaEntrenamiento {
  nombre: string;
  ejercicios: Ejercicio[];
  duracion: number;
  intensidad: string;
  calorias: number;
}

export interface SemanaProgresion {
  semana: number;
  objetivos: string[];
  ajustes: string[];
}

export interface PlanEntrenamiento {
  rutina: {
    [key: string]: DiaEntrenamiento;
  };
  progresion: {
    semanas: SemanaProgresion[];
  };
  consideraciones: {
    calentamiento: string[];
    enfriamiento: string[];
    descanso: string;
    notas: string;
  };
}

export interface PlanData {
  servicios: {
    nutricion: boolean;
    entrenamiento: boolean;
  };
  entrenamiento?: {
    ubicacion: 'casa' | 'gimnasio' | null;
    material: {
      pesas: boolean;
      bandas: boolean;
      maquinas: boolean;
      barras: boolean;
      otros: string[];
    };
    nivel: string;
    diasEntrenamiento: number;
    duracionSesion: number;
    objetivos: string[];
    lesiones: string[];
    preferencias: string[];
  };
  edad: number;
  peso: number;
  altura: number;
  sexo: string;
  objetivo: string;
  restricciones: string[];
  alimentosNoDeseados: string[];
  actividadFisica: string;
  intensidadTrabajo: string;
  numeroComidas: number;
  caloriasRecomendadas?: number; // Nueva propiedad para las calorías diarias recomendadas
}

export interface UserData {
  sexo: string; // Cambiado para aceptar cualquier string
  edad: number;
  altura: number; // en centímetros
  actividadFisica: string; // Cambiado para aceptar cualquier string
  objetivo: string; // Cambiado para aceptar cualquier string
  entrenamiento?: {
    ubicacion: string; // Cambiado para aceptar cualquier string
    nivel: string; // Cambiado para aceptar cualquier string
    material?: {
      pesas?: boolean;
      bandas?: boolean;
      maquinas?: boolean;
      barras?: boolean;
      otros?: string[];
    };
  };
}