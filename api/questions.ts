import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for cloud-hosted databases like Neon
  },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const query = `
        SELECT
          q.id,
          q.question_text,
          COALESCE(
            (
              SELECT json_agg(
                json_build_object('id', o.id, 'option_text', o.option_text)
              )
              FROM options o
              WHERE o.question_id = q.id
            ),
            '[]'::json
          ) AS options
        FROM
          questions q
        ORDER BY
          q.id;
      `;
      const result = await pool.query(query);
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Error fetching questions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
