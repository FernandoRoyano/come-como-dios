import styles from './TrainingViewer.module.css';
import { PlanEntrenamiento, Ejercicio } from '@/types/plan';
import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';

interface Props {
  plan: PlanEntrenamiento;
}

const TrainingViewer = ({ plan }: Props) => {
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

  function normalizaNombreEjercicio(nombre: string) {
    return nombre
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quita tildes
      .replace(/ñ/g, 'n')
      .replace(/[^a-z0-9 ]/g, '') // solo letras, numeros y espacios
      .replace(/ +/g, '-') // espacios a guiones
      + '.png';
  }

  const renderEjercicio = useCallback((ejercicio: Ejercicio, index: number) => {
    const ejercicioId = `${ejercicio.nombre}-${index}`;
    const hasError = imageErrors[ejercicioId];
    let imageSrc = ejercicio.imagen;
    if (!imageSrc) {
      const nombreArchivo = normalizaNombreEjercicio(ejercicio.nombre);
      imageSrc = `/ejercicios/${nombreArchivo}`;
    }
    if (hasError) imageSrc = getPlaceholderImage();

    return (
      <div key={index} className={styles['ejercicio-card']}>
        <div className={styles['ejercicio-header']}>
          <h5>{ejercicio.nombre}</h5>
          <div className={styles['ejercicio-info']}>
            <span>{ejercicio.series} series</span>
            <span>{ejercicio.repeticiones} reps</span>
            {ejercicio.descanso && <span>⏱️ {ejercicio.descanso}</span>}
          </div>
        </div>
        <div className={styles['ejercicio-imagen']}>
          <Image 
            src={imageSrc}
            alt={ejercicio.nombre}
            layout="responsive"
            width={500}
            height={500}
            loading="lazy"
            onError={() => handleImageError(ejercicioId)}
          />
        </div>
        {ejercicio.descripcion && (
          <p className={styles['ejercicio-descripcion']}>{ejercicio.descripcion}</p>
        )}
        <div className={styles['ejercicio-detalles']}>
          {Array.isArray(ejercicio.musculos) && ejercicio.musculos.length > 0 && (
            <div className={styles['musculos']}>
              <strong>Músculos:</strong> {ejercicio.musculos.join(', ')}
            </div>
          )}
          {ejercicio.material && (
            <div className={styles['material']}>
              <strong>Material:</strong> {ejercicio.material}
            </div>
          )}
          {ejercicio.notas && (
            <div className={styles['notas']}>
              <strong>Notas:</strong> {ejercicio.notas}
            </div>
          )}
        </div>
      </div>
    );
  }, [imageErrors, handleImageError, getPlaceholderImage]);

  return (
    <div id="training-plan" className={styles['training-container']}>
      <h2 className={styles['training-title']}>Plan de Entrenamiento Personalizado</h2>
      <button 
        onClick={handleDownloadPDF} 
        className={styles['pdf-button']}
        disabled={!html2pdf || isPdfLoading}
      >
        {isPdfLoading ? 'Generando PDF...' : html2pdf ? '📥 Descargar PDF' : 'Cargando...'}
      </button>

      <div className={styles['rutina-section']}>
        <h3>Rutina Semanal</h3>
        {Object.entries(plan.rutina).map(([dia, entrenamiento]) => (
          <div key={dia} className={styles['dia-card']}>
            <h4>{dia.charAt(0).toUpperCase() + dia.slice(1)} - {entrenamiento.nombre}</h4>
            <div className={styles['dia-info']}>
              <span>⏱️ {entrenamiento.duracion} min</span>
              <span>💪 {entrenamiento.intensidad}</span>
              <span>🔥 {entrenamiento.calorias} cal</span>
            </div>
            <div className={styles['ejercicios-grid']}>
              {entrenamiento.ejercicios?.length > 0 ? (
                entrenamiento.ejercicios.map((ejercicio, index) => renderEjercicio(ejercicio, index))
              ) : (
                <div className={styles['no-ejercicios']}>
                  <p>Día de descanso - No hay ejercicios programados</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className={styles['progresion-section']}>
        <h3>Progresión del Entrenamiento</h3>
        {plan.progresion.semanas.map((semana, index) => (
          <div key={index} className={styles['semana-card']}>
            <h4>Semana {semana.semana}</h4>
            <div className={styles['semana-objetivos']}>
              <strong>Objetivos:</strong>
              <ul>
                {semana.objetivos.map((objetivo, i) => (
                  <li key={i}>{objetivo}</li>
                ))}
              </ul>
            </div>
            <div className={styles['semana-ajustes']}>
              <strong>Ajustes:</strong>
              <ul>
                {semana.ajustes.map((ajuste, i) => (
                  <li key={i}>{ajuste}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className={styles['consideraciones-section']}>
        <h3>Consideraciones Importantes</h3>
        <div className={styles['consideraciones-grid']}>
          <div className={styles['consideracion-card']}>
            <h4>Calentamiento</h4>
            <ul>
              {plan.consideraciones.calentamiento.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <div className={styles['consideracion-card']}>
            <h4>Enfriamiento</h4>
            <ul>
              {plan.consideraciones.enfriamiento.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
          <div className={styles['consideracion-card']}>
            <h4>Descanso</h4>
            <p>{plan.consideraciones.descanso}</p>
          </div>
          <div className={styles['consideracion-card']}>
            <h4>Notas Adicionales</h4>
            <p>{plan.consideraciones.notas}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingViewer;