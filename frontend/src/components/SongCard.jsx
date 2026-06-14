import { usePlayer } from '../context/PlayerContext.jsx';
import { formatCount } from '../utils/format.js';

const PlayIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
);
const PauseIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
);

// Card kiểu Spotify: ảnh bìa, nút play hiện khi hover, tên + nghệ sĩ.
export default function SongCard({ song, list }) {
  const { current, isPlaying, playSong, togglePlay } = usePlayer();
  const active = current?.id === song.id;

  const onClick = () => {
    if (active) togglePlay();
    else playSong(song, list);
  };

  return (
    <div className={`song-card ${active ? 'active' : ''}`}>
      <div className="cover">
        {song.imageUrl ? (
          <img src={song.imageUrl} alt={song.title} loading="lazy" />
        ) : (
          <div className="cover-fallback">♪</div>
        )}
        <button className="play-fab" onClick={onClick} aria-label="Phát">
          {active && isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
      </div>
      <div className="song-meta">
        <div className="song-title" title={song.title}>{song.title}</div>
        <div className="song-sub">
          {song.artist?.name}
          {song.playCount ? ` · ${formatCount(song.playCount)} lượt nghe` : ''}
        </div>
      </div>
    </div>
  );
}
