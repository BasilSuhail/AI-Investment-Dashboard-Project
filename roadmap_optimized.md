# CFO's Cockpit - Master Development Roadmap
**Project**: Real-Time Portfolio Optimization Engine
**Tech Stack**: Streamlit, yfinance, PyPortfolioOpt, Plotly, Python 3.9+
**Reference**: Part Time Larry - Streamlit Financial Dashboards
**Status**: Ready for Execution

---

## 📋 Project Overview

This dashboard is NOT just a portfolio tracker - it's a **decision-support system** that calculates what you SHOULD own based on Modern Portfolio Theory's Efficient Frontier. It balances mathematical rigor with executive-level visualization.

**Key Differentiator**: Uses CAPM for expected returns + Ledoit-Wolf Shrinkage for risk modeling (prevents extreme allocations that plague amateur portfolio optimizers).

---

## 🏗️ PHASE 1: The "Hollow Shell" & Navigation
**Goal**: Create a functional web app skeleton with proper UI layout (NO math yet)
**Reference Video**: 00:06:50 - 00:18:00

### Step 1.1: Project Setup
```bash
# Create project structure
mkdir "AI Investment Dashboard Project"
cd "AI Investment Dashboard Project"
```

### Step 1.2: Create requirements.txt
```
streamlit==1.31.0
yfinance==0.2.36
pyportfolioopt==1.5.5
plotly==5.18.0
pandas==2.2.0
numpy==1.26.3
```

### Step 1.3: Create app.py Skeleton

**Instructions for Claude:**
```
Create app.py with the following structure:

1. Import statements (streamlit, yfinance, pypfopt, plotly, pandas, numpy)

2. Page Configuration:
   - Use st.set_page_config()
   - Title: "CFO's Cockpit"
   - Layout: "wide"
   - Icon: 💼

3. App Title & Description:
   - Main header: "CFO's Cockpit - Real-Time Portfolio Optimizer"
   - Subtitle explaining it uses Modern Portfolio Theory

4. Sidebar - "Portfolio Configuration":
   - Section header: "📊 Portfolio Settings"
   - Multiselect for tickers (Default: AAPL, MSFT, TSLA, GOOGL, AMZN)
   - Number input for "Investment Amount ($)" (Default: 100000, min: 1000)
   - Date input for "Start Date" (Default: 1 year ago from today)
   - Button: "🔄 Refresh Data"

5. Main Area Placeholders (use st.container()):
   - "📈 Efficient Frontier Analysis"
   - "🎯 Optimal Portfolio Allocation"
   - "📊 Raw Market Data"

CRITICAL: Do NOT write any data fetching or math logic yet. Just the UI structure.
```

### ✅ Phase 1 Completion Checklist:
- [ ] Can you run `streamlit run app.py` without errors?
- [ ] Does the sidebar show the multiselect with default tickers?
- [ ] Are all three placeholder sections visible?
- [ ] Does the app have the correct title and icon?

**Manager's Anti-Mistake Check:**
- ✓ Used `multiselect` (not text_input) - prevents ticker typos
- ✓ Layout set to "wide" for dashboard feel
- ✓ Investment amount has minimum value validation

---

## 📊 PHASE 2: Data Pipeline (Robust Ingestion)
**Goal**: Replace dummy data with real market data using yfinance with intelligent caching
**Reference Video**: 00:21:00 - 00:26:00

### Step 2.1: Implement Data Fetching Function

**Instructions for Claude:**
```
Create a function get_stock_data(tickers, start_date):

1. CRITICAL: Decorate with @st.cache_data(ttl=900)
   - TTL = 900 seconds (15 minutes)
   - This prevents API rate limiting and makes the app feel "snappy"

2. Function Logic:
   - Use yfinance.download() to fetch "Adj Close" prices
   - Parameters: tickers, start=start_date, end=today
   - Store in a pandas DataFrame

3. Data Cleaning (CRITICAL):
   - Drop any columns (tickers) with NaN values using dropna(axis=1)
   - Print warning if tickers were removed: "⚠️ Removed X tickers due to missing data"
   - Return the cleaned DataFrame

4. Error Handling:
   - Wrap in try/except block
   - If yfinance fails, display st.error() with helpful message
   - Return None on failure
```

