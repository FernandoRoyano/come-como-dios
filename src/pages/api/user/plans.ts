import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { UserPlan } from '../../../types/user';

// Función para obtener planes del localStorage
const getPlansFromStorage = (userId: string): UserPlan[] => {
  if (typeof window === 'undefined') return [];
  const plans = localStorage.getItem(`plans_${userId}`);
  return plans ? JSON.parse(plans) : [];
};

// Función para guardar planes en localStorage
const savePlansToStorage = (userId: string, plans: UserPlan[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`plans_${userId}`, JSON.stringify(plans));
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });

  if (!session) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  const userId = session.user?.id;

  if (!userId) {
    return res.status(400).json({ message: 'ID de usuario no encontrado' });
  }

  switch (req.method) {
    case 'GET':
      // Si hay un id, devolver solo ese plan
      if (req.query.id) {
        const userPlansList = getPlansFromStorage(userId);
        const plan = userPlansList.find(p => p.id === req.query.id);
        if (!plan) return res.status(404).json({ message: 'Plan no encontrado' });
        return res.status(200).json({ plan });
      }
      // Obtener todos los planes del usuario
      const userPlansList = getPlansFromStorage(userId);
      return res.status(200).json({ plans: userPlansList });

    case 'POST':
      // Guardar un nuevo plan
      const newPlan: UserPlan = {
        id: Math.random().toString(36).substr(2, 9),
        userId,
        userName: session.user?.name || '', // Guardar el nombre del usuario
        type: req.body.type,
        createdAt: new Date(),
        plan: req.body.plan,
        metadata: req.body.metadata
      };

      const currentPlans = getPlansFromStorage(userId);
      const updatedPlans = [...currentPlans, newPlan];
      savePlansToStorage(userId, updatedPlans);
      
      return res.status(201).json({ plan: newPlan });

    case 'DELETE':
      // Eliminar un plan
      const planId = req.query.id as string;
      const existingPlans = getPlansFromStorage(userId);
      const filteredPlans = existingPlans.filter(plan => plan.id !== planId);
      savePlansToStorage(userId, filteredPlans);
      
      return res.status(200).json({ message: 'Plan eliminado' });

    default:
      res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
      return res.status(405).json({ message: `Método ${req.method} no permitido` });
  }
}