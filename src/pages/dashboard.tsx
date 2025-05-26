import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import styles from './dashboard.module.css';
import { UserPlan } from '../types/user';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [plans, setPlans] = useState<UserPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchUserPlans();
    }
  }, [session]);

  const fetchUserPlans = async () => {
    try {
      const response = await fetch('/api/user/plans');
      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans);
      }
    } catch (error) {
      console.error('Error al cargar los planes:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPlan = (plan: UserPlan) => {
    const planData = JSON.stringify(plan, null, 2);
    const blob = new Blob([planData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${plan.metadata.title}-${plan.type}-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const deletePlan = async (planId: string) => {
    try {
      const response = await fetch(`/api/user/plans?id=${planId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setPlans(plans.filter(plan => plan.id !== planId));
      }
    } catch (error) {
      console.error('Error al eliminar el plan:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <p>Cargando tu panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Mi Panel Personal</h1>
        <p>Bienvenido, {session?.user?.name}</p>
      </header>
<section className={styles.userSummary}>
  <div className={styles.userCard}>
    <h2>Resumen de Usuario</h2>
    <p><strong>Nombre:</strong> {session?.user?.name}</p>
    <p><strong>Email:</strong> {session?.user?.email}</p>
  </div>
</section>

      <main className={styles.main}>
        <section className={styles.plansSection}>
          <h2>Mis Planes Guardados</h2>
          
          {plans.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No tienes planes guardados aún.</p>
              <button 
                className={styles.createPlanButton}
                onClick={() => router.push('/')}
              >
                Crear mi primer plan
              </button>
            </div>
          ) : (
            <div className={styles.plansGrid}>
              {plans.map((plan) => (
                <div key={plan.id} className={styles.planCard}>
                  <div className={styles.planHeader}>
                    <h3>{plan.metadata.title}</h3>
                    <span className={styles.planType}>
                      {plan.type === 'nutrition' ? '🍎 Nutrición' : '💪 Entrenamiento'}
                    </span>
                  </div>
                  
                  {plan.metadata.description && (
                    <p className={styles.planDescription}>{plan.metadata.description}</p>
                  )}
                  
                  <div className={styles.planTags}>
                    {plan.metadata.tags?.map((tag) => (
                      <span key={tag} className={styles.tag}>{tag}</span>
                    ))}
                  </div>
                  
                  <div className={styles.planActions}>
                    <button 
                      className={styles.viewButton}
                      onClick={() => router.push(`/plan/${plan.id}`)}
                    >
                      Ver Plan
                    </button>
                    <button 
                      className={styles.downloadButton}
                      onClick={() => downloadPlan(plan)}
                    >
                      Descargar
                    </button>
                    <button 
                      className={styles.deleteButton}
                      onClick={() => deletePlan(plan.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
} 