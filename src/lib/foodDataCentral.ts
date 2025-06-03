import fs from 'fs';
import path from 'path';
import stringSimilarity from 'string-similarity';

const DATA_PATH = path.join(process.cwd(), 'alimentos_europeos_macros_100g.json');

let foodDataCache: any[] | null = null;

export function loadFoodData(): any[] {
  try {
    if (foodDataCache) return foodDataCache;
    const raw = fs.readFileSync(DATA_PATH, 'utf-8');
    foodDataCache = JSON.parse(raw);
    return foodDataCache ?? [];
  } catch (err) {
    console.error('Error cargando FoodData Central:', err);
    throw new Error('No se pudo cargar la base de datos de alimentos.');
  }
}

export function searchFoodByName(name: string): any[] {
  const data = loadFoodData();
  return data.filter(item =>
    item.description?.toLowerCase().includes(name.toLowerCase())
  );
}

/**
 * Analiza una descripción de comida (ej: "100g arroz, 200ml leche") y calcula calorías y macros usando FoodData Central.
 * Devuelve un objeto con calorias, proteinas, carbohidratos y grasas.
 */
export function calcularMacrosDeDescripcion(descripcion: string): {
  calorias: number;
  proteinas: number;
  carbohidratos: number;
  grasas: number;
  detalles: Array<{ ingrediente: string; cantidad: number; unidad: string; matchedFood?: string; calorias: number; proteinas: number; carbohidratos: number; grasas: number; }>,
  noEncontrados: string[];
} {
  let data: any[] = [];
  try {
    data = loadFoodData();
    if (!Array.isArray(data)) {
      console.warn('[FoodDataCentral] La base de datos cargada no es un array. Valor recibido:', data);
      data = [];
    }
  } catch (err) {
    console.error('Error accediendo a FoodData Central:', err);
    return { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0, detalles: [], noEncontrados: [] };
  }
  // Separar por comas para procesar cada ingrediente
  const ingredientes = descripcion.split(',').map(i => i.trim()).filter(Boolean);
  let total = { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 };
  let detalles = [];
  let noEncontrados: string[] = [];
  const regex = /([\d,.]+)\s*(g|ml|uds|unidad|unidades|cucharada|cucharadita)?\s*([a-zA-Záéíóúñüç0-9\s]+)/i;

  for (const item of ingredientes) {
    let match = regex.exec(item);
    let cantidad = 1;
    let unidad = 'g';
    let ingrediente = item.toLowerCase();
    if (match) {
      cantidad = parseFloat(match[1].replace(',', '.'));
      unidad = match[2]?.toLowerCase() || 'g';
      ingrediente = match[3].trim().toLowerCase();
    }
    // Búsqueda exacta y luego fuzzy
    let alimento = data.find(item => item.nombre?.toLowerCase().includes(ingrediente));
    if (!alimento) {
      const nombres = data.map(item => item.nombre?.toLowerCase() || '');
      const { bestMatch } = stringSimilarity.findBestMatch(ingrediente, nombres);
      if (bestMatch.rating > 0.4) {
        alimento = data[nombres.indexOf(bestMatch.target)];
      }
    }
    // Ajustar por unidad
    let factor = 1;
    if (unidad === 'g') factor = cantidad / 100;
    else if (unidad === 'ml') factor = cantidad / 100;
    else if (unidad.startsWith('cucharad')) factor = cantidad * 10 / 100; // aprox 10g por cucharada
    else if (unidad.startsWith('ud')) factor = cantidad; // 1 unidad = 1 porción
    // Sumar macros si se encontró
    if (alimento) {
      let calorias = alimento.calorias * factor;
      let proteinas = alimento.proteinas * factor;
      let carbohidratos = alimento.carbohidratos * factor;
      let grasas = alimento.grasas * factor;
      if (!isFinite(calorias)) calorias = 0;
      if (!isFinite(proteinas)) proteinas = 0;
      if (!isFinite(carbohidratos)) carbohidratos = 0;
      if (!isFinite(grasas)) grasas = 0;
      total.calorias += calorias;
      total.proteinas += proteinas;
      total.carbohidratos += carbohidratos;
      total.grasas += grasas;
      detalles.push({ ingrediente, cantidad, unidad, matchedFood: alimento.nombre, calorias, proteinas, carbohidratos, grasas });
    } else {
      // Si es un ingrediente genérico, solo lo marca como no encontrado
      detalles.push({ ingrediente, cantidad, unidad, matchedFood: undefined, calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 });
      noEncontrados.push(ingrediente);
    }
  }
  // Log de totales para depuración
  console.log('Totales calculados para descripción:', descripcion, total);
  // Validación final: asegúrate de que los totales sean números válidos
  const safeTotal = {
    calorias: isFinite(total.calorias) ? total.calorias : 0,
    proteinas: isFinite(total.proteinas) ? total.proteinas : 0,
    carbohidratos: isFinite(total.carbohidratos) ? total.carbohidratos : 0,
    grasas: isFinite(total.grasas) ? total.grasas : 0,
  };
  return { ...safeTotal, detalles, noEncontrados };
}
