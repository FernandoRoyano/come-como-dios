// scripts/actualizar_ejercicios.ts
import fs from 'fs';
import path from 'path';

const rutaEjercicios = path.join(__dirname, '../src/data/ejercicios.json');
const rutaVideos = path.join(__dirname, '../data/videos_playlist.json');

const ejerciciosExistentes = JSON.parse(fs.readFileSync(rutaEjercicios, 'utf8'));
const nuevosVideos = JSON.parse(fs.readFileSync(rutaVideos, 'utf8'));

// Normaliza nombres para comparar
const normalizar = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, "").trim();

const ejerciciosActualizados = [...ejerciciosExistentes];

for (const nuevo of nuevosVideos) {
  const idx = ejerciciosActualizados.findIndex(e =>
    normalizar(e.nombre) === normalizar(nuevo.nombre)
  );

  if (idx !== -1) {
    // Actualiza el video si ya existe el ejercicio
    ejerciciosActualizados[idx].video = nuevo.video;
  } else {
    // Añade nuevo ejercicio con solo nombre y video
    ejerciciosActualizados.push({
      nombre: nuevo.nombre,
      video: nuevo.video,
      descripcion: '',
      patron: '',
      modalidad: ''
    });
  }
}

fs.writeFileSync(rutaEjercicios, JSON.stringify(ejerciciosActualizados, null, 2), 'utf8');
console.log(`✅ ejercicios.json actualizado con ${nuevosVideos.length} videos.`);
