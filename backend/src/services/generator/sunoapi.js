// Provider THẬT: gọi API tạo nhạc của một nhà cung cấp third-party kiểu sunoapi.org.
// CHỈ hoạt động khi có SUNO_API_KEY trong .env và SUNO_PROVIDER=sunoapi.
// Cấu trúc endpoint/field giữa các nhà cung cấp hơi khác nhau -> đọc kỹ docs của bạn
// rồi chỉnh map ở 2 chỗ đánh dấu (1) gửi yêu cầu và (2) đọc kết quả.

const API_BASE = process.env.SUNO_API_BASE || 'https://api.sunoapi.org';
const API_KEY = process.env.SUNO_API_KEY || '';
const MODEL = process.env.SUNO_MODEL || 'V4';

function authHeaders() {
  if (!API_KEY) {
    throw new Error('Thiếu SUNO_API_KEY. Hãy điền vào backend/.env (xem .env.example).');
  }
  return {
    Authorization: `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

// (1) Gửi yêu cầu tạo nhạc. Trả { taskId }.
export async function createGeneration(params, tasks) {
  const { prompt, style, lyrics, instrumental, title } = params || {};
  const customMode = !!(lyrics || style || title);

  // Body theo chuẩn phổ biến của sunoapi.org. Đổi tên field nếu provider của bạn khác.
  const body = {
    customMode,
    instrumental: !!instrumental,
    model: MODEL,
    // customMode=true: cần style + title; nếu không instrumental thì 'prompt' mang LỜI bài hát.
    // customMode=false: chỉ cần 'prompt' là mô tả, AI tự lo phần còn lại.
    prompt: customMode ? (instrumental ? '' : lyrics || prompt || '') : prompt || '',
    style: style || '',
    title: title || '',
    callBackUrl: '', // để rỗng -> ta tự poll bằng getGeneration
  };

  const res = await fetch(`${API_BASE}/api/v1/generate`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Suno API generate ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  // Nhà cung cấp thường trả taskId ở data.data.taskId hoặc data.taskId.
  const taskId = data?.data?.taskId || data?.taskId || data?.id;
  if (!taskId) throw new Error('Không nhận được taskId từ Suno API.');

  tasks.set(taskId, { taskId, provider: 'sunoapi', startedAt: Date.now(), params });
  return { taskId };
}

// (2) Poll trạng thái + đọc kết quả. Map về format chuẩn của app.
export async function getGeneration(taskId, tasks) {
  if (!tasks.has(taskId)) return null;

  const res = await fetch(
    `${API_BASE}/api/v1/generate/record-info?taskId=${encodeURIComponent(taskId)}`,
    { headers: authHeaders() }
  );
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Suno API record-info ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = await res.json();
  const info = data?.data || data;

  // Map trạng thái nhà cung cấp -> trạng thái chuẩn của app.
  const raw = (info?.status || '').toUpperCase();
  let status = 'processing';
  if (raw.includes('SUCCESS') || raw === 'COMPLETE') status = 'complete';
  else if (raw.includes('FAIL') || raw.includes('ERROR')) status = 'failed';
  else if (raw.includes('PENDING')) status = 'pending';

  // Danh sách clip kết quả nằm ở nhiều vị trí tuỳ provider.
  const clips =
    info?.response?.sunoData ||
    info?.response?.data ||
    info?.sunoData ||
    info?.clips ||
    [];

  const songs = (clips || [])
    .map((c, i) => ({
      id: c.id || `${taskId}_${i}`,
      title: c.title || 'AI Song',
      audioUrl: c.audioUrl || c.audio_url || c.streamAudioUrl || null,
      imageUrl: c.imageUrl || c.image_url || c.sourceImageUrl || null,
      videoUrl: c.videoUrl || c.video_url || null,
      duration: c.duration ? Math.round(c.duration) : null,
      tags: c.tags || c.style || '',
      lyrics: c.prompt || c.lyric || null,
      playCount: 0,
      upvoteCount: 0,
      createdAt: c.createTime || new Date().toISOString(),
      artist: { name: 'Bạn (AI tạo)', handle: null, avatar: null },
      isGenerated: true,
    }))
    .filter((s) => s.audioUrl);

  const progress = status === 'complete' ? 100 : songs.length ? 80 : 40;
  return { status, progress, songs };
}
