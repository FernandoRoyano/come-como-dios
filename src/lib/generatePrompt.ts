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
Restricciones alimentarias: ${restricciones?.length ? restricciones.join(', ') : 'Ninguna'}
Actividad física: ${actividadFisica}
Intensidad del trabajo: ${intensidadTrabajo}
Número de comidas diarias: ${numeroComidas}
Alimentos no deseados: ${alimentosNoDeseados?.length ? alimentosNoDeseados.join(', ') : 'Ninguno'}

📌 EJEMPLO DE CÁLCULO ESPERADO:

Edad: 30, Peso: 80 kg, Altura: 180 cm, Sexo: Hombre
TMB = (10 × 80) + (6.25 × 180) − (5 × 30) + 5 = 1775
GET = 1775 × 1.5 (actividad moderada) = 2662.5
Objetivo: Ganar masa muscular → 2662.5 × 1.2 = 3195 kcal
Calorías finales = 3200 (mínimo recomendado para este perfil)

🔢 CÁLCULOS QUE DEBES HACER:

1. Calcular el TMB usando la fórmula Mifflin-St Jeor:
   · Hombres: (10 × peso) + (6.25 × altura) − (5 × edad) + 5
   · Mujeres: (10 × peso) + (6.25 × altura) − (5 × edad) − 161

2. Multiplicar por el nivel de actividad física:
   · Sedentario: 1.2
   · Ligero: 1.3
   · Moderado: 1.5
   · Intenso: 1.7
   · Muy intenso: 1.9

3. Ajustar según el objetivo:
   · Pérdida de grasa: aplicar un déficit del 20–25%
   · Ganancia muscular: aplicar un superávit del 15–20%. 
     ⚠️ Mínimo 3200 kcal si GET ≥ 2500. Si GET < 2500, usar al menos 2800 kcal.
   · Mantenimiento: usar el GET sin ajuste
   · Rendimiento: aplicar superávit del 10%, priorizando carbohidratos

4. Calorías mínimas permitidas:
   · Hombres: nunca menos de 1500 kcal
   · Mujeres: nunca menos de 1200 kcal

5. Calcular los macronutrientes (basado en peso corporal actual):
   · Proteínas:
       - Pérdida de grasa: 2.2–2.4 g/kg
       - Ganancia muscular: 2.0–2.2 g/kg
       - Mantenimiento: 1.6–1.8 g/kg
       - Rendimiento: 1.8–2.0 g/kg
   · Grasas: 0.8–1.2 g/kg
   · Carbohidratos: el resto de las calorías restantes

6. Mostrar los cálculos previos al plan, como bloque oculto o comentario, incluyendo:
   - TMB calculado
   - GET estimado
   - GET ajustado según el objetivo
   - Calorías finales (respetando mínimos)
   - Gramos diarios de cada macronutriente

7. Diseñar un menú realista para toda la semana (lunes a domingo), con alimentos simples, naturales y sin procesados.

8. Excluir completamente todos los alimentos no deseados, similares o relacionados.

9. Distribuir las calorías y macros en cada comida, ajustado al número de comidas.

10. Generar también:
   - Lista de compra por categorías
   - Totales diarios de calorías y macronutrientes

⚠️ Bajo ninguna circunstancia debe generarse un plan con menos calorías que el mínimo definido. Si el cálculo da menos, AJUSTAR hacia arriba.

✅ FORMATO DE RESPUESTA:

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
      ...
    },
    ...
  },
  "listaCompra": {
    "verduras": ["100g lechuga", "50g tomate"],
    "proteinas": ["150g pechuga", "2 huevos"],
    ...
  },
  "macronutrientes": {
    "calorias": 2800,
    "proteinas": 160,
    "carbohidratos": 300,
    "grasas": 80
  }
}
###JSON_END###

✅ Asegúrate de:
- No incluir comentarios fuera del bloque
- El JSON esté bien formado y válido
- Las calorías diarias coincidan con los menús
- Excluir alimentos prohibidos
- Incluir los cálculos en un bloque al principio
`;
}
