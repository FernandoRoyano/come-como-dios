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
    numeroComidas
  } = data;

  const restrStr = restricciones.length > 0
    ? restricciones.join(', ')
    : 'Ninguna';

  return `
Eres un nutricionista profesional. Crea un plan de alimentación semanal completo para un paciente con las siguientes características:

🔹 Datos del paciente:
- Edad: ${edad} años
- Peso: ${peso} kg
- Altura: ${altura} cm
- Sexo: ${sexo}
- Objetivo: ${objetivo}
- Actividad física: ${actividadFisica}
- Intensidad del trabajo: ${intensidadTrabajo}
- Número de comidas al día: ${numeroComidas}
- Restricciones alimentarias: ${restrStr}

🧾 El plan debe incluir:
1. 7 días completos con ${numeroComidas} comidas cada día
2. Cada comida debe tener:
   - Nombre
   - Descripción con ingredientes y cantidades exactas
   - Valor nutricional (calorías, proteínas, carbohidratos, grasas)
3. Lista de la compra organizada por categorías
4. Resumen de macronutrientes diarios

📦 Devuelve el plan en formato JSON entre los delimitadores ###JSON_START### y ###JSON_END### con esta estructura:

{
  "dias": {
    "Lunes": {
      "desayuno": {
        "nombre": "Desayuno",
        "descripcion": "100g avena, 200ml leche, 1 plátano",
        "calorias": 450,
        "proteinas": 20,
        "carbohidratos": 50,
        "grasas": 15
      },
      "almuerzo": { ... },
      "cena": { ... }
    },
    "Martes": { ... },
    // ... resto de días
  },
  "listaCompra": {
    "Frutas": ["Plátanos", "Manzanas", ...],
    "Verduras": ["Espinacas", "Tomates", ...],
    // ... resto de categorías
  },
  "macronutrientes": {
    "calorias": 2500,
    "proteinas": 150,
    "carbohidratos": 300,
    "grasas": 80
  }
}

❌ No incluyas explicaciones, encabezados, texto adicional ni comentarios.
`;
}
  