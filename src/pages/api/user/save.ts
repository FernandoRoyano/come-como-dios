import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, name, fechaNacimiento, estatura, peso } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required' });
    }

    try {
      await prisma.$connect();

      await prisma.$runCommandRaw({
        createIndexes: 'User',
        indexes: [{ key: { email: 1 }, unique: true }],
      });

      // Actualiza o inserta el usuario, y si hay peso, añade al historial
      const update: any = { name, fechaNacimiento, estatura };
      if (peso) {
        update.peso = peso;
        update.$push = { pesoHistorial: { fecha: new Date().toISOString(), peso } };
      }

      const user = await prisma.$runCommandRaw({
        update: 'User',
        updates: [
          {
            q: { email },
            u: { $set: update },
            upsert: true,
          },
        ],
      });

      return res.status(200).json(user);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
