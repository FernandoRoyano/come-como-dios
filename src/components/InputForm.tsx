import { useState } from 'react';
import styles from './InputForm.module.css';

interface FormData {
  edad: number;
  peso: number;
  altura: number;
  sexo: string;
  objetivo: string;
  restricciones: string[];
  actividadFisica: string;
  intensidadTrabajo: string;
  numeroComidas: number;
}

const InputForm = ({ onSubmit }: { onSubmit: (data: FormData) => void }) => {
  const [form, setForm] = useState<FormData>({
    edad: 30,
    peso: 70,
    altura: 170,
    sexo: 'Hombre',
    objetivo: 'Perder grasa',
    restricciones: [],
    actividadFisica: 'Moderada',
    intensidadTrabajo: 'Moderada',
    numeroComidas: 3,
  });

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
      return { ...prev, restricciones: nuevasRestricciones };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className={styles['form-wrapper']}>

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
        <label>Restricciones alimentarias:</label>
        <div className={styles['checkbox-group']}>
          {[
            'Intolerancia al gluten',
            'Intolerancia a la lactosa',
            'Alergia a frutos secos',
            'Vegetariano',
            'Vegano',
            'Dieta keto',
            'Dieta mediterránea',
            'Low carb'
          ].map((restriccion) => (
            <label key={restriccion} className={styles['checkbox-label']}>
              <input
                type="checkbox"
                value={restriccion}
                checked={form.restricciones.includes(restriccion)}
                onChange={handleCheckboxChange}
              />
              <span>{restriccion}</span>
            </label>
          ))}
        </div>
      </div>

      <button type="submit" className={styles['submit-button']}>
        🧠 Generar plan personalizado
      </button>
    </form>
  );
};

export default InputForm;
