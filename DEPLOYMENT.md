# 🚀 Hướng dẫn cấu hình & build production — SunoMusic

Tài liệu này hướng dẫn chi tiết cách **cấu hình môi trường**, **build bản production** và **triển khai** SunoMusic.

---

## 1. Hai chế độ chạy

| | Development | Production |
|---|---|---|
| Frontend | Vite dev server (:5173), hot-reload | Build tĩnh `frontend/dist`, do **backend phục vụ** |
| Backend | Node (:4000) | Node (:4000) phục vụ cả API **và** giao diện |
| Gọi API | Vite proxy `/api` → :4000 | Cùng origin (:4000), không cần proxy |
| Lệnh | `npm run dev` | `npm run build` → `npm start` |

> **Quan trọng:** Ở production **không có Vite proxy**. Vì `frontend/src/api.js` gọi đường dẫn tương đối `/api`, ta để **backend serve luôn bản build** → API và UI cùng `http://<host>:4000`, không lo CORS. Backend tự bật chế độ này khi phát hiện thư mục `frontend/dist` tồn tại (xem `backend/src/index.js`).

---

## 2. Yêu cầu hệ thống

- **Node.js ≥ 18** (khuyến nghị 20+; đã test trên v24). Kiểm tra: `node -v`
- **npm ≥ 9**
- Kết nối Internet (gọi API Suno + tải nhạc từ CDN `cdn1.suno.ai`)

---

## 3. Cấu hình môi trường (`.env`)

Cấu hình nằm ở **`backend/.env`**. Tạo từ mẫu có sẵn:

```bash
# Windows PowerShell
Copy-Item backend/.env.example backend/.env

# Git Bash / Linux / macOS
cp backend/.env.example backend/.env
```

### Các biến

| Biến | Mặc định | Ý nghĩa |
|---|---|---|
| `SUNO_PROVIDER` | `mock` | `mock` = mô phỏng (miễn phí). `sunoapi` = gọi API tạo nhạc thật. |
| `SUNO_API_KEY` | *(rỗng)* | API key nhà cung cấp third-party. **Chỉ cần khi** `SUNO_PROVIDER=sunoapi`. |
| `SUNO_API_BASE` | `https://api.sunoapi.org` | Base URL nhà cung cấp tạo nhạc. |
| `SUNO_MODEL` | `V4` | Phiên bản model Suno (vd `V4`, `V4_5`). |
| `PORT` | `4000` | Cổng backend. |

> File `.env` đã được `.gitignore` → **key thật không bị commit** lên git.

### Bật tạo nhạc THẬT (khi đã có key)
```env
SUNO_PROVIDER=sunoapi
SUNO_API_KEY=sk-xxxxxxxxxxxxxxxx
SUNO_API_BASE=https://api.sunoapi.org
SUNO_MODEL=V4
```
Sau đó **khởi động lại backend**. Giao diện không cần đổi gì.
> Cấu trúc endpoint mỗi nhà cung cấp hơi khác nhau — nếu dùng provider khác sunoapi.org, chỉnh map trong `backend/src/services/generator/sunoapi.js` (đã ghi chú 2 chỗ cần sửa).

---

## 4. Cài đặt

```bash
# Tại thư mục gốc music_suno/
npm run install:all
```
Lệnh này cài dependencies cho cả `backend` và `frontend`.

---

## 5. Build production

```bash
npm run build
```
- Chạy `vite build`, xuất ra **`frontend/dist/`** (HTML/CSS/JS đã tối ưu, minify).
- Cần build lại mỗi khi sửa code frontend.

Kết quả mẫu:
```
dist/index.html              0.41 kB
dist/assets/index-*.css     12.0 kB │ gzip: 3.05 kB
dist/assets/index-*.js     184.0 kB │ gzip: 59.7 kB
```

---

## 6. Chạy production

```bash
npm start
```
- Khởi động backend tại **http://localhost:4000**
- Backend phát hiện `frontend/dist` → phục vụ luôn giao diện.
- Mở trình duyệt: **http://localhost:4000** (1 cổng duy nhất cho cả UI + API).

Log xác nhận:
```
📦 Đang phục vụ frontend build từ frontend/dist
🎵 Backend chạy tại http://localhost:4000
```

### Đổi cổng
```bash
# PowerShell
$env:PORT=8080; npm start
# Git Bash / Linux
PORT=8080 npm start
```
Hoặc đặt `PORT=8080` trong `backend/.env`.

