# CFO's Cockpit - Master Development Roadmap (FastAPI + React/Vanilla JS)
**Project**: Real-Time Portfolio Optimization Engine
**Architecture**: FastAPI Backend + HTML/JS Frontend + Supabase Database
**Status**: Ready for Execution

---

## 📋 Architecture Overview

**Modern Web Stack (Recommended):**

### Backend (FastAPI - Python)
- **Purpose**: REST API serving portfolio optimization logic
- **Port**: localhost:8000
- **Key Features**:
  - RESTful endpoints for data fetching and optimization
  - PyPortfolioOpt integration for portfolio calculations
  - yfinance integration for market data
  - CORS enabled for frontend communication
  - Auto-generated API documentation (Swagger UI)

### Frontend (HTML/CSS/JavaScript)
- **Purpose**: Interactive dashboard UI
- **Port**: localhost:3000 or file://
- **Key Features**:
  - Vanilla JavaScript (no framework dependency initially)
  - Plotly.js for interactive charts
  - Bootstrap 5 for responsive design
  - Fetch API for backend communication

### Database (Supabase - PostgreSQL)
- **Purpose**: Data persistence and caching
- **Key Features**:
  - User portfolios/preferences storage
  - Cached market data (reduce API calls to yfinance)
  - Historical optimization results
  - Real-time capabilities (future enhancement)

### Data Flow:
```
User → Frontend (JS) → FastAPI Endpoints → PyPortfolioOpt/yfinance
                                         ↓
                                    Supabase Cache
```

**Key Differentiator**:
- API-first architecture (can add mobile app later)
- Clean separation of concerns
- No Streamlit dependency
- Production-ready scalability
- Modern tech stack aligning with industry standards

---

## 🏗️ PHASE 1: Project Setup & Backend Foundation

**Goal**: Create FastAPI backend with core endpoints and project structure

### Step 1.1: Project Structure Setup

```bash
AI Investment Dashboard Project/
├── backend/
│   ├── main.py                 # FastAPI app entry point
│   ├── api/
│   │   ├── __init__.py
│   │   ├── stocks.py           # Stock data endpoints
│   │   ├── portfolio.py        # Portfolio optimization endpoints
│   │   └── database.py         # Supabase integration
│   ├── services/
│   │   ├── __init__.py
│   │   ├── data_fetcher.py     # yfinance integration
│   │   ├── optimizer.py        # PyPortfolioOpt logic
│   │   └── cache_manager.py    # Caching logic
│   └── requirements.txt
├── frontend/
│   ├── index.html              # Main dashboard
│   ├── css/
│   │   └── styles.css          # Custom styles
│   ├── js/
│   │   ├── app.js              # Main application logic
│   │   ├── api.js              # API communication
│   │   └── charts.js           # Plotly chart configurations
│   └── assets/
│       └── logo.svg            # Optional branding
├── supabase/
│   └── schema.sql              # Database schema
├── .env.example                # Environment variables template
└── README.md
```

### Step 1.2: Backend Requirements

Create `backend/requirements.txt`:
```
fastapi==0.109.0
uvicorn[standard]==0.27.0
yfinance==0.2.36
pyportfolioopt==1.5.5
pandas==2.2.0
numpy==1.26.3
python-dotenv==1.0.0
supabase==2.3.0
pydantic==2.5.3
pydantic-settings==2.1.0
python-multipart==0.0.6
```

### Step 1.3: Create FastAPI Backend (main.py)

**Instructions for Claude:**
```
Create backend/main.py with:

1. Import statements:
   - FastAPI, CORSMiddleware
   - API routers (stocks, portfolio)
   - Environment variables setup

2. FastAPI App Configuration:
   - Title: "CFO's Cockpit API"
   - Description: "Portfolio Optimization Engine API"
   - Version: "1.0.0"
   - Docs URL: "/docs" (Swagger UI auto-generated)

3. CORS Configuration:
   - Allow origins: ["http://localhost:3000", "file://"]
   - Allow credentials: True
   - Allow methods: ["*"]
   - Allow headers: ["*"]

4. Include routers:
   - /api/stocks (stock data endpoints)
   - /api/portfolio (optimization endpoints)

5. Root endpoint:
   - GET / returns {"message": "CFO's Cockpit API", "status": "running"}

6. Health check endpoint:
   - GET /health returns {"status": "healthy"}
```

