import TrainingViewer from "../components/TrainingViewer";

const planPrueba = {
  rutina: {
    Lunes: {
      nombre: "Día de prueba",
      ejercicios: [
        {
          id: "1",
          nombre: "Peso muerto sumo",
          series: 4,
          repeticiones: "8-10",
          descanso: "90s"
        },
        {
          id: "2",
          nombre: "Fondos de triceps en paralelas",
          series: 3,
          repeticiones: "12-15",
          descanso: "60s"
        }
      ],
      duracion: 45,
      intensidad: "Media",
      calorias: 300
    }
  },
  progresion: { semanas: [] },
  consideraciones: { calentamiento: [], enfriamiento: [], descanso: "", notas: "" }
};

export default function DemoVideoEjercicios() {
  return (
    <div style={{maxWidth:900,margin:"2rem auto"}}>
      <h2>Demo: Ejercicios con video embebido</h2>
      {/* IFRAME DE PRUEBA FIJO */}
      <div style={{position:'relative',paddingBottom:'56.25%',height:0,overflow:'hidden',borderRadius:12,boxShadow:'0 2px 12px #0001',marginBottom:24}}>
        <iframe
          src="https://www.youtube.com/embed/dQw4w9WgXcQ"
          title="Video de prueba"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          style={{position:'absolute',top:0,left:0,width:'100%',height:'100%'}}
        />
      </div>
      <TrainingViewer plan={planPrueba} />
    </div>
  );
}
