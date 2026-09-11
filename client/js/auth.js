/**
 * ⚡ DropX - Authentication State Manager
 */

const Auth = {
  getToken() {
    return localStorage.getItem('dropx_token');
  },

  getUser() {
    const userStr = localStorage.getItem('dropx_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  },

  setSession(token, user) {
    localStorage.setItem('dropx_token', token);
    localStorage.setItem('dropx_user', JSON.stringify(user));
    this.updateNavAuth();
  },

  clearSession() {
    localStorage.removeItem('dropx_token');
    localStorage.removeItem('dropx_user');
    this.updateNavAuth();
  },

  isAuthenticated() {
    return !!this.getToken();
  },

  logout() {
    this.clearSession();
    if (window.showToast) {
      window.showToast('Logged out successfully', 'info');
    }
    setTimeout(() => {
      window.location.href = '/index.html';
    }, 500);
  },

  // Updates Navbar buttons and user avatar/links
  updateNavAuth() {
    const authContainer = document.getElementById('nav-auth-slot');
    if (!authContainer) return;

    const user = this.getUser();

    if (this.isAuthenticated() && user) {
      authContainer.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <a href="/dashboard.html" class="btn btn-outline btn-sm" title="Go to Dashboard">
            <span>👤</span>
            <span>${user.name.split(' ')[0]}</span>
          </a>
          <button id="logout-btn" class="btn btn-outline btn-sm" title="Log Out" style="color: var(--alert-red); border-color: var(--border-color);">
            🚪 Logout
          </button>
        </div>
      `;

      const logoutBtn = document.getElementById('logout-btn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.logout();
        });
      }
    } else {
      authContainer.innerHTML = `
        <div style="display: flex; align-items: center; gap: 8px;">
          <a href="/login.html" class="btn btn-outline btn-sm">Login</a>
          <a href="/signup.html" class="btn btn-primary btn-sm">Sign Up</a>
        </div>
      `;
    }
  },

  // Guard protected pages
  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = `/login.html?redirect=${encodeURIComponent(window.location.pathname)}`;
    }
  }
};

window.Auth = Auth;

// Update nav on DOM load
document.addEventListener('DOMContentLoaded', () => {
  Auth.updateNavAuth();
});
