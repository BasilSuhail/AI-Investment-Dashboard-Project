/**
 * Main Application Logic
 * Handles user interactions and coordinates API calls and chart rendering
 */

// DOM Elements
let tickersInput, investmentAmount, startDate, refreshBtn;

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    tickersInput = document.getElementById('tickersInput');
    investmentAmount = document.getElementById('investmentAmount');
    startDate = document.getElementById('startDate');
    refreshBtn = document.getElementById('refreshBtn');

    // Set default start date (1 year ago)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    startDate.value = oneYearAgo.toISOString().split('T')[0];

    // Attach event listeners
    refreshBtn.addEventListener('click', handleRefresh);

    // Load user preferences from localStorage
    loadUserPreferences();

    console.log('CFO\'s Cockpit initialized successfully');
});

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

        // Get form values
        const requestBody = {
            tickers: selectedTickers,
            start_date: startDate.value,
            investment_amount: parseFloat(investmentAmount.value),
            optimization_type: 'max_sharpe',
            max_weight: 1.0
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

        // Step 2: Get efficient frontier data
        console.log('Calculating efficient frontier...');
        const frontierData = await getEfficientFrontier(requestBody);
        console.log('Efficient frontier calculated:', frontierData);

        // Render charts
        renderEfficientFrontier(frontierData);
        renderAllocationChart(
            frontierData.optimal_portfolios.max_sharpe.weights,
            frontierData.optimal_portfolios.max_sharpe.allocations
        );
        renderMetricsCards(frontierData.optimal_portfolios.max_sharpe.performance);

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
