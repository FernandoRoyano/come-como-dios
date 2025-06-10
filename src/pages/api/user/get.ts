import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '@/lib/mongodb';

const dbName = process.env.MONGODB_DB || 'nutriapp';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { email } = req.query;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email requerido' });
  }

  try {
    // Usar el pool de conexión de mongodb.ts para evitar errores en Vercel
    const client = await clientPromise;
    const db = client.db(dbName);
    const users = db.collection('users');
    const user = await users.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    // No exponer _id ni datos sensibles
    const { _id, ...userData } = user;
    res.status(200).json(userData);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el usuario', details: (error as Error).message });
  }
}
