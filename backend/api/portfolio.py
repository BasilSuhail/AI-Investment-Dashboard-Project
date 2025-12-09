"""
Portfolio Optimization API Endpoints
Handles portfolio optimization and efficient frontier calculations
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, List

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.data_fetcher import fetch_stock_data
from services.optimizer import (
    calculate_expected_returns,
    calculate_covariance_matrix,
    optimize_portfolio,
    simulate_efficient_frontier,
    calculate_dollar_allocations
)

router = APIRouter()


# Request Models
class OptimizationRequest(BaseModel):
    """Request model for portfolio optimization"""
    tickers: List[str]
    start_date: str
    investment_amount: float
    optimization_type: str = "max_sharpe"  # "max_sharpe" | "min_volatility" | "efficient_risk"
    target_volatility: Optional[float] = None
    max_weight: Optional[float] = 1.0  # Maximum weight per asset (1.0 = 100%)
    compare_sp500: Optional[bool] = False  # Whether to include S&P 500 benchmark comparison


# Response Models
class PerformanceMetrics(BaseModel):
    """Performance metrics for a portfolio"""
    expected_return: float
    volatility: float
    sharpe_ratio: float


class OptimizationResponse(BaseModel):
    """Response model for portfolio optimization"""
    weights: Dict[str, float]
    performance: PerformanceMetrics
    allocations: Dict[str, float]


class SimulatedPortfolios(BaseModel):
    """Simulated portfolios for efficient frontier"""
    returns: List[float]
    volatilities: List[float]
    sharpe_ratios: List[float]


class OptimalPortfolios(BaseModel):
    """Optimal portfolios"""
    max_sharpe: OptimizationResponse
    min_volatility: OptimizationResponse


class BenchmarkPerformance(BaseModel):
    """S&P 500 benchmark performance"""
    total_return: float
    annualized_return: float
    volatility: float
    outperformance: float  # Portfolio return - benchmark return


class RiskMetrics(BaseModel):
    """Risk analysis metrics"""
    value_at_risk_95: float  # VaR at 95% confidence level
    value_at_risk_99: float  # VaR at 99% confidence level
    max_drawdown: float  # Maximum peak-to-trough decline
    max_drawdown_duration_days: int  # Days in max drawdown period


class EfficientFrontierResponse(BaseModel):
    """Response model for efficient frontier data"""
    simulated_portfolios: SimulatedPortfolios
    optimal_portfolios: OptimalPortfolios
    benchmark: Optional[BenchmarkPerformance] = None
    risk_metrics: Optional[RiskMetrics] = None


# Endpoints
@router.post("/optimize", response_model=OptimizationResponse)
async def optimize_portfolio_endpoint(request: OptimizationRequest):
    """
    Optimize portfolio allocation

    - **tickers**: List of stock ticker symbols
    - **start_date**: Start date for historical data (YYYY-MM-DD)
    - **investment_amount**: Total investment amount in dollars
    - **optimization_type**: "max_sharpe", "min_volatility", or "efficient_risk"
    - **target_volatility**: Target volatility for efficient_risk (required if using efficient_risk)
    - **max_weight**: Maximum allocation per asset (0.0 to 1.0, default 1.0)
    """
    try:
        # Validate inputs
        if len(request.tickers) < 2:
            raise HTTPException(status_code=400, detail="At least 2 tickers required for portfolio optimization")

        if request.investment_amount <= 0:
            raise HTTPException(status_code=400, detail="Investment amount must be positive")

        if request.optimization_type not in ["max_sharpe", "min_volatility", "efficient_risk"]:
            raise HTTPException(status_code=400, detail="Invalid optimization_type")

        if request.optimization_type == "efficient_risk" and request.target_volatility is None:
            raise HTTPException(status_code=400, detail="target_volatility required for efficient_risk optimization")

        # Fetch historical data
        price_data = fetch_stock_data(request.tickers, request.start_date)

        # Calculate expected returns and covariance matrix
        mu = calculate_expected_returns(price_data)
        S = calculate_covariance_matrix(price_data)

        # Optimize portfolio
        weights, performance = optimize_portfolio(
            mu, S,
            request.optimization_type,
            request.target_volatility,
            request.max_weight
        )

        # Calculate dollar allocations
        allocations = calculate_dollar_allocations(weights, request.investment_amount)

        return OptimizationResponse(
            weights=weights,
            performance=PerformanceMetrics(**performance),
            allocations=allocations
        )

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")


@router.post("/efficient-frontier", response_model=EfficientFrontierResponse)
async def get_efficient_frontier_endpoint(request: OptimizationRequest):
    """
    Get efficient frontier data with simulated portfolios and optimal portfolios

    - **tickers**: List of stock ticker symbols
    - **start_date**: Start date for historical data (YYYY-MM-DD)
    - **investment_amount**: Total investment amount in dollars
    - **max_weight**: Maximum allocation per asset (optional)
    """
    try:
        # Validate inputs
        if len(request.tickers) < 2:
            raise HTTPException(status_code=400, detail="At least 2 tickers required")

        if request.investment_amount <= 0:
            raise HTTPException(status_code=400, detail="Investment amount must be positive")

        # Fetch historical data
        price_data = fetch_stock_data(request.tickers, request.start_date)

        # Calculate expected returns and covariance matrix
        mu = calculate_expected_returns(price_data)
        S = calculate_covariance_matrix(price_data)

        # Simulate efficient frontier
        sim_returns, sim_vols, sim_sharpes = simulate_efficient_frontier(mu, S)

        # Calculate Max Sharpe portfolio
        max_sharpe_weights, max_sharpe_perf = optimize_portfolio(
            mu, S, "max_sharpe", max_weight=request.max_weight
        )
        max_sharpe_allocations = calculate_dollar_allocations(max_sharpe_weights, request.investment_amount)

        # Calculate Min Volatility portfolio
        min_vol_weights, min_vol_perf = optimize_portfolio(
            mu, S, "min_volatility", max_weight=request.max_weight
        )
        min_vol_allocations = calculate_dollar_allocations(min_vol_weights, request.investment_amount)

        # Calculate S&P 500 benchmark if requested
        benchmark_data = None
        if request.compare_sp500:
            try:
                # Fetch SPY data for the same period
                spy_data = fetch_stock_data(['SPY'], request.start_date)

                if not spy_data.empty and 'SPY' in spy_data.columns:
                    # Calculate SPY returns
                    spy_prices = spy_data['SPY']
                    spy_total_return = (spy_prices.iloc[-1] - spy_prices.iloc[0]) / spy_prices.iloc[0]

                    # Calculate annualized return
                    days = len(spy_prices)
                    years = days / 252  # Trading days per year
                    spy_annualized_return = (1 + spy_total_return) ** (1 / years) - 1 if years > 0 else spy_total_return

                    # Calculate SPY volatility
                    spy_returns = spy_prices.pct_change().dropna()
                    spy_volatility = spy_returns.std() * (252 ** 0.5)  # Annualized volatility

                    # Get portfolio return based on optimization type
                    portfolio_return = max_sharpe_perf['expected_return'] if request.optimization_type != 'min_volatility' else min_vol_perf['expected_return']

                    # Calculate outperformance
                    outperformance = portfolio_return - spy_annualized_return

                    benchmark_data = BenchmarkPerformance(
                        total_return=spy_total_return,
                        annualized_return=spy_annualized_return,
                        volatility=spy_volatility,
                        outperformance=outperformance
                    )
            except Exception as e:
                # If SPY fetch fails, continue without benchmark
                print(f"Warning: Failed to fetch SPY benchmark data: {e}")

        # Calculate risk metrics for optimized portfolio
        risk_metrics_data = None
        try:
            # Use max_sharpe weights for risk analysis
            weights_array = np.array([max_sharpe_weights[ticker] for ticker in request.tickers])

            # Calculate portfolio returns over time
            returns_df = price_data.pct_change().dropna()
            portfolio_returns = returns_df.dot(weights_array)

            # Value at Risk (VaR) using historical simulation
            # VaR 95%: There's a 5% chance of losing more than this amount in one day
            var_95 = np.percentile(portfolio_returns, 5) * request.investment_amount
            # VaR 99%: There's a 1% chance of losing more than this amount in one day
            var_99 = np.percentile(portfolio_returns, 1) * request.investment_amount

            # Calculate maximum drawdown
            portfolio_values = (1 + portfolio_returns).cumprod() * request.investment_amount
            running_max = portfolio_values.expanding().max()
            drawdown = (portfolio_values - running_max) / running_max
            max_drawdown = drawdown.min()

            # Find max drawdown duration
            max_dd_idx = drawdown.idxmin()
            # Find the previous peak
            peak_idx = portfolio_values[:max_dd_idx].idxmax() if len(portfolio_values[:max_dd_idx]) > 0 else portfolio_values.index[0]
            max_dd_duration = (max_dd_idx - peak_idx).days if hasattr((max_dd_idx - peak_idx), 'days') else len(portfolio_values[peak_idx:max_dd_idx])

            risk_metrics_data = RiskMetrics(
                value_at_risk_95=abs(var_95),
                value_at_risk_99=abs(var_99),
                max_drawdown=abs(max_drawdown),
                max_drawdown_duration_days=max_dd_duration
            )
        except Exception as e:
            print(f"Warning: Failed to calculate risk metrics: {e}")

        return EfficientFrontierResponse(
            simulated_portfolios=SimulatedPortfolios(
                returns=sim_returns,
                volatilities=sim_vols,
                sharpe_ratios=sim_sharpes
            ),
            optimal_portfolios=OptimalPortfolios(
                max_sharpe=OptimizationResponse(
                    weights=max_sharpe_weights,
                    performance=PerformanceMetrics(**max_sharpe_perf),
                    allocations=max_sharpe_allocations
                ),
                min_volatility=OptimizationResponse(
                    weights=min_vol_weights,
                    performance=PerformanceMetrics(**min_vol_perf),
                    allocations=min_vol_allocations
                )
            ),
            benchmark=benchmark_data,
            risk_metrics=risk_metrics_data
        )

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Efficient frontier calculation failed: {str(e)}")
