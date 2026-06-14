import { Router } from 'express';
import { getTrending, searchSongs, getSong } from '../services/suno.js';

const router = Router();

// GET /api/songs/trending?page=0
router.get('/trending', async (req, res) => {
  try {
    const page = Number(req.query.page) || 0;
    const data = await getTrending(page);
    res.json(data);
  } catch (err) {
    console.error('trending error:', err.message);
    res.status(502).json({ error: 'Không lấy được dữ liệu trending từ Suno', detail: err.message });
  }
});

// GET /api/songs/search?q=...&page=0
router.get('/search', async (req, res) => {
  const term = (req.query.q || '').trim();
  if (!term) return res.json({ term: '', page: 0, songs: [] });
  try {
    const page = Number(req.query.page) || 0;
    const data = await searchSongs(term, page);
    res.json(data);
  } catch (err) {
    console.error('search error:', err.message);
    res.status(502).json({ error: 'Tìm kiếm thất bại', detail: err.message });
  }
});

// GET /api/songs/:id
router.get('/:id', async (req, res) => {
  try {
    const song = await getSong(req.params.id);
    if (!song) return res.status(404).json({ error: 'Không tìm thấy bài hát' });
    res.json(song);
  } catch (err) {
    console.error('song error:', err.message);
    res.status(502).json({ error: 'Không lấy được chi tiết bài hát', detail: err.message });
  }
});

export default router;
