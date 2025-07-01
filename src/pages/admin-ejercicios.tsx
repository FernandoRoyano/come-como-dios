import { useState } from 'react';
import ejerciciosData from '@/data/ejercicios.json';
import styles from './AdminEjercicios.module.css';

const obtenerValoresUnicos = (clave: string, lista: any[]) => {
  return Array.from(new Set(lista.map(ej => ej[clave]).filter(Boolean)));
};

export default function AdminEjercicios() {
  const [busqueda, setBusqueda] = useState('');
  const [filtroPatron, setFiltroPatron] = useState('');
  const [filtroModalidad, setFiltroModalidad] = useState('');

  const ejercicios = Array.isArray(ejerciciosData) ? ejerciciosData : [];

  const patrones = obtenerValoresUnicos('patron', ejercicios);
  const modalidades = obtenerValoresUnicos('modalidad', ejercicios);

  const ejerciciosFiltrados = ejercicios.filter(ej => {
    const coincideBusqueda = ej.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincidePatron = filtroPatron ? ej.patron === filtroPatron : true;
    const coincideModalidad = filtroModalidad ? ej.modalidad === filtroModalidad : true;
    return coincideBusqueda && coincidePatron && coincideModalidad;
  });

  const extraerIdYoutube = (urlOrId?: string): string | null => {
    if (!urlOrId) return null;
    if (/^[\w-]{11}$/.test(urlOrId)) return urlOrId;
    const match = urlOrId.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
    return match ? match[1] : null;
  };

  return (
    <div className={styles['admin-container']}>
      <h2 className={styles['admin-title']}>Listado de ejercicios cargados (admin)</h2>

      <div className={styles['admin-toolbar']}>
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        <select value={filtroPatron} onChange={e => setFiltroPatron(e.target.value)}>
          <option value="">Todos los patrones</option>
          {patrones.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select value={filtroModalidad} onChange={e => setFiltroModalidad(e.target.value)}>
          <option value="">Todas las modalidades</option>
          {modalidades.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div className={styles['admin-summary']}>
        Total ejercicios: <b>{ejerciciosFiltrados.length}</b> / {ejercicios.length}
      </div>

      <div className={styles['admin-grid']}>
        {ejerciciosFiltrados.map((ej, i) => {
          const videoId = extraerIdYoutube(ej.video);
          return (
            <div key={i} className={styles['admin-card']}>
              <h3>{ej.nombre}</h3>
              <p>
                <strong>Patrón:</strong> {ej.patron || '—'}<br />
                <strong>Modalidad:</strong> {ej.modalidad || '—'}
              </p>
              <p>{ej.descripcion}</p>
              {videoId && (
                <div className={styles['admin-iframe']}>
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title={ej.nombre}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
              <code>ID: {videoId || '—'}</code>
            </div>
          );
        })}
      </div>

      {ejerciciosFiltrados.length === 0 && (
        <p className={styles['admin-empty']}>No se encontraron ejercicios con esos filtros.</p>
      )}
    </div>
  );
}
