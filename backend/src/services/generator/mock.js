// Provider MOCK: mô phỏng luồng tạo nhạc bất đồng bộ của Suno mà không tốn phí.
// - createGeneration: lưu task ở trạng thái "processing" kèm mốc thời gian.
// - getGeneration: theo thời gian đã trôi -> processing (kèm %) rồi complete.
// - Khi complete: lấy 2 clip ngẫu nhiên từ trending Suno THẬT làm audio/ảnh,
//   nhưng gắn tiêu đề người dùng nhập + lyrics mô phỏng -> demo phát được nhạc thật.

import { getTrending } from '../suno.js';

const GEN_MS = 9000; // thời gian "sáng tác" mô phỏng ~9 giây
let counter = 0;

function newId() {
  counter += 1;
  return `mock_${Date.now().toString(36)}_${counter}`;
}

// Sinh lyrics mô phỏng đơn giản từ prompt (chỉ để demo, không phải nhạc thật của lời này).
function fakeLyrics(prompt, style) {
  const theme = (prompt || style || 'giai điệu').trim();
  return [
    `[Verse 1]`,
    `Lời ca viết về ${theme}`,
    `Đêm nay giai điệu ngân nga`,
    ``,
    `[Chorus]`,
    `${theme}, vang mãi trong tim`,
    `Một bản nhạc AI dệt nên từ lời bạn trao`,
  ].join('\n');
}

export async function createGeneration(params, tasks) {
  const taskId = newId();
  tasks.set(taskId, {
    taskId,
    provider: 'mock',
    startedAt: Date.now(),
    params,
    cachedSongs: null, // chốt cố định khi complete để các lần poll trả y hệt
  });
  return { taskId };
}

export async function getGeneration(taskId, tasks) {
  const task = tasks.get(taskId);
  if (!task) return null;

  const elapsed = Date.now() - task.startedAt;

  if (elapsed < GEN_MS) {
    const progress = Math.min(95, Math.round((elapsed / GEN_MS) * 100));
    return { status: 'processing', progress, songs: [] };
  }

  // Đã xong: lần đầu thì dựng kết quả rồi cache lại.
  if (!task.cachedSongs) {
    task.cachedSongs = await buildSongs(task.params);
  }
  return { status: 'complete', progress: 100, songs: task.cachedSongs };
}

// Dựng 2 biến thể bài hát từ trending thật + tham số người dùng.
async function buildSongs(params) {
  const { title, prompt, style, lyrics, instrumental } = params || {};
  let pool = [];
  try {
    const trending = await getTrending(0);
    pool = trending.songs || [];
  } catch {
    pool = [];
  }

  const baseTitle = (title || prompt || 'Bản nhạc AI của tôi').trim();
  const finalLyrics = instrumental ? null : lyrics?.trim() || fakeLyrics(prompt, style);
  const tags = (style || '').trim() || (instrumental ? 'instrumental' : 'ai, suno');

  // Chọn 2 clip ngẫu nhiên khác nhau làm nguồn audio/ảnh thật.
  const picks = pickTwo(pool);

  return picks.map((clip, i) => ({
    id: `${Date.now().toString(36)}_gen${i + 1}`,
    title: i === 0 ? baseTitle : `${baseTitle} (v${i + 1})`,
    audioUrl: clip?.audioUrl || null,
    imageUrl: clip?.imageUrl || null,
    videoUrl: clip?.videoUrl || null,
    duration: clip?.duration || null,
    tags,
    lyrics: finalLyrics,
    instrumental: !!instrumental,
    playCount: 0,
    upvoteCount: 0,
    createdAt: new Date().toISOString(),
    artist: { name: 'Bạn (AI tạo)', handle: null, avatar: null },
    isGenerated: true,
  }));
}

function pickTwo(arr) {
  if (!arr || arr.length === 0) return [null, null];
  if (arr.length === 1) return [arr[0], arr[0]];
  const a = Math.floor(Math.random() * arr.length);
  let b = Math.floor(Math.random() * arr.length);
  if (b === a) b = (b + 1) % arr.length;
  return [arr[a], arr[b]];
}
