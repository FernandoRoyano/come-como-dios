import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { UserPlan } from '../../types/user';
import TrainingViewer from '../../components/TrainingViewer';
import PlanViewer from '../../components/PlanViewer';

export default function PlanDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [plan, setPlan] = useState<UserPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchPlan = async () => {
      try {
        const response = await fetch(`/api/user/plans?id=${id}`);
        if (response.ok) {
          const data = await response.json();
          setPlan(data.plan);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPlan();
  }, [id]);

  if (loading) return <div style={{padding:'2rem',textAlign:'center'}}>Cargando plan...</div>;
  if (!plan) return <div style={{padding:'2rem',textAlign:'center'}}>Plan no encontrado</div>;

  // Parsear el plan si viene como string
  let planData = plan.plan;
  if (typeof planData === 'string') {
    try {
      planData = JSON.parse(planData);
    } catch {}
  }

  return (
    <div style={{maxWidth:900,margin:'2rem auto'}}>
      <button
        onClick={() => router.push('/dashboard')}
        style={{
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '0.7rem',
          padding: '0.7rem 1.7rem',
          fontWeight: 600,
          fontSize: '1.1rem',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(52,152,219,0.10)',
          transition: 'background 0.2s',
        }}
      >
        ← Volver al Dashboard
      </button>
      <h1 style={{textAlign:'center',marginBottom:'2rem'}}>{plan.metadata.title}</h1>
      <div style={{marginBottom:'2rem'}}>
        <strong>Tipo:</strong> {plan.type === 'nutrition' ? 'Nutrición' : 'Entrenamiento'}<br/>
        <strong>Fecha:</strong> {new Date(plan.createdAt).toLocaleString()}
        <br/>
        <strong>Usuario:</strong> {plan.userName || plan.userId}
      </div>
      {plan.type === 'training' ? (
        <TrainingViewer plan={planData as import('../../types/plan').PlanEntrenamiento} />
      ) : (
        <PlanViewer plan={planData as import('../../types/plan').Plan} />
      )}
    </div>
  );
}
