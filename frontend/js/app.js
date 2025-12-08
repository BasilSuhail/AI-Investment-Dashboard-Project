/**
 * Portfolio Optimizer - Clean Implementation
 */

// Available stocks
const AVAILABLE_STOCKS = [
    { ticker: 'AAPL', name: 'Apple Inc.' },
    { ticker: 'MSFT', name: 'Microsoft' },
    { ticker: 'GOOGL', name: 'Alphabet (Google)' },
    { ticker: 'NVDA', name: 'Nvidia' },
    { ticker: 'AMZN', name: 'Amazon' },
    { ticker: 'TSLA', name: 'Tesla' },
    { ticker: 'META', name: 'Meta (Facebook)' },
    { ticker: 'NFLX', name: 'Netflix' },
    { ticker: 'JPM', name: 'JPMorgan Chase' },
    { ticker: 'V', name: 'Visa' },
    { ticker: 'WMT', name: 'Walmart' },
    { ticker: 'DIS', name: 'Disney' },
    { ticker: 'BTC-USD', name: 'Bitcoin' },
    { ticker: 'ETH-USD', name: 'Ethereum' },
    { ticker: 'GLD', name: 'Gold ETF' }
];

// Global state
let selectedStocks = ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'AMZN'];
let selectedMonths = 12;
let currentData = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeStockChips();
    initializeDropdown();
    initializeControls();
    renderChips();
});

/**
 * Initialize stock chips
 */
function initializeStockChips() {
    renderChips();
}

/**
 * Render stock chips
 */
function renderChips() {
    const container = document.getElementById('stockChips');
    container.innerHTML = '';

    selectedStocks.forEach(ticker => {
        const chip = document.createElement('div');
        chip.className = 'chip';
        chip.innerHTML = `
            ${ticker}
            <button class="chip-remove" data-ticker="${ticker}">×</button>
        `;

        chip.querySelector('.chip-remove').addEventListener('click', (e) => {
            e.stopPropagation();
            removeStock(ticker);
        });

        container.appendChild(chip);
    });
}

/**
 * Remove stock
 */
function removeStock(ticker) {
    selectedStocks = selectedStocks.filter(t => t !== ticker);
    renderChips();
    updateDropdownCheckboxes();
}

/**
 * Initialize dropdown
 */
function initializeDropdown() {
    const addBtn = document.getElementById('addStockBtn');
    const dropdown = document.getElementById('stockDropdown');
    const searchInput = document.getElementById('searchInput');
    const stockList = document.getElementById('stockList');

    // Render stock list
    renderStockList();

    // Toggle dropdown
    addBtn.addEventListener('click', () => {
        const rect = addBtn.getBoundingClientRect();
        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
        dropdown.style.top = (rect.bottom + 8) + 'px';
        dropdown.style.left = rect.left + 'px';
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target) && e.target !== addBtn) {
            dropdown.style.display = 'none';
        }
    });

    // Search functionality
    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        filterStockList(term);
    });
}

/**
 * Render stock list
 */
function renderStockList() {
    const stockList = document.getElementById('stockList');
    stockList.innerHTML = '';

    AVAILABLE_STOCKS.forEach(stock => {
        const item = document.createElement('label');
        item.className = 'stock-item';
        item.innerHTML = `
            <input type="checkbox" value="${stock.ticker}" ${selectedStocks.includes(stock.ticker) ? 'checked' : ''}>
            <div>
                <div class="stock-ticker">${stock.ticker}</div>
                <div class="stock-name">${stock.name}</div>
            </div>
        `;

        const checkbox = item.querySelector('input');
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                if (!selectedStocks.includes(stock.ticker)) {
                    selectedStocks.push(stock.ticker);
                }
            } else {
                selectedStocks = selectedStocks.filter(t => t !== stock.ticker);
            }
            renderChips();
        });

        stockList.appendChild(item);
    });
}

/**
 * Filter stock list
 */
function filterStockList(term) {
    const items = document.querySelectorAll('.stock-item');
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(term) ? 'flex' : 'none';
    });
}

/**
 * Update dropdown checkboxes
 */