### Step 2.2: Display Raw Data

**Instructions for Claude:**
```
In the "Raw Market Data" section:

1. Call get_stock_data() with user's selected tickers and date
2. If data is None, show error and stop execution
3. Display the dataframe using st.dataframe(use_container_width=True)
4. Show summary metrics:
   - Number of trading days
   - Date range covered
   - Tickers successfully loaded
```

### ✅ Phase 2 Completion Checklist:
- [ ] Data loads without errors when you click "Refresh Data"
- [ ] App doesn't re-download data on every slider interaction (caching works)
- [ ] Missing tickers are automatically removed with a warning
- [ ] Raw data table displays correctly with all columns

**Manager's Anti-Mistake Check:**
- ✓ Caching enabled with TTL (without this, app lags 5-10 seconds per interaction)
- ✓ Using "Adj Close" (NOT regular "Close" - accounts for splits/dividends)
- ✓ NaN handling prevents silent optimizer failures

---

## 🧮 PHASE 3: The "Brain" (Portfolio Optimization Engine)
**Goal**: Implement PyPortfolioOpt with professional-grade settings
**Reference Video**: 00:38:00 (Database Logic equivalent)

### Step 3.1: Calculate Expected Returns & Risk

**Instructions for Claude:**
```
Create a function calculate_portfolio_metrics(price_data):

1. Import required modules:
   from pypfopt import risk_models, expected_returns
   from pypfopt.efficient_frontier import EfficientFrontier

2. Calculate Expected Returns (mu):
   - Use expected_returns.capm_return(price_data)
   - WHY CAPM? Forward-looking, factor-based (better than simple historical mean)

3. Calculate Covariance Matrix (S):
   - Use risk_models.CovarianceShrinkage(price_data).ledoit_wolf()
   - WHY Shrinkage? Prevents extreme allocations (e.g., 100% in one stock)
   - Standard covariance is "noisy" - shrinkage makes it robust

4. Sanity Check Display:
   - Create an expander: "🔍 View Expected Returns"
   - Display mu as a bar chart (st.bar_chart)
   - Show annualized return % for each ticker

5. Return (mu, S) as a tuple
```

### Step 3.2: Initialize Efficient Frontier

**Instructions for Claude:**
```
Create a function get_efficient_frontier(mu, S):

1. Initialize EfficientFrontier object:
   ef = EfficientFrontier(mu, S)

2. Calculate TWO optimal portfolios:

   a) Max Sharpe Ratio Portfolio:
      - ef_max_sharpe = EfficientFrontier(mu, S)
      - weights_max_sharpe = ef_max_sharpe.max_sharpe()
      - Clean weights using ef_max_sharpe.clean_weights()
      - Get performance: ef_max_sharpe.portfolio_performance()

   b) Min Volatility Portfolio:
      - ef_min_vol = EfficientFrontier(mu, S)
      - weights_min_vol = ef_min_vol.min_volatility()
      - Clean weights using ef_min_vol.clean_weights()
      - Get performance: ef_min_vol.portfolio_performance()

3. Return both sets of weights and performance metrics

NOTE: We create TWO separate EfficientFrontier objects because each optimization
      modifies the internal state (you can't reuse the same object).
```

### ✅ Phase 3 Completion Checklist:
- [ ] Expected returns display correctly (all positive or negative where expected)
- [ ] No errors when calculating covariance matrix
- [ ] Max Sharpe portfolio weights sum to 1.0 (100%)
- [ ] Min Volatility portfolio weights sum to 1.0 (100%)
- [ ] Performance metrics show expected return, volatility, and Sharpe ratio

