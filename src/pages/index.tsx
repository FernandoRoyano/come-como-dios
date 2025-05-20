import { useState } from 'react';
import InputForm from '../components/InputForm';
import PlanViewer from '@/components/PlanViewer';

export default function Home() {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleFormSubmit = async (data: any) => {
    setLoading(true);
    setPlan(null);

    try {
      const response = await fetch('/api/generatePlan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.message || 'Error desconocido');

      setPlan(result.plan); // ✅ Ya no usamos JSON.parse
    } catch (err) {
      console.error(err);
      setPlan({ error: '⚠️ Error al generar el plan con IA.' });
    }

    setLoading(false);
  };

  return (
    <main>
      <h1>Come Como Dios</h1>
      <InputForm onSubmit={handleFormSubmit} />
      {loading && <p style={{ marginTop: '2rem' }}>🧠 Generando tu plan personalizado con IA...</p>}
      {!loading && plan?.dias && <PlanViewer plan={plan} />}
      {!loading && plan?.error && <p style={{ color: 'red' }}>{plan.error}</p>}
    </main>
  );
}
