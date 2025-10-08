import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Wallet, Newspaper, BarChart2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

const navItems = [
  { label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, path: "/dashBoard" },
  { label: "Indicators", icon: <Wallet className="w-5 h-5" />, path: "/StockAnalyzer" },
  { label: "News", icon: <Newspaper className="w-5 h-5" />, path: "/news" },
  { label: "Portfolio", icon: <BarChart2 className="w-5 h-5" />, path: "/portfolio" }, // Add this line
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(() => {
    const stored = localStorage.getItem("sidebarCollapsed");
    return stored ? JSON.parse(stored) : false;
  });

  useEffect(() => {
    localStorage.setItem("sidebarCollapsed", JSON.stringify(collapsed));
  }, [collapsed]);

  return (
    <aside
      className={`h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 shadow-lg flex flex-col justify-between py-8 transition-all duration-300 ${
        collapsed ? "w-16 px-2" : "w-50 px-6"
      }`}>
      {/* Logo & Collapse Button */}
      <div>
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <BarChart2 className="w-7 h-7 text-primary" />
            {!collapsed && <span className="text-xl font-bold text-primary tracking-wide">FinCastAI</span>}
          </div>
          <button
            className="ml-auto p-1 rounded hover:bg-blue-100"
            onClick={() => setCollapsed((v: boolean) => !v)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
        {/* Navigation */}
        <nav>
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-4 px-2 py-3 rounded-xl text-base font-medium transition-colors
                    ${
                      location.pathname === item.path
                        ? "bg-primary text-blue-500 shadow"
                        : "text-gray-700 hover:bg-blue-100 hover:text-primary"
                    }
                  `}
                  aria-current={location.pathname === item.path ? "page" : undefined}>
                  {item.icon}
                  {!collapsed && <span>{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      {/* Footer */}
      <div className={`mt-8 text-xs text-gray-400 text-center ${collapsed ? "hidden" : ""}`}>
        &copy; {new Date().getFullYear()} FinCastAI
      </div>
    </aside>
  );
};

export default Sidebar;
