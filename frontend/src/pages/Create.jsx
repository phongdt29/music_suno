import { useState, useRef, useEffect } from 'react';
import { api } from '../api.js';
import SongCard from '../components/SongCard.jsx';

// Trạng thái màn hình: idle (form) | generating (đang chờ) | done (kết quả) | error
export default function Create() {
  const [form, setForm] = useState({
    title: '',
    prompt: '',
    style: '',
    lyrics: '',
    customLyrics: false,
    instrumental: false,
  });
  const [phase, setPhase] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [songs, setSongs] = useState([]);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);

  // Dọn interval khi rời trang.
  useEffect(() => () => clearInterval(pollRef.current), []);

  const update = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [key]: val }));
  };

  const startPolling = (taskId) => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await api.generate.status(taskId);
        setProgress(res.progress || 0);
        if (res.status === 'complete') {
          clearInterval(pollRef.current);
          setSongs(res.songs);
          setPhase('done');
        } else if (res.status === 'failed') {
          clearInterval(pollRef.current);
          setError('Tạo nhạc thất bại. Vui lòng thử lại.');
          setPhase('error');
        }
      } catch (err) {
        clearInterval(pollRef.current);
        setError(err.message);
        setPhase('error');
      }
    }, 2000);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setProgress(0);
    setSongs([]);
    setPhase('generating');
    try {
      const { taskId } = await api.generate.create({
        title: form.title,
        prompt: form.prompt,
        style: form.style,
        lyrics: form.customLyrics ? form.lyrics : '',
        instrumental: form.instrumental,
      });
      startPolling(taskId);
    } catch (err) {
      setError(err.message);
      setPhase('error');
    }
  };

  const reset = () => {
    clearInterval(pollRef.current);
    setPhase('idle');
    setSongs([]);
    setError(null);
    setProgress(0);
  };

  const showLyrics = form.customLyrics && !form.instrumental;

  return (
    <div className="page create-page">
      <div className="create-hero">
        <h1>🎙️ Tạo nhạc bằng AI</h1>
        <p>Mô tả ý tưởng của bạn, Suno sẽ sáng tác thành bài hát.</p>
      </div>

      {(phase === 'idle' || phase === 'error') && (
        <form className="create-form" onSubmit={onSubmit}>
          <label className="field">
            <span>Tiêu đề bài hát</span>
            <input value={form.title} onChange={update('title')} placeholder="VD: Đêm mưa Sài Gòn" />
          </label>

          {!showLyrics && (
            <label className="field">
              <span>Mô tả bài hát {form.instrumental ? '' : '(prompt)'}</span>
              <textarea
                rows={3}
                value={form.prompt}
                onChange={update('prompt')}
                placeholder="VD: một bản lo-fi buồn man mác cho đêm mưa, tiếng piano nhẹ nhàng"
              />
            </label>
          )}

          <label className="field">
            <span>Phong cách / thể loại</span>
            <input
              value={form.style}
              onChange={update('style')}
              placeholder="VD: lo-fi, ballad, acoustic, buồn"
            />
          </label>

          <div className="toggles">
            <label className="switch-row">
              <input type="checkbox" checked={form.instrumental} onChange={update('instrumental')} />
              <span>Nhạc không lời (instrumental)</span>
            </label>
            {!form.instrumental && (
              <label className="switch-row">
                <input type="checkbox" checked={form.customLyrics} onChange={update('customLyrics')} />
                <span>Tự viết lời bài hát</span>
              </label>
            )}
          </div>

          {showLyrics && (
            <label className="field">
              <span>Lời bài hát</span>
              <textarea
                rows={6}
                value={form.lyrics}
                onChange={update('lyrics')}
                placeholder={'[Verse]\nViết lời của bạn ở đây...\n\n[Chorus]\n...'}
              />
            </label>
          )}

          {error && <div className="state error">{error}</div>}

          <button type="submit" className="play-pill big">✨ Tạo nhạc</button>
        </form>
      )}

      {phase === 'generating' && (
        <div className="gen-progress">
          <div className="gen-spinner" />
          <h3>Đang sáng tác bản nhạc của bạn…</h3>
          <p className="muted">AI đang phối khí và hoà âm, vui lòng đợi giây lát.</p>
          <div className="bar"><span style={{ width: `${progress}%` }} /></div>
          <div className="bar-pct">{progress}%</div>
        </div>
      )}

      {phase === 'done' && (
        <div className="gen-result">
          <div className="section-head">
            <h3>🎉 Đã tạo xong {songs.length} bản nhạc</h3>
            <button className="pill-btn ghost" onClick={reset}>Tạo bài khác</button>
          </div>
          <div className="card-grid">
            {songs.map((s) => (
              <SongCard key={s.id} song={s} list={songs} />
            ))}
          </div>
          {songs[0]?.lyrics && (
            <div className="lyrics-box">
              <h4>Lời bài hát</h4>
              <pre>{songs[0].lyrics}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
