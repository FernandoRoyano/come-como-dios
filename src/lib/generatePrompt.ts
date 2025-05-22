import { PlanData } from '@/types/plan';

export function generatePrompt(data: PlanData): string {
  const {
    edad,
    peso,
    altura,
    sexo,
    objetivo,
    restricciones,
    actividadFisica,
    intensidadTrabajo,
    numeroComidas,
  } = data;

  const restriccionesStr = restricciones.length > 0 
    ? restricciones.join(', ') 
    : 'Ninguna';

  return `Genera un plan de alimentación semanal personalizado con las siguientes características:

Edad: ${edad} años
Peso: ${peso} kg
Altura: ${altura} cm
Sexo: ${sexo}
Objetivo: ${objetivo}
Restricciones alimentarias: ${restriccionesStr}
Actividad física: ${actividadFisica}
Intensidad del trabajo: ${intensidadTrabajo}
Número de comidas diarias: ${numeroComidas}

El plan debe incluir:
1. Un menú detallado para cada día de la semana
2. Lista de la compra organizada por categorías
3. Macronutrientes diarios y totales

Responde SOLO con un objeto JSON con la siguiente estructura:
###JSON_START###
{
  "dias": {
    "Lunes": {
      "desayuno": { "nombre": "", "descripcion": "", "calorias": 0, "proteinas": 0, "carbohidratos": 0, "grasas": 0 },
      "almuerzo": { "nombre": "", "descripcion": "", "calorias": 0, "proteinas": 0, "carbohidratos": 0, "grasas": 0 },
      "cena": { "nombre": "", "descripcion": "", "calorias": 0, "proteinas": 0, "carbohidratos": 0, "grasas": 0 }
    },
    // ... resto de días
  },
  "listaCompra": {
    "verduras": [],
    "proteinas": [],
    "carbohidratos": [],
    "grasas": []
  },
  "macronutrientes": {
    "calorias": 0,
    "proteinas": 0,
    "carbohidratos": 0,
    "grasas": 0
  }
}
###JSON_END###`;
}
  