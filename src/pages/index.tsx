import { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import styles from './index.module.css';
import TrainingViewer from '../components/TrainingViewer';
import PlanViewer from '../components/PlanViewer';
import { PlanEntrenamiento, Plan, UserData } from '../types/plan';

const DIAS_SEMANA = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];

function UserContextDisplay({ data }: { data: UserData }) {
  if (!data) return null;

  const sexo = data.sexo === 'masculino' ? 'Hombre' : data.sexo === 'femenino' ? 'Mujer' : '';
  const edad = data.edad ? `${data.edad} años` : '';
  const altura = data.altura ? `${(data.altura / 100).toFixed(2)} m` : '';
  const actividad = data.actividadFisica || '';
  const objetivo = data.objetivo || '';
  const nivel = data.entrenamiento?.nivel || '';
  const materialArr = [];

  if (data.entrenamiento?.material) {
    if (data.entrenamiento.material.pesas) materialArr.push('pesas');
    if (data.entrenamiento.material.bandas) materialArr.push('bandas elásticas');
    if (data.entrenamiento.material.maquinas) materialArr.push('máquinas');
    if (data.entrenamiento.material.barras) materialArr.push('barras');
  }

  const material = materialArr.length > 0 ? materialArr.join(', ') : 'No especificado';

  return (
    <div className={styles['user-context']}>
      <h2>Información del Usuario</h2>
      <div className={styles['context-item']}><strong>Género:</strong> {sexo}</div>
      <div className={styles['context-item']}><strong>Edad:</strong> {edad}</div>
      <div className={styles['context-item']}><strong>Altura:</strong> {altura}</div>
      <div className={styles['context-item']}><strong>Actividad Física:</strong> {actividad}</div>
      <div className={styles['context-item']}><strong>Objetivo:</strong> {objetivo}</div>
      <div className={styles['context-item']}><strong>Nivel:</strong> {nivel}</div>
      <div className={styles['context-item']}><strong>Material Disponible:</strong> {material}</div>
    </div>
  );
}

