import { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import styles from './index.module.css';
import TrainingViewer from '../components/TrainingViewer';
import PlanViewer from '../components/PlanViewer';
import { PlanEntrenamiento, Plan } from '../types/plan';


export default function Home() {
  const { data: session, status } = useSession();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [trainingPlan, setTrainingPlan] = useState<PlanEntrenamiento | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlans, setSelectedPlans] = useState<{
    nutricion: boolean;
    entrenamiento: boolean;
  }>({
    nutricion: false,
    entrenamiento: false,
  });

  const handleTrainingSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const form = e.currentTarget;
      // ADAPTACIÓN: enviar la estructura esperada por la API
      const data = {
        entrenamiento: {
          ubicacion: (form.ubicacion as HTMLSelectElement).value,
          material: {
            pesas: (form.pesas as HTMLInputElement).checked,
            bandas: (form.bandas as HTMLInputElement).checked,
            maquinas: (form.maquinas as HTMLInputElement).checked,
            barras: (form.barras as HTMLInputElement).checked,
            otros: (form.otros as HTMLInputElement).value.split(',').map((v) => v.trim()).filter(Boolean),
          },
          nivel: (form.nivel as HTMLSelectElement).value,
          diasEntrenamiento: Number((form.dias as HTMLSelectElement).value),
          duracionSesion: Number((form.duracion as HTMLSelectElement).value),
          objetivos: (form.objetivos as HTMLInputElement).value.split(',').map((v) => v.trim()).filter(Boolean),
          lesiones: (form.lesiones as HTMLInputElement).value.split(',').map((v) => v.trim()).filter(Boolean),
          preferencias: (form.preferencias as HTMLInputElement).value.split(',').map((v) => v.trim()).filter(Boolean),
        },
        edad: Number((form.edad as HTMLInputElement).value),
        peso: Number((form.peso as HTMLInputElement).value),
        altura: Number((form.altura as HTMLInputElement).value),
        sexo: (form.sexo as HTMLSelectElement).value,
        objetivo: (form.objetivo as HTMLSelectElement).value,
        actividadFisica: (form.actividadFisica as HTMLSelectElement).value,
        // Estos campos son requeridos por el tipo PlanData pero no por entrenamiento, así que los pasamos vacíos
        restricciones: [],
        alimentosNoDeseados: [],
        intensidadTrabajo: '',
        numeroComidas: 0,
        servicios: { nutricion: false, entrenamiento: true },
      };
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
      setTrainingPlan(result.plan);
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

  const togglePlan = (plan: 'nutricion' | 'entrenamiento') => {
    setSelectedPlans(prev => ({
      ...prev,
      [plan]: !prev[plan]
    }));
  };

  console.log('STATUS', status, 'SESSION', session);

  if (status === 'loading' && !session) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Come Como Dios</h1>
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
            <h1 className={styles.title} style={{ fontFamily: 'var(--font-primary, Inter, Arial, sans-serif)' }}>Come Como Dios</h1>
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
          <h1 className={styles.title}>Come Como Dios</h1>
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

        {!selectedPlans.nutricion && !selectedPlans.entrenamiento && !plan && !trainingPlan && (
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

        {selectedPlans.entrenamiento && !trainingPlan && (
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
              <label htmlFor="dias">Días de Entrenamiento por Semana</label>
              <select name="dias" id="dias" required>
                <option value="">Selecciona los días</option>
                <option value="1">1 día</option>
                <option value="2">2 días</option>
                <option value="3">3 días</option>
                <option value="4">4 días</option>
                <option value="5">5 días</option>
                <option value="6">6 días</option>
              </select>
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
          </div>
        )}

        {trainingPlan && (
          <div className={styles.planContainer}>
            <div className={styles.planHeader}>
              <h2 className={styles.planTitle}>Tu Plan de Entrenamiento</h2>
              <div className={styles.planButtons}>
                <button
                  className={styles.generateOtherButton}
                  onClick={() => setTrainingPlan(null)}
                >
                  Generar otro plan
                </button>
                <button
                  className={styles.newPlanButton}
                  onClick={() => {
                    setTrainingPlan(null);
                    setSelectedPlans({ nutricion: false, entrenamiento: false });
                  }}
                >
                  Volver al inicio
                </button>
              </div>
            </div>
            <TrainingViewer plan={trainingPlan} />
          </div>
        )}

        {(plan || trainingPlan) && (
          <div className={styles.planActions}>
            <button
              onClick={() => {
                setPlan(null);
                setTrainingPlan(null);
                setSelectedPlans({ nutricion: false, entrenamiento: false });
              }}
              className={styles.backToSelectorButton}
            >
              Volver al Selector de Planes
            </button>
          </div>
        )}
      </main>

      {(selectedPlans.nutricion || selectedPlans.entrenamiento || plan || trainingPlan) && (
        <button
          onClick={() => {
            setPlan(null);
            setTrainingPlan(null);
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
