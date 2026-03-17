// ui/src/App.jsx
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard.jsx';
import Stock from './pages/Stock.jsx';
import Picking from './pages/Picking.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Dashboard</Link> | 
        <Link to="/stock">Estoque</Link> | 
        <Link to="/picking">Picking</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/stock" element={<Stock />} />
        <Route path="/picking" element={<Picking />} />
      </Routes>
    </BrowserRouter>
  );
}