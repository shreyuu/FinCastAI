import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";

interface PortfolioStock {
  name: string;
  ticker: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
}

const mockPortfolio: PortfolioStock[] = [
  { name: "Reliance Industries", ticker: "RELIANCE.NS", quantity: 10, avgPrice: 2500, currentPrice: 2650 },
  { name: "TCS", ticker: "TCS.NS", quantity: 5, avgPrice: 3200, currentPrice: 3300 },
  { name: "HDFC Bank", ticker: "HDFCBANK.NS", quantity: 8, avgPrice: 1500, currentPrice: 1480 },
];

function Portfolio() {
  const [portfolio, setPortfolio] = useState<PortfolioStock[]>([]);

  useEffect(() => {
    // Replace with API call if backend is ready
    setPortfolio(mockPortfolio);
  }, []);

  const totalInvestment = portfolio.reduce((sum, stock) => sum + stock.avgPrice * stock.quantity, 0);
  const currentValue = portfolio.reduce((sum, stock) => sum + stock.currentPrice * stock.quantity, 0);
  const profitLoss = currentValue - totalInvestment;
  const profitLossPercent = totalInvestment ? ((profitLoss / totalInvestment) * 100).toFixed(2) : "0.00";

  return (
    <div className="text-black flex flex-row w-screen h-screen overflow-hidden bg-secondary">
      <Sidebar />
      <div className="h-screen w-5/6 flex flex-col overflow-y-scroll bg-secondary border-none p-8">
        <h1 className="text-3xl font-bold mb-6 text-primary">My Portfolio</h1>
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-3xl mb-8">
          <div className="flex justify-between mb-6">
            <div>
              <div className="text-gray-600">Total Investment</div>
              <div className="text-2xl font-bold">₹{totalInvestment.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-gray-600">Current Value</div>
              <div className="text-2xl font-bold">₹{currentValue.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-gray-600">P/L</div>
              <div className={`text-2xl font-bold ${profitLoss >= 0 ? "text-green-600" : "text-red-600"}`}>
                {profitLoss >= 0 ? "+" : ""}₹{profitLoss.toFixed(2)} ({profitLossPercent}%)
              </div>
            </div>
          </div>
          <table className="w-full text-left border">
            <thead>
              <tr className="bg-blue-50">
                <th className="p-2">Stock</th>
                <th className="p-2">Ticker</th>
                <th className="p-2">Quantity</th>
                <th className="p-2">Avg. Price</th>
                <th className="p-2">Current Price</th>
                <th className="p-2">P/L</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.map((stock) => {
                const stockPL = (stock.currentPrice - stock.avgPrice) * stock.quantity;
                return (
                  <tr key={stock.ticker} className="border-t">
                    <td className="p-2">{stock.name}</td>
                    <td className="p-2">{stock.ticker}</td>
                    <td className="p-2">{stock.quantity}</td>
                    <td className="p-2">₹{stock.avgPrice.toFixed(2)}</td>
                    <td className="p-2">₹{stock.currentPrice.toFixed(2)}</td>
                    <td className={`p-2 font-semibold ${stockPL >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {stockPL >= 0 ? "+" : ""}₹{stockPL.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Portfolio;
