import { useState } from "react";
import { Bell, Mail, ChevronDown, LayoutDashboard, Wallet, Newspaper, BarChart2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import topUpImage from './assets/photo/topUp.png';
import './newImpact.css'
function NewspaperSec() {
  const navigate = useNavigate();
  const [ticker, setTicker] = useState("");
  const [impact, setImpact] = useState<number | null>(null);
  const [reasons, setReasons] = useState<{ sentiment: string; reason: string }[]>([]);

  // ✅ Function to fetch news impact from FastAPI
  const fetchNewsImpact = async () => {
    if (!ticker.trim()) return;
    try {
      const response = await fetch(`http://localhost:8000/news-impact/${encodeURIComponent(ticker)}`);
      const data = await response.json();
  
      setImpact(data.impact);
      setReasons(data.reasons.map((reasonText: string) => ({
        sentiment: reasonText.includes("Positive") ? "Positive" :
                   reasonText.includes("Negative") ? "Negative" : "Neutral",
        reason: reasonText
      })));
    } catch (error) {
      console.error("Error fetching news impact:", error);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-layout">
        
        {/* Sidebar */}
        <div className="sidebar">
          <div className='nav-first-container'>
            <div className="logo-container">
              <BarChart2 className="nav-icon" />
              <span className="logo-text">EStock</span>
            </div>

            {/* <div className="investment-card">
              <div className="investment-label">Total Investment</div>
              <div className="investment-amount">$5380.90</div>
              <div className="investment-percentage">+18.10%</div>
            </div> */}
          </div>
          <div className='nev-bar'>
            <nav>
              <div className='nev-2ndcontainer'>
                {/* <div className="nav-item" onClick={() => navigate('/')}>
                  <Home className="nav-icon" />
                  <span>Home</span>
                </div> */}
                <div className="nav-item" onClick={() => navigate('/dashBoard')}>
                  <LayoutDashboard className="nav-icon" />
                  <span>Dashboard</span>
                </div>
                <div className="nav-item" onClick={() => navigate('/StockAnalyzer')} >
                  <Wallet className="nav-icon" />
                  <span>Indicators</span>
                </div>
                <div className="nav-item"  onClick={() => navigate('/news')}>
                  <Newspaper className="nav-icon" />
                  <span>News</span>
                </div>
              </div>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Header */}
          <div className="search-bar">
          <img src={topUpImage} alt="Search Icon" className="search-image" />
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

          {/* News Sentiment Impact Section */}
          <div className="news-impact-section">
            <h2>News Sentiment Impact</h2>
            <input 
              type="text" 
              value={ticker} 
              onChange={(e) => setTicker(e.target.value)} 
              placeholder="Enter stock ticker..."
              className="search-input"
            />
            <button onClick={fetchNewsImpact} className="search-button">Check News Impact</button>
            
            {impact !== null && (
              <div className="impact-results">
                <h3>Predicted News Impact: {impact}%</h3>
                <ul>
                  {reasons.map((r, index) => (
                    <div className="impact-list" key={index}>
                      <strong>[{r.sentiment}]</strong> {r.reason}
                    </div>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default NewspaperSec;
