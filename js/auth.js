/**
 * DMC Dar Makkah Engineering Consultancy
 * Authentication & Session Management
 */

const DMCAuth = {
  // Check if session is valid; if on a protected page and not logged in, redirect to login
  requireAuth() {
    const user = DMCStore.getCurrentUser();
    if (!user) {
      window.location.href = 'index.html';
      return null;
    }
    return user;
  },

  // If already logged in and visiting index.html, redirect to app.html
  redirectIfAuthenticated() {
    const user = DMCStore.getCurrentUser();
    if (user) {
      window.location.href = 'app.html';
    }
  },

  // Check if current user has admin role
  isAdmin() {
    const user = DMCStore.getCurrentUser();
    return user && user.role === 'admin';
  },

  // Attach login handlers on index.html
  initLogin() {
    this.redirectIfAuthenticated();

    const form = document.getElementById('login-form');
    const nationalIdInput = document.getElementById('national-id');
    const passwordInput = document.getElementById('password');
    const rememberMeCheckbox = document.getElementById('remember-me');
    const togglePasswordBtn = document.getElementById('toggle-password-btn');
    const errorAlert = document.getElementById('login-error-alert');

    // Toggle password visibility
    if (togglePasswordBtn) {
      togglePasswordBtn.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        const icon = togglePasswordBtn.querySelector('i');
        if (icon) {
          icon.className = type === 'password' ? 'fa-regular fa-eye' : 'fa-regular fa-eye-slash';
        }
      });
    }

    // Quick demo autofill buttons
    const demoAdminBtn = document.getElementById('demo-admin-fill');
    const demoUserBtn = document.getElementById('demo-user-fill');

    if (demoAdminBtn) {
      demoAdminBtn.addEventListener('click', () => {
        nationalIdInput.value = '1234567890';
        passwordInput.value = 'admin123';
      });
    }

    if (demoUserBtn) {
      demoUserBtn.addEventListener('click', () => {
        nationalIdInput.value = '0987654321';
        passwordInput.value = 'user123';
      });
    }

    // Submit handler
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const nationalId = nationalIdInput.value.trim();
        const password = passwordInput.value.trim();
        const remember = rememberMeCheckbox ? rememberMeCheckbox.checked : false;

        const user = DMCStore.login(nationalId, password, remember);
        if (user) {
          window.location.href = 'app.html';
        } else {
          if (errorAlert) {
            errorAlert.style.display = 'block';
            errorAlert.textContent = t('login_invalid');
          }
        }
      });
    }

    // Language toggle on login page
    const langBtn = document.getElementById('login-lang-btn');
    if (langBtn) {
      langBtn.addEventListener('click', () => {
        toggleLang();
      });
    }
  }
};