### Step 1.4: Stock Data Endpoints (api/stocks.py)

**Instructions for Claude:**
```
Create backend/api/stocks.py with:

1. GET /api/stocks/historical
   - Query params: tickers (comma-separated), start_date, end_date (optional)
   - Returns: JSON with historical adjusted close prices
   - Implements caching (15-minute TTL)
   - Error handling for invalid tickers

2. GET /api/stocks/info
   - Query params: ticker
   - Returns: Company info (name, sector, industry)
   - Uses yfinance.Ticker().info

3. Response model (Pydantic):
   - StockDataResponse with dates, tickers, prices

4. Error responses:
   - 400: Invalid ticker format
   - 404: Ticker not found
   - 500: yfinance API error
```

### Step 1.5: Portfolio Optimization Endpoints (api/portfolio.py)

**Instructions for Claude:**
```
Create backend/api/portfolio.py with:

1. POST /api/portfolio/optimize
   - Request body: {
       tickers: List[str],
       start_date: str,
       investment_amount: float,
       optimization_type: "max_sharpe" | "min_volatility" | "efficient_risk",
       target_volatility: Optional[float]
     }
   - Returns: {
       weights: Dict[str, float],
       performance: {
         expected_return: float,
         volatility: float,
         sharpe_ratio: float
       },
       allocations: Dict[str, float] (dollar amounts)
     }

2. POST /api/portfolio/efficient-frontier
   - Request body: Same as optimize
   - Returns: {
       simulated_portfolios: {
         returns: List[float],
         volatilities: List[float],
         sharpe_ratios: List[float]
       },
       optimal_portfolios: {
         max_sharpe: {...},
         min_volatility: {...}
       }
     }

3. POST /api/portfolio/save
   - Request body: Portfolio data + user_id
   - Saves to Supabase
   - Returns: portfolio_id

4. GET /api/portfolio/load/{portfolio_id}
   - Returns saved portfolio from Supabase
```

### Step 1.6: Data Fetcher Service (services/data_fetcher.py)

**Instructions for Claude:**
```
Create backend/services/data_fetcher.py:

1. Function: fetch_stock_data(tickers, start_date, end_date=None)
   - Uses yfinance.download()
   - Downloads "Adj Close" prices
   - Data cleaning: dropna(axis=1)
   - Returns pandas DataFrame

2. Function: get_stock_info(ticker)
   - Uses yfinance.Ticker(ticker).info
   - Returns dict with name, sector, industry

3. CRITICAL: Implement caching decorator
   - Use functools.lru_cache or manual dict cache
   - 15-minute TTL
   - Cache key: tickers + start_date + end_date

4. Error handling:
   - Try/except for yfinance errors
   - Validate ticker format
   - Handle network timeouts
```

### Step 1.7: Portfolio Optimizer Service (services/optimizer.py)

**Instructions for Claude:**
```
Create backend/services/optimizer.py:

1. Function: calculate_expected_returns(price_data)
   - Uses pypfopt.expected_returns.capm_return()
   - Returns Series of expected returns

2. Function: calculate_covariance_matrix(price_data)
   - Uses pypfopt.risk_models.CovarianceShrinkage().ledoit_wolf()
   - Returns covariance matrix

3. Function: optimize_portfolio(mu, S, optimization_type, target_vol=None)
   - Creates EfficientFrontier object
   - Supports: max_sharpe, min_volatility, efficient_risk
   - Returns: cleaned_weights, performance_metrics

4. Function: simulate_efficient_frontier(mu, S, num_portfolios=5000)
   - Monte Carlo simulation
   - Generates random portfolios
   - Returns: returns_array, volatilities_array, sharpe_ratios_array

5. Function: calculate_dollar_allocations(weights, investment_amount)
   - Converts percentage weights to dollar amounts
   - Returns: Dict[ticker, dollar_amount]
```

