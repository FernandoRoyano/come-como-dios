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
    alimentosNoDeseados
  } = data;

  return `Genera un plan de comidas personalizado para una persona con las siguientes características:

Edad: ${edad} años
Peso: ${peso} kg
Altura: ${altura} cm
Sexo: ${sexo}
Objetivo: ${objetivo}
Restricciones alimentarias: ${restricciones.join(', ') || 'Ninguna'}
Actividad física: ${actividadFisica}
Intensidad del trabajo: ${intensidadTrabajo}
Número de comidas diarias: ${numeroComidas}
Alimentos no deseados: ${alimentosNoDeseados.join(', ') || 'Ninguno'}

IMPORTANTE: 
- NO incluir NINGUNO de los alimentos no deseados en el plan de comidas
- Si se mencionan alimentos no deseados, asegúrate de NO incluirlos en ninguna comida ni en la lista de compra
- Si un ingrediente es similar a uno no deseado, también debe evitarse

Genera un plan semanal detallado que incluya:

1. Un menú detallado para cada día de la semana (Lunes a Domingo)
2. Una lista de compra completa y detallada organizada por categorías
3. Los totales de macronutrientes diarios

IMPORTANTE: La respuesta DEBE comenzar con ###JSON_START### y terminar con ###JSON_END###, y contener SOLO el JSON entre estos delimitadores.

Ejemplo del formato JSON esperado:

###JSON_START###
{
  "dias": {
    "lunes": {
      "desayuno": {
        "nombre": "Desayuno energético",
        "descripcion": "200g avena, 300ml leche, 1 plátano",
        "calorias": 450,
        "proteinas": 15,
        "carbohidratos": 70,
        "grasas": 10
      },
      "almuerzo": {
        "nombre": "Ensalada de pollo",
        "descripcion": "150g pechuga, 100g lechuga, 50g tomate",
        "calorias": 350,
        "proteinas": 35,
        "carbohidratos": 15,
        "grasas": 12
      },
      "cena": {
        "nombre": "Pescado al horno",
        "descripcion": "200g merluza, 100g patatas, 50g zanahorias",
        "calorias": 400,
        "proteinas": 40,
        "carbohidratos": 30,
        "grasas": 15
      }
    }
  },
  "listaCompra": {
    "verduras": ["100g lechuga", "50g tomate", "50g zanahorias"],
    "proteinas": ["150g pechuga de pollo", "200g merluza"],
    "carbohidratos": ["200g avena", "100g patatas"],
    "grasas": ["300ml leche"],
    "condimentos": ["Sal", "Pimienta"],
    "lacteos": ["300ml leche"],
    "frutas": ["1 plátano"]
  },
  "macronutrientes": {
    "calorias": 1200,
    "proteinas": 90,
    "carbohidratos": 115,
    "grasas": 37
  }
}
###JSON_END###

Asegúrate de que:
1. Todos los nombres de propiedades y valores string estén entre comillas dobles
2. Los números no tengan comillas
3. El JSON sea válido y esté correctamente formateado
4. NO incluir NINGUNO de los alimentos no deseados en el plan
5. La lista de compra incluya TODOS los ingredientes necesarios con cantidades exactas
6. Los macronutrientes sean números reales y positivos
7. La respuesta DEBE comenzar con ###JSON_START### y terminar con ###JSON_END###`;
}
  