import { LayoutDashboard, Wallet, Newspaper, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  return (
    <div className="sidebar">
      <div className='nav-first-container'>
        <div className="logo-container">
          <BarChart2 className="nav-icon" />
          <span className="logo-text">EStock</span>
        </div>
      </div>
      <div className='nev-bar'>
        <nav>
          <div className='nev-2ndcontainer'>
            <div className="nav-item" onClick={() => navigate('/dashBoard')}>
              <LayoutDashboard className="nav-icon" />
              <span>Dashboard</span>
            </div>
            <div className="nav-item" onClick={() => navigate('/StockAnalyzer')}>
              <Wallet className="nav-icon" />
              <span>Indicators</span>
            </div>
            <div className="nav-item" onClick={() => navigate('/news')}>
              <Newspaper className="nav-icon" />
              <span>News</span>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;