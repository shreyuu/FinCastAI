import { BarChart2 } from 'lucide-react';
import stockVideo from "./assets/video/Pinterest media.mp4";
import imageLogo from "./assets/photo/reliance.logo.webp";
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Header Bar */}
      <header className="w-full flex items-center justify-between px-16 py-6 bg-white shadow-md fixed top-0 left-0 z-30">
        <div className="flex items-center gap-4">
          <BarChart2 className="text-4xl text-primary" />
          <span className="text-3xl font-bold font-calibri text-primary">GoStock</span>
        </div>
        <nav className="flex gap-8">
          <button
            className="btn-secondary font-semibold"
            onClick={() => navigate('/login')}
          >
            Log in
          </button>
          <button
            className="btn-primary font-semibold"
            onClick={() => navigate('/about')}
          >
            Sign Up
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex flex-row items-center justify-center w-full h-screen pt-32">
        {/* Left: Animated Headline & Search */}
        <div className="flex flex-col justify-center items-start w-1/2 pl-24 relative">
          <h1 className="text-6xl font-extrabold text-gray-900 mb-6 leading-tight animate-fade-slide-up">
            Make Better <br />
            Investment <br />
            Decisions With <br />
            <span className="text-primary">Alternative Data.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 animate-fade-slide-up" style={{ animationDelay: '0.5s' }}>
            Get the inside scoop on companies like never before.
          </p>
          <div className="flex gap-4 w-full max-w-lg animate-fade-slide-up" style={{ animationDelay: '0.7s' }}>
            <input
              type="text"
              placeholder="Search for stocks (e.g. Reliance, TCS)..."
              className="input-field flex-1"
            />
            <button className="btn-primary px-8 py-2 font-semibold">Search</button>
          </div>
          {/* Featured Stock Card */}
          <div className="mt-12 relative w-96 h-40 bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col justify-center items-start p-6 animate-fade-slide-up" style={{ animationDelay: '1s' }}>
            <img src={imageLogo} alt="Reliance Logo" className="absolute left-4 top-4 w-16 h-16 rounded-full shadow" />
            <span className="ml-24 text-2xl font-bold">Reliance</span>
            <span className="ml-24 text-lg text-red-500 font-semibold">-1.03%</span>
            <div className="flex items-end gap-2 ml-24 mt-2">
              <span className="text-xl font-bold">₹1,253</span>
              <span className="text-sm text-gray-500">.65</span>
              <span className="ml-4 px-2 py-1 bg-red-100 text-red-600 rounded-lg text-sm">🔻-13.05</span>
            </div>
          </div>
        </div>

        {/* Right: Video & CTA */}
        <div className="flex flex-col items-center justify-center w-1/2 relative">
          <div className="w-96 h-96 rounded-3xl overflow-hidden shadow-xl animate-fade-slide-up" style={{ animationDelay: '1.2s' }}>
            <video width="100%" height="100%" autoPlay loop muted>
              <source src={stockVideo} type="video/mp4" />
            </video>
          </div>
          <div className="mt-8 text-center animate-fade-slide-up" style={{ animationDelay: '1.5s' }}>
            <h2 className="text-3xl font-bold text-primary mb-2">Join our investor community</h2>
            <p className="text-gray-700 mb-4">Share your investment journey and learn from others.</p>
            <button
              className="btn-primary px-8 py-3 font-semibold text-lg"
              onClick={() => navigate('/about')}
            >
              Get Started
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-6 bg-white text-center text-gray-500 absolute bottom-0 left-0 z-20 shadow-inner">
        &copy; {new Date().getFullYear()} Shreyash Meshram. All rights reserved.
      </footer>
    </div>
  );
}

export default HomePage;