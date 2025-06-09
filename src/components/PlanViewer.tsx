import styles from './PlanViewer.module.css';
import { useState } from 'react';
import { Plan, Comida } from '@/types/plan';

interface Props {
  plan: Plan;
  pdfButtonRef?: React.RefObject<HTMLButtonElement | null>;
}

const PlanViewer = ({ plan, pdfButtonRef }: Props) => {
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
      <button
        onClick={handleDownloadPDF}
        className={styles['pdf-button']}
        ref={pdfButtonRef}
      >
        📥 Descargar plan en PDF
      </button>

      <div id="plan-to-download" className={styles['plan-container']}>
        <h2 className={styles['plan-title']}>Plan semanal personalizado</h2>

        {Object.entries(currentPlan.dias).map(([diaNombre, dia], index) => {
          // Normaliza claves: acepta 'almuerzo' o 'comida' como comida principal
          const desayuno = (dia as any).desayuno;
          const almuerzo = (dia as any).almuerzo || (dia as any).comida;
          const cena = (dia as any).cena;
          const snacks = (dia as any).snacks;
          const comidasMostrar = [
            { tipo: 'Desayuno', data: desayuno },
            { tipo: 'Almuerzo', data: almuerzo },
            { tipo: 'Cena', data: cena }
          ];
          return (
            <div key={index} className={styles['day-card']}>
              <h3>Día {index + 1}: {diaNombre}</h3>
              {comidasMostrar.map(({ tipo, data }) =>
                data && data.nombre ? (
                  <div key={tipo} className={styles['meal-item']}>
                    <strong>{tipo}: {data.nombre}</strong>
                    <p>{data.descripcion}</p>
                    <small>
                      Cal: {data.calorias} | Prot: {data.proteinas}g | Carb: {data.carbohidratos}g | Grasas: {data.grasas}g
                    </small>
                  </div>
                ) : null
              )}
              {Array.isArray(snacks) && snacks.length > 0 && (
                <div className={styles['meal-item']}>
                  <strong>Snacks:</strong>
                  <ul>
                    {snacks.map((snack, i) => (
                      <li key={i}>
                        {snack.nombre} - {snack.descripcion} <br />
                        <small>Cal: {snack.calorias} | Prot: {snack.proteinas}g | Carb: {snack.carbohidratos}g | Grasas: {snack.grasas}g</small>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className={styles['totales-dia']}>
                <strong>Total día:</strong>{' '}
                {(() => {
                  const comidas = [desayuno, almuerzo, cena]
                    .filter((c): c is Comida => c && typeof c === 'object' && 'nombre' in c);
                  const snacksArr = Array.isArray(snacks) ? snacks : [];
                  const totalCalorias = [...comidas, ...snacksArr].reduce((acc, c) => acc + (c.calorias || 0), 0);
                  const totalProteinas = [...comidas, ...snacksArr].reduce((acc, c) => acc + (c.proteinas || 0), 0);
                  const totalCarbohidratos = [...comidas, ...snacksArr].reduce((acc, c) => acc + (c.carbohidratos || 0), 0);
                  const totalGrasas = [...comidas, ...snacksArr].reduce((acc, c) => acc + (c.grasas || 0), 0);
                  return `${totalCalorias} kcal | ${totalProteinas}g prot | ${totalCarbohidratos}g carb | ${totalGrasas}g grasas`;
                })()}
              </div>
            </div>
          );
        })}

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
