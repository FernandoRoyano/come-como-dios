import { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import styles from './index.module.css';
import TrainingViewer from '../components/TrainingViewer';
import PlanViewer from '../components/PlanViewer';
import InputForm from '../components/InputForm';
import InputFormNutricion from '../components/InputFormNutricion';
import InputFormEntrenamiento from '../components/InputFormEntrenamiento';
import AsesoriaProfesional from '../components/AsesoriaProfesional';
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
  const [saveStatus, setSaveStatus] = useState<{success?: string, error?: string}>({});
  // Estado único para el selector visual
  const [servicioSeleccionado, setServicioSeleccionado] = useState<null | 'nutricion' | 'entrenamiento' | 'asesoria'>(null);

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

  // --- NUEVO: Componente de Tabs para Monetización ---
  function MonetizationTabs({ isLoggedIn }: { isLoggedIn: boolean }) {
    const [activeTab, setActiveTab] = useState<'free' | 'pro'>('free');
    return (
      <div className={styles['tabs-monetizacion']}>
        <div className={styles['tabs-header']}>
          <button
            className={activeTab === 'free' ? styles['tab-active'] : styles['tab']}
            onClick={() => setActiveTab('free')}
            type="button"
          >
            Prueba gratuita
          </button>
          <button
            className={activeTab === 'pro' ? styles['tab-active'] : styles['tab']}
            onClick={() => setActiveTab('pro')}
            type="button"
          >
            Plan profesional
          </button>
        </div>
        <div className={styles['tab-content']}>
          {activeTab === 'free' && (
            <div className={styles['menu-card']}>
              <h3>Prueba gratuita</h3>
              {isLoggedIn ? (
                <>
                  <p>¡Ya tienes acceso a todas las funciones básicas!</p>
                  <button className={styles.landingButton} disabled>Activa</button>
                </>
              ) : (
                <>
                  <p>Accede a todas las funciones básicas durante 3 días sin compromiso.</p>
                  <button className={styles.landingButton} onClick={() => signIn('google')}>Empezar gratis</button>
                </>
              )}
            </div>
          )}
          {activeTab === 'pro' && (
            <div className={styles['menu-card']}>
              <h3>Plan profesional</h3>
              <p>Desbloquea rutinas avanzadas, soporte prioritario y más.</p>
              <button className={styles.landingButton} onClick={() => window.location.href = '/plan-profesional'}>Ver detalles</button>
            </div>
          )}
        </div>
      </div>
    );
  }

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
          </section>
          {/* Tabs de monetización en vez de menú de tarjetas */}
          <MonetizationTabs isLoggedIn={false} />
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
        {session && (
          <div className={styles.headerButtonsGroup}>
             <button
              onClick={() => signOut()}
              className={styles.logoutButton}
            >
              Cerrar Sesión
            </button>
          </div>
        )}
      </header>
      {/* Tabs de monetización también después del login */}
      <MonetizationTabs isLoggedIn={true} />
      {/* Botón Mi Panel fuera del header, solo si hay sesión */}
      {session && (
        <div style={{ display: 'flex', justifyContent: 'center', margin: '1.5rem 0 0.5rem 0' }}>
          <button
            className={styles.dashboardButton}
            onClick={() => window.location.href = '/dashboard'}
          >
            🗂️ Mi Panel
          </button>
        </div>
      )}
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

        {/* Selector de servicios siempre visible */}
        {!plan && !trainingResult && (
          <div className={styles.serviciosSelector} style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
            <button
              className={servicioSeleccionado === 'nutricion' ? styles.selected : ''}
              onClick={() => setServicioSeleccionado('nutricion')}
            >🥗 Plan Nutricional</button>
            <button
              className={servicioSeleccionado === 'entrenamiento' ? styles.selected : ''}
              onClick={() => setServicioSeleccionado('entrenamiento')}
            >💪 Entrenamiento</button>
            <button
              className={servicioSeleccionado === 'asesoria' ? styles.selected : ''}
              onClick={() => setServicioSeleccionado('asesoria')}
            >🧑‍⚕️ Asesoría profesional</button>
          </div>
        )}
        {/* Renderiza el formulario correspondiente */}
        {!plan && !trainingResult && servicioSeleccionado === 'nutricion' && (
          <InputFormNutricion
            onSubmit={async (data) => {
              setLoading(true);
              setError(null);
              try {
                // Solo los campos requeridos y en el formato correcto
                const payload = {
                  edad: data.edad,
                  peso: data.peso,
                  altura: data.altura,
                  sexo: data.sexo,
                  objetivo: data.objetivo,
                  actividadFisica: data.actividadFisica,
                  intensidadTrabajo: data.intensidadTrabajo,
                  numeroComidas: data.numeroComidas,
                  restricciones: Array.isArray(data.restricciones) ? data.restricciones : [],
                  alimentosNoDeseados: Array.isArray(data.alimentosNoDeseados) ? data.alimentosNoDeseados : [],
                };
                const response = await fetch('/api/generatePlan', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload),
                });
                if (!response.ok) throw new Error('Error generando el plan nutricional');
                const result = await response.json();
                setPlan(result.plan);
              } catch (err) {
                setError((err as Error).message || 'Error desconocido');
              } finally {
                setLoading(false);
              }
            }}
            onBack={() => setServicioSeleccionado(null)}
          />
        )}
        {!plan && !trainingResult && servicioSeleccionado === 'entrenamiento' && (
          <InputFormEntrenamiento
            onSubmit={async (data) => {
              setLoading(true);
              setError(null);
              try {
                // Solo los campos requeridos y en el formato correcto
                const payload = {
                  entrenamiento: data.entrenamiento,
                  edad: data.edad,
                  peso: data.peso,
                  altura: data.altura,
                  sexo: data.sexo,
                  objetivo: data.objetivo,
                  actividadFisica: data.actividadFisica,
                };
                // Log para depuración
                console.log('[DEBUG][generateTraining] Payload enviado:', payload);
                // Validación básica antes de enviar
                const camposFaltantes = Object.entries(payload).filter(([k, v]) => v === undefined || v === null || (typeof v === 'string' && v.trim() === ''));
                if (camposFaltantes.length > 0) {
                  setError('Faltan campos requeridos: ' + camposFaltantes.map(([k]) => k).join(', '));
                  setLoading(false);
                  return;
                }
                const entrenamientoKeys = ['ubicacion', 'material', 'nivel', 'diasEntrenamiento', 'duracionSesion', 'objetivos', 'lesiones', 'preferencias'];
                const entrenamiento = payload.entrenamiento!;
                const entrenamientoFaltantes = !entrenamiento
                  ? entrenamientoKeys
                  : entrenamientoKeys.filter((k) => {
                      const value = (entrenamiento as any)[k];
                      return (
                        value === undefined ||
                        value === null ||
                        (typeof value === 'string' && value.trim() === '')
                      );
                    });
                if (entrenamientoFaltantes.length > 0) {
                  setError('Faltan campos en entrenamiento: ' + entrenamientoFaltantes.join(', '));
                  setLoading(false);
                  return;
                }
                const response = await fetch('/api/generateTraining', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload),
                });
                if (!response.ok) throw new Error('Error generando el plan de entrenamiento');
                const result = await response.json();
                setTrainingResult({ plan: result.plan, userData: payload });
              } catch (err) {
                setError((err as Error).message || 'Error desconocido');
              } finally {
                setLoading(false);
              }
            }}
            onBack={() => setServicioSeleccionado(null)}
          />
        )}
        {!plan && !trainingResult && servicioSeleccionado === 'asesoria' && (
          <div>
            <AsesoriaProfesional />
            <button type="button" onClick={() => setServicioSeleccionado(null)} className={styles['wizard-back']} style={{marginTop:16}}>Volver al selector</button>
          </div>
        )}
        {/* Mostrar ambos planes si existen */}
        {plan && trainingResult && (
          <div className={styles.planContainer}>
            <h2 className={styles.planTitle}>Tu Plan Nutricional</h2>
            <PlanViewer plan={plan} />
            <h2 className={styles.planTitle}>Tu Plan de Entrenamiento</h2>
            <TrainingViewer plan={trainingResult.plan} resumen={getTrainingResumen(trainingResult.userData)} />
            <div className={styles.planActions}>
              {session ? (
                <>
                  <button
                    className="btn btn-primary"
                    onClick={async () => {
                      setSaveStatus({});
                      const nutritionMetadata = {
                        title: 'Plan nutricional personalizado',
                        description: 'Plan semanal de comidas adaptado a tus objetivos.',
                      };
                      const trainingMetadata = {
                        title: 'Plan de entrenamiento personalizado',
                        description: 'Rutina semanal de entrenamiento adaptada a tus preferencias.',
                      };
                      try {
                        console.log('[FRONT][POST] Guardando ambos planes:', {
                          nutri: { metadata: nutritionMetadata, type: 'nutrition', plan },
                          train: { metadata: trainingMetadata, type: 'training', plan: trainingResult.plan }
                        });
                        const resNutri = await fetch('/api/user/plans', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            metadata: nutritionMetadata,
                            type: 'nutrition',
                            plan: plan,
                          })
                        });
                        const resTrain = await fetch('/api/user/plans', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            metadata: trainingMetadata,
                            type: 'training',
                            plan: trainingResult.plan,
                          })
                        });
                        const resNutriText = await resNutri.text();
                        const resTrainText = await resTrain.text();
                        let resNutriJson = {}, resTrainJson = {};
                        try { resNutriJson = JSON.parse(resNutriText); } catch {}
                        try { resTrainJson = JSON.parse(resTrainText); } catch {}
                        console.log('[FRONT][POST] Status Nutri:', resNutri.status, 'Response:', resNutriJson);
                        console.log('[FRONT][POST] Status Train:', resTrain.status, 'Response:', resTrainJson);
                        const msgNutri = typeof resNutriJson === 'object' && resNutriJson && 'message' in resNutriJson ? (resNutriJson as any).message : undefined;
                        const msgTrain = typeof resTrainJson === 'object' && resTrainJson && 'message' in resTrainJson ? (resTrainJson as any).message : undefined;
                        if (!resNutri.ok || !resTrain.ok) {
                          let msg = '';
                          if (!resNutri.ok) msg += msgNutri || 'Error guardando plan nutricional. ';
                          if (!resTrain.ok) msg += msgTrain || 'Error guardando plan de entrenamiento.';
                          throw new Error(msg);
                        }
                        setSaveStatus({success: '¡Ambos planes guardados en tu cuenta!'});
                      } catch (e: any) {
                        setSaveStatus({error: e.message || 'Error desconocido al guardar'});
                      }
                    }}
                  >
                    Guardar ambos planes en mi cuenta
                  </button>
                  {saveStatus.success && <div style={{color:'#22c55e',marginTop:8,fontWeight:500}}>{saveStatus.success}</div>}
                  {saveStatus.error && <div style={{color:'#b00',marginTop:8,fontWeight:500}}>{saveStatus.error}</div>}
                </>
              ) : (
                <div style={{marginTop:12, color:'#b00', fontWeight:500}}>
                  Inicia sesión para guardar tus planes en la nube
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mostrar solo nutrición si solo hay plan nutricional */}
        {plan && !trainingResult && (
          <div className={styles.planContainer}>
            <h2 className={styles.planTitle}>Tu Plan Nutricional</h2>
            <PlanViewer plan={plan} />
            <div className={styles.planActions}>
              {session ? (
                <>
                  <button
                    className="btn btn-primary"
                    onClick={async () => {
                      setSaveStatus({});
                      const nutritionMetadata = {
                        title: 'Plan nutricional personalizado',
                        description: 'Plan semanal de comidas adaptado a tus objetivos.',
                      };
                      try {
                        console.log('[FRONT][POST] Guardando plan nutricional:', { metadata: nutritionMetadata, type: 'nutrition', plan });
                        const res = await fetch('/api/user/plans', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            metadata: nutritionMetadata,
                            type: 'nutrition',
                            plan: plan,
                          })
                        });
                        const resText = await res.text();
                        let resJson = {};
                        try { resJson = JSON.parse(resText); } catch {}
                        console.log('[FRONT][POST] Status:', res.status, 'Response:', resJson);
                        const msg = typeof resJson === 'object' && resJson && 'message' in resJson ? (resJson as any).message : undefined;
                        if (!res.ok) {
                          throw new Error(msg || 'Error al guardar el plan');
                        }
                        setSaveStatus({success: '¡Plan guardado en tu cuenta!'});
                      } catch (e: any) {
                        setSaveStatus({error: e.message || 'Error desconocido al guardar'});
                      }
                    }}
                  >
                    Guardar plan en mi cuenta
                  </button>
                  {saveStatus.success && <div style={{color:'#22c55e',marginTop:8,fontWeight:500}}>{saveStatus.success}</div>}
                  {saveStatus.error && <div style={{color:'#b00',marginTop:8,fontWeight:500}}>{saveStatus.error}</div>}
                </>
              ) : (
                <div style={{marginTop:12, color:'#b00', fontWeight:500}}>
                  Inicia sesión para guardar tu plan en la nube
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mostrar solo entrenamiento si solo hay plan de entrenamiento */}
        {trainingResult && !plan && (
          <div className={styles.planContainer}>
            <h2 className={styles.planTitle}>Tu Plan de Entrenamiento</h2>
            <TrainingViewer plan={trainingResult.plan} resumen={getTrainingResumen(trainingResult.userData)} />
            <div className={styles.planActions}>
              {session ? (
                <>
                  <button
                    className="btn btn-primary"
                    onClick={async () => {
                      setSaveStatus({});
                      const trainingMetadata = {
                        title: 'Plan de entrenamiento personalizado',
                        description: 'Rutina semanal de entrenamiento adaptada a tus preferencias.',
                      };
                      try {
                        console.log('[FRONT][POST] Guardando plan entrenamiento:', { metadata: trainingMetadata, type: 'training', plan: trainingResult.plan });
                        const res = await fetch('/api/user/plans', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            metadata: trainingMetadata,
                            type: 'training',
                            plan: trainingResult.plan,
                          })
                        });
                        const resText = await res.text();
                        let resJson = {};
                        try { resJson = JSON.parse(resText); } catch {}
                        console.log('[FRONT][POST] Status:', res.status, 'Response:', resJson);
                        const msg = typeof resJson === 'object' && resJson && 'message' in resJson ? (resJson as any).message : undefined;
                        if (!res.ok) {
                          throw new Error(msg || 'Error al guardar el plan');
                        }
                        setSaveStatus({success: '¡Plan guardado en tu cuenta!'});
                      } catch (e: any) {
                        setSaveStatus({error: e.message || 'Error desconocido al guardar'});
                      }
                    }}
                  >
                    Guardar plan en mi cuenta
                  </button>
                  {saveStatus.success && <div style={{color:'#22c55e',marginTop:8,fontWeight:500}}>{saveStatus.success}</div>}
                  {saveStatus.error && <div style={{color:'#b00',marginTop:8,fontWeight:500}}>{saveStatus.error}</div>}
                </>
              ) : null}
            </div>
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
