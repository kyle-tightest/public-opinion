import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    console.log(req.body);
    const { optionId, latitude, longitude } = req.body;
    try {
      const option = await pool.query(
        'SELECT * FROM options WHERE id = $1',
        [optionId]
      );

      console.log(option.rows[0]);

      const result = await pool.query(
        'INSERT INTO answers (question_id, answer_text, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING * ',
        [option.rows[0].question_id, option.rows[0].option_text, latitude, longitude]
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