---

## 7. Chạy nền ổn định với PM2 (khuyến nghị cho server)

[PM2](https://pm2.keymetrics.io/) giữ app chạy 24/7, tự khởi động lại khi crash hoặc reboot.

```bash
npm install -g pm2

# Build trước
npm run build

# Chạy backend dưới tên "sunomusic"
pm2 start backend/src/index.js --name sunomusic

pm2 logs sunomusic      # xem log
pm2 restart sunomusic   # khởi động lại (sau khi đổi .env / build mới)
pm2 stop sunomusic      # dừng
pm2 save                # lưu danh sách tiến trình
pm2 startup             # bật tự chạy khi khởi động máy (làm theo hướng dẫn in ra)
```

---

## 8. (Tuỳ chọn) Đặt sau Apache/Nginx — dùng tên miền & port 80/443

Bạn đang dùng XAMPP nên có sẵn Apache. Có thể để Apache nhận request ở cổng 80 rồi **reverse proxy** về backend Node (:4000).

### Apache (XAMPP)
Bật các module trong `httpd.conf`: `proxy_module`, `proxy_http_module`. Thêm VirtualHost:
```apache
<VirtualHost *:80>
    ServerName sunomusic.local
    ProxyPreserveHost On
    ProxyPass        /  http://localhost:4000/
    ProxyPassReverse /  http://localhost:4000/
</VirtualHost>
```
Thêm `127.0.0.1 sunomusic.local` vào `C:\Windows\System32\drivers\etc\hosts`, restart Apache, truy cập `http://sunomusic.local`.

### Nginx (nếu dùng server Linux)
```nginx
server {
    listen 80;
    server_name sunomusic.example.com;
    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```
> HTTPS: dùng Certbot/Let's Encrypt cho Nginx, hoặc cấu hình SSL cho Apache.

---

## 9. Quy trình cập nhật khi đã chạy production

```bash
git pull                 # lấy code mới (nếu dùng git)
npm run install:all      # nếu có thêm dependency
npm run build            # build lại frontend
pm2 restart sunomusic    # hoặc Ctrl+C rồi npm start lại
```

---

## 10. Xử lý sự cố

| Triệu chứng | Nguyên nhân / Cách khắc phục |
|---|---|
| Mở `:4000` ra dòng chữ "Chạy npm run build..." | Chưa build. Chạy `npm run build` rồi `npm start` lại. |
| `EADDRINUSE: address already in use :::4000` | Cổng đang bị chiếm. Đổi `PORT`, hoặc tắt tiến trình cũ:<br>`Get-NetTCPConnection -LocalPort 4000 \| Select OwningProcess` → `Stop-Process -Id <pid>`. |
| Trang trắng, Console F12 báo lỗi `/api` 404 | Đang mở bản build qua server khác không có API. Phải mở qua **:4000** (backend serve), không mở file `dist/index.html` trực tiếp. |
| Tạo nhạc báo "Thiếu SUNO_API_KEY" | Đã đặt `SUNO_PROVIDER=sunoapi` nhưng chưa điền key. Điền `SUNO_API_KEY` hoặc đổi lại `mock`. |
| Nhạc không phát | Mạng chặn `cdn1.suno.ai`, hoặc URL bài hết hạn. Tải lại trang chủ để lấy danh sách mới. |
| Đổi `.env` không có tác dụng | Phải **khởi động lại** backend sau khi sửa `.env`. |

---

## 11. Checklist triển khai

- [ ] `node -v` ≥ 18
- [ ] `npm run install:all` xong, không lỗi
- [ ] Tạo `backend/.env` (chọn `mock` hoặc `sunoapi` + key)
- [ ] `npm run build` → có thư mục `frontend/dist`
- [ ] `npm start` → log hiện "📦 Đang phục vụ frontend build"
- [ ] Mở `http://localhost:4000` → trang chủ hiện nhạc
- [ ] Phát thử 1 bài + bấm nút lời bài hát
- [ ] Vào `/create` tạo thử 1 bài
- [ ] (Server) Bật PM2 + `pm2 startup` để chạy nền lâu dài

---

## 12. Sơ đồ kiến trúc production

```
Người dùng ──HTTP──► (Apache/Nginx :80, tuỳ chọn) ──► Node backend :4000
                                                          ├── /api/*  → Express routes → Suno API
                                                          └── /*      → frontend/dist (React SPA)
```
