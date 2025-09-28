import { useState } from "react";
import { Bell, Mail, ChevronDown, Home, LayoutDashboard, Wallet, Newspaper, BarChart2, Users, Settings, Phone, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import topUpImage from './assets/photo/topUp.png';
function SeggetionSec() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="text-black flex flex-row w-screen h-screen overflow-hidden bg-secondary">
      <div className="font-inter flex overflow-x-hidden bg-white text-secondary">
        {/* Sidebar */}
        <div className="w-70 bg-white h-screen p-6 flex flex-col justify-start">
          <div className="h-60 mb-8">
            <div className="flex items-center gap-3 mb-10 pl-2">
              <BarChart2 className="w-6 h-6" />
              <span className="text-sm font-medium">GoStock</span>
            </div>

            <div className="bg-black text-white rounded-xl p-6 mb-8">
              <div className="text-sm">Total Investment</div>
              <div className="text-2xl font-bold">$5380.90</div>
              <div className="text-green-500">+18.10%</div>
            </div>
          </div>
          
          <div className="h-96">
            <nav>
              <div className="h-96">
                <div className="flex items-center gap-4 px-5 py-3 rounded-xl my-1 text-sm transition-colors hover:bg-gray-100 cursor-pointer" onClick={() => navigate('/suggetion')}>
                  <Home className="w-5 h-5" />
                  <span>Home</span>
                </div>
                <div className="flex items-center gap-4 px-5 py-3 rounded-xl my-1 text-sm transition-colors hover:bg-gray-100 cursor-pointer" onClick={() => navigate('/dashboard')}>
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Dashboard</span>
                </div>
                <div className="flex items-center gap-4 px-5 py-3 rounded-xl my-1 text-sm transition-colors hover:bg-gray-100 cursor-pointer">
                  <Wallet className="w-5 h-5" />
                  <span>Wallet</span>
                </div>
                <div className="flex items-center gap-4 px-5 py-3 rounded-xl my-1 text-sm transition-colors hover:bg-gray-100 cursor-pointer" onClick={() => navigate('/news')}>
                  <Newspaper className="w-5 h-5" />
                  <span>News</span>
                </div>

                <div>
                  <div className="flex items-center gap-4 px-5 py-3 rounded-xl my-1 text-sm transition-colors hover:bg-gray-100 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                    <BarChart2 className="w-5 h-5" />
                    {isOpen ? <ChevronUp className="ml-auto w-4 h-4" /> : <ChevronDown className="ml-auto w-4 h-4" />}
                  </div>
                  {isOpen && (
                    <div className="ml-10 space-y-2">
                      <div className="px-5 py-2 text-sm text-gray-600 cursor-pointer hover:bg-gray-50">Stock</div>
                      <div className="px-5 py-2 text-sm text-gray-600 cursor-pointer hover:bg-gray-50">Cryptocurrency</div>
                      <div className="px-5 py-2 text-sm text-gray-600 cursor-pointer hover:bg-gray-50">Mutual Fund</div>
                      <div className="px-5 py-2 text-sm text-gray-600 cursor-pointer hover:bg-gray-50">Gold</div>
                    </div>
                  )}
                </div>
              </div>
            </nav>

            <div className="border-t border-gray-200 my-4"></div>
            <div className="mt-auto pt-6">
              <div className="flex items-center gap-4 px-5 py-3 rounded-xl my-1 text-sm transition-colors hover:bg-gray-100 cursor-pointer">
                <Users className="w-5 h-5" />
                <span>Our community</span>
              </div>
              <div className="flex items-center gap-4 px-5 py-3 rounded-xl my-1 text-sm transition-colors hover:bg-gray-100 cursor-pointer">
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </div>
              <div className="flex items-center gap-4 px-5 py-3 rounded-xl my-1 text-sm transition-colors hover:bg-gray-100 cursor-pointer">
                <Phone className="w-5 h-5" />
                <span>Contact us</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="h-screen w-5/6 flex overflow-y-scroll overflow-x-hidden flex-col bg-secondary border-none">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
            <img src={topUpImage} alt="Search Icon" className="w-8 h-8" />
            <div className="flex items-center space-x-4">
              <Mail className="w-5 h-5 text-gray-600" />
              <Bell className="w-5 h-5 text-gray-600" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <span className="text-sm font-medium">Airlangga Mahesa</span>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>

          {/* News Sentiment Impact Section */}
          
          
        </div>
      </div>
    </div>
  );
}

export default SeggetionSec;
