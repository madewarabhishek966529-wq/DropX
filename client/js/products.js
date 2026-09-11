/**
 * ⚡ DropX - Products Catalog Page Controller
 */

document.addEventListener('DOMContentLoaded', async () => {
  const productsGrid = document.getElementById('products-grid');
  const searchInput = document.getElementById('catalog-search-input');
  const searchForm = document.getElementById('catalog-search-form');
  const categoryPills = document.querySelectorAll('.category-pill');
  const sortSelect = document.getElementById('sort-select');
  const dropsCheckbox = document.getElementById('drops-checkbox');
  const resultsCount = document.getElementById('results-count');

  // Extract query parameters from URL
  const urlParams = new URLSearchParams(window.location.search);
  let activeSearch = urlParams.get('search') || '';
  let activeCategory = urlParams.get('category') || 'All';
  let activeSort = urlParams.get('sort') || 'newest';
  let activeDropsOnly = urlParams.get('dropsOnly') === 'true';

  // Initialize UI inputs from URL params
  if (searchInput) searchInput.value = activeSearch;
  if (sortSelect) sortSelect.value = activeSort;
  if (dropsCheckbox) dropsCheckbox.checked = activeDropsOnly;

  categoryPills.forEach(pill => {
    if (pill.dataset.category.toLowerCase() === activeCategory.toLowerCase()) {
      pill.classList.add('active');
    } else {
      pill.classList.remove('active');
    }
  });

  // Watchlist set for fast star lookup
  let userWatchlistIds = new Set();
  if (window.Auth && window.Auth.isAuthenticated()) {
    try {
      const res = await window.API.getWatchlist();
      if (res && res.data) {
        userWatchlistIds = new Set(res.data.map(p => p._id));
      }
    } catch (e) {
      console.warn('Could not preload watchlist:', e.message);
    }
  }

  // Load and render products
  async function loadCatalog() {
    if (!productsGrid) return;

    productsGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 0;">
        <div style="font-size: 2.5rem; margin-bottom: 12px; animation: spin 1s infinite linear;">⚡</div>
        <p style="color: var(--text-secondary);">Tracking latest prices and drops across stores...</p>
      </div>
    `;

    try {
      const res = await window.API.getProducts({
        search: activeSearch,
        category: activeCategory,
        sort: activeSort,
        dropsOnly: activeDropsOnly
      });

      const products = res.data || [];

      if (resultsCount) {
        resultsCount.innerText = `${products.length} product${products.length === 1 ? '' : 's'} found`;
      }

      if (products.length === 0) {
        productsGrid.innerHTML = `
          <div class="empty-state" style="grid-column: 1/-1;">
            <div class="empty-icon">🔍</div>
            <h3 class="empty-title">No products found</h3>
            <p class="empty-text">We couldn't find any products matching your current filters. Try changing your search keywords or category.</p>
            <button id="reset-filters-btn" class="btn btn-outline btn-sm">Reset All Filters</button>
          </div>
        `;

        const resetBtn = document.getElementById('reset-filters-btn');
        if (resetBtn) {
          resetBtn.addEventListener('click', () => {
            activeSearch = '';
            activeCategory = 'All';
            activeSort = 'newest';
            activeDropsOnly = false;
            if (searchInput) searchInput.value = '';
            if (sortSelect) sortSelect.value = 'newest';
            if (dropsCheckbox) dropsCheckbox.checked = false;
            categoryPills.forEach(p => p.classList.toggle('active', p.dataset.category === 'All'));
            loadCatalog();
          });
        }
        return;
      }

      // Render cards
      productsGrid.innerHTML = products.map(product => {
        const isWatchlisted = userWatchlistIds.has(product._id);
        return window.createProductCardHTML(product, isWatchlisted);
      }).join('');

    } catch (error) {
      console.error('Failed to load products:', error);
      productsGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1/-1;">
          <div class="empty-icon">⚠️</div>
          <h3 class="empty-title">Failed to load products</h3>
          <p class="empty-text">${error.message || 'Please check your internet connection or server status.'}</p>
          <button onclick="window.location.reload()" class="btn btn-primary btn-sm">Retry</button>
        </div>
      `;
    }
  }

  // Filter Event Listeners
  if (searchForm) {
    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      activeSearch = searchInput ? searchInput.value.trim() : '';
      loadCatalog();
    });
  }

  categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
      categoryPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeCategory = pill.dataset.category;
      loadCatalog();
    });
  });

  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      activeSort = sortSelect.value;
      loadCatalog();
    });
  }

  if (dropsCheckbox) {
    dropsCheckbox.addEventListener('change', () => {
      activeDropsOnly = dropsCheckbox.checked;
      loadCatalog();
    });
  }

  // Initial load
  loadCatalog();
});
