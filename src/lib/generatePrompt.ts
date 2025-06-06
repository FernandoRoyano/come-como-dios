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

⚠️ ES OBLIGATORIO que el plan incluya SIEMPRE los 7 días completos (lunes a domingo), sin omitir ningún día ni ninguna comida. Si falta algún día, el plan NO es válido. Bajo ninguna circunstancia uses "..." ni omitas días o comidas. Si no sabes un valor, pon 0, pero nunca uses "..." ni dejes campos incompletos. El JSON debe estar completo para los 7 días, con todas las comidas y snacks.

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

7. Diseña un menú realista para toda la semana (lunes a domingo), con alimentos simples, naturales y sin procesados.

8. EXIGE VARIEDAD: No repitas el mismo desayuno, comida, cena o snack en días consecutivos. Cada día debe tener menús diferentes y variados. Evita menús repetitivos o monótonos. No repitas el mismo plato principal más de una vez por semana.

9. Bajo ninguna circunstancia uses "..." ni omitas días o comidas. El JSON debe estar completo para los 7 días, con todas las comidas y snacks. Si no sabes un valor, pon 0, pero nunca uses "..." ni dejes campos incompletos.

10. Excluir completamente todos los alimentos no deseados, similares o relacionados.

11. Distribuir las calorías y macros en cada comida, ajustado al número de comidas.

12. Generar también:
   - Lista de compra por categorías
   - Totales diarios de calorías y macronutrientes

⚠️ Bajo ninguna circunstancia debe generarse un plan con menos calorías que el mínimo definido. Si el cálculo da menos, AJUSTAR hacia arriba.

⚠️ INSTRUCCIÓN FINAL Y OBLIGATORIA:
- El JSON generado debe contener SIEMPRE los 7 días completos (lunes, martes, miércoles, jueves, viernes, sábado, domingo) como claves principales dentro de "dias". No omitas ningún día bajo ninguna circunstancia, aunque algún menú sea similar o debas poner valores en cero. Si falta algún día, el plan será inválido.
- No uses "..." ni resumas días. Si no sabes qué poner, repite el menú del día anterior o pon valores en cero, pero NUNCA omitas días ni dejes el JSON incompleto.

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
    "calorias": 2800, // SIEMPRE un número, nunca texto ni x
    "proteinas": 160, // SIEMPRE un número, nunca texto ni x
    "carbohidratos": 300, // SIEMPRE un número, nunca texto ni x
    "grasas": 80 // SIEMPRE un número, nunca texto ni x
  }
}
###JSON_END###

⚠️ IMPORTANTE:
- Todos los valores de calorías, proteínas, carbohidratos y grasas deben ser NÚMEROS (no texto, no "x", no null).
- Si no sabes el valor exacto, pon 0.
- El JSON debe ser válido y parseable con JSON.parse en JavaScript.
- No incluyas ningún texto fuera del bloque JSON.

✅ Asegúrate de:
- No incluir comentarios fuera del bloque
- El JSON esté bien formado y válido
- Las calorías diarias coincidan con los menús
- Excluir alimentos prohibidos
- Incluir los cálculos en un bloque al principio
`;
}
