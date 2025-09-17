import { useEffect, useState } from "react";
import { Bell, Mail, ChevronDown } from 'lucide-react';
// Update the import path to match the actual Sidebar location
import Sidebar from './components/Sidebar';
import topUpImage from './assets/photo/topUp.png';
import './newImpact.css'

function NewspaperSec() {
  // Removed unused 'navigate'
  const [ticker, setTicker] = useState("");
  const [impact, setImpact] = useState<number | null>(null);
  const [reasons, setReasons] = useState<{ sentiment: string; reason: string }[]>([]);
  const [userName, setUserName] = useState<string>("");
  
    useEffect(() => {
      // Example: Retrieve user info from localStorage after login
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user && user.name) {
        setUserName(user.name);
      }
    }, []);

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
        <Sidebar />
        
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
                <span>{userName || "Guest"}</span>
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
