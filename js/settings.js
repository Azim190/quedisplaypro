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
        </div>
      </div>
    `).join('');
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

    const isAr = getLang() === 'ar';
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
        </div>
      </div>
    `).join('');
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

    const isAr = getLang() === 'ar';
    const types = DMCStore.getProjectTypes();

    container.innerHTML = types.map(p => `
      <div class="crud-item">
        <div class="crud-item-name">
          <i class="fa-solid fa-city" style="color: var(--brand-gold);"></i>
          <span>${isAr ? p.nameAr : p.nameEn}</span>
        </div>
      </div>
    `).join('');
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

    const isAr = getLang() === 'ar';
    const users = DMCStore.getUsers();

    container.innerHTML = users.map(u => `
      <div class="crud-item">
        <div class="crud-item-name">
          <div class="user-avatar" style="width: 34px; height: 34px; font-size: 0.85rem;">${u.nameEn.charAt(0)}</div>
          <div>
            <div style="font-weight: 700;">${isAr ? u.nameAr : u.nameEn}</div>
            <div style="font-size: 0.78rem; color: var(--text-muted);">${u.nationalId} • ${u.email}</div>
          </div>
        </div>
        <div class="d-flex align-center gap-2">
          <span class="badge ${u.role === 'admin' ? 'badge-new' : 'badge-ongoing'}">
            ${u.role === 'admin' ? 'مدير نظام / Admin' : 'مستخدم عادي / Engineer'}
          </span>
          <span class="badge ${u.active ? 'badge-approved' : 'badge-closed'}">
            <span class="badge-dot"></span>${u.active ? 'نشط' : 'معطل'}
          </span>
          <button class="btn btn-outline btn-sm" onclick="DMCSettings.toggleUser('${u.id}')">
            ${u.active ? 'تعطيل' : 'تفعيل'}
          </button>
        </div>
      </div>
    `).join('');
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
      DMCApp.showToast('تم تحديث حالة المستخدم بنجاح', 'success');
    }
  },

  addUser() {
    const nationalId = prompt('رقم الهوية الوطنية (10 أرقام):');
    if (!nationalId) return;
    const nameAr = prompt('الاسم بالكامل (عربي):');
    const nameEn = prompt('Full Name (English):');
    const password = prompt('كلمة المرور المؤقتة:') || 'pass123';
    const role = confirm('هل المستخدم مدير نظام (Admin)؟\nنعم = Admin، إلغاء = Standard User') ? 'admin' : 'user';

    const users = DMCStore.getUsers();
    users.push({
      id: 'u_' + Date.now(),
      nationalId: nationalId.trim(),
      password: password,
      nameAr: nameAr || nameEn,
      nameEn: nameEn || nameAr,
      role: role,
      titleAr: role === 'admin' ? 'مدير نظام' : 'مهندس استشاري',
      titleEn: role === 'admin' ? 'Administrator' : 'Consultant Engineer',
      email: `${nationalId}@dmc-consulting.sa`,
      active: true
    });

    DMCStore.saveUsers(users);
    DMCApp.showToast('تم إنشاء حساب المستخدم بنجاح', 'success');
  }
};
