import { useState } from "react";
import { Loader2 } from "lucide-react";
import Sidebar from "./components/Sidebar";
import { backendUrl } from "./services/api";

interface NewsReason {
  sentiment: string;
  reason: string;
}

function NewspaperSec() {
  const [company, setCompany] = useState("");
  const [impact, setImpact] = useState<number | null>(null);
  const [reasons, setReasons] = useState<NewsReason[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNewsImpact = async () => {
    if (!company.trim()) return;
    setLoading(true);
    setImpact(null);
    setReasons([]);
    try {
      const response = await fetch(backendUrl(`/news-impact/${encodeURIComponent(company)}`));
      if (!response.ok) {
        const body = await response.json().catch(() => null);
        setReasons([
          {
            sentiment: "Neutral",
            reason: body?.detail ?? `Request failed (${response.status}).`,
          },
        ]);
        return;
      }
      const data = await response.json();
      setImpact(data.impact);
      setReasons(
        (data.reasons || []).map((reasonText: string) => ({
          sentiment: reasonText.includes("Positive")
            ? "Positive"
            : reasonText.includes("Negative")
            ? "Negative"
            : "Neutral",
          reason: reasonText,
        }))
      );
    } catch {
      setImpact(null);
      setReasons([
        {
          sentiment: "Neutral",
          reason: "Could not reach the news service. Is the backend running?",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-black flex flex-row w-screen h-screen overflow-hidden bg-secondary">
      <Sidebar />
      <div className="h-screen w-5/6 flex flex-col overflow-y-scroll bg-secondary border-none">

        {/* News Sentiment Impact Section */}
        <div className="p-8 bg-white m-6 rounded-xl shadow-lg max-auto mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-primary text-center">News Sentiment Impact</h2>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Company Name (e.g. Reliance)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              aria-label="Company Name"
            />
            <button
              onClick={fetchNewsImpact}
              className="px-6 py-2 bg-primary text-black rounded-lg hover:bg-opacity-90 transition-colors font-semibold"
              disabled={loading}
              aria-busy={loading}>
              {loading ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : "Check News Impact"}
            </button>
          </div>

          {impact !== null && (
            <div className="mt-6 p-6 bg-blue-50 rounded-xl shadow text-center">
              <h3 className="text-2xl font-bold mb-2 text-primary">Predicted News Impact</h3>
              <div
                className={`text-4xl font-extrabold mb-2 ${
                  impact > 0 ? "text-green-600" : impact < 0 ? "text-red-600" : "text-gray-700"
                }`}>
                {impact > 0 ? "+" : ""}
                {impact}%
              </div>
              <div className="text-gray-600 mb-4">
                {impact > 0
                  ? "Positive sentiment detected in recent news."
                  : impact < 0
                  ? "Negative sentiment detected in recent news."
                  : "Neutral sentiment detected."}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {reasons.map((r, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg shadow border-l-4 ${
                      r.sentiment === "Positive"
                        ? "border-green-500 bg-green-50"
                        : r.sentiment === "Negative"
                        ? "border-red-500 bg-red-50"
                        : "border-gray-400 bg-gray-50"
                    }`}>
                    <strong
                      className={`block mb-2 ${
                        r.sentiment === "Positive"
                          ? "text-green-600"
                          : r.sentiment === "Negative"
                          ? "text-red-600"
                          : "text-gray-600"
                      }`}>
                      {r.sentiment}
                    </strong>
                    <span className="text-sm">{r.reason}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {impact === null && !loading && (
            <div className="mt-6 text-center text-gray-500">Enter a company and ticker to see news impact.</div>
          )}

          {loading && (
            <div className="grid gap-4">
              <div className="skeleton card" />
              <div className="skeleton card" />
              <div className="skeleton card" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NewspaperSec;
