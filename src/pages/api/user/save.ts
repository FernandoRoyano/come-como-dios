import { MongoClient } from 'mongodb';
import type { NextApiRequest, NextApiResponse } from 'next';

const uri = process.env.MONGODB_URI!;
const dbName = process.env.MONGODB_DB || 'nutriapp';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { email, name, fechaNacimiento, estatura, peso } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email requerido' });
  }

  let client: MongoClient | null = null;
  try {
    client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const users = db.collection('users');

    const update = {
      ...(name !== undefined ? { name } : {}),
      ...(fechaNacimiento !== undefined ? { fechaNacimiento } : {}),
      ...(estatura !== undefined ? { estatura } : {}),
      ...(peso !== undefined ? { peso } : {}),
    };

    const result = await users.updateOne(
      { email },
      { $set: update },
      { upsert: true }
    );

    res.status(200).json({ success: true, modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar el usuario', details: (error as Error).message });
  } finally {
    if (client) await client.close();
  }
}
