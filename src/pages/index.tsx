import { useState } from 'react';
import { useSession } from 'next-auth/react';
import InputForm from '../components/InputForm';
import PlanViewer from '@/components/PlanViewer';
import AuthButton from '@/components/AuthButton';
import styles from './index.module.css';

export default function Home() {
  const [plan, setPlan] = useState<any>(null);
  const [formData, setFormData] = useState<any>(null); // ✅ Añadido para guardar el formulario
  const [loading, setLoading] = useState<boolean>(false);
  const { data: session, status } = useSession();

  const handleFormSubmit = async (data: any) => {
    setLoading(true);
    setPlan(null);
    setFormData(data); // ✅ Guardamos datos del usuario

    try {
      const response = await fetch('/api/generatePlan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || 'Error desconocido');

      setPlan(result.plan);
    } catch (err) {
      console.error(err);
      setPlan({ error: '⚠️ Error al generar el plan con IA.' });
    }

    setLoading(false);
  };

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Come Como Dios</h1>
      <p className={styles.description}>
        🧬 Tu plan de alimentación semanal 100% personalizado con IA. 
        Diseñado para ayudarte a lograr tus objetivos de salud y nutrición de forma inteligente y sencilla.
      </p>
      <AuthButton />
      {status === 'loading' ? (
        <p className={styles.notice}>Cargando sesión...</p>
      ) : session ? (
        <>
          <InputForm onSubmit={handleFormSubmit} />
          {loading && <p style={{ marginTop: '2rem' }}>🧠 Generando tu plan personalizado con IA...</p>}
          {!loading && plan?.dias && (
            <PlanViewer
              plan={plan}
              restricciones={formData?.restricciones}
              objetivo={formData?.objetivo}
              numeroComidas={formData?.numeroComidas}
            />
          )}
          {!loading && plan?.error && <p style={{ color: 'red' }}>{plan.error}</p>}
        </>
      ) : (
        <p className={styles.notice}>🔐 Por favor, inicia sesión con Google para usar la app.</p>
      )}
    </main>
  );
}