### ✅ Phase 1 Completion Checklist:
- [ ] Backend directory structure created
- [ ] requirements.txt with all dependencies
- [ ] FastAPI app runs without errors: `uvicorn backend.main:app --reload`
- [ ] Swagger UI accessible at http://localhost:8000/docs
- [ ] All endpoints return correct response models
- [ ] Stock data fetching works with yfinance
- [ ] Portfolio optimization logic is functional
- [ ] Caching mechanism is implemented

**Manager's Anti-Mistake Check:**
- ✓ CORS enabled (frontend can communicate with backend)
- ✓ Environment variables setup for secrets
- ✓ Pydantic models for request/response validation
- ✓ Using CAPM + Ledoit-Wolf (not simple mean/covariance)

---

## 🗄️ PHASE 2: Supabase Database Setup

**Goal**: Set up Supabase project and integrate with backend

### Step 2.1: Supabase Project Setup

**Instructions for User:**
```
1. Go to https://supabase.com
2. Create free account
3. Create new project: "cfo-cockpit"
4. Save the following from project settings:
   - Project URL (e.g., https://xxxxx.supabase.co)
   - API Key (anon/public key)
   - Service Role Key (for backend use)
5. Add to .env file
```

### Step 2.2: Database Schema

Create `supabase/schema.sql`:

```sql
-- Market Data Cache Table
CREATE TABLE market_data_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticker VARCHAR(10) NOT NULL,
  date DATE NOT NULL,
  adj_close DECIMAL(10, 2) NOT NULL,
  cached_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(ticker, date)
);

CREATE INDEX idx_market_data_ticker ON market_data_cache(ticker);
CREATE INDEX idx_market_data_date ON market_data_cache(date);

-- Portfolios Table
CREATE TABLE portfolios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(255),
  name VARCHAR(255) NOT NULL,
  tickers TEXT[] NOT NULL,
  weights JSONB NOT NULL,
  investment_amount DECIMAL(12, 2) NOT NULL,
  expected_return DECIMAL(5, 4),
  volatility DECIMAL(5, 4),
  sharpe_ratio DECIMAL(5, 4),
  optimization_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_portfolios_user ON portfolios(user_id);

-- Optimization Results Cache Table
CREATE TABLE optimization_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tickers_hash VARCHAR(64) NOT NULL,
  start_date DATE NOT NULL,
  optimization_type VARCHAR(50) NOT NULL,
  result JSONB NOT NULL,
  cached_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tickers_hash, start_date, optimization_type)
);

CREATE INDEX idx_optimization_cache_hash ON optimization_cache(tickers_hash);
```

### Step 2.3: Supabase Integration (api/database.py)

**Instructions for Claude:**
```
Create backend/api/database.py:

1. Import supabase client
   - from supabase import create_client, Client
   - Load SUPABASE_URL and SUPABASE_KEY from .env

2. Function: get_cached_market_data(ticker, start_date, end_date)
   - Query market_data_cache table
   - Return cached data if available and fresh (< 24 hours old)
   - Return None if cache miss

3. Function: save_market_data_cache(ticker, date, adj_close)
   - Insert into market_data_cache
   - Use UPSERT to handle duplicates

4. Function: save_portfolio(portfolio_data)
   - Insert into portfolios table
   - Return portfolio_id

5. Function: load_portfolio(portfolio_id)
   - Query portfolios table
   - Return portfolio data

6. Function: get_optimization_cache(tickers_hash, start_date, optimization_type)
   - Query optimization_cache table
   - Return cached result if available and fresh (< 1 hour old)

7. Function: save_optimization_cache(tickers_hash, start_date, optimization_type, result)
   - Insert into optimization_cache
```

### ✅ Phase 2 Completion Checklist:
- [ ] Supabase project created
- [ ] Database schema executed in SQL Editor
- [ ] .env file configured with Supabase credentials
- [ ] Supabase client initialized in backend
- [ ] Cache functions work (read/write to database)
- [ ] Portfolio save/load functions work

**Manager's Anti-Mistake Check:**
- ✓ Using Service Role Key for backend (not anon key)
- ✓ Environment variables are NOT committed to git (.gitignore)
- ✓ Cache expiration logic implemented
- ✓ UPSERT used to prevent duplicate cache entries

---

## 🎨 PHASE 3: Frontend Dashboard (HTML/CSS/JS)

