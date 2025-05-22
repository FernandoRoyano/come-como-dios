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

  return `Eres un nutricionista profesional. Genera un plan de alimentación semanal personalizado con las siguientes características:

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
1. Un menú detallado para cada día de la semana (Lunes a Domingo)
2. Lista de la compra organizada por categorías, indicando la cantidad exacta de cada alimento (por ejemplo: "6 latas de atún", "2 lechugas", "2 bolsas de espinacas"). Las cantidades deben estar ajustadas a las comidas propuestas y sumar lo necesario para toda la semana.
3. Macronutrientes diarios y totales

IMPORTANTE: Responde ÚNICAMENTE con un objeto JSON válido entre los delimitadores ###JSON_START### y ###JSON_END###.
NO incluyas ningún texto adicional, explicaciones o comentarios fuera de estos delimitadores.

###JSON_START###
{
  "dias": {
    "Lunes": {
      "desayuno": { "nombre": "", "descripcion": "", "calorias": 0, "proteinas": 0, "carbohidratos": 0, "grasas": 0 },
      "almuerzo": { "nombre": "", "descripcion": "", "calorias": 0, "proteinas": 0, "carbohidratos": 0, "grasas": 0 },
      "cena": { "nombre": "", "descripcion": "", "calorias": 0, "proteinas": 0, "carbohidratos": 0, "grasas": 0 }
    },
    "Martes": {
      "desayuno": { "nombre": "", "descripcion": "", "calorias": 0, "proteinas": 0, "carbohidratos": 0, "grasas": 0 },
      "almuerzo": { "nombre": "", "descripcion": "", "calorias": 0, "proteinas": 0, "carbohidratos": 0, "grasas": 0 },
      "cena": { "nombre": "", "descripcion": "", "calorias": 0, "proteinas": 0, "carbohidratos": 0, "grasas": 0 }
    },
    "Miércoles": {
      "desayuno": { "nombre": "", "descripcion": "", "calorias": 0, "proteinas": 0, "carbohidratos": 0, "grasas": 0 },
      "almuerzo": { "nombre": "", "descripcion": "", "calorias": 0, "proteinas": 0, "carbohidratos": 0, "grasas": 0 },
      "cena": { "nombre": "", "descripcion": "", "calorias": 0, "proteinas": 0, "carbohidratos": 0, "grasas": 0 }
    },
    "Jueves": {
      "desayuno": { "nombre": "", "descripcion": "", "calorias": 0, "proteinas": 0, "carbohidratos": 0, "grasas": 0 },
      "almuerzo": { "nombre": "", "descripcion": "", "calorias": 0, "proteinas": 0, "carbohidratos": 0, "grasas": 0 },
      "cena": { "nombre": "", "descripcion": "", "calorias": 0, "proteinas": 0, "carbohidratos": 0, "grasas": 0 }
    },
    "Viernes": {
      "desayuno": { "nombre": "", "descripcion": "", "calorias": 0, "proteinas": 0, "carbohidratos": 0, "grasas": 0 },
      "almuerzo": { "nombre": "", "descripcion": "", "calorias": 0, "proteinas": 0, "carbohidratos": 0, "grasas": 0 },
      "cena": { "nombre": "", "descripcion": "", "calorias": 0, "proteinas": 0, "carbohidratos": 0, "grasas": 0 }
    },
    "Sábado": {
      "desayuno": { "nombre": "", "descripcion": "", "calorias": 0, "proteinas": 0, "carbohidratos": 0, "grasas": 0 },
      "almuerzo": { "nombre": "", "descripcion": "", "calorias": 0, "proteinas": 0, "carbohidratos": 0, "grasas": 0 },
      "cena": { "nombre": "", "descripcion": "", "calorias": 0, "proteinas": 0, "carbohidratos": 0, "grasas": 0 }
    },
    "Domingo": {
      "desayuno": { "nombre": "", "descripcion": "", "calorias": 0, "proteinas": 0, "carbohidratos": 0, "grasas": 0 },
      "almuerzo": { "nombre": "", "descripcion": "", "calorias": 0, "proteinas": 0, "carbohidratos": 0, "grasas": 0 },
      "cena": { "nombre": "", "descripcion": "", "calorias": 0, "proteinas": 0, "carbohidratos": 0, "grasas": 0 }
    }
  },
  "listaCompra": {
    "verduras": ["2 lechugas", "2 bolsas de espinacas"],
    "proteinas": ["6 latas de atún", "1 kg de pollo"],
    "carbohidratos": ["1 kg de arroz", "7 rebanadas de pan integral"],
    "grasas": ["1 botella de aceite de oliva"]
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
  