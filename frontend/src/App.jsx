import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar.jsx';
import TopBar from './components/TopBar.jsx';
import Player from './components/Player.jsx';
import Home from './pages/Home.jsx';
import Search from './pages/Search.jsx';

export default function App() {
  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <TopBar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
          </Routes>
        </div>
      </div>
      <Player />
    </div>
  );
}
