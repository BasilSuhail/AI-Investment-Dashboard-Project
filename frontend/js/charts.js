/**
 * Chart Rendering Module
 * Handles all Plotly chart visualizations
 */

/**
 * Render Efficient Frontier scatter plot
 * @param {Object} data - Frontier data with simulated and optimal portfolios
 */
function renderEfficientFrontier(data) {
    const { simulated_portfolios, optimal_portfolios } = data;

    // Hide empty state
    document.getElementById('emptyState').style.display = 'none';

    // Simulated portfolios trace
    const simulatedTrace = {
        x: simulated_portfolios.volatilities,
        y: simulated_portfolios.returns,
        mode: 'markers',
        type: 'scatter',
        name: 'Simulated Portfolios',
        marker: {
            size: 3,
            color: simulated_portfolios.sharpe_ratios,
            colorscale: 'Viridis',
            showscale: true,
            colorbar: {
                title: 'Sharpe Ratio',
                titleside: 'right'
            },
            opacity: 0.6
        },
        hovertemplate: 'Return: %{y:.2%}<br>Volatility: %{x:.2%}<extra></extra>'
    };

    // Max Sharpe portfolio trace
    const maxSharpeTrace = {
        x: [optimal_portfolios.max_sharpe.performance.volatility],
        y: [optimal_portfolios.max_sharpe.performance.expected_return],
        mode: 'markers',
        type: 'scatter',
        name: 'Max Sharpe Ratio ⭐',
        marker: {
            size: 20,
            color: 'gold',
            symbol: 'star',
            line: {
                color: 'black',
                width: 2
            }
        },
        hovertemplate: '<b>Max Sharpe Ratio</b><br>Return: %{y:.2%}<br>Volatility: %{x:.2%}<br>Sharpe: ' +
                        optimal_portfolios.max_sharpe.performance.sharpe_ratio.toFixed(2) + '<extra></extra>'
    };

    // Min Volatility portfolio trace
    const minVolTrace = {
        x: [optimal_portfolios.min_volatility.performance.volatility],
        y: [optimal_portfolios.min_volatility.performance.expected_return],
        mode: 'markers',
        type: 'scatter',
        name: 'Min Volatility 🔷',
        marker: {
            size: 20,
            color: 'dodgerblue',
            symbol: 'diamond',
            line: {
                color: 'black',
                width: 2
            }
        },
        hovertemplate: '<b>Min Volatility</b><br>Return: %{y:.2%}<br>Volatility: %{x:.2%}<br>Sharpe: ' +
                        optimal_portfolios.min_volatility.performance.sharpe_ratio.toFixed(2) + '<extra></extra>'
    };

    const layout = {
        title: 'Efficient Frontier Analysis',
        xaxis: {
            title: 'Volatility (Risk)',
            tickformat: '.1%'
        },
        yaxis: {
            title: 'Expected Annual Return',
            tickformat: '.1%'
        },
        template: 'plotly_white',
        hovermode: 'closest',
        height: 500,
        showlegend: true,
        legend: {
            x: 0.01,
            y: 0.99,
            bgcolor: 'rgba(255, 255, 255, 0.8)',
            bordercolor: 'black',
            borderwidth: 1
        }
    };

    const config = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false
    };

    Plotly.newPlot('efficientFrontierChart', [simulatedTrace, maxSharpeTrace, minVolTrace], layout, config);
}

/**
 * Render portfolio allocation donut chart
 * @param {Object} weights - Portfolio weights
 * @param {Object} allocations - Dollar allocations
 */
function renderAllocationChart(weights, allocations) {
    // Filter out zero weights
    const labels = [];
    const values = [];
    const text = [];

    for (const [ticker, weight] of Object.entries(weights)) {
        if (weight > 0.001) { // Filter out tiny allocations
            labels.push(ticker);
            values.push(weight);
            text.push(`$${allocations[ticker].toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`);
        }
    }

    const data = [{
        values: values,
        labels: labels,
        type: 'pie',
        hole: 0.4,
        text: text,
        textposition: 'inside',
        textinfo: 'label+percent',
        hovertemplate: '<b>%{label}</b><br>%{percent}<br>%{text}<extra></extra>',
        marker: {
            line: {
                color: 'white',
                width: 2
            }
        }
    }];

    const layout = {
        title: 'Optimal Allocation (Max Sharpe)',
        template: 'plotly_white',
        showlegend: true,
        height: 400,
        legend: {
            orientation: 'v',
            x: 1.1,
            y: 0.5
        }
    };

    const config = {
        responsive: true,
        displayModeBar: false
    };

    Plotly.newPlot('allocationChart', data, layout, config);
}

/**
 * Render performance metrics cards
 * @param {Object} performance - Performance metrics
 */
function renderMetricsCards(performance) {
    const returnMetric = document.getElementById('returnMetric');
    const volatilityMetric = document.getElementById('volatilityMetric');
    const sharpeMetric = document.getElementById('sharpeMetric');

    // Format and display metrics
    returnMetric.textContent = (performance.expected_return * 100).toFixed(2) + '%';
    volatilityMetric.textContent = (performance.volatility * 100).toFixed(2) + '%';
    sharpeMetric.textContent = performance.sharpe_ratio.toFixed(2);

    // Color coding
    returnMetric.className = 'mb-0 ' + (performance.expected_return > 0 ? 'metric-positive' : 'metric-negative');
    sharpeMetric.className = 'mb-0 ' + (performance.sharpe_ratio > 1 ? 'metric-positive' : 'metric-negative');
}

/**
 * Render market data table
 * @param {Object} stockData - Historical stock data
 */
function renderMarketDataTable(stockData) {
    const container = document.getElementById('marketDataTable');

    if (!stockData || !stockData.dates || stockData.dates.length === 0) {
        container.innerHTML = '<p class="text-muted">No data available</p>';
        return;
    }

    // Build table HTML
    let tableHTML = '<table class="table table-striped table-sm table-hover"><thead><tr>';
    tableHTML += '<th>Date</th>';

    for (const ticker of stockData.tickers) {
        tableHTML += `<th>${ticker}</th>`;
    }

    tableHTML += '</tr></thead><tbody>';

    // Add rows (show last 100 entries)
    const maxRows = Math.min(100, stockData.dates.length);
    const startIdx = stockData.dates.length - maxRows;

    for (let i = startIdx; i < stockData.dates.length; i++) {
        tableHTML += `<tr><td>${stockData.dates[i]}</td>`;

        for (const ticker of stockData.tickers) {
            const price = stockData.prices[ticker][i];
            tableHTML += `<td>$${price.toFixed(2)}</td>`;
        }

        tableHTML += '</tr>';
    }

    tableHTML += '</tbody></table>';

    if (stockData.dates.length > maxRows) {
        tableHTML += `<p class="text-muted small">Showing last ${maxRows} of ${stockData.dates.length} days</p>`;
    }

    container.innerHTML = tableHTML;
}
