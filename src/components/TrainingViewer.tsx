import styles from './TrainingViewer.module.css';
import { PlanEntrenamiento } from '@/types/plan';
import { useEffect, useState, useCallback } from 'react';
import ejerciciosData from '@/data/ejercicios.json';
import stringSimilarity from 'string-similarity';

function normalizarNombre(nombre: string) {
  return nombre
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function obtenerVideoEjercicio(nombre: string): string | undefined {
  const ejercicios = ejerciciosData as Array<{ nombre: string; video?: string }>;
  const nombreNormalizado = normalizarNombre(nombre);
  const nombresEjercicios = ejercicios.map(e => normalizarNombre(e.nombre));
  const mejorCoincidencia = stringSimilarity.findBestMatch(nombreNormalizado, nombresEjercicios).bestMatch;

  if (mejorCoincidencia.rating >= 0.5) {
    const index = nombresEjercicios.indexOf(mejorCoincidencia.target);
    const ejercicioOriginal = ejercicios[index];
    console.log('✅ Mejor coincidencia por similitud:', ejercicioOriginal.nombre, '→', ejercicioOriginal.video);
    return ejercicioOriginal.video;
  }

  const fallback = ejercicios.find(e => normalizarNombre(e.nombre).includes(nombreNormalizado));
  if (fallback) {
    console.log('⚠️ Coincidencia débil, usando fallback:', fallback.nombre, '→', fallback.video);
    return fallback.video;
  }

  console.warn('❌ Sin coincidencia para:', nombre);
  return undefined;
}

function extraerIdYoutube(urlOrId?: string): string | undefined {
  if (!urlOrId) return undefined;
  if (/^[\w-]{11}$/.test(urlOrId)) return urlOrId;
  const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/;
  const match = urlOrId.match(regex);
  return match?.[1];
}

interface Props {
  plan: PlanEntrenamiento;
  resumen?: string;
  pdfButtonRef?: React.RefObject<HTMLButtonElement | null>;
}

const TrainingViewer = ({ plan, resumen, pdfButtonRef }: Props) => {
  const [html2pdf, setHtml2pdf] = useState<(() => unknown) | null>(null);
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    const loadHtml2pdf = async () => {
      if (typeof window === 'undefined') return;
      try {
        const moduleHtml2Pdf = await import('html2pdf.js');
        if (mounted) {
          setHtml2pdf(() => moduleHtml2Pdf.default);
        }
      } catch (error) {
        console.error('Error al cargar html2pdf:', error);
      }
    };
    loadHtml2pdf();
    return () => { mounted = false; };
  }, []);

  const handleDownloadPDF = useCallback(async () => {
    if (!html2pdf) return;
    const element = document.getElementById('training-plan');
    if (!element) return;
    try {
      setIsPdfLoading(true);
      const opt = {
        margin: [10, 10, 10, 10],
        filename: 'plan-entrenamiento.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false, letterRendering: true, allowTaint: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait', compress: true }
      };
      const pdf = html2pdf();
      if (typeof pdf === 'object' && pdf !== null && 'set' in pdf && typeof pdf.set === 'function') {
        await pdf.set(opt).from(element).save();
      } else {
        throw new Error('html2pdf no tiene la forma esperada');
      }
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      alert('Hubo un error al generar el PDF. Por favor, inténtalo de nuevo.');
    } finally {
      setIsPdfLoading(false);
    }
  }, [html2pdf]);

  const explicacionEntrenamiento = (
    <div className={styles['explicacion-entrenamiento']}>
      <h3>¿Por qué este tipo de entrenamiento?</h3>
      <p>
        El plan de entrenamiento que has recibido está diseñado siguiendo las mejores prácticas y recomendaciones actuales de la ciencia del ejercicio. Se priorizan ejercicios multiarticulares y la progresión semanal, adaptando el volumen, la intensidad y la selección de ejercicios a tu nivel, objetivo y material disponible.
      </p>
      <p>
        La estructura de la rutina busca equilibrar el trabajo de todos los grupos musculares, alternando días de empuje, tracción y pierna, e incluyendo ejercicios de core y movilidad. Además, se tienen en cuenta tus preferencias, posibles lesiones y el tiempo real que puedes dedicar, para que el plan sea seguro, efectivo y sostenible.
      </p>
      <p>
        <strong>Recuerda:</strong> la clave está en la constancia, la técnica y la progresión. Si tienes dudas sobre algún ejercicio, consulta la descripción o pide asesoramiento profesional.
      </p>
    </div>
  );

  return (
    <div className={styles['training-container']} id="training-plan">
      <button
        className={styles['pdf-button']}
        onClick={handleDownloadPDF}
        disabled={isPdfLoading}
        style={{ marginBottom: '2rem' }}
        ref={pdfButtonRef}
      >
        {isPdfLoading ? 'Generando PDF...' : '📥 Descargar rutina en PDF'}
      </button>
      {explicacionEntrenamiento}
      {plan && plan.rutina && Object.keys(plan.rutina).length > 0 ? (
        Object.entries(plan.rutina).map(([dia, detalles]) => (
          <div key={dia} className={styles['rutina-section']}>
            <h3>{dia.charAt(0).toUpperCase() + dia.slice(1)}</h3>
            <p><strong>{detalles.nombre}</strong></p>
            <p>Duración: {detalles.duracion} minutos</p>
            <p>Intensidad: {detalles.intensidad}</p>
            <p>Calorías: {detalles.calorias}</p>
            <div className={styles['ejercicios-grid']}>
              {detalles.ejercicios.map((ejercicio, index) => {
                const videoUrl = obtenerVideoEjercicio(ejercicio.nombre);
                const videoId = extraerIdYoutube(videoUrl);
                console.log('DEBUG VIDEO', { nombre: ejercicio.nombre, videoUrl, videoId });

                return (
                  <div key={index} className={styles['ejercicio-card']}>
                    <div className={styles['ejercicio-header']}>
                      <h5>{ejercicio.nombre}</h5>
                    </div>
                    <div className={styles['ejercicio-imagen']}>
                      <div style={{ color: 'red', fontWeight: 'bold' }}>Render OK</div>
                      {videoId ? (
                        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 12, boxShadow: '0 2px 12px #0001', marginBottom: 8 }}>
                          <iframe
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title={ejercicio.nombre}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                          />
                        </div>
                      ) : (
                        <div style={{ textAlign: 'center', color: '#888', fontSize: '1rem', padding: '1.5rem 0' }}>Sin video disponible</div>
                      )}
                    </div>
                    <div className={styles['ejercicio-detalles']}>
                      <span>Series: {ejercicio.series}</span>
                      <span>Repeticiones: {ejercicio.repeticiones}</span>
                      <span>Descanso: {ejercicio.descanso}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      ) : (
        <p>No se encontró información válida sobre el plan de entrenamiento. Por favor, verifica los datos proporcionados.</p>
      )}
    </div>
  );
};

export default TrainingViewer;
