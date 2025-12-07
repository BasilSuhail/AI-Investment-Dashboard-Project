"""
Portfolio Optimizer Service - PyPortfolioOpt Integration
Handles portfolio optimization calculations using Modern Portfolio Theory
"""

import pandas as pd
import numpy as np
from pypfopt import expected_returns, risk_models
from pypfopt.efficient_frontier import EfficientFrontier


def calculate_expected_returns(price_data: pd.DataFrame):
    """
    Calculate expected returns using CAPM

    Args:
        price_data: DataFrame with historical prices

    Returns:
        pandas Series with expected returns for each ticker
    """
    try:
        # Use CAPM for expected returns (forward-looking)
        mu = expected_returns.capm_return(price_data)
        return mu
    except Exception as e:
        print(f"Error calculating expected returns: {e}")
        raise


def calculate_covariance_matrix(price_data: pd.DataFrame):
    """
    Calculate covariance matrix using Ledoit-Wolf Shrinkage

    Args:
        price_data: DataFrame with historical prices

    Returns:
        pandas DataFrame with covariance matrix
    """
    try:
        # Use Ledoit-Wolf Shrinkage for robust covariance estimation
        S = risk_models.CovarianceShrinkage(price_data).ledoit_wolf()
        return S
    except Exception as e:
        print(f"Error calculating covariance matrix: {e}")
        raise


def optimize_portfolio(mu, S, optimization_type: str, target_volatility: float = None, max_weight: float = 1.0):
    """
    Optimize portfolio using Efficient Frontier

    Args:
        mu: Expected returns (Series)
        S: Covariance matrix (DataFrame)
        optimization_type: "max_sharpe" | "min_volatility" | "efficient_risk"
        target_volatility: Target volatility for efficient_risk (optional)
        max_weight: Maximum weight per asset (default 1.0 = 100%)

    Returns:
        tuple: (cleaned_weights dict, performance_metrics dict)
    """
    try:
        # Initialize Efficient Frontier
        ef = EfficientFrontier(mu, S)

        # Add weight constraint if specified
        if max_weight < 1.0:
            ef.add_constraint(lambda w: w <= max_weight)

        # Perform optimization based on type
        if optimization_type == "max_sharpe":
            weights = ef.max_sharpe()
        elif optimization_type == "min_volatility":
            weights = ef.min_volatility()
        elif optimization_type == "efficient_risk":
            if target_volatility is None:
                raise ValueError("target_volatility required for efficient_risk optimization")
            weights = ef.efficient_risk(target_volatility)
        else:
            raise ValueError(f"Invalid optimization_type: {optimization_type}")

        # Clean weights (remove tiny allocations)
        cleaned_weights = ef.clean_weights()

        # Get performance metrics
        expected_return, volatility, sharpe_ratio = ef.portfolio_performance()

        performance_metrics = {
            "expected_return": float(expected_return),
            "volatility": float(volatility),
            "sharpe_ratio": float(sharpe_ratio)
        }

        return cleaned_weights, performance_metrics

    except Exception as e:
        print(f"Error optimizing portfolio: {e}")
        raise


def simulate_efficient_frontier(mu, S, num_portfolios: int = 5000):
    """
    Generate random portfolios for Efficient Frontier visualization

    Args:
        mu: Expected returns (Series)
        S: Covariance matrix (DataFrame)
        num_portfolios: Number of random portfolios to generate

    Returns:
        tuple: (returns_array, volatilities_array, sharpe_ratios_array)
    """
    try:
        n_assets = len(mu)
        results = np.zeros((3, num_portfolios))

        for i in range(num_portfolios):
            # Generate random weights
            weights = np.random.random(n_assets)
            weights /= np.sum(weights)  # Normalize to sum to 1

            # Calculate portfolio return
            portfolio_return = np.dot(weights, mu)

            # Calculate portfolio volatility
            portfolio_volatility = np.sqrt(np.dot(weights.T, np.dot(S, weights)))

            # Calculate Sharpe ratio
            sharpe_ratio = portfolio_return / portfolio_volatility if portfolio_volatility > 0 else 0

            # Store results
            results[0, i] = portfolio_return
            results[1, i] = portfolio_volatility
            results[2, i] = sharpe_ratio

        return results[0, :].tolist(), results[1, :].tolist(), results[2, :].tolist()

    except Exception as e:
        print(f"Error simulating efficient frontier: {e}")
        raise


def calculate_dollar_allocations(weights: dict, investment_amount: float):
    """
    Convert percentage weights to dollar amounts

    Args:
        weights: Dict of ticker -> weight
        investment_amount: Total investment amount in dollars

    Returns:
        dict: ticker -> dollar_amount
    """
    try:
        allocations = {}
        for ticker, weight in weights.items():
            allocations[ticker] = round(weight * investment_amount, 2)
        return allocations
    except Exception as e:
        print(f"Error calculating dollar allocations: {e}")
        raise
