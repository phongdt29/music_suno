import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import songsRouter from './routes/songs.js';
import generateRouter from './routes/generate.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

// API không tồn tại -> 404 JSON.
app.use('/api', (req, res) => res.status(404).json({ error: 'Route không tồn tại' }));

// ===== Production: phục vụ bản build tĩnh của frontend (frontend/dist) =====
// Khi đã `npm run build`, backend tự serve luôn UI -> /api cùng origin, không cần Vite proxy.
const DIST = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(DIST)) {
  app.use(express.static(DIST));
  // SPA fallback: mọi route không phải /api trả về index.html cho React Router xử lý.
  app.get('*', (req, res) => res.sendFile(path.join(DIST, 'index.html')));
  console.log('📦 Đang phục vụ frontend build từ frontend/dist');
} else {
  app.get('/', (req, res) =>
    res.send('Backend đang chạy. Chạy "npm run build" để phục vụ giao diện, hoặc dùng frontend dev server (:5173).')
  );
}

app.listen(PORT, () => {
  console.log(`🎵 Backend chạy tại http://localhost:${PORT}`);
});
