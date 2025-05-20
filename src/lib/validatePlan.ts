export function validatePlan(parsed: any) {
    if (!Array.isArray(parsed.dias) || parsed.dias.length !== 7) {
      throw new Error('⚠️ El plan no contiene exactamente 7 días.');
    }
  
    if (!parsed.listaCompra || typeof parsed.listaCompra !== 'object') {
      throw new Error('⚠️ Faltan datos en la lista de la compra.');
    }
  
    if (!Array.isArray(parsed.recetas) || parsed.recetas.length < 1) {
      throw new Error('⚠️ No se han incluido recetas válidas.');
    }
  
    const validDomains = ['recetasgratis.net', 'directoalpaladar.com', 'myfitnesspal.com', 'cocinavital.mx'];
    for (const receta of parsed.recetas) {
      if (!validDomains.some(domain => receta.enlace.includes(domain))) {
        throw new Error(`❌ Enlace inválido en receta: ${receta.enlace}`);
      }
    }
  
    return true;
  }
  