export default function Home() {
  const { data: session, status } = useSession();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [trainingResult, setTrainingResult] = useState<{ plan: PlanEntrenamiento, userData: UserData } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlans, setSelectedPlans] = useState<{
    nutricion: boolean;
    entrenamiento: boolean;
  }>({
    nutricion: false,
    entrenamiento: false,
  });
  const [diasSeleccionados, setDiasSeleccionados] = useState<string[]>([]);

  // Función para generar el resumen contextual
  function getTrainingResumen(data: UserData) {
    if (!data) return '';
    const sexo = data.sexo === 'masculino' ? 'Hombre' : data.sexo === 'femenino' ? 'Mujer' : '';
    const edad = data.edad ? `${data.edad} años` : '';
    const altura = data.altura ? `${(data.altura / 100).toFixed(2)} m` : '';
    const actividad = data.actividadFisica || '';
    const objetivo = data.objetivo || '';
    const ubicacion = data.entrenamiento?.ubicacion || '';
    const nivel = data.entrenamiento?.nivel || '';
    const materialArr = [];
    if (data.entrenamiento?.material) {
      if (data.entrenamiento.material.pesas) materialArr.push('pesas');
      if (data.entrenamiento.material.bandas) materialArr.push('bandas elásticas');
      if (data.entrenamiento.material.maquinas) materialArr.push('máquinas');
      if (data.entrenamiento.material.barras) materialArr.push('barras');
      if (Array.isArray(data.entrenamiento.material.otros) && data.entrenamiento.material.otros.length > 0) materialArr.push(...data.entrenamiento.material.otros);
    }
    const material = materialArr.length > 0 ? `dispone de ${materialArr.join(' y ')}` : '';
    return [
      sexo,
      edad,
      altura,
      actividad,
      objetivo,
      ubicacion,
      nivel,
      material
    ].filter(Boolean).join(', ');
  }

  const handleTrainingSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const form = e.currentTarget;
      const getValue = (name: string) => (form as any)[name]?.value ?? '';
      const getChecked = (name: string) => (form as any)[name]?.checked ?? false;
      const getSplit = (name: string) => getValue(name).split(',').map((v: string) => v.trim()).filter(Boolean);
      const data = {
        entrenamiento: {
          ubicacion: getValue('ubicacion'),
          material: {
            pesas: getChecked('pesas'),
            bandas: getChecked('bandas'),
            maquinas: getChecked('maquinas'),
            barras: getChecked('barras'),
            otros: getSplit('otros'),
          },
          nivel: getValue('nivel'),
          diasEntrenamiento: 0, // ya no se usa select de días, se usa diasSeleccionados
          duracionSesion: Number(getValue('duracion')),
          objetivos: getSplit('objetivos'),
          lesiones: getSplit('lesiones'),
          preferencias: getSplit('preferencias'),
          diasDisponibles: diasSeleccionados,
        },
        edad: Number(getValue('edad')),
        peso: Number(getValue('peso')),
        altura: Number(getValue('altura')),
        sexo: getValue('sexo'),
        objetivo: getValue('objetivo'),
        actividadFisica: getValue('actividadFisica'),
        // Estos campos son requeridos por el tipo PlanData pero no por entrenamiento, así que los pasamos vacíos
        restricciones: [],
        alimentosNoDeseados: [],
        intensidadTrabajo: '',
        numeroComidas: 0,
        servicios: { nutricion: false, entrenamiento: true },
      };
      // Guardar plan y datos juntos
      const response = await fetch('/api/generateTraining', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error generando el plan de entrenamiento');
      }
      const result = await response.json();
      setTrainingResult({ plan: result.plan, userData: data });
    } catch (err) {
      setError((err as Error).message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleNutritionSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const form = e.currentTarget;
      const data = {
        edad: Number((form.edad as HTMLInputElement).value),
        peso: Number((form.peso as HTMLInputElement).value),
        altura: Number((form.altura as HTMLInputElement).value),
        sexo: (form.sexo as HTMLSelectElement).value,
        objetivo: (form.objetivo as HTMLSelectElement).value,
        actividadFisica: (form.actividadFisica as HTMLSelectElement).value,
        intensidadTrabajo: (form.intensidadTrabajo as HTMLSelectElement).value,
        numeroComidas: Number((form.numeroComidas as HTMLSelectElement).value),
        restricciones: (form.restricciones as HTMLInputElement).value.split(',').map((v) => v.trim()).filter(Boolean),
        alimentosNoDeseados: (form.alimentosNoDeseados as HTMLInputElement).value.split(',').map((v) => v.trim()).filter(Boolean),
        servicios: { nutricion: true, entrenamiento: false },
      };
      const response = await fetch('/api/generatePlan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Error generando el plan nutricional');
      const result = await response.json();
      if (!result.plan) {
        throw new Error('El plan generado no tiene datos válidos.');
      }
      setPlan(result.plan);
    } catch (err) {
      setError((err as Error).message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerateMeal = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const form = e.currentTarget;
      const data = {
        dia: (form.dia as HTMLSelectElement).value,
        comida: (form.comida as HTMLSelectElement).value,
        restricciones: (form.restricciones as HTMLInputElement).value.split(',').map((v) => v.trim()).filter(Boolean),
        objetivo: (form.objetivo as HTMLSelectElement).value,
        numeroComidas: Number((form.numeroComidas as HTMLSelectElement).value),
      };

      const response = await fetch('/api/regenerateMeal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Error al regenerar la comida');

      const result = await response.json();
      alert(`Comida regenerada: ${result.nombre}\nDescripción: ${result.descripcion}\nCalorías: ${result.calorias}, Proteínas: ${result.proteinas}, Carbohidratos: ${result.carbohidratos}, Grasas: ${result.grasas}`);
    } catch (err) {
      setError((err as Error).message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const togglePlan = (plan: 'nutricion' | 'entrenamiento') => {
    setSelectedPlans(prev => ({
      ...prev,
      [plan]: !prev[plan]
    }));
  };

  const handleDiaSeleccion = (dia: string) => {
    setDiasSeleccionados(prev => {
      if (prev.includes(dia)) {
        return prev.filter(d => d !== dia);
      } else {
        return [...prev, dia];
      }
    });
  };

  if (status === 'loading' && !session) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Come y Entrena Como Dios</h1>
            <p className={styles.subtitle}>Tu asistente personal de nutrición y entrenamiento</p>
          </div>
        </header>
        <main className={styles.main}>
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            <p>Cargando...</p>
            <pre style={{background:'#fff',color:'#333',padding:'1rem',borderRadius:'8px',marginTop:'1rem',fontSize:'1rem'}}>
{`status: ${status}\nsession: ${JSON.stringify(session, null, 2)}`}
            </pre>
          </div>
          <button
            onClick={() => signIn('google')}
            className={styles.continueButton}
            disabled
          >
            Iniciar Sesión con Google
          </button>
        </main>
      </div>
    );
  }

  if (!session) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title} style={{ fontFamily: 'var(--font-primary, Inter, Arial, sans-serif)' }}>Come y Entrena Como Dios</h1>
            <p className={styles.subtitle} style={{ fontFamily: 'var(--font-secondary, Inter, Arial, sans-serif)' }}>Tu asistente personal de nutrición y entrenamiento</p>
          </div>
        </header>
        <main className={styles.main}>
          <section className={styles.authMessage}>
            <h2 style={{ fontFamily: 'var(--font-primary, Inter, Arial, sans-serif)' }}>¡Bienvenido/a!</h2>
            <p style={{ fontFamily: 'var(--font-secondary, Inter, Arial, sans-serif)' }}>
              Descubre cómo la inteligencia artificial puede ayudarte a alcanzar tus objetivos de salud y fitness. Genera planes personalizados de nutrición y entrenamiento en segundos, adaptados a tus preferencias, necesidades y estilo de vida.
            </p>
          </section>
          <section className={styles.features}>
            <div className={styles.feature}>
              <span role="img" aria-label="Nutrición">🍎</span>
              <h3 style={{ fontFamily: 'var(--font-primary, Inter, Arial, sans-serif)' }}>Plan Nutricional</h3>
              <p style={{ fontFamily: 'var(--font-secondary, Inter, Arial, sans-serif)' }}>Dieta personalizada según tus objetivos, restricciones y gustos.</p>
            </div>
            <div className={styles.feature}>
              <span role="img" aria-label="Entrenamiento">💪</span>
              <h3 style={{ fontFamily: 'var(--font-primary, Inter, Arial, sans-serif)' }}>Plan de Entrenamiento</h3>
              <p style={{ fontFamily: 'var(--font-secondary, Inter, Arial, sans-serif)' }}>Rutinas adaptadas a tu nivel, material disponible y metas.</p>
            </div>
            <div className={styles.feature}>
              <span role="img" aria-label="IA">🤖</span>
              <h3 style={{ fontFamily: 'var(--font-primary, Inter, Arial, sans-serif)' }}>100% Personalizado</h3>
              <p style={{ fontFamily: 'var(--font-secondary, Inter, Arial, sans-serif)' }}>Planes generados por IA, únicos para ti, en segundos.</p>
            </div>
            <div className={styles.feature}>
              <span role="img" aria-label="Fácil">⚡</span>
              <h3 style={{ fontFamily: 'var(--font-primary, Inter, Arial, sans-serif)' }}>Fácil y Rápido</h3>
              <p style={{ fontFamily: 'var(--font-secondary, Inter, Arial, sans-serif)' }}>Solo responde unas preguntas y obtén tu plan al instante.</p>
            </div>
          </section>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>
            <button
              onClick={() => signIn('google')}
              className={styles.continueButton}
            >
              Iniciar Sesión con Google
            </button>
          </div>
        </main>
      </div>
    );
  }
  

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Come y Entrena Como Dios</h1>
          <p className={styles.subtitle}>Tu asistente personal de nutrición y entrenamiento</p>
        </div>
        <button
          onClick={() => signOut()}
          className={styles.continueButton}
          style={{ marginTop: 16 }}
        >
          Cerrar Sesión
        </button>
      </header>
      <main className={styles.main}>
        {loading && (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            <p>Generando tu plan personalizado...</p>
          </div>
        )}

        {error && <div className={styles.error}>{error}</div>}

        {!selectedPlans.nutricion && !selectedPlans.entrenamiento && !plan && !trainingResult && (
          <div className={styles.planSelector}>
            <h2>¿Qué tipo de plan deseas generar?</h2>
            <p className={styles.planSelectorSubtitle}>
              Selecciona el tipo de plan que deseas generar. Puedes elegir uno o ambos.
            </p>
            <div className={styles.planButtons}>
              <button
                onClick={() => togglePlan('nutricion')}
                className={`${styles.planButton} ${selectedPlans.nutricion ? styles.planButtonSelected : ''}`}
              >
                <span>🍎</span>
                <h3>Plan Nutricional</h3>
                <p>Dieta personalizada adaptada a tus objetivos</p>
                <div className={styles.planButtonCheck}>
                  {selectedPlans.nutricion ? '✓' : ''}
                </div>
              </button>
              <button
                onClick={() => togglePlan('entrenamiento')}
                className={`${styles.planButton} ${selectedPlans.entrenamiento ? styles.planButtonSelected : ''}`}
              >
                <span>💪</span>
                <h3>Plan de Entrenamiento</h3>
                <p>Rutina de ejercicios personalizada</p>
                <div className={styles.planButtonCheck}>
                  {selectedPlans.entrenamiento ? '✓' : ''}
                </div>
              </button>
              <button
                onClick={() => setSelectedPlans({ nutricion: true, entrenamiento: true })}
                className={`${styles.planButton} ${selectedPlans.nutricion && selectedPlans.entrenamiento ? styles.planButtonSelected : ''}`}
              >
                <span>🎯</span>
                <h3>Plan Completo</h3>
                <p>Nutrición y entrenamiento personalizados</p>
                <div className={styles.planButtonCheck}>
                  {selectedPlans.nutricion && selectedPlans.entrenamiento ? '✓' : ''}
                </div>
              </button>
            </div>
          </div>
        )}

        {selectedPlans.entrenamiento && !trainingResult && (
          <form onSubmit={handleTrainingSubmit} className={styles.form}>
            <div className={styles.formHeader}>
              <h2>Personaliza tu Plan de Entrenamiento</h2>
              <p>Selecciona tus preferencias para generar una rutina adaptada a ti</p>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="edad">Edad</label>
              <input type="number" name="edad" id="edad" required min="16" max="100" />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="peso">Peso (kg)</label>
              <input type="number" name="peso" id="peso" required min="30" max="200" />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="altura">Altura (cm)</label>
              <input type="number" name="altura" id="altura" required min="100" max="250" />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="sexo">Sexo</label>
              <select name="sexo" id="sexo" required>
                <option value="">Selecciona tu sexo</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="objetivo">Objetivo Principal</label>
              <select name="objetivo" id="objetivo" required>
                <option value="">Selecciona tu objetivo</option>
                <option value="perdida_grasa">Pérdida de grasa</option>
                <option value="ganancia_musculo">Ganancia muscular</option>
                <option value="mantenimiento">Mantenimiento</option>
                <option value="fuerza">Aumento de fuerza</option>
                <option value="resistencia">Mejora de resistencia</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="actividadFisica">Nivel de Actividad Física</label>
              <select name="actividadFisica" id="actividadFisica" required>
                <option value="">Selecciona tu nivel</option>
                <option value="sedentario">Sedentario</option>
                <option value="ligero">Ligero</option>
                <option value="moderado">Moderado</option>
                <option value="activo">Activo</option>
                <option value="muy_activo">Muy Activo</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="ubicacion">Ubicación de Entrenamiento</label>
              <select name="ubicacion" id="ubicacion" required>
                <option value="">Selecciona la ubicación</option>
                <option value="casa">Casa</option>
                <option value="gimnasio">Gimnasio</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Material Disponible</label>
              <div className={styles.checkboxGroup}>
                <label>
                  <input type="checkbox" name="pesas" value="true" />
                  Pesas
                </label>
                <label>
                  <input type="checkbox" name="bandas" value="true" />
                  Bandas Elásticas
                </label>
                <label>
                  <input type="checkbox" name="maquinas" value="true" />
                  Máquinas
                </label>
                <label>
                  <input type="checkbox" name="barras" value="true" />
                  Barras
                </label>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="otros">Otro Material (separado por comas)</label>
              <input type="text" name="otros" id="otros" placeholder="Ej: TRX, Kettlebell, etc." />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="nivel">Nivel de Experiencia</label>
              <select name="nivel" id="nivel" required>
                <option value="">Selecciona tu nivel</option>
                <option value="principiante">Principiante</option>
                <option value="intermedio">Intermedio</option>
                <option value="avanzado">Avanzado</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>¿Cuál es tu disponibilidad para entrenar?</label>
              <div className={styles['dias-semana-grid']}>
                {DIAS_SEMANA.map(dia => (
                  <div key={dia} className={styles['dia-checkbox-col']}>
                    <span className={styles['dia-nombre']}>{dia.charAt(0).toUpperCase() + dia.slice(1)}</span>
                    <input
                      type="checkbox"
                      checked={diasSeleccionados.includes(dia)}
                      onChange={() => setDiasSeleccionados(prev => prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia])}
                      className={styles['checkbox-dia-input']}
                    />
                  </div>
                ))}
              </div>
              <small className={styles.helpText}>
                Selecciona los días concretos en los que quieres entrenar. Puedes elegir cualquier combinación de lunes a domingo.
              </small>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="duracion">Duración de Sesión (minutos)</label>
              <select name="duracion" id="duracion" required>
                <option value="">Selecciona la duración</option>
                <option value="30">30 minutos</option>
                <option value="45">45 minutos</option>
                <option value="60">60 minutos</option>
                <option value="90">90 minutos</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="objetivos">Objetivos Específicos (separados por comas)</label>
              <input type="text" name="objetivos" id="objetivos" placeholder="Ej: ganar masa muscular, mejorar fuerza" required />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="lesiones">Lesiones o Limitaciones (separadas por comas)</label>
              <input type="text" name="lesiones" id="lesiones" placeholder="Ej: rodilla derecha, espalda baja" />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="preferencias">Preferencias (separadas por comas)</label>
              <input type="text" name="preferencias" id="preferencias" placeholder="Ej: ejercicios compuestos, cardio" />
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                onClick={() => setSelectedPlans(prev => ({ ...prev, entrenamiento: false }))}
                className={styles.backButton}
              >
                Volver
              </button>
              <button type="submit" className={styles.submitButton}>
                Generar Plan de Entrenamiento
              </button>
            </div>
          </form>
        )}

        {selectedPlans.nutricion && !plan && (
          <form onSubmit={handleNutritionSubmit} className={styles.form}>
            <div className={styles.formHeader}>
              <h2>Personaliza tu Plan Nutricional</h2>
              <p>Selecciona tus preferencias para generar una dieta adaptada a ti</p>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="edad">Edad</label>
              <input type="number" name="edad" id="edad" required min="16" max="100" />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="peso">Peso (kg)</label>
              <input type="number" name="peso" id="peso" required min="30" max="200" />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="altura">Altura (cm)</label>
              <input type="number" name="altura" id="altura" required min="100" max="250" />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="sexo">Sexo</label>
              <select name="sexo" id="sexo" required>
                <option value="">Selecciona tu sexo</option>
                <option value="masculino">Masculino</option>
                <option value="femenino">Femenino</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="objetivo">Objetivo Principal</label>
              <select name="objetivo" id="objetivo" required>
                <option value="">Selecciona tu objetivo</option>
                <option value="perdida_grasa">Pérdida de grasa</option>
                <option value="ganancia_musculo">Ganancia muscular</option>
                <option value="mantenimiento">Mantenimiento</option>
                <option value="rendimiento">Mejora de rendimiento</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="actividadFisica">Nivel de Actividad Física</label>
              <select name="actividadFisica" id="actividadFisica" required>
                <option value="">Selecciona tu nivel</option>
                <option value="sedentario">Sedentario</option>
                <option value="ligero">Ligero</option>
                <option value="moderado">Moderado</option>
                <option value="activo">Activo</option>
                <option value="muy_activo">Muy Activo</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="intensidadTrabajo">Intensidad del Trabajo</label>
              <select name="intensidadTrabajo" id="intensidadTrabajo" required>
                <option value="">Selecciona la intensidad</option>
                <option value="baja">Baja</option>
                <option value="moderada">Moderada</option>
                <option value="alta">Alta</option>
                <option value="muy_alta">Muy Alta</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="numeroComidas">Número de Comidas Diarias</label>
              <select name="numeroComidas" id="numeroComidas" required>
                <option value="">Selecciona el número</option>
                <option value="1">1 comida</option>
                <option value="2">2 comidas</option>
                <option value="3">3 comidas</option>
                <option value="4">4 comidas</option>
                <option value="5">5 comidas</option>
                <option value="6">6 comidas</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="restricciones">Restricciones Alimentarias (separadas por comas)</label>
              <input type="text" name="restricciones" id="restricciones" placeholder="Ej: sin gluten, sin lactosa" />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="alimentosNoDeseados">Alimentos No Deseados (separados por comas)</label>
              <input type="text" name="alimentosNoDeseados" id="alimentosNoDeseados" placeholder="Ej: pescado, mariscos" />
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                onClick={() => setSelectedPlans(prev => ({ ...prev, nutricion: false }))}
                className={styles.backButton}
              >
                Volver
              </button>
              <button type="submit" className={styles.submitButton}>
                Generar Plan Nutricional
              </button>
            </div>
          </form>
        )}

        {plan && (
          <div className={styles.planContainer}>
            <div className={styles.planHeader}>
              <h2 className={styles.planTitle}>Tu Plan Nutricional</h2>
              <div className={styles.planButtons}>
                <button
                  className={styles.generateOtherButton}
                  onClick={() => setPlan(null)}
                >
                  Generar otro plan
                </button>
                <button
                  className={styles.newPlanButton}
                  onClick={() => {
                    setPlan(null);
                    setSelectedPlans({ nutricion: false, entrenamiento: false });
                  }}
                >
                  Volver al inicio
                </button>
              </div>
            </div>
            <PlanViewer plan={plan} />

            {/* Formulario para regenerar comidas */}
            <form onSubmit={handleRegenerateMeal} className={styles.form}>
              <div className={styles.formHeader}>
                <h2>Regenerar Comida</h2>
                <p>Selecciona las opciones para regenerar una comida específica</p>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="dia">Día</label>
                <select name="dia" id="dia" required>
                  <option value="">Selecciona el día</option>
                  <option value="lunes">Lunes</option>
                  <option value="martes">Martes</option>
                  <option value="miercoles">Miércoles</option>
                  <option value="jueves">Jueves</option>
                  <option value="viernes">Viernes</option>
                  <option value="sabado">Sábado</option>
                  <option value="domingo">Domingo</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="comida">Tipo de Comida</label>
                <select name="comida" id="comida" required>
                  <option value="">Selecciona el tipo</option>
                  <option value="desayuno">Desayuno</option>
                  <option value="almuerzo">Almuerzo</option>
                  <option value="cena">Cena</option>
                  <option value="snack">Snack</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="restricciones">Restricciones Alimentarias (separadas por comas)</label>
                <input type="text" name="restricciones" id="restricciones" placeholder="Ej: sin gluten, sin lactosa" />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="objetivo">Objetivo</label>
                <select name="objetivo" id="objetivo" required>
                  <option value="">Selecciona el objetivo</option>
                  <option value="perdida_grasa">Pérdida de grasa</option>
                  <option value="ganancia_musculo">Ganancia muscular</option>
                  <option value="mantenimiento">Mantenimiento</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="numeroComidas">Número de Comidas Diarias</label>
                <select name="numeroComidas" id="numeroComidas" required>
                  <option value="">Selecciona el número</option>
                  <option value="1">1 comida</option>
                  <option value="2">2 comidas</option>
                  <option value="3">3 comidas</option>
                  <option value="4">4 comidas</option>
                  <option value="5">5 comidas</option>
                  <option value="6">6 comidas</option>
                </select>
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.submitButton}>
                  Regenerar Comida
                </button>
              </div>
            </form>
          </div>
        )}

        {trainingResult && (
          <div className={styles.planContainer}>
            <UserContextDisplay data={trainingResult.userData} />
            <div className={styles.planHeader}>
              <h2 className={styles.planTitle}>Tu Plan de Entrenamiento</h2>
              <div className={styles.planButtons}>
                <button
                  className={styles.generateOtherButton}
                  onClick={() => setTrainingResult(null)}
                >
                  Generar otro plan
                </button>
                <button
                  className={styles.newPlanButton}
                  onClick={() => {
                    setTrainingResult(null);
                    setSelectedPlans({ nutricion: false, entrenamiento: false });
                  }}
                >
                  Volver al inicio
                </button>
              </div>
            </div>
            <TrainingViewer plan={trainingResult.plan} resumen={getTrainingResumen(trainingResult.userData)} />
          </div>
        )}

        {(plan || trainingResult) && (
          <div className={styles.planActions}>
            <button
              onClick={() => {
                setPlan(null);
                setTrainingResult(null);
                setSelectedPlans({ nutricion: false, entrenamiento: false });
              }}
              className={styles.backToSelectorButton}
            >
              Volver al Selector de Planes
            </button>
          </div>
        )}
      </main>

      {(selectedPlans.nutricion || selectedPlans.entrenamiento || plan || trainingResult) && (
        <button
          onClick={() => {
            setPlan(null);
            setTrainingResult(null);
            setSelectedPlans({ nutricion: false, entrenamiento: false });
          }}
          className={styles.homeButton}
        >
          <span>🏠</span>
          Volver al Inicio
        </button>
      )}
    </div>
  );
}
