export function validatePlan(parsed: any) {
    if (!Array.isArray(parsed.dias) || parsed.dias.length !== 7) {
      throw new Error('⚠️ El plan no contiene exactamente 7 días.');
    }
  
    if (!parsed.listaCompra || typeof parsed.listaCompra !== 'object') {
      throw new Error('⚠️ Faltan datos en la lista de la compra.');
    }
  
    return true;
  }
  