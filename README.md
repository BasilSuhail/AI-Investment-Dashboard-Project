# CFO's Cockpit - AI Investment Dashboard

Real-Time Portfolio Optimization Engine powered by Modern Portfolio Theory

## Architecture

**Modern Web Stack:**
- **Backend**: FastAPI (Python) - REST API serving portfolio optimization
- **Frontend**: HTML/CSS/JavaScript with Plotly.js for interactive charts
- **Database**: Supabase (PostgreSQL) - for caching and data persistence
- **Optimization**: PyPortfolioOpt with CAPM & Ledoit-Wolf Shrinkage

## Quick Start

### Prerequisites
- Python 3.11
- Modern web browser
- Internet connection (for yfinance API)

### 1. Install Backend Dependencies

```bash
# Activate virtual environment
source venv/bin/activate

# Install backend dependencies
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment (Optional but Recommended)

For Supabase caching support:

1. Create a Supabase account at [https://supabase.com](https://supabase.com)
2. Follow instructions in [supabase/SETUP.md](supabase/SETUP.md)
3. Create `backend/.env` file with your credentials:
   ```
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_KEY=your-service-role-key-here
   ```

**Note**: The app will work without Supabase but won't cache data.

### 3. Start Backend Server

```bash
# From backend directory
cd backend
source ../venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

