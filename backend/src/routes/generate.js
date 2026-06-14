import { Router } from 'express';
import { createGeneration, getGeneration, providerName } from '../services/generator/index.js';

const router = Router();

// POST /api/generate  body: { prompt, style, lyrics, instrumental, title }
router.post('/', async (req, res) => {
  const { prompt = '', style = '', lyrics = '', instrumental = false, title = '' } = req.body || {};

  // Validate: cần ít nhất prompt mô tả, hoặc lyrics (khi tự viết lời), hoặc style (instrumental).
  const hasContent = prompt.trim() || lyrics.trim() || (instrumental && style.trim());
  if (!hasContent) {
    return res.status(400).json({ error: 'Hãy nhập mô tả, lời bài hát hoặc phong cách trước khi tạo.' });
  }

  try {
    const { taskId } = await createGeneration({
      prompt: prompt.trim(),
      style: style.trim(),
      lyrics: lyrics.trim(),
      instrumental: !!instrumental,
      title: title.trim(),
    });
    res.json({ taskId, provider: providerName });
  } catch (err) {
    console.error('generate error:', err.message);
    res.status(502).json({ error: 'Không tạo được yêu cầu sinh nhạc', detail: err.message });
  }
});

// GET /api/generate/:taskId  -> trạng thái + kết quả
router.get('/:taskId', async (req, res) => {
  try {
    const result = await getGeneration(req.params.taskId);
    if (!result) return res.status(404).json({ error: 'Không tìm thấy yêu cầu tạo nhạc' });
    res.json(result);
  } catch (err) {
    console.error('generate status error:', err.message);
    res.status(502).json({ error: 'Không lấy được trạng thái tạo nhạc', detail: err.message });
  }
});

export default router;
