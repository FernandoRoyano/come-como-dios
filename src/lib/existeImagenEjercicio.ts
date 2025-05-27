// Archivo de utilidades para verificar si existe una imagen en la carpeta ejercicios

// Solo exportar la función si estamos en Node.js (no en navegador)
const isNode = typeof process !== 'undefined' && process.versions != null && process.versions.node != null;

import fs from 'fs';
import path from 'path';

export function existeImagenEjercicio(nombreArchivo: string): boolean {
  if (!isNode) {
    if (typeof window !== 'undefined') {
      // Advertencia en frontend
      console.warn('existeImagenEjercicio solo debe usarse en backend/Node.js');
    }
    return false;
  }
  try {
    const ruta = path.join(process.cwd(), 'public', 'ejercicios', nombreArchivo);
    return fs.existsSync(ruta);
  } catch {
    return false;
  }
}