**Manager's Anti-Mistake Check:**
- ✓ Using CAPM (not simple mean) for expected returns
- ✓ Using Ledoit-Wolf Shrinkage (not basic covariance)
- ✓ Cleaning weights (removes tiny allocations like 0.0001%)

---

## 🎨 PHASE 4: The "Cockpit" Visualization
**Goal**: Create the Efficient Frontier scatter plot with interactive Plotly charts
**Reference Video**: 00:49:30

### Step 4.1: Generate Efficient Frontier Curve

**Instructions for Claude:**
```
Create a function simulate_portfolios(mu, S, num_portfolios=5000):

1. Initialize empty lists for returns, volatilities, and sharpe ratios

2. Run Monte Carlo simulation:
   - Loop num_portfolios times
   - Generate random weights that sum to 1.0
   - For each set of weights:
     * Calculate portfolio return: weights @ mu
     * Calculate portfolio volatility: sqrt(weights @ S @ weights)
     * Calculate Sharpe ratio: return / volatility
   - Store each result

3. Return three arrays: returns, volatilities, sharpe_ratios

NOTE: This creates the "cloud" of possible portfolios to show the frontier.
```

### Step 4.2: Create Efficient Frontier Plot

**Instructions for Claude:**
```
Create a function plot_efficient_frontier(sim_returns, sim_vols, sim_sharpes,
                                          max_sharpe_perf, min_vol_perf):

Use Plotly Graph Objects (go):

1. Create scatter plot for simulated portfolios:
   - X-axis: sim_vols (Volatility)
   - Y-axis: sim_returns (Expected Return)
   - Color: sim_sharpes (colorscale='Viridis')
   - Mode: 'markers'
   - Marker size: 3
   - Opacity: 0.5
   - Name: "Simulated Portfolios"

2. Add Max Sharpe Portfolio marker:
   - X: max_sharpe_perf[1] (volatility)
   - Y: max_sharpe_perf[0] (return)
   - Marker: Large gold star (⭐)
   - Size: 20
   - Name: "Max Sharpe Ratio"

3. Add Min Volatility Portfolio marker:
   - X: min_vol_perf[1]
   - Y: min_vol_perf[0]
   - Marker: Large blue diamond (🔷)
   - Size: 20
   - Name: "Min Volatility"

4. Layout Configuration:
   - Title: "Efficient Frontier Analysis"
   - X-axis label: "Volatility (Risk)"
   - Y-axis label: "Expected Annual Return"
   - Template: "plotly_dark"
   - Height: 600

5. Display using st.plotly_chart(fig, use_container_width=True)
```

### Step 4.3: Create Portfolio Allocation Charts

**Instructions for Claude:**
```
Create two-column layout for allocation details:

Column 1 - Donut Chart (Max Sharpe Portfolio):
1. Use go.Pie with hole=0.4
2. Show only non-zero weights (filter out 0% allocations)
3. Display ticker labels with percentages
4. Color scheme: Plotly default colors
5. Title: "🎯 Optimal Allocation (Max Sharpe)"

Column 2 - Metrics Display:
1. Use st.metric() widgets:
   - Expected Annual Return (format as %)
   - Annual Volatility (format as %)
   - Sharpe Ratio (2 decimal places)

2. Add dollar allocation breakdown:
   - For each ticker with >1% allocation
   - Show: Ticker | % | Dollar Amount
   - Use user's investment amount for calculations
```

### ✅ Phase 4 Completion Checklist:
- [ ] Efficient Frontier plot displays with grey simulation dots
- [ ] Gold star (Max Sharpe) is clearly visible
- [ ] Blue diamond (Min Volatility) is clearly visible
- [ ] Axes are properly labeled (Volatility vs Return)
- [ ] Donut chart shows portfolio breakdown
- [ ] Metrics display correct values (return, volatility, Sharpe)
- [ ] Dollar amounts match user's investment input