**API Documentation**: [http://localhost:8000/docs](http://localhost:8000/docs)

### 4. Start Frontend

**Option A: Simple HTTP Server (Recommended)**
```bash
# From frontend directory
cd frontend
python -m http.server 3000
```

Open browser to: [http://localhost:3000](http://localhost:3000)

**Option B: Direct File Access**
```bash
# From frontend directory
open index.html
```
(Or just double-click `frontend/index.html`)

## What You'll See

**Phase 1 Complete!** Full-stack application with:

### Backend (FastAPI)
- ✅ `/api/stocks/historical` - Fetch market data
- ✅ `/api/portfolio/optimize` - Optimize portfolio
- ✅ `/api/portfolio/efficient-frontier` - Generate frontier data
- ✅ Auto-generated API docs at `/docs`
- ✅ CORS enabled for frontend communication

### Frontend (Interactive Dashboard)
- ✅ Portfolio configuration sidebar
- ✅ Ticker selection (default: AAPL, MSFT, TSLA, GOOGL, AMZN)
- ✅ Investment amount input
- ✅ Date range picker
- ✅ Interactive Efficient Frontier chart (Plotly.js)
- ✅ Portfolio allocation donut chart
- ✅ Performance metrics display
- ✅ Raw market data table
- ✅ Loading states and error handling

### Database (Supabase - Optional)
- ✅ Market data cache table
- ✅ Portfolio storage table
- ✅ Optimization results cache
- ✅ Automatic cache expiration

## Project Structure

```
AI Investment Dashboard Project/
├── backend/
│   ├── main.py                 # FastAPI app entry point
│   ├── api/
│   │   ├── stocks.py           # Stock data endpoints
│   │   └── portfolio.py        # Portfolio optimization endpoints
│   ├── services/
│   │   ├── data_fetcher.py     # yfinance integration
│   │   └── optimizer.py        # PyPortfolioOpt logic
│   ├── requirements.txt        # Backend dependencies
│   └── .env.example            # Environment template
├── frontend/
│   ├── index.html              # Main dashboard
│   ├── css/
│   │   └── styles.css          # Custom styles
│   └── js/
│       ├── api.js              # API communication
│       ├── charts.js           # Chart rendering
│       └── app.js              # Main application logic
├── supabase/
│   ├── schema.sql              # Database schema
│   └── SETUP.md                # Supabase setup guide
├── venv/                       # Virtual environment
├── roadmap_optimized.md        # Master implementation guide
└── README.md                   # This file
```

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **yfinance**: Yahoo Finance market data
- **PyPortfolioOpt**: Portfolio optimization
- **Pandas & NumPy**: Data processing
- **Supabase**: Database client (optional)

### Frontend
- **HTML5/CSS3**: Structure and styling
- **Bootstrap 5**: Responsive UI framework
- **Vanilla JavaScript**: Application logic
- **Plotly.js**: Interactive charts
- **Fetch API**: Backend communication

## Next Steps

Follow the [roadmap_optimized.md](roadmap_optimized.md) to add advanced features:

- **Phase 2**: Supabase Integration (caching implemented)
- **Phase 3**: Frontend Polish (completed)
- **Phase 4**: Advanced Features
  - Risk tolerance slider
  - Portfolio constraints
  - Export functionality (CSV/TXT)
- **Phase 5**: Error Handling & Performance
  - Enhanced error messages
  - Multi-level caching
  - Loading optimizations

## Usage Guide

### Basic Workflow

1. **Select Tickers**: Hold Ctrl/Cmd and click to select multiple stocks
2. **Set Investment Amount**: Enter your total investment (minimum $1,000)
3. **Choose Start Date**: Pick a date for historical data (1+ year recommended)
4. **Click Refresh**: The app will:
   - Fetch historical market data
   - Calculate expected returns using CAPM
   - Compute covariance matrix with Ledoit-Wolf Shrinkage
   - Generate 5,000 random portfolios for visualization
   - Find the optimal portfolio (Max Sharpe Ratio)
   - Display results in interactive charts

### Understanding the Charts

**Efficient Frontier Chart:**
- Grey dots: Simulated random portfolios
- Gold star ⭐: Optimal portfolio (Max Sharpe Ratio)
- Blue diamond 🔷: Minimum volatility portfolio
- X-axis: Risk (volatility)
- Y-axis: Expected return

**Allocation Donut Chart:**
- Shows percentage breakdown of optimal portfolio
- Hover for dollar amounts

**Performance Metrics:**
- **Expected Annual Return**: Projected yearly return
- **Annual Volatility**: Risk measure (standard deviation)
- **Sharpe Ratio**: Risk-adjusted return (higher is better)

## API Reference

### Backend Endpoints

#### GET `/api/stocks/historical`
Fetch historical stock data

**Parameters:**
- `tickers` (string): Comma-separated ticker symbols
- `start_date` (string): Start date (YYYY-MM-DD)
- `end_date` (string, optional): End date (defaults to today)

#### POST `/api/portfolio/optimize`
Optimize portfolio allocation

**Request Body:**
```json
{
  "tickers": ["AAPL", "MSFT", "TSLA"],
  "start_date": "2023-01-01",
  "investment_amount": 100000,
  "optimization_type": "max_sharpe",
  "max_weight": 1.0
}
```

#### POST `/api/portfolio/efficient-frontier`
Generate efficient frontier data

**Request Body:** Same as optimize

**Response:** Includes simulated portfolios and optimal portfolios

## Troubleshooting

### Backend won't start
- **Error**: `ModuleNotFoundError`
  - **Solution**: Activate venv and install dependencies: `pip install -r backend/requirements.txt`

- **Error**: Port 8000 already in use
  - **Solution**: Kill the process or use different port: `uvicorn main:app --port 8001`

### Frontend can't connect to backend
- **Error**: "Unable to connect to server"
  - **Solution**: Ensure backend is running on port 8000
  - Check CORS settings in `backend/main.py`
  - Update `API_BASE_URL` in `frontend/js/api.js` if using different port

### Charts not displaying
- **Error**: Blank chart areas
  - **Solution**: Check browser console for errors
  - Ensure Plotly.js CDN is accessible
  - Verify API responses in Network tab

### Optimization fails
- **Error**: "Portfolio optimization failed"
  - **Solution**:
    - Ensure at least 2 tickers selected
    - Check date range has sufficient data (6+ months)
    - Try different ticker combinations
    - Check backend logs for detailed error

### Supabase connection issues
- See [supabase/SETUP.md](supabase/SETUP.md) for detailed troubleshooting

## Deactivate Virtual Environment

When done:
```bash
deactivate
```

## Development

### Running in Development Mode

**Backend:**
```bash
cd backend
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
python -m http.server 3000
```

### Adding New Features

See [roadmap_optimized.md](roadmap_optimized.md) for detailed implementation guides.

## Architecture Comparison

| Feature | Old (Streamlit) | New (FastAPI) |
|---------|----------------|---------------|
| **Backend** | Monolithic Streamlit app | FastAPI REST API |
| **Frontend** | Streamlit components | HTML/CSS/JS |
| **Flexibility** | Limited customization | Full control |
| **API Access** | None | RESTful endpoints |
| **Scalability** | Single instance | Horizontal scaling |
| **Mobile Support** | Poor | Responsive design |
| **Deployment** | Streamlit Cloud only | Any platform |

## Contributing

This is a personal project for term work. Future enhancements:
- User authentication
- Portfolio saving/loading
- Real-time updates
- Mobile app integration
- Advanced constraints (sector limits, etc.)

## License

Educational project - MIT License

---

**Built with FastAPI | Data from Yahoo Finance | Powered by PyPortfolioOpt**