**Goal**: Create interactive portfolio dashboard UI

### Step 3.1: HTML Structure (frontend/index.html)

**Instructions for Claude:**
```
Create frontend/index.html with:

1. HTML5 Boilerplate:
   - Meta tags for responsive design
   - Title: "CFO's Cockpit - Portfolio Optimizer"
   - Link Bootstrap 5 CSS
   - Link Plotly.js from CDN
   - Link custom styles.css

2. Navigation Header:
   - Brand: "💼 CFO's Cockpit"
   - Subtitle: "Real-Time Portfolio Optimization Engine"

3. Main Layout (Bootstrap Grid):
   - Sidebar (col-md-3):
     * Portfolio Configuration form
     * Ticker multiselect (use Select2 or native)
     * Investment amount input
     * Date range picker
     * Refresh button
     * Help accordion section

   - Main Content (col-md-9):
     * Section 1: Efficient Frontier Chart (canvas/div)
     * Section 2: Two columns:
       - Portfolio Allocation Chart
       - Performance Metrics cards
     * Section 3: Raw Market Data table

4. Footer:
   - "Built with FastAPI | Data from Yahoo Finance | Powered by PyPortfolioOpt"

5. Script tags:
   - Bootstrap JS bundle
   - Plotly.js
   - Custom scripts: api.js, charts.js, app.js (in that order)
```

### Step 3.2: CSS Styling (frontend/css/styles.css)

**Instructions for Claude:**
```
Create frontend/css/styles.css with:

1. Root Variables:
   - Primary color: #2c3e50
   - Accent color: #3498db
   - Success color: #2ecc71
   - Danger color: #e74c3c
   - Background: #ecf0f1

2. Layout Styles:
   - Sidebar: Fixed height, scrollable, background color
   - Main content: Padding, max-width
   - Card styles for metrics

3. Component Styles:
   - Custom button hover effects
   - Input field styling
   - Loading spinner animation
   - Chart container sizing

4. Responsive Design:
   - Mobile breakpoints
   - Collapsible sidebar on small screens
```

### Step 3.3: API Communication (frontend/js/api.js)

**Instructions for Claude:**
```
Create frontend/js/api.js:

1. API Base URL constant:
   const API_BASE_URL = 'http://localhost:8000';

2. Function: fetchStockData(tickers, startDate, endDate)
   - Fetch GET /api/stocks/historical
   - Returns Promise<StockDataResponse>
   - Error handling with user-friendly messages

3. Function: optimizePortfolio(requestBody)
   - Fetch POST /api/portfolio/optimize
   - Returns Promise<OptimizationResponse>
   - Loading state management

4. Function: getEfficientFrontier(requestBody)
   - Fetch POST /api/portfolio/efficient-frontier
   - Returns Promise<EfficientFrontierResponse>

5. Function: savePortfolio(portfolioData)
   - Fetch POST /api/portfolio/save
   - Returns portfolio_id

6. Function: loadPortfolio(portfolioId)
   - Fetch GET /api/portfolio/load/{portfolioId}
   - Returns saved portfolio

7. Helper: handleApiError(error)
   - Displays error toast/alert
   - Logs to console for debugging
```

### Step 3.4: Chart Rendering (frontend/js/charts.js)

**Instructions for Claude:**
```
Create frontend/js/charts.js:

1. Function: renderEfficientFrontier(data)
   - Creates Plotly scatter plot
   - Simulated portfolios (grey dots)
   - Max Sharpe marker (gold star)
   - Min Volatility marker (blue diamond)
   - Axes: Volatility (X) vs Expected Return (Y)
   - Layout: Dark theme, responsive

2. Function: renderAllocationChart(weights)
   - Creates Plotly donut chart
   - Shows percentage allocations
   - Filters out zero weights
   - Color scheme: Plotly default
   - Hover info: Ticker, percentage, dollar amount

3. Function: renderMetricsCards(performance)
   - Updates HTML metric cards
   - Expected Return (formatted as %)
   - Volatility (formatted as %)
   - Sharpe Ratio (2 decimals)
   - Color coding based on values

4. Function: renderMarketDataTable(data)
   - Creates HTML table
   - Columns: Date, Ticker1, Ticker2, ...
   - Sortable headers
   - Pagination (optional)
```

