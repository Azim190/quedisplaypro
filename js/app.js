/**
 * DMC Dar Makkah Engineering Consultancy
 * Main Application Orchestrator & Router
 */

const DMCApp = {
  currentUser: null,

  init() {
    // 1. Guard route: redirect if not logged in
    this.currentUser = DMCAuth.requireAuth();
    if (!this.currentUser) return;

    // 2. Initialize Theme
    const savedTheme = DMCStore.getTheme();
    DMCStore.setTheme(savedTheme);
    this.updateThemeTogglePill(savedTheme);

    // 3. Populate User Profile in Header & Sidebar
    this.renderUserProfile();

    // 4. Bind Global UI Events
    this.bindGlobalEvents();

    // 5. Initialize Sub-modules
    DMCDashboard.init();
    DMCQuotations.init();
    DMCForm.init();
    DMCRevisions.init();
    DMCSettings.init();
    DMCAudit.init();

    // 6. Router Setup
    window.addEventListener('hashchange', () => this.handleRouting());
    this.handleRouting();
  },

  renderUserProfile() {
    const isAr = getLang() === 'ar';
    const name = isAr ? this.currentUser.nameAr : this.currentUser.nameEn;
    const roleText = this.currentUser.role === 'admin' ? 
      (isAr ? 'مدير النظام' : 'Administrator') : 
      (isAr ? 'مهندس استشاري' : 'Consultant Engineer');

    // Sidebar Profile
    const sidebarName = document.getElementById('sidebar-user-name');
    const sidebarRole = document.getElementById('sidebar-user-role');
    const sidebarAvatar = document.getElementById('sidebar-user-avatar');

    if (sidebarName) sidebarName.textContent = name;
    if (sidebarRole) sidebarRole.textContent = roleText;
    if (sidebarAvatar) sidebarAvatar.textContent = (this.currentUser.nameEn || 'U').charAt(0);

    // Header Profile
    const headerName = document.getElementById('header-user-name');
    const headerRole = document.getElementById('header-user-role');
    const headerAvatar = document.getElementById('header-user-avatar');

    if (headerName) headerName.textContent = name;
    if (headerRole) headerRole.textContent = roleText;
    if (headerAvatar) headerAvatar.textContent = (this.currentUser.nameEn || 'U').charAt(0);

    // Role-based UI visibility: hide Settings tab for non-admins
    if (!DMCAuth.isAdmin()) {
      const settingsNav = document.getElementById('nav-item-settings');
      if (settingsNav) settingsNav.style.display = 'none';
    }
  },

  bindGlobalEvents() {
    // Sidebar Toggle for Mobile/Tablet
    const toggleBtn = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');

    if (toggleBtn && sidebar && backdrop) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('show');
        backdrop.classList.toggle('show');
      });

      backdrop.addEventListener('click', () => {
        sidebar.classList.remove('show');
        backdrop.classList.remove('show');
      });
    }

    // Language Toggle
    const langBtn = document.getElementById('header-lang-btn');
    if (langBtn) {
      langBtn.addEventListener('click', () => {
        toggleLang();
        this.renderUserProfile();
      });
    }

    // Theme Toggle Pill
    const themePill = document.getElementById('theme-toggle-pill');
    if (themePill) {
      themePill.addEventListener('click', () => {
        const next = DMCStore.toggleTheme();
        this.updateThemeTogglePill(next);
        // Refresh charts on theme switch
        DMCDashboard.renderAll();
      });
    }

    // Add Quotation Buttons
    document.querySelectorAll('.btn-trigger-add-quotation').forEach(btn => {
      btn.addEventListener('click', () => {
        DMCForm.openNew();
      });
    });

    // Logout Buttons
    document.querySelectorAll('.btn-trigger-logout').forEach(btn => {
      btn.addEventListener('click', () => {
        if (confirm('هل ترغب في تسجيل الخروج من النظام؟ / Do you want to log out?')) {
          DMCStore.logout();
          window.location.href = 'index.html';
        }
      });
    });
  },

  updateThemeTogglePill(theme) {
    const pill = document.getElementById('theme-toggle-pill');
    if (pill) {
      pill.setAttribute('data-theme', theme);
    }
  },

  handleRouting() {
    const hash = window.location.hash || '#dashboard';
    const viewName = hash.replace('#', '').split('/')[0] || 'dashboard';

    // Role protection for settings
    if (viewName === 'settings' && !DMCAuth.isAdmin()) {
      alert('عذراً، هذا القسم مخصص لمدير النظام فقط / Access restricted to Administrators only.');
      window.location.hash = '#dashboard';
      return;
    }

    // Update active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href') === `#${viewName}`) {
        item.classList.add('active');
      }
    });

    // Toggle views
    document.querySelectorAll('.page-view').forEach(view => {
      view.style.display = 'none';
    });

    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) {
      targetView.style.display = 'block';
    } else {
      const defaultView = document.getElementById('view-dashboard');
      if (defaultView) defaultView.style.display = 'block';
    }

    // Close mobile sidebar on route switch
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.classList.remove('show');
    if (backdrop) backdrop.classList.remove('show');
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = 'fa-solid fa-circle-info';
    if (type === 'success') iconClass = 'fa-solid fa-circle-check' ;
    if (type === 'error') iconClass = 'fa-solid fa-circle-xmark';
    if (type === 'warning') iconClass = 'fa-solid fa-triangle-exclamation';

    toast.innerHTML = `
      <i class="${iconClass}" style="font-size: 1.25rem;"></i>
      <div style="flex: 1; font-weight: 700; font-size: 0.92rem;">${message}</div>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
};

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  DMCApp.init();
});
