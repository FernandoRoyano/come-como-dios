import Head from 'next/head';
import styles from './index.module.css';

export default function PlanProfesional() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Plan Profesional | Come y Entrena Como Dios</title>
        <meta name="description" content="Descubre el plan profesional: rutinas avanzadas, soporte prioritario y más." />
      </Head>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>Plan Profesional</h1>
          <p className={styles.subtitle}>Lleva tu salud y entrenamiento al siguiente nivel</p>
        </div>
      </header>
      <main className={styles.main + ' ' + styles.mainWide}>
        <section className={styles.marketingBlock + ' ' + styles.marketingBlockWide}>
          <h2 className={styles.marketingTitle}>¿Qué incluye el Plan Profesional?</h2>
          <ul style={{fontSize:'1.15rem',lineHeight:1.7,margin:'2rem 0'}}>
            <li>✅ Rutinas avanzadas y personalizadas cada semana</li>
            <li>✅ Acceso a ejercicios exclusivos y progresiones</li>
            <li>✅ Soporte prioritario por email y WhatsApp</li>
            <li>✅ Seguimiento de progreso y feedback profesional</li>
            <li>✅ Acceso anticipado a nuevas funciones</li>
          </ul>
          <div className={styles.marketingCta}>
            <div style={{fontWeight:700, fontSize:'1.2rem', marginBottom:'1rem'}}>¡Muy pronto disponible!</div>
            <div>Estamos ultimando detalles para ofrecerte la mejor experiencia profesional.<br/>Déjanos tu email y te avisamos en cuanto esté disponible:</div>
            <form style={{marginTop:'1.5rem',display:'flex',gap:'1rem',justifyContent:'center',flexWrap:'wrap'}} onSubmit={e => {e.preventDefault(); alert('¡Gracias! Te avisaremos en cuanto el plan profesional esté disponible.')}}>
              <input type="email" required placeholder="Tu email" style={{padding:'0.7rem 1.2rem',borderRadius:8,border:'1.5px solid #dbeafe',fontSize:'1.1rem',minWidth:220}} />
              <button type="submit" className={styles.landingButton}>Avísame</button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
