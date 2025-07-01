/**
 * Script: obtener_videos_playlist.ts
 * Requisitos: node-fetch@2 o compatible
 */

import fetch from 'node-fetch';
import * as fs from 'fs';

const API_KEY = 'AIzaSyDN-7hVw72YLbVO553OWOCnVU9lKDK-YLg';
const PLAYLIST_ID = 'PL9-fmMDDNiiceyaSWEq14wYloZ9iUlOyC';
const MAX_RESULTS = 50;

async function obtenerVideosPlaylist(): Promise<any[]> {
  let nextPageToken = '';
  const resultados: any[] = [];

  do {
    const url = [
      'https://www.googleapis.com/youtube/v3/playlistItems',
      `?part=snippet`,
      `&playlistId=${PLAYLIST_ID}`,
      `&maxResults=${MAX_RESULTS}`,
      nextPageToken ? `&pageToken=${nextPageToken}` : '',
      `&key=${API_KEY}`
    ].join('');

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
  try {
    const videos = await obtenerVideosPlaylist();
    console.log(`Total vídeos obtenidos: ${videos.length}`);
    fs.writeFileSync('playlist_videos.json', JSON.stringify(videos, null, 2));
    console.log('📝 Datos exportados a playlist_videos.json');
  } catch (err) {
    console.error('❌ Error:', err);
  }
})();
