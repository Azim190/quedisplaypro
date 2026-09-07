/**
 * DMC Dar Makkah Engineering Consultancy
 * Quotations Management & Data Table
 * Search, Sort, Pagination, Actions (View, Open File, Edit, Status, Delete)
 */

const DMCQuotations = {
  currentPage: 1,
  pageSize: 10,
  sortColumn: 'creationDate',
  sortOrder: 'desc',
  filterState: {
    branch: 'all',
    status: 'all',
    type: 'all',
    query: ''
  },

  init() {
    this.bindEvents();
    this.render();

    window.addEventListener('dmc-data-changed', () => this.render());
    window.addEventListener('dmc-language-changed', () => this.render());
  },

  bindEvents() {
    const searchInput = document.getElementById('table-search-input');
    const branchFilter = document.getElementById('table-filter-branch');
    const statusFilter = document.getElementById('table-filter-status');
    const pageSizeSelect = document.getElementById('table-page-size');

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

    if (branchFilter) {
      branchFilter.addEventListener('change', (e) => {
        this.filterState.branch = e.target.value;
        this.currentPage = 1;
        this.render();
      });
    }

    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        this.filterState.status = e.target.value;
        this.currentPage = 1;
        this.render();
      });
    }

    if (pageSizeSelect) {
      pageSizeSelect.addEventListener('change', (e) => {
        this.pageSize = parseInt(e.target.value, 10) || 10;
        this.currentPage = 1;
        this.render();
      });
    }
  },

  populateTableFilters() {
    const isAr = getLang() === 'ar';
    const branches = DMCStore.getBranches();
    const statuses = DMCStore.getStatuses();

    const branchFilter = document.getElementById('table-filter-branch');
    if (branchFilter) {
      const cur = branchFilter.value;
      branchFilter.innerHTML = `<option value="all">${t('filter_all_branches')}</option>` +
        branches.map(b => `<option value="${b.id}">${isAr ? b.nameAr : b.nameEn}</option>`).join('');
      branchFilter.value = cur || 'all';
    }

    const statusFilter = document.getElementById('table-filter-status');
    if (statusFilter) {
      const cur = statusFilter.value;
      statusFilter.innerHTML = `<option value="all">${t('filter_all_statuses')}</option>` +
        statuses.map(s => `<option value="${s.id}">${isAr ? s.nameAr : s.nameEn}</option>`).join('');
      statusFilter.value = cur || 'all';
    }
  },

  render() {
    this.populateTableFilters();
    const tbody = document.getElementById('quotations-table-body');
    if (!tbody) return;

    const isAr = getLang() === 'ar';
    const branches = DMCStore.getBranches();
    const quotationTypes = DMCStore.getQuotationTypes();
    const projectTypes = DMCStore.getProjectTypes();

    // Fetch and filter
    let items = DMCStore.getQuotations({
      branch: this.filterState.branch,
      status: this.filterState.status,
      query: this.filterState.query
    });

    // Custom sorting
    items.sort((a, b) => {
      let valA = a[this.sortColumn];
      let valB = b[this.sortColumn];

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return this.sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    const totalItems = items.length;
    const totalPages = Math.ceil(totalItems / this.pageSize) || 1;

    if (this.currentPage > totalPages) this.currentPage = totalPages;
    if (this.currentPage < 1) this.currentPage = 1;

    const startIndex = (this.currentPage - 1) * this.pageSize;
    const paginatedItems = items.slice(startIndex, startIndex + this.pageSize);

    // Update counter labels
    const showingCountEl = document.getElementById('table-showing-count');
    if (showingCountEl) {
      const startNum = totalItems === 0 ? 0 : startIndex + 1;
      const endNum = Math.min(startIndex + this.pageSize, totalItems);
      showingCountEl.textContent = `${startNum} - ${endNum} / ${totalItems}`;
    }

    if (paginatedItems.length === 0) {
      tbody.innerHTML = `<tr><td colspan="13" class="text-center" style="padding: 3rem; color: var(--text-muted);">${t('no_records')}</td></tr>`;
      this.renderPagination(1, 1);
      return;
    }

    tbody.innerHTML = paginatedItems.map((item, idx) => {
      const branch = branches.find(b => b.id === item.branchId);
      const qType = quotationTypes.find(t => t.id === item.quotationTypeId);
      const pType = projectTypes.find(p => p.id === item.projectTypeId);

      const branchName = branch ? (isAr ? branch.nameAr : branch.nameEn) : '-';
      const qTypeName = qType ? (isAr ? qType.nameAr : qType.nameEn) : '-';
      const pTypeName = pType ? (isAr ? pType.nameAr : pType.nameEn) : '-';
      const statusLabel = t(`status_${item.status}`);
      const rowNum = startIndex + idx + 1;

      return `
        <tr>
          <td><strong>${rowNum}</strong></td>
          <td><span style="font-weight: 800; color: var(--brand-primary); cursor: pointer;" onclick="DMCDetails.open('${item.id}')">${item.quotationNo}</span></td>
          <td><div style="font-weight: 700; max-width: 220px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${isAr ? item.titleAr : item.titleEn}</div></td>
          <td>${isAr ? item.clientNameAr : item.clientNameEn}</td>
          <td><span class="badge" style="background: rgba(11,61,98,0.08); color: var(--brand-primary);">${branchName}</span></td>
          <td>${qTypeName}</td>
          <td>${pTypeName}</td>
          <td><strong>${item.amount.toLocaleString()}</strong></td>
          <td>${item.currency}</td>
          <td><span class="badge badge-${item.status}"><span class="badge-dot"></span>${statusLabel}</span></td>
          <td>${item.creationDate}</td>
          <td>${item.validUntil}</td>
          <td>
            <div class="d-flex align-center gap-1">
              <button class="btn btn-outline btn-icon" title="${t('action_view')}" onclick="DMCDetails.open('${item.id}')">
                <i class="fa-regular fa-eye"></i>
              </button>
              <button class="btn btn-outline btn-icon" title="${t('action_open_file')}" onclick="DMCQuotations.openFile('${item.id}')" style="color: #EF4444;">
                <i class="fa-regular fa-file-pdf"></i>
              </button>
              <button class="btn btn-outline btn-icon" title="${t('action_edit')}" onclick="DMCForm.openEdit('${item.id}')">
                <i class="fa-regular fa-pen-to-square"></i>
              </button>
              <button class="btn btn-outline btn-icon" title="${t('action_change_status')}" onclick="DMCQuotations.openChangeStatus('${item.id}')" style="color: var(--brand-gold);">
                <i class="fa-solid fa-arrows-rotate"></i>
              </button>
              <button class="btn btn-outline btn-icon" title="${t('action_delete')}" onclick="DMCQuotations.confirmDelete('${item.id}')" style="color: #EF4444;">
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
    const container = document.getElementById('table-pagination-controls');
    if (!container) return;

    let html = `
      <button class="page-btn" ${current === 1 ? 'disabled' : ''} onclick="DMCQuotations.goToPage(${current - 1})">
        <i class="fa-solid fa-chevron-${getLang() === 'ar' ? 'right' : 'left'}"></i>
      </button>
    `;

    for (let i = 1; i <= total; i++) {
      if (i === 1 || i === total || (i >= current - 1 && i <= current + 1)) {
        html += `<button class="page-btn ${i === current ? 'active' : ''}" onclick="DMCQuotations.goToPage(${i})">${i}</button>`;
      } else if (i === current - 2 || i === current + 2) {
        html += `<span style="padding: 0 4px;">...</span>`;
      }
    }

    html += `
      <button class="page-btn" ${current === total ? 'disabled' : ''} onclick="DMCQuotations.goToPage(${current + 1})">
        <i class="fa-solid fa-chevron-${getLang() === 'ar' ? 'left' : 'right'}"></i>
      </button>
    `;

    container.innerHTML = html;
  },

  goToPage(page) {
    this.currentPage = page;
    this.render();
  },

  openFile(id) {
    const quotation = DMCStore.getQuotationById(id);
    if (!quotation) {
      if (typeof DMCApp !== 'undefined' && DMCApp.showToast) {
        DMCApp.showToast(getLang() === 'ar' ? 'عرض السعر غير موجود' : 'Quotation not found', 'error');
      } else {
        alert('Quotation not found');
      }
      return;
    }

    // Check all possible file link properties
    let fileUrl = (quotation.file && (quotation.file.fileLink || quotation.file.link || quotation.file.dataUrl)) ||
                  quotation.fileLink ||
                  quotation.fileDataUrl ||
                  '';

    if (!fileUrl && quotation.revisions && quotation.revisions.length > 0) {
      const latestRev = quotation.revisions[quotation.revisions.length - 1];
      fileUrl = latestRev.fileLink || latestRev.dataUrl || '';
    }

    fileUrl = (fileUrl || '').trim();

    if (!fileUrl) {
      const msgAr = 'لا يوجد رابط وثيقة مؤرشفة لهذا العرض بعد.\nهل ترغب في فتح نافذة تعديل العرض لإدخال رابط المستند (OneDrive / SharePoint)؟';
      const msgEn = 'No archived document link for this quotation yet.\nWould you like to open the edit window to enter a document link (OneDrive / SharePoint)?';
      if (confirm(getLang() === 'ar' ? msgAr : msgEn)) {
        DMCForm.openEdit(id);
      }
      return;
    }

    // If it looks like a URL without protocol (e.g. sharepoint.com or onedrive.live.com)
    if (!fileUrl.startsWith('http://') && !fileUrl.startsWith('https://') && !fileUrl.startsWith('data:') && !fileUrl.startsWith('blob:')) {
      if (fileUrl.includes('.') && !fileUrl.includes(' ')) {
        fileUrl = 'https://' + fileUrl;
      }
    }

    // Open Web / Cloud Link (OneDrive, SharePoint, Google Drive, Dropbox, external)
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://') || fileUrl.startsWith('//')) {
      const win = window.open(fileUrl, '_blank', 'noopener,noreferrer');
      if (!win) {
        window.location.assign(fileUrl);
      }
      return;
    }

    // If it's a data URL / Base64 PDF
    if (fileUrl.startsWith('data:')) {
      try {
        const parts = fileUrl.split(';base64,');
        const contentType = parts[0].split(':')[1] || 'application/pdf';
        const raw = window.atob(parts[1]);
        const rawLength = raw.length;
        const uInt8Array = new Uint8Array(rawLength);
        for (let i = 0; i < rawLength; ++i) {
          uInt8Array[i] = raw.charCodeAt(i);
        }
        const blob = new Blob([uInt8Array], { type: contentType });
        const blobUrl = URL.createObjectURL(blob);
        const win = window.open(blobUrl, '_blank');
        if (!win) {
          const a = document.createElement('a');
          a.href = blobUrl;
          a.download = (quotation.file && quotation.file.name) || `${quotation.quotationNo}.pdf`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
        return;
      } catch (e) {
        console.error('Error opening base64 PDF:', e);
      }
    }

    // Generic fallback
    window.open(fileUrl, '_blank');
  },

  openChangeStatus(id) {
    const quotation = DMCStore.getQuotationById(id);
    if (!quotation) return;

    const select = document.getElementById('quick-status-select');
    const modal = document.getElementById('modal-quick-status');
    const hiddenId = document.getElementById('quick-status-id');

    if (select && modal && hiddenId) {
      hiddenId.value = id;
      select.value = quotation.status;
      modal.classList.add('active');
    }
  },

  saveQuickStatus() {
    const hiddenId = document.getElementById('quick-status-id');
    const select = document.getElementById('quick-status-select');
    if (!hiddenId || !select) return;

    const id = hiddenId.value;
    const newStatus = select.value;
    DMCStore.updateStatus(id, newStatus);

    document.getElementById('modal-quick-status').classList.remove('active');
    DMCApp.showToast(t('msg_status_updated'), 'success');
  },

  confirmDelete(id) {
    if (!DMCAuth.isAdmin()) {
      alert('فقط مدير النظام مخول بحذف عروض الأسعار من الأرشيف / Only administrators can delete archived quotations.');
      return;
    }

    if (confirm(t('confirm_delete'))) {
      DMCStore.deleteQuotation(id);
      DMCApp.showToast(t('msg_deleted_success'), 'success');
    }
  }
};
