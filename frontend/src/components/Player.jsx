import { usePlayer } from '../context/PlayerContext.jsx';
import { formatTime } from '../utils/format.js';

const Icon = {
  Prev: () => <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M6 6h2v12H6zM9 12l9-6v12z" /></svg>,
  Next: () => <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M16 6h2v12h-2zM15 12L6 6v12z" /></svg>,
  Play: () => <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>,
  Pause: () => <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>,
  Shuffle: () => <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M17 3l4 4-4 4V8h-2.5l-2 2-1.5-1.5L13 6h4V3zM3 6h4l3.5 3.5L9 11 6 8H3zm14 7v-3l4 4-4 4v-3h-4l-3-3 1.5-1.5L14.5 13zM3 16h4l2-2 1.5 1.5L8 18H3z" /></svg>,
  Repeat: () => <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2z" /></svg>,
  Volume: () => <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M4 9v6h4l5 5V4L8 9zM16 8a5 5 0 010 8" fill="none" stroke="currentColor" strokeWidth="2" /></svg>,
  Lyrics: () => <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 10h10M4 14h16M4 18h8" /></svg>,
};

export default function Player() {
  const p = usePlayer();
  const { current, isPlaying, progress, duration, volume } = p;

  return (
    <footer className="player">
      {/* Bài đang phát */}
      <div className="player-left">
        {current ? (
          <>
            <div className="player-cover">
              {current.imageUrl ? <img src={current.imageUrl} alt="" /> : <div className="cover-fallback sm">♪</div>}
            </div>
            <div className="player-info">
              <div className="player-title" title={current.title}>{current.title}</div>
              <div className="player-artist">{current.artist?.name}</div>
            </div>
          </>
        ) : (
          <div className="player-empty">Chọn một bài hát để bắt đầu</div>
        )}
      </div>

      {/* Điều khiển + thanh tiến trình */}
      <div className="player-center">
        <div className="controls">
          <button className={`ctrl ${p.shuffle ? 'on' : ''}`} onClick={p.toggleShuffle} title="Phát ngẫu nhiên"><Icon.Shuffle /></button>
          <button className="ctrl" onClick={p.prev} title="Bài trước"><Icon.Prev /></button>
          <button className="ctrl play-big" onClick={p.togglePlay} title="Phát/Tạm dừng" disabled={!current}>
            {isPlaying ? <Icon.Pause /> : <Icon.Play />}
          </button>
          <button className="ctrl" onClick={p.next} title="Bài sau"><Icon.Next /></button>
          <button className={`ctrl ${p.repeat ? 'on' : ''}`} onClick={p.toggleRepeat} title="Lặp lại"><Icon.Repeat /></button>
        </div>
        <div className="progress-row">
          <span className="time">{formatTime(progress)}</span>
          <input
            className="seek"
            type="range"
            min={0}
            max={duration || 0}
            step="0.1"
            value={progress}
            onChange={(e) => p.seek(Number(e.target.value))}
            style={{ '--pct': `${duration ? (progress / duration) * 100 : 0}%` }}
          />
          <span className="time">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Lời bài hát + Âm lượng */}
      <div className="player-right">
        <button
          className={`ctrl ${p.showLyrics ? 'on' : ''}`}
          onClick={p.toggleLyrics}
          title="Lời bài hát"
          disabled={!current}
        >
          <Icon.Lyrics />
        </button>
        <Icon.Volume />
        <input
          className="seek vol"
          type="range"
          min={0}
          max={1}
          step="0.01"
          value={volume}
          onChange={(e) => p.setVolume(Number(e.target.value))}
          style={{ '--pct': `${volume * 100}%` }}
        />
      </div>
    </footer>
  );
}
