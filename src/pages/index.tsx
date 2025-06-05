import { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import styles from './index.module.css';
import TrainingViewer from '../components/TrainingViewer';
import PlanViewer from '../components/PlanViewer';
import InputForm from '../components/InputForm';
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

// Lista de ejercicios faltantes (extraída de ejercicios_faltantes.txt)
const ejerciciosFaltantes = [
  'Sentadillas',
  'Fondos',
  'Prensa de piernas',
  'Abdominales',
  'Curl femoral',
  'Gemelos',
  'Pull ups',
  'Extensión de tríceps',
  'Elevación de talones',
  'Plancha',
  'Abdominales oblicuos',
  'Press inclinado',
  'Sentadilla hack',
  'Dominadas agarre cerrado',
  'Flexiones diamante',
  'Curl de bíceps en barra',
  'Extensión de tríceps en polea',
  'Press de banca inclinado',
  'Peso muerto sumo',
  'Fondos en paralelas',
  'Extensión de tríceps con mancuerna',
  'Peso muerto a una pierna',
];

function EjerciciosFaltantesAviso() {
  return (
    <div className={styles.ejerciciosAviso}>
      <strong>Ejercicios comunes que faltan en la base de datos:</strong>
      <ul className={styles.ejerciciosAvisoLista}>
        {ejerciciosFaltantes.map(ej => <li key={ej}>{ej}</li>)}
      </ul>
      <div className={styles.ejerciciosAvisoSugerencia}>
        <a href="mailto:soporte@tudominio.com?subject=Sugerencia%20de%20ejercicio%20faltante" className={styles.ejerciciosAvisoLink}>¿Quieres sugerir o reportar un ejercicio?</a>
      </div>
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
        // Mostrar detalles y stack si existen
        let errorMsg = errorData.message || 'Error generando el plan';
        if (errorData.details) errorMsg += `\nDetalles: ${errorData.details}`;
        if (errorData.stack) errorMsg += `\nStack: ${errorData.stack}`;
        throw new Error(errorMsg);
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
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        let errorMsg = errorData.message || 'Error generando el plan nutricional';
        if (errorData.details) errorMsg += `\nDetalles: ${errorData.details}`;
        if (errorData.stack) errorMsg += `\nStack: ${errorData.stack}`;
        throw new Error(errorMsg);
      }
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
        <main className={styles.main + ' ' + styles.mainWide}>
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
            <h1 className={styles.title}>Come y Entrena Como Dios</h1>
            <p className={styles.subtitle}>Tu asistente personal de nutrición y entrenamiento</p>
          </div>
        </header>
        <main className={styles.main + ' ' + styles.mainWide}>
          <section className={styles.marketingBlock + ' ' + styles.marketingBlockWide}>
            {/* Título y subtítulo solo una vez, fuera del bloque de marketing */}
            <h2 className={styles.marketingTitle}>
              🧠 Transforma tu cuerpo con inteligencia artificial
            </h2>
            <p className={styles.marketingSubtitle}>
              Planes de nutrición y entrenamiento personalizados, sin pagar a un entrenador.<br/>
              Olvídate de las dietas genéricas o rutinas copiadas de internet.<br/>
              Esta app usa IA avanzada para crear el plan perfecto para ti, según tus objetivos, cuerpo y estilo de vida.
            </p>
            <div className={styles.marketingCta}>
              <div>🧪 <b>Empieza GRATIS</b></div>
              <div>🔓 Accede a tu plan de muestra gratis durante 3 días</div>
              <div>🕐 Sin compromiso, sin tarjetas</div>
              <div>🔥 Disponible por tiempo limitado</div>
            </div>
            <div className={styles.featuresUnified + ' ' + styles.featuresGrid} style={{ marginTop: '2.5rem', marginBottom: '2.5rem' }}>
              <div className={styles.feature}>
                <span role="img" aria-label="Nutrición">🍎</span>
                <h3>Plan Nutricional</h3>
                <p>Dieta personalizada según tus objetivos, restricciones y gustos.</p>
              </div>
              <div className={styles.feature}>
                <span role="img" aria-label="Entrenamiento">💪</span>
                <h3>Plan de Entrenamiento</h3>
                <p>Rutinas adaptadas a tu nivel, material disponible y metas.</p>
              </div>
              <div className={styles.feature}>
                <span role="img" aria-label="IA">🤖</span>
                <h3>100% Personalizado</h3>
                <p>Planes generados por IA, únicos para ti, en segundos.</p>
              </div>
              <div className={styles.feature}>
                <span role="img" aria-label="Fácil">⚡</span>
                <h3>Fácil y Rápido</h3>
                <p>Solo responde unas preguntas y obtén tu plan al instante.</p>
              </div>
            </div>
            <div className={styles.marketingFeatures}>
              <div>🚀 <b>¿Qué obtienes?</b></div>
              <ul>
                <li>✅ Un plan de comidas semanal adaptado a tus gustos y alergias</li>
                <li>✅ Entrenamientos personalizados según tu nivel, equipo y días disponibles</li>
                <li>✅ Lista de la compra organizada y lista para usar</li>
                <li>✅ Calorías, macros y recomendaciones claras, sin complicaciones</li>
              </ul>
              <div style={{marginTop:'1.5rem'}}>🤖 <b>¿Cómo funciona?</b></div>
              <ol>
                <li>Rellenas un formulario con tus datos (edad, peso, objetivo, etc.)</li>
                <li>La IA analiza todo y genera tu plan único</li>
                <li>Recibes tu guía completa en minutos</li>
              </ol>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2.5rem' }}>
              <button
                onClick={() => signIn('google')}
                className={styles.bigCtaButton}
              >
                Iniciar Sesión con Google
              </button>
            </div>
          </section>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }}>

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
      <main className={styles.main + ' ' + styles.mainWide}>
        {loading && (
          <div className={styles.loading}>
            <div className={styles.loadingSpinner}></div>
            <p>Generando tu plan personalizado...</p>
          </div>
        )}

        {error && (() => {
          // Si el error es un string con detalles en formato JSON, intentar parsear
          let details = null, stack = null, message = error;
          if (typeof error === 'string') {
            try {
              // Buscar el primer '{' y el último '}' para extraer el JSON embebido
              const first = error.indexOf('{');
              const last = error.lastIndexOf('}');
              if (first !== -1 && last !== -1 && last > first) {
                const jsonStr = error.substring(first, last + 1);
                const parsed = JSON.parse(jsonStr);
                details = parsed.details || null;
                stack = parsed.stack || null;
                message = parsed.message || error;
              }
            } catch {}
          }
          return (
            <div className={styles.error}>
              <div>{message}</div>
              {details && (
                <pre style={{whiteSpace:'pre-wrap',color:'#b00',marginTop:8}}>{details}</pre>
              )}
              {stack && (
                <details style={{marginTop:8}}>
                  <summary>Stacktrace</summary>
                  <pre style={{whiteSpace:'pre-wrap',fontSize:'0.9em'}}>{stack}</pre>
                </details>
              )}
            </div>
          );
        })()}

        {/* Mostrar el formulario unificado solo si no hay plan generado ni resultado de entrenamiento */}
        {(!plan && !trainingResult) && (
          <InputForm
            onSubmit={async (data) => {
              setLoading(true);
              setError(null);
              try {
                // Si el usuario selecciona ambos planes, lanzar ambas peticiones en paralelo
                if (data.servicios.nutricion && data.servicios.entrenamiento) {
                  const [resNutri, resTrain] = await Promise.all([
                    fetch('/api/generatePlan', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ ...data, servicios: { nutricion: true, entrenamiento: false } }),
                    }),
                    fetch('/api/generateTraining', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ ...data, servicios: { nutricion: false, entrenamiento: true } }),
                    })
                  ]);
                  if (!resNutri.ok || !resTrain.ok) {
                    const errorDataNutri = await resNutri.json().catch(() => ({}));
                    const errorDataTrain = await resTrain.json().catch(() => ({}));
                    let errorMsg = '';
                    if (!resNutri.ok) errorMsg += errorDataNutri.message || 'Error generando el plan nutricional';
                    if (!resTrain.ok) errorMsg += '\n' + (errorDataTrain.message || 'Error generando el plan de entrenamiento');
                    throw new Error(errorMsg);
                  }
                  const resultNutri = await resNutri.json();
                  const resultTrain = await resTrain.json();
                  setPlan(resultNutri.plan);
                  // Corrige el tipo para userData: ubicacion y nivel nunca deben ser null/undefined
                  const userData = {
                    ...data,
                    entrenamiento: {
                      ...data.entrenamiento,
                      ubicacion: data.entrenamiento?.ubicacion || '',
                      nivel: data.entrenamiento?.nivel || '',
                    }
                  };
                  setTrainingResult({ plan: resultTrain.plan, userData });
                } else {
                  // Decide endpoint según el servicio seleccionado
                  let endpoint = '/api/generatePlan';
                  if (data.servicios.entrenamiento && !data.servicios.nutricion) {
                    endpoint = '/api/generateTraining';
                  }
                  const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data),
                  });
                  if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    // Mostrar detalles y stack si existen
                    let errorMsg = errorData.message || 'Error generando el plan';
                    if (errorData.details) errorMsg += `\nDetalles: ${errorData.details}`;
                    if (errorData.stack) errorMsg += `\nStack: ${errorData.stack}`;
                    throw new Error(errorMsg);
                  }
                  const result = await response.json();
                  if (data.servicios.entrenamiento && !data.servicios.nutricion) {
                    const userData = {
                      ...data,
                      entrenamiento: {
                        ...data.entrenamiento,
                        ubicacion: data.entrenamiento?.ubicacion || '',
                        nivel: data.entrenamiento?.nivel || '',
                      }
                    };
                    setTrainingResult({ plan: result.plan, userData });
                  } else {
                    if (!result.plan) throw new Error('El plan generado no tiene datos válidos.');
                    setPlan(result.plan);
                  }
                }
              } catch (err) {
                setError((err as Error).message || 'Error desconocido');
              } finally {
                setLoading(false);
              }
            }}
          />
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
          <InputForm onSubmit={async (data) => {
            setLoading(true);
            setError(null);
            try {
              const response = await fetch('/api/generatePlan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
              });
              if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                let errorMsg = errorData.message || 'Error generando el plan nutricional';
                if (errorData.details) errorMsg += `\nDetalles: ${errorData.details}`;
                if (errorData.stack) errorMsg += `\nStack: ${errorData.stack}`;
                throw new Error(errorMsg);
              }
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
          }} />
        )}

        {/* Mostrar ambos planes si existen */}
        {plan && trainingResult && (
          <div className={styles.planContainer}>
            <h2 className={styles.planTitle}>Tu Plan Nutricional</h2>
            <PlanViewer plan={plan} />
            <h2 className={styles.planTitle}>Tu Plan de Entrenamiento</h2>
            <TrainingViewer plan={trainingResult.plan} resumen={getTrainingResumen(trainingResult.userData)} />
          </div>
        )}

        {/* Mostrar solo nutrición si solo hay plan nutricional */}
        {plan && !trainingResult && (
          <div className={styles.planContainer}>
            <h2 className={styles.planTitle}>Tu Plan Nutricional</h2>
            <PlanViewer plan={plan} />
          </div>
        )}

        {/* Mostrar solo entrenamiento si solo hay plan de entrenamiento */}
        {trainingResult && !plan && (
          <div className={styles.planContainer}>
            <h2 className={styles.planTitle}>Tu Plan de Entrenamiento</h2>
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
