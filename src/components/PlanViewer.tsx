import styles from './PlanViewer.module.css';

// Interfaces bien definidas. Se hace `totalesDia` opcional para evitar errores si no llega del JSON
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

const PlanViewer = ({ plan }: { plan: Plan }) => {
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

  return (
    <>
      <button onClick={handleDownloadPDF} className={styles['pdf-button']}>
        📥 Descargar plan en PDF
      </button>

      <div id="plan-to-download" className={styles['plan-container']}>
        <h2 className={styles['plan-title']}>Plan semanal personalizado</h2>

        {Array.isArray(plan.dias) &&
          plan.dias.map((dia, index) => (
            <div key={index} className={styles['day-card']}>
              <h3>Día {index + 1}: {dia.dia}</h3>

              {dia.comidas.map((comida, i) => (
                <div key={i} className={styles['meal-item']}>
                  <strong>{comida.nombre}:</strong>
                  <p>{comida.descripcion}</p>
                  <small>
                    Cal: {comida.calorias} | Prot: {comida.proteinas}g | Carb: {comida.carbohidratos}g | Grasas: {comida.grasas}g
                  </small>
                </div>
              ))}

              {/* ✅ Prevención del error si totalesDia no está definido */}
              <div className={styles['totales-dia']}>
  <strong>Total día:</strong>{' '}
  {(() => {
    const comidas = dia.comidas;
    const totalCalorias = comidas.reduce((acc, c) => acc + (c.calorias || 0), 0);
    const totalProteinas = comidas.reduce((acc, c) => acc + (c.proteinas || 0), 0);
    const totalCarbohidratos = comidas.reduce((acc, c) => acc + (c.carbohidratos || 0), 0);
    const totalGrasas = comidas.reduce((acc, c) => acc + (c.grasas || 0), 0);

    return `${totalCalorias} kcal | ${totalProteinas}g prot | ${totalCarbohidratos}g carb | ${totalGrasas}g grasas`;
  })()}
</div>

            </div>
          ))}

        {/* 🛒 Lista de la compra agrupada y visualmente ordenada */}
        <div className={styles['lista-compra']}>
          <h3>🛒 Lista de la compra semanal</h3>
          <div className={styles['grid-compra']}>
            {Object.entries(plan.listaCompra).map(([categoria, items]) => {
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

        {/* 👨‍🍳 Recetas enlazadas (verifica que vengan URLs válidas del backend) */}
        {plan.recetas && plan.recetas.length > 0 && (
          <div className={styles['recetas-section']}>
            <h3>👨‍🍳 Recetas recomendadas</h3>
            <div className={styles['recetas-grid']}>
              {plan.recetas.map((receta, index) => (
                <div key={index} className={styles['receta-card']}>
                  <h4>{receta.nombre}</h4>
                  <p>{receta.descripcion}</p>
                  <div className={styles['receta-info']}>
                    <span>🕒 {receta.tiempoPrep} min</span>
                    <span>
                      🔥 Dificultad:{' '}
                      {receta.dificultad.toLowerCase() === 'fácil' && (
                        <span className={styles['dificultad-facil']}>🟢 Fácil</span>
                      )}
                      {receta.dificultad.toLowerCase() === 'media' && (
                        <span className={styles['dificultad-media']}>🟡 Media</span>
                      )}
                      {receta.dificultad.toLowerCase() === 'difícil' && (
                        <span className={styles['dificultad-alta']}>🔴 Difícil</span>
                      )}
                    </span>
                  </div>
                  <a
                    href={receta.enlace}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles['receta-link']}
                  >
                    Ver receta completa →
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PlanViewer;
