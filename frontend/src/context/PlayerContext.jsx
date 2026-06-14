import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

const PlayerContext = createContext(null);

export function PlayerProvider({ children }) {
  const audioRef = useRef(typeof Audio !== 'undefined' ? new Audio() : null);

  const [queue, setQueue] = useState([]); // danh sách bài đang phát
  const [index, setIndex] = useState(-1); // vị trí bài hiện tại trong queue
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // giây hiện tại
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [repeat, setRepeat] = useState(false);
  const [shuffle, setShuffle] = useState(false);

  const current = index >= 0 ? queue[index] : null;

  // Phát 1 bài (kèm danh sách để làm hàng đợi). startIndex = vị trí bài đó trong list.
  const playSong = useCallback((song, list = null) => {
    const newQueue = list && list.length ? list : [song];
    const startIndex = newQueue.findIndex((s) => s.id === song.id);
    setQueue(newQueue);
    setIndex(startIndex < 0 ? 0 : startIndex);
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !current) return;
    if (audio.paused) audio.play();
    else audio.pause();
  }, [current]);

  const next = useCallback(() => {
    setIndex((i) => {
      if (queue.length === 0) return i;
      if (shuffle) return Math.floor(Math.random() * queue.length);
      return i + 1 < queue.length ? i + 1 : 0;
    });
  }, [queue.length, shuffle]);

  const prev = useCallback(() => {
    const audio = audioRef.current;
    // Nếu đã phát >3s thì tua về đầu bài thay vì lùi bài.
    if (audio && audio.currentTime > 3) {
      audio.currentTime = 0;
      return;
    }
    setIndex((i) => (i - 1 >= 0 ? i - 1 : queue.length - 1));
  }, [queue.length]);

  const seek = useCallback((time) => {
    const audio = audioRef.current;
    if (audio) audio.currentTime = time;
    setProgress(time);
  }, []);

  const setVolume = useCallback((v) => {
    const audio = audioRef.current;
    if (audio) audio.volume = v;
    setVolumeState(v);
  }, []);

  // Khi đổi bài: nạp src mới và phát.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !current || !current.audioUrl) return;
    audio.src = current.audioUrl;
    audio.volume = volume;
    audio.play().catch(() => setIsPlaying(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.id]);

  // Gắn sự kiện audio một lần.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setProgress(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      if (repeat) {
        audio.currentTime = 0;
        audio.play();
      } else {
        next();
      }
    };

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, [repeat, next]);

  const value = {
    queue,
    current,
    isPlaying,
    progress,
    duration,
    volume,
    repeat,
    shuffle,
    playSong,
    togglePlay,
    next,
    prev,
    seek,
    setVolume,
    toggleRepeat: () => setRepeat((r) => !r),
    toggleShuffle: () => setShuffle((s) => !s),
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error('usePlayer phải dùng trong PlayerProvider');
  return ctx;
}
