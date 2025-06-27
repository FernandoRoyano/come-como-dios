import { useState, useEffect } from 'react';
import styles from './InputForm.module.css';
import { validateRestrictions } from '@/lib/validateRestrictions';
import { PlanData } from '@/types/plan';
import AsesoriaProfesional from './AsesoriaProfesional';

const pasosNutricion = [
  'sexo',
  'edad',
  'peso',
  'altura',
  'objetivo',
  'actividadFisica',
  'intensidadTrabajo',
  'numeroComidas',
  'restricciones',
  'alimentosNoDeseados',
  'tipoDieta',
];
const pasosEntrenamiento = [
  'sexo',
  'edad',
  'peso',
  'altura',
  'ubicacion',
  'nivel',
  'duracionSesion',
  'objetivosEntrenamiento',
  'material',
  'otrosMateriales',
  'lesiones',
  'preferencias',
  'diasEntrenamiento',
];

const etiquetas = {
  sexo: '¿Cuál es tu sexo?',
  edad: '¿Cuál es tu edad?',
  peso: '¿Cuál es tu peso (kg)?',
  altura: '¿Cuál es tu altura (cm)?',
  objetivo: '¿Cuál es tu objetivo principal?',
  actividadFisica: '¿Nivel de actividad física?',
  intensidadTrabajo: '¿Intensidad del trabajo diario?',
  numeroComidas: '¿Cuántas comidas diarias prefieres?',
  restricciones: '¿Tienes restricciones alimentarias?',
  alimentosNoDeseados: '¿Alimentos que no te gustan?',
  tipoDieta: '¿Tipo de dieta preferida?',
  entrenamiento: 'Configura tu entrenamiento',
};

const opciones = {
  sexo: ['Hombre', 'Mujer'],
  objetivo: ['Perder grasa', 'Ganar masa muscular', 'Mantener peso'],
  actividadFisica: ['Sedentario', 'Ligero', 'Moderado', 'Intenso'],
  intensidadTrabajo: ['Leve', 'Moderada', 'Vigorosa'],
  numeroComidas: [2, 3, 4],
  tipoDieta: ['', 'vegana', 'vegetariana', 'keto', 'mediterranea'],
};

