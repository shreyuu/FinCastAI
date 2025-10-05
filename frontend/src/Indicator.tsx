import { useState } from "react";
import axios from "axios";
import Sidebar from "./components/Sidebar";

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
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMsg("");
    setResult(null);
    try {
      const response = await axios.post<StockResponse>("http://localhost:8000/Indicotor", {
        company,
        ticker,
        owned_stock: ownedStock,
      });
      if (response.data.error) {
        setErrorMsg(response.data.error + " or check the stock name.");
      } else {
        setResult(response.data);
      }
    } catch (error) {
      console.error("API request failed:", error);
      setErrorMsg("Error fetching data. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="text-black flex flex-row w-screen h-screen overflow-hidden bg-secondary">
      <Sidebar />
      <div className="flex flex-col items-center justify-center w-full px-8 py-12 bg-gradient-to-br from-blue-50 via-white to-blue-100">
        <h1 className="text-3xl font-bold mb-6 text-primary">Stock Impact & Technical Indicators</h1>
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xl mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <input
              type="text"
              placeholder="Company Name"
              className="input-field"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
            <input
              type="text"
              placeholder="Stock Ticker (e.g. TCS.NS)"
              className="input-field"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
            />
          </div>
          <div className="flex items-center mb-6">
            <input
              type="checkbox"
              checked={ownedStock}
              onChange={(e) => setOwnedStock(e.target.checked)}
              id="ownedStock"
              className="mr-2"
            />
            <label htmlFor="ownedStock" className="text-gray-700 text-sm">
              Do you own this stock?
            </label>
          </div>
          <button
            className={`btn-primary w-full font-semibold py-2 ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
            onClick={handleSubmit}
            disabled={loading}>
            {loading ? "Analyzing..." : "Predict Impact"}
          </button>
          {errorMsg && <div className="mt-4 text-red-600 text-sm">{errorMsg}</div>}
        </div>

        {result && (
          <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-8 mt-4">
            <h2 className="text-2xl font-bold mb-4 text-primary">
              Results for {result.company} ({result.ticker})
            </h2>
            <div className="mb-6 flex flex-col md:flex-row gap-6">
              <div className="flex-1 bg-blue-50 rounded-lg p-4 shadow">
                <h3 className="text-lg font-semibold mb-2">Impact</h3>
                <p className="text-3xl font-bold text-blue-600">{result.impact}%</p>
              </div>
              <div className="flex-1 bg-green-50 rounded-lg p-4 shadow">
                <h3 className="text-lg font-semibold mb-2">Trade Decision</h3>
                <p
                  className={`text-2xl font-bold ${
                    result.trade_decision === "Buy"
                      ? "text-green-600"
                      : result.trade_decision === "Sell"
                      ? "text-red-600"
                      : "text-gray-700"
                  }`}>
                  {result.trade_decision}
                </p>
              </div>
            </div>
            <h3 className="text-lg font-semibold mb-2">Technical Indicators</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="card">
                <span className="font-semibold">RSI:</span> <span>{result.RSI}</span>
              </div>
              <div className="card">
                <span className="font-semibold">EMA:</span> <span>{result.EMA}</span>
              </div>
              <div className="card">
                <span className="font-semibold">MACD:</span> <span>{result.MACD}</span>
              </div>
              <div className="card">
                <span className="font-semibold">OBV:</span> <span>{result.OBV}</span>
              </div>
              <div className="card col-span-1 md:col-span-2">
                <span className="font-semibold">Bollinger Bands:</span>
                <div className="ml-2">
                  <span className="text-xs text-gray-600">Low:</span> {result.Bollinger_Bands.Low}{" "}
                  <span className="text-xs text-gray-600">Mid:</span> {result.Bollinger_Bands.Mid}{" "}
                  <span className="text-xs text-gray-600">Up:</span> {result.Bollinger_Bands.Up}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StockAnalyzer;
