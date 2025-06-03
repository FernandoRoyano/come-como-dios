import type { NextApiRequest, NextApiResponse } from 'next';
import { searchFoodByName } from '../../lib/foodDataCentral';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { name } = req.query;
  if (!name || typeof name !== 'string') {
    return res.status(400).json({ error: 'Falta el parámetro name' });
  }
  const results = searchFoodByName(name);
  res.status(200).json(results.slice(0, 10)); // Devuelve los 10 primeros resultados
}
