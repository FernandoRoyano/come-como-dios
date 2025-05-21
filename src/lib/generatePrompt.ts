export function generatePrompt({
    edad,
    peso,
    altura,
    sexo,
    objetivo,
    restricciones,
    actividadFisica,
    intensidadTrabajo,
    numeroComidas,
  }: any): string {
    return `
  Eres un nutricionista clínico profesional con experiencia en planes hiperpersonalizados. Tu objetivo es generar un plan de alimentación semanal **100% adaptado**, basado en evidencia científica y estilo de vida real.
  
  📌 DATOS DEL PACIENTE:
  - Edad: ${edad}
  - Sexo: ${sexo}
  - Peso: ${peso} kg
  - Altura: ${altura} cm
  - Objetivo: ${objetivo}
  - Actividad física: ${actividadFisica}
  - Tipo de trabajo: ${intensidadTrabajo}
  - Restricciones alimentarias: ${restricciones}
  - Comidas diarias: ${numeroComidas}
  
  🧠 INSTRUCCIONES:
  1. Calcula el TDEE con Mifflin-St Jeor y ajusta calorías al objetivo.
  2. Divide macronutrientes entre las ${numeroComidas} comidas.
  3. Cada comida debe tener: nombre, descripción breve (máx. 12 palabras con cantidades exactas), calorías, proteínas, carbohidratos, grasas.
  4. Usa ingredientes simples y comunes. Siempre especifica cantidades de **todos** los ingredientes.
  5. Genera **exactamente 7 días completos** (de Lunes a Domingo). No resumas ni agrupes días.
  6. Incluye un resumen de macros por día.
  7. Genera lista de la compra agregada y clasificada por categorías: "proteinas", "carbohidratos", "verduras", "otros".
  
  📦 FORMATO DE RESPUESTA:
  Devuelve solo un JSON limpio entre estas marcas:
  ###JSON_START###
  {
    "dias": [...],
    "listaCompra": {...},
    "recetas": [...]
  }
  ###JSON_END###
  
  ❌ NO EXPLIQUES NADA. NO INCLUYAS TEXTO EXTRA, ENCABEZADOS NI COMENTARIOS.
  `;
  }
  