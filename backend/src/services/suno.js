// Service: lấy dữ liệu bài hát public từ Suno + cache trong bộ nhớ.
// Suno không có API chính thức công khai, nhưng endpoint trending/discover trả về
// dữ liệu public (title, audio_url .mp3, ảnh bìa, nghệ sĩ...). Ta chuẩn hoá lại
// thành format gọn cho frontend và cache để tránh gọi quá nhiều.

const SUNO_BASE = 'https://studio-api.prod.suno.com/api';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

// Cache đơn giản theo key, TTL mặc định 5 phút.
const cache = new Map();
const TTL_MS = 5 * 60 * 1000;

function getCache(key) {
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.data;
  return null;
}

function setCache(key, data) {
  cache.set(key, { at: Date.now(), data });
}

// Chuẩn hoá 1 "clip" của Suno về bài hát gọn cho UI.
function normalizeClip(clip) {
  if (!clip) return null;
  const meta = clip.metadata || {};
  return {
    id: clip.id,
    title: clip.title || 'Untitled',
    audioUrl: clip.audio_url || null,
    imageUrl: clip.image_large_url || clip.image_url || null,
    videoUrl: clip.video_url || null,
    duration: meta.duration ? Math.round(meta.duration) : null,
    tags: meta.tags || clip.tags || '',
    playCount: clip.play_count || 0,
    upvoteCount: clip.upvote_count || 0,
    createdAt: clip.created_at || null,
    artist: {
      name: clip.display_name || clip.handle || 'Unknown Artist',
      handle: clip.handle || null,
      avatar: clip.avatar_image_url || null,
    },
  };
}

async function sunoFetch(path) {
  const res = await fetch(`${SUNO_BASE}${path}`, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
  });
  if (!res.ok) {
    const err = new Error(`Suno API ${res.status} cho ${path}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

// Lấy danh sách bài hát thịnh hành (Explore playlist của Suno).
export async function getTrending(page = 0) {
  const key = `trending:${page}`;
  const cached = getCache(key);
  if (cached) return cached;

  const data = await sunoFetch(`/trending/?page=${page}`);
  const clips = (data.playlist_clips || [])
    .map((c) => normalizeClip(c.clip))
    .filter((s) => s && s.audioUrl);

  const result = {
    name: data.name || 'Trending',
    total: data.num_total_results || clips.length,
    page,
    songs: clips,
  };
  setCache(key, result);
  return result;
}

// Tìm kiếm bài hát theo từ khoá.
export async function searchSongs(term, page = 0) {
  const key = `search:${term}:${page}`;
  const cached = getCache(key);
  if (cached) return cached;

  const body = {
    search_queries: [
      { name: 'public_song', search_type: 'public_song', term, from_index: page * 20 },
    ],
  };
  const res = await fetch(`${SUNO_BASE}/search/`, {
    method: 'POST',
    headers: { 'User-Agent': UA, 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  });

  let songs = [];
  if (res.ok) {
    const data = await res.json();
    const result = data.result?.public_song || data.public_song || [];
    songs = result.map(normalizeClip).filter((s) => s && s.audioUrl);
  }

  // Fallback: nếu search endpoint đổi/không trả kết quả, lọc trong trending theo từ khoá.
  if (songs.length === 0) {
    const trending = await getTrending(0);
    const t = term.toLowerCase();
    songs = trending.songs.filter(
      (s) =>
        s.title.toLowerCase().includes(t) ||
        s.artist.name.toLowerCase().includes(t) ||
        s.tags.toLowerCase().includes(t)
    );
  }

  const result = { term, page, songs };
  setCache(key, result);
  return result;
}

// Lấy chi tiết 1 bài theo id.
export async function getSong(id) {
  const key = `song:${id}`;
  const cached = getCache(key);
  if (cached) return cached;

  const data = await sunoFetch(`/clip/${id}`);
  const song = normalizeClip(data);
  setCache(key, song);
  return song;
}
