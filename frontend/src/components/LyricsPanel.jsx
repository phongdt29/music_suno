import { useEffect, useState, useRef } from 'react';
import { usePlayer } from '../context/PlayerContext.jsx';
import { api } from '../api.js';

// Panel hiển thị lời bài hát đang phát. Bài từ trending chưa có lyrics trong list
// -> tự gọi api.song(id) để lấy chi tiết (metadata.prompt). Cache theo id để khỏi gọi lại.
export default function LyricsPanel() {
  const { current, showLyrics, closeLyrics } = usePlayer();
  const [lyrics, setLyrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const cache = useRef(new Map());

  useEffect(() => {
    if (!showLyrics || !current) return;

    // Đã có lyrics sẵn trên bài (vd bài AI tạo) -> dùng luôn.
    if (current.lyrics) {
      setLyrics(current.lyrics);
      return;
    }
    // Đã cache trước đó.
    if (cache.current.has(current.id)) {
      setLyrics(cache.current.get(current.id));
      return;
    }

    let alive = true;
    setLoading(true);
    setLyrics(null);
    api
      .song(current.id)
      .then((song) => {
        if (!alive) return;
        const lrc = song?.lyrics || null;
        cache.current.set(current.id, lrc);
        setLyrics(lrc);
      })
      .catch(() => alive && setLyrics(null))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [showLyrics, current]);

  if (!showLyrics) return null;

  return (
    <div className="lyrics-panel">
      <div className="lyrics-panel-head">
        <div className="lp-now">
          {current?.imageUrl && <img src={current.imageUrl} alt="" />}
          <div>
            <div className="lp-title">{current?.title || 'Không có bài hát'}</div>
            <div className="lp-artist">{current?.artist?.name}</div>
          </div>
        </div>
        <button className="lp-close" onClick={closeLyrics} aria-label="Đóng">✕</button>
      </div>

      <div className="lyrics-panel-body">
        {!current && <p className="muted center">Chọn một bài hát để xem lời.</p>}
        {current && loading && <p className="muted center">Đang tải lời bài hát…</p>}
        {current && !loading && lyrics && <pre className="lyrics-text">{lyrics}</pre>}
        {current && !loading && !lyrics && (
          <p className="muted center">Bài hát này chưa có lời.</p>
        )}
      </div>
    </div>
  );
}
