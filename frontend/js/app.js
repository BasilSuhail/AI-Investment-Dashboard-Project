/**
 * Main Application Logic
 * Handles user interactions and coordinates API calls and chart rendering
 */

// DOM Elements
let tickersInput, investmentAmount, startDate, refreshBtn, exportBtn, riskTolerance, maxWeight;
let currentPortfolioData = null; // Store portfolio data for export

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    tickersInput = document.getElementById('tickersInput');
    investmentAmount = document.getElementById('investmentAmount');
    startDate = document.getElementById('startDate');
    refreshBtn = document.getElementById('refreshBtn');
    exportBtn = document.getElementById('exportBtn');
    riskTolerance = document.getElementById('riskTolerance');
    maxWeight = document.getElementById('maxWeight');

    // Set default start date (1 year ago)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    startDate.value = oneYearAgo.toISOString().split('T')[0];

    // Attach event listeners
    refreshBtn.addEventListener('click', handleRefresh);
    exportBtn.addEventListener('click', exportPortfolio);

    // Time period quick buttons
    document.querySelectorAll('.time-period').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.time-period').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            setTimePeriod(parseInt(this.dataset.period));
        });
    });

    // Max weight slider
    maxWeight.addEventListener('input', function() {
        document.getElementById('maxWeightValue').textContent = this.value + '%';
    });

    // Load user preferences from localStorage
    loadUserPreferences();

    console.log('CFO\'s Cockpit initialized successfully');
});

/**
 * Set time period based on months
 */
function setTimePeriod(months) {
    const date = new Date();
    date.setMonth(date.getMonth() - months);
    startDate.value = date.toISOString().split('T')[0];
}

/**
 * Handle refresh button click
 */
async function handleRefresh() {
    try {
        // Validate inputs
        if (!validateInputs()) {
            return;
        }

        // Get selected tickers
        const selectedTickers = Array.from(tickersInput.selectedOptions).map(option => option.value);

        // Determine optimization type based on risk tolerance
        let optimizationType = 'max_sharpe';
        if (riskTolerance.value === 'conservative') {
            optimizationType = 'min_volatility';
        } else if (riskTolerance.value === 'aggressive') {
            optimizationType = 'max_sharpe';
        } else {
            optimizationType = 'max_sharpe'; // Moderate also uses max sharpe
        }

        // Get form values
        const requestBody = {
            tickers: selectedTickers,
            start_date: startDate.value,
            investment_amount: parseFloat(investmentAmount.value),
            optimization_type: optimizationType,
            max_weight: parseFloat(maxWeight.value) / 100
        };

        // Show loading state
        showLoadingState();

        // Save user preferences
        saveUserPreferences();

        // Step 1: Fetch stock data
        console.log('Fetching stock data...');
        const stockData = await fetchStockData(selectedTickers, startDate.value);
        console.log('Stock data received:', stockData);

        // Display warning if tickers were removed
        if (stockData.message) {
            displayAlert(stockData.message, 'warning');
        }

        // Render market data table
        renderMarketDataTable(stockData);

        // Calculate best/worst performers
        renderPerformanceCards(stockData);

        // Render normalized price chart
        renderNormalizedPrices(stockData);

        // Step 2: Get efficient frontier data
        console.log('Calculating efficient frontier...');
        const frontierData = await getEfficientFrontier(requestBody);
        console.log('Efficient frontier calculated:', frontierData);

        // Store data for export
        currentPortfolioData = {
            stockData: stockData,
            frontierData: frontierData,
            requestBody: requestBody
        };

        // Enable export button
        exportBtn.disabled = false;

        // Determine which portfolio to display based on risk tolerance
        const selectedPortfolio = riskTolerance.value === 'conservative'
            ? frontierData.optimal_portfolios.min_volatility
            : frontierData.optimal_portfolios.max_sharpe;

        // Render charts
        renderEfficientFrontier(frontierData);
        renderAllocationChart(selectedPortfolio.weights, selectedPortfolio.allocations);
        renderMetricsCards(selectedPortfolio.performance);
        renderBacktestChart(stockData, selectedPortfolio.weights, parseFloat(investmentAmount.value));
        renderCorrelationHeatmap(stockData);

        // Hide loading state
        hideLoadingState();

        // Show success message
        displayAlert('Portfolio optimized successfully!', 'success');

    } catch (error) {
        console.error('Error in handleRefresh:', error);
        hideLoadingState();
        // Error already handled by handleApiError in api.js
    }
}

/**
 * Validate form inputs
 * @returns {boolean} True if inputs are valid
 */
function validateInputs() {
    // Get selected tickers
    const selectedTickers = Array.from(tickersInput.selectedOptions).map(option => option.value);

    // Check minimum ticker count
    if (selectedTickers.length < 2) {
        displayAlert('Please select at least 2 tickers for portfolio optimization.', 'warning');
        return false;
    }

    // Check investment amount
    const amount = parseFloat(investmentAmount.value);
    if (isNaN(amount) || amount <= 0) {
        displayAlert('Please enter a valid investment amount greater than 0.', 'warning');
        return false;
    }

    if (amount < 1000) {
        displayAlert('Investment amount should be at least $1,000.', 'warning');
        return false;
    }

    // Check start date
    const selectedDate = new Date(startDate.value);
    const today = new Date();
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    if (selectedDate >= today) {
        displayAlert('Start date must be before today.', 'warning');
        return false;
    }

    if (selectedDate > sixMonthsAgo) {
        displayAlert('Warning: Less than 6 months of data may result in less accurate optimization.', 'info');
    }

    return true;
}

