import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import styles from './dashboard.module.css';
import { UserPlan } from '../types/user';
import UserProfile from '../components/UserProfile';
import dynamic from 'next/dynamic';
import { Plan, PlanEntrenamiento } from '../types/plan';
import { useRef } from 'react';

const PlanViewer = dynamic(() => import('../components/PlanViewer'), { ssr: false });
const TrainingViewer = dynamic(() => import('../components/TrainingViewer'), { ssr: false });

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [plans, setPlans] = useState<UserPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [modalPlan, setModalPlan] = useState<UserPlan | null>(null);
  // Ref para el botón PDF, compatible con los hijos
  const pdfButtonRef = useRef<HTMLButtonElement>(null);
  const [showToast, setShowToast] = useState(false);

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

  const downloadPlanPDF = (plan: UserPlan) => {
    setModalPlan(plan);
    setTimeout(() => {
      // Espera a que el modal y el botón estén montados
      if (pdfButtonRef.current) {
        pdfButtonRef.current.click();
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2500);
        setTimeout(() => setModalPlan(null), 2000);
      }
    }, 600); // Un poco más de tiempo para asegurar el render
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
          <div style={{display:'flex',justifyContent:'flex-end',marginBottom:'1.5rem'}}>
            <button 
              className={styles.createPlanButton}
              onClick={() => router.push('/')}
            >
              + Crear nuevo plan
            </button>
          </div>
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
                    <div style={{display:'flex',alignItems:'center',gap:'0.7rem'}}>
                      <span style={{fontSize:'2rem'}}>{plan.type === 'nutrition' ? '🍎' : '💪'}</span>
                      <h3>{plan.metadata.title}</h3>
                    </div>
                    <span className={styles.planType} style={{fontWeight:600}}>
                      {plan.type === 'nutrition' ? 'Nutrición' : 'Entrenamiento'}
                    </span>
                  </div>
                  <div className={styles.planUser}>
                    <strong>Usuario:</strong> {plan.userName || userData?.name || session?.user?.name}
                  </div>
                  <div style={{color:'#64748b',fontSize:'0.95rem',marginBottom:8}}>
    <span style={{fontWeight:500}}>Guardado:</span> {plan.createdAt ? new Date(plan.createdAt).toLocaleString('es-ES', { dateStyle: 'medium', timeStyle: 'short' }) : 'Sin fecha'}
  </div>
                  {plan.metadata.description && (
                    <p className={styles.planDescription}>{plan.metadata.description}</p>
                  )}
                  {plan.metadata.tags && plan.metadata.tags.length > 0 && (
                    <div className={styles.planTags}>
                      {plan.metadata.tags.map((tag) => (
                        <span key={tag} className={styles.tag}>{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className={styles.planActions}>
                    <button 
                      className="btn btn-primary"
                      onClick={() => router.push(`/plan/${plan.id}`)}
                    >
                      Ver Plan
                    </button>
                    <button 
                      className="btn btn-secondary"
                      onClick={() => downloadPlanPDF(plan)}
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
      {/* Modal oculto para PDF */}
      {modalPlan && (
        <div style={{position:'fixed',left:-9999,top:-9999,opacity:0,pointerEvents:'none'}}>
          {modalPlan.type === 'nutrition' ? (
            <PlanViewer 
              plan={typeof modalPlan.plan === 'string' ? JSON.parse(modalPlan.plan) : modalPlan.plan as Plan}
              pdfButtonRef={pdfButtonRef}
            />
          ) : (
            <TrainingViewer 
              plan={typeof modalPlan.plan === 'string' ? JSON.parse(modalPlan.plan) : modalPlan.plan as PlanEntrenamiento}
              pdfButtonRef={pdfButtonRef}
            />
          )}
        </div>
      )}
      {showToast && (
        <div style={{
          position: 'fixed',
          bottom: 32,
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#22c55e',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: 12,
          fontWeight: 600,
          fontSize: '1.1rem',
          boxShadow: '0 4px 16px rgba(34,197,94,0.15)',
          zIndex: 9999
        }}>
          ¡Descarga en PDF iniciada!
        </div>
      )}
    </div>
  );
}