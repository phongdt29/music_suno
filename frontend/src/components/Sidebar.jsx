import { NavLink } from 'react-router-dom';

const HomeIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M12 3l9 8h-3v9h-4v-6h-4v6H6v-9H3z" /></svg>
);
const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4-4" /></svg>
);
const LibraryIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M4 4h2v16H4zM8 4h2v16H8zM13 4l5 1-3 15-5-1z" /></svg>
);
const CreateIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
);

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo">
        <span className="logo-dot" />
        SunoMusic
      </div>

      <nav className="nav">
        <NavLink to="/" end className="nav-item">
          <HomeIcon /> <span>Trang chủ</span>
        </NavLink>
        <NavLink to="/search" className="nav-item">
          <SearchIcon /> <span>Tìm kiếm</span>
        </NavLink>
        <NavLink to="/create" className="nav-item">
          <CreateIcon /> <span>Tạo nhạc</span>
        </NavLink>
      </nav>

      <div className="library">
        <div className="library-head">
          <LibraryIcon /> <span>Thư viện</span>
        </div>
        <div className="library-card">
          <h4>Tạo playlist đầu tiên</h4>
          <p>Rất dễ, chúng tôi sẽ giúp bạn</p>
          <button className="pill-btn">Tạo playlist</button>
        </div>
        <div className="library-card">
          <h4>Cùng nghe nhạc AI từ Suno</h4>
          <p>Khám phá hàng nghìn bản nhạc mới</p>
          <button className="pill-btn">Khám phá</button>
        </div>
      </div>

      <div className="sidebar-foot">© 2026 SunoMusic · Dữ liệu từ Suno</div>
    </aside>
  );
}
