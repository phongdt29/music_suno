// Generator: lớp trừu tượng để tạo nhạc, chọn provider theo biến môi trường.
// Mọi provider phải implement cùng interface:
//   createGeneration({ prompt, style, lyrics, instrumental, title }) -> { taskId }
//   getGeneration(taskId) -> { status, progress, songs }
// Nhờ vậy khi đổi từ mock sang API thật, route và frontend không phải sửa.

import * as mock from './mock.js';
import * as sunoapi from './sunoapi.js';

// Task store dùng chung: taskId -> trạng thái. In-memory (mất khi restart).
export const tasks = new Map();

const PROVIDER = (process.env.SUNO_PROVIDER || 'mock').toLowerCase();

function pickProvider() {
  switch (PROVIDER) {
    case 'sunoapi':
      return sunoapi;
    case 'mock':
    default:
      return mock;
  }
}

const provider = pickProvider();

export const providerName = PROVIDER;

export function createGeneration(params) {
  return provider.createGeneration(params, tasks);
}

export function getGeneration(taskId) {
  return provider.getGeneration(taskId, tasks);
}
