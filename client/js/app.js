/**
 * ⚡ DropX - Global Application Logic & Utilities
 */

// Format Currency to Indian Rupee (INR)
function formatCurrency(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

// Toast Notifications System
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icons = {
    success: '✅',
    error: '❌',
    info: '⚡'
  };

  toast.innerHTML = `
    <span>${icons[type] || '⚡'}</span>
    <div>${message}</div>
  `;

  container.appendChild(toast);

  // Trigger animation
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);

  // Auto remove
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentElement) {
        toast.parentElement.removeChild(toast);
      }
    }, 300);
  }, 4000);
}

// Dark / Light Mode Theme Management
const ThemeManager = {
  init() {
    const savedTheme = localStorage.getItem('dropx_theme') || 'dark';
    if (savedTheme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    this.updateToggleIcon();

    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleTheme());
    }
  },

  toggleTheme() {
    const isLight = document.body.classList.toggle('light-theme');
    localStorage.setItem('dropx_theme', isLight ? 'light' : 'dark');
    this.updateToggleIcon();

    // Notify chart.js if active
    if (window.onThemeChange) {
      window.onThemeChange(isLight ? 'light' : 'dark');
    }
  },

  updateToggleIcon() {
    const toggleBtn = document.getElementById('theme-toggle-btn');
    if (!toggleBtn) return;
    const isLight = document.body.classList.contains('light-theme');
    toggleBtn.innerHTML = isLight ? '🌙' : '☀️';
    toggleBtn.setAttribute('title', isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode');
  }
};

// Mobile Hamburger Menu Navigation
function initMobileMenu() {
  const toggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      toggle.innerHTML = navLinks.classList.contains('open') ? '✕' : '☰';
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!toggle.contains(e.target) && !navLinks.contains(e.target) && navLinks.classList.contains('open')) {
        navLinks.classList.remove('open');
        toggle.innerHTML = '☰';
      }
    });
  }
}

// Global Search Bar Handler
function initSearchBars() {
  const forms = document.querySelectorAll('.search-form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="text"]');
      if (input && input.value.trim()) {
        window.location.href = `/products.html?search=${encodeURIComponent(input.value.trim())}`;
      }
    });
  });
}

// Shared Product Card Renderer
function createProductCardHTML(product, isWatchlisted = false) {
  const dropPercent = product.priceDropPercentage || 0;
  const oldPrice = product.highestPrice && product.highestPrice > product.currentPrice ? product.highestPrice : null;

  return `
    <div class="product-card" data-id="${product._id}">
      <div class="card-image-wrap">
        <img src="${product.image}" alt="${product.name}" class="card-image" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&w=800&q=80'">
        ${dropPercent > 0 ? `<div class="card-badge-drop">⬇️ ${dropPercent}% Price Drop</div>` : ''}
        <div class="card-brand">${product.brand}</div>
      </div>
      <div class="card-body">
        <div class="card-category">${product.category}</div>
        <h3 class="card-title">
          <a href="/product.html?id=${product._id}">${product.name}</a>
        </h3>
        <div class="card-prices">
          <span class="price-current">${formatCurrency(product.currentPrice)}</span>
          ${oldPrice ? `<span class="price-old">${formatCurrency(oldPrice)}</span>` : ''}
        </div>
        <div class="card-meta">
          <span>🏪 ${product.stores ? product.stores.length : 3} Stores compared</span>
          <span style="color: ${product.recommendation && product.recommendation.color === 'green' ? 'var(--drop-green)' : 'var(--text-secondary)'}; font-weight: 600;">
            ${product.recommendation ? product.recommendation.icon + ' ' + product.recommendation.status : 'Track'}
          </span>
        </div>
        <div class="card-actions">
          <a href="/product.html?id=${product._id}" class="btn btn-primary btn-sm">
            Track Price
          </a>
          <button class="btn btn-outline btn-sm btn-watchlist-toggle" onclick="handleWatchlistToggle('${product._id}', this)" title="Add to Watchlist">
            ${isWatchlisted ? '★' : '☆'}
          </button>
        </div>
      </div>
    </div>
  `;
}

// Global Watchlist Toggle Handler
async function handleWatchlistToggle(productId, btnElement) {
  if (!window.Auth || !window.Auth.isAuthenticated()) {
    showToast('Please login to add products to your watchlist', 'info');
    setTimeout(() => {
      window.location.href = `/login.html?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
    }, 1000);
    return;
  }

  const isStarred = btnElement.innerText === '★';

  try {
    if (isStarred) {
      await window.API.removeFromWatchlist(productId);
      btnElement.innerText = '☆';
      btnElement.style.color = '';
      showToast('Removed from Watchlist', 'info');
    } else {
      await window.API.addToWatchlist(productId);
      btnElement.innerText = '★';
      btnElement.style.color = '#f59e0b';
      showToast('Added to Watchlist!', 'success');
    }
  } catch (error) {
    if (error.message && error.message.includes('already in your watchlist')) {
      btnElement.innerText = '★';
      btnElement.style.color = '#f59e0b';
      showToast('Already in your Watchlist', 'info');
    } else {
      showToast(error.message || 'Could not update watchlist', 'error');
    }
  }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init();
  initMobileMenu();
  initSearchBars();
});

// Expose globally
window.formatCurrency = formatCurrency;
window.showToast = showToast;
window.createProductCardHTML = createProductCardHTML;
window.handleWatchlistToggle = handleWatchlistToggle;
