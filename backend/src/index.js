import express from 'express';
import cors from 'cors';
import songsRouter from './routes/songs.js';
import generateRouter from './routes/generate.js';

// Nạp biến môi trường từ backend/.env nếu có (Node >= 20 có sẵn loadEnvFile).
try {
  process.loadEnvFile();
} catch {
  // Không có file .env -> dùng giá trị mặc định (provider mock).
}

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true, service: 'music-suno-backend' }));

app.use('/api/songs', songsRouter);
app.use('/api/generate', generateRouter);

app.use((req, res) => res.status(404).json({ error: 'Route không tồn tại' }));

app.listen(PORT, () => {
  console.log(`🎵 Backend chạy tại http://localhost:${PORT}`);
});