### Step 3.5: Application Logic (frontend/js/app.js)

**Instructions for Claude:**
```
Create frontend/js/app.js:

1. DOM Ready Event:
   - Initialize form elements
   - Set default values (tickers, amount, date)
   - Attach event listeners

2. Event: Refresh Button Click
   - Get form values (tickers, amount, date)
   - Validate inputs (min 2 tickers, valid date)
   - Show loading spinner
   - Call API functions in sequence:
     * fetchStockData()
     * optimizePortfolio()
     * getEfficientFrontier()
   - Render all charts and metrics
   - Hide loading spinner
   - Handle errors gracefully

3. Function: validateInputs()
   - Check ticker count >= 2
   - Check start date is before today
   - Check investment amount > 0
   - Display validation errors

4. Function: showLoadingState()
   - Display spinner overlay
   - Disable form inputs
   - Show "Calculating..." message

5. Function: hideLoadingState()
   - Hide spinner
   - Enable form inputs

6. Function: displayError(message)
   - Show Bootstrap alert/toast
   - User-friendly error message
```

### ✅ Phase 3 Completion Checklist:
- [ ] HTML structure renders correctly
- [ ] CSS styling looks professional
- [ ] API communication works (test with backend running)
- [ ] Charts render with sample data
- [ ] Form validation works
- [ ] Loading states display properly
- [ ] Error messages are user-friendly
- [ ] Responsive design works on mobile

**Manager's Anti-Mistake Check:**
- ✓ CORS issues resolved (backend allows frontend origin)
- ✓ API_BASE_URL is configurable (not hardcoded throughout)
- ✓ Async/await used properly (no unhandled promises)
- ✓ Charts are responsive (resize with window)

---

## 🎛️ PHASE 4: Advanced Features & Interactivity

**Goal**: Add risk tolerance controls, constraints, and export functionality

### Step 4.1: Risk Tolerance Slider

**Instructions for Claude:**
```
In frontend/index.html sidebar:

1. Add Risk Tolerance Slider:
   - Range: 5% to 40%, default: 20%
   - Label: "🎚️ Target Volatility"
   - Real-time update on slide

2. Update app.js:
   - On slider change, trigger optimization with efficient_risk type
   - Update charts dynamically
   - Debounce slider events (wait 500ms after user stops)

3. Update backend/api/portfolio.py:
   - Handle efficient_risk optimization type
   - Use ef.efficient_risk(target_volatility)
```

### Step 4.2: Portfolio Constraints

**Instructions for Claude:**
```
In frontend sidebar (Advanced Settings accordion):

1. Add Max Single Asset Allocation Slider:
   - Range: 10% to 100%, default: 40%
   - Label: "Max Allocation per Asset"

2. Update OptimizationRequest model:
   - Add max_weight: Optional[float]
   - Apply constraint: ef.add_constraint(lambda w: w <= max_weight)

3. Add checkbox options:
   - "Show Min Volatility Portfolio" (toggle display)
   - "Apply Sector Constraints" (future feature - placeholder)
```

### Step 4.3: Export Functionality

**Instructions for Claude:**
```
In frontend below main charts:

1. Add Export Buttons:
   - "📥 Export Allocation (CSV)"
   - "📄 Download Report (TXT)"
   - "📊 Export Historical Data (CSV)"

2. JavaScript functions:
   - generateCSV(data): Creates CSV string from data
   - downloadFile(content, filename): Triggers download
   - formatPerformanceReport(): Creates text report

3. CSV Format for allocation:
   Ticker,Weight (%),Dollar Amount
   AAPL,35.5,$35,500
   MSFT,28.3,$28,300
   ...

4. Report Format:
   CFO's Cockpit Portfolio Report
   Generated: [Date Time]
   Investment Amount: $100,000
   Tickers: AAPL, MSFT, TSLA, GOOGL, AMZN

   Performance Metrics:
   - Expected Annual Return: 15.3%
   - Annual Volatility: 18.2%
   - Sharpe Ratio: 0.84

   Optimal Allocation:
   [Table of weights and dollar amounts]
```

