/**
 * ⚡ DropX - User Dashboard Page Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Enforce authentication
  if (!window.Auth || !window.Auth.isAuthenticated()) {
    window.Auth.requireAuth();
    return;
  }

  const user = window.Auth.getUser();
  const userNameEl = document.getElementById('user-name-display');
  const userEmailEl = document.getElementById('user-email-display');
  const statWatchlistCount = document.getElementById('stat-watchlist-count');
  const statAlertsCount = document.getElementById('stat-alerts-count');
  const statSavings = document.getElementById('stat-savings');

  const watchlistContainer = document.getElementById('watchlist-container');
  const alertsContainer = document.getElementById('alerts-container');
  const recentDropsContainer = document.getElementById('recent-drops-container');

  if (userNameEl && user) userNameEl.innerText = user.name;
  if (userEmailEl && user) userEmailEl.innerText = user.email;

  // Load Dashboard Data
  async function loadDashboard() {
    try {
      // 1. Fetch Watchlist
      const watchlistRes = await window.API.getWatchlist();
      const watchlist = watchlistRes.data || [];

      if (statWatchlistCount) statWatchlistCount.innerText = watchlist.length;

      // Calculate potential savings
      let totalSavings = 0;
      watchlist.forEach(item => {
        if (item.highestPrice && item.highestPrice > item.currentPrice) {
          totalSavings += (item.highestPrice - item.currentPrice);
        }
      });
      if (statSavings) statSavings.innerText = window.formatCurrency(totalSavings);

      renderWatchlist(watchlist);

      // 2. Fetch Alerts
      const alertsRes = await window.API.getAlerts();
      const alerts = alertsRes.data || [];
      if (statAlertsCount) statAlertsCount.innerText = alerts.length;

      renderAlerts(alerts);

      // 3. Fetch Recent Drops
      loadRecentDrops();

    } catch (error) {
      console.error('Error loading dashboard:', error);
      if (window.showToast) window.showToast('Could not load some dashboard data', 'error');
    }
  }

  // Render Watchlist Section
  function renderWatchlist(items) {
    if (!watchlistContainer) return;

    if (items.length === 0) {
      watchlistContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⭐</div>
          <h3 class="empty-title">Your Watchlist is Empty</h3>
          <p class="empty-text">Track your favorite gadgets, laptops, and smartphones to see them here.</p>
          <a href="/products.html" class="btn btn-primary btn-sm">Explore Products</a>
        </div>
      `;
      return;
    }

    watchlistContainer.innerHTML = `
      <div style="overflow-x: auto;">
        <table class="store-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Current Price</th>
              <th>Lowest Recorded</th>
              <th>Price Drop</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${items.map(item => `
              <tr id="watchlist-row-${item._id}">
                <td>
                  <div style="display: flex; align-items: center; gap: 14px;">
                    <img src="${item.image}" alt="${item.name}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 8px;">
                    <div>
                      <a href="/product.html?id=${item._id}" style="font-weight: 700; color: var(--text-primary);">
                        ${item.name}
                      </a>
                      <div style="font-size: 0.8rem; color: var(--text-muted);">${item.brand}</div>
                    </div>
                  </div>
                </td>
                <td><span class="badge-tag">${item.category}</span></td>
                <td style="font-weight: 700; font-size: 1.1rem; color: var(--text-primary);">
                  ${window.formatCurrency(item.currentPrice)}
                </td>
                <td style="color: var(--drop-green); font-weight: 600;">
                  ${window.formatCurrency(item.lowestPrice || item.currentPrice)}
                </td>
                <td>
                  ${(item.priceDropPercentage > 0)
                    ? `<span class="card-badge-drop" style="position: static; display: inline-flex;">⬇️ ${item.priceDropPercentage}%</span>`
                    : '<span style="color: var(--text-muted); font-size: 0.85rem;">Stable</span>'
                  }
                </td>
                <td>
                  <div style="display: flex; gap: 8px;">
                    <a href="/product.html?id=${item._id}" class="btn btn-outline btn-sm">View</a>
                    <button class="btn btn-danger btn-sm" onclick="removeWatchlistItem('${item._id}')" title="Remove from watchlist">
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // Render Alerts Section
  function renderAlerts(alerts) {
    if (!alertsContainer) return;

    if (alerts.length === 0) {
      alertsContainer.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">🔔</div>
          <h3 class="empty-title">No Active Price Alerts</h3>
          <p class="empty-text">Set target price alerts on products to get notified instantly when prices drop.</p>
          <a href="/products.html" class="btn btn-primary btn-sm">Find Deals to Alert</a>
        </div>
      `;
      return;
    }

    alertsContainer.innerHTML = `
      <div style="overflow-x: auto;">
        <table class="store-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Current Price</th>
              <th>Target Alert Price</th>
              <th>Target Difference</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${alerts.map(a => {
              const prod = a.product || {};
              const current = prod.currentPrice || 0;
              const diff = current - a.targetPrice;
              const isTriggered = current <= a.targetPrice;

              return `
                <tr id="alert-row-${a._id}">
                  <td>
                    <div style="display: flex; align-items: center; gap: 14px;">
                      <img src="${prod.image || ''}" alt="${prod.name || ''}" style="width: 44px; height: 44px; object-fit: cover; border-radius: 8px;">
                      <div>
                        <a href="/product.html?id=${prod._id}" style="font-weight: 700; color: var(--text-primary);">
                          ${prod.name || 'Product'}
                        </a>
                      </div>
                    </div>
                  </td>
                  <td style="font-weight: 700;">${window.formatCurrency(current)}</td>
                  <td style="font-weight: 800; color: var(--accent-primary);">${window.formatCurrency(a.targetPrice)}</td>
                  <td>
                    ${isTriggered
                      ? `<span style="color: var(--drop-green); font-weight: bold;">🎉 Target Reached!</span>`
                      : `<span style="color: var(--text-muted); font-size: 0.9rem;">₹${diff.toLocaleString('en-IN')} to go</span>`
                    }
                  </td>
                  <td>
                    <span class="badge-tag" style="background: ${isTriggered ? 'var(--drop-green-bg)' : 'var(--bg-primary)'}; color: ${isTriggered ? 'var(--drop-green)' : 'var(--text-secondary)'};">
                      ${isTriggered ? 'Triggered' : 'Monitoring'}
                    </span>
                  </td>
                  <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteAlertItem('${a._id}')" title="Delete Alert">
                      Delete
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // Load Recent Drops Recommendation
  async function loadRecentDrops() {
    if (!recentDropsContainer) return;
    try {
      const res = await window.API.getProducts({ dropsOnly: true, limit: 4 });
      const drops = res.data || [];
      if (drops.length === 0) {
        recentDropsContainer.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: 20px;">No major price drops recorded today.</p>`;
        return;
      }
      recentDropsContainer.innerHTML = drops.map(p => window.createProductCardHTML(p)).join('');
    } catch (e) {
      console.error('Failed to load recent drops:', e);
    }
  }

  // Expose delete actions globally
  window.removeWatchlistItem = async function (id) {
    try {
      await window.API.removeFromWatchlist(id);
      const row = document.getElementById(`watchlist-row-${id}`);
      if (row) row.remove();
      window.showToast('Removed from Watchlist', 'info');
      // Refresh counts
      const res = await window.API.getWatchlist();
      if (statWatchlistCount) statWatchlistCount.innerText = res.data.length;
      if (res.data.length === 0) renderWatchlist([]);
    } catch (e) {
      window.showToast(e.message || 'Error removing item', 'error');
    }
  };

  window.deleteAlertItem = async function (id) {
    try {
      await window.API.deleteAlert(id);
      const row = document.getElementById(`alert-row-${id}`);
      if (row) row.remove();
      window.showToast('Alert deleted', 'info');
      const res = await window.API.getAlerts();
      if (statAlertsCount) statAlertsCount.innerText = res.data.length;
      if (res.data.length === 0) renderAlerts([]);
    } catch (e) {
      window.showToast(e.message || 'Error deleting alert', 'error');
    }
  };

  // Initial load
  loadDashboard();
});
