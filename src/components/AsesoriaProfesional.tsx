import React, { useState } from 'react';
import styles from './AsesoriaProfesional.module.css';

export default function AsesoriaProfesional() {
  const [enviado, setEnviado] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', mensaje: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Aquí puedes integrar un endpoint real o servicio externo
    setTimeout(() => {
      setEnviado(true);
      setLoading(false);
    }, 1200);
  };

  if (enviado) {
    return <div className={styles.exito}>¡Gracias! Te contactaremos pronto.</div>;
  }

  return (
    <section className={styles.asesoriaBox}>
      <h2>Asesoría profesional 1 a 1</h2>
      <p>¿Quieres un plan 100% personalizado, seguimiento y contacto directo con un profesional? Solicita tu asesoría individual y lleva tu salud y entrenamiento al siguiente nivel.</p>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type="text"
          name="nombre"
          placeholder="Tu nombre"
          value={form.nombre}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Tu email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <textarea
          name="mensaje"
          placeholder="¿Qué necesitas? (opcional)"
          value={form.mensaje}
          onChange={handleChange}
        />
        <button type="submit" disabled={loading}>{loading ? 'Enviando...' : 'Solicitar asesoría'}</button>
      </form>
      <div className={styles.contactoAlternativo}>
        <span>O contáctanos directamente:</span>
        <a href="mailto:asesoria@comecomodios.com">asesoria@comecomodios.com</a>
        <a href="https://wa.me/34600000000" target="_blank" rel="noopener noreferrer">WhatsApp</a>
      </div>
    </section>
  );
}
