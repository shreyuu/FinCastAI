/** @format */

import { useEffect, useState } from "react";
import { BarChart2 } from "lucide-react";
import stockVideo from "./assets/video/Pinterest media.mp4";
import { useNavigate } from "react-router-dom";

interface StockCardData {
  name: string;
  price: number;
  color: string;
  percent_change: number;
}

function HomePage() {
  const navigate = useNavigate();
  const [stockCards, setStockCards] = useState<StockCardData[]>([]);
  const [loadingStocks, setLoadingStocks] = useState(true);

  useEffect(() => {
    // Fetch real-time stock prices from backend
    fetch("http://localhost:8000/stock-prices")
      .then((response) => response.json())
      .then((data) => {
        setStockCards(data.stocks || []);
        setLoadingStocks(false);
      })
      .catch(() => setLoadingStocks(false));
  }, []);

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Header Bar */}
      <header className="w-full flex items-center justify-between px-16 py-4 bg-white shadow-md fixed top-0 left-0 z-30">
        <div className="flex items-center gap-4">
          <BarChart2 className="text-4xl text-primary" />
          <span className="text-3xl font-bold font-calibri text-primary">FinCastAI</span>
        </div>
        <nav className="flex gap-8">
          <button className="btn-secondary font-semibold" onClick={() => navigate("/login")}>
            Log in
          </button>
          <button className="btn-primary font-semibold" onClick={() => navigate("/about")}>
            Sign Up
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex flex-row items-center justify-center w-full h-screen pt-20">
        {/* Left: Animated Headline & Search */}
        <div className="flex flex-col justify-center items-start w-3/5 pl-12 relative">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4 leading-tight animate-fade-slide-up">
            Make Better <br />
            Investment <br />
            Decisions With <br />
            <span className="text-primary">Alternative Data.</span>
          </h1>
          <p className="text-lg text-gray-600 mb-6 animate-fade-slide-up" style={{ animationDelay: "0.5s" }}>
            Get the inside scoop on companies like never before.
          </p>
          {/* <div className="flex gap-2 w-full max-w-md animate-fade-slide-up" style={{ animationDelay: "0.7s" }}>
            <input type="text" placeholder="Search for stocks (e.g. Reliance, TCS)..." className="input-field flex-1" />
            <button className="btn-primary px-6 py-2 font-semibold">Search</button>
          </div> */}
          {/* Real-time Stock Cards */}
          <div
            className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 w-full max-w-2xl animate-fade-slide-up"
            style={{ animationDelay: "1s" }}>
            {loadingStocks ? (
              <div className="text-gray-500 text-base">Loading stocks...</div>
            ) : (
              stockCards.slice(0, 8).map((stock) => (
                <div
                  key={stock.name}
                  className="relative w-64 h-24 bg-white rounded-xl shadow-md border border-gray-200 flex flex-col justify-center items-start p-3">
                  {/* Removed imageLogo */}
                  <span className="text-lg font-bold">{stock.name}</span>
                  <span
                    className={`text-sm font-semibold ${stock.color === "red" ? "text-red-500" : "text-green-500"}`}>
                    {stock.percent_change > 0 ? `+${stock.percent_change}%` : `${stock.percent_change}%`}
                  </span>
                  <div className="flex items-end gap-1 mt-1">
                    <span className="text-base font-bold">₹{stock.price.toFixed(2)}</span>
                    {stock.color === "red" ? (
                      <span className="ml-2 px-1 py-0.5 bg-red-100 text-red-600 rounded text-xs">
                        🔻{stock.percent_change}
                      </span>
                    ) : (
                      <span className="ml-2 px-1 py-0.5 bg-green-100 text-green-600 rounded text-xs">
                        🔺{stock.percent_change}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Video & CTA */}
        <div className="flex flex-col items-center justify-center w-1/3 relative">
          <div
            className="w-80 h-80 rounded-3xl overflow-hidden shadow-xl animate-fade-slide-up"
            style={{ animationDelay: "1.2s" }}>
            <video width="100%" height="100%" autoPlay loop muted>
              <source src={stockVideo} type="video/mp4" />
            </video>
          </div>
          <div className="mt-6 text-center animate-fade-slide-up" style={{ animationDelay: "1.5s" }}>
            <h2 className="text-2xl font-bold text-primary mb-2">Join our investor community</h2>
            <p className="text-gray-700 mb-3">Share your investment journey and learn from others.</p>
            <button className="btn-primary px-6 py-2 font-semibold text-base" onClick={() => navigate("/about")}>
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-2 bg-white text-center text-gray-500 absolute bottom-0 left-0 z-20 shadow-inner">
        &copy; {new Date().getFullYear()} Shreyash Meshram. All rights reserved.
      </footer>
    </div>
  );
}

export default HomePage;
