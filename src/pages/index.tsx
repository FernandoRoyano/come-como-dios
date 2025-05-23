import { useState } from 'react';
import { useSession } from 'next-auth/react';
import styles from './index.module.css';
import TrainingViewer from '../components/TrainingViewer';
import PlanViewer from '../components/PlanViewer';
import { PlanEntrenamiento, Plan } from '../types/plan';
import AuthButton from '../components/AuthButton';
import { signIn } from 'next-auth/react';


export default function Home() {
  const { data: session } = useSession();
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

  const handleTrainingSubmit = async (e: React.FormEvent<HTMLFormElement>) => { /* ... */ };
  const handleNutritionSubmit = async (e: React.FormEvent<HTMLFormElement>) => { /* ... */ };
  const togglePlan = (plan: 'nutricion' | 'entrenamiento') => {
    setSelectedPlans(prev => ({
      ...prev,
      [plan]: !prev[plan]
    }));
  };

  if (!session) {
    return (
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <h1 className={styles.title}>Come Como Dios</h1>
            <p className={styles.subtitle}>Tu asistente personal de nutrición y entrenamiento</p>
          </div>
        </header>
  
        <main className={styles.main}>
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
            <button
              onClick={() => {
                if (selectedPlans.nutricion || selectedPlans.entrenamiento) {
                  setSelectedPlans(prev => ({ ...prev, showForm: true }));
                }
              }}
              className={styles.continueButton}
              disabled={!selectedPlans.nutricion && !selectedPlans.entrenamiento}
            >
              Continuar
            </button>
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
