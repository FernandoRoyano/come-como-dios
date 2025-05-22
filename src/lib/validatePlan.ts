import { Plan } from '@/types/plan';

export function validatePlan(plan: Plan): void {
  if (!plan.dias || typeof plan.dias !== 'object') {
    throw new Error('El plan debe contener días válidos');
  }

  if (!plan.listaCompra || typeof plan.listaCompra !== 'object') {
    throw new Error('El plan debe contener una lista de compra válida');
  }

  if (!plan.macronutrientes || typeof plan.macronutrientes !== 'object') {
    throw new Error('El plan debe contener macronutrientes válidos');
  }

  // Validar cada día
  Object.entries(plan.dias).forEach(([dia, comidas]) => {
    if (!comidas.desayuno || !comidas.almuerzo || !comidas.cena) {
      throw new Error(`El día ${dia} debe contener desayuno, almuerzo y cena`);
    }

    // Validar cada comida
    ['desayuno', 'almuerzo', 'cena'].forEach(tipoComida => {
      const comida = comidas[tipoComida as keyof typeof comidas];
      if (!comida.nombre || !comida.descripcion || 
          typeof comida.calorias !== 'number' || 
          typeof comida.proteinas !== 'number' || 
          typeof comida.carbohidratos !== 'number' || 
          typeof comida.grasas !== 'number') {
        throw new Error(`La comida ${tipoComida} del día ${dia} no es válida`);
      }
    });
  });

  // Validar macronutrientes
  const { calorias, proteinas, carbohidratos, grasas } = plan.macronutrientes;
  if (typeof calorias !== 'number' || 
      typeof proteinas !== 'number' || 
      typeof carbohidratos !== 'number' || 
      typeof grasas !== 'number') {
    throw new Error('Los macronutrientes deben ser números válidos');
  }
}
  