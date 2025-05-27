import fs from 'fs';
import path from 'path';
import axios from 'axios';

async function verifyImages() {
  const ejerciciosDir = path.join(process.cwd(), 'public', 'ejercicios');
  const files = fs.readdirSync(ejerciciosDir);

  console.log('Archivos en la carpeta ejercicios:', files);

  try {
    const response = await axios.get('http://localhost:3000/api/exerciseMedia');
    const exerciseMedia = response.data;

    console.log('Datos de la API:', exerciseMedia);

    const missingFiles = exerciseMedia.filter((media: any) => {
      const fileName = media.url.replace('/ejercicios/', '');
      return !files.includes(fileName);
    });

    if (missingFiles.length > 0) {
      console.warn('Faltan los siguientes archivos en la carpeta ejercicios:', missingFiles);
    } else {
      console.log('Todos los archivos están presentes en la carpeta ejercicios.');
    }
  } catch (error) {
    console.error('Error al consultar la API /api/exerciseMedia:', error);
  }
}

verifyImages();
