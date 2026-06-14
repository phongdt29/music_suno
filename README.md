# 🎵 SunoMusic

Web nghe nhạc AI, **lấy dữ liệu bài hát public từ Suno**, giao diện **Spotify-style** (dark theme).

## Công nghệ
- **Backend:** Node.js + Express — proxy & cache dữ liệu Suno (tránh CORS, giảm số lần gọi).
- **Frontend:** React + Vite — UI Spotify-style, trình phát nhạc đầy đủ.

## Cấu trúc
```
music_suno/
├── backend/                 API server (cổng 4000)
│   └── src/
│       ├── index.js         khởi tạo Express
│       ├── routes/songs.js  /api/songs/trending | /search | /:id
│       └── services/suno.js gọi Suno API + chuẩn hoá + cache 5 phút
├── frontend/                React app (cổng 5173)
│   └── src/
│       ├── context/PlayerContext.jsx  state trình phát toàn cục (Audio)
│       ├── components/  Sidebar · TopBar · SongCard · Player
│       ├── pages/       Home · Search
│       └── styles/index.css  giao diện Spotify-style
└── scripts/dev.js           chạy cả 2 chỉ với `npm run dev`
```

## Cài đặt & chạy
Yêu cầu: Node.js ≥ 18 (đã test trên v24).

```bash
# 1. Cài dependencies cho cả backend + frontend
npm run install:all

# 2. Chạy cả hai cùng lúc
npm run dev
```
Rồi mở **http://localhost:5173**

Hoặc chạy riêng trong 2 cửa sổ terminal:
```bash
npm run backend    # http://localhost:4000
npm run frontend   # http://localhost:5173
```

### Build & chạy production
```bash
npm run build      # build frontend -> frontend/dist
npm start          # backend phục vụ cả UI + API tại http://localhost:4000
```
📖 Xem chi tiết cấu hình, PM2, Apache/Nginx, cắm API key thật: **[DEPLOYMENT.md](DEPLOYMENT.md)**

## API backend
| Method | Endpoint | Mô tả |
|--------|----------|-------|
| GET | `/api/health` | kiểm tra server |
| GET | `/api/songs/trending?page=0` | nhạc thịnh hành trên Suno |
| GET | `/api/songs/search?q=...` | tìm kiếm bài hát |
| GET | `/api/songs/:id` | chi tiết 1 bài |

## Tính năng
- ✅ Danh sách nhạc thịnh hành thật từ Suno (ảnh bìa, lượt nghe, nghệ sĩ)
- ✅ Trình phát: play/pause, next/prev, tua, âm lượng, lặp lại, phát ngẫu nhiên
- ✅ Hàng đợi phát (queue) — bấm 1 bài là phát cả danh sách
- ✅ Tìm kiếm
- ✅ Giao diện responsive

## Ghi chú
- Dữ liệu lấy từ endpoint công khai của Suno; cấu trúc có thể thay đổi theo thời gian.
- Tìm kiếm: nếu endpoint search của Suno đổi, hệ thống tự fallback lọc trong danh sách trending.
