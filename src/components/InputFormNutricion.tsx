import { useState } from 'react';
import styles from './InputForm.module.css';
import { PlanData } from '@/types/plan';

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
};

const opciones = {
  sexo: ['Hombre', 'Mujer'],
  objetivo: ['Perder grasa', 'Ganar masa muscular', 'Mantener peso'],
  actividadFisica: ['Sedentario', 'Ligero', 'Moderado', 'Intenso'],
  intensidadTrabajo: ['Leve', 'Moderada', 'Vigorosa'],
  numeroComidas: [2, 3, 4],
  tipoDieta: ['', 'vegana', 'vegetariana', 'keto', 'mediterranea'],
};

export default function InputFormNutricion({ onSubmit, onBack }: { onSubmit: (data: PlanData) => void, onBack: () => void }) {
  const [form, setForm] = useState<PlanData>({
    servicios: { nutricion: true, entrenamiento: false },
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
    entrenamiento: undefined,
  });
  const [paso, setPaso] = useState(0);

  const handleChange = (campo: string, valor: any) => {
    setForm(f => ({ ...f, [campo]: valor }));
  };

  const handleArrayChange = (campo: string, valor: string) => {
    setForm(f => ({ ...f, [campo]: valor.split(',').map(v => v.trim()).filter(Boolean) }));
  };

  const renderPaso = () => {
    const key = pasosNutricion[paso];
    switch (key) {
      case 'sexo':
      case 'objetivo':
      case 'actividadFisica':
      case 'intensidadTrabajo':
      case 'numeroComidas':
      case 'tipoDieta':
        return (
          <div className={styles['wizard-step']}>
            <label>{etiquetas[key]}</label>
            <select value={form[key]} onChange={e => handleChange(key, e.target.value)}>
              {opciones[key].map((op: any) => <option key={op} value={op}>{op || 'Cualquiera'}</option>)}
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
      case 'restricciones':
      case 'alimentosNoDeseados':
        return (
          <div className={styles['wizard-step']}>
            <label>{etiquetas[key]}</label>
            <input type="text" value={form[key].join(', ')} onChange={e => handleArrayChange(key, e.target.value)} placeholder="Separados por coma" />
            <div className={styles['wizard-nav']}>
              {paso > 0 && <button type="button" onClick={() => setPaso(paso - 1)} className={styles['wizard-back']}>Atrás</button>}
              <button type="button" onClick={() => setPaso(paso + 1)} className={styles['wizard-next']}>Siguiente</button>
            </div>
          </div>
        );
      default:
        return (
          <div className={styles['wizard-step']}>
            <button type="submit" className={styles['wizard-submit']}>🧠 Generar plan nutricional</button>
            <button type="button" onClick={onBack} className={styles['wizard-back']} style={{marginLeft:8}}>Volver al selector</button>
          </div>
        );
    }
  };

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(form); }} className={styles['form-wrapper']}>
      <div className={styles['wizard-progress']}>
        Paso {paso + 1} de {pasosNutricion.length} (Nutrición)
      </div>
      {renderPaso()}
    </form>
  );
}
