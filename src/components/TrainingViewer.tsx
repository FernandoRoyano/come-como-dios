import styles from './TrainingViewer.module.css';
import { PlanEntrenamiento, Ejercicio } from '@/types/plan';
import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import ejerciciosData from '@/data/ejercicios.json';

function normalizarNombre(nombre: string) {
  return nombre
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita tildes
    .replace(/[^a-z0-9 ]/g, '') // solo letras, numeros y espacios
    .replace(/\s+/g, ' ') // espacios múltiples a uno
    .trim();
}

function obtenerImagenEjercicio(nombre: string) {
  const nombreNormalizado = normalizarNombre(nombre);
  // 1. Coincidencia exacta
  let ejercicio = (ejerciciosData as Array<{nombre: string, imagen: string}>).find(e =>
    normalizarNombre(e.nombre) === nombreNormalizado
  );
  if (ejercicio) return `/ejercicios/${ejercicio.imagen}`;
  // 2. Coincidencia por inclusión (más largo contiene al más corto)
  ejercicio = (ejerciciosData as Array<{nombre: string, imagen: string}>).find(e =>
    normalizarNombre(e.nombre).includes(nombreNormalizado) || nombreNormalizado.includes(normalizarNombre(e.nombre))
  );
  if (ejercicio) return `/ejercicios/${ejercicio.imagen}`;
  // 3. Coincidencia por palabra clave (alguna palabra del nombre existe en el JSON)
  const palabras = nombreNormalizado.split(' ');
  ejercicio = (ejerciciosData as Array<{nombre: string, imagen: string}>).find(e =>
    palabras.some(palabra => normalizarNombre(e.nombre).includes(palabra))
  );
  if (ejercicio) return `/ejercicios/${ejercicio.imagen}`;
  // Si no existe, devuelve un SVG gris como imagen por defecto
  return 'data:image/svg+xml;utf8,<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="%23f0f0f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-size="16">Sin imagen</text></svg>';
}

interface Props {
  plan: PlanEntrenamiento;
  resumen?: string;
}

const TrainingViewer = ({ plan, resumen }: Props) => {
  const [html2pdf, setHtml2pdf] = useState<(() => unknown) | null>(null); // Uso unknown en vez de any para cumplir ESLint
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [isPdfLoading, setIsPdfLoading] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    
    const loadHtml2pdf = async () => {
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

    return () => {
      mounted = false;
    };
  }, []);

  const handleImageError = useCallback((ejercicioId: string) => {
    setImageErrors(prev => {
      if (prev[ejercicioId]) return prev; // Evitar actualizaciones innecesarias
      return { ...prev, [ejercicioId]: true };
    });
  }, []);

  const getPlaceholderImage = useCallback(() => {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZW4gbm8gZGlzcG9uaWJsZTwvdGV4dD48L3N2Zz4=';
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
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: false,
          letterRendering: true,
          allowTaint: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        }
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

  const renderEjercicio = useCallback((ejercicio: Ejercicio, index: number) => {
    const ejercicioId = `${ejercicio.nombre}-${index}`;
    const hasError = imageErrors[ejercicioId];
    let imageSrc = getPlaceholderImage();
    if (hasError) imageSrc = getPlaceholderImage();

    return (
      <div key={index} className={styles['ejercicio-card']}>
        <div className={styles['ejercicio-header']}>
          <h5>{ejercicio.nombre}</h5>
        </div>
        <div className={styles['ejercicio-imagen']}>
          <Image 
            src={obtenerImagenEjercicio(ejercicio.nombre) || '/ejercicios/clean.png'}
            alt={ejercicio.nombre}
            layout="responsive"
            width={500}
            height={500}
            loading="lazy"
            onError={() => handleImageError(ejercicio.id)}
          />
        </div>
        <div className={styles['ejercicio-detalles']}>
          <span>Series: {ejercicio.series}</span>
          <span>Repeticiones: {ejercicio.repeticiones}</span>
          <span>Descanso: {ejercicio.descanso}</span>
        </div>
        {!obtenerImagenEjercicio(ejercicio.nombre) && (
          <div style={{color: 'red', fontSize: '0.9em'}}>Sin imagen para este ejercicio</div>
        )}
      </div>
    );
  }, [imageErrors, handleImageError]);

  return (
    <div className={styles['training-container']} id="training-plan">
      {plan && plan.rutina && Object.keys(plan.rutina).length > 0 ? (
        Object.entries(plan.rutina).map(([dia, detalles]) => (
          <div key={dia} className={styles['rutina-section']}>
            <h3>{dia.charAt(0).toUpperCase() + dia.slice(1)}</h3>
            <p><strong>{detalles.nombre}</strong></p>
            <p>Duración: {detalles.duracion} minutos</p>
            <p>Intensidad: {detalles.intensidad}</p>
            <p>Calorías: {detalles.calorias}</p>
            <div className={styles['ejercicios-grid']}>
              {detalles.ejercicios.map((ejercicio, index) => (
                <div key={index} className={styles['ejercicio-card']}>
                  <div className={styles['ejercicio-header']}>
                    <h5>{ejercicio.nombre}</h5>
                  </div>
                  <div className={styles['ejercicio-imagen']}>
                    <Image 
                      src={obtenerImagenEjercicio(ejercicio.nombre) || '/ejercicios/clean.png'}
                      alt={ejercicio.nombre}
                      layout="responsive"
                      width={500}
                      height={500}
                      loading="lazy"
                      onError={() => handleImageError(ejercicio.id)}
                    />
                  </div>
                  <div className={styles['ejercicio-detalles']}>
                    <span>Series: {ejercicio.series}</span>
                    <span>Repeticiones: {ejercicio.repeticiones}</span>
                    <span>Descanso: {ejercicio.descanso}</span>
                  </div>
                  {!obtenerImagenEjercicio(ejercicio.nombre) && (
                    <div style={{color: 'red', fontSize: '0.9em'}}>Sin imagen para este ejercicio</div>
                  )}
                </div>
              ))}
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