**Manager's Anti-Mistake Check:**
- ✓ X-axis is Volatility, Y-axis is Return (not reversed)
- ✓ Gold star is visible and labeled
- ✓ Charts are responsive (use_container_width=True)
- ✓ Zero-weight allocations are hidden from donut chart

---

## 🎛️ PHASE 5: The "What-If" Interactivity
**Goal**: Add live controls for risk tolerance and constraints
**Reference Video**: 00:42:30

### Step 5.1: Add Risk Tolerance Slider

**Instructions for Claude:**
```
In the sidebar, add interactive controls:

1. Risk Tolerance Slider:
   - st.slider("🎚️ Risk Tolerance (Target Volatility)")
   - Min: 5%, Max: 40%, Default: 20%
   - Step: 1%
   - Help text: "Adjust your acceptable portfolio volatility"

2. Create function get_efficient_risk_portfolio(mu, S, target_volatility):
   - Initialize new EfficientFrontier object
   - Use ef.efficient_risk(target_volatility)
   - Return cleaned weights and performance

3. Add toggle option:
   - Checkbox: "Show Min Volatility Portfolio"
   - If checked, display both Max Sharpe and Min Vol
   - If unchecked, only show Max Sharpe
```

### Step 5.2: Add Portfolio Constraints (Advanced)

**Instructions for Claude:**
```
Add optional constraints section in sidebar (within expander):

1. Weight Bounds:
   - Slider: "Max Single Asset Allocation"
   - Range: 10% to 100%, Default: 40%
   - Prevents over-concentration

2. Apply constraints to EfficientFrontier:
   - Use ef.add_constraint(lambda w: w <= max_weight)
   - Update all portfolio calculations

3. Sector Constraints (Future Enhancement):
   - Placeholder for sector-based limits
   - Comment in code for future implementation
```

### Step 5.3: Add Export Functionality

**Instructions for Claude:**
```
Below the main visualizations, add export options:

1. Download Portfolio Weights:
   - Button: "📥 Export Portfolio Allocation (CSV)"
   - Generate CSV with columns: Ticker, Weight (%), Dollar Amount
   - Use st.download_button()

2. Performance Summary:
   - Button: "📄 Download Performance Report (TXT)"
   - Include: Date, Tickers, Returns, Volatility, Sharpe, Allocations
   - Formatted as readable text report

3. Historical Backtest Data:
   - Button: "📊 Export Historical Prices (CSV)"
   - Download the raw price data used in analysis
```

### ✅ Phase 5 Completion Checklist:
- [ ] Risk tolerance slider updates portfolio in real-time
- [ ] Max allocation constraint works correctly
- [ ] Toggle shows/hides Min Volatility portfolio
- [ ] CSV export downloads with correct formatting
- [ ] Performance report includes all key metrics
- [ ] All interactions feel instant (no lag)

**Manager's Anti-Mistake Check:**
- ✓ Slider changes trigger recalculation (not just visual change)
- ✓ Constraints are actually applied to optimizer
- ✓ Export files have proper names with timestamps
- ✓ Session state prevents unnecessary recalculations

---

## 🛡️ PHASE 6: Error Handling & Polish
**Goal**: Production-ready error handling and user experience refinements

### Step 6.1: Input Validation

**Instructions for Claude:**
```
Add comprehensive validation:

1. Ticker Validation:
   - Minimum 2 tickers required for portfolio optimization
   - Show error if user selects < 2
   - Validate ticker format (uppercase, no spaces)

2. Date Validation:
   - Start date must be before today
   - Minimum 6 months of data required
   - Show warning if < 1 year selected

3. Investment Amount Validation:
   - Must be positive number
   - Minimum $1,000
   - Format with commas for readability
```

### Step 6.2: Graceful Error Handling

