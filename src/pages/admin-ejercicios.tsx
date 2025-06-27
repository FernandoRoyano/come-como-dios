import { useState } from 'react';
import ejerciciosData from '@/data/ejercicios.json';

export default function AdminEjercicios() {
  const [busqueda, setBusqueda] = useState('');
  const ejercicios = Array.isArray(ejerciciosData) ? ejerciciosData : [];
  const ejerciciosFiltrados = ejercicios.filter(ej =>
    ej.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div style={{maxWidth: 900, margin: '2rem auto', padding: 24}}>
      <h2>Listado de ejercicios cargados (admin)</h2>
      <div style={{fontSize:18, color:'#145a86', marginBottom:16}}>
        Total ejercicios: <b>{ejerciciosFiltrados.length}</b> / {ejercicios.length}
      </div>
      <input
        type="text"
        placeholder="Buscar por nombre..."
        value={busqueda}
        onChange={e => setBusqueda(e.target.value)}
        style={{width: '100%', padding: 8, marginBottom: 24, fontSize: 18, borderRadius: 8, border: '1px solid #ccc'}}
      />
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24}}>
        {ejerciciosFiltrados.map((ej, i) => (
          <div key={i} style={{background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px #0001', padding: 16}}>
            <h3 style={{marginTop:0}}>{ej.nombre}</h3>
            <p style={{whiteSpace:'pre-line', color:'#444'}}>{ej.descripcion}</p>
            {ej.video && (
              <div style={{position:'relative',paddingBottom:'56.25%',height:0,overflow:'hidden',borderRadius:8,marginBottom:8,marginTop:8}}>
                <iframe
                  src={`https://www.youtube.com/embed/${ej.video}`}
                  title={ej.nombre}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{position:'absolute',top:0,left:0,width:'100%',height:'100%'}}
                />
              </div>
            )}
            <code style={{fontSize:12, color:'#888'}}>ID: {ej.video}</code>
          </div>
        ))}
      </div>
      {ejerciciosFiltrados.length === 0 && (
        <p style={{color:'#888',textAlign:'center',marginTop:32}}>No se encontraron ejercicios con ese nombre.</p>
      )}
    </div>
  );
}
