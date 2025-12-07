/**
 * API Communication Module
 * Handles all communication with the FastAPI backend
 */

const API_BASE_URL = 'http://localhost:8000';

/**
 * Fetch historical stock data
 * @param {Array} tickers - Array of ticker symbols
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} endDate - Optional end date
 * @returns {Promise} Stock data response
 */
async function fetchStockData(tickers, startDate, endDate = null) {
    try {
        const tickersParam = tickers.join(',');
        let url = `${API_BASE_URL}/api/stocks/historical?tickers=${tickersParam}&start_date=${startDate}`;

        if (endDate) {
            url += `&end_date=${endDate}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to fetch stock data');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching stock data:', error);
        handleApiError(error);
        throw error;
    }
}

/**
 * Optimize portfolio
 * @param {Object} requestBody - Optimization request parameters
 * @returns {Promise} Optimization response
 */
async function optimizePortfolio(requestBody) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/portfolio/optimize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Portfolio optimization failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Error optimizing portfolio:', error);
        handleApiError(error);
        throw error;
    }
}

/**
 * Get efficient frontier data
 * @param {Object} requestBody - Frontier request parameters
 * @returns {Promise} Efficient frontier response
 */
async function getEfficientFrontier(requestBody) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/portfolio/efficient-frontier`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to calculate efficient frontier');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching efficient frontier:', error);
        handleApiError(error);
        throw error;
    }
}

/**
 * Save portfolio to database
 * @param {Object} portfolioData - Portfolio data to save
 * @returns {Promise} Portfolio ID
 */
async function savePortfolio(portfolioData) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/portfolio/save`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(portfolioData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to save portfolio');
        }

        return await response.json();
    } catch (error) {
        console.error('Error saving portfolio:', error);
        handleApiError(error);
        throw error;
    }
}

/**
 * Load saved portfolio
 * @param {string} portfolioId - Portfolio ID to load
 * @returns {Promise} Portfolio data
 */
async function loadPortfolio(portfolioId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/portfolio/load/${portfolioId}`);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to load portfolio');
        }

        return await response.json();
    } catch (error) {
        console.error('Error loading portfolio:', error);
        handleApiError(error);
        throw error;
    }
}

/**
 * Handle API errors and display user-friendly messages
 * @param {Error} error - Error object
 */
function handleApiError(error) {
    let message = 'An unexpected error occurred.';

    if (error.message) {
        message = error.message;
    } else if (error.toString().includes('Failed to fetch')) {
        message = 'Unable to connect to server. Please ensure the backend is running on port 8000.';
    }

    displayAlert(message, 'danger');
}

/**
 * Display alert message
 * @param {string} message - Alert message
 * @param {string} type - Alert type (success, danger, warning, info)
 */
function displayAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');

    const alert = document.createElement('div');
    alert.className = `alert alert-${type} alert-dismissible fade show`;
    alert.role = 'alert';
    alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    alertContainer.appendChild(alert);

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        alert.remove();
    }, 5000);
}
