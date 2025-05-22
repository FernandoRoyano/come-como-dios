import styles from './PlanViewer.module.css';
import { useState } from 'react';
import { Plan, Comida } from '@/types/plan';

interface Props {
  plan: Plan;
  restricciones: string[];
  objetivo: string;
  numeroComidas: number;
}

const PlanViewer = ({ plan, restricciones, objetivo, numeroComidas }: Props) => {
  const [currentPlan, setCurrentPlan] = useState<Plan>(plan);

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

  const regenerateMeal = async (diaNombre: string, comidaNombre: string) => {
    try {
      const res = await fetch('/api/regenerateMeal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dia: diaNombre,
          comida: comidaNombre,
          restricciones,
          objetivo,
          numeroComidas,
        }),
      });

      const nuevaComida = await res.json();

      const updatedDias = { ...currentPlan.dias };
      const dia = updatedDias[diaNombre];
      
      if (dia) {
        const tipoComida = Object.keys(dia).find(key => {
          const comida = dia[key as keyof typeof dia];
          return typeof comida === 'object' && comida !== null && 'nombre' in comida && comida.nombre === comidaNombre;
        });

        if (tipoComida) {
          updatedDias[diaNombre] = {
            ...dia,
            [tipoComida]: nuevaComida
          };
        }
      }

      setCurrentPlan({ ...currentPlan, dias: updatedDias });
    } catch (err) {
      console.error('Error regenerando la comida:', err);
    }
  };

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
                    <button onClick={() => regenerateMeal(diaNombre, comida.nombre)} className={styles['regen-button']}>
                      🔄 Regenerar
                    </button>
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
