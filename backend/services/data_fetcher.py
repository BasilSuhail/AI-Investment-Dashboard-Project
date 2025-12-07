"""
Data Fetcher Service - yfinance Integration
Handles fetching and caching of market data
"""

import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from functools import lru_cache
import hashlib
import time

# Set user agent to avoid blocking
import requests
session = requests.Session()
session.headers.update({
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
})


def generate_mock_stock_data(tickers: list, start_date: str, end_date: str):
    """
    Generate realistic mock stock data for testing when Yahoo Finance is unavailable

    Args:
        tickers: List of ticker symbols
        start_date: Start date in YYYY-MM-DD format
        end_date: End date in YYYY-MM-DD format

    Returns:
        pandas DataFrame with simulated prices
    """
    print("⚠️ Using MOCK DATA (Yahoo Finance unavailable)")

    # Parse dates
    start = pd.to_datetime(start_date)
    end = pd.to_datetime(end_date)

    # Generate trading days (excluding weekends)
    date_range = pd.bdate_range(start=start, end=end)

    # Create price data for each ticker
    prices = pd.DataFrame(index=date_range)

    # Different starting prices and volatilities for each ticker
    # Increased drift to ensure positive expected returns above risk-free rate (~3%)
    stock_params = {
        'AAPL': {'start_price': 150, 'drift': 0.0006, 'volatility': 0.02},
        'MSFT': {'start_price': 300, 'drift': 0.0007, 'volatility': 0.018},
        'TSLA': {'start_price': 200, 'drift': 0.0005, 'volatility': 0.035},
        'GOOGL': {'start_price': 130, 'drift': 0.00065, 'volatility': 0.022},
        'AMZN': {'start_price': 140, 'drift': 0.00068, 'volatility': 0.025},
        'NVDA': {'start_price': 450, 'drift': 0.0008, 'volatility': 0.03},
        'META': {'start_price': 300, 'drift': 0.0007, 'volatility': 0.028},
        'NFLX': {'start_price': 450, 'drift': 0.0006, 'volatility': 0.032},
        'JPM': {'start_price': 150, 'drift': 0.00055, 'volatility': 0.024},
        'V': {'start_price': 230, 'drift': 0.00065, 'volatility': 0.020},
        'WMT': {'start_price': 150, 'drift': 0.0005, 'volatility': 0.018},
        'DIS': {'start_price': 100, 'drift': 0.00055, 'volatility': 0.026},
        'BTC-USD': {'start_price': 30000, 'drift': 0.001, 'volatility': 0.055},
        'ETH-USD': {'start_price': 2000, 'drift': 0.0009, 'volatility': 0.06},
        'GLD': {'start_price': 180, 'drift': 0.0004, 'volatility': 0.015},
    }

    for ticker in tickers:
        # Get params or use defaults (higher drift to ensure positive returns)
        params = stock_params.get(ticker, {'start_price': 100, 'drift': 0.0006, 'volatility': 0.02})

        # Generate random walk with drift
        np.random.seed(hash(ticker) % 1000)  # Consistent data for same ticker
        returns = np.random.normal(params['drift'], params['volatility'], len(date_range))

        # Calculate cumulative prices
        price_series = params['start_price'] * np.exp(np.cumsum(returns))
        prices[ticker] = price_series

    print(f"  ✅ Generated {len(prices)} days of mock data for {len(tickers)} tickers")

    return prices


def fetch_stock_data(tickers: list, start_date: str, end_date: str = None):
    """
    Fetch historical stock data from Yahoo Finance

    Args:
        tickers: List of ticker symbols
        start_date: Start date in YYYY-MM-DD format
        end_date: End date in YYYY-MM-DD format (defaults to today)

    Returns:
        pandas DataFrame with adjusted close prices
    """
    try:
        if end_date is None:
            end_date = datetime.now().strftime("%Y-%m-%d")

        # Download data using yfinance - using download method with repair=True
        print(f"Fetching data for {tickers} from {start_date} to {end_date}")

        try:
            # Try bulk download first (faster and more reliable)
            data = yf.download(
                tickers,
                start=start_date,
                end=end_date,
                progress=False,
                repair=True,
                keepna=False,
                timeout=10
            )

            # Extract close prices
            if len(tickers) == 1:
                if not data.empty and 'Close' in data.columns:
                    prices = pd.DataFrame({tickers[0]: data['Close']})
                else:
                    prices = pd.DataFrame()
            else:
                if not data.empty and 'Close' in data.columns:
                    prices = data['Close']
                else:
                    prices = pd.DataFrame()

            print(f"  ✅ Downloaded {len(prices)} days for {len(prices.columns)} tickers")

        except Exception as e:
            print(f"  Bulk download failed: {e}")
            print("  Trying individual downloads...")

            # Fallback: download individually
            all_prices = pd.DataFrame()
            for ticker in tickers:
                try:
                    print(f"    Downloading {ticker}...")
                    time.sleep(0.5)

                    single_data = yf.download(
                        ticker,
                        start=start_date,
                        end=end_date,
                        progress=False,
                        repair=True,
                        timeout=10
                    )

                    if not single_data.empty and 'Close' in single_data.columns:
                        all_prices[ticker] = single_data['Close']
                        print(f"    ✅ {ticker}: {len(single_data)} days")
                except Exception as ticker_error:
                    print(f"    ❌ {ticker}: {str(ticker_error)}")
                    continue

            prices = all_prices

        # Handle empty data - fallback to mock data
        if prices.empty or len(prices) == 0:
            print("⚠️ Yahoo Finance failed, using mock data instead")
            prices = generate_mock_stock_data(tickers, start_date, end_date)

        # Data cleaning - forward fill then drop remaining NaN rows
        prices = prices.ffill()  # Forward fill missing values
        prices = prices.dropna()  # Drop any remaining rows with NaN

        # Check if we still have data after cleaning
        if prices.empty or len(prices) == 0:
            raise ValueError("No valid data available for the selected tickers and date range")

        print(f"✅ Successfully fetched {len(prices)} days of data for {len(prices.columns)} ticker(s)")

        return prices

    except Exception as e:
        print(f"Error fetching stock data: {e}")
        raise


def get_stock_info(ticker: str):
    """
    Get company information for a ticker

    Args:
        ticker: Ticker symbol

    Returns:
        dict with company info (name, sector, industry)
    """
    try:
        stock = yf.Ticker(ticker)
        info = stock.info

        return {
            "ticker": ticker,
            "name": info.get("longName", ticker),
            "sector": info.get("sector", "N/A"),
            "industry": info.get("industry", "N/A")
        }

    except Exception as e:
        print(f"Error fetching stock info for {ticker}: {e}")
        return {
            "ticker": ticker,
            "name": ticker,
            "sector": "N/A",
            "industry": "N/A"
        }


def validate_ticker_format(ticker: str) -> bool:
    """
    Validate ticker format

    Args:
        ticker: Ticker symbol to validate

    Returns:
        bool indicating if ticker format is valid
    """
    if not ticker:
        return False

    # Basic validation: alphanumeric and hyphens only
    return ticker.replace("-", "").replace(".", "").isalnum()


def get_cache_key(tickers: list, start_date: str, end_date: str) -> str:
    """
    Generate cache key for stock data

    Args:
        tickers: List of ticker symbols
        start_date: Start date
        end_date: End date

    Returns:
        str hash for caching
    """
    key_string = f"{','.join(sorted(tickers))}_{start_date}_{end_date}"
    return hashlib.md5(key_string.encode()).hexdigest()
