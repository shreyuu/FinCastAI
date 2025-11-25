# FinCastAI - Stock Market Analysis Platform

A full-stack web application that provides comprehensive stock market analysis using machine learning models, technical indicators, and financial sentiment analysis powered by FinBERT.

## 🚀 Features

- **Real-time Stock Data**: Access live stock market data and historical prices for Indian stocks (NSE)
- **Technical Analysis**: Multiple technical indicators including EMA, RSI, MACD, Bollinger Bands, and OBV
- **Machine Learning Models**:
  - Support Vector Regression (SVR) for price prediction
  - Support Vector Classification (SVC) for price direction
  - FinBERT for financial sentiment analysis from news articles
- **News Sentiment Analysis**: Real-time news impact assessment on stock prices
- **Interactive Dashboard**: Clean, responsive React frontend with real-time charts
- **Portfolio Management**: Track your investments and P/L
- **RESTful API**: FastAPI backend with comprehensive endpoints
- **User Authentication**: Secure login and signup functionality

## 🏗️ Project Structure

```
FinCastAI/
├── backend/                    # FastAPI backend application
│   ├── app/
│   │   ├── __init__.py        # FastAPI app initialization
│   │   ├── main.py            # Main API endpoints
│   │   ├── config.py          # Centralized configuration
│   │   ├── models.py          # Pydantic models
│   │   ├── indicators.py      # Technical indicators implementation
│   │   ├── FinBert.py         # Financial sentiment analysis
│   │   ├── svm.py             # SVM model implementation
│   │   └── EQUITY_L.csv       # Stock symbols dataset
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables
├── frontend/                   # React + TypeScript frontend
│   ├── src/
│   │   ├── App.tsx            # Main application component
│   │   ├── HomePage.tsx       # Landing page
│   │   ├── SignIn.tsx         # Login page
│   │   ├── SignUpForm.tsx     # Registration page
│   │   ├── Portfolio.tsx      # Portfolio management
│   │   ├── Indicator.tsx      # Technical indicators view
│   │   ├── news.tsx           # News sentiment analysis
│   │   ├── components/
│   │   │   ├── StockPrediction.tsx  # Main dashboard
│   │   │   └── Sidebar.tsx    # Navigation sidebar
│   │   └── services/
│   │       └── api.ts         # API client
│   ├── package.json           # Node.js dependencies
│   ├── vite.config.ts         # Vite configuration
│   └── tailwind.config.js     # Tailwind CSS configuration
└── server/                     # Node.js authentication server
    ├── src/
    │   ├── server.ts          # Express server with MySQL
    │   └── db/
    │       └── connection.ts  # Database connection
    └── package.json           # Node dependencies
```

## 🛠️ Tech Stack

### Backend

- **FastAPI**: Modern, fast web framework for building APIs
- **Python 3.7+**: Core programming language
- **Pandas & NumPy**: Data manipulation and numerical computing
- **Scikit-learn**: Machine learning library (SVR, SVC, StandardScaler)
- **Transformers**: State-of-the-art machine learning for NLP
- **Torch**: Tensor library for deep learning, required by Transformers
- **FinBERT**: Pre-trained financial sentiment analysis model (`yiyanghkust/finbert-tone`)
- **yfinance**: Yahoo Finance API for stock data
- **ta**: Technical analysis library
- **requests**: HTTP library for making API calls
- **python-dotenv**: Environment variable management
- **NewsData.io API**: Real-time news fetching

### Frontend

- **React 19**: User interface library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework
- **@mui/material**: Material UI component library
- **lucide-react**: Icon library
- **Recharts**: Charting library for data visualization
- **Axios**: HTTP client for API requests
- **React Router**: Client-side routing

### Server

- **Node.js + Express**: Authentication server
- **TypeScript**: Type-safe backend
- **MySQL**: User database
- **bcryptjs**: Library for hashing passwords
- **body-parser**: Node.js body parsing middleware
- **cors**: Middleware for enabling Cross-Origin Resource Sharing
- **dotenv**: Environment variable management

## 📋 Prerequisites

- Python 3.7 or higher
- Node.js 16 or higher
- npm or yarn package manager
- MySQL database (for user authentication)

## 🚀 Getting Started

### Backend Setup

1. **Navigate to the backend directory:**

   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**

   ```bash
   python -m venv stockenv

   # On Windows
   stockenv\Scripts\activate

   # On macOS/Linux
   source stockenv/bin/activate
   ```

3. **Install Python dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**

   Create a `.env` file in the `backend` directory:

   ```env
   NEWS_API_KEY=your_newsdata_io_api_key
   FINBERT_MODEL=yiyanghkust/finbert-tone
   HOST=0.0.0.0
   PORT=8000
   DEBUG=True
   ```

5. **Run the FastAPI server:**

   ```bash
   cd app
   python main.py
   ```

   The API will be available at `http://localhost:8000`

   View API documentation at `http://localhost:8000/docs`

### Server Setup (Authentication)

