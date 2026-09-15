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
    if (typeof DMCReports !== 'undefined') DMCReports.init();
    if (typeof DMCContracts !== 'undefined') DMCContracts.init();

    // 6. Router Setup — robust direct click interception on every sidebar link
    // We intercept clicks instead of relying solely on hashchange because
    // some browsers don't fire hashchange when the sidebar parent has overflow:hidden.
    document.querySelectorAll('.sidebar-nav .nav-item[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('href');
        if (window.location.hash !== target) {
          window.location.hash = target;
        }
        // Always call routing explicitly
        this.handleRouting();
      });
    });

    // Keep hashchange as a safety fallback (browser back/forward, direct URL changes)
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
        if (typeof DMCReports !== 'undefined') DMCReports.renderAll();
      });
    }

    // Database Connection Status Indicator
    const updateDbBadge = (connected) => {
      const badge = document.getElementById('db-status-badge');
      const text = document.getElementById('db-status-text');
      if (!badge || !text) return;
      const isAr = typeof getLang === 'function' && getLang() === 'ar';

      if (connected) {
        badge.classList.remove('fallback');
        text.textContent = isAr ? 'قاعدة بيانات SQLite متصلة' : 'SQLite DB Connected';
        badge.title = isAr ? 'قاعدة البيانات المركزية متصلة وجاهزة للحفظ' : 'Central SQLite Database Connected';
      } else {
        badge.classList.add('fallback');
        text.textContent = isAr ? 'التخزين المحلي' : 'Local Storage';
        badge.title = isAr ? 'يعمل النظام عبر التخزين المحلي بدون خادم' : 'Running on browser local storage fallback';
      }
    };

    if (typeof DMCApi !== 'undefined') {
      updateDbBadge(DMCApi.isConnected);
      window.addEventListener('dmc-db-status', (e) => {
        updateDbBadge(e.detail && e.detail.connected);
      });
      window.addEventListener('dmc-lang-changed', () => {
        updateDbBadge(DMCApi.isConnected);
      });
    }

    // Add Quotation Buttons
    document.querySelectorAll('.btn-trigger-add-quotation').forEach(btn => {
      btn.addEventListener('click', () => {
        DMCForm.openNew();
      });
    });

    // Add Contract Buttons
    document.querySelectorAll('.btn-trigger-add-contract').forEach(btn => {
      btn.addEventListener('click', () => {
        if (typeof DMCContracts !== 'undefined') {
          DMCContracts.openNew();
        }
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

    // Always remove any lingering modal-open class on navigation
    document.body.classList.remove('modal-open');

    // Dismiss any open modals on navigation
    document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));

    // Toggle views using CSS class (avoids inline-style specificity conflicts)
    document.querySelectorAll('.page-view').forEach(view => {
      view.classList.add('page-view-hidden');
      view.style.display = '';
    });

    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) {
      targetView.classList.remove('page-view-hidden');
      targetView.style.display = '';
      if (viewName === 'contracts' && typeof DMCContracts !== 'undefined') {
        DMCContracts.render();
      }
      if (viewName === 'quotations' && typeof DMCQuotations !== 'undefined') {
        DMCQuotations.render();
      }
      if (viewName === 'dashboard' && typeof DMCDashboard !== 'undefined') {
        DMCDashboard.renderAll();
      }
      if (viewName === 'audit' && typeof DMCAudit !== 'undefined') {
        DMCAudit.render();
      }
    } else {
      const defaultView = document.getElementById('view-dashboard');
      if (defaultView) defaultView.classList.remove('page-view-hidden');
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
  },

  // -----------------------------------------------------------------------
  // Custom confirm dialog (replaces native confirm() which may be blocked)
  // Usage: DMCApp.confirm('Are you sure?', () => { /* on yes */ });
  // -----------------------------------------------------------------------
  _confirmCallback: null,

  confirm(message, onConfirm) {
    const modal = document.getElementById('modal-confirm');
    const msgEl = document.getElementById('modal-confirm-message');
    if (!modal || !msgEl) {
      // Fallback to native confirm if modal not in DOM
      if (window.confirm(message)) onConfirm();
      return;
    }
    msgEl.textContent = message;
    this._confirmCallback = onConfirm;
    modal.classList.add('active');
  },

  confirmOk() {
    const modal = document.getElementById('modal-confirm');
    if (modal) modal.classList.remove('active');
    if (typeof this._confirmCallback === 'function') {
      this._confirmCallback();
    }
    this._confirmCallback = null;
  },

  confirmCancel() {
    const modal = document.getElementById('modal-confirm');
    if (modal) modal.classList.remove('active');
    this._confirmCallback = null;
  },

  /**
   * Returns true if the URL points to a cloud storage FOLDER (not a specific file).
   * Used to warn users that they should save a direct file link instead.
   */
  isFolderUrl(url) {
    if (!url) return false;
    const u = String(url).trim();
    // Google Drive folder URL (no fileId in query string)
    if (/drive\.google\.com\/(?:drive\/(?:u\/\d+\/)?folders\/)/i.test(u) && !/[?&](?:fileId)=/i.test(u)) return true;
    // OneDrive personal folder navigation URL (onedrive.live.com/?id= without resid)
    if (u.includes('onedrive.live.com') && u.match(/[?&]id=/i) && !u.includes('resid=')) return true;
    // SharePoint folder path pattern (/:f:/)
    if (u.includes('.sharepoint.com') && u.includes('/:f:/')) return true;
    return false;
  },

  /**
   * Transforms Drive URLs (Google Drive, OneDrive, SharePoint, Docs) to clean,
   * single-file isolated preview mode, preventing folder directory listings.
   *
   * Returns the original URL unchanged for folder-type links so callers can
   * detect them with isFolderUrl() and show appropriate warnings.
   */
  formatDrivePreviewUrl(url) {
    if (!url) return '';
    let cleanUrl = String(url).trim();

    // Add protocol if missing
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://') &&
        !cleanUrl.startsWith('data:') && !cleanUrl.startsWith('blob:')) {
      if (cleanUrl.includes('.') && !cleanUrl.includes(' ')) {
        cleanUrl = 'https://' + cleanUrl;
      }
    }

    // 1. Google Drive File: /file/d/ID/... or open?id=ID or uc?id=ID
    const gDriveFileMatch = cleanUrl.match(/drive\.google\.com\/(?:file\/d\/([a-zA-Z0-9_-]+)|(?:open|uc)\?(?:[^\s]*&)?id=([a-zA-Z0-9_-]+))/i);
    if (gDriveFileMatch) {
      const fileId = gDriveFileMatch[1] || gDriveFileMatch[2];
      return `https://drive.google.com/file/d/${fileId}/preview`;
    }

    // 2. Google Docs / Sheets / Slides — convert to /preview
    const gDocsMatch = cleanUrl.match(/docs\.google\.com\/(document|spreadsheets|presentation)\/d\/([a-zA-Z0-9_-]+)/i);
    if (gDocsMatch) {
      return `https://docs.google.com/${gDocsMatch[1]}/d/${gDocsMatch[2]}/preview`;
    }

    // 3. Google Drive Folder — try to extract a specific fileId, otherwise return as-is
    const gFolderMatch = cleanUrl.match(/drive\.google\.com\/(?:drive\/(?:u\/\d+\/)?folders\/([a-zA-Z0-9_-]+))/i);
    if (gFolderMatch) {
      const innerFileMatch = cleanUrl.match(/[?&]fileId=([a-zA-Z0-9_-]+)/i);
      if (innerFileMatch) {
        return `https://drive.google.com/file/d/${innerFileMatch[1]}/preview`;
      }
      // Pure folder link — caller should warn the user via isFolderUrl()
      return cleanUrl;
    }

    // 4. OneDrive short sharing link (1drv.ms) — browser handles redirect to the file
    if (/1drv\.ms/i.test(cleanUrl)) {
      return cleanUrl;
    }

    // 5. OneDrive personal navigation URL (onedrive.live.com/?id=...)
    if (cleanUrl.includes('onedrive.live.com')) {
      // Try to find a resid (specific file resource ID) for a proper embed URL
      const residMatch = cleanUrl.match(/resid=([A-Z0-9!.]+)/i);
      const authkeyMatch = cleanUrl.match(/authkey=([^&\s]+)/i);
      if (residMatch) {
        let embedUrl = `https://onedrive.live.com/embed?resid=${encodeURIComponent(residMatch[1])}`;
        if (authkeyMatch) embedUrl += `&authkey=${encodeURIComponent(authkeyMatch[1])}`;
        embedUrl += '&em=2';
        return embedUrl;
      }
      // view.aspx → embed (SharePoint personal site files)
      if (cleanUrl.includes('view.aspx')) {
        return cleanUrl.replace('view.aspx', 'embed');
      }
      // Plain folder navigation — return as-is, caller warns via isFolderUrl()
      if (cleanUrl.match(/[?&]id=/i) && !cleanUrl.includes('action=embedview')) {
        return cleanUrl; // Folder URL, can't isolate file
      }
      // Add embedview for other OneDrive URLs
      if (!cleanUrl.includes('action=embedview') && !cleanUrl.includes('embed')) {
        cleanUrl += (cleanUrl.includes('?') ? '&' : '?') + 'action=embedview';
      }
      return cleanUrl;
    }

    // 6. Microsoft SharePoint — detect folder (:f:) vs file (:b:, :w:, :x:, :p:, etc.)
    if (cleanUrl.includes('.sharepoint.com')) {
      // Folder links (:f:) can't be isolated to a single file
      if (cleanUrl.includes('/:f:/')) return cleanUrl; // caller warns via isFolderUrl()
      if (!cleanUrl.includes('action=embedview') && !cleanUrl.includes('action=embed')) {
        cleanUrl += (cleanUrl.includes('?') ? '&' : '?') + 'action=embedview';
      }
      return cleanUrl;
    }

    // 7. Office Web Apps viewer — already in proper format
    if (cleanUrl.includes('view.officeapps.live.com')) {
      return cleanUrl;
    }

    // 8. Dropbox: convert dl=0 to raw=1 for direct viewing
    if (cleanUrl.includes('dropbox.com')) {
      return cleanUrl.replace('dl=0', 'raw=1').replace('dl=1', 'raw=1');
    }

    return cleanUrl;
  }
};

// Start application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  DMCApp.init();
});

window.DMCApp = DMCApp;
