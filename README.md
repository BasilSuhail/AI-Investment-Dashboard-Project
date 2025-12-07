# CFO's Cockpit - AI Investment Dashboard

Real-Time Portfolio Optimization Engine powered by Modern Portfolio Theory

## Quick Start

### 1. Activate Virtual Environment
```bash
source venv/bin/activate
```

### 2. Run the App
```bash
streamlit run app.py
```

**Note**: This project uses Python 3.11 (not 3.14) for compatibility with all dependencies.

The app will open automatically in your browser at `http://localhost:8501`

## What You'll See

**Phase 1 Complete!** The UI skeleton is ready with:
- Portfolio configuration sidebar
- Ticker selection (default: AAPL, MSFT, TSLA, GOOGL, AMZN)
- Investment amount input
- Date range picker
- Placeholder sections for:
  - Efficient Frontier Analysis
  - Optimal Portfolio Allocation
  - Raw Market Data

## Next Steps

Follow the [roadmap_optimized.md](roadmap_optimized.md) to continue building:
- **Phase 2**: Data Pipeline with yfinance
- **Phase 3**: Portfolio Optimization Engine
- **Phase 4**: Interactive Visualizations
- **Phase 5**: Advanced Controls
- **Phase 6**: Error Handling & Polish

## Tech Stack

- **Streamlit**: Web interface
- **yfinance**: Market data
- **PyPortfolioOpt**: Portfolio optimization
- **Plotly**: Interactive charts
- **Pandas & NumPy**: Data processing

## Project Structure

```
AI Investment Dashboard Project/
├── app.py                    # Main Streamlit application
├── requirements.txt          # Python dependencies
├── venv/                     # Virtual environment
├── Roadmap.md               # Original project specification
├── roadmap_optimized.md     # Master implementation guide
└── README.md                # This file
```

## Deactivate Virtual Environment

When done:
```bash
deactivate
```
