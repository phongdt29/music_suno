import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import SongCard from '../components/SongCard.jsx';

export default function Search() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!q) {
      setSongs([]);
      return;
    }
    let alive = true;
    setLoading(true);
    setError(null);
    api
      .search(q)
      .then((data) => alive && setSongs(data.songs))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [q]);

  if (!q) {
    return (
      <div className="page">
        <h2 className="section-title">Duyệt tất cả</h2>
        <p className="muted">Gõ tên bài hát, nghệ sĩ hoặc thể loại ở ô tìm kiếm phía trên.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <h2 className="section-title">Kết quả cho “{q}”</h2>
      {loading && <div className="state">Đang tìm…</div>}
      {error && <div className="state error">Lỗi: {error}</div>}
      {!loading && !error && songs.length === 0 && (
        <div className="state">Không tìm thấy bài hát nào.</div>
      )}
      <div className="card-grid">
        {songs.map((s) => (
          <SongCard key={s.id} song={s} list={songs} />
        ))}
      </div>
    </div>
  );
}
