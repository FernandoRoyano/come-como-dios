import fetch from 'node-fetch';
import * as fs from 'fs';

const API_KEY = 'AIzaSyDN-7hVw72YLbVO553OWOCnVU9lKDK-YLg';
const MAX_RESULTS = 50;

const playlists = [
  { id: 'PL9-fmMDDNiiceyaSWEq14wYloZ9iUlOyC', nombre: 'functionalfeel' },
  { id: 'PLNIvrBkgm8o1MGMs411HT084GEDo6AbPb', nombre: 'ritualgym' },
  // Puedes agregar más aquí
];

async function obtenerVideosPlaylist(playlistId: string): Promise<any[]> {
  let nextPageToken = '';
  const resultados: any[] = [];

  do {
    const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=${MAX_RESULTS}${nextPageToken ? `&pageToken=${nextPageToken}` : ''}&key=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`);
    const data = await res.json();

    data.items.forEach((item: any) => {
      resultados.push({
        title: item.snippet.title,
        videoId: item.snippet.resourceId.videoId,
        url: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`
      });
    });

    nextPageToken = data.nextPageToken ?? '';
  } while (nextPageToken);

  return resultados;
}

(async () => {
  for (const playlist of playlists) {
    try {
      console.log(`📥 Obteniendo: ${playlist.nombre}`);
      const videos = await obtenerVideosPlaylist(playlist.id);
      fs.writeFileSync(`playlist_${playlist.nombre}.json`, JSON.stringify(videos, null, 2));
      console.log(`✅ Guardado: playlist_${playlist.nombre}.json (${videos.length} videos)`);
    } catch (err) {
      console.error(`❌ Error con ${playlist.nombre}:`, err);
    }
  }
})();
