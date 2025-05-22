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
}

export interface Ejercicio {
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
} 