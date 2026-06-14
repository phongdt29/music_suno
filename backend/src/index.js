import express from 'express';
import cors from 'cors';
import songsRouter from './routes/songs.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true, service: 'music-suno-backend' }));

app.use('/api/songs', songsRouter);

app.use((req, res) => res.status(404).json({ error: 'Route không tồn tại' }));

app.listen(PORT, () => {
  console.log(`🎵 Backend chạy tại http://localhost:${PORT}`);
});
