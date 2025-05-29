import fs from 'fs';
import path from 'path';
import axios from 'axios';

async function verifyImages() {
  const ejerciciosDir = path.join(process.cwd(), 'public', 'ejercicios');
  const files = fs.readdirSync(ejerciciosDir);

  try {
    const response = await axios.get('http://localhost:3000/api/exerciseMedia');
    const exerciseMedia: { url: string }[] = response.data;

    const missingFiles = exerciseMedia.filter((media) => {
      const fileName = media.url.replace('/ejercicios/', '');
      return !files.includes(fileName);
    });

    if (missingFiles.length > 0) {
      console.warn('Faltan los siguientes archivos en la carpeta ejercicios:', missingFiles);
    }
  } catch (error) {
    console.error('Error al consultar la API /api/exerciseMedia:', error);
  }
}

verifyImages();