1. **Navigate to the server directory:**

   ```bash
   cd server
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the `server` directory with your MySQL credentials:

   ```env
   DB_HOST=localhost
   DB_USER=your_mysql_user
   DB_PASSWORD=your_mysql_password
   DB_NAME=your_database_name
   ```

4. **Run the authentication server:**

   ```bash
   npm start
   ```

   The server will be available at `http://localhost:3001`

### Frontend Setup

1. **Navigate to the frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env` file in the `frontend` directory:

   ```env
   VITE_API_URL=http://localhost:8000
   VITE_AUTH_URL=http://localhost:3001
   ```

4. **Start the development server:**

   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`

## 📊 API Endpoints

### Stock Analysis

- `POST /predict`: Get stock price predictions with sentiment analysis

  - Body: `{ ticker, start_date, end_date, forecast_out }`
  - Returns historical prices, predictions, and sentiment score

- `POST /Indicotor`: Get technical indicators and trade recommendations

  - Body: `{ company, ticker, owned_stock }`
  - Returns RSI, EMA, MACD, Bollinger Bands, OBV, and trade decision

- `GET /stock-prices`: Get current prices for predefined stocks

  - Returns list of stocks with current price and percent change

- `GET /news-impact/{company}`: Analyze news sentiment impact
  - Returns impact percentage and news reasons

### Authentication

- `POST /users`: Create new user account

  - Body: `{ name, email, password, dob, gender }`

- `POST /users/login`: User login
  - Body: `{ email, password }`
  - Returns user data and session

Visit `http://localhost:8000/docs` for interactive API documentation.

## 🔧 Available Scripts

### Backend

```bash
# Run the FastAPI server
python main.py

# Install dependencies
pip install -r requirements.txt
```

### Server

```bash
# Start authentication server
npm start

# Install dependencies
npm install
```

### Frontend

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## 📈 Features in Detail

### Technical Indicators

- **EMA (Exponential Moving Average)**: 20-day window
- **RSI (Relative Strength Index)**: 14-day window
- **MACD (Moving Average Convergence Divergence)**: Trend indicator
- **Bollinger Bands**: Volatility indicator with upper, middle, and lower bands
- **OBV (On-Balance Volume)**: Volume-based momentum indicator

### Machine Learning Models

- **SVR Model**: Support Vector Regression for price prediction using:

  - Historical OHLCV data
  - Technical indicators
  - News sentiment scores
  - Hyperparameter tuning with GridSearchCV

- **SVC Model**: Support Vector Classification for price direction

- **FinBERT Sentiment**: Financial sentiment analysis with:
  - Positive/Negative/Neutral classification
  - Sentiment score scaling
  - News impact estimation

### Data Sources

- **Yahoo Finance**: Real-time and historical stock data
- **NewsData.io**: Latest financial news articles
- **Technical Indicators**: Calculated using `ta` library
- **Indian Stock Market**: Focus on NSE-listed stocks

### Stock Dashboard Features

- Real-time price updates with percentage change
- Interactive price prediction charts with zoom levels (All Time, Year, Month, Week)
- Historical vs. Predicted price visualization
- Top movers display
- Portfolio value tracking
- News sentiment integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This application is for educational and research purposes only. It should not be used as the sole basis for investment decisions. Stock market predictions are inherently uncertain and past performance does not guarantee future results. Always consult with a qualified financial advisor before making investment decisions.

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**:

   - Backend: Change `PORT` in `backend/app/config.py`
   - Server: Change port in `server/src/server.ts`
   - Frontend: Change port in `vite.config.ts`

2. **Python dependencies**:

   - Ensure you're using Python 3.7+
   - Try: `pip install --upgrade pip` before installing requirements

3. **Node modules**:

   - Delete `node_modules` and `package-lock.json`
   - Run `npm install` again

4. **MySQL connection errors**:

   - Verify MySQL is running
   - Check database credentials in `server/.env`
   - Ensure database exists

5. **News API rate limits**:

   - NewsData.io has rate limits on free tier
   - Consider caching results

6. **Model loading issues**:
   - First run downloads FinBERT model (~440MB)
   - Ensure stable internet connection

### Getting Help

- Check the [Issues](../../issues) page for known problems
- Create a new issue if you encounter bugs
- Review the API documentation at `/docs` endpoint

## 🔮 Future Enhancements

- [ ] Real-time WebSocket data streaming
- [ ] More ML models (LSTM, Random Forest, XGBoost)
- [ ] Advanced portfolio analytics and recommendations
- [ ] Mobile app development (React Native)
- [ ] Advanced charting with candlestick patterns
- [ ] Stock screener with custom filters
- [ ] Alerts and notifications system
- [ ] Social features (share insights, follow traders)
- [ ] Backtesting functionality
- [ ] Options trading analysis
- [ ] Multi-currency support
- [ ] Dark mode theme

## 👨‍💻 Author

**Shreyash Meshram**

---

Made with ❤️ for smarter investment decisions
