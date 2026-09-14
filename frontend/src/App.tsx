import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import HomePage from "./HomePage.tsx";
import SignInPage from "./SignIn.tsx";
import SignUpForm from "./SignUpForm.tsx";
import StockPrediction from "./components/StockPrediction.tsx";
import StockAnalyzer from "./Indicator.tsx";
import NewspaperSec from "./news.tsx";
import Portfolio from "./Portfolio.tsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<SignUpForm />} />
        <Route path="/login" element={<SignInPage />} />
        <Route path="/dashBoard" element={<StockPrediction />} />
        <Route path="/news" element={<NewspaperSec />} />
        <Route path="/StockAnalyzer" element={<StockAnalyzer />} />
        <Route path="/portfolio" element={<Portfolio />} />
      </Routes>
    </Router>
  );
}

export default App;
