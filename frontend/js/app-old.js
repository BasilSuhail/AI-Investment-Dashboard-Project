/**
 * Modern Portfolio Optimizer - Application Logic
 * With auto-refresh and theme switching
 */

// Global State
let selectedTickers = ['GLD']; // Default selections
let currentPortfolioData = null;
let autoRefreshTimeout = null;

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeControls();
    console.log('Portfolio Optimizer initialized');
});

/**
 * Initialize theme from localStorage or system preference
 */
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');

    document.documentElement.setAttribute('data-theme', theme);

    // Theme toggle button
    const themeToggle = document.getElementById('themeToggle');
    themeToggle.addEventListener('click', function() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });
}

/**
 * Initialize all controls and event listeners
 */
function initializeControls() {
    // Initialize asset dropdown
    initializeAssetDropdown();

    // Render initial chips
    renderChips();

    // Time period buttons with auto-refresh
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            setTimePeriod(parseInt(this.dataset.period));
            scheduleAutoRefresh();
        });
    });

    // Risk tolerance with auto-refresh
    const riskTolerance = document.getElementById('riskTolerance');
    riskTolerance.addEventListener('change', function() {
        scheduleAutoRefresh();
    });

    // Max weight slider
    const maxWeight = document.getElementById('maxWeight');
    maxWeight.addEventListener('input', function() {
        document.getElementById('maxWeightValue').textContent = this.value + '%';
    });

    maxWeight.addEventListener('change', function() {
        scheduleAutoRefresh();
    });

    // Investment amount (auto-refresh on blur)
    const investmentAmount = document.getElementById('investmentAmount');
    investmentAmount.addEventListener('blur', function() {
        scheduleAutoRefresh();
    });

    // Export button
    const exportBtn = document.getElementById('exportBtn');
    exportBtn.addEventListener('click', exportPortfolio);

    // Set default date (1 year ago)
    setTimePeriod(12);

    // Initial load
    setTimeout(() => {
        handleRefresh();
    }, 300);
}

/**
 * Initialize asset dropdown functionality
 */
function initializeAssetDropdown() {
    const dropdownBtn = document.getElementById('assetDropdownBtn');
    const dropdown = document.getElementById('assetDropdown');
    const doneBtn = document.getElementById('doneBtn');
    const searchInput = document.getElementById('assetSearch');
    const assetOptions = document.querySelectorAll('.asset-option');
    const chipsContainer = document.getElementById('tickerChips');

    // Function to open dropdown
    function openDropdown(triggerElement) {
        const rect = triggerElement.getBoundingClientRect();
        dropdown.style.position = 'fixed';
        dropdown.style.top = (rect.bottom + 8) + 'px';
        dropdown.style.left = rect.left + 'px';
        dropdown.style.display = 'block';
    }

    // Function to close dropdown
    function closeDropdown() {
        dropdown.style.display = 'none';
        searchInput.value = '';
        assetOptions.forEach(option => option.style.display = 'flex');
    }

    // Click on chips container to open dropdown
    chipsContainer.addEventListener('click', function(e) {
        // Don't trigger if clicking on chip remove button
        if (e.target.closest('.chip-remove')) return;
        e.stopPropagation();
        openDropdown(this);
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!dropdown.contains(e.target) && !chipsContainer.contains(e.target)) {
            closeDropdown();
        }
    });

    // Search functionality
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        assetOptions.forEach(option => {
            const ticker = option.querySelector('.asset-ticker').textContent.toLowerCase();
            const name = option.querySelector('.asset-name').textContent.toLowerCase();
            const matches = ticker.includes(searchTerm) || name.includes(searchTerm);
            option.style.display = matches ? 'flex' : 'none';
        });
    });

    // Update chips when checkboxes change
    assetOptions.forEach(option => {
        const checkbox = option.querySelector('input[type="checkbox"]');
        checkbox.addEventListener('change', function() {
            updateSelectedTickers();
            renderChips();
        });
    });

    // Done button - close dropdown and refresh
    doneBtn.addEventListener('click', function() {
        closeDropdown();
        scheduleAutoRefresh();
    });
}

/**
 * Render selected asset chips
 */
function renderChips() {
    const chipsContainer = document.getElementById('tickerChips');
    chipsContainer.innerHTML = '';

    selectedTickers.forEach(ticker => {
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.innerHTML = `
            <span>${ticker}</span>
            <button class="chip-remove" data-ticker="${ticker}">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            </button>
        `;

        // Remove chip when clicking X
        chip.querySelector('.chip-remove').addEventListener('click', function(e) {
            e.stopPropagation();
            const tickerToRemove = this.dataset.ticker;

            // Uncheck in dropdown
            const checkbox = document.querySelector(`.asset-option input[value="${tickerToRemove}"]`);
            if (checkbox) {
                checkbox.checked = false;
            }

            // Update and re-render
            updateSelectedTickers();
            renderChips();
            scheduleAutoRefresh();
        });

        chipsContainer.appendChild(chip);
    });
}

/**
 * Update selected tickers array from checkboxes
 */
