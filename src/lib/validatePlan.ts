import { Plan, Comida } from '@/types/plan';

export function validatePlan(plan: Plan): void {
  if (!plan || typeof plan !== 'object') {
    throw new Error('El plan debe ser un objeto válido');
  }

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
    if (!comidas || typeof comidas !== 'object') {
      throw new Error(`El día ${dia} debe ser un objeto válido`);
    }

    if (!comidas.desayuno || !comidas.almuerzo || !comidas.cena) {
      throw new Error(`El día ${dia} debe contener desayuno, almuerzo y cena`);
    }

    // Validar cada comida
    ['desayuno', 'almuerzo', 'cena'].forEach(tipoComida => {
      const comida = comidas[tipoComida as keyof typeof comidas] as Comida;
      if (!comida || typeof comida !== 'object') {
        throw new Error(`La comida ${tipoComida} del día ${dia} debe ser un objeto válido`);
      }

      if (!comida.nombre || typeof comida.nombre !== 'string') {
        throw new Error(`La comida ${tipoComida} del día ${dia} debe tener un nombre válido`);
      }

      if (!comida.descripcion || typeof comida.descripcion !== 'string') {
        throw new Error(`La comida ${tipoComida} del día ${dia} debe tener una descripción válida`);
      }

      if (typeof comida.calorias !== 'number' || isNaN(comida.calorias)) {
        throw new Error(`La comida ${tipoComida} del día ${dia} debe tener calorías válidas`);
      }

      if (typeof comida.proteinas !== 'number' || isNaN(comida.proteinas)) {
        throw new Error(`La comida ${tipoComida} del día ${dia} debe tener proteínas válidas`);
      }

      if (typeof comida.carbohidratos !== 'number' || isNaN(comida.carbohidratos)) {
        throw new Error(`La comida ${tipoComida} del día ${dia} debe tener carbohidratos válidos`);
      }

      if (typeof comida.grasas !== 'number' || isNaN(comida.grasas)) {
        throw new Error(`La comida ${tipoComida} del día ${dia} debe tener grasas válidas`);
      }
    });
  });

  // Validar lista de compra
  Object.entries(plan.listaCompra).forEach(([categoria, items]) => {
    if (!Array.isArray(items)) {
      throw new Error(`La categoría ${categoria} de la lista de compra debe ser un array`);
    }

    items.forEach((item, index) => {
      if (typeof item !== 'string') {
        throw new Error(`El item ${index} de la categoría ${categoria} debe ser un string`);
      }
    });
  });

  // Validar macronutrientes
  const { calorias, proteinas, carbohidratos, grasas } = plan.macronutrientes;
  if (typeof calorias !== 'number' || isNaN(calorias)) {
    throw new Error('Las calorías deben ser un número válido');
  }
  if (typeof proteinas !== 'number' || isNaN(proteinas)) {
    throw new Error('Las proteínas deben ser un número válido');
  }
  if (typeof carbohidratos !== 'number' || isNaN(carbohidratos)) {
    throw new Error('Los carbohidratos deben ser un número válido');
  }
  if (typeof grasas !== 'number' || isNaN(grasas)) {
    throw new Error('Las grasas deben ser un número válido');
  }
}
  