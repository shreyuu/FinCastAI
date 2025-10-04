import { useEffect, useState } from "react";
import { Bell, Mail, ChevronDown } from "lucide-react";
// Update the import path to match the actual Sidebar location
import Sidebar from "./components/Sidebar";
import topUpImage from "./assets/photo/topUp.png";

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
      setReasons(
        data.reasons.map((reasonText: string) => ({
          sentiment: reasonText.includes("Positive")
            ? "Positive"
            : reasonText.includes("Negative")
            ? "Negative"
            : "Neutral",
          reason: reasonText,
        }))
      );
    } catch (error) {
      console.error("Error fetching news impact:", error);
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
            <img src={topUpImage} alt="Search Icon" className="w-8 h-8" />
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

          {/* News Sentiment Impact Section */}
          <div className="p-6 bg-white m-4 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6">News Sentiment Impact</h2>
            <div className="flex space-x-4 mb-6">
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                placeholder="Enter stock ticker..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                onClick={fetchNewsImpact}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 transition-colors">
                Check News Impact
              </button>
            </div>

            {impact !== null && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-center">Predicted News Impact: {impact}%</h3>
                <div className="space-y-3">
                  {reasons.map((r, index) => (
                    <div key={index} className="p-3 bg-white rounded-lg border-l-4 border-primary">
                      <strong
                        className={`${
                          r.sentiment === "Positive"
                            ? "text-green-600"
                            : r.sentiment === "Negative"
                            ? "text-red-600"
                            : "text-gray-600"
                        }`}>
                        [{r.sentiment}]
                      </strong>{" "}
                      {r.reason}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default NewspaperSec;
