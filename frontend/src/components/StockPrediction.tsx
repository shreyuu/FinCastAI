import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Brush, ResponsiveContainer, Legend } from "recharts";
import Sidebar from "./Sidebar";
import { ChevronDown, Search, Newspaper, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";

function capitalizeFirst(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

interface StockDataPoint {
  date: string;
  price: number;
  type: "historical" | "prediction";
  curprice: number;
  name: string;
}

const ZOOM_LEVELS = [
  { label: "All Time", value: "all" },
  { label: "Year", value: "year" },
  { label: "Month", value: "month" },
  { label: "Week", value: "week" },
];

const StockDashboard = () => {
  const [ticker, setTicker] = useState("");
  const [stockData, setStockData] = useState<StockDataPoint[]>([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [stockName, setStockName] = useState("");
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [rawPrices, setRawPrices] = useState<
    { name: string; price: number | string; color: string; percent_change: number }[]
  >([]);
  const [userName, setUserName] = useState<string>("");
  const [zoom, setZoom] = useState("month");
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user && user.name) setUserName(user.name);
  }, []);

  const fetchPredictions = async () => {
    setLoadingChart(true);
    const response = await fetch("http://localhost:8000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ticker,
        start_date: "2020-01-01",
        end_date: new Date().toLocaleDateString("en-CA"),
        forecast_out: 7,
      }),
    });
    const data = await response.json();
    if (data.error) {
      window.alert(data.error + " or check the stock name ");
      setLoadingChart(false);
      return;
    }
    setStockData(data.data);
    setStockName(data.name);
    setCurrentPrice(data.curprice);
    setRawPrices(data.stock_prices);
    setLoadingChart(false);
  };

  const handleBlur = () => {
    if (ticker && !ticker.endsWith(".NS")) {
      setTicker(ticker + ".NS");
    }
  };

  // Helper to filter data by zoom level
  const getFilteredData = () => {
    if (zoom === "all") return stockData;
    const now = new Date();
    let cutoff: Date;
    switch (zoom) {
      case "year":
        cutoff = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      case "month":
        cutoff = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case "week":
        cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      default:
        cutoff = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    }
    return stockData.filter((item) => new Date(item.date) >= cutoff);
  };

  // Top movers logic (example: sort by percent_change)
  const topMovers = rawPrices.slice(0, 5).sort((a, b) => Math.abs(b.percent_change) - Math.abs(a.percent_change));

  return (
    <div className="text-black flex flex-row w-screen h-screen overflow-hidden bg-secondary">
      <Sidebar />
      <div className="h-screen w-5/6 flex flex-col overflow-y-scroll bg-secondary border-none">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary tracking-wide">FinCastAI Dashboard</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-100 text-primary font-semibold hover:bg-blue-200"
              onClick={() => navigate("/news")}>
              <Newspaper className="w-5 h-5" />
              News
            </button>
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-100 text-green-700 font-semibold hover:bg-green-200"
              onClick={() => navigate("/StockAnalyzer")}>
              <Wallet className="w-5 h-5" />
              Indicators
            </button>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">{userName || "Guest"}</span>
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="flex flex-row gap-8 p-6 bg-white shadow rounded-lg mt-4 mx-4">
          <div>
            <h2 className="text-xl font-bold mb-2">Welcome, {capitalizeFirst(userName)}</h2>
            <p className="text-gray-600">
              Total Portfolio Value:{" "}
              <span className="font-semibold">₹{currentPrice ? currentPrice.toFixed(2) : "N/A"}</span>
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1">Top Movers</h3>
            <ul>
              {topMovers.map((stock, idx) => (
                <li
                  key={idx}
                  className={`text-sm font-medium ${stock.color === "green" ? "text-green-600" : "text-red-600"}`}>
                  {stock.name}: {stock.percent_change > 0 ? "+" : ""}
                  {stock.percent_change}%
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Prediction Chart Section */}
        <div className="w-full bg-white rounded-lg shadow-md p-6 mt-6 mx-4">
          <div className="flex items-center gap-4 mb-4">
            <input
              type="text"
              placeholder="Enter Stock Ticker (e.g. TCS.NS)"
              className="input-field w-64"
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              onBlur={handleBlur}
            />
            <button
              className={`flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-colors
                bg-primary text-black shadow-md
                hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
                ${loadingChart ? "opacity-60 cursor-not-allowed" : ""}
              `}
              disabled={loadingChart}
              onClick={fetchPredictions}>
              {loadingChart ? (
                <svg className="animate-spin h-5 w-5 text-black" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search
                </>
              )}
            </button>
            <span className="font-bold text-lg ml-4">
              {stockName ? capitalizeFirst(stockName.replace(".NS", "")) : "Stock Name"}
            </span>
            <span className="text-lg font-semibold ml-2">
              ₹{currentPrice ? currentPrice.toFixed(2) : "N/A"}
              {rawPrices[0]?.color === "green" && (
                <span className="text-green-600"> (+{rawPrices[0].percent_change}) ↑</span>
              )}
              {rawPrices[0]?.color === "red" && (
                <span className="text-red-600 ml-1"> ({rawPrices[0].percent_change}) ↓</span>
              )}
            </span>
            <select
              value={zoom}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setZoom(e.target.value)}
              className="flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-colors
                bg-primary text-black shadow-md
                hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
              style={{ minWidth: 120 }}>
              {ZOOM_LEVELS.map((z) => (
                <option key={z.value} value={z.value}>
                  {z.label}
                </option>
              ))}
            </select>
          </div>
          {loadingChart ? (
            <p>Loading chart...</p>
          ) : getFilteredData().length > 0 ? (
            <ResponsiveContainer width="100%" height={500}>
              <LineChart
                margin={{ top: 10, right: 30, left: 10 }}
                data={getFilteredData().map((item) => ({
                  ...item,
                  historicalPrice: item.type === "historical" ? item.price : null,
                  predictedPrice: item.type === "prediction" ? item.price : null,
                  date: item.date,
                }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString()}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis domain={["auto", "auto"]} tickFormatter={(value) => `₹${value.toFixed(2)}`} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const historicalValue = payload.find((p) => p.dataKey === "historicalPrice")?.value;
                      const predictedValue = payload.find((p) => p.dataKey === "predictedPrice")?.value;
                      const value =
                        typeof historicalValue === "number"
                          ? historicalValue
                          : typeof predictedValue === "number"
                          ? predictedValue
                          : null;
                      const type = typeof historicalValue === "number" ? "Historical" : "Predicted";
                      return (
                        <div className="bg-white p-4 rounded-lg shadow-lg border">
                          <p className="text-sm text-gray-600">{label ? new Date(label).toLocaleDateString() : ""}</p>
                          <p className="text-lg font-semibold text-gray-800">
                            ₹{typeof value === "number" ? value.toFixed(2) : "N/A"}
                          </p>
                          <p className="text-xs text-gray-500">{type}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                  offset={200}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="historicalPrice"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={false}
                  name="Historical Price"
                  connectNulls={true}
                />
                <Line
                  type="monotone"
                  dataKey="predictedPrice"
                  stroke="#FF9933"
                  strokeWidth={2}
                  dot={false}
                  name="Predicted Price"
                  connectNulls={true}
                  strokeDasharray="5 5"
                />
                <Brush
                  dataKey="date"
                  height={30}
                  stroke="#8884d8"
                  tickFormatter={(date) => new Date(date).toLocaleDateString()}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p>No data available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockDashboard;
