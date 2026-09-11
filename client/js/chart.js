/**
 * ⚡ DropX - Interactive Chart.js Price History Visualizer
 */

let priceChartInstance = null;
let rawPriceHistory = [];
let currentProductPrice = null;

/**
 * Filter price history points based on timeframe selection
 */
function filterHistoryByTimeframe(history, timeframe) {
  if (!history || history.length === 0) return [];

  const now = new Date();
  let daysThreshold = 365;

  switch (timeframe) {
    case '7d':
      daysThreshold = 7;
      break;
    case '30d':
      daysThreshold = 30;
      break;
    case '3m':
      daysThreshold = 90;
      break;
    case '6m':
      daysThreshold = 180;
      break;
    case '1y':
    default:
      daysThreshold = 365;
      break;
  }

  const cutoff = new Date();
  cutoff.setDate(now.getDate() - daysThreshold);

  let filtered = history.filter(item => new Date(item.date) >= cutoff);

  // If filtered is empty or only has 1 point, include at least the initial baseline and current price
  if (filtered.length <= 1 && history.length > 0) {
    filtered = [...history];
  }

  // Ensure items are sorted chronologically
  filtered.sort((a, b) => new Date(a.date) - new Date(b.date));

  return filtered;
}

/**
 * Renders or updates the Chart.js line chart
 */
function renderPriceHistoryChart(historyData, currentPrice, timeframe = '1y') {
  rawPriceHistory = historyData || [];
  currentProductPrice = currentPrice;

  const canvas = document.getElementById('priceHistoryChart');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const isLight = document.body.classList.contains('light-theme');

  const filteredData = filterHistoryByTimeframe(rawPriceHistory, timeframe);

  // Labels and values
  const labels = filteredData.map(item => {
    const d = new Date(item.date);
    return d.toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      year: timeframe === '1y' || timeframe === '6m' ? '2-digit' : undefined
    });
  });

  const prices = filteredData.map(item => item.price);

  // Destroy previous instance
  if (priceChartInstance) {
    priceChartInstance.destroy();
  }

  // Gradient fill
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  if (isLight) {
    gradient.addColorStop(0, 'rgba(2, 132, 199, 0.25)');
    gradient.addColorStop(1, 'rgba(2, 132, 199, 0.01)');
  } else {
    gradient.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
    gradient.addColorStop(1, 'rgba(56, 189, 248, 0.01)');
  }

  const primaryColor = isLight ? '#0284c7' : '#38bdf8';
  const gridColor = isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.07)';
  const textColor = isLight ? '#64748b' : '#94a3b8';

  priceChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Price (INR)',
          data: prices,
          borderColor: primaryColor,
          backgroundColor: gradient,
          borderWidth: 3,
          pointBackgroundColor: primaryColor,
          pointBorderColor: isLight ? '#ffffff' : '#0a0e17',
          pointBorderWidth: 2,
          pointRadius: prices.length > 15 ? 3 : 5,
          pointHoverRadius: 7,
          pointHoverBackgroundColor: '#10b981',
          pointHoverBorderColor: '#ffffff',
          tension: 0.35,
          fill: true
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: isLight ? '#0f172a' : '#1e293b',
          titleColor: '#f8fafc',
          bodyColor: '#38bdf8',
          bodyFont: {
            size: 14,
            weight: 'bold'
          },
          padding: 12,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            label: function (context) {
              return `Price: ${window.formatCurrency ? window.formatCurrency(context.parsed.y) : '₹' + context.parsed.y.toLocaleString('en-IN')}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            color: gridColor
          },
          ticks: {
            color: textColor,
            font: {
              size: 12
            }
          }
        },
        y: {
          grid: {
            color: gridColor
          },
          ticks: {
            color: textColor,
            font: {
              size: 12
            },
            callback: function (value) {
              if (value >= 100000) {
                return '₹' + (value / 100000).toFixed(1) + 'L';
              }
              if (value >= 1000) {
                return '₹' + (value / 1000).toFixed(0) + 'k';
              }
              return '₹' + value;
            }
          }
        }
      }
    }
  });
}

/**
 * Timeframe buttons handler
 */
function initTimeframeButtons() {
  const buttons = document.querySelectorAll('.timeframe-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const timeframe = btn.dataset.timeframe;
      renderPriceHistoryChart(rawPriceHistory, currentProductPrice, timeframe);
    });
  });
}

// React to global theme change
window.onThemeChange = function () {
  const activeBtn = document.querySelector('.timeframe-btn.active');
  const tf = activeBtn ? activeBtn.dataset.timeframe : '1y';
  if (rawPriceHistory.length > 0) {
    renderPriceHistoryChart(rawPriceHistory, currentProductPrice, tf);
  }
};

window.renderPriceHistoryChart = renderPriceHistoryChart;
window.initTimeframeButtons = initTimeframeButtons;
