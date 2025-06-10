import { useState, useEffect } from 'react';
import styles from './InputForm.module.css';
import { validateRestrictions } from '@/lib/validateRestrictions';
import { PlanData } from '@/types/plan';

const InputForm = ({ onSubmit }: { onSubmit: (data: PlanData) => void }) => {
  const [form, setForm] = useState<PlanData>({
    servicios: {
      nutricion: true,
      entrenamiento: false
    },
    entrenamiento: {
      ubicacion: null,
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

  // Días de la semana para selección
  const DIAS_SEMANA = [
    'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'
  ];
  const [diasSeleccionados, setDiasSeleccionados] = useState<string[]>(['lunes', 'miércoles', 'viernes']);

  useEffect(() => {
    setAlimentosNoDeseadosTexto(form.alimentosNoDeseados.join('\n'));
  }, []);

  const handleServicioChange = (servicio: 'nutricion' | 'entrenamiento') => {
    setForm(prev => ({
      ...prev,
      servicios: {
        ...prev.servicios,
        [servicio]: !prev.servicios[servicio]
      }
    }));
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

  return (
    <form onSubmit={handleSubmit} className={styles['form-wrapper']}>
      <div className={styles['servicios-section']}>
        <h2>¿Qué servicio necesitas?</h2>
        <div className={styles['servicios-grid']}>
          <label className={`${styles['servicio-option']} ${form.servicios.nutricion ? styles['selected'] : ''}`}>
            <input
              type="checkbox"
              checked={form.servicios.nutricion}
              onChange={() => handleServicioChange('nutricion')}
            />
            <div className={styles['servicio-content']}>
              <span className={styles['servicio-icon']}>🥗</span>
              <span className={styles['servicio-title']}>Plan Nutricional</span>
              <span className={styles['servicio-description']}>Diseño de dieta personalizada</span>
            </div>
          </label>

          <label className={`${styles['servicio-option']} ${form.servicios.entrenamiento ? styles['selected'] : ''}`}>
            <input
              type="checkbox"
              checked={form.servicios.entrenamiento}
              onChange={() => handleServicioChange('entrenamiento')}
            />
            <div className={styles['servicio-content']}>
              <span className={styles['servicio-icon']}>💪</span>
              <span className={styles['servicio-title']}>Plan de Entrenamiento</span>
              <span className={styles['servicio-description']}>Rutinas personalizadas</span>
            </div>
          </label>
        </div>
      </div>

      {form.servicios.nutricion && (
        <div className={styles['nutricion-section']}>
          <h2>Configuración del Plan Nutricional</h2>
          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label>Edad:</label>
              <input type="number" name="edad" value={form.edad} onChange={handleChange} />
            </div>

            <div className={styles['form-group']}>
              <label>Sexo:</label>
              <select name="sexo" value={form.sexo} onChange={handleChange}>
                <option>Hombre</option>
                <option>Mujer</option>
              </select>
            </div>
          </div>

          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label>Peso (kg):</label>
              <input type="number" name="peso" value={form.peso} onChange={handleChange} />
            </div>

            <div className={styles['form-group']}>
              <label>Altura (cm):</label>
              <input type="number" name="altura" value={form.altura} onChange={handleChange} />
            </div>
          </div>

          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label>Objetivo:</label>
              <select name="objetivo" value={form.objetivo} onChange={handleChange}>
                <option>Perder grasa</option>
                <option>Ganar masa muscular</option>
                <option>Mantener peso</option>
              </select>
            </div>

            <div className={styles['form-group']}>
              <label>Número de comidas diarias:</label>
              <select name="numeroComidas" value={form.numeroComidas} onChange={handleChange}>
                <option value={2}>2 (comida y cena)</option>
                <option value={3}>3 (desayuno, comida y cena)</option>
                <option value={4}>4 (añade snack)</option>
              </select>
            </div>
          </div>

          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label>Nivel de actividad física:</label>
              <select name="actividadFisica" value={form.actividadFisica} onChange={handleChange}>
                <option>Sedentario</option>
                <option>Ligero</option>
                <option>Moderado</option>
                <option>Intenso</option>
              </select>
            </div>

            <div className={styles['form-group']}>
              <label>Intensidad del trabajo diario:</label>
              <select name="intensidadTrabajo" value={form.intensidadTrabajo} onChange={handleChange}>
                <option>Leve</option>
                <option>Moderada</option>
                <option>Vigorosa</option>
              </select>
            </div>
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="restricciones" className={styles['form-label']}>Restricciones alimentarias:</label>
            <div className={styles['checkbox-group']} id="restricciones">
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
          </div>

          <div className={styles['form-row']}>
            <div className={styles['form-group']}>
              <label htmlFor="alimentosNoDeseados">Alimentos que no te gustan:</label>
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
            </div>
            <div className={styles['form-group']}>
              <label htmlFor="tipoDieta">Tipo de dieta:</label>
              <select
                name="tipoDieta"
                id="tipoDieta"
                value={form.tipoDieta || ''}
                onChange={e => setForm(prev => ({ ...prev, tipoDieta: e.target.value }))}
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
            </div>
          </div>
        </div>
      )}

      {form.servicios.entrenamiento && (
        <div className={styles['entrenamiento-section']}>
          <h2>Configuración del Entrenamiento</h2>

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
                  value="casa"
                  checked={form.entrenamiento?.ubicacion === 'casa'}
                  onChange={(e) => handleEntrenamientoChange('ubicacion', e.target.value)}
                />
                <span>🏠 En casa</span>
              </label>
              <label className={styles['radio-option']}>
                <input
                  type="radio"
                  name="ubicacion"
                  value="gimnasio"
                  checked={form.entrenamiento?.ubicacion === 'gimnasio'}
                  onChange={(e) => handleEntrenamientoChange('ubicacion', e.target.value)}
                />
                <span>💪 En gimnasio</span>
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
        </div>
      )}

      <button type="submit" className={styles['submit-button']}>
        🧠 Generar plan personalizado
      </button>
    </form>
  );
};

export default InputForm;
