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
 * Render normalized price chart
 * @param {Object} stockData - Historical stock data
 */
function renderNormalizedPrices(stockData) {
    if (!stockData || !stockData.dates || stockData.dates.length === 0) {
        return;
    }

    const traces = [];

    for (const ticker of stockData.tickers) {
        const prices = stockData.prices[ticker];
        const startPrice = prices[0];

        // Normalize prices (start at 1.0)
        const normalizedPrices = prices.map(p => p / startPrice);

        traces.push({
            x: stockData.dates,
            y: normalizedPrices,
            mode: 'lines',
            name: ticker,
            type: 'scatter',
            hovertemplate: `<b>${ticker}</b><br>%{y:.2f}x<extra></extra>`
        });
    }

    const layout = {
        title: 'Normalized Stock Performance (Starting Value = 1.0)',
        xaxis: {
            title: 'Date'
        },
        yaxis: {
            title: 'Relative Performance',
            tickformat: '.2f'
        },
        template: 'plotly_white',
        hovermode: 'x unified',
        height: 400,
        showlegend: true
    };

    const config = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false
    };

    Plotly.newPlot('normalizedPriceChart', traces, layout, config);
}

/**
 * Render backtest chart showing portfolio growth
 * @param {Object} stockData - Historical stock data
 * @param {Object} weights - Portfolio weights
 * @param {number} initialInvestment - Starting investment amount
 */
function renderBacktestChart(stockData, weights, initialInvestment) {
    if (!stockData || !stockData.dates || stockData.dates.length === 0) {
        return;
    }

    // Calculate portfolio value over time
    const portfolioValues = [];

    for (let i = 0; i < stockData.dates.length; i++) {
        let portfolioValue = 0;

        for (const [ticker, weight] of Object.entries(weights)) {
            if (weight > 0.001) {
                const prices = stockData.prices[ticker];
                const startPrice = prices[0];
                const currentPrice = prices[i];
                const priceRatio = currentPrice / startPrice;
                portfolioValue += (initialInvestment * weight * priceRatio);
            }
        }

        portfolioValues.push(portfolioValue);
    }

    const trace = {
        x: stockData.dates,
        y: portfolioValues,
        mode: 'lines',
        name: 'Portfolio Value',
        type: 'scatter',
        fill: 'tozeroy',
        line: {
            color: 'rgb(46, 125, 50)',
            width: 2
        },
        hovertemplate: '<b>Portfolio Value</b><br>$%{y:,.2f}<extra></extra>'
    };

    const finalValue = portfolioValues[portfolioValues.length - 1];
    const totalReturn = ((finalValue - initialInvestment) / initialInvestment * 100);

    const layout = {
        title: `Portfolio Growth (Total Return: ${totalReturn >= 0 ? '+' : ''}${totalReturn.toFixed(2)}%)`,
        xaxis: {
            title: 'Date'
        },
        yaxis: {
            title: 'Portfolio Value ($)',
            tickformat: '$,.0f'
        },
        template: 'plotly_white',
        hovermode: 'x',
        height: 400,
        showlegend: false
    };

    const config = {
        responsive: true,
        displayModeBar: true,
        displaylogo: false
    };

    Plotly.newPlot('backtestChart', [trace], layout, config);

    // Update portfolio return card
    document.getElementById('portfolioReturn').textContent = `${totalReturn >= 0 ? '+' : ''}${totalReturn.toFixed(2)}%`;
    document.getElementById('portfolioReturn').className = `mb-0 ${totalReturn >= 0 ? 'text-success' : 'text-danger'}`;
}

/**
 * Render correlation heatmap
 * @param {Object} stockData - Historical stock data
 */
function renderCorrelationHeatmap(stockData) {
    if (!stockData || !stockData.tickers || stockData.tickers.length === 0) {
        return;
    }

    const tickers = stockData.tickers;
    const n = tickers.length;

    // Calculate correlation matrix
    const correlationMatrix = [];

    for (let i = 0; i < n; i++) {
        const row = [];
        for (let j = 0; j < n; j++) {
            if (i === j) {
                row.push(1.0);
            } else {
                const corr = calculateCorrelation(
                    stockData.prices[tickers[i]],
                    stockData.prices[tickers[j]]
                );
                row.push(corr);
            }
        }
        correlationMatrix.push(row);
    }

    const trace = {
        z: correlationMatrix,
        x: tickers,
        y: tickers,
        type: 'heatmap',
        colorscale: 'RdBu',
        zmid: 0,
        zmin: -1,
        zmax: 1,
        colorbar: {
            title: 'Correlation'
        },
        hovertemplate: '%{y} vs %{x}<br>Correlation: %{z:.3f}<extra></extra>'
    };

    const layout = {
        title: 'Stock Return Correlation Matrix',
        template: 'plotly_white',
        height: 400,
        xaxis: {
            side: 'bottom'
        },
        yaxis: {
            autorange: 'reversed'
        }
    };

    const config = {
        responsive: true,
        displayModeBar: false
    };

    Plotly.newPlot('correlationHeatmap', [trace], layout, config);
}

/**
 * Calculate Pearson correlation between two arrays
 * @param {Array} x - First array
 * @param {Array} y - Second array
 * @returns {number} Correlation coefficient
 */
function calculateCorrelation(x, y) {
    const n = x.length;
    if (n === 0 || n !== y.length) return 0;

    // Calculate returns instead of using prices
    const returnsX = [];
    const returnsY = [];

    for (let i = 1; i < n; i++) {
        returnsX.push((x[i] - x[i-1]) / x[i-1]);
        returnsY.push((y[i] - y[i-1]) / y[i-1]);
    }

    const meanX = returnsX.reduce((a, b) => a + b, 0) / returnsX.length;
    const meanY = returnsY.reduce((a, b) => a + b, 0) / returnsY.length;

    let numerator = 0;
    let sumSqX = 0;
    let sumSqY = 0;

    for (let i = 0; i < returnsX.length; i++) {
        const diffX = returnsX[i] - meanX;
        const diffY = returnsY[i] - meanY;
        numerator += diffX * diffY;
        sumSqX += diffX * diffX;
        sumSqY += diffY * diffY;
    }

    const denominator = Math.sqrt(sumSqX * sumSqY);
    if (denominator === 0) return 0;

    return numerator / denominator;
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