**Instructions for Claude:**
```
Wrap critical sections in try/except:

1. Data Download Failures:
   - Catch yfinance errors
   - Display user-friendly message
   - Suggest: "Check ticker symbols or try again later"

2. Optimization Failures:
   - Catch pypfopt errors (e.g., singular matrix)
   - Explain: "Portfolio optimization failed - try different tickers"
   - Log technical error details in expander

3. Network Issues:
   - Timeout handling for yfinance
   - Retry logic with exponential backoff
   - Show loading spinner during retries
```

### Step 6.3: User Experience Enhancements

**Instructions for Claude:**
```
Polish the interface:

1. Loading States:
   - Use st.spinner() for data download
   - Messages: "Fetching market data..." "Optimizing portfolio..."

2. Help & Documentation:
   - Add "ℹ️ How to Use" expander at top
   - Explain what Efficient Frontier means
   - Define Sharpe Ratio in plain language

3. Visual Improvements:
   - Add dividers between sections (st.divider())
   - Use colored metrics (delta parameter in st.metric)
   - Consistent emoji usage for section headers

4. Performance Indicators:
   - Show cache hit status
   - Display last data refresh time
   - Add "Using cached data" info message
```

### ✅ Phase 6 Completion Checklist:
- [ ] App handles invalid tickers gracefully
- [ ] Network errors don't crash the app
- [ ] All error messages are user-friendly
- [ ] Loading spinners appear during calculations
- [ ] Help text explains complex concepts
- [ ] UI feels polished and professional

**Manager's Anti-Mistake Check:**
- ✓ No stack traces shown to users
- ✓ All errors have actionable guidance
- ✓ Loading states prevent user confusion
- ✓ Help text uses plain language (no jargon)

---

## 🚀 FINAL DELIVERY CHECKLIST

### Code Quality
- [ ] All functions have docstrings
- [ ] No hardcoded values (use constants or config)
- [ ] Proper spacing and PEP 8 compliance
- [ ] Comments explain "why" not "what"

### Functionality
- [ ] All 5 phases implemented and tested
- [ ] App runs without errors on fresh install
- [ ] Portfolio calculations are mathematically correct
- [ ] Visualizations are accurate and clear

### User Experience
- [ ] App loads in < 3 seconds (first run)
- [ ] Cached interactions feel instant
- [ ] All buttons and inputs work as expected
- [ ] Mobile-responsive (test in narrow window)

### Documentation
- [ ] README.md with installation instructions
- [ ] requirements.txt with pinned versions
- [ ] Inline comments for complex logic
- [ ] User guide in "How to Use" section

---

## 📚 Quick Reference

### Run the App
```bash
streamlit run app.py
```

### Install Dependencies
```bash
pip install -r requirements.txt
```

### Key Libraries Documentation
- **Streamlit**: https://docs.streamlit.io
- **yfinance**: https://pypi.org/project/yfinance/
- **PyPortfolioOpt**: https://pyportfolioopt.readthedocs.io
- **Plotly**: https://plotly.com/python/

### Troubleshooting
| Issue | Solution |
|-------|----------|
| Rate limit errors | Check cache TTL, reduce refresh frequency |
| Singular matrix error | Remove correlated tickers, add more diverse assets |
| Slow performance | Verify caching is enabled, reduce num_portfolios |
| Missing data | Check ticker symbols, verify date range |

---

## 🎯 Success Criteria

**The CFO's Cockpit is complete when:**
1. ✅ A non-technical user can select tickers and see optimal portfolios
2. ✅ The Efficient Frontier visualizes correctly with clear markers
3. ✅ Dollar allocations match user's investment amount
4. ✅ The app feels responsive (< 1 second for cached interactions)
5. ✅ Export functions provide usable CSV/TXT files
6. ✅ Error messages guide users to solutions
7. ✅ The math passes validation (Sharpe ratios are realistic, weights sum to 100%)

---

**Master Roadmap Version**: 1.0
**Last Updated**: 2025-12-07
**Ready for Execution**: YES ✅
