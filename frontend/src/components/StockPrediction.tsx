import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Brush, ResponsiveContainer, Legend } from "recharts";
import Sidebar from "./Sidebar";
import { Bell, Mail, ChevronDown } from "lucide-react";

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

  // Top movers logic (example: sort by percent_change)
  const topMovers = rawPrices.slice(0, 5).sort((a, b) => Math.abs(b.percent_change) - Math.abs(a.percent_change));

  return (
    <div className="text-black flex flex-row w-screen h-screen overflow-hidden bg-secondary">
      <Sidebar />
      <div className="h-screen w-5/6 flex flex-col overflow-y-scroll bg-secondary border-none">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Mail className="w-5 h-5 text-gray-600" />
            <Bell className="w-5 h-5 text-gray-600" />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
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
                  className={`flex items-center gap-2 ${stock.color === "green" ? "text-green-600" : "text-red-600"}`}>
                  <span>{stock.name}</span>
                  <span>{stock.price}</span>
                  <span>{stock.percent_change > 0 ? `+${stock.percent_change}%` : `${stock.percent_change}%`}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Stock Search & Chart */}
        <div className="flex flex-col gap-6 p-6">
          <div className="flex items-center gap-4 mb-4">
            <input
              type="text"
              value={ticker.replace(".NS", "")}
              onChange={(e) => setTicker(e.target.value)}
              onBlur={handleBlur}
              placeholder="Search for stocks..."
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
            />
            <button
              onClick={fetchPredictions}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors">
              Search
            </button>
          </div>
          <div className="flex items-center space-x-4 mb-4">
            <span className="text-2xl">📈</span>
            <span className="text-lg">
              <span>Stock Name: </span>
              <span className="font-bold text-lg">{capitalizeFirst(stockName.replace(".NS", "") || "Stock Name")}</span>
            </span>
            <div className="text-lg font-semibold">
              ₹{currentPrice ? currentPrice.toFixed(2) : "N/A"}
              {rawPrices[0]?.color === "green" && (
                <span className="text-green-600"> (+{rawPrices[0].percent_change}) ↑</span>
              )}
              {rawPrices[0]?.color === "red" && (
                <span className="text-red-600 ml-1"> ({rawPrices[0].percent_change}) ↓</span>
              )}
            </div>
          </div>
          <div className="w-full bg-white rounded-lg shadow-md p-6">
            {loadingChart ? (
              <p>Loading chart...</p>
            ) : stockData.length > 0 ? (
              <ResponsiveContainer width="100%" height={500}>
                <LineChart
                  margin={{ top: 10, right: 30, left: 10 }}
                  data={stockData.map((item) => ({
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
    </div>
  );
};

export default StockDashboard;
