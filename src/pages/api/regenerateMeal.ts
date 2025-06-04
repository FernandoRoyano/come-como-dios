// /pages/api/regenerateMeal.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { calcularMacrosDeDescripcionFiltrado } from '@/lib/foodDataCentral';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { dia, comida, restricciones, objetivo, numeroComidas, caloriasTotales, tipoDieta } = req.body;

  // Validación básica
  if (!dia || !comida || !objetivo || !numeroComidas || !caloriasTotales) {
    return res.status(400).json({ message: 'Faltan datos requeridos: día, comida, objetivo, número de comidas o calorías totales' });
  }

  // Detectar tipo de dieta si no viene explícito
  let tipoDietaFinal = tipoDieta;
  if (!tipoDietaFinal && Array.isArray(restricciones)) {
    const lower = restricciones.map((r: string) => r.toLowerCase());
    if (lower.includes('vegana')) tipoDietaFinal = 'vegana';
    else if (lower.includes('vegetariana')) tipoDietaFinal = 'vegetariana';
    else if (lower.includes('keto')) tipoDietaFinal = 'keto';
    else if (lower.includes('mediterranea') || lower.includes('mediterránea')) tipoDietaFinal = 'mediterranea';
  }

  const restrStr = Array.isArray(restricciones) && restricciones.length > 0
    ? restricciones.join(', ')
    : 'Ninguna';

  // Calcular calorías por comida
  const caloriasPorComida = Math.round(caloriasTotales / numeroComidas);

  const prompt = `
Eres un nutricionista profesional. Crea una comida para el día "${dia}", tipo "${comida}", con las siguientes condiciones:

🔹 Objetivo del paciente: ${objetivo}
🔹 Número total de comidas al día: ${numeroComidas}
🔹 Restricciones alimentarias: ${restrStr}
🔹 Calorías asignadas para esta comida: ${caloriasPorComida}

🧾 La comida debe contener:
- Nombre del tipo de comida: "${comida}"
- Descripción breve (máximo 12 palabras) con ingredientes y cantidades exactas (g, uds, ml).
- Valor nutricional: calorías, proteínas, carbohidratos y grasas.

📦 Devuelve solo el JSON limpio y exacto en este formato:

{
  "nombre": "${comida}",
  "descripcion": "100g avena, 200ml leche, 1 plátano",
  "calorias": ${caloriasPorComida},
  "proteinas": 20,
  "carbohidratos": 50,
  "grasas": 15
}

❌ No incluyas explicaciones, encabezados, texto adicional ni comentarios.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    });

    const content = completion.choices[0].message?.content || '';

    const jsonStart = content.indexOf('{');
    const jsonEnd = content.lastIndexOf('}');
    const jsonString = content.slice(jsonStart, jsonEnd + 1);

    const parsed = JSON.parse(jsonString);

    // Recalcular macros y calorías usando solo alimentos aptos
    const macros = calcularMacrosDeDescripcionFiltrado(parsed.descripcion, { tipoDieta: tipoDietaFinal, restricciones });
    parsed.calorias = Math.round(macros.calorias);
    parsed.proteinas = Math.round(macros.proteinas);
    parsed.carbohidratos = Math.round(macros.carbohidratos);
    parsed.grasas = Math.round(macros.grasas);
    parsed.noEncontrados = macros.noEncontrados;

    res.status(200).json(parsed);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al regenerar la comida.' });
    }
  }
}