const InputForm = ({ onSubmit }: { onSubmit: (data: PlanData) => void }) => {
  const [form, setForm] = useState<PlanData>({
    servicios: {
      nutricion: true,
      entrenamiento: false
    },
    entrenamiento: {
      ubicacion: 'Gimnasio',
      material: {
        pesas: false,
        bandas: false,
        maquinas: false,
        barras: false,
        otros: []
      },
      nivel: 'Principiante',
      diasEntrenamiento: 3,
      duracionSesion: 45,
      objetivos: [],
      lesiones: [],
      preferencias: []
    },
    edad: 30,
    peso: 70,
    altura: 170,
    sexo: 'Hombre',
    objetivo: 'Perder grasa',
    restricciones: [],
    alimentosNoDeseados: [],
    actividadFisica: 'Moderada',
    intensidadTrabajo: 'Moderada',
    numeroComidas: 3,
  });

  const [restrictionError, setRestrictionError] = useState<string | null>(null);
  const [alimentosNoDeseadosTexto, setAlimentosNoDeseadosTexto] = useState('');
  const [asesoria, setAsesoria] = useState(false);
  const [paso, setPaso] = useState(0);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<'nutricion' | 'entrenamiento' | 'asesoria' | null>(null);

  // --- NUEVO: Selector de servicio siempre visible arriba ---
  const renderSelectorServicios = () => (
    <div className={styles['servicios-section']}>
      <h2>¿Qué servicio necesitas?</h2>
      <div className={styles['servicios-grid']}>
        <label className={`${styles['servicio-option']} ${servicioSeleccionado === 'nutricion' ? styles['selected'] : ''}`}>
          <input
            type="radio"
            name="servicio"
            style={{ display: 'none' }}
            checked={servicioSeleccionado === 'nutricion'}
            onChange={() => setServicioSeleccionado('nutricion')}
          />
          <div className={styles['servicio-content']} onClick={() => setServicioSeleccionado('nutricion')}>
            <span className={styles['servicio-icon']}>🥗</span>
            <span className={styles['servicio-title']}>Plan Nutricional</span>
            <span className={styles['servicio-description']}>Diseño de dieta personalizada</span>
          </div>
        </label>
        <label className={`${styles['servicio-option']} ${servicioSeleccionado === 'entrenamiento' ? styles['selected'] : ''}`}>
          <input
            type="radio"
            name="servicio"
            style={{ display: 'none' }}
            checked={servicioSeleccionado === 'entrenamiento'}
            onChange={() => setServicioSeleccionado('entrenamiento')}
          />
          <div className={styles['servicio-content']} onClick={() => setServicioSeleccionado('entrenamiento')}>
            <span className={styles['servicio-icon']}>💪</span>
            <span className={styles['servicio-title']}>Plan de Entrenamiento</span>
            <span className={styles['servicio-description']}>Rutinas personalizadas</span>
          </div>
        </label>
        <label className={`${styles['servicio-option']} ${servicioSeleccionado === 'asesoria' ? styles['selected'] : ''}`}>
          <input
            type="radio"
            name="servicio"
            style={{ display: 'none' }}
            checked={servicioSeleccionado === 'asesoria'}
            onChange={() => setServicioSeleccionado('asesoria')}
          />
          <div className={styles['servicio-content']} onClick={() => setServicioSeleccionado('asesoria')}>
            <span className={styles['servicio-icon']}>🧑‍⚕️</span>
            <span className={styles['servicio-title']}>Asesoría profesional 1 a 1</span>
            <span className={styles['servicio-description']}>Consulta directa con un profesional</span>
          </div>
        </label>
      </div>
    </div>
  );

  // --- NUEVO: Selector de pasos según servicio ---
  let pasosWizard: string[] = [];
  if (servicioSeleccionado === 'nutricion') pasosWizard = pasosNutricion;
  if (servicioSeleccionado === 'entrenamiento') pasosWizard = pasosEntrenamiento;

  // Días de la semana para selección
  const DIAS_SEMANA = [
    'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'
  ];
  const [diasSeleccionados, setDiasSeleccionados] = useState<string[]>(['lunes', 'miércoles', 'viernes']);

  useEffect(() => {
    setAlimentosNoDeseadosTexto(form.alimentosNoDeseados.join('\n'));
  }, []);

  // Cambiar: handleServicioChange para lógica exclusiva con asesoría
  const handleServicioChange = (servicio: 'nutricion' | 'entrenamiento') => {
    setForm(prev => {
      // Si se selecciona nutrición o entrenamiento, desactivar asesoría
      if (asesoria) setAsesoria(false);
      // Si se activa el servicio, asegurarse de que asesoría esté desactivada
      return {
        ...prev,
        servicios: {
          ...prev.servicios,
          [servicio]: !prev.servicios[servicio]
        }
      };
    });
    // Si se activa el servicio, desactivar asesoría
    if (!form.servicios[servicio] && asesoria) setAsesoria(false);
  };

  // Nuevo handler exclusivo para asesoría
  const handleAsesoriaChange = () => {
    setAsesoria(prev => {
      const nuevoValor = !prev;
      if (nuevoValor) {
        // Si se activa asesoría, desactivar nutrición y entrenamiento
        setForm(f => ({
          ...f,
          servicios: { nutricion: false, entrenamiento: false }
        }));
      }
      return nuevoValor;
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: ['edad', 'peso', 'altura', 'numeroComidas'].includes(name) ? Number(value) : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setForm(prev => {
      const nuevasRestricciones = checked
        ? [...prev.restricciones, value]
        : prev.restricciones.filter(r => r !== value);
      
      // Validar las restricciones
      const validation = validateRestrictions(nuevasRestricciones);
      setRestrictionError(validation.isValid ? null : (validation.message || null));
      
      return { ...prev, restricciones: nuevasRestricciones };
    });
  };

  const handleAlimentosNoDeseadosChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAlimentosNoDeseadosTexto(e.target.value);
    // No parsear a array hasta blur o submit
  };

  const parsearAlimentosNoDeseados = (texto: string) =>
    texto
      .split(/[,;\n]/)
      .map(alimento => alimento.trim())
      .filter(alimento => alimento.length > 0);

  const handleAlimentosNoDeseadosBlur = () => {
    setForm(prev => ({ ...prev, alimentosNoDeseados: parsearAlimentosNoDeseados(alimentosNoDeseadosTexto) }));
  };

  const handleEntrenamientoChange = (campo: string, valor: string | number | null) => {
    setForm(prev => ({
      ...prev,
      entrenamiento: {
        ...prev.entrenamiento!,
        [campo]: valor
      }
    }));
  };

  const handleMaterialChange = (material: string, checked: boolean) => {
    setForm(prev => ({
      ...prev,
      entrenamiento: {
        ...prev.entrenamiento!,
        material: {
          ...prev.entrenamiento!.material,
          [material]: checked
        }
      }
    }));
  };

  const handleOtrosMaterialesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const materiales = e.target.value
      .split(',')
      .map(m => m.trim())
      .filter(m => m.length > 0);
    
    setForm(prev => ({
      ...prev,
      entrenamiento: {
        ...prev.entrenamiento!,
        material: {
          ...prev.entrenamiento!.material,
          otros: materiales
        }
      }
    }));
  };

const handleEntrenamientoObjetivosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { value, checked } = e.target;
  setForm(prev => ({
    ...prev,
    entrenamiento: {
      ...prev.entrenamiento!,
      objetivos: checked
        ? [...prev.entrenamiento!.objetivos, value]
        : prev.entrenamiento!.objetivos.filter((obj: string) => obj !== value)
    }
  }));
};

  const handleEntrenamientoLesionesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const lesiones = e.target.value
      .split(',')
      .map(lesion => lesion.trim())
      .filter(lesion => lesion.length > 0);
    setForm(prev => ({
      ...prev,
      entrenamiento: {
        ...prev.entrenamiento!,
        lesiones
      }
    }));
  };

  const handleEntrenamientoPreferenciasChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const preferencias = e.target.value
      .split(',')
      .map(pref => pref.trim())
      .filter(pref => pref.length > 0);
    setForm(prev => ({
      ...prev,
      entrenamiento: {
        ...prev.entrenamiento!,
        preferencias
      }
    }));
  };

  const handleDiaSeleccion = (dia: string) => {
    setDiasSeleccionados(prev =>
      prev.includes(dia)
        ? prev.filter(d => d !== dia)
        : [...prev, dia]
    );
  };

  // En el handleSubmit, asegúrate de parsear antes de enviar
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (restrictionError) {
      return;
    }
    const alimentosNoDeseadosFinal = parsearAlimentosNoDeseados(alimentosNoDeseadosTexto);
    onSubmit({ ...(form as any), diasSeleccionados, tipoDieta: form.tipoDieta, alimentosNoDeseados: alimentosNoDeseadosFinal });
  };

  // --- NUEVO: Renderizado paso a paso (wizard) ---
  function renderPaso() {
    if (servicioSeleccionado === 'asesoria') {
      return (
        <div className={styles['wizard-step']}>
          <AsesoriaProfesional />
        </div>
      );
    }
    const actual = pasosWizard[paso];
    switch (actual) {
      case 'sexo':
        return (
          <div className={styles['wizard-step']}>
            <label className={styles['wizard-label']}>{etiquetas.sexo}</label>
            <div className={styles['wizard-options']}>
              {opciones.sexo.map((op) => (
                <button
                  key={op}
                  type="button"
                  className={form.sexo === op ? styles['wizard-btn-active'] : styles['wizard-btn']}
                  onClick={() => { setForm(f => ({ ...f, sexo: op })); setPaso(paso + 1); }}
                >
                  {op}
                </button>
              ))}
            </div>
          </div>
        );
      case 'edad':
        return (
          <div className={styles['wizard-step']}>
            <label className={styles['wizard-label']}>{etiquetas.edad}</label>
            <input
              type="number"
              className={styles['wizard-input']}
              value={form.edad}
              min={10}
              max={100}
              onChange={e => setForm(f => ({ ...f, edad: Number(e.target.value) }))}
              onKeyDown={e => e.key === 'Enter' && setPaso(paso + 1)}
              autoFocus
            />
            <div className={styles['wizard-nav']}>
              {paso > 0 && <button type="button" onClick={() => setPaso(paso - 1)} className={styles['wizard-back']}>Atrás</button>}
              <button type="button" onClick={() => setPaso(paso + 1)} className={styles['wizard-next']}>Siguiente</button>
            </div>
          </div>
        );
      case 'peso':
        return (
          <div className={styles['wizard-step']}>
            <label className={styles['wizard-label']}>{etiquetas.peso}</label>
            <input
              type="number"
              className={styles['wizard-input']}
              value={form.peso}
              min={30}
              max={250}
              onChange={e => setForm(f => ({ ...f, peso: Number(e.target.value) }))}
              onKeyDown={e => e.key === 'Enter' && setPaso(paso + 1)}
              autoFocus
            />
            <div className={styles['wizard-nav']}>
              <button type="button" onClick={() => setPaso(paso - 1)} className={styles['wizard-back']}>Atrás</button>
              <button type="button" onClick={() => setPaso(paso + 1)} className={styles['wizard-next']}>Siguiente</button>
            </div>
          </div>
        );
      case 'altura':
        return (
          <div className={styles['wizard-step']}>
            <label className={styles['wizard-label']}>{etiquetas.altura}</label>
            <input
              type="number"
              className={styles['wizard-input']}
              value={form.altura}
              min={120}
              max={230}
              onChange={e => setForm(f => ({ ...f, altura: Number(e.target.value) }))}
              onKeyDown={e => e.key === 'Enter' && setPaso(paso + 1)}
              autoFocus
            />
            <div className={styles['wizard-nav']}>
              <button type="button" onClick={() => setPaso(paso - 1)} className={styles['wizard-back']}>Atrás</button>
              <button type="button" onClick={() => setPaso(paso + 1)} className={styles['wizard-next']}>Siguiente</button>
            </div>
          </div>
        );
      case 'objetivo':
        return (
          <div className={styles['wizard-step']}>
            <label className={styles['wizard-label']}>{etiquetas.objetivo}</label>
            <div className={styles['wizard-options']}>
              {opciones.objetivo.map((op) => (
                <button
                  key={op}
                  type="button"
                  className={form.objetivo === op ? styles['wizard-btn-active'] : styles['wizard-btn']}
                  onClick={() => { setForm(f => ({ ...f, objetivo: op })); setPaso(paso + 1); }}
                >
                  {op}
                </button>
              ))}
            </div>
          </div>
        );
      case 'actividadFisica':
        return (
          <div className={styles['wizard-step']}>
            <label className={styles['wizard-label']}>{etiquetas.actividadFisica}</label>
            <div className={styles['wizard-options']}>
              {opciones.actividadFisica.map((op) => (
                <button
                  key={op}
                  type="button"
                  className={form.actividadFisica === op ? styles['wizard-btn-active'] : styles['wizard-btn']}
                  onClick={() => { setForm(f => ({ ...f, actividadFisica: op })); setPaso(paso + 1); }}
                >
                  {op}
                </button>
              ))}
            </div>
          </div>
        );
      case 'intensidadTrabajo':
        return (
          <div className={styles['wizard-step']}>
            <label className={styles['wizard-label']}>{etiquetas.intensidadTrabajo}</label>
            <div className={styles['wizard-options']}>
              {opciones.intensidadTrabajo.map((op) => (
                <button
                  key={op}
                  type="button"
                  className={form.intensidadTrabajo === op ? styles['wizard-btn-active'] : styles['wizard-btn']}
                  onClick={() => { setForm(f => ({ ...f, intensidadTrabajo: op })); setPaso(paso + 1); }}
                >
                  {op}
                </button>
              ))}
            </div>
          </div>
        );
      case 'numeroComidas':
        return (
          <div className={styles['wizard-step']}>
            <label className={styles['wizard-label']}>{etiquetas.numeroComidas}</label>
            <div className={styles['wizard-options']}>
              {opciones.numeroComidas.map((op) => (
                <button
                  key={op}
                  type="button"
                  className={form.numeroComidas === op ? styles['wizard-btn-active'] : styles['wizard-btn']}
                  onClick={() => { setForm(f => ({ ...f, numeroComidas: op })); setPaso(paso + 1); }}
                >
                  {op}
                </button>
              ))}
            </div>
          </div>
        );
      case 'restricciones':
        return (
          <div className={styles['wizard-step']}>
            <label className={styles['wizard-label']}>{etiquetas.restricciones}</label>
            <div className={styles['checkbox-group']}>
              {[ 'Intolerancia al gluten', 'Intolerancia a la lactosa', 'Alergia a frutos secos' ].map((restriccion) => (
                <label key={restriccion} className={styles['checkbox-label']}>
                  <span>{restriccion}</span>
                  <input
                    type="checkbox"
                    value={restriccion}
                    checked={form.restricciones.includes(restriccion)}
                    onChange={handleCheckboxChange}
                  />
                </label>
              ))}
            </div>
            {restrictionError && (
              <div className={styles['error-message']}>
                ⚠️ {restrictionError}
              </div>
            )}
            <div className={styles['wizard-nav']}>
              <button type="button" onClick={() => setPaso(paso - 1)} className={styles['wizard-back']}>Atrás</button>
              <button type="button" onClick={() => setPaso(paso + 1)} className={styles['wizard-next']}>Siguiente</button>
            </div>
          </div>
        );
      case 'alimentosNoDeseados':
        return (
          <div className={styles['wizard-step']}>
            <label htmlFor="alimentosNoDeseados" className={styles['form-label']}>{etiquetas.alimentosNoDeseados}</label>
            <textarea
              name="alimentosNoDeseados"
              id="alimentosNoDeseados"
              value={alimentosNoDeseadosTexto}
              onChange={handleAlimentosNoDeseadosChange}
              onBlur={handleAlimentosNoDeseadosBlur}
              placeholder="Escribe los alimentos que no te gustan separados por comas, punto y coma o en líneas distintas (ej: brócoli, coliflor; hígado\no cada uno en una línea)"
              className={styles['textarea']}
            />
            <small className={styles['help-text']}>
              Indica los alimentos o ingredientes que no te gustan o no quieres comer. Sepáralos por comas.
            </small>
            <div className={styles['wizard-nav']}>
              <button type="button" onClick={() => setPaso(paso - 1)} className={styles['wizard-back']}>Atrás</button>
              <button type="button" onClick={() => setPaso(paso + 1)} className={styles['wizard-next']}>Siguiente</button>
            </div>
          </div>
        );
      case 'tipoDieta':
        return (
          <div className={styles['wizard-step']}>
            <label htmlFor="tipoDieta">{etiquetas.tipoDieta}</label>
            <select
              name="tipoDieta"
              id="tipoDieta"
              value={form.tipoDieta || ''}
              onChange={e => setForm(prev => ({ ...prev, tipoDieta: e.target.value }))}
              className={styles['wizard-select']}
            >
              <option value="">Sin preferencia</option>
              <option value="vegana">Vegana</option>
              <option value="vegetariana">Vegetariana</option>
              <option value="keto">Keto</option>
              <option value="mediterranea">Mediterránea</option>
            </select>
            <small className={styles['help-text']}>
              Selecciona un tipo de dieta para filtrar solo los alimentos aptos.
            </small>
            <div className={styles['wizard-nav']}>
              <button type="button" onClick={() => setPaso(paso - 1)} className={styles['wizard-back']}>Atrás</button>
              <button type="button" onClick={() => setPaso(paso + 1)} className={styles['wizard-next']}>Siguiente</button>
            </div>
          </div>
        );
      // Eliminar el paso de servicios, ya no es necesario aquí
      case 'entrenamiento':
        return (
          <div className={styles['wizard-step']}>
            <label className={styles['wizard-label']}>{etiquetas.entrenamiento}</label>

            {/* Solo pedir edad, peso y altura si NO está activado nutrición */}
            {!form.servicios.nutricion && (
              <div className={styles['form-row']}>
                <div className={styles['form-group']}>
                  <label>Edad:</label>
                  <input type="number" name="edad" value={form.edad} onChange={handleChange} />
                </div>
                <div className={styles['form-group']}>
                  <label>Peso (kg):</label>
                  <input type="number" name="peso" value={form.peso} onChange={handleChange} />
                </div>
                <div className={styles['form-group']}>
                  <label>Altura (cm):</label>
                  <input type="number" name="altura" value={form.altura} onChange={handleChange} />
                </div>
              </div>
            )}

            <div className={styles['form-group']}>
              <label>¿Dónde vas a entrenar?</label>
              <div className={styles['radio-group']}>
                <label className={styles['radio-option']}>
                  <input
                    type="radio"
                    name="ubicacion"
                    value="Casa"
                    checked={form.entrenamiento?.ubicacion === 'Casa'}
                    onChange={(e) => handleEntrenamientoChange('ubicacion', e.target.value)}
                  />
                  <span>🏠 En casa</span>
                </label>
                <label className={styles['radio-option']}>
                  <input
                    type="radio"
                    name="ubicacion"
                    value="Gimnasio"
                    checked={form.entrenamiento?.ubicacion === 'Gimnasio'}
                    onChange={(e) => handleEntrenamientoChange('ubicacion', e.target.value)}
                  />
                  <span>💪 En gimnasio</span>
                </label>
                <label className={styles['radio-option']}>
                  <input
                    type="radio"
                    name="ubicacion"
                    value="Exterior"
                    checked={form.entrenamiento?.ubicacion === 'Exterior'}
                    onChange={(e) => handleEntrenamientoChange('ubicacion', e.target.value)}
                  />
                  <span>🌳 Al aire libre</span>
                </label>
              </div>
            </div>

            <div className={styles['form-row'] + ' ' + styles['experiencia-duracion']}>
              <div className={styles['form-group']}>
                <label>Nivel de experiencia:</label>
                <select
                  value={form.entrenamiento?.nivel}
                  onChange={(e) => handleEntrenamientoChange('nivel', e.target.value)}
                >
                  <option>Principiante</option>
                  <option>Intermedio</option>
                  <option>Avanzado</option>
                </select>
              </div>

              <div className={styles['form-group']}>
                <label>Duración de cada sesión (minutos):</label>
                <select
                  value={form.entrenamiento?.duracionSesion}
                  onChange={(e) => handleEntrenamientoChange('duracionSesion', Number(e.target.value))}
                >
                  <option value={30}>30 minutos</option>
                  <option value={45}>45 minutos</option>
                  <option value={60}>60 minutos</option>
                  <option value={90}>90 minutos</option>
                </select>
              </div>
            </div>

            <div className={styles['form-group']}>
              <label>Objetivos de entrenamiento:</label>
              <div className={styles['checkbox-group']}>
                {[
                  'Fuerza',
                  'Hipertrofia',
                  'Resistencia',
                  'Pérdida de grasa',
                  'Flexibilidad',
                  'Salud general'
                ].map((objetivo) => (
                  <label key={objetivo} className={styles['checkbox-label']}>
                    <input
                      type="checkbox"
                      value={objetivo}
                      checked={form.entrenamiento?.objetivos.includes(objetivo)}
                      onChange={handleEntrenamientoObjetivosChange}
                    />
                    <span>{objetivo}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className={styles['form-group']}>
              <label>¿Qué material tienes disponible?</label>
              <div className={styles['material-grid']}>
                <label className={styles['material-option']}>
                  <input
                    type="checkbox"
                    checked={form.entrenamiento?.material.pesas}
                    onChange={(e) => handleMaterialChange('pesas', e.target.checked)}
                  />
                  <span>🏋️‍♂️ Pesas</span>
                </label>
                <label className={styles['material-option']}>
                  <input
                    type="checkbox"
                    checked={form.entrenamiento?.material.bandas}
                    onChange={(e) => handleMaterialChange('bandas', e.target.checked)}
                  />
                  <span>🎯 Bandas elásticas</span>
                </label>
                <label className={styles['material-option']}>
                  <input
                    type="checkbox"
                    checked={form.entrenamiento?.material.maquinas}
                    onChange={(e) => handleMaterialChange('maquinas', e.target.checked)}
                  />
                  <span>🏋️‍♀️ Máquinas</span>
                </label>
                <label className={styles['material-option']}>
                  <input
                    type="checkbox"
                    checked={form.entrenamiento?.material.barras}
                    onChange={(e) => handleMaterialChange('barras', e.target.checked)}
                  />
                  <span>⚡ Barras</span>
                </label>
              </div>

              <div className={styles['form-group']}>
                <label>Otro material disponible:</label>
                <textarea
                  value={form.entrenamiento?.material.otros.join(', ')}
                  onChange={handleOtrosMaterialesChange}
                  placeholder="Escribe otros materiales que tengas disponibles, separados por comas"
                  className={styles['textarea']}
                />
                <small className={styles['help-text']}>
                  Indica cualquier otro material o equipamiento que tengas disponible para entrenar.
                </small>
              </div>
            </div>

            <div className={styles['form-group']}>
              <label>Lesiones o limitaciones físicas:</label>
              <textarea
                value={form.entrenamiento?.lesiones.join(', ')}
                onChange={handleEntrenamientoLesionesChange}
                placeholder="Escribe cualquier lesión o limitación física que tengas, separadas por comas"
                className={styles['textarea']}
              />
              <small className={styles['help-text']}>
                Es importante indicar cualquier lesión o limitación para adaptar el entrenamiento a tus necesidades.
              </small>
            </div>

            <div className={styles['form-group']}>
              <label>Preferencias de entrenamiento:</label>
              <textarea
                value={form.entrenamiento?.preferencias.join(', ')}
                onChange={handleEntrenamientoPreferenciasChange}
                placeholder="Escribe tus preferencias de entrenamiento (ej: prefiero cardio, me gustan los ejercicios de peso libre, etc.)"
                className={styles['textarea']}
              />
              <small className={styles['help-text']}>
                Indica tus preferencias o tipos de ejercicios que te gustan o prefieres evitar.
              </small>
            </div>

            <div className={styles['form-group']}>
              <label>Días de Entrenamiento (elige los días):</label>
              <div className={styles['dias-semana-grid']}>
                {DIAS_SEMANA.map(dia => (
                  <label key={dia} className={styles['checkbox-dia']}>
                    <input
                      type="checkbox"
                      checked={diasSeleccionados.includes(dia)}
                      onChange={() => handleDiaSeleccion(dia)}
                    />
                    <span>{dia.charAt(0).toUpperCase() + dia.slice(1)}</span>
                  </label>
                ))}
              </div>
              <small className={styles['help-text']}>
                Selecciona los días concretos en los que quieres entrenar. Puedes elegir cualquier combinación de lunes a domingo.
              </small>
            </div>

            <div className={styles['wizard-nav']}>
              <button type="button" onClick={() => setPaso(paso - 1)} className={styles['wizard-back']}>Atrás</button>
              <button type="button" onClick={() => setPaso(paso + 1)} className={styles['wizard-next']}>Siguiente</button>
            </div>
          </div>
        );
      // Al final, muestra un botón para enviar el formulario
      default:
        return (
          <div className={styles['wizard-step']}>
            <button type="submit" className={styles['wizard-submit']}>🧠 Generar plan personalizado</button>
          </div>
        );
    }
  }

  // --- Render principal ---
  return (
    <div>
      {renderSelectorServicios()}
      {servicioSeleccionado && (
        <form className="formContainer" onSubmit={handleSubmit} autoComplete="off">
          <div className={styles['wizard-progress']}>
            Paso {paso + 1} de {pasosWizard.length}
          </div>
          {renderPaso()}
        </form>
      )}
    </div>
  );
};

export default InputForm;
