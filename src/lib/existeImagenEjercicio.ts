// Archivo de utilidades para verificar si existe una imagen en la carpeta ejercicios

export function existeImagenEjercicio(nombreArchivo: string): boolean {
  // Solo funciona en Node.js (no en el navegador)
  try {
    const fs = require('fs');
    const path = require('path');
    const ruta = path.join(process.cwd(), 'public', 'ejercicios', nombreArchivo);
    return fs.existsSync(ruta);
  } catch {
    return false;
  }
}
