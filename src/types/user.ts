export interface UserPlan {
  id: string;
  userId: string;
  type: 'nutrition' | 'training';
  createdAt: Date;
  plan: any; // Aquí almacenaremos el plan completo
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
  plans: UserPlan[];
} 