function updateSelectedTickers() {
    selectedTickers = Array.from(document.querySelectorAll('.asset-option input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value);
    console.log('Selected tickers:', selectedTickers);
}

/**
 * Schedule auto-refresh with debounce (500ms delay)
 */
function scheduleAutoRefresh() {
    if (autoRefreshTimeout) {
        clearTimeout(autoRefreshTimeout);
    }

    // Update status indicator
    updateStatus('Updating...', 'warning');

    autoRefreshTimeout = setTimeout(() => {
        handleRefresh();
    }, 500);
}

/**
 * Update status indicator
 */
function updateStatus(text, type = 'success') {
    const statusText = document.querySelector('.status-text');
    const statusDot = document.querySelector('.status-dot');

    if (statusText) {
        statusText.textContent = text;
    }

    if (statusDot) {
        statusDot.style.backgroundColor = type === 'warning' ? 'var(--warning)' : 'var(--success)';
    }
}

/**
 * Set time period based on months
 */
function setTimePeriod(months) {
    const date = new Date();
    date.setMonth(date.getMonth() - months);
    // Store in a hidden variable since we don't have a date input anymore
    window.currentStartDate = date.toISOString().split('T')[0];
}

/**
 * Handle refresh (auto-triggered on selections)
 */
async function handleRefresh() {
    try {
        // Update selected tickers array
        updateSelectedTickers();

        // Validate inputs
        if (selectedTickers.length < 2) {
            showAlert('Please select at least 2 assets', 'warning');
            updateStatus('Select assets', 'warning');
            return;
        }

        // Get form values
        const investmentAmount = parseFloat(document.getElementById('investmentAmount').value) || 100000;
        const riskTolerance = document.getElementById('riskTolerance').value;
        const maxWeight = parseFloat(document.getElementById('maxWeight').value) / 100;
        const startDate = window.currentStartDate || new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0];

        // Determine optimization type
        let optimizationType = 'max_sharpe';
        if (riskTolerance === 'conservative') {
            optimizationType = 'min_volatility';
        } else if (riskTolerance === 'aggressive') {
            optimizationType = 'max_sharpe';
        }

        const requestBody = {
            tickers: selectedTickers,
            start_date: startDate,
            investment_amount: investmentAmount,
            optimization_type: optimizationType,
            max_weight: maxWeight
        };

        // Show loading state
        showLoadingState();

        // Save user preferences
        saveUserPreferences();

        // Step 1: Fetch stock data
        console.log('Fetching stock data...');
        const stockData = await fetchStockData(selectedTickers, startDate);
        console.log('Stock data received:', stockData);

        // Display warning if tickers were removed
        if (stockData.message) {
            showAlert(stockData.message, 'warning');
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
        const exportBtn = document.getElementById('exportBtn');
        exportBtn.disabled = false;

        // Determine which portfolio to display based on risk tolerance
        const selectedPortfolio = requestBody.optimization_type === 'min_volatility'
            ? frontierData.optimal_portfolios.min_volatility
            : frontierData.optimal_portfolios.max_sharpe;

        // Render charts
        renderEfficientFrontier(frontierData);
        renderAllocationChart(selectedPortfolio.weights, selectedPortfolio.allocations);
        renderMetricsCards(selectedPortfolio.performance);
        renderBacktestChart(stockData, selectedPortfolio.weights, investmentAmount);
        renderCorrelationHeatmap(stockData);

        // Hide loading state
        hideLoadingState();

        // Update status
        updateStatus('Optimized', 'success');

        // Show success message
        showAlert('Portfolio optimized successfully!', 'success');

    } catch (error) {
        console.error('Error in handleRefresh:', error);
        hideLoadingState();
        updateStatus('Error', 'warning');
        showAlert('Failed to optimize portfolio. Please try again.', 'danger');
    }
}

/**
 * Show loading overlay
 */
function showLoadingState() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'flex';
    }
}

/**
 * Hide loading overlay
 */
function hideLoadingState() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.display = 'none';
    }
}

/**
 * Display alert message
 */
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) return;

    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;

    alertContainer.innerHTML = '';
    alertContainer.appendChild(alert);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        alert.style.opacity = '0';
        setTimeout(() => alert.remove(), 300);
    }, 5000);
}

/**
 * Save user preferences to localStorage
 */
function saveUserPreferences() {
    const preferences = {
        tickers: selectedTickers,
        theme: document.documentElement.getAttribute('data-theme')
    };

    localStorage.setItem('portfolio_preferences', JSON.stringify(preferences));
}

/**
 * Load user preferences from localStorage (if any)
 */
function loadUserPreferences() {
    const saved = localStorage.getItem('portfolio_preferences');

    if (saved) {
        try {
            const preferences = JSON.parse(saved);

            // Restore selected tickers
            if (preferences.tickers && preferences.tickers.length > 0) {
                // Update checkboxes in dropdown
                document.querySelectorAll('.asset-option input[type="checkbox"]').forEach(checkbox => {
                    checkbox.checked = preferences.tickers.includes(checkbox.value);
                });
                selectedTickers = preferences.tickers;
                renderChips();
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
        showAlert('No portfolio data to export. Please optimize first.', 'warning');
        return;
    }

    const riskTolerance = document.getElementById('riskTolerance').value;
    const portfolio = riskTolerance === 'conservative'
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
