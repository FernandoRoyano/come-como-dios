export interface UserPlan {
  id: string;
  userId: string;
  userName?: string; // Nuevo: nombre del usuario
  type: 'nutrition' | 'training';
  createdAt: Date;
  plan: unknown; // Aquí almacenaremos el plan completo
  metadata: {
    title: string;
    description?: string;
    tags?: string[];
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  image?: string;
  fechaNacimiento?: string; // ISO string
  estatura?: number; // cm
  peso?: number; // kg
  pesoHistorial?: Array<{ fecha: string; peso: number }>; // Para registrar cambios de peso
  plans: UserPlan[];
}