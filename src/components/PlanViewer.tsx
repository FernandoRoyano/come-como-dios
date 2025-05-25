import styles from './PlanViewer.module.css';
import { useState } from 'react';
import { Plan, Comida } from '@/types/plan';

interface Props {
  plan: Plan;
}

const PlanViewer = ({ plan }: Props) => {
  const [currentPlan] = useState<Plan>(plan);

  const handleDownloadPDF = async () => {
    const element = document.getElementById('plan-to-download');
    if (!element) return;

    const html2pdf = (await import('html2pdf.js')).default;

    const opt = {
      margin: 0.5,
      filename: 'plan-semanal.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' },
    };

    html2pdf().set(opt).from(element).save();
  };

  if (!currentPlan || !currentPlan.dias || typeof currentPlan.dias !== 'object') {
    return (
      <div className={styles['plan-container']}>
        <h2 className={styles['plan-title']}>No se pudo cargar el plan. El formato recibido es incorrecto.</h2>
      </div>
    );
  }

  return (
    <>
      <button onClick={handleDownloadPDF} className={styles['pdf-button']}>
        📥 Descargar plan en PDF
      </button>

      <div id="plan-to-download" className={styles['plan-container']}>
        <h2 className={styles['plan-title']}>Plan semanal personalizado</h2>

        {Object.entries(currentPlan.dias).map(([diaNombre, dia], index) => (
          <div key={index} className={styles['day-card']}>
            <h3>Día {index + 1}: {diaNombre}</h3>

            {Object.entries(dia).map(([tipoComida, comida]) => {
              if (typeof comida === 'object' && comida !== null && 'nombre' in comida) {
                return (
                  <div key={tipoComida} className={styles['meal-item']}>
                    <strong>{comida.nombre}:</strong>
                    <p>{comida.descripcion}</p>
                    <small>
                      Cal: {comida.calorias} | Prot: {comida.proteinas}g | Carb: {comida.carbohidratos}g | Grasas: {comida.grasas}g
                    </small>
                  </div>
                );
              }
              return null;
            })}

            <div className={styles['totales-dia']}>
              <strong>Total día:</strong>{' '}
              {(() => {
                const comidas = Object.values(dia).filter((comida): comida is Comida => 
                  typeof comida === 'object' && comida !== null && 'nombre' in comida
                );
                const totalCalorias = comidas.reduce((acc, c) => acc + c.calorias, 0);
                const totalProteinas = comidas.reduce((acc, c) => acc + c.proteinas, 0);
                const totalCarbohidratos = comidas.reduce((acc, c) => acc + c.carbohidratos, 0);
                const totalGrasas = comidas.reduce((acc, c) => acc + c.grasas, 0);
                return `${totalCalorias} kcal | ${totalProteinas}g prot | ${totalCarbohidratos}g carb | ${totalGrasas}g grasas`;
              })()}
            </div>
          </div>
        ))}

        <div className={styles['lista-compra']}>
          <h3>🛒 Lista de la compra semanal</h3>
          <div className={styles['grid-compra']}>
            {Object.entries(currentPlan.listaCompra).map(([categoria, items]) => (
              <div key={categoria} className={styles['categoria-compra']}>
                <strong>{categoria.charAt(0).toUpperCase() + categoria.slice(1)}:</strong>
                <ul>
                  {items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default PlanViewer;
