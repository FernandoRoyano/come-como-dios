import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]';
import { ObjectId } from 'mongodb';

// Forzar redeploy y refresco de caché en Vercel - 10/06/2025

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session || !session.user?.email) {
    return res.status(401).json({ message: 'No autenticado' });
  }
  const email = session.user.email;
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection('user_plans');

  if (req.method === 'GET') {
    // Si se pasa ?id=, devolver solo ese plan
    if (req.query.id) {
      const { id } = req.query;
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'ID de plan requerido' });
      }
      const planRaw = await collection.findOne({ _id: new ObjectId(id), userEmail: email });
      if (!planRaw) {
        return res.status(404).json({ message: 'Plan no encontrado' });
      }
      // Transformar _id a id (string) para el frontend
      const plan = { ...planRaw, id: planRaw._id.toString(), _id: undefined };
      return res.status(200).json({ plan });
    }
    // Listar planes del usuario
    const plansRaw = await collection.find({ userEmail: email }).sort({ createdAt: -1 }).toArray();
    // Transformar _id a id (string) para el frontend
    const plans = plansRaw.map((plan) => ({
      ...plan,
      id: plan._id.toString(),
      _id: undefined, // Eliminar _id para evitar problemas de serialización
    }));
    return res.status(200).json({ plans });
  }

  if (req.method === 'POST') {
    // Guardar un nuevo plan
    const plan = req.body;
    console.log('[API/USER/PLANS][POST] Usuario:', email);
    console.log('[API/USER/PLANS][POST] Body recibido:', JSON.stringify(plan));
    if (!plan || !plan.metadata || !plan.type) {
      console.warn('[API/USER/PLANS][POST] Datos de plan incompletos:', plan);
      return res.status(400).json({ message: 'Datos de plan incompletos' });
    }
    try {
      const doc = {
        ...plan,
        userEmail: email,
        createdAt: new Date(),
      };
      const result = await collection.insertOne(doc);
      console.log('[API/USER/PLANS][POST] Plan guardado con id:', result.insertedId);
      return res.status(201).json({ id: result.insertedId });
    } catch (error) {
      console.error('[API/USER/PLANS][POST] Error al guardar el plan:', error);
      return res.status(500).json({ message: 'Error al guardar el plan', details: error instanceof Error ? error.message : error });
    }
  }

  if (req.method === 'DELETE') {
    // Eliminar un plan por id
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ message: 'ID de plan requerido' });
    }
    const result = await collection.deleteOne({ _id: new ObjectId(id), userEmail: email });
    if (result.deletedCount === 1) {
      return res.status(200).json({ message: 'Plan eliminado' });
    } else {
      return res.status(404).json({ message: 'Plan no encontrado' });
    }
  }

  return res.status(405).json({ message: 'Método no permitido' });
}