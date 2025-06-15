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
  comidas?: Comida[];
}

export interface Ejercicio {
  id: string;
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
  semana: string; // Cambiado a string para ser compatible con la IA y el default
  objetivo: string; // Cambiado a string para ser compatible con la IA y el default
  detalles: string; // Cambiado a string para ser compatible con la IA y el default
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
    ubicacion: 'Casa' | 'Gimnasio' | 'Exterior';
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
  caloriasRecomendadas?: number;
  tipoDieta?: string; // Añadido para permitir filtrado explícito
}

export interface UserData {
  sexo: string;
  edad: number;
  altura: number;
  actividadFisica: string;
  objetivo: string;
  entrenamiento?: {
    ubicacion: string;
    nivel: string;
    material?: {
      pesas?: boolean;
      bandas?: boolean;
      maquinas?: boolean;
      barras?: boolean;
      otros?: string[];
    };
  };
}
