import { useEffect, useState } from 'react';
import { api } from '../api.js';
import SongCard from '../components/SongCard.jsx';
import { usePlayer } from '../context/PlayerContext.jsx';
import { formatCount } from '../utils/format.js';

export default function Home() {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { playSong } = usePlayer();

  useEffect(() => {
    let alive = true;
    api
      .trending()
      .then((data) => {
        if (alive) setSongs(data.songs);
      })
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 11 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';

  if (loading) return <div className="state">Đang tải nhạc thịnh hành…</div>;
  if (error) return <div className="state error">Lỗi: {error}</div>;

  const hero = songs[0];
  const featured = songs.slice(0, 6);

  return (
    <div className="page">
      <h1 className="greeting">{greeting}</h1>

      {/* Lưới gợi ý nhanh */}
      <div className="quick-grid">
        {featured.map((s) => (
          <button key={s.id} className="quick-card" onClick={() => playSong(s, songs)}>
            <img src={s.imageUrl} alt="" />
            <span>{s.title}</span>
          </button>
        ))}
      </div>

      {/* Banner bài nổi bật nhất */}
      {hero && (
        <section
          className="hero"
          style={{ backgroundImage: hero.imageUrl ? `url(${hero.imageUrl})` : 'none' }}
        >
          <div className="hero-overlay">
            <span className="hero-tag">Nổi bật hôm nay</span>
            <h2>{hero.title}</h2>
            <p>{hero.artist?.name} · {formatCount(hero.playCount)} lượt nghe</p>
            <button className="play-pill" onClick={() => playSong(hero, songs)}>► Phát ngay</button>
          </div>
        </section>
      )}

      <section className="section">
        <div className="section-head">
          <h3>Thịnh hành trên Suno</h3>
          <span className="see-all">Hiện tất cả</span>
        </div>
        <div className="card-grid">
          {songs.map((s) => (
            <SongCard key={s.id} song={s} list={songs} />
          ))}
        </div>
      </section>
    </div>
  );
}
