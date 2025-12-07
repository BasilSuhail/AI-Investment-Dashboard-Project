Project Specification: "CFO’s Cockpit" – Dynamic Wealth Manager
Status: Ready for Execution Owner: Senior Dev Confidentiality: Internal / Personal Portfolio Use Only

1. Executive Summary
We are building a Real-Time Portfolio Optimization Engine designed to act as a decision-support system. Unlike standard trackers that just show what you own, this tool calculates what you should own based on the Efficient Frontier theory (Modern Portfolio Theory). It balances mathematical rigor (PyPortfolioOpt) with executive-level visualization (Streamlit + Plotly).

2. Technical Architecture & Stack
We will use a modular Python architecture to ensure the app is fast, scalable, and easy to debug.

Data Layer: yfinance (Yahoo Finance API) for market data.

Logic Layer: PyPortfolioOpt for financial mathematics (Mean-Variance Optimization).

UI/UX Layer: Streamlit for the web interface and state management.

Visualization Layer: Plotly for interactive, tooltip-rich financial charting.

Computation Strategy: Local execution with heavy caching to minimize API calls.

3. The "A-Z" Execution Plan
Phase A: Data Ingestion & Integrity (The Foundation)
Objective: Pull live Adjusted Close data for a user-defined list of tickers (e.g., TSLA, AAPL, MSFT, BTC-USD).

The Crucial Caveat (Manager Note): yfinance is excellent but can be rate-limited if hit too aggressively.

Solution: I will implement st.cache_data (Streamlit’s caching decorator). We will only hit the API once every 15 minutes or upon a manual "Refresh" button press. This prevents the app from crashing due to API throttling and ensures the dashboard feels "snappy" rather than lagging while fetching data on every click.

Data Cleaning: We will automatically drop tickers with missing data (NaNs) to prevent the optimizer from breaking—a common silent failure mode in these apps.

Phase B: The "Brain" – Mathematical Optimization
Tool: PyPortfolioOpt

Step 1: Expected Returns: We will calculate the annualized expected returns using CAPM (Capital Asset Pricing Model) rather than simple historical averages, as this aligns better with forward-looking strategic decision-making.

Step 2: Risk Modeling: We will compute the Covariance Matrix.

Senior Dev Detail: We will use Ledoit-Wolf Shrinkage. Standard covariance matrices are often noisy and lead to extreme asset allocations (e.g., putting 100% into one stock). Shrinkage "pulls" extreme values back to the center, resulting in a mathematically robust portfolio that a CFO would actually trust.

Step 3: The Efficient Frontier: The engine will solve for weights that maximize the Sharpe Ratio (Risk-Adjusted Return) and minimize Volatility based on the user's constraints.

Phase C: The "Cockpit" – User Interface
Layout: A "Command Center" sidebar for inputs and a main stage for visualization.

Inputs:

Ticker Entry: Multi-select box to add/remove stocks on the fly.

Investment Amount: Input field (e.g., $100,000) to see exact allocation in dollars, not just percentages.

Date Range: Slider to test how the portfolio would have performed over the last 1Y, 3Y, or 5Y.

Real-Time Feedback: As you add a stock (e.g., adding "Gold"), the Efficient Frontier curve will instantly recalculate to show if that asset improved or worsened your potential risk/reward profile.

Phase D: Visualization (The "Future-Ready" Hook)
The Hero Chart: An interactive Plotly Scatter Plot of the Efficient Frontier.

X-Axis: Volatility (Risk).

Y-Axis: Expected Return.

Visuals: We will plot 100+ random portfolio simulations (grey dots) to show the "universe" of possibilities, and overlay a Gold Star for the "Max Sharpe" portfolio and a Blue Star for the "Min Volatility" portfolio.

Allocation Donut: A clean Plotly donut chart showing the exact % breakdown of the optimized portfolio.

4. Energy & Resources (Computational Load)
Development Energy: Low. I will leverage pre-built math libraries (pypfopt) rather than writing optimization solvers from scratch. This allows me to focus 80% of my time on the UI and reliability.

App Energy: optimized. By using Session State management, the app will remember your variables as you interact with charts, rather than re-running the entire Python script top-to-bottom on every interaction.

5. Websites & Data Sources
Market Data: Yahoo Finance via yfinance

Optimization Logic: PyPortfolioOpt Documentation

Charting: Plotly Python Open Source Graphing Library

Key Deliverable
A single Python file (app.py) that, when run, launches a local web server displaying the dashboard. No complex deployment is required for the initial review.

Immediate Next Step: I have the environment ready. Shall I proceed with the scaffolding of the app.py file now?

Streamlit - Building Financial Dashboards with Python This video is relevant because it specifically demonstrates how to bridge the gap between raw Python financial data and a polished Streamlit dashboard, which is the exact "Interactive Interface" requirement of your project.