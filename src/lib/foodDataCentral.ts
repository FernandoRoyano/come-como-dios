import fs from 'fs';
import path from 'path';
import stringSimilarity from 'string-similarity';

// Archivos de alimentos por categorías
const FOOD_FILES = [
  'alimentos_proteicos.json',
  'alimentos_carbohidratos.json',
  'alimentos_verduras_frutas.json',
  'alimentos_otros.json',
  'alimentos_ultraprocesados.json',
];

let foodDataCache: any[] | null = null;

export function loadFoodData(): any[] {
  try {
    if (foodDataCache) return foodDataCache;
    let allFoods: any[] = [];
    for (const file of FOOD_FILES) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        try {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)) allFoods = allFoods.concat(arr);
        } catch (e) {
          console.warn('Error parseando', file, e);
        }
      }
    }
    foodDataCache = allFoods;
    return foodDataCache ?? [];
  } catch (err) {
    console.error('Error cargando archivos de alimentos:', err);
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
      // Validación robusta antes de fuzzy match
      const ingredienteValido = typeof ingrediente === 'string' && ingrediente.trim().length > 0;
      const nombresValidos = Array.isArray(nombres) && nombres.length > 0 && nombres.every(n => typeof n === 'string' && n.trim().length > 0);
      if (ingredienteValido && nombresValidos) {
        const { bestMatch } = stringSimilarity.findBestMatch(ingrediente, nombres);
        if (bestMatch.rating > 0.4) {
          alimento = data[nombres.indexOf(bestMatch.target)];
        }
      } else {
        // Log de error detallado para depuración
        console.error('[findBestMatch] Argumentos inválidos:', { ingrediente, nombres });
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

/**
 * Carga la base de datos de alimentos filtrando por tipo de dieta y restricciones.
 * @param filtros { tipoDieta?: string, restricciones?: string[] }
 */
export function loadFilteredFoodData(filtros?: { tipoDieta?: string, restricciones?: string[] }): any[] {
  let data = loadFoodData();
  if (!filtros) return data;
  const { tipoDieta, restricciones } = filtros;
  // Filtrar por tipo de dieta (aptoPara)
  if (tipoDieta) {
    data = data.filter(item => Array.isArray(item.aptoPara) && item.aptoPara.map((v: string) => v.toLowerCase()).includes(tipoDieta.toLowerCase()));
  }
  // Filtrar por restricciones (ej: sin gluten, sin lactosa, etc)
  if (restricciones && restricciones.length > 0) {
    for (const restriccion of restricciones) {
      const restr = restriccion.trim().toLowerCase();
      // Excluir alimentos cuyo nombre o descripción contenga la restricción
      data = data.filter(item => {
        const nombre = (item.nombre || '').toLowerCase();
        const desc = (item.descripcion || '').toLowerCase();
        return !nombre.includes(restr) && !desc.includes(restr);
      });
    }
  }
  return data;
}

/**
 * Variante de calcularMacrosDeDescripcion que acepta filtros de dieta/restricciones.
 */
export function calcularMacrosDeDescripcionFiltrado(descripcion: string, filtros?: { tipoDieta?: string, restricciones?: string[] }) {
  let data: any[] = [];
  try {
    data = loadFilteredFoodData(filtros);
    if (!Array.isArray(data)) {
      console.warn('[FoodDataCentral] La base de datos filtrada no es un array. Valor recibido:', data);
      data = [];
    }
  } catch (err) {
    console.error('Error accediendo a FoodData Central filtrada:', err);
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
      // Validación robusta antes de fuzzy match
      const ingredienteValido = typeof ingrediente === 'string' && ingrediente.trim().length > 0;
      const nombresValidos = Array.isArray(nombres) && nombres.length > 0 && nombres.every(n => typeof n === 'string' && n.trim().length > 0);
      if (ingredienteValido && nombresValidos) {
        const { bestMatch } = stringSimilarity.findBestMatch(ingrediente, nombres);
        if (bestMatch.rating > 0.4) {
          alimento = data[nombres.indexOf(bestMatch.target)];
        }
      } else {
        // Log de error detallado para depuración
        console.error('[findBestMatch] Argumentos inválidos:', { ingrediente, nombres });
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
  console.log('Totales calculados para descripción filtrada:', descripcion, total);
  // Validación final: asegúrate de que los totales sean números válidos
  const safeTotal = {
    calorias: isFinite(total.calorias) ? total.calorias : 0,
    proteinas: isFinite(total.proteinas) ? total.proteinas : 0,
    carbohidratos: isFinite(total.carbohidratos) ? total.carbohidratos : 0,
    grasas: isFinite(total.grasas) ? total.grasas : 0,
  };
  return { ...safeTotal, detalles, noEncontrados };
}
