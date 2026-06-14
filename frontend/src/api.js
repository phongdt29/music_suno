// Lớp gọi API tới backend. Dùng đường dẫn tương đối /api (Vite proxy lo phần cổng).

async function get(path) {
  const res = await fetch(`/api${path}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Lỗi ${res.status}`);
  }
  return res.json();
}

async function post(path, data) {
  const res = await fetch(`/api${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Lỗi ${res.status}`);
  }
  return res.json();
}

export const api = {
  trending: (page = 0) => get(`/songs/trending?page=${page}`),
  search: (q, page = 0) => get(`/songs/search?q=${encodeURIComponent(q)}&page=${page}`),
  song: (id) => get(`/songs/${id}`),
  generate: {
    create: (body) => post(`/generate`, body),
    status: (taskId) => get(`/generate/${taskId}`),
  },
};
