# Stock Market Analysis Platform

A full-stack web application that provides comprehensive stock market analysis using machine learning models, technical indicators, and financial sentiment analysis.

## 🚀 Features

- **Real-time Stock Data**: Access to live stock market data and historical prices
- **Technical Analysis**: Multiple technical indicators including moving averages, RSI, MACD, and more
- **Machine Learning Models**:
  - Support Vector Machine (SVM) for price prediction
  - FinBERT for financial sentiment analysis
- **Interactive Dashboard**: Clean, responsive React frontend for data visualization
- **RESTful API**: FastAPI backend with comprehensive endpoints

## 🏗️ Project Structure

```
├── backend/                 # FastAPI backend application
│   ├── app/
│   │   ├── main.py         # FastAPI application entry point
│   │   ├── models.py       # Database models
│   │   ├── indicators.py   # Technical indicators implementation
│   │   ├── FinBert.py      # Financial sentiment analysis
│   │   ├── svm.py          # Support Vector Machine model
│   │   ├── stock.py        # Stock data handling
│   │   └── EQUITY_L.csv    # Stock symbols dataset
│   └── requirements.txt    # Python dependencies
├── frontend/               # React + TypeScript frontend
│   ├── src/
│   │   ├── App.tsx         # Main application component
│   │   ├── HomePage.tsx    # Home page component
│   │   ├── Indicator.tsx   # Technical indicators component
│   │   └── *.css          # Styling files
│   ├── package.json        # Node.js dependencies
│   └── vite.config.ts      # Vite configuration
└── dataset/               # Data storage directory
```

## 🛠️ Tech Stack

### Backend

- **FastAPI**: Modern, fast web framework for building APIs
- **Python**: Core programming language
- **Pandas**: Data manipulation and analysis
- **NumPy**: Numerical computing
- **Scikit-learn**: Machine learning library
- **FinBERT**: Financial sentiment analysis model

### Frontend

- **React**: User interface library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Fast build tool and development server
- **CSS**: Custom styling

## 📋 Prerequisites

- Python 3.7 or higher
- Node.js 16 or higher
- npm or yarn package manager

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

4. **Run the FastAPI server:**

   ```bash
   cd app
   python main.py
   ```

   The API will be available at `http://localhost:8000`

   View API documentation at `http://localhost:8000/docs`

### Frontend Setup

1. **Navigate to the frontend directory:**

   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies:**

   ```bash
   npm install
   ```

3. **Start the development server:**

   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`

## 📊 API Endpoints

The FastAPI backend provides several endpoints for stock analysis:

- `GET /`: Health check endpoint
- `GET /stocks`: Get available stock symbols
- `GET /stock/{symbol}`: Get stock data for a specific symbol
- `GET /indicators/{symbol}`: Get technical indicators for a stock
- `POST /predict`: Get ML-based price predictions
- `POST /sentiment`: Analyze financial sentiment

Visit `http://localhost:8000/docs` for interactive API documentation.

## 🔧 Available Scripts

### Backend

```bash
# Run the FastAPI server
python main.py

# Install dependencies
pip install -r requirements.txt
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

- Simple Moving Average (SMA)
- Exponential Moving Average (EMA)
- Relative Strength Index (RSI)
- Moving Average Convergence Divergence (MACD)
- Bollinger Bands
- Volume indicators

### Machine Learning Models

- **SVM Model**: Predicts stock price movements using historical data
- **FinBERT**: Analyzes financial news sentiment to gauge market sentiment

### Data Sources

- Real-time stock price data
- Historical trading data
- Financial news for sentiment analysis
- Technical indicator calculations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ⚠️ Disclaimer

This application is for educational and research purposes only. It should not be used as the sole basis for investment decisions. Always consult with a qualified financial advisor before making investment decisions.

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use**: Change the port in the configuration files
2. **Python dependencies**: Ensure you're using the correct Python version
3. **Node modules**: Try deleting `node_modules` and running `npm install` again

### Getting Help

- Check the [Issues](../../issues) page for known problems
- Create a new issue if you encounter bugs
- Review the API documentation at `/docs` endpoint

## 🔮 Future Enhancements

- [ ] Real-time data streaming
- [ ] More ML models (LSTM, Random Forest)
- [ ] Portfolio management features
- [ ] Mobile app development
- [ ] Advanced charting capabilities
- [ ] User authentication and personalization
