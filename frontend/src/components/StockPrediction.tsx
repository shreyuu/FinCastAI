import { useState , useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Brush, ResponsiveContainer, Legend } from "recharts";
import { Bell, Mail, ChevronDown } from "lucide-react";
import Sidebar from './Sidebar';

const date = new Date();
const formattedDate = date.toLocaleDateString('en-CA', { month: '2-digit', day: '2-digit',year: 'numeric' });


/*const watchlist = [
  { name: 'SPOT', company: 'Spotify', value: '$310.40', change: '-1.10%' },
  { name: 'ABNB', company: 'Airbnb', value: '$132.72', change: '-10.29%' },
  { name: 'SHOP', company: 'Shopify', value: '$28.57', change: '-6.48%' },
  { name: 'SONY', company: 'Playstation', value: '$71.86', change: '+0.98%' },
  { name: 'DBX', company: 'Dropbox Inc', value: '$20.44', change: '-3.08%' },
];*/

interface StockDataPoint {
  date: string;
  price: number;
  type: 'historical' | 'prediction';
  curprice: number;
  name : string;
}


const StockCards = () => {
  const [stocks, setStocks] = useState<{ name: string; price: number | string;color: string,percent_change:number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/stock-prices")
      .then((response) => response.json())
      .then((data) => {
        setStocks(data.stocks);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching stock prices:", error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {loading ? (
        <p>Loading stocks...</p>
      ) : (
        stocks.map((stock) => (
          <div key={stock.name} className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="mb-2">
              <span className="font-semibold text-gray-800">{stock.name}</span>
            </div>
            <div className="space-y-1">
              <div className="text-sm text-gray-600"><strong>Current Price</strong></div>
              <div className={`text-lg font-bold ${stock.color === 'red' ? 'text-red-600' : 'text-green-600'}`}>
                ₹{typeof stock.price === 'number' ? stock.price.toFixed(2) : parseFloat(stock.price).toFixed(2)}
                  {stock.color === 'red' && (
                    <span className="text-red-600 ml-1"> ↓</span>
                  )}
                  {stock.color === 'green' && (
                    <span className="text-green-600 ml-1"> ↑</span>
                  )}
              </div>
              <div>
                  {
                    stock.color ==='red' && 
                    (
                      <span className="text-red-600 ml-1">({stock.percent_change}%)</span> 
                    ) 
                  }
                  {
                    stock.color ==='green' && 
                    (
                      <span className="text-green-600 ml-1">(+{stock.percent_change}%)</span> 
                    ) 
                  }
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

function capitalizeFirst(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function StockDashboard() {
  const [ticker, setTicker] = useState("");
  const [stockData, setStockData] = useState<StockDataPoint[]>([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [stockName, setStockName] = useState(""); // To store the stock name
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [rawPrices, setRawPrices] = useState<{ name: string; price: number | string; color: string,percent_change:number }[]>([]);
  const [userName, setUserName] = useState<string>("");

  useEffect(() => {
    // Example: Retrieve user info from localStorage after login
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user && user.name) {
      setUserName(user.name);
    }
  }, []);

  const fetchPredictions = async () => {
    setLoadingChart(true);
    const response = await fetch("http://localhost:8000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ticker,
        start_date: "2020-01-01",
        end_date: formattedDate,
        forecast_out: 7,
      }),
    });
    
    const data = await response.json();
    if (data.error) {
      // Show the error message from the API in a popup
      window.alert(data.error+" or check the stock name ");
      setLoadingChart(false);
      return; // Exit the function
    }
    setStockData(data.data);
    setStockName(data.name); // Assuming 'name' is part of the API response
    setCurrentPrice(data.curprice);
    setLoadingChart(false);
    setRawPrices(data.stock_prices);
  };

// Define a type for the tooltip props
interface CustomTooltipProps {
  active?: boolean;
  payload?: { dataKey: string; value: number }[];
  label?: string;
}

const CustomTooltip = ({ active, payload = [], label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const historicalValue = payload.find((p: { dataKey: string; value: number }) => p.dataKey === 'historicalPrice')?.value;
    const predictedValue = payload.find((p: { dataKey: string; value: number }) => p.dataKey === 'predictedPrice')?.value;
    const value = historicalValue ?? predictedValue;
    const type = historicalValue ? 'Historical' : 'Predicted';

    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border">
        <p className="text-sm text-gray-600">{label ? new Date(label).toLocaleDateString() : ''}</p>
        <p className="text-lg font-semibold text-gray-800">₹{value?.toFixed(2)}</p>
        <p className="text-xs text-gray-500">{type}</p>
      </div>
    );
  }
  return null;
};

  const handleBlur = () => {
    if (ticker && !ticker.endsWith(".NS")) {
      setTicker(ticker + ".NS"); // Save with ".NS" on blur
    }
  };
  return (
    <div className="text-black flex flex-row w-screen h-screen overflow-hidden bg-secondary">
      <div className="font-inter flex overflow-x-hidden bg-white text-secondary">
        {/* Sidebar */}
        <Sidebar />
        {/* Main Content */}
        <div className="h-screen w-5/6 flex overflow-y-scroll overflow-x-hidden flex-col bg-secondary border-none">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
            <div className='flex items-center space-x-2'>
              <input
                type="text"
                value={ticker.replace(".NS", "")}
                onChange={(e) => setTicker(e.target.value)}
                onBlur={handleBlur}
                placeholder="Search for various stocks........"
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200"
              />
              <button onClick={fetchPredictions} className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                </svg>
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <Mail className="w-5 h-5 text-gray-600" />
              <Bell className="w-5 h-5 text-gray-600" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <span className="text-sm font-medium">{userName || "Guest"}</span>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </div>
            </div>
          </div>

          {/* Portfolio Section */}
          <h2 className="text-xl font-semibold m-2 pl-4">My Portfolio</h2>
          <div className="p-4">
            <StockCards />
          </div>

          <div className='flex gap-6 -mt-2 h-70vh'>
            {/* Chart Section */}
            <div className="flex-1 bg-white rounded-lg shadow-md p-6">
              <div className="mb-4">
                {/* Time filters can be added here if needed */}
              </div>
              
              {loadingChart ? (
            <p>Loading chart...</p>
          ) : stockData.length > 0 ? (
            <div>
            <div className="flex items-center space-x-4 mb-4">
            
            <span className="text-2xl">🍎</span>
            <span className="text-lg">
              <span>Stock Name:-  </span>
              <span className="font-bold text-lg">
                {capitalizeFirst(stockName.replace('.NS', '') || "Stock Name")}
              </span>
            </span>
            <div className="text-lg font-semibold"> ₹{currentPrice ? currentPrice.toFixed(2) : "N/A"}
                  {rawPrices[0]?.color === 'green' && (
                    <span className="text-green-600"> ( +{rawPrices[0].percent_change} )</span>
                  )}
                  {rawPrices[0]?.color === 'green' && (
                    <span className="text-green-600"> ↑</span>
                  )}
                  {rawPrices[0]?.color === 'red' && (
                    <span className="text-red-600 ml-1"> ( {rawPrices[0].percent_change} )</span>
                  )}
                  {rawPrices[0]?.color === 'red' && (
                    <span className="text-red-600 ml-1"> ↓</span>
                  )}
                  
            </div>
          </div>
          <div className="w-full">
            <ResponsiveContainer width="100%" height={500}>

                    <LineChart margin={{ top: 10, right: 30, left: 10, }}
                      data={stockData.map(item => ({
                        ...item,
                        historicalPrice: item.type === 'historical' ? item.price : null,
                        predictedPrice: item.type === 'prediction' ? item.price : null,
                        date: item.date
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) => new Date(date).toLocaleDateString()}
                        angle={-45}
                        textAnchor="end"
                        height={60} />
                      <YAxis
                        domain={['auto', 'auto']}
                        tickFormatter={(value) => `₹${value.toFixed(2)}`} />
                      <Tooltip  content={<CustomTooltip />} offset={200} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="historicalPrice"
                        stroke="#10B981"
                        strokeWidth={2}
                        dot={false}
                        name="Historical Price"
                        connectNulls={true} />
                      <Line
                        type="monotone"
                        dataKey="predictedPrice"
                        stroke="#FF9933"
                        strokeWidth={2}
                        dot={false}
                        name="Predicted Price"
                        connectNulls={true}
                        strokeDasharray="5 5" />
                      <Brush  
                        dataKey="date"
                        height={30}
                        stroke="#8884d8"
                        tickFormatter={(date) => new Date(date).toLocaleDateString()} />
                    </LineChart>
            </ResponsiveContainer>
          </div>
            </div>)
                : (
                 <p>No data available</p>
              )}
            </div>

            {/* Watchlist can be added here if needed */}

          </div>
        </div>
      </div>
    </div>
  );
}

export default StockDashboard;