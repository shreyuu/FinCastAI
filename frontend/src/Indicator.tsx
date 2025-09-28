import { useState } from "react";
import axios from "axios";
import { LayoutDashboard, Wallet, Newspaper, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface StockResponse {
  company: string;
  ticker: string;
  impact: number;
  RSI: number;
  EMA: number;
  MACD: number;
  Bollinger_Bands: {
    Low: number;
    Mid: number;
    Up: number;
  };
  OBV: number;
  trade_decision: string;
  error?: string;
}
function StockAnalyzer() {
  const [company, setCompany] = useState("");
  const [ticker, setTicker] = useState("");
  const [ownedStock, setOwnedStock] = useState(false);
  const [result, setResult] = useState<StockResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await axios.post<StockResponse>("http://localhost:8000/Indicotor", {
        company,
        ticker,
        owned_stock: ownedStock,
      });
      if (response.status === 200 && response.data.error) {
        window.alert(response.data.error + " or check the stock name.");
        setLoading(false);
        return;
      }

      setResult(response.data);
    } catch (error) {
      console.error("Error fetching data", error);
    }
    setLoading(false);
  };

  return (
    <div className="text-black flex flex-row w-screen h-screen overflow-hidden bg-secondary">
      <div className="font-inter flex overflow-x-hidden bg-white text-secondary">
        {/* Sidebar */}
        <div className="w-70 bg-white h-screen p-6 flex flex-col justify-start">
          <div className="h-60 mb-8">
            <div className="flex items-center gap-3 mb-10 pl-2">
              <BarChart2 className="w-6 h-6" />
              <span className="text-sm font-medium">EStock</span>
            </div>

            {/* <div className="bg-black text-white rounded-xl p-6 mb-8">
              <div className="text-sm">Total Investment</div>
              <div className="text-2xl font-bold">$5380.90</div>
              <div className="text-green-500">+18.10%</div>
            </div> */}
          </div>
          <div className="h-96">
            <nav>
              <div className="h-96">
                {/* <div className="flex items-center gap-4 px-5 py-3 rounded-xl my-1 text-sm transition-colors hover:bg-gray-100" onClick={() => navigate('/')}>
                  <Home className="w-5 h-5" />
                  <span>Home</span>
                </div> */}
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
    <div className="flex pl-50 flex-col items-center justify-center flex-nowrap">
      <h1 className="text-xl font-bold">Stock Impact Predictor</h1>
      <input 
        type="text"
        placeholder="Company Name"
        className="text-black"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
      />
      <input
        type="text"
        placeholder="Stock Ticker"
        className="text-black"
        value={ticker}
        onChange={(e) => setTicker(e.target.value)}
      />
      <div className="">
        <input
          type="checkbox"
          checked={ownedStock}
          onChange={(e) => setOwnedStock(e.target.checked)}
        />
        <h5 className="">Do you own this stock?</h5>
      </div>
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? "Analyzing..." : "Predict Impact"}
      </button>
      {result && (
        <div className="mt-4 p-4 border rounded">
          <h2 className="text-lg font-semibold">Results</h2>
          <p><strong>Impact:</strong> {result.impact}%</p>
          <p><strong>Trade Decision:</strong> {result.trade_decision}</p>
          <h3 className="text-md font-semibold mt-2">Technical Indicators</h3>
          <p><strong>RSI:</strong> {result.RSI}</p>
          <p><strong>EMA:</strong> {result.EMA}</p>
          <p><strong>MACD:</strong> {result.MACD}</p>
          <p><strong>Bollinger Bands:</strong> Low: {result.Bollinger_Bands.Low}, Mid: {result.Bollinger_Bands.Mid}, Up: {result.Bollinger_Bands.Up}</p>
          <p><strong>OBV:</strong> {result.OBV}</p>
        </div>
      )}
    </div>
    </div>
    </div>
  );
}

export default StockAnalyzer;