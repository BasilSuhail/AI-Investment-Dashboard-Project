# Quick Start Guide - CFO's Cockpit

## Phase 1 Complete! 🎉

Your portfolio optimization dashboard is ready to run. Here's how to start it:

## Starting the Application

### Terminal 1: Backend Server

```bash
cd "AI Investment Dashboard Project "
source venv/bin/activate
cd backend
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

**API Docs**: Open [http://localhost:8000/docs](http://localhost:8000/docs) to see Swagger UI

### Terminal 2: Frontend Server

```bash
cd "AI Investment Dashboard Project "
cd frontend
python -m http.server 3000
```

**Expected output:**
```
Serving HTTP on 0.0.0.0 port 3000 (http://0.0.0.0:3000/) ...
```

**Dashboard**: Open [http://localhost:3000](http://localhost:3000) in your browser

## Using the Dashboard

1. **Select Tickers**: Hold Cmd/Ctrl and click to select multiple stocks (minimum 2)
2. **Set Investment**: Enter your total investment amount (e.g., $100,000)
3. **Choose Date**: Select start date for historical data (1+ year recommended)
4. **Click Refresh**: Wait 5-10 seconds for optimization to complete

## What You'll See

✅ **Efficient Frontier Chart**: Interactive scatter plot showing:
   - Grey dots: 5,000 simulated random portfolios
   - Gold star ⭐: Optimal portfolio (Maximum Sharpe Ratio)
   - Blue diamond 🔷: Minimum volatility portfolio

✅ **Portfolio Allocation**: Donut chart showing optimal percentage breakdown

✅ **Performance Metrics**:
   - Expected Annual Return
   - Annual Volatility (Risk)
   - Sharpe Ratio

✅ **Raw Market Data**: Historical prices table

## Architecture

- **Backend**: FastAPI REST API (Python 3.11)
  - Portfolio optimization using PyPortfolioOpt
  - Market data from yfinance
  - CAPM expected returns
  - Ledoit-Wolf Shrinkage covariance

- **Frontend**: HTML/CSS/JavaScript
  - Bootstrap 5 responsive UI
  - Plotly.js interactive charts
  - Vanilla JavaScript (no framework)

- **Database**: Supabase (Optional - not required for Phase 1)

## Troubleshooting

### Backend won't start
- **Error**: `ModuleNotFoundError`
  - **Fix**: Run `pip install -r backend/requirements.txt` from venv

### Frontend can't connect
- **Error**: "Unable to connect to server"
  - **Fix**: Ensure backend is running on port 8000
  - Check: `curl http://localhost:8000/health`

### Charts not displaying
- **Error**: Blank chart areas
  - **Fix**: Open browser console (F12) to see errors
  - Check: Plotly.js CDN is accessible
  - Verify: Backend API responses in Network tab

## API Testing

Test the backend independently:

**1. Health Check**
```bash
curl http://localhost:8000/health
```

**2. Fetch Stock Data**
```bash
curl "http://localhost:8000/api/stocks/historical?tickers=AAPL,MSFT&start_date=2023-01-01"
```

**3. Optimize Portfolio**
```bash
curl -X POST http://localhost:8000/api/portfolio/optimize \
  -H "Content-Type: application/json" \
  -d '{
    "tickers": ["AAPL", "MSFT", "TSLA"],
    "start_date": "2023-01-01",
    "investment_amount": 100000,
    "optimization_type": "max_sharpe"
  }'
```

## Next Steps

1. **Test the app**: Try different ticker combinations
2. **Explore API docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
3. **Setup Supabase** (Optional): Follow [supabase/SETUP.md](supabase/SETUP.md)
4. **Add features**: See [roadmap_optimized.md](roadmap_optimized.md) for Phase 2-5

## Stop the Application

**Terminal 1 (Backend)**: Press `Ctrl+C`
**Terminal 2 (Frontend)**: Press `Ctrl+C`

Then deactivate venv:
```bash
deactivate
```

## Project Structure

```
AI Investment Dashboard Project/
├── backend/               # FastAPI server
│   ├── main.py           # App entry point
│   ├── api/              # API endpoints
│   └── services/         # Business logic
├── frontend/             # Web dashboard
│   ├── index.html        # Main page
│   ├── css/styles.css    # Styling
│   └── js/               # Application logic
├── supabase/             # Database (optional)
└── venv/                 # Python environment
```

## Tech Stack

- **FastAPI** - Modern Python web framework
- **yfinance** - Yahoo Finance API
- **PyPortfolioOpt** - Portfolio optimization
- **Plotly.js** - Interactive charts
- **Bootstrap 5** - Responsive UI

---

Built with FastAPI | Data from Yahoo Finance | Powered by PyPortfolioOpt
