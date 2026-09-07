/**
 * DMC Dar Makkah Engineering Consultancy
 * Add & Edit Quotation Form Management
 * File Upload (base64 archiving), Real-time VAT Calculation, Validation
 */

const DMCForm = {
  currentEditId: null,
  uploadedFile: null,

  init() {
    this.bindEvents();
    this.populateDropdowns();

    window.addEventListener('dmc-language-changed', () => this.populateDropdowns());
  },

  populateDropdowns() {
    const isAr = getLang() === 'ar';
    const branches = DMCStore.getBranches();
    const quotationTypes = DMCStore.getQuotationTypes();
    const projectTypes = DMCStore.getProjectTypes();
    const statuses = DMCStore.getStatuses();
    const currencies = DMCStore.getCurrencies();

    // Branch select
    const branchSelect = document.getElementById('form-branch');
    if (branchSelect) {
      branchSelect.innerHTML = `<option value="">-- ${t('lbl_branch')} --</option>` +
        branches.map(b => `<option value="${b.id}">${isAr ? b.nameAr : b.nameEn}</option>`).join('');
    }

    // Quotation type select
    const qTypeSelect = document.getElementById('form-quotation-type');
    if (qTypeSelect) {
      qTypeSelect.innerHTML = `<option value="">-- ${t('lbl_quotation_type')} --</option>` +
        quotationTypes.map(t => `<option value="${t.id}">${isAr ? t.nameAr : t.nameEn}</option>`).join('');
    }

    // Project type select
    const pTypeSelect = document.getElementById('form-project-type');
    if (pTypeSelect) {
      pTypeSelect.innerHTML = `<option value="">-- ${t('lbl_project_type')} --</option>` +
        projectTypes.map(p => `<option value="${p.id}">${isAr ? p.nameAr : p.nameEn}</option>`).join('');
    }

    // Status select
    const statusSelect = document.getElementById('form-status');
    if (statusSelect) {
      statusSelect.innerHTML = statuses.map(s => `<option value="${s.id}">${isAr ? s.nameAr : s.nameEn}</option>`).join('');
    }

    // Currency select
    const currencySelect = document.getElementById('form-currency');
    if (currencySelect) {
      currencySelect.innerHTML = currencies.map(c => `<option value="${c.code}">${c.code} - ${isAr ? c.nameAr : c.nameEn}</option>`).join('');
    }
  },

  bindEvents() {
    const form = document.getElementById('quotation-form');
    const amountInput = document.getElementById('form-amount');
    const dropzone = document.getElementById('form-dropzone');
    const fileInput = document.getElementById('form-file-input');
    const removeFileBtn = document.getElementById('file-preview-remove');

    // Auto-calculate VAT & Total
    if (amountInput) {
      amountInput.addEventListener('input', () => this.calculateTotals());
      amountInput.addEventListener('keyup', () => this.calculateTotals());
      amountInput.addEventListener('change', () => this.calculateTotals());
    }

    const currencySelect = document.getElementById('form-currency');
    if (currencySelect) {
      currencySelect.addEventListener('change', () => this.calculateTotals());
    }

    // Form submit
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveQuotation();
      });
    }
  },

  handleFileSelect(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.uploadedFile = {
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        type: file.type || 'application/pdf',
        dataUrl: e.target.result
      };

      const preview = document.getElementById('form-file-preview');
      const nameEl = document.getElementById('file-preview-name');
      const sizeEl = document.getElementById('file-preview-size');

      if (preview && nameEl && sizeEl) {
        nameEl.textContent = file.name;
        sizeEl.textContent = this.uploadedFile.size;
        preview.classList.add('show');
      }
    };
    reader.readAsDataURL(file);
  },

  clearFile() {
    this.uploadedFile = null;
    const fileInput = document.getElementById('form-file-input');
    if (fileInput) fileInput.value = '';
    const preview = document.getElementById('form-file-preview');
    if (preview) preview.classList.remove('show');
  },

  calculateTotals() {
    const amountInput = document.getElementById('form-amount');
    const vatInput = document.getElementById('form-vat');
    const totalInput = document.getElementById('form-total');
    const currencySelect = document.getElementById('form-currency');
    const curr = (currencySelect && currencySelect.value) ? currencySelect.value : 'SAR';

    const rawVal = amountInput ? amountInput.value.trim() : '';
    if (!rawVal || isNaN(rawVal) || parseFloat(rawVal) <= 0) {
      if (vatInput) vatInput.value = `0 ${curr}`;
      if (totalInput) totalInput.value = `0 ${curr}`;
      return;
    }

    const amount = parseFloat(rawVal) || 0;
    const vat = Math.round(amount * 0.15);
    const total = amount + vat;

    if (vatInput) vatInput.value = `${vat.toLocaleString()} ${curr}`;
    if (totalInput) totalInput.value = `${total.toLocaleString()} ${curr}`;
  },

  testLink() {
    const linkInput = document.getElementById('form-file-link');
    const url = linkInput ? linkInput.value.trim() : '';
    if (!url) {
      alert('يرجى كتابة أو لصق رابط الملف أولاً لاختباره / Please enter a file link first.');
      return;
    }
    window.open(url, '_blank');
  },

  openNew() {
    this.currentEditId = null;
    const form = document.getElementById('quotation-form');
    if (form) form.reset();

    const titleEl = document.getElementById('modal-form-title');
    if (titleEl) titleEl.textContent = t('modal_add_title');

    // Auto-generate suggestion for Quotation No.
    const qNoInput = document.getElementById('form-quotation-no');
    if (qNoInput) {
      const year = new Date().getFullYear();
      const existing = DMCStore.getQuotations();
      qNoInput.value = `Q-${year}-${String(existing.length + 1).padStart(4, '0')}`;
    }

    // Default dates
    const creationInput = document.getElementById('form-creation-date');
    if (creationInput) creationInput.value = new Date().toISOString().slice(0, 10);

    const validUntilInput = document.getElementById('form-valid-until');
    if (validUntilInput) {
      const ninetyDaysLater = new Date(Date.now() + 90 * 86400000);
      validUntilInput.value = ninetyDaysLater.toISOString().slice(0, 10);
    }

    // Reset file link fields
    const linkInput = document.getElementById('form-file-link');
    if (linkInput) linkInput.value = '';
    const nameInput = document.getElementById('form-file-name');
    if (nameInput) nameInput.value = '';

    this.calculateTotals();
    const modalEl = document.getElementById('modal-quotation-form');
    if (modalEl) {
      modalEl.classList.add('active');
      document.body.classList.add('modal-open');
      const modalBody = modalEl.querySelector('.modal-body');
      if (modalBody) modalBody.scrollTop = 0;
    }
  },

  openEdit(id) {
    const quotation = DMCStore.getQuotationById(id);
    if (!quotation) return;

    this.currentEditId = id;

    const titleEl = document.getElementById('modal-form-title');
    if (titleEl) titleEl.textContent = `${t('action_edit')}: ${quotation.quotationNo}`;

    // Fill form fields
    document.getElementById('form-quotation-no').value = quotation.quotationNo;
    document.getElementById('form-title-ar').value = quotation.titleAr || '';
    document.getElementById('form-title-en').value = quotation.titleEn || '';
    document.getElementById('form-client-ar').value = quotation.clientNameAr || '';
    document.getElementById('form-client-en').value = quotation.clientNameEn || '';
    document.getElementById('form-project-ar').value = quotation.projectNameAr || '';
    document.getElementById('form-project-en').value = quotation.projectNameEn || '';
    document.getElementById('form-branch').value = quotation.branchId;
    document.getElementById('form-quotation-type').value = quotation.quotationTypeId;
    document.getElementById('form-project-type').value = quotation.projectTypeId;
    document.getElementById('form-status').value = quotation.status;
    document.getElementById('form-amount').value = quotation.amount;
    document.getElementById('form-currency').value = quotation.currency;
    document.getElementById('form-creation-date').value = quotation.creationDate;
    document.getElementById('form-valid-until').value = quotation.validUntil;
    document.getElementById('form-notes').value = quotation.notes || '';

    // File Link and metadata
    const linkInput = document.getElementById('form-file-link');
    if (linkInput && quotation.file) {
      linkInput.value = quotation.file.link || quotation.file.dataUrl || '';
    }
    const nameInput = document.getElementById('form-file-name');
    if (nameInput && quotation.file) {
      nameInput.value = quotation.file.name || '';
    }
    const typeSelect = document.getElementById('form-file-type');
    if (typeSelect && quotation.file && quotation.file.platform) {
      typeSelect.value = quotation.file.platform;
    }

    this.calculateTotals();
    const modalEl = document.getElementById('modal-quotation-form');
    if (modalEl) {
      modalEl.classList.add('active');
      document.body.classList.add('modal-open');
      const modalBody = modalEl.querySelector('.modal-body');
      if (modalBody) modalBody.scrollTop = 0;
    }
  },

  closeModal() {
    document.getElementById('modal-quotation-form').classList.remove('active');
    document.body.classList.remove('modal-open');
  },

  saveQuotation() {
    const quotationNo = document.getElementById('form-quotation-no').value.trim();
    const titleAr = document.getElementById('form-title-ar').value.trim();
    const titleEn = document.getElementById('form-title-en').value.trim();
    const clientAr = document.getElementById('form-client-ar').value.trim();
    const clientEn = document.getElementById('form-client-en').value.trim();
    const projectAr = document.getElementById('form-project-ar').value.trim();
    const projectEn = document.getElementById('form-project-en').value.trim();
    const branchId = document.getElementById('form-branch').value;
    const quotationTypeId = document.getElementById('form-quotation-type').value;
    const projectTypeId = document.getElementById('form-project-type').value;
    const status = document.getElementById('form-status').value;
    const amount = parseFloat(document.getElementById('form-amount').value) || 0;
    const currency = document.getElementById('form-currency').value;
    const creationDate = document.getElementById('form-creation-date').value;
    const validUntil = document.getElementById('form-valid-until').value;
    const notes = document.getElementById('form-notes').value;

    const fileLink = (document.getElementById('form-file-link') ? document.getElementById('form-file-link').value.trim() : '');
    const fileName = (document.getElementById('form-file-name') ? document.getElementById('form-file-name').value.trim() : '') || `${quotationNo}_Document.pdf`;
    const filePlatform = (document.getElementById('form-file-type') ? document.getElementById('form-file-type').value : 'Microsoft OneDrive');

    // Basic validation
    if (!quotationNo || (!titleAr && !titleEn) || (!clientAr && !clientEn) || !branchId || !quotationTypeId || !projectTypeId || amount <= 0) {
      alert(t('validation_error'));
      return;
    }

    if (!fileLink) {
      alert('يرجى إدخال رابط وثيقة عرض السعر (OneDrive / رابط سحابي) / Please enter the quotation file link.');
      return;
    }

    const payload = {
      quotationNo,
      titleAr: titleAr || titleEn,
      titleEn: titleEn || titleAr,
      clientNameAr: clientAr || clientEn,
      clientNameEn: clientEn || clientAr,
      projectNameAr: projectAr || projectEn,
      projectNameEn: projectEn || projectAr,
      branchId,
      quotationTypeId,
      projectTypeId,
      status,
      amount,
      currency,
      creationDate,
      validUntil,
      notes,
      fileName: fileName,
      fileSize: filePlatform,
      fileType: 'link',
      fileDataUrl: fileLink,
      fileLink: fileLink,
      filePlatform: filePlatform
    };

    if (this.currentEditId) {
      DMCStore.updateQuotation(this.currentEditId, payload);
      DMCApp.showToast(t('msg_status_updated'), 'success');
    } else {
      DMCStore.createQuotation(payload);
      DMCApp.showToast(t('msg_saved_success'), 'success');
    }

    this.closeModal();
  }
};
