export function distribuirDias(diasDisponibles: string[], cantidad: number): string[] {
  const seleccionados: string[] = [];

  if (cantidad >= diasDisponibles.length) {
    return [...diasDisponibles];
  }

  const step = Math.floor(diasDisponibles.length / cantidad);

  for (let i = 0; i < cantidad; i++) {
    const index = i * step;
    const dia = diasDisponibles[index] || diasDisponibles[diasDisponibles.length - 1];
    if (!seleccionados.includes(dia)) {
      seleccionados.push(dia);
    }
  }

  return seleccionados;
}
