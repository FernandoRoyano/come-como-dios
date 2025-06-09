import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { UserPlan } from '../../types/user';
import TrainingViewer from '../../components/TrainingViewer';
import PlanViewer from '../../components/PlanViewer';
import styles from './PlanDetail.module.css';

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

  if (loading) return <div className={styles.loading}>Cargando plan...</div>;
  if (!plan) return <div className={styles.notFound}>Plan no encontrado</div>;

  // Parsear el plan si viene como string
  let planData = plan.plan;
  if (typeof planData === 'string') {
    try {
      planData = JSON.parse(planData);
    } catch {}
  }

  return (
    <div className={styles.planDetailContainer}>
      <button
        onClick={() => router.push('/dashboard')}
        className={styles.backButton}
      >
        ← Volver al Dashboard
      </button>
      <h1 className={styles.planTitle}>{plan.metadata.title}</h1>
      <div className={styles.planInfo}>
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
