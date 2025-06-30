import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const { question_id, answer_text, latitude, longitude } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO answers (question_id, answer_text, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING * ',
        [question_id, answer_text, latitude, longitude]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error submitting answer:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
