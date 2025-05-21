import styles from './PlanViewer.module.css';
import { useState } from 'react';

interface Comida {
  nombre: string;
  descripcion: string;
  calorias: number;
  proteinas: number;
  carbohidratos: number;
  grasas: number;
}

interface Dia {
  dia: string;
  comidas: Comida[];
  totalesDia?: {
    calorias: number;
    proteinas: number;
    carbohidratos: number;
    grasas: number;
  };
}

interface ListaCompra {
  verduras: string[];
  proteinas: string[];
  carbohidratos: string[];
  grasas: string[];
  otros?: string[];
}

interface Receta {
  nombre: string;
  descripcion: string;
  enlace: string;
  tiempoPrep: number;
  dificultad: string;
}

interface Plan {
  dias: Dia[];
  listaCompra: ListaCompra;
  recetas?: Receta[];
}

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

      const updatedDias = currentPlan.dias.map((dia) => {
        if (dia.dia === diaNombre) {
          const nuevasComidas = dia.comidas.map((comida) =>
            comida.nombre === comidaNombre ? nuevaComida : comida
          );

          const totales = nuevasComidas.reduce(
            (acc, comida) => ({
              calorias: acc.calorias + (comida.calorias || 0),
              proteinas: acc.proteinas + (comida.proteinas || 0),
              carbohidratos: acc.carbohidratos + (comida.carbohidratos || 0),
              grasas: acc.grasas + (comida.grasas || 0),
            }),
            { calorias: 0, proteinas: 0, carbohidratos: 0, grasas: 0 }
          );

          return { ...dia, comidas: nuevasComidas, totalesDia: totales };
        }
        return dia;
      });

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

        {Array.isArray(currentPlan.dias) &&
          currentPlan.dias.map((dia, index) => (
            <div key={index} className={styles['day-card']}>
              <h3>Día {index + 1}: {dia.dia}</h3>

              {Array.isArray(dia.comidas) && dia.comidas.map((comida, i) => (
                <div key={i} className={styles['meal-item']}>
                  <strong>{comida.nombre}:</strong>
                  <p>{comida.descripcion}</p>
                  <small>
                    Cal: {comida.calorias} | Prot: {comida.proteinas}g | Carb: {comida.carbohidratos}g | Grasas: {comida.grasas}g
                  </small>
                  <button onClick={() => regenerateMeal(dia.dia, comida.nombre)} className={styles['regen-button']}>
                    🔄 Regenerar
                  </button>
                </div>
              ))}

              <div className={styles['totales-dia']}>
                <strong>Total día:</strong>{' '}
                {(() => {
                  const comidas = dia.comidas;
                  const totalCalorias = comidas?.reduce((acc, c) => acc + (c.calorias || 0), 0);
                  const totalProteinas = comidas?.reduce((acc, c) => acc + (c.proteinas || 0), 0);
                  const totalCarbohidratos = comidas?.reduce((acc, c) => acc + (c.carbohidratos || 0), 0);
                  const totalGrasas = comidas?.reduce((acc, c) => acc + (c.grasas || 0), 0);
                  return `${totalCalorias} kcal | ${totalProteinas}g prot | ${totalCarbohidratos}g carb | ${totalGrasas}g grasas`;
                })()}
              </div>
            </div>
          ))}

        <div className={styles['lista-compra']}>
          <h3>🛒 Lista de la compra semanal</h3>
          <div className={styles['grid-compra']}>
            {Object.entries(currentPlan.listaCompra).map(([categoria, items]) => {
              const typedItems = items as string[];
              return (
                <div key={categoria} className={styles['categoria-compra']}>
                  <strong>{categoria.charAt(0).toUpperCase() + categoria.slice(1)}:</strong>
                  <ul>
                    {typedItems.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default PlanViewer;
