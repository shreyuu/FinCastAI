import { LayoutDashboard, Wallet, Newspaper, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();
  return (
    <div className="w-70 bg-white h-screen p-6 flex flex-col justify-start">
      <div className="h-60 mb-8">
        <div className="flex items-center gap-3 mb-10 pl-2">
          <BarChart2 className="w-6 h-6" />
          <span className="text-sm font-medium">EStock</span>
        </div>
      </div>
      <div className="h-96">
        <nav>
          <div className="h-96">
            <div className="flex items-center gap-4 px-5 py-3 rounded-xl my-1 text-sm transition-colors hover:bg-gray-100 cursor-pointer" onClick={() => navigate('/dashBoard')}>
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </div>
            <div className="flex items-center gap-4 px-5 py-3 rounded-xl my-1 text-sm transition-colors hover:bg-gray-100 cursor-pointer" onClick={() => navigate('/StockAnalyzer')}>
              <Wallet className="w-5 h-5" />
              <span>Indicators</span>
            </div>
            <div className="flex items-center gap-4 px-5 py-3 rounded-xl my-1 text-sm transition-colors hover:bg-gray-100 cursor-pointer" onClick={() => navigate('/news')}>
              <Newspaper className="w-5 h-5" />
              <span>News</span>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;