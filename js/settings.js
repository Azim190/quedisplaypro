/**
 * DMC Dar Makkah Engineering Consultancy
 * Settings & System Administration Management
 * Branches (7), Quotation Types, Project Types, Statuses, Currencies, Users
 */

const DMCSettings = {
  init() {
    this.bindTabs();
    this.renderAllTabs();

    window.addEventListener('dmc-data-changed', () => this.renderAllTabs());
    window.addEventListener('dmc-language-changed', () => this.renderAllTabs());
  },

  bindTabs() {
    const tabButtons = document.querySelectorAll('.settings-tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        tabButtons.forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.settings-tab-content').forEach(p => p.classList.remove('active'));

        btn.classList.add('active');
        const targetId = btn.getAttribute('data-tab');
        const targetContent = document.getElementById(`tab-content-${targetId}`);
        if (targetContent) targetContent.classList.add('active');
      });
    });
  },

  renderAllTabs() {
    this.renderBranches();
    this.renderQuotationTypes();
    this.renderProjectTypes();
    this.renderUsers();
  },

  renderBranches() {
    const container = document.getElementById('settings-branches-list');
    if (!container) return;

    const isAr = getLang() === 'ar';
    const branches = DMCStore.getBranches();

    container.innerHTML = branches.map(b => `
      <div class="crud-item">
        <div class="crud-item-name">
          <i class="fa-solid fa-building" style="color: var(--brand-gold);"></i>
          <span>${isAr ? b.nameAr : b.nameEn}</span>
          <span class="badge" style="background: rgba(11,61,98,0.08);">${b.code}</span>
        </div>
        <div class="d-flex align-center gap-2">
          <span class="badge ${b.active ? 'badge-approved' : 'badge-closed'}">
            <span class="badge-dot"></span>${b.active ? 'نشط / Active' : 'غير نشط / Inactive'}
          </span>
          <button class="btn btn-outline btn-sm" onclick="DMCSettings.toggleBranch('${b.id}')">
            ${b.active ? 'تعطيل' : 'تفعيل'}
          </button>
          <button class="btn btn-outline btn-sm" onclick="DMCSettings.deleteBranch('${b.id}')" title="حذف الفرع" style="color: #EF4444; border-color: rgba(239, 68, 68, 0.3);">
            <i class="fa-regular fa-trash-can"></i> ${isAr ? 'حذف' : 'Delete'}
          </button>
        </div>
      </div>
    `).join('');
  },

  deleteBranch(id) {
    const isAr = typeof getLang === 'function' && getLang() === 'ar';
    const branches = DMCStore.getBranches();
    const branch = branches.find(b => b.id === id);
    if (!branch) return;

    if (branches.length <= 1) {
      alert(isAr ? 'يجب أن يحتوي النظام على فرع واحد على الأقل.' : 'The system must have at least one branch.');
      return;
    }

    if (confirm(isAr ? `هل أنت متأكد من رغبتك في حذف ${branch.nameAr}؟` : `Are you sure you want to delete ${branch.nameEn}?`)) {
      const updated = branches.filter(b => b.id !== id);
      DMCStore.saveBranches(updated);
      this.renderBranches();
      if (typeof DMCApp !== 'undefined' && DMCApp.showToast) {
        DMCApp.showToast(isAr ? 'تم حذف الفرع بنجاح' : 'Branch deleted successfully', 'success');
      }
    }
  },

  toggleBranch(id) {
    const branches = DMCStore.getBranches();
    const branch = branches.find(b => b.id === id);
    if (branch) {
      branch.active = !branch.active;
      DMCStore.saveBranches(branches);
      DMCApp.showToast('تم تحديث حالة الفرع / Branch status updated', 'success');
    }
  },

  addBranch() {
    const nameAr = prompt('أدخل اسم الفرع بالعربية:');
    if (!nameAr) return;
    const nameEn = prompt('Enter Branch Name in English:');
    const code = prompt('Enter 3-Letter Code (e.g. TIF):') || 'BRN';

    const branches = DMCStore.getBranches();
    branches.push({
      id: 'b_' + Date.now(),
      code: code.toUpperCase(),
      nameAr: nameAr,
      nameEn: nameEn || nameAr,
      active: true
    });

    DMCStore.saveBranches(branches);
    DMCApp.showToast('تمت إضافة الفرع بنجاح / Branch added successfully', 'success');
  },

  renderQuotationTypes() {
    const container = document.getElementById('settings-qtypes-list');
    if (!container) return;

    const isAr = typeof getLang === 'function' && getLang() === 'ar';
    const types = DMCStore.getQuotationTypes();

    container.innerHTML = types.map(t => `
      <div class="crud-item">
        <div class="crud-item-name">
          <i class="fa-solid fa-file-contract" style="color: var(--brand-primary);"></i>
          <span>${isAr ? t.nameAr : t.nameEn}</span>
        </div>
        <div class="d-flex align-center gap-2">
          <span class="badge ${t.active ? 'badge-approved' : 'badge-closed'}">
            <span class="badge-dot"></span>${t.active ? 'نشط' : 'معطل'}
          </span>
          <button class="btn btn-outline btn-sm" onclick="DMCSettings.deleteQuotationType('${t.id}')" title="حذف نوع العرض" style="color: #EF4444; border-color: rgba(239, 68, 68, 0.3);">
            <i class="fa-regular fa-trash-can"></i> ${isAr ? 'حذف' : 'Delete'}
          </button>
        </div>
      </div>
    `).join('');
  },

  deleteQuotationType(id) {
    const isAr = typeof getLang === 'function' && getLang() === 'ar';
    const types = DMCStore.getQuotationTypes();
    const target = types.find(t => t.id === id);
    if (!target) return;

    if (types.length <= 1) {
      alert(isAr ? 'يجب وجود نوع عرض واحد على الأقل.' : 'Must have at least one quotation type.');
      return;
    }

    if (confirm(isAr ? `هل أنت متأكد من حذف ${target.nameAr}؟` : `Delete ${target.nameEn}?`)) {
      const updated = types.filter(t => t.id !== id);
      DMCStore.saveQuotationTypes(updated);
      this.renderQuotationTypes();
      if (typeof DMCApp !== 'undefined' && DMCApp.showToast) {
        DMCApp.showToast(isAr ? 'تم حذف نوع العرض بنجاح' : 'Quotation type deleted', 'success');
      }
    }
  },

  addQuotationType() {
    const nameAr = prompt('أدخل نوع العرض بالعربية:');
    if (!nameAr) return;
    const nameEn = prompt('Enter Quotation Type in English:');

    const types = DMCStore.getQuotationTypes();
    types.push({
      id: 'qt_' + Date.now(),
      key: 'type_custom',
      nameAr: nameAr,
      nameEn: nameEn || nameAr,
      active: true
    });

    DMCStore.saveQuotationTypes(types);
    DMCApp.showToast('تمت إضافة نوع العرض بنجاح', 'success');
  },

  renderProjectTypes() {
    const container = document.getElementById('settings-ptypes-list');
    if (!container) return;

    const isAr = typeof getLang === 'function' && getLang() === 'ar';
    const types = DMCStore.getProjectTypes();

    container.innerHTML = types.map(p => `
      <div class="crud-item">
        <div class="crud-item-name">
          <i class="fa-solid fa-city" style="color: var(--brand-gold);"></i>
          <span>${isAr ? p.nameAr : p.nameEn}</span>
        </div>
        <div class="d-flex align-center gap-2">
          <button class="btn btn-outline btn-sm" onclick="DMCSettings.deleteProjectType('${p.id}')" title="حذف نوع المشروع" style="color: #EF4444; border-color: rgba(239, 68, 68, 0.3);">
            <i class="fa-regular fa-trash-can"></i> ${isAr ? 'حذف' : 'Delete'}
          </button>
        </div>
      </div>
    `).join('');
  },

  deleteProjectType(id) {
    const isAr = typeof getLang === 'function' && getLang() === 'ar';
    const types = DMCStore.getProjectTypes();
    const target = types.find(p => p.id === id);
    if (!target) return;

    if (types.length <= 1) {
      alert(isAr ? 'يجب وجود نوع مشروع واحد على الأقل.' : 'Must have at least one project type.');
      return;
    }

    if (confirm(isAr ? `هل أنت متأكد من حذف ${target.nameAr}؟` : `Delete ${target.nameEn}?`)) {
      const updated = types.filter(p => p.id !== id);
      DMCStore.saveProjectTypes(updated);
      this.renderProjectTypes();
      if (typeof DMCApp !== 'undefined' && DMCApp.showToast) {
        DMCApp.showToast(isAr ? 'تم حذف نوع المشروع بنجاح' : 'Project type deleted', 'success');
      }
    }
  },

  addProjectType() {
    const nameAr = prompt('أدخل نوع المشروع بالعربية:');
    if (!nameAr) return;
    const nameEn = prompt('Enter Project Type in English:');

    const types = DMCStore.getProjectTypes();
    types.push({
      id: 'pt_' + Date.now(),
      key: 'proj_custom',
      nameAr: nameAr,
      nameEn: nameEn || nameAr
    });

    DMCStore.saveProjectTypes(types);
    DMCApp.showToast('تمت إضافة نوع المشروع بنجاح', 'success');
  },

  renderUsers() {
    const container = document.getElementById('settings-users-list');
    if (!container) return;

    const isAr = typeof getLang === 'function' && getLang() === 'ar';
    const users = DMCStore.getUsers();

    container.innerHTML = users.map(u => `
      <div class="crud-item">
        <div class="crud-item-name">
          <div class="user-avatar" style="width: 34px; height: 34px; font-size: 0.85rem;">${(u.nameEn || 'U').charAt(0)}</div>
          <div>
            <div style="font-weight: 700;">${isAr ? u.nameAr : u.nameEn}</div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">${u.nationalId} • ${u.email || (u.titleAr || u.titleEn || '')}</div>
          </div>
        </div>
        <div class="d-flex align-center gap-2 flex-wrap">
          <span class="badge ${u.role === 'admin' ? 'badge-new' : 'badge-ongoing'}">
            ${u.role === 'admin' ? (isAr ? 'مدير نظام' : 'Admin') : (isAr ? 'مهندس استشاري' : 'Engineer')}
          </span>
          <span class="badge ${u.active ? 'badge-approved' : 'badge-closed'}">
            <span class="badge-dot"></span>${u.active ? (isAr ? 'نشط' : 'Active') : (isAr ? 'معطل' : 'Inactive')}
          </span>
          <button class="btn btn-outline btn-sm" onclick="DMCSettings.openEditUser('${u.id}')" title="تعديل بيانات المستخدم" style="font-weight: 700;">
            <i class="fa-regular fa-pen-to-square"></i> ${isAr ? 'تعديل' : 'Edit'}
          </button>
          <button class="btn btn-outline btn-sm" onclick="DMCSettings.toggleUser('${u.id}')">
            ${u.active ? (isAr ? 'تعطيل' : 'Deactivate') : (isAr ? 'تفعيل' : 'Activate')}
          </button>
          <button class="btn btn-outline btn-sm" onclick="DMCSettings.deleteUser('${u.id}')" title="${isAr ? 'حذف المستخدم' : 'Delete User'}" style="color: #EF4444; border-color: rgba(239, 68, 68, 0.3);">
            <i class="fa-regular fa-trash-can"></i> ${isAr ? 'حذف' : 'Delete'}
          </button>
        </div>
      </div>
    `).join('');
  },

  deleteUser(id) {
    const isAr = typeof getLang === 'function' && getLang() === 'ar';
    const users = DMCStore.getUsers();
    const user = users.find(u => u.id === id);
    if (!user) return;

    const currentUser = DMCStore.getCurrentUser();
    if (currentUser && currentUser.id === id) {
      alert(isAr ? 'لا يمكنك حذف حسابك الحالي المسجل به الدخول.' : 'You cannot delete your currently logged-in account.');
      return;
    }

    if (user.role === 'admin' && users.filter(u => u.role === 'admin' && u.active).length <= 1) {
      alert(isAr ? 'لا يمكن حذف مدير النظام الوحيد النشط.' : 'Cannot delete the only active system administrator.');
      return;
    }

    const confirmMsg = isAr 
      ? `هل أنت متأكد من رغبتك في حذف المستخدم "${user.nameAr || user.nameEn}" نهائياً؟`
      : `Are you sure you want to permanently delete user "${user.nameEn || user.nameAr}"?`;

    if (confirm(confirmMsg)) {
      const updatedUsers = users.filter(u => u.id !== id);
      DMCStore.saveUsers(updatedUsers);

      if (typeof DMCApi !== 'undefined' && DMCApi.isConnected) {
        DMCApi.deleteUser(id).catch(e => console.warn('SQLite delete user error:', e));
      }

      this.closeUserModal();
      this.renderUsers();
      if (typeof DMCApp !== 'undefined' && DMCApp.showToast) {
        DMCApp.showToast(isAr ? 'تم حذف المستخدم بنجاح' : 'User deleted successfully', 'success');
      }
    }
  },

  toggleUser(id) {
    const users = DMCStore.getUsers();
    const user = users.find(u => u.id === id);
    if (user) {
      if (user.role === 'admin' && users.filter(u => u.role === 'admin' && u.active).length <= 1 && user.active) {
        alert('لا يمكن تعطيل مدير النظام الوحيد النشط / Cannot deactivate only active admin.');
        return;
      }
      user.active = !user.active;
      DMCStore.saveUsers(users);

      if (typeof DMCApi !== 'undefined' && DMCApi.isConnected) {
        DMCApi.saveUser(user).catch(e => console.warn('SQLite user status save error:', e));
      }

      this.renderUsers();
      if (typeof DMCApp !== 'undefined' && DMCApp.showToast) {
        DMCApp.showToast('تم تحديث حالة المستخدم بنجاح / User status updated', 'success');
      }
    }
  },

  openEditUser(id) {
    const users = DMCStore.getUsers();
    const user = users.find(u => u.id === id);
    if (!user) return;

    const modal = document.getElementById('modal-user-form');
    if (!modal) return;

    document.getElementById('modal-user-title').textContent = (typeof getLang === 'function' && getLang() === 'ar')
      ? 'تعديل بيانات المستخدم'
      : 'Edit User Profile';

    document.getElementById('user-form-id').value = user.id;
    document.getElementById('user-form-national-id').value = user.nationalId || '';
    document.getElementById('user-form-password').value = '';
    document.getElementById('user-form-name-ar').value = user.nameAr || '';
    document.getElementById('user-form-name-en').value = user.nameEn || '';
    document.getElementById('user-form-title').value = user.titleAr || user.titleEn || '';
    document.getElementById('user-form-email').value = user.email || '';
    document.getElementById('user-form-role').value = user.role || 'user';
    document.getElementById('user-form-active').value = user.active ? '1' : '0';
    const delBtn = document.getElementById('btn-delete-user-modal');
    if (delBtn) delBtn.style.display = 'inline-flex';

    modal.classList.add('active');
  },

  addUser() {
    const modal = document.getElementById('modal-user-form');
    if (!modal) return;

    document.getElementById('modal-user-title').textContent = (typeof getLang === 'function' && getLang() === 'ar')
      ? 'إضافة مستخدم جديد'
      : 'Add New User';

    document.getElementById('user-form-id').value = '';
    document.getElementById('user-form-national-id').value = '';
    document.getElementById('user-form-password').value = '';
    document.getElementById('user-form-name-ar').value = '';
    document.getElementById('user-form-name-en').value = '';
    document.getElementById('user-form-title').value = '';
    document.getElementById('user-form-email').value = '';
    document.getElementById('user-form-role').value = 'user';
    document.getElementById('user-form-active').value = '1';

    const delBtn = document.getElementById('btn-delete-user-modal');
    if (delBtn) delBtn.style.display = 'none';

    modal.classList.add('active');
  },

  deleteCurrentUserFromModal() {
    const id = document.getElementById('user-form-id').value;
    if (id) {
      this.deleteUser(id);
    }
  },

  closeUserModal() {
    const modal = document.getElementById('modal-user-form');
    if (modal) modal.classList.remove('active');
  },

  saveUserForm(event) {
    if (event) event.preventDefault();

    const id = document.getElementById('user-form-id').value.trim();
    const nationalId = document.getElementById('user-form-national-id').value.trim();
    const password = document.getElementById('user-form-password').value.trim();
    const nameAr = document.getElementById('user-form-name-ar').value.trim();
    const nameEn = document.getElementById('user-form-name-en').value.trim();
    const title = document.getElementById('user-form-title').value.trim();
    const email = document.getElementById('user-form-email').value.trim();
    const role = document.getElementById('user-form-role').value;
    const active = document.getElementById('user-form-active').value === '1';

    if (!nationalId || !nameAr || !nameEn) {
      alert('يرجى تعبئة الحقول الإلزامية (رقم الهوية والاسم)');
      return;
    }

    const users = DMCStore.getUsers();

    if (id) {
      // Update existing user
      const userIndex = users.findIndex(u => u.id === id);
      if (userIndex !== -1) {
        users[userIndex].nationalId = nationalId;
        users[userIndex].nameAr = nameAr;
        users[userIndex].nameEn = nameEn;
        users[userIndex].titleAr = title;
        users[userIndex].titleEn = title;
        users[userIndex].email = email;
        users[userIndex].role = role;
        users[userIndex].active = active;
        if (password) {
          users[userIndex].password = password;
        }

        DMCStore.saveUsers(users);

        if (typeof DMCApi !== 'undefined' && DMCApi.isConnected) {
          DMCApi.saveUser(users[userIndex]).catch(e => console.warn('SQLite user save error:', e));
        }
      }
    } else {
      // Create new user
      const newUser = {
        id: 'u_' + Date.now(),
        nationalId: nationalId,
        password: password || 'user123',
        nameAr: nameAr,
        nameEn: nameEn,
        titleAr: title,
        titleEn: title,
        email: email || `${nationalId}@dmc-consulting.sa`,
        role: role,
        active: active
      };

      users.push(newUser);
      DMCStore.saveUsers(users);

      if (typeof DMCApi !== 'undefined' && DMCApi.isConnected) {
        DMCApi.saveUser(newUser).catch(e => console.warn('SQLite user save error:', e));
      }
    }

    this.closeUserModal();
    this.renderUsers();

    if (typeof DMCApp !== 'undefined' && DMCApp.showToast) {
      DMCApp.showToast('تم حفظ بيانات المستخدم بنجاح / User saved successfully', 'success');
    }
  }
};
