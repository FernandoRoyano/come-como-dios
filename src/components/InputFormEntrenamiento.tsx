import { useState } from 'react';
import styles from './InputForm.module.css';
import { PlanData } from '@/types/plan';

const pasosEntrenamiento = [
  'sexo',
  'edad',
  'peso',
  'altura',
  'objetivo', // NUEVO
  'actividadFisica', // NUEVO
  'ubicacion',
  'nivel',
  'duracionSesion',
  'objetivos',
  'material',
  'otros',
  'lesiones',
  'preferencias',
  'diasEntrenamiento',
];

const etiquetas = {
  sexo: '¿Cuál es tu sexo?',
  edad: '¿Cuál es tu edad?',
  peso: '¿Cuál es tu peso (kg)?',
  altura: '¿Cuál es tu altura (cm)?',
  ubicacion: '¿Dónde entrenas?',
  nivel: '¿Nivel de experiencia?',
  duracionSesion: '¿Duración de la sesión (min)?',
  objetivos: 'Objetivos de entrenamiento',
  material: '¿Qué material tienes disponible?',
  otros: 'Otro material disponible',
  lesiones: 'Lesiones o limitaciones físicas',
  preferencias: 'Preferencias de entrenamiento',
  diasEntrenamiento: 'Días de entrenamiento',
  objetivo: '¿Cuál es tu objetivo principal?',
  actividadFisica: '¿Cuál es tu nivel de actividad física habitual?',
};

const opciones = {
  sexo: ['Hombre', 'Mujer'],
  ubicacion: ['Casa', 'Gimnasio', 'Exterior'],
  nivel: ['Principiante', 'Intermedio', 'Avanzado'],
  objetivos: ['Fuerza', 'Hipertrofia', 'Resistencia', 'Pérdida de grasa', 'Flexibilidad', 'Salud general'],
  objetivo: [
    'Ganar músculo',
    'Perder grasa',
    'Mantener peso',
    'Mejorar salud',
    'Rendimiento deportivo',
  ],
  actividadFisica: [
    'Sedentario',
    'Ligera (1-2 días/semana)',
    'Moderada (3-4 días/semana)',
    'Alta (5-7 días/semana)',
  ],
};

const DIAS_SEMANA = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];

