import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import styles from './dashboard.module.css';
import { UserPlan } from '../types/user';
import UserProfile from '../components/UserProfile';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [plans, setPlans] = useState<UserPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchUserPlans();
      fetch(`/api/user/get?email=${session.user.email}`)
        .then(res => res.json())
        .then(data => setUserData(data));
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
    if (!window.confirm('¿Seguro que quieres eliminar este plan? Esta acción no se puede deshacer.')) return;
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
        <h1>¡Hola, {userData?.name || session?.user?.name}!</h1>
        <p>Bienvenido a tu panel personal.</p>
        <button
          className={styles.logoutButton}
          onClick={() => signOut()}
        >
          Cerrar Sesión
        </button>
      </header>
<section className={styles.userSummary}>
  <div className={styles.userCard}>
    <h2>Resumen de Usuario</h2>
    <p><strong>Nombre:</strong> {userData?.name || session?.user?.name}</p>
    <p><strong>Email:</strong> {userData?.email || session?.user?.email}</p>
    {userData?.fechaNacimiento && (
      <p><strong>Fecha de nacimiento:</strong> {new Date(userData.fechaNacimiento).toLocaleDateString()}</p>
    )}
    {userData?.estatura && (
      <p><strong>Estatura:</strong> {userData.estatura} cm</p>
    )}
    {userData?.peso && (
      <p><strong>Peso actual:</strong> {userData.peso} kg</p>
    )}
    {/* Puedes añadir aquí más campos personalizados */}
    <div style={{marginTop:24}}>
      <UserProfile />
    </div>
  </div>
</section>

      <main className={styles.main}>
        <section className={styles.plansSection}>
          <h2>Mis Planes Guardados</h2>
          
          {plans.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Tu resumen está siendo creado. Vuelve más tarde para ver tus planes.</p>
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
                  <div className={styles.planUser}>
                    <strong>Usuario:</strong> {plan.userName || userData?.name || session?.user?.name}
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
                      className="btn btn-primary"
                      onClick={() => router.push(`/plan/${plan.id}`)}
                    >
                      Ver Plan
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => downloadPlan(plan)}
                    >
                      Descargar
                    </button>
                    <button 
                      className="btn btn-danger"
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