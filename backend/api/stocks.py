"""
Stock Data API Endpoints
Handles fetching historical market data and stock information
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, Dict, List
from datetime import datetime

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.data_fetcher import fetch_stock_data, get_stock_info, validate_ticker_format

router = APIRouter()


# Response Models
class StockDataResponse(BaseModel):
    """Response model for historical stock data"""
    dates: List[str]
    tickers: List[str]
    prices: Dict[str, List[float]]
    message: Optional[str] = None


class StockInfoResponse(BaseModel):
    """Response model for stock information"""
    ticker: str
    name: str
    sector: str
    industry: str


# Endpoints
@router.get("/historical", response_model=StockDataResponse)
async def get_historical_data(
    tickers: str = Query(..., description="Comma-separated list of ticker symbols"),
    start_date: str = Query(..., description="Start date in YYYY-MM-DD format"),
    end_date: Optional[str] = Query(None, description="End date in YYYY-MM-DD format (defaults to today)")
):
    """
    Get historical adjusted close prices for tickers

    - **tickers**: Comma-separated ticker symbols (e.g., "AAPL,MSFT,TSLA")
    - **start_date**: Start date for historical data (YYYY-MM-DD)
    - **end_date**: Optional end date (defaults to today)
    """
    try:
        # Parse tickers
        ticker_list = [t.strip().upper() for t in tickers.split(",")]

        # Validate tickers
        for ticker in ticker_list:
            if not validate_ticker_format(ticker):
                raise HTTPException(status_code=400, detail=f"Invalid ticker format: {ticker}")

        if len(ticker_list) < 1:
            raise HTTPException(status_code=400, detail="At least 1 ticker is required")

        # Validate dates
        try:
            datetime.strptime(start_date, "%Y-%m-%d")
            if end_date:
                datetime.strptime(end_date, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

        # Fetch data
        price_data = fetch_stock_data(ticker_list, start_date, end_date)

        # Format response
        dates = [date.strftime("%Y-%m-%d") for date in price_data.index]
        tickers_returned = list(price_data.columns)

        prices = {}
        for ticker in tickers_returned:
            prices[ticker] = price_data[ticker].tolist()

        message = None
        if len(tickers_returned) < len(ticker_list):
            removed = set(ticker_list) - set(tickers_returned)
            message = f"Removed tickers due to missing data: {', '.join(removed)}"

        return StockDataResponse(
            dates=dates,
            tickers=tickers_returned,
            prices=prices,
            message=message
        )

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stock data: {str(e)}")


@router.get("/info", response_model=StockInfoResponse)
async def get_stock_information(
    ticker: str = Query(..., description="Ticker symbol")
):
    """
    Get company information for a ticker

    - **ticker**: Stock ticker symbol (e.g., "AAPL")
    """
    try:
        ticker = ticker.strip().upper()

        # Validate ticker
        if not validate_ticker_format(ticker):
            raise HTTPException(status_code=400, detail=f"Invalid ticker format: {ticker}")

        # Get stock info
        info = get_stock_info(ticker)

        return StockInfoResponse(**info)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching stock info: {str(e)}")