### ✅ Phase 4 Completion Checklist:
- [ ] Risk tolerance slider updates portfolio in real-time
- [ ] Max allocation constraint works correctly
- [ ] Toggles show/hide elements properly
- [ ] CSV export downloads with correct formatting
- [ ] Performance report includes all key data
- [ ] Export filenames include timestamp

**Manager's Anti-Mistake Check:**
- ✓ Debouncing prevents API spam on slider changes
- ✓ Constraints are validated on backend (not just frontend)
- ✓ Export files have proper MIME types
- ✓ All calculations update when constraints change

---

## 🛡️ PHASE 5: Error Handling, Caching & Polish

**Goal**: Production-ready error handling and performance optimization

### Step 5.1: Backend Error Handling

**Instructions for Claude:**
```
In backend endpoints:

1. Add global exception handler (main.py):
   @app.exception_handler(Exception)
   - Catches all unhandled exceptions
   - Returns 500 with user-friendly message
   - Logs full traceback for debugging

2. Specific error handlers:
   - ValueError: 400 Bad Request
   - KeyError: 404 Not Found
   - yfinance errors: 503 Service Unavailable
   - Optimization errors: 422 Unprocessable Entity

3. Response models for errors:
   ErrorResponse(detail: str, error_code: str)

4. Logging:
   - Use Python logging module
   - Log levels: INFO, WARNING, ERROR
   - Log to console and file (logs/app.log)
```

### Step 5.2: Frontend Error Handling

**Instructions for Claude:**
```
In frontend/js/app.js:

1. Try/catch blocks for all API calls
2. User-friendly error messages:
   - Network errors: "Unable to connect to server. Please check your connection."
   - Invalid tickers: "Some tickers are invalid. Please check: [list]"
   - Optimization failed: "Portfolio optimization failed. Try different tickers or date range."

3. Error display:
   - Use Bootstrap toasts (auto-dismiss after 5 seconds)
   - Error icon and color coding
   - "Retry" button for recoverable errors

4. Fallback UI states:
   - Empty state: "Select tickers and click Refresh to get started"
   - Error state: "Something went wrong" with retry button
   - No data state: "No data available for selected tickers"
```

### Step 5.3: Performance Optimization

**Instructions for Claude:**
```
Backend optimizations:

1. Implement caching at multiple levels:
   - yfinance data: Supabase cache (24-hour TTL)
   - Optimization results: Supabase cache (1-hour TTL)
   - API responses: FastAPI @lru_cache decorator

2. Async endpoints where possible:
   - async def for I/O operations
   - Use asyncio.gather() for parallel fetching

3. Response compression:
   - Enable GZIP middleware
   - Reduces payload size for large data

Frontend optimizations:

1. Lazy load Plotly.js (only when needed)
2. Debounce form inputs (prevent excessive API calls)
3. Local storage for user preferences:
   - Last used tickers
   - Investment amount
   - Date range
4. Progressive loading:
   - Show data table first
   - Load charts after
```

### Step 5.4: UI Polish

**Instructions for Claude:**
```
Final UI improvements:

1. Loading states:
   - Spinner overlay during API calls
   - Progress indicators for multi-step operations
   - Skeleton screens for charts

2. Animations:
   - Smooth transitions for chart updates
   - Fade in/out for sections
   - Button hover effects

3. Accessibility:
   - ARIA labels for all interactive elements
   - Keyboard navigation support
   - High contrast mode support

4. Help & Documentation:
   - Tooltips for complex terms
   - "How to Use" modal with examples
   - Inline help icons with explanations

5. Visual improvements:
   - Consistent spacing and alignment
   - Color-coded metrics (green for good, red for bad)
   - Icons for section headers
   - Professional color palette
```

### ✅ Phase 5 Completion Checklist:
- [ ] All errors are caught and handled gracefully
- [ ] Error messages guide users to solutions
- [ ] Caching reduces API calls significantly
- [ ] App feels fast and responsive
- [ ] Loading states prevent user confusion
- [ ] UI is polished and professional
- [ ] Accessibility standards met
- [ ] Help documentation is clear

