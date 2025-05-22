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
}

export interface PlanData {
  edad: number;
  peso: number;
  altura: number;
  sexo: string;
  objetivo: string;
  restricciones: string[];
  actividadFisica: string;
  intensidadTrabajo: string;
  numeroComidas: number;
} 