export default function InputFormEntrenamiento({ onSubmit, onBack }: { onSubmit: (data: PlanData) => void, onBack: () => void }) {
  const [form, setForm] = useState<PlanData>({
    servicios: { nutricion: false, entrenamiento: true },
    edad: 30,
    peso: 70,
    altura: 170,
    sexo: 'Hombre',
    objetivo: '',
    restricciones: [],
    alimentosNoDeseados: [],
    actividadFisica: '',
    intensidadTrabajo: '',
    numeroComidas: 0,
    entrenamiento: {
      ubicacion: 'Casa',
      material: { pesas: false, bandas: false, maquinas: false, barras: false, otros: [] },
      nivel: 'Principiante',
      diasEntrenamiento: 3,
      duracionSesion: 45,
      objetivos: [],
      lesiones: [],
      preferencias: [],
    },
  });
  const [paso, setPaso] = useState(0);
  const [diasSeleccionados, setDiasSeleccionados] = useState<string[]>(['lunes', 'miércoles', 'viernes']);

  const handleChange = (campo: string, valor: any) => {
    if (campo in form.entrenamiento!) {
      setForm(f => ({ ...f, entrenamiento: { ...f.entrenamiento!, [campo]: valor } }));
    } else {
      setForm(f => ({ ...f, [campo]: valor }));
    }
  };

  const handleArrayChange = (campo: string, valor: string) => {
    setForm(f => ({ ...f, entrenamiento: { ...f.entrenamiento!, [campo]: valor.split(',').map(v => v.trim()).filter(Boolean) } }));
  };

  const handleMaterialChange = (tipo: string, checked: boolean) => {
    setForm(f => ({ ...f, entrenamiento: { ...f.entrenamiento!, material: { ...f.entrenamiento!.material, [tipo]: checked } } }));
  };

  const renderPaso = () => {
    const key = pasosEntrenamiento[paso];
    // Campos que pertenecen a PlanData
    const planDataKeys = ['sexo', 'edad', 'peso', 'altura', 'objetivo', 'restricciones', 'alimentosNoDeseados', 'actividadFisica', 'intensidadTrabajo', 'numeroComidas'];
    // Campos que pertenecen a entrenamiento
    const entrenamientoKeys = ['ubicacion', 'nivel', 'duracionSesion', 'objetivos', 'material', 'otros', 'lesiones', 'preferencias', 'diasEntrenamiento'];
    switch (key) {
      case 'sexo':
        return (
          <div className={styles['wizard-step']}>
            <label>{etiquetas[key]}</label>
            <select value={form.sexo} onChange={e => handleChange('sexo', e.target.value)}>
              {opciones.sexo.map((op: any) => <option key={op} value={op}>{op}</option>)}
            </select>
            <div className={styles['wizard-nav']}>
              {paso > 0 && <button type="button" onClick={() => setPaso(paso - 1)} className={styles['wizard-back']}>Atrás</button>}
              <button type="button" onClick={() => setPaso(paso + 1)} className={styles['wizard-next']}>Siguiente</button>
            </div>
          </div>
        );
      case 'ubicacion':
        return (
          <div className={styles['wizard-step']}>
            <label>{etiquetas[key]}</label>
            <select value={form.entrenamiento!.ubicacion} onChange={e => handleChange('ubicacion', e.target.value)}>
              {opciones.ubicacion.map((op: any) => <option key={op} value={op}>{op}</option>)}
            </select>
            <div className={styles['wizard-nav']}>
              {paso > 0 && <button type="button" onClick={() => setPaso(paso - 1)} className={styles['wizard-back']}>Atrás</button>}
              <button type="button" onClick={() => setPaso(paso + 1)} className={styles['wizard-next']}>Siguiente</button>
            </div>
          </div>
        );
      case 'nivel':
        return (
          <div className={styles['wizard-step']}>
            <label>{etiquetas[key]}</label>
            <select value={form.entrenamiento!.nivel} onChange={e => handleChange('nivel', e.target.value)}>
              {opciones.nivel.map((op: any) => <option key={op} value={op}>{op}</option>)}
            </select>
            <div className={styles['wizard-nav']}>
              {paso > 0 && <button type="button" onClick={() => setPaso(paso - 1)} className={styles['wizard-back']}>Atrás</button>}
              <button type="button" onClick={() => setPaso(paso + 1)} className={styles['wizard-next']}>Siguiente</button>
            </div>
          </div>
        );
      case 'edad':
      case 'peso':
      case 'altura':
        return (
          <div className={styles['wizard-step']}>
            <label>{etiquetas[key]}</label>
            <input type="number" value={form[key]} onChange={e => handleChange(key, Number(e.target.value))} />
            <div className={styles['wizard-nav']}>
              {paso > 0 && <button type="button" onClick={() => setPaso(paso - 1)} className={styles['wizard-back']}>Atrás</button>}
              <button type="button" onClick={() => setPaso(paso + 1)} className={styles['wizard-next']}>Siguiente</button>
            </div>
          </div>
        );
      case 'duracionSesion':
        return (
          <div className={styles['wizard-step']}>
            <label>{etiquetas[key]}</label>
            <input type="number" value={form.entrenamiento!.duracionSesion} onChange={e => handleChange('duracionSesion', Number(e.target.value))} />
            <div className={styles['wizard-nav']}>
              {paso > 0 && <button type="button" onClick={() => setPaso(paso - 1)} className={styles['wizard-back']}>Atrás</button>}
              <button type="button" onClick={() => setPaso(paso + 1)} className={styles['wizard-next']}>Siguiente</button>
            </div>
          </div>
        );
      case 'objetivos':
        return (
          <div className={styles['wizard-step']}>
            <label>{etiquetas[key]}</label>
            <div className={styles['checkbox-group']}>
              {opciones.objetivos.map((obj: string) => (
                <label key={obj} className={styles['checkbox-label']}>
                  <input
                    type="checkbox"
                    value={obj}
                    checked={form.entrenamiento!.objetivos.includes(obj)}
                    onChange={e => {
                      const checked = e.target.checked;
                      setForm(f => ({
                        ...f,
                        entrenamiento: {
                          ...f.entrenamiento!,
                          objetivos: checked
                            ? [...f.entrenamiento!.objetivos, obj]
                            : f.entrenamiento!.objetivos.filter((o: string) => o !== obj)
                        }
                      }));
                    }}
                  />
                  <span>{obj}</span>
                </label>
              ))}
            </div>
            <div className={styles['wizard-nav']}>
              {paso > 0 && <button type="button" onClick={() => setPaso(paso - 1)} className={styles['wizard-back']}>Atrás</button>}
              <button type="button" onClick={() => setPaso(paso + 1)} className={styles['wizard-next']}>Siguiente</button>
            </div>
          </div>
        );
      case 'material':
        return (
          <div className={styles['wizard-step']}>
            <label>{etiquetas[key]}</label>
            <div className={styles['material-grid']}>
              {(['pesas', 'bandas', 'maquinas', 'barras'] as Array<'pesas' | 'bandas' | 'maquinas' | 'barras'>).map(tipo => (
                <label key={tipo} className={styles['material-option']}>
                  <input
                    type="checkbox"
                    checked={form.entrenamiento!.material[tipo]}
                    onChange={e => handleMaterialChange(tipo, e.target.checked)}
                  />
                  <span>{tipo.charAt(0).toUpperCase() + tipo.slice(1)}</span>
                </label>
              ))}
            </div>
            <div className={styles['wizard-nav']}>
              {paso > 0 && <button type="button" onClick={() => setPaso(paso - 1)} className={styles['wizard-back']}>Atrás</button>}
              <button type="button" onClick={() => setPaso(paso + 1)} className={styles['wizard-next']}>Siguiente</button>
            </div>
          </div>
        );
      case 'otros':
        return (
          <div className={styles['wizard-step']}>
            <label>{etiquetas[key]}</label>
            <input type="text" value={form.entrenamiento!.material.otros.join(', ')} onChange={e => handleChange('material', { ...form.entrenamiento!.material, otros: e.target.value.split(',').map((v: string) => v.trim()).filter(Boolean) })} placeholder="Separados por coma" />
            <div className={styles['wizard-nav']}>
              {paso > 0 && <button type="button" onClick={() => setPaso(paso - 1)} className={styles['wizard-back']}>Atrás</button>}
              <button type="button" onClick={() => setPaso(paso + 1)} className={styles['wizard-next']}>Siguiente</button>
            </div>
          </div>
        );
      case 'lesiones':
      case 'preferencias':
        return (
          <div className={styles['wizard-step']}>
            <label>{etiquetas[key]}</label>
            <input type="text" value={form.entrenamiento![key].join(', ')} onChange={e => handleArrayChange(key, e.target.value)} placeholder="Separados por coma" />
            <div className={styles['wizard-nav']}>
              {paso > 0 && <button type="button" onClick={() => setPaso(paso - 1)} className={styles['wizard-back']}>Atrás</button>}
              <button type="button" onClick={() => setPaso(paso + 1)} className={styles['wizard-next']}>Siguiente</button>
            </div>
          </div>
        );
      case 'diasEntrenamiento':
        return (
          <div className={styles['wizard-step']}>
            <label>{etiquetas[key]}</label>
            <div className={styles['dias-semana-grid']}>
              {DIAS_SEMANA.map(dia => (
                <label key={dia} className={styles['checkbox-dia']}>
                  <input
                    type="checkbox"
                    checked={diasSeleccionados.includes(dia)}
                    onChange={() => setDiasSeleccionados(prev => prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia])}
                  />
                  <span>{dia.charAt(0).toUpperCase() + dia.slice(1)}</span>
                </label>
              ))}
            </div>
            <div className={styles['wizard-nav']}>
              {paso > 0 && <button type="button" onClick={() => setPaso(paso - 1)} className={styles['wizard-back']}>Atrás</button>}
              <button type="button" onClick={() => setPaso(paso + 1)} className={styles['wizard-next']}>Siguiente</button>
            </div>
          </div>
        );
      case 'objetivo':
        return (
          <div className={styles['wizard-step']}>
            <label>{etiquetas[key]}</label>
            <select value={form.objetivo} onChange={e => handleChange('objetivo', e.target.value)}>
              <option value="">Selecciona un objetivo</option>
              {opciones.objetivo.map((op: any) => <option key={op} value={op}>{op}</option>)}
            </select>
            <div className={styles['wizard-nav']}>
              {paso > 0 && <button type="button" onClick={() => setPaso(paso - 1)} className={styles['wizard-back']}>Atrás</button>}
              <button type="button" onClick={() => setPaso(paso + 1)} className={styles['wizard-next']}>Siguiente</button>
            </div>
          </div>
        );
      case 'actividadFisica':
        return (
          <div className={styles['wizard-step']}>
            <label>{etiquetas[key]}</label>
            <select value={form.actividadFisica} onChange={e => handleChange('actividadFisica', e.target.value)}>
              <option value="">Selecciona tu nivel</option>
              {opciones.actividadFisica.map((op: any) => <option key={op} value={op}>{op}</option>)}
            </select>
            <div className={styles['wizard-nav']}>
              {paso > 0 && <button type="button" onClick={() => setPaso(paso - 1)} className={styles['wizard-back']}>Atrás</button>}
              <button type="button" onClick={() => setPaso(paso + 1)} className={styles['wizard-next']}>Siguiente</button>
            </div>
          </div>
        );
      default:
        return (
          <div className={styles['wizard-step']}>
            <button type="submit" className={styles['wizard-submit']}>🧠 Generar plan de entrenamiento</button>
            <button type="button" onClick={onBack} className={styles['wizard-back']} style={{marginLeft:8}}>Volver al selector</button>
          </div>
        );
    }
  };

  return (
    <form className="formContainer" onSubmit={e => { e.preventDefault(); onSubmit({ ...form, entrenamiento: { ...form.entrenamiento! } }); }} className={styles['form-wrapper']}>
      <div className={styles['wizard-progress']}>
        Paso {paso + 1} de {pasosEntrenamiento.length} (Entrenamiento)
      </div>
      {renderPaso()}
    </form>
  );
}
