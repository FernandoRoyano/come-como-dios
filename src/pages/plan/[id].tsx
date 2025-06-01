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

  return (
    <div style={{maxWidth:900,margin:'2rem auto'}}>
      <h1 style={{textAlign:'center',marginBottom:'2rem'}}>{plan.metadata.title}</h1>
      <div style={{marginBottom:'2rem'}}>
        <strong>Tipo:</strong> {plan.type === 'nutrition' ? 'Nutrición' : 'Entrenamiento'}<br/>
        <strong>Fecha:</strong> {new Date(plan.createdAt).toLocaleString()}
        <br/>
        <strong>Usuario:</strong> {plan.userName || plan.userId}
      </div>
      {plan.type === 'training' ? (
        <TrainingViewer plan={plan.plan as any} />
      ) : (
        <PlanViewer plan={plan.plan as any} />
      )}
    </div>
  );
}
