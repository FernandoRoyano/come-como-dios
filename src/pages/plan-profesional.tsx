import Head from 'next/head';
import styles from './index.module.css';
import Image from 'next/image';

export default function PlanProfesional() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Plan Profesional | Come y Entrena Como Dios</title>
        <meta name="description" content="Descubre el plan profesional: rutinas avanzadas, soporte prioritario y más." />
      </Head>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <Image src="/vercel.svg" alt="Plan profesional" width={70} height={70} style={{marginBottom: 16}} />
          <h1 className={styles.title} style={{fontSize:'2.7rem',fontWeight:900,letterSpacing:'-0.03em'}}>Plan Profesional</h1>
          <p className={styles.subtitle} style={{fontSize:'1.35rem',color:'#e0e7ef',marginTop:8}}>Lleva tu salud y entrenamiento al siguiente nivel</p>
        </div>
      </header>
      <main className={styles.main + ' ' + styles.mainWide}>
        <section className={styles.marketingBlock + ' ' + styles.marketingBlockWide}>
          <h2 className={styles.marketingTitle} style={{marginBottom:32}}>¿Qué incluye el Plan Profesional?</h2>
          <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:'2.5rem',marginBottom:'2.5rem'}}>
            <div className={styles.feature} style={{minWidth:220}}>
              <span role="img" aria-label="Rutinas" style={{fontSize:'2.2rem'}}>💪</span>
              <h3>Rutinas avanzadas</h3>
              <p>Personalizadas cada semana según tu progreso.</p>
            </div>
            <div className={styles.feature} style={{minWidth:220}}>
              <span role="img" aria-label="Ejercicios exclusivos" style={{fontSize:'2.2rem'}}>🏋️‍♂️</span>
              <h3>Ejercicios exclusivos</h3>
              <p>Acceso a progresiones y ejercicios premium.</p>
            </div>
            <div className={styles.feature} style={{minWidth:220}}>
              <span role="img" aria-label="Soporte" style={{fontSize:'2.2rem'}}>📲</span>
              <h3>Soporte prioritario</h3>
              <p>Resuelve tus dudas por email y WhatsApp.</p>
            </div>
            <div className={styles.feature} style={{minWidth:220}}>
              <span role="img" aria-label="Seguimiento" style={{fontSize:'2.2rem'}}>📈</span>
              <h3>Seguimiento profesional</h3>
              <p>Feedback y control de tu progreso real.</p>
            </div>
            <div className={styles.feature} style={{minWidth:220}}>
              <span role="img" aria-label="Novedades" style={{fontSize:'2.2rem'}}>🚀</span>
              <h3>Acceso anticipado</h3>
              <p>Prueba antes que nadie las nuevas funciones.</p>
            </div>
          </div>
          <div className={styles.marketingCta} style={{marginTop:32}}>
            <div style={{fontWeight:700, fontSize:'1.2rem', marginBottom:'1rem',color:'#145a86'}}>¡Muy pronto disponible!</div>
            <div style={{marginBottom:'1.2rem'}}>Estamos ultimando detalles para ofrecerte la mejor experiencia profesional.<br/>Déjanos tu email y te avisamos en cuanto esté disponible:</div>
            <form style={{marginTop:'1.5rem',display:'flex',gap:'1rem',justifyContent:'center',flexWrap:'wrap'}} onSubmit={e => {e.preventDefault(); alert('¡Gracias! Te avisaremos en cuanto el plan profesional esté disponible.')}}>
              <input type="email" required placeholder="Tu email" style={{padding:'0.7rem 1.2rem',borderRadius:8,border:'1.5px solid #dbeafe',fontSize:'1.1rem',minWidth:220,background:'#fff'}} />
              <button type="submit" className={styles.landingButton}>Avísame</button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