**Manager's Anti-Mistake Check:**
- ✓ No stack traces visible to users
- ✓ Cache invalidation works correctly
- ✓ Async operations don't block UI
- ✓ All error paths tested

---

## 🚀 FINAL DELIVERY CHECKLIST

### Code Quality
- [ ] All functions have docstrings
- [ ] No hardcoded values (use .env for config)
- [ ] Proper spacing and PEP 8 compliance
- [ ] Comments explain "why" not "what"
- [ ] TypeScript types/JSDoc for frontend (optional but recommended)

### Functionality
- [ ] All 5 phases implemented and tested
- [ ] Backend runs without errors: `uvicorn backend.main:app --reload`
- [ ] Frontend connects to backend successfully
- [ ] Portfolio calculations are mathematically correct
- [ ] Visualizations are accurate and clear
- [ ] Supabase caching works

### User Experience
- [ ] App loads in < 3 seconds
- [ ] Cached interactions feel instant
- [ ] All buttons and inputs work as expected
- [ ] Mobile-responsive design
- [ ] Error states are handled gracefully

### Documentation
- [ ] README.md with installation instructions
- [ ] .env.example with required variables
- [ ] API documentation (auto-generated by FastAPI)
- [ ] Inline comments for complex logic
- [ ] User guide in frontend help section

### Security
- [ ] Environment variables not committed to git
- [ ] CORS properly configured
- [ ] No sensitive data exposed in frontend
- [ ] Supabase RLS policies (if using auth)

---

## 📚 Quick Reference

### Start Backend Server
```bash
cd backend
source ../venv/bin/activate
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Start Frontend (Simple HTTP Server)
```bash
cd frontend
python -m http.server 3000
```
Or open `index.html` directly in browser (file://)

### API Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### Environment Variables (.env)
```
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your-service-role-key-here
ENVIRONMENT=development
LOG_LEVEL=INFO
```

### Key Libraries Documentation
- **FastAPI**: https://fastapi.tiangolo.com
- **yfinance**: https://pypi.org/project/yfinance/
- **PyPortfolioOpt**: https://pyportfolioopt.readthedocs.io
- **Plotly.js**: https://plotly.com/javascript/
- **Supabase**: https://supabase.com/docs
- **Bootstrap 5**: https://getbootstrap.com/docs/5.0

### Troubleshooting
| Issue | Solution |
|-------|----------|
| CORS errors | Check CORS middleware in main.py, verify frontend origin |
| API timeout | Increase uvicorn timeout, check network connection |
| Supabase connection failed | Verify .env credentials, check Supabase project status |
| Charts not rendering | Check Plotly.js CDN loaded, inspect browser console |
| Optimization fails | Verify tickers are valid, check date range has enough data |

---

## 🎯 Success Criteria

**The CFO's Cockpit is complete when:**
1. ✅ Backend API serves all endpoints correctly (test in Swagger UI)
2. ✅ Frontend connects to backend without CORS issues
3. ✅ User can select tickers and see optimal portfolios
4. ✅ Efficient Frontier visualizes correctly with clear markers
5. ✅ Dollar allocations match user's investment amount
6. ✅ Supabase caching reduces redundant API calls
7. ✅ Export functions provide usable CSV/TXT files
8. ✅ Error messages guide users to solutions
9. ✅ The app feels responsive (< 1 second for cached data)
10. ✅ Math is correct (Sharpe ratios realistic, weights sum to 100%)

---

## 🔄 Migration from Streamlit (Optional)

If you have existing Streamlit code, here's the mapping:

| Streamlit | FastAPI + Frontend Equivalent |
|-----------|-------------------------------|
| `st.title()` | `<h1>` in HTML |
| `st.sidebar` | Sidebar div in HTML |
| `st.button()` | `<button>` + event listener |
| `st.plotly_chart()` | `Plotly.newPlot()` in JS |
| `st.cache_data` | Supabase cache + backend caching |
| `st.multiselect()` | `<select multiple>` or Select2 |
| `st.number_input()` | `<input type="number">` |
| `st.date_input()` | `<input type="date">` |

---

**Master Roadmap Version**: 2.0 (FastAPI Architecture)
**Last Updated**: 2025-12-07
**Ready for Execution**: YES ✅
