import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test route
app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

// Get all questions
app.get('/questions', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM questions ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Submit an answer
app.post('/answers', async (req, res) => {
  const { question_id, answer_text, latitude, longitude } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO answers (question_id, answer_text, latitude, longitude) VALUES ($1, $2, $3, $4) RETURNING * ',
      [question_id, answer_text, latitude, longitude]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get answers by proximity (simple example, can be enhanced with geospatial queries)
app.get('/answers/proximity', async (req, res) => {
  const { latitude, longitude, radius_km } = req.query;

  if (!latitude || !longitude || !radius_km) {
    return res.status(400).json({ error: 'Latitude, longitude, and radius_km are required' });
  }

  const lat = parseFloat(latitude as string);
  const lon = parseFloat(longitude as string);
  const radius = parseFloat(radius_km as string);

  // This is a simplified proximity calculation. For production, consider PostGIS.
  // For now, we'll fetch all answers and filter them in memory (not efficient for large datasets)
  try {
    const result = await pool.query('SELECT * FROM answers');
    const filteredAnswers = result.rows.filter((answer: any) => {
      const distance = calculateDistance(lat, lon, answer.latitude, answer.longitude);
      return distance <= radius;
    });
    res.json(filteredAnswers);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to calculate distance between two points (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg: number) {
  return deg * (Math.PI / 180);
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});