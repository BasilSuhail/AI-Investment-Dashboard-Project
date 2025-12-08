# AI Investment Portfolio Optimizer

> A production-ready portfolio optimization dashboard using Modern Portfolio Theory (Markowitz) to maximize risk-adjusted returns.

**Live Demo**: [Portfolio Optimizer](https://github.com/yourusername/ai-portfolio-optimizer) | **Built by**: Senior Developer | **Status**: Production Ready ✅

---

## Features

- 📊 **Real-time Stock Data** - Live market prices from Yahoo Finance API
- 🎯 **Efficient Frontier Visualization** - Interactive charts showing optimal portfolios
- 📈 **S&P 500 Benchmark Comparison** - See if your portfolio beats the market
- 💼 **Export Functionality** - Download allocations (CSV) and performance reports (TXT)
- 🌓 **Light/Dark Theme** - Elegant UI with theme persistence
- 📱 **Fully Responsive** - Works on desktop, tablet, and mobile
- ⚡ **Fast Performance** - FastAPI backend with intelligent caching
- 📚 **Educational Tooltips** - Explains financial terms for non-technical users

---

## Why This Tool?

Every portfolio needs to answer one question: **"Does this beat just buying an index fund?"**

This dashboard uses Nobel Prize-winning mathematics (Modern Portfolio Theory) to find the optimal stock allocations for your risk tolerance. Unlike basic trackers that just show what you own, this calculates **what you should own** based on:

- Expected returns (CAPM)
- Risk modeling (Covariance Matrix with Ledoit-Wolf Shrinkage)
- Efficient Frontier optimization (Max Sharpe Ratio)

**The result?** A mathematically optimal portfolio that a CFO would actually trust.

---

## Quick Start

### Prerequisites
- Python 3.11+
- Modern web browser
- Internet connection (for market data)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/ai-portfolio-optimizer.git
cd ai-portfolio-optimizer

# Install dependencies
cd backend
pip install -r requirements.txt
```

### Running the Application

**1. Start Backend Server**
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**2. Start Frontend Server**
```bash
cd frontend
python -m http.server 8080
```

**3. Open Browser**
```
http://localhost:8080
```

That's it! The dashboard will load with 5 default tech stocks. Try optimizing, comparing to S&P 500, and exporting reports.

---

## How to Use

### Basic Workflow

1. **Select Stocks** - Click "+ Add Stock" to choose from popular tickers
2. **Set Investment Amount** - Enter your total investment (e.g., $100,000)
3. **Choose Time Horizon** - Pick 1Y, 2Y, 5Y, or custom date range
4. **Select Risk Tolerance** - Conservative, Moderate, or Aggressive
5. **Enable S&P 500 Comparison** - See if you beat the market
6. **Click "Optimize Portfolio"** - Watch the magic happen

### Understanding the Results

**Metrics Cards:**
- **Best Stock** - Top performer with gain percentage
- **Worst Stock** - Weakest performer with loss percentage
- **Expected Return** - Projected annual return (hover tooltip for explanation)
- **Sharpe Ratio** - Risk-adjusted return (hover tooltip for explanation)
- **vs S&P 500** - Your outperformance vs benchmark (hover tooltip for explanation)

**Charts:**
- **Normalized Price Performance** - Compare stock movements starting from same baseline
- **Portfolio Growth** - See how your optimized portfolio would have grown
- **Efficient Frontier** - Optimal portfolios for each risk level (star = your portfolio)
- **Portfolio Allocation** - Recommended percentage breakdown
- **Correlation Matrix** - How stocks move together (hover tooltip for explanation)

**Export:**
- **CSV** - Spreadsheet-compatible allocation data
- **TXT** - Professional performance report for advisors

---

## Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PyPortfolioOpt** - Portfolio optimization library
- **yfinance** - Yahoo Finance market data
- **Pandas & NumPy** - Data processing
- **Pydantic** - Request/response validation

### Frontend
- **Vanilla JavaScript** - No framework bloat
- **Plotly.js** - Interactive financial charts
- **Custom CSS** - Ultra-clean minimalist design
- **LocalStorage** - Theme persistence

### Mathematics
- **Modern Portfolio Theory** - Markowitz mean-variance optimization
- **CAPM** - Capital Asset Pricing Model for expected returns
- **Ledoit-Wolf Shrinkage** - Robust covariance estimation
- **Sharpe Ratio** - Risk-adjusted performance measure

---

## Project Structure

```
ai-portfolio-optimizer/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── api/
│   │   ├── stocks.py           # Stock data endpoints
│   │   └── portfolio.py        # Optimization endpoints
│   ├── services/
│   │   ├── data_fetcher.py     # Market data fetching
│   │   └── optimizer.py        # Portfolio optimization logic
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── index.html              # Main dashboard
│   ├── css/
│   │   └── styles.css          # Custom styling
│   └── js/
│       ├── api.js              # API communication
│       ├── charts.js           # Chart rendering
│       └── app.js              # Application logic
└── README.md                   # This file
```

---

## API Reference

### GET `/api/stocks/historical`
Fetch historical stock data

**Query Parameters:**
- `tickers` (string): Comma-separated ticker symbols (e.g., "AAPL,MSFT,TSLA")
- `start_date` (string): Start date in YYYY-MM-DD format
- `end_date` (string, optional): End date (defaults to today)

**Example:**
```bash
curl "http://localhost:8000/api/stocks/historical?tickers=AAPL,MSFT&start_date=2023-01-01"
```

### POST `/api/portfolio/efficient-frontier`
Generate efficient frontier and optimal portfolios

**Request Body:**
```json
{
  "tickers": ["AAPL", "MSFT", "GOOGL"],
  "start_date": "2023-01-01",
  "investment_amount": 100000,
  "optimization_type": "max_sharpe",
  "compare_sp500": true
}
```

**Response:**
```json
{
  "simulated_portfolios": { /* 5000 random portfolios */ },
  "optimal_portfolios": {
    "max_sharpe": { /* weights, allocations, performance */ },
    "min_volatility": { /* weights, allocations, performance */ }
  },
  "benchmark": {
    "total_return": 0.121,
    "annualized_return": 0.115,
    "volatility": 0.18,
    "outperformance": 0.062
  }
}
```

**Full API Documentation:** Visit `http://localhost:8000/docs` after starting the backend.

---

## Use Cases

- **Portfolio Managers** - Analyze client allocations and compare strategies
- **Individual Investors** - Optimize retirement accounts and taxable portfolios
- **Financial Advisors** - Generate professional reports for clients
- **Students** - Learn Modern Portfolio Theory with real data
- **CFOs** - Make data-driven investment decisions

---

## Troubleshooting

### Common Issues

**"Unable to connect to server"**
- Ensure backend is running on port 8000
- Check that frontend is accessing correct API URL
- Verify CORS is enabled in backend

**"Portfolio optimization failed"**
- Ensure at least 2 stocks are selected
- Use time periods with sufficient data (6+ months recommended)
- Some stock combinations may fail with mock data (known limitation)

**Charts not rendering**
- Check browser console for JavaScript errors
- Ensure Plotly.js CDN is accessible
- Verify API responses in Network tab

**Export buttons not showing**
- Export buttons appear only after successful optimization
- Check that optimization completed without errors

---

## Roadmap

**Completed ✅**
- S&P 500 benchmark comparison
- CSV/TXT export functionality
- Educational tooltips
- Professional README

**Coming Soon 🚀**
- Deployment to Vercel/Render
- Save/load portfolios to database
- Risk analysis section (VaR, Max Drawdown)
- Sector allocation view
- AI-powered insights (Claude API)

---

## Disclaimer

This tool is for **educational purposes only**. Past performance does not guarantee future results. Always consult a licensed financial advisor before making investment decisions.

---

## License

MIT License - Free for personal and commercial use

---

## The Elevator Pitch

> "I built a portfolio optimization engine that uses Modern Portfolio Theory - the same math that won a Nobel Prize - to find optimal stock allocations for any investment amount. It pulls real-time market data, calculates thousands of portfolio combinations, and shows the efficient frontier - the best possible risk/return tradeoffs. The key insight is it compares your optimized portfolio to the S&P 500, so you can see if active management actually adds value. It's built with FastAPI and vanilla JavaScript - no frameworks, no bloat - just clean, fast, production-ready code."

---

**Built with FastAPI, PyPortfolioOpt, and Plotly.js** | **Data from Yahoo Finance** | **MIT License**
