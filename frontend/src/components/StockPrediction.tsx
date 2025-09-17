import { useState , useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Brush, ResponsiveContainer, Legend } from "recharts";
import { Bell, Mail, ChevronDown, Home, LayoutDashboard, Wallet, Newspaper, BarChart2, Users, Settings, Phone, ChevronUp } from 'lucide-react';
import './StockDashboard.css';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
const date = new Date();
const formattedDate = date.toLocaleDateString('en-CA', { month: '2-digit', day: '2-digit',year: 'numeric' });


const watchlist = [
  { name: 'SPOT', company: 'Spotify', value: '$310.40', change: '-1.10%' },
  { name: 'ABNB', company: 'Airbnb', value: '$132.72', change: '-10.29%' },
  { name: 'SHOP', company: 'Shopify', value: '$28.57', change: '-6.48%' },
  { name: 'SONY', company: 'Playstation', value: '$71.86', change: '+0.98%' },
  { name: 'DBX', company: 'Dropbox Inc', value: '$20.44', change: '-3.08%' },
];

interface StockDataPoint {
  date: string;
  price: number;
  type: 'historical' | 'prediction';
  curprice: number;
  name : string;
}

const StockCards = () => {
  const [stocks, setStocks] = useState<{ name: string; price: number | string }[]>([]);
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
    <div className="stock-cards">
      {loading ? (
        <p>Loading stocks...</p>
      ) : (
        stocks.map((stock) => (
          <div key={stock.name} className="stock-card">
            <div className="stock-info">
              <span>{stock.name}</span>
            </div>
            <div className="stock-values">
              <div>Current Price</div>
              <div className="stock-amount">₹{stock.price}</div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

function StockDashboard() {
  const [ticker, setTicker] = useState("");
  const [stockData, setStockData] = useState<StockDataPoint[]>([]);
  const navigate = useNavigate();
  const [loadingChart, setLoadingChart] = useState(false);
  const [stockName, setStockName] = useState(""); // To store the stock name
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);

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
    setStockData(data.data);
    setStockName(data.name); // Assuming 'name' is part of the API response
    setCurrentPrice(data.curprice);
    setLoadingChart(false);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const historicalValue = payload.find(p => p.dataKey === 'historicalPrice')?.value;
      const predictedValue = payload.find(p => p.dataKey === 'predictedPrice')?.value;
      const value = historicalValue ?? predictedValue;
      const type = historicalValue ? 'Historical' : 'Predicted';
      
      return (
        <div className="custom-tooltip bg-white p-4 rounded shadow">
          <p className="date">{new Date(label).toLocaleDateString()}</p>
          <p className="price">₹{value?.toFixed(2)}</p>
          <p className="type">{type}</p>
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
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="dashboard-container">
      <div className="dashboard-layout">
        {/* Sidebar */}
        <div className="sidebar">
          <div className='nav-first-container'>
            <div className="logo-container">
              <BarChart2 className="nav-icon" />
              <span className="logo-text">GoStock</span>
            </div>

            <div className="investment-card">
              <div className="investment-label">Total Investment</div>
              <div className="investment-amount">$5380.90</div>
              <div className="investment-percentage">+18.10%</div>
            </div>
          </div>
          <div className='nev-bar'>
            <nav>
              <div className='nev-2ndcontainer'>
                <div className="nav-item" onClick={() => navigate('/suggetion')}>
                  <Home className="nav-icon" />
                  <span>Home</span>
                </div>
                <div className="nav-item" onClick={() => navigate('/dashBoard')}>
                  <LayoutDashboard className="nav-icon" />
                  <span>Dashboard</span>
                </div>
                <div className="nav-item" onClick={() => navigate('/StockAnalyzer')} >
                  <Wallet className="nav-icon" />
                  <span>Wallet</span>
                </div>
                <div className="nav-item"  onClick={() => navigate('/news')}>
                  <Newspaper className="nav-icon" />
                  <span>News</span>
                </div>

                <div>
                      <div 
                        className="nav-item"
                        onClick={() => setIsOpen(!isOpen)}
                      >
                        <BarChart2 className="nav-icon" />
                        <span>Stock & fund</span>
                        {(!isOpen) ?
                        <ChevronDown className={`ml-auto transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-45'}`} /> :
                        <ChevronUp className={`ml-auto transition-transform duration-200 ${isOpen ? 'rotate-180' : 'rotate-45'}`} />}
                      </div>
                      
                      {isOpen && (
                        <>
                          <div className="nav-sub-item">Stock</div>
                          <div className="nav-sub-item">Cryptocurrency</div>
                          <div className="nav-sub-item">Mutual Fund</div>
                          <div className="nav-sub-item">Gold</div>
                        </>
                      )}
                    </div>
              </div>
              
            </nav>
              <div className='line'></div>
              <div className='nav-third-container'>
                <div className="nav-item">
                  <Users className="nav-icon" />
                  <span>Our community</span>
                </div>
                <div className="nav-item">
                  <Settings className="nav-icon" />
                  <span>Settings</span>
                </div>
                <div className="nav-item">
                  <Phone className="nav-icon" />
                  <span>Contact us</span>
                </div>
              </div>

          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Header */}
          <div className="search-bar">
            <div className='search'>
              <input
                type="text"
                value={ticker.replace(".NS", "")}
                onChange={(e) => setTicker(e.target.value)}
                onBlur={handleBlur}
                placeholder="Search for various stocks........"
                className="search-input"
              />
              <button onClick={fetchPredictions} className="search-button">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-search" viewBox="0 0 16 16">
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0"/>
                </svg>
              </button>
            </div>
            <div className="header-actions">
              <Mail />
              <Bell />
              <div className="profile">
                <div className="profile-image"></div>
                <span>Airlangga Mahesa</span>
                <ChevronDown />
              </div>
            </div>
          </div>

          {/* Portfolio Section */}
          <h2 className="section-title">My Portfolio</h2>
          <div className="portfolio-section">
            <div className="stock-cards">
            <StockCards />
            </div>
          </div>

          <div className='chart-watchlist-container'>
            {/* Chart Section */}
            <div className="chart-container">
              <div className="chart-header">
                <div className="time-filters">
                <button className="time-filter">1 Day</button>
                <button className="time-filter active">1 Week</button>
                <button className="time-filter">1 Month</button>
                <button className="time-filter">3 Month</button>
                <button className="time-filter">6 Month</button>
                <button className="time-filter">1 Year</button>
                <button className="time-filter">5 Year</button>
                <button className="time-filter">All</button>
              </div>
                
              </div>
              
              {loadingChart ? (
            <p>Loading chart...</p>
          ) : stockData.length > 0 ? (
            <div>
            <>
           <div className="stock-info">
            
            <span>🍎</span>
            <span className="stock-name">
              {stockName.replace('.NS', '') || "Stock Name"}
              </span>
            <span className="stock-company"></span>
            <div className="stock-amount"> ₹{currentPrice ? currentPrice.toFixed(2) : "N/A"}</div>
          </div>
            <ResponsiveContainer width="100%" height={400}>

                    <LineChart
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
                      <Tooltip content={<CustomTooltip />} />
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
                  </ResponsiveContainer></></div>)
  : (
    <p>No data available</p>
  )}
            </div>

            {/* Watchlist */}
            <div className='watchlist'>
              <div className="watchlist-header">
                <h2 className="section-title">My watchlist</h2>
                <button className="text-2xl font-bold">+</button>
              </div>
              <div className='watchlist-content'>
                {watchlist.map((stock) => (
                  <div key={stock.name} className="watchlist-item">
                    <div className="watchlist-stock">
                      <div className="stock-icon">{stock.name[0]}</div>
                      <div className="stock-details">
                        <div className="stock-name">{stock.name}</div>
                        <div className="stock-company">{stock.company}</div>
                      </div>
                    </div>
                    <div className="stock-price">
                      <div className="stock-current">{stock.value}</div>
                      <div className={stock.change.startsWith('+') ? 'change-positive' : 'change-negative'}>
                        {stock.change}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StockDashboard;