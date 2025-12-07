"""
Data Fetcher Service - yfinance Integration
Handles fetching and caching of market data
"""

import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
from functools import lru_cache
import hashlib


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

        # Download data using yfinance
        print(f"Fetching data for {tickers} from {start_date} to {end_date}")
        data = yf.download(
            tickers,
            start=start_date,
            end=end_date,
            progress=False
        )

        # Extract Adj Close prices
        if len(tickers) == 1:
            # Single ticker case
            prices = pd.DataFrame({tickers[0]: data['Adj Close']})
        else:
            # Multiple tickers
            prices = data['Adj Close']

        # Data cleaning - remove tickers with missing data
        initial_cols = len(prices.columns)
        prices = prices.dropna(axis=1)
        removed_cols = initial_cols - len(prices.columns)

        if removed_cols > 0:
            print(f"⚠️ Removed {removed_cols} ticker(s) due to missing data")

        if prices.empty:
            raise ValueError("No valid data available for the selected tickers and date range")

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
