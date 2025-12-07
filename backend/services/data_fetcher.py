"""
Data Fetcher Service - yfinance Integration
Handles fetching and caching of market data
"""

import yfinance as yf
import pandas as pd
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

        # Handle empty data
        if prices.empty or len(prices) == 0:
            raise ValueError("No valid data available for the selected tickers and date range")

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
