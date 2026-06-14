import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function TopBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [term, setTerm] = useState('');

  // Khi gõ ở thanh tìm kiếm -> chuyển sang trang /search?q=
  useEffect(() => {
    const id = setTimeout(() => {
      if (term.trim()) {
        navigate(`/search?q=${encodeURIComponent(term.trim())}`);
      }
    }, 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  const onSearch = location.pathname === '/search';

  return (
    <header className="topbar">
      <div className="nav-arrows">
        <button onClick={() => navigate(-1)} aria-label="Quay lại">‹</button>
        <button onClick={() => navigate(1)} aria-label="Tiến tới">›</button>
      </div>

      {onSearch ? (
        <div className="search-box">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
          <input
            autoFocus
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Bạn muốn nghe gì?"
          />
        </div>
      ) : (
        <div className="topbar-title" />
      )}

      <div className="topbar-right">
        <button className="pill-btn ghost">Nâng cấp</button>
        <div className="avatar-circle">P</div>
      </div>
    </header>
  );
}
