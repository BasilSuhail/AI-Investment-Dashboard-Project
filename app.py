"""
CFO's Cockpit - Real-Time Portfolio Optimization Engine
Built with Streamlit, yfinance, PyPortfolioOpt, and Plotly
Based on Modern Portfolio Theory & Efficient Frontier Analysis
"""

import streamlit as st
import yfinance as yf
import pandas as pd
import numpy as np
import plotly.graph_objects as go
from datetime import datetime, timedelta

# ============================================================================
# PAGE CONFIGURATION
# ============================================================================

st.set_page_config(
    page_title="CFO's Cockpit",
    page_icon="💼",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ============================================================================
# HEADER & TITLE
# ============================================================================

st.title("💼 CFO's Cockpit - Real-Time Portfolio Optimizer")
st.markdown("""
**Decision Support System** powered by Modern Portfolio Theory
Calculates optimal asset allocation based on the **Efficient Frontier** using CAPM and Ledoit-Wolf Shrinkage.
""")

st.divider()

# ============================================================================
# SIDEBAR - PORTFOLIO CONFIGURATION
# ============================================================================

st.sidebar.header("📊 Portfolio Configuration")

# Default tickers
default_tickers = ["AAPL", "MSFT", "TSLA", "GOOGL", "AMZN"]

# Ticker selection
selected_tickers = st.sidebar.multiselect(
    "Select Tickers",
    options=["AAPL", "MSFT", "TSLA", "GOOGL", "AMZN", "NVDA", "META", "NFLX", "JPM", "V", "WMT", "DIS", "BTC-USD", "ETH-USD", "GLD"],
    default=default_tickers,
    help="Select at least 2 tickers for portfolio optimization"
)

# Investment amount
investment_amount = st.sidebar.number_input(
    "Investment Amount ($)",
    min_value=1000,
    max_value=10000000,
    value=100000,
    step=5000,
    help="Enter the total amount you want to invest"
)

# Start date
default_start_date = datetime.now() - timedelta(days=365)
start_date = st.sidebar.date_input(
    "Start Date",
    value=default_start_date,
    max_value=datetime.now(),
    help="Select the start date for historical data (minimum 6 months recommended)"
)

# Refresh button
refresh_button = st.sidebar.button("🔄 Refresh Data", use_container_width=True)

st.sidebar.divider()

# Help section
with st.sidebar.expander("ℹ️ How to Use"):
    st.markdown("""
    **Getting Started:**
    1. Select 2+ tickers from the dropdown
    2. Enter your investment amount
    3. Choose a start date (1+ year recommended)
    4. Click 'Refresh Data' to fetch market data

    **Understanding the Results:**
    - **Efficient Frontier**: Shows all possible risk/return combinations
    - **Gold Star ⭐**: Maximum Sharpe Ratio (best risk-adjusted return)
    - **Blue Diamond 🔷**: Minimum Volatility (lowest risk)
    - **Sharpe Ratio**: Higher is better (reward per unit of risk)
    """)

# ============================================================================
# MAIN AREA - PLACEHOLDERS
# ============================================================================

# Section 1: Efficient Frontier Analysis
with st.container():
    st.header("📈 Efficient Frontier Analysis")
    st.info("**Coming Soon**: Interactive scatter plot showing the efficient frontier with simulated portfolios and optimal allocation markers.")

    # Placeholder for the chart
    st.markdown("*Chart will appear here after implementing Phase 4*")

st.divider()

# Section 2: Optimal Portfolio Allocation
with st.container():
    st.header("🎯 Optimal Portfolio Allocation")

    col1, col2 = st.columns(2)

    with col1:
        st.subheader("Portfolio Breakdown")
        st.info("**Coming Soon**: Donut chart showing the percentage allocation for each ticker in the optimal portfolio.")

    with col2:
        st.subheader("Performance Metrics")
        st.info("**Coming Soon**: Key metrics including Expected Annual Return, Volatility, and Sharpe Ratio.")

st.divider()

# Section 3: Raw Market Data
with st.container():
    st.header("📊 Raw Market Data")

    # Display selected parameters
    st.markdown(f"""
    **Current Selection:**
    - **Tickers**: {', '.join(selected_tickers) if selected_tickers else 'None selected'}
    - **Investment Amount**: ${investment_amount:,}
    - **Start Date**: {start_date}
    - **Trading Days**: *To be calculated*
    """)

    st.info("**Coming Soon**: Historical adjusted close prices for selected tickers will appear here after implementing Phase 2.")

# ============================================================================
# FOOTER
# ============================================================================

st.divider()
st.caption("Built with Streamlit | Data from Yahoo Finance | Powered by PyPortfolioOpt")
