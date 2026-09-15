/**
 * DMC Dar Makkah Engineering Consultancy
 * Contracts Management & Archive Table
 * Add, Edit, Filter, Search, Pagination, Status Updates, Drive File Linking
 */

const DMCContracts = {
  currentPage: 1,
  pageSize: 10,
  sortColumn: 'signingDate',
  sortOrder: 'desc',
  currentEditId: null,
  filterState: {
    branch: 'all',
    status: 'all',
    query: ''
  },

  init() {
    this.seedInitialData();
    this.bindEvents();
    this.populateDropdowns();
    this.render();

    window.addEventListener('dmc-data-changed', () => this.render());
    window.addEventListener('dmc-language-changed', () => {
      this.populateDropdowns();
      this.render();
    });
  },

  seedInitialData() {
    let items = JSON.parse(localStorage.getItem(STORAGE_KEYS.CONTRACTS) || '[]');
    if (!items || items.length === 0) {
      const sampleContracts = [
        {
          id: 'c_101',
          contractNo: 'C-2026-0001',
          titleAr: 'عقد الإشراف الهندسي على مشروع برج النور السكني',
          titleEn: 'Engineering Supervision Contract for Al-Noor Tower',
          branchId: 'b_1',
          clientNameAr: 'شركة النور للتطوير العقاري',
          clientNameEn: 'Al-Noor Real Estate Co.',
          projectNameAr: 'برج النور الفندقي والسكني',
          projectNameEn: 'Al-Noor Hotel & Residential Tower',
          projectTypeId: 'pt_res_com',
          contractTypeId: 'qt_supervision',
          amount: 1200000,
          vatRate: 0.15,
          vatAmount: 180000,
          totalAmount: 1380000,
          currency: 'SAR',
          status: 'ongoing',
          signingDate: '2026-01-15',
          validUntil: '2027-01-15',
          fileLink: 'https://1drv.ms/b/c/9e591ec818cb6ae4/DMC_Contract_0001',
          fileName: 'DMC_Contract_C-2026-0001.pdf',
          notes: 'عقد إشراف دوري متكامل يشمل مطابقة المواصفات واعتماد المخططات التنفيذية.'
        },
        {
          id: 'c_102',
          contractNo: 'C-2026-0002',
          titleAr: 'عقد إعداد الدراسات الهيدرولوجية ودرء أخطار السيول',
          titleEn: 'Hydraulic & Flood Risk Assessment Contract',
          branchId: 'b_3',
          clientNameAr: 'مجموعة الفخر للاستثمار والتطوير',
          clientNameEn: 'Al-Fakhr Investment Group',
          projectNameAr: 'مخطط الواحة اللوجستي',
          projectNameEn: 'Al-Waha Logistics Masterplan',
          projectTypeId: 'pt_infrastructure',
          contractTypeId: 'qt_hydraulic',
          amount: 450000,
          vatRate: 0.15,
          vatAmount: 67500,
          totalAmount: 517500,
          currency: 'SAR',
          status: 'approved',
          signingDate: '2026-02-01',
          validUntil: '2026-08-01',
          fileLink: 'https://1drv.ms/b/c/9e591ec818cb6ae4/DMC_Contract_0002',
          fileName: 'DMC_Contract_C-2026-0002.pdf',
          notes: 'دراسة هيدرولوجية معتمدة من الأمانة وهيئة المساحة الجيولوجية.'
        },
        {
          id: 'c_103',
          contractNo: 'C-2026-0003',
          titleAr: 'عقد تصميم معماري وإنشائي مجمع فلل سكنية',
          titleEn: 'Architectural & Structural Design Contract for Villa Complex',
          branchId: 'b_2',
          clientNameAr: 'الشيخ عبدالرحمن إبراهيم المطيري',
          clientNameEn: 'Sheikh Abdulrahman Al-Mutairi',
          projectNameAr: 'مجمع فلل الروضة السكني',
          projectNameEn: 'Al-Rawdah Residential Villas',
          projectTypeId: 'pt_villa',
          contractTypeId: 'qt_design',
          amount: 280000,
          vatRate: 0.15,
          vatAmount: 42000,
          totalAmount: 322000,
          currency: 'SAR',
          status: 'completed',
          signingDate: '2025-11-10',
          validUntil: '2026-05-10',
          fileLink: 'https://1drv.ms/b/c/9e591ec818cb6ae4/DMC_Contract_0003',
          fileName: 'DMC_Contract_C-2026-0003.pdf',
          notes: 'تم تسليم كافة المخططات ورخصة البناء الصادرة من بلدي.'
        }
      ];
      localStorage.setItem(STORAGE_KEYS.CONTRACTS, JSON.stringify(sampleContracts));
    }
  },

  populateDropdowns() {
    const isAr = getLang() === 'ar';
    const branches = DMCStore.getBranches();
    const quotationTypes = DMCStore.getQuotationTypes();
    const projectTypes = DMCStore.getProjectTypes();
    const statuses = DMCStore.getStatuses();
    const currencies = DMCStore.getCurrencies();

    // Table filters
    const branchFilter = document.getElementById('contracts-filter-branch');
    if (branchFilter) {
      const cur = branchFilter.value;
      branchFilter.innerHTML = `<option value="all">${t('filter_all_branches')}</option>` +
        branches.map(b => `<option value="${b.id}">${isAr ? b.nameAr : b.nameEn}</option>`).join('');
      branchFilter.value = cur || 'all';
    }

    const statusFilter = document.getElementById('contracts-filter-status');
    if (statusFilter) {
      const cur = statusFilter.value;
      statusFilter.innerHTML = `<option value="all">${t('filter_all_statuses')}</option>` +
        statuses.map(s => `<option value="${s.id}">${isAr ? s.nameAr : s.nameEn}</option>`).join('');
      statusFilter.value = cur || 'all';
    }

    // Modal Form Dropdowns
    const formBranch = document.getElementById('contract-form-branch');
    if (formBranch) {
      formBranch.innerHTML = `<option value="">-- ${t('lbl_branch')} --</option>` +
        branches.map(b => `<option value="${b.id}">${isAr ? b.nameAr : b.nameEn}</option>`).join('');
    }

    const formType = document.getElementById('contract-form-type');
    if (formType) {
      formType.innerHTML = `<option value="">-- ${t('lbl_contract_type')} --</option>` +
        quotationTypes.map(t => `<option value="${t.id}">${isAr ? t.nameAr : t.nameEn}</option>`).join('');
    }

    const formPType = document.getElementById('contract-form-ptype');
    if (formPType) {
      formPType.innerHTML = `<option value="">-- ${t('lbl_project_type')} --</option>` +
        projectTypes.map(p => `<option value="${p.id}">${isAr ? p.nameAr : p.nameEn}</option>`).join('');
    }

    const formStatus = document.getElementById('contract-form-status');
    if (formStatus) {
      formStatus.innerHTML = statuses.map(s => `<option value="${s.id}">${isAr ? s.nameAr : s.nameEn}</option>`).join('');
    }

    const formCurrency = document.getElementById('contract-form-currency');
    if (formCurrency) {
      formCurrency.innerHTML = currencies.map(c => `<option value="${c.code}">${c.code} - ${isAr ? c.nameAr : c.nameEn}</option>`).join('');
    }
  },

  bindEvents() {
    // Search input
    const searchInput = document.getElementById('contracts-search-input');
    if (searchInput) {
      let timeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          this.filterState.query = e.target.value;
          this.currentPage = 1;
          this.render();
        }, 200);
      });
    }

    // Branch filter
    const branchFilter = document.getElementById('contracts-filter-branch');
    if (branchFilter) {
      branchFilter.addEventListener('change', (e) => {
        this.filterState.branch = e.target.value;
        this.currentPage = 1;
        this.render();
      });
    }

    // Status filter
    const statusFilter = document.getElementById('contracts-filter-status');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        this.filterState.status = e.target.value;
        this.currentPage = 1;
        this.render();
      });
    }

    // Page size
    const pageSizeSelect = document.getElementById('contracts-page-size');
    if (pageSizeSelect) {
      pageSizeSelect.addEventListener('change', (e) => {
        this.pageSize = parseInt(e.target.value, 10) || 10;
        this.currentPage = 1;
        this.render();
      });
    }

    // Form submission
    const form = document.getElementById('contract-modal-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveContract();
      });
    }

    // Real-time VAT calculation
    const amountInput = document.getElementById('contract-form-amount');
    if (amountInput) {
      amountInput.addEventListener('input', () => this.calculateTotals());
      amountInput.addEventListener('keyup', () => this.calculateTotals());
      amountInput.addEventListener('change', () => this.calculateTotals());
    }

    // Modal background click to close
    const modal = document.getElementById('modal-contract-form');
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) this.closeModal();
      });
    }
  },

  calculateTotals() {
    const amountInput = document.getElementById('contract-form-amount');
    const vatInput = document.getElementById('contract-form-vat');
    const totalInput = document.getElementById('contract-form-total');
    const currSelect = document.getElementById('contract-form-currency');

    const amount = Number(amountInput.value) || 0;
    const vat = Math.round(amount * 0.15);
    const total = amount + vat;
    const curr = currSelect ? currSelect.value : 'SAR';

    if (vatInput) vatInput.value = `${vat.toLocaleString()} ${curr}`;
    if (totalInput) totalInput.value = `${total.toLocaleString()} ${curr}`;
  },

  testLink() {
    const linkInput = document.getElementById('contract-form-file-link');
    const url = linkInput ? linkInput.value.trim() : '';
    if (!url) {
      alert(typeof getLang === 'function' && getLang() === 'ar' ? 'يرجى كتابة أو لصق رابط الملف أولاً لاختباره' : 'Please enter a file link first.');
      return;
    }
    if (typeof DMCApp !== 'undefined' && DMCApp.openSingleFile) {
      DMCApp.openSingleFile(url);
    } else {
      const previewUrl = typeof DMCApp !== 'undefined' && DMCApp.formatDrivePreviewUrl
        ? DMCApp.formatDrivePreviewUrl(url)
        : url;
      window.open(previewUrl, '_blank', 'noopener,noreferrer');
    }
  },

  openNew() {
    this.currentEditId = null;
    const modal = document.getElementById('modal-contract-form');
    if (!modal) return;

    const titleEl = document.getElementById('modal-contract-form-title');
    if (titleEl) titleEl.textContent = t('modal_add_contract_title');

    const form = document.getElementById('contract-modal-form');
    if (form) form.reset();

    this.populateDropdowns();

    // Auto-generate Contract No.
    const contracts = DMCStore.getContracts();
    const currentYear = new Date().getFullYear();
    const nextNo = `C-${currentYear}-${String(contracts.length + 1).padStart(4, '0')}`;
    const noInput = document.getElementById('contract-form-no');
    if (noInput) noInput.value = nextNo;

    // Today as default signing date
    const dateInput = document.getElementById('contract-form-signing-date');
    if (dateInput) dateInput.value = new Date().toISOString().slice(0, 10);

    this.calculateTotals();

    modal.classList.add('active');
    document.body.classList.add('modal-open');
  },

  openEdit(id) {
    const contract = DMCStore.getContractById(id);
    if (!contract) return;

    this.currentEditId = id;
    const modal = document.getElementById('modal-contract-form');
    if (!modal) return;

    const titleEl = document.getElementById('modal-contract-form-title');
    if (titleEl) titleEl.textContent = t('modal_edit_contract_title');

    this.populateDropdowns();

    document.getElementById('contract-form-no').value = contract.contractNo || '';
    document.getElementById('contract-form-branch').value = contract.branchId || '';
    document.getElementById('contract-form-title-ar').value = contract.titleAr || '';
    document.getElementById('contract-form-title-en').value = contract.titleEn || '';
    document.getElementById('contract-form-client-ar').value = contract.clientNameAr || '';
    document.getElementById('contract-form-client-en').value = contract.clientNameEn || '';
    document.getElementById('contract-form-project-ar').value = contract.projectNameAr || '';
    document.getElementById('contract-form-project-en').value = contract.projectNameEn || '';
    document.getElementById('contract-form-type').value = contract.contractTypeId || '';
    document.getElementById('contract-form-ptype').value = contract.projectTypeId || '';
    document.getElementById('contract-form-status').value = contract.status || 'ongoing';
    document.getElementById('contract-form-signing-date').value = contract.signingDate || '';
    document.getElementById('contract-form-valid-until').value = contract.validUntil || '';
    document.getElementById('contract-form-amount').value = contract.amount || '';
    document.getElementById('contract-form-currency').value = contract.currency || 'SAR';
    document.getElementById('contract-form-file-link').value = contract.fileLink || '';
    document.getElementById('contract-form-file-name').value = contract.fileName || '';
    document.getElementById('contract-form-notes').value = contract.notes || '';

    this.calculateTotals();

    modal.classList.add('active');
    document.body.classList.add('modal-open');
  },

  closeModal() {
    const modal = document.getElementById('modal-contract-form');
    if (modal) modal.classList.remove('active');
    document.body.classList.remove('modal-open');
    this.currentEditId = null;
  },

  saveContract() {
    const no = document.getElementById('contract-form-no').value.trim();
    const branchId = document.getElementById('contract-form-branch').value;
    const titleAr = document.getElementById('contract-form-title-ar').value.trim();
    const titleEn = document.getElementById('contract-form-title-en').value.trim();
    const clientAr = document.getElementById('contract-form-client-ar').value.trim();
    const clientEn = document.getElementById('contract-form-client-en').value.trim();
    const projectAr = document.getElementById('contract-form-project-ar').value.trim();
    const projectEn = document.getElementById('contract-form-project-en').value.trim();
    const contractType = document.getElementById('contract-form-type').value;
    const projectType = document.getElementById('contract-form-ptype').value;
    const status = document.getElementById('contract-form-status').value;
    const signingDate = document.getElementById('contract-form-signing-date').value;
    const validUntil = document.getElementById('contract-form-valid-until').value;
    const amount = Number(document.getElementById('contract-form-amount').value) || 0;
    const currency = document.getElementById('contract-form-currency').value || 'SAR';
    const rawFileLink = document.getElementById('contract-form-file-link').value.trim();
    const fileLink = (typeof DMCApp !== 'undefined' && DMCApp.formatDrivePreviewUrl)
      ? DMCApp.formatDrivePreviewUrl(rawFileLink)
      : rawFileLink;
    const fileName = document.getElementById('contract-form-file-name').value.trim();
    const notes = document.getElementById('contract-form-notes').value.trim();

    if (!no || !branchId || !titleAr || !clientAr || !signingDate) {
      alert(t('validation_error'));
      return;
    }

    const payload = {
      contractNo: no,
      branchId,
      titleAr,
      titleEn: titleEn || titleAr,
      clientNameAr: clientAr,
      clientNameEn: clientEn || clientAr,
      projectNameAr: projectAr,
      projectNameEn: projectEn,
      contractTypeId: contractType,
      projectTypeId: projectType,
      status,
      signingDate,
      validUntil,
      amount,
      currency,
      fileLink,
      fileName: fileName || `DMC_Contract_${no}.pdf`,
      notes
    };

    if (this.currentEditId) {
      DMCStore.updateContract(this.currentEditId, payload);
      if (typeof DMCApp !== 'undefined' && DMCApp.showToast) {
        DMCApp.showToast(t('msg_status_updated'), 'success');
      }
    } else {
      DMCStore.saveContract(payload);
      if (typeof DMCApp !== 'undefined' && DMCApp.showToast) {
        DMCApp.showToast(t('msg_contract_saved'), 'success');
      }
    }

    this.closeModal();
    this.render();
  },

  deleteContract(id) {
    if (!confirm(t('confirm_delete_contract'))) return;
    const ok = DMCStore.deleteContract(id);
    if (ok) {
      if (typeof DMCApp !== 'undefined' && DMCApp.showToast) {
        DMCApp.showToast(t('msg_contract_deleted'), 'success');
      }
      this.render();
    }
  },

  openFile(id) {
    const contract = DMCStore.getContractById(id);
    if (!contract) {
      if (typeof DMCApp !== 'undefined' && DMCApp.showToast) {
        DMCApp.showToast(getLang() === 'ar' ? 'العقد غير موجود' : 'Contract not found', 'error');
      }
      return;
    }

    if (!contract.fileLink) {
      // No link – prompt user to add one via the edit modal
      const msgAr = 'لا يوجد رابط سحابي مسجل لهذا العقد. يرجى إدخال رابط الملف.';
      const msgEn = 'No cloud Drive link registered for this contract yet. Please enter the document link.';
      if (typeof DMCApp !== 'undefined' && DMCApp.showToast) {
        DMCApp.showToast(getLang() === 'ar' ? msgAr : msgEn, 'warning');
      }
      DMCContracts.openEdit(id);
      setTimeout(() => {
        const linkInput = document.getElementById('contract-form-file-link');
        if (linkInput) {
          linkInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
          linkInput.focus();
        }
      }, 300);
      return;
    }

    if (typeof DMCApp !== 'undefined' && DMCApp.openSingleFile) {
      DMCApp.openSingleFile(contract.fileLink);
    } else {
      const previewUrl = typeof DMCApp !== 'undefined' && DMCApp.formatDrivePreviewUrl
        ? DMCApp.formatDrivePreviewUrl(contract.fileLink)
        : contract.fileLink;
      const win = window.open(previewUrl, '_blank', 'noopener,noreferrer');
      if (win) { try { win.opener = null; } catch (e) {} }
    }
  },

  render() {
    const tbody = document.getElementById('contracts-table-body');
    const badge = document.getElementById('sidebar-contracts-badge');

    const allContracts = DMCStore.getContracts();
    if (badge) badge.textContent = allContracts.length;

    if (!tbody) return;

    const isAr = getLang() === 'ar';
    const branches = DMCStore.getBranches();
    const quotationTypes = DMCStore.getQuotationTypes();
    const projectTypes = DMCStore.getProjectTypes();

    let items = DMCStore.getContracts({
      branch: this.filterState.branch,
      status: this.filterState.status,
      query: this.filterState.query
    });

    // Sort
    items.sort((a, b) => {
      let valA = a[this.sortColumn] || '';
      let valB = b[this.sortColumn] || '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return this.sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const totalCount = items.length;
    const totalPages = Math.ceil(totalCount / this.pageSize) || 1;
    if (this.currentPage > totalPages) this.currentPage = totalPages;

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const paginatedItems = items.slice(startIndex, startIndex + this.pageSize);

    // Showing count indicator
    const showingCountEl = document.getElementById('contracts-showing-count');
    if (showingCountEl) {
      const from = totalCount === 0 ? 0 : startIndex + 1;
      const to = Math.min(startIndex + this.pageSize, totalCount);
      showingCountEl.textContent = `${from} - ${to} / ${totalCount}`;
    }

    if (paginatedItems.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="12" class="text-center" style="padding: 3rem; color: var(--text-muted);">
            <i class="fa-solid fa-file-signature" style="font-size: 2.5rem; color: var(--brand-gold); opacity: 0.6; margin-bottom: 0.75rem; display: block;"></i>
            <div style="font-weight: 700; font-size: 1rem;">${t('contracts_empty_title')}</div>
            <div style="font-size: 0.85rem; margin-top: 0.35rem;">${t('no_records')}</div>
          </td>
        </tr>
      `;
      this.renderPagination(1, 1);
      return;
    }

    tbody.innerHTML = paginatedItems.map((item, idx) => {
      const branch = branches.find(b => b.id === item.branchId);
      const qType = quotationTypes.find(t => t.id === item.contractTypeId);
      const pType = projectTypes.find(p => p.id === item.projectTypeId);

      const branchName = branch ? (isAr ? branch.nameAr : branch.nameEn) : '-';
      const qTypeName = qType ? (isAr ? qType.nameAr : qType.nameEn) : '-';
      const pTypeName = pType ? (isAr ? pType.nameAr : pType.nameEn) : '-';
      const statusLabel = t(`status_${item.status}`);
      const rowNum = startIndex + idx + 1;

      return `
        <tr>
          <td><strong>${rowNum}</strong></td>
          <td><span style="font-weight: 800; color: var(--brand-gold); cursor: pointer;" onclick="DMCContracts.openEdit('${item.id}')">${item.contractNo}</span></td>
          <td><div style="font-weight: 700; max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${isAr ? item.titleAr : item.titleEn}</div></td>
          <td>${isAr ? item.clientNameAr : item.clientNameEn}</td>
          <td><span class="badge" style="background: rgba(11,61,98,0.08); color: var(--brand-primary);">${branchName}</span></td>
          <td>${qTypeName}</td>
          <td>${pTypeName}</td>
          <td><strong>${Number(item.amount || 0).toLocaleString()}</strong></td>
          <td>${item.currency || 'SAR'}</td>
          <td><span class="badge badge-${item.status}"><span class="badge-dot"></span>${statusLabel}</span></td>
          <td>${item.signingDate || '-'}</td>
          <td>${item.validUntil || '-'}</td>
          <td>
            <div class="d-flex align-center gap-1">
              <button class="btn btn-outline btn-icon" title="${t('action_open_file')}" onclick="DMCContracts.openFile('${item.id}')" style="color: #EF4444;">
                <i class="fa-regular fa-file-pdf"></i>
              </button>
              <button class="btn btn-outline btn-icon" title="${t('action_edit')}" onclick="DMCContracts.openEdit('${item.id}')">
                <i class="fa-regular fa-pen-to-square"></i>
              </button>
              <button class="btn btn-outline btn-icon" title="${t('action_delete')}" onclick="DMCContracts.deleteContract('${item.id}')" style="color: #EF4444;">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    this.renderPagination(this.currentPage, totalPages);
  },

  renderPagination(current, total) {
    const container = document.getElementById('contracts-pagination-controls');
    if (!container) return;

    let html = `
      <button class="page-btn" ${current === 1 ? 'disabled' : ''} onclick="DMCContracts.goToPage(${current - 1})">
        <i class="fa-solid fa-chevron-${getLang() === 'ar' ? 'right' : 'left'}"></i>
      </button>
    `;

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - 1 && i <= current + 1)) {
        html += `<button class="page-btn ${i === current ? 'active' : ''}" onclick="DMCContracts.goToPage(${i})">${i}</button>`;
      } else if (i === current - 2 || i === current + 2) {
        html += `<span style="padding: 0 4px;">...</span>`;
      }
    }

    html += `
      <button class="page-btn" ${current === total ? 'disabled' : ''} onclick="DMCContracts.goToPage(${current + 1})">
        <i class="fa-solid fa-chevron-${getLang() === 'ar' ? 'left' : 'right'}"></i>
      </button>
    `;

    container.innerHTML = html;
  },

  goToPage(page) {
    this.currentPage = page;
    this.render();
  }
};

window.DMCContracts = DMCContracts;
