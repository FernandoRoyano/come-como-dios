// Endpoint de usuario deshabilitado porque Prisma ya no se utiliza
import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(501).json({ error: 'Este endpoint ya no está disponible.' });
}