function updateDropdownCheckboxes() {
    const checkboxes = document.querySelectorAll('.stock-item input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectedStocks.includes(checkbox.value);
    });
}

/**
 * Initialize controls
 */
function initializeControls() {
    // Time horizon buttons
    document.querySelectorAll('.pill-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.pill-btn').forEach(b => b.classList.remove('pill-btn-active'));
            btn.classList.add('pill-btn-active');
            selectedMonths = parseInt(btn.dataset.months);
        });
    });

    // Optimize button
    document.getElementById('optimizeBtn').addEventListener('click', () => {
        optimizePortfolio();
    });
}

/**
 * Optimize portfolio
 */
async function optimizePortfolio() {
    if (selectedStocks.length < 2) {
        alert('Please select at least 2 stocks');
        return;
    }

    // Show loading
    document.getElementById('loadingOverlay').style.display = 'flex';

    try {
        // Calculate start date
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - selectedMonths);

        const startDateStr = startDate.toISOString().split('T')[0];
        const investmentAmount = parseFloat(document.getElementById('investmentAmount').value) || 100000;
        const riskTolerance = document.getElementById('riskTolerance').value;

        let optimizationType = 'max_sharpe';
        if (riskTolerance === 'conservative') {
            optimizationType = 'min_volatility';
        } else if (riskTolerance === 'aggressive') {
            optimizationType = 'max_sharpe';
        }

        // Step 1: Fetch stock data
        const stockData = await fetchStockData(selectedStocks, startDateStr);
        console.log('Stock data:', stockData);

        // Step 2: Get efficient frontier
        const requestBody = {
            tickers: selectedStocks,
            start_date: startDateStr,
            investment_amount: investmentAmount,
            optimization_type: optimizationType,
            max_weight: 1.0
        };

        const frontierData = await getEfficientFrontier(requestBody);
        console.log('Frontier data:', frontierData);

        // Store data
        currentData = {
            stockData,
            frontierData,
            requestBody
        };

        // Render metrics
        renderMetrics(stockData, frontierData, optimizationType);

        // Render charts
        renderNormalizedPrices(stockData);
        renderBacktestChart(stockData, frontierData, optimizationType, investmentAmount);
        renderEfficientFrontier(frontierData);
        renderAllocationChart(frontierData, optimizationType);
        renderCorrelationHeatmap(stockData);

    } catch (error) {
        console.error('Error:', error);
        alert('Failed to optimize portfolio. Please try again.');
    } finally {
        document.getElementById('loadingOverlay').style.display = 'none';
    }
}

/**
 * Render metrics
 */
function renderMetrics(stockData, frontierData, optimizationType) {
    // Calculate best/worst performers
    const tickers = stockData.tickers;
    const prices = stockData.prices;
    const returns = {};

    for (const ticker of tickers) {
        const priceData = prices[ticker];
        if (priceData && priceData.length > 0) {
            const startPrice = priceData[0];
            const endPrice = priceData[priceData.length - 1];
            returns[ticker] = ((endPrice - startPrice) / startPrice);
        }
    }

    // Find best and worst
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
    document.getElementById('bestStock').textContent = bestTicker || '--';
    document.getElementById('bestGain').textContent = bestTicker
        ? `+${(bestReturn * 100).toFixed(2)}%`
        : '--';

    document.getElementById('worstStock').textContent = worstTicker || '--';
    document.getElementById('worstLoss').textContent = worstTicker
        ? `${(worstReturn * 100).toFixed(2)}%`
        : '--';

    // Portfolio metrics
    const portfolio = optimizationType === 'min_volatility'
        ? frontierData.optimal_portfolios.min_volatility
        : frontierData.optimal_portfolios.max_sharpe;

    document.getElementById('expectedReturn').textContent =
        `${(portfolio.performance.expected_return * 100).toFixed(2)}%`;

    document.getElementById('sharpeRatio').textContent =
        portfolio.performance.sharpe_ratio.toFixed(2);
}

/**
 * Format percentage
 */
function formatPercentage(value, decimals = 2) {
    return (value * 100).toFixed(decimals) + '%';
}