/**
 * Show loading overlay
 */
function showLoadingState() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.display = 'flex';

    // Disable form inputs
    refreshBtn.disabled = true;
    tickersInput.disabled = true;
    investmentAmount.disabled = true;
    startDate.disabled = true;
}

/**
 * Hide loading overlay
 */
function hideLoadingState() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.display = 'none';

    // Enable form inputs
    refreshBtn.disabled = false;
    tickersInput.disabled = false;
    investmentAmount.disabled = false;
    startDate.disabled = false;
}

/**
 * Save user preferences to localStorage
 */
function saveUserPreferences() {
    const selectedTickers = Array.from(tickersInput.selectedOptions).map(option => option.value);

    const preferences = {
        tickers: selectedTickers,
        investmentAmount: investmentAmount.value,
        startDate: startDate.value
    };

    localStorage.setItem('cfo_cockpit_preferences', JSON.stringify(preferences));
}

/**
 * Load user preferences from localStorage
 */
function loadUserPreferences() {
    const saved = localStorage.getItem('cfo_cockpit_preferences');

    if (saved) {
        try {
            const preferences = JSON.parse(saved);

            // Restore investment amount
            if (preferences.investmentAmount) {
                investmentAmount.value = preferences.investmentAmount;
            }

            // Restore start date
            if (preferences.startDate) {
                startDate.value = preferences.startDate;
            }

            // Restore selected tickers
            if (preferences.tickers && preferences.tickers.length > 0) {
                // Clear current selection
                for (let option of tickersInput.options) {
                    option.selected = false;
                }

                // Select saved tickers
                for (let ticker of preferences.tickers) {
                    for (let option of tickersInput.options) {
                        if (option.value === ticker) {
                            option.selected = true;
                            break;
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error loading preferences:', error);
        }
    }
}

/**
 * Format currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

/**
 * Format percentage
 * @param {number} value - Value to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
function formatPercentage(value, decimals = 2) {
    return (value * 100).toFixed(decimals) + '%';
}

/**
 * Export portfolio to CSV
 */
function exportPortfolio() {
    if (!currentPortfolioData) {
        displayAlert('No portfolio data to export. Please optimize first.', 'warning');
        return;
    }

    const portfolio = riskTolerance.value === 'conservative'
        ? currentPortfolioData.frontierData.optimal_portfolios.min_volatility
        : currentPortfolioData.frontierData.optimal_portfolios.max_sharpe;

    // Build CSV content
    let csv = 'Portfolio Optimization Report\n';
    csv += `Generated: ${new Date().toLocaleString()}\n`;
    csv += `Investment Amount: ${formatCurrency(currentPortfolioData.requestBody.investment_amount)}\n`;
    csv += `Risk Profile: ${riskTolerance.value.toUpperCase()}\n`;
    csv += `Time Period: ${currentPortfolioData.requestBody.start_date} to ${new Date().toISOString().split('T')[0]}\n\n`;

    csv += 'Performance Metrics\n';
    csv += `Expected Annual Return,${formatPercentage(portfolio.performance.expected_return)}\n`;
    csv += `Annual Volatility,${formatPercentage(portfolio.performance.volatility)}\n`;
    csv += `Sharpe Ratio,${portfolio.performance.sharpe_ratio.toFixed(2)}\n\n`;

    csv += 'Ticker,Weight,Dollar Allocation\n';
    for (const [ticker, weight] of Object.entries(portfolio.weights)) {
        const allocation = portfolio.allocations[ticker];
        csv += `${ticker},${formatPercentage(weight)},${formatCurrency(allocation)}\n`;
    }

    // Download CSV file
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio_${riskTolerance.value}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    displayAlert('Portfolio exported successfully!', 'success');
}

/**
 * Render performance summary cards
 */
function renderPerformanceCards(stockData) {
    if (!stockData || !stockData.tickers || stockData.tickers.length === 0) {
        return;
    }

    const tickers = stockData.tickers;
    const prices = stockData.prices;
    const returns = {};

    // Calculate returns for each ticker
    for (const ticker of tickers) {
        const priceData = prices[ticker];
        if (priceData && priceData.length > 0) {
            const startPrice = priceData[0];
            const endPrice = priceData[priceData.length - 1];
            returns[ticker] = ((endPrice - startPrice) / startPrice);
        }
    }

    // Find best and worst performers
    let bestTicker = null;
    let bestReturn = -Infinity;
    let worstTicker = null;
    let worstReturn = Infinity;

    for (const [ticker, returnVal] of Object.entries(returns)) {
        if (returnVal > bestReturn) {
            bestReturn = returnVal;
            bestTicker = ticker;
        }
        if (returnVal < worstReturn) {
            worstReturn = returnVal;
            worstTicker = ticker;
        }
    }

    // Update DOM
    document.getElementById('bestPerformer').textContent = bestTicker || '--';
    document.getElementById('bestPerformerGain').textContent = bestTicker
        ? `+${formatPercentage(bestReturn)}`
        : '--';

    document.getElementById('worstPerformer').textContent = worstTicker || '--';
    document.getElementById('worstPerformerLoss').textContent = worstTicker
        ? `${formatPercentage(worstReturn)}`
        : '--';
}
