import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { latitude, longitude, radius_km } = req.query;

  if (!latitude || !longitude || !radius_km) {
    return res.status(400).json({ error: 'Missing required query parameters: latitude, longitude, and radius_km are required.' });
  }

  const lat = parseFloat(latitude as string);
  const lon = parseFloat(longitude as string);
  const radius = parseFloat(radius_km as string);

  if (isNaN(lat) || isNaN(lon) || isNaN(radius)) {
    return res.status(400).json({ error: 'Invalid query parameters. latitude, longitude, and radius_km must be numbers.' });
  }

  try {
    // Haversine formula to calculate distance in kilometers and find answers within the radius
    const query = `
      SELECT a.id, q.question_text, a.answer_text, a.latitude, a.longitude, a.created_at
      FROM answers a
      JOIN questions q ON a.question_id = q.id
      WHERE (6371 * acos(cos(radians($1)) * cos(radians(a.latitude)) * cos(radians(a.longitude) - radians($2)) + sin(radians($1)) * sin(radians(a.latitude)))) <= $3
    `;
    const result = await pool.query(query, [lat, lon, radius]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching proximity answers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}