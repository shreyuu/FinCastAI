import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Wallet, Newspaper, BarChart2 } from "lucide-react";

const navItems = [
  { label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, path: "/dashBoard" },
  { label: "Indicators", icon: <Wallet className="w-5 h-5" />, path: "/StockAnalyzer" },
  { label: "News", icon: <Newspaper className="w-5 h-5" />, path: "/news" },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="w-50 h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 shadow-lg flex flex-col justify-between py-8 px-6">
      {/* Logo Section */}
      <div>
        <div className="flex items-center gap-3 mb-12">
          <BarChart2 className="w-7 h-7 text-primary" />
          <span className="text-xl font-bold text-primary tracking-wide">FinCastAI</span>
        </div>
        {/* Navigation */}
        <nav>
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-4 px-5 py-3 rounded-xl text-base font-medium transition-colors
                    ${
                      location.pathname === item.path
                        ? "bg-primary text-blue-500 shadow"
                        : "text-gray-700 hover:bg-blue-100 hover:text-primary"
                    }
                  `}
                  aria-current={location.pathname === item.path ? "page" : undefined}>
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      {/* Footer */}
      <div className="mt-8 text-xs text-gray-400 text-center">&copy; {new Date().getFullYear()} FinCastAI</div>
    </aside>
  );
};

export default Sidebar;
