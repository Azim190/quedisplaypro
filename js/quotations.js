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

  activeViewerQuotationId: null,

  openFile(id) {
    const quotation = DMCStore.getQuotationById(id);
    if (!quotation) {
      if (typeof DMCApp !== 'undefined' && DMCApp.showToast) {
        DMCApp.showToast(getLang() === 'ar' ? 'عرض السعر غير موجود' : 'Quotation not found', 'error');
      }
      return;
    }

    // Check all possible file link properties (Drive / OneDrive / SharePoint / Cloud link)
    let fileUrl = quotation.fileLink ||
                  (quotation.file && (quotation.file.fileLink || quotation.file.link || quotation.file.dataUrl)) ||
                  quotation.fileDataUrl ||
                  '';

    if (!fileUrl && quotation.revisions && quotation.revisions.length > 0) {
      const latestRev = quotation.revisions[quotation.revisions.length - 1];
      fileUrl = latestRev.fileLink || latestRev.dataUrl || '';
    }

    fileUrl = (fileUrl || '').trim();

    // If it looks like a URL without protocol (e.g. sharepoint.com, onedrive.live.com, drive.google.com)
    if (fileUrl && !fileUrl.startsWith('http://') && !fileUrl.startsWith('https://') && !fileUrl.startsWith('data:') && !fileUrl.startsWith('blob:')) {
      if (fileUrl.includes('.') && !fileUrl.includes(' ')) {
        fileUrl = 'https://' + fileUrl;
      }
    }

    // Open directly in Drive link (OneDrive, Google Drive, SharePoint, cloud server link)
    if (fileUrl && (fileUrl.startsWith('http://') || fileUrl.startsWith('https://') || fileUrl.startsWith('//'))) {
      const win = window.open(fileUrl, '_blank', 'noopener,noreferrer');
      if (!win) {
        // Fallback: trigger anchor click if popup blocker caught window.open
        const a = document.createElement('a');
        a.href = fileUrl;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
      if (typeof DMCApp !== 'undefined' && DMCApp.showToast) {
        DMCApp.showToast(getLang() === 'ar' ? 'جاري فتح الملف في الرابط السحابي (Drive)...' : 'Opening file in Drive link...', 'info');
      }
      return;
    }

    // If it's a data URL / Base64 PDF
    if (fileUrl && fileUrl.startsWith('data:')) {
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

    // If NO Drive link is registered yet:
    // Inform user and directly open the edit modal to enter the Drive link!
    const msgAr = 'لا يوجد رابط سحابي (Google Drive / OneDrive) مسجل لهذا العرض بعد. يرجى إدخال رابط المستند.';
    const msgEn = 'No cloud Drive link registered for this quotation yet. Please enter the Drive document link.';
    if (typeof DMCApp !== 'undefined' && DMCApp.showToast) {
      DMCApp.showToast(getLang() === 'ar' ? msgAr : msgEn, 'warning');
    }
    DMCForm.openEdit(id);
    setTimeout(() => {
      const linkInput = document.getElementById('form-file-link');
      if (linkInput) {
        linkInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        linkInput.focus();
      }
    }, 300);
  },

  openDocumentViewer(id) {
    const quotation = DMCStore.getQuotationById(id);
    if (!quotation) return;

    this.activeViewerQuotationId = id;
    const isAr = getLang() === 'ar';
    const branches = DMCStore.getBranches();
    const quotationTypes = DMCStore.getQuotationTypes();
    const projectTypes = DMCStore.getProjectTypes();

    const branch = branches.find(b => b.id === quotation.branchId);
    const qType = quotationTypes.find(t => t.id === quotation.quotationTypeId);
    const pType = projectTypes.find(p => p.id === quotation.projectTypeId);

    const branchName = branch ? (isAr ? branch.nameAr : branch.nameEn) : 'دار مكة - الفرع الرئيسي';
    const qTypeName = qType ? (isAr ? qType.nameAr : qType.nameEn) : (quotation.titleAr || quotation.titleEn);
    const pTypeName = pType ? (isAr ? pType.nameAr : pType.nameEn) : '-';
    const statusLabel = t(`status_${quotation.status}`) || quotation.status;

    let fileUrl = quotation.fileLink || (quotation.file && (quotation.file.fileLink || quotation.file.link || quotation.file.dataUrl)) || '';

    const modal = document.getElementById('modal-document-viewer');
    if (!modal) return;

    document.getElementById('doc-viewer-qno').textContent = quotation.quotationNo;
    document.getElementById('doc-viewer-badge').innerHTML = `
      <span class="badge badge-${quotation.status}"><span class="badge-dot"></span>${statusLabel}</span>
    `;

    document.getElementById('doc-sheet-qno').textContent = quotation.quotationNo;
    document.getElementById('doc-sheet-branch').textContent = branchName;
    document.getElementById('doc-sheet-date').textContent = quotation.creationDate;
    document.getElementById('doc-sheet-valid').textContent = quotation.validUntil || '-';

    document.getElementById('doc-sheet-client').textContent = isAr ? (quotation.clientNameAr || quotation.clientNameEn) : (quotation.clientNameEn || quotation.clientNameAr);
    document.getElementById('doc-sheet-project').textContent = isAr ? (quotation.projectNameAr || quotation.projectNameEn) : (quotation.projectNameEn || quotation.projectNameAr);
    document.getElementById('doc-sheet-title').textContent = isAr ? (quotation.titleAr || quotation.titleEn) : (quotation.titleEn || quotation.titleAr);
    document.getElementById('doc-sheet-qtype').textContent = qTypeName;
    document.getElementById('doc-sheet-ptype').textContent = pTypeName;

    const currency = quotation.currency || 'SAR';
    const amount = Number(quotation.amount) || 0;
    const vatAmount = quotation.vatAmount !== undefined ? quotation.vatAmount : Math.round(amount * 0.15);
    const totalAmount = quotation.totalAmount !== undefined ? quotation.totalAmount : (amount + vatAmount);

    document.getElementById('doc-sheet-subtotal').textContent = `${amount.toLocaleString()} ${currency}`;
    document.getElementById('doc-sheet-vat').textContent = `${vatAmount.toLocaleString()} ${currency}`;
    document.getElementById('doc-sheet-total').textContent = `${totalAmount.toLocaleString()} ${currency}`;
    document.getElementById('doc-sheet-item-desc').textContent = isAr ? (quotation.titleAr || quotation.projectNameAr) : (quotation.titleEn || quotation.projectNameEn);
    document.getElementById('doc-sheet-item-amount').textContent = `${amount.toLocaleString()} ${currency}`;

    const notesEl = document.getElementById('doc-sheet-notes');
    if (notesEl) {
      notesEl.textContent = quotation.notes || (isAr ? 'الأسعار شاملة تقديم المخططات والدراسات الهندسية المعتمدة وفق كود البناء السعودي.' : 'Prices include engineering studies and approved drawings according to Saudi Building Code.');
    }

    const cloudBtn = document.getElementById('doc-viewer-btn-cloud');
    const cloudBanner = document.getElementById('doc-viewer-cloud-banner');

    if (fileUrl && fileUrl.trim().length > 0) {
      if (cloudBtn) {
        cloudBtn.style.display = 'inline-flex';
        cloudBtn.onclick = () => window.open(fileUrl, '_blank');
      }
      if (cloudBanner) {
        cloudBanner.innerHTML = `
          <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: var(--radius-md); padding: 0.75rem 1rem; display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; margin-bottom: 1.25rem;">
            <div style="display: flex; align-items: center; gap: 0.6rem; font-size: 0.88rem; color: #10B981;">
              <i class="fa-brands fa-microsoft" style="font-size: 1.2rem;"></i>
              <span><strong>الوثيقة المؤرشفة سحابياً:</strong> ${quotation.fileName || (quotation.file && quotation.file.name) || 'مستند العرض (OneDrive)'}</span>
            </div>
            <button type="button" class="btn btn-sm btn-outline" style="border-color: #10B981; color: #10B981; font-weight: 700;" onclick="window.open('${fileUrl}', '_blank')">
              <i class="fa-solid fa-arrow-up-right-from-square"></i> فتح الرابط السحابي
            </button>
          </div>
        `;
      }
    } else {
      if (cloudBtn) {
        cloudBtn.style.display = 'none';
      }
      if (cloudBanner) {
        cloudBanner.innerHTML = `
          <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: var(--radius-md); padding: 0.75rem 1rem; display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; margin-bottom: 1.25rem;">
            <div style="display: flex; align-items: center; gap: 0.6rem; font-size: 0.85rem; color: #D97706;">
              <i class="fa-solid fa-circle-info" style="font-size: 1.1rem;"></i>
              <span>لم يتم ربط رابط سحابي (OneDrive / SharePoint) لهذا العرض بعد. يمكنك طباعة/حفظ العرض كملف PDF، أو ربط المستند السحابي.</span>
            </div>
            <button type="button" class="btn btn-sm btn-outline" style="border-color: #D97706; color: #D97706; font-weight: 700; white-space: nowrap;" onclick="DMCQuotations.promptEditFileLink('${quotation.id}')">
              <i class="fa-solid fa-link"></i> ربط ملف سحابي
            </button>
          </div>
        `;
      }
    }

    modal.classList.add('active');
    document.body.classList.add('modal-open');
    const modalBody = modal.querySelector('.modal-body');
    if (modalBody) modalBody.scrollTop = 0;
  },

  closeDocumentViewer() {
    const modal = document.getElementById('modal-document-viewer');
    if (modal) modal.classList.remove('active');
    document.body.classList.remove('modal-open');
  },

  printDocument(id) {
    const targetId = id || this.activeViewerQuotationId;
    if (!targetId) return;
    const quotation = DMCStore.getQuotationById(targetId);
    if (!quotation) return;

    const sheetEl = document.getElementById('doc-viewer-sheet-container');
    if (!sheetEl) {
      window.print();
      return;
    }

    const printWin = window.open('', '_blank', 'width=950,height=900');
    if (!printWin) {
      window.print();
      return;
    }

    const sheetContent = sheetEl.innerHTML;
    printWin.document.open();
    printWin.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8">
        <title>${quotation.quotationNo} - دار مكة للاستشارات الهندسية</title>
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Outfit:wght@400;600;700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
        <link rel="stylesheet" href="css/components.css">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Cairo', sans-serif; background: #fff; color: #1e293b; padding: 25px; }
          .dmc-doc-sheet { max-width: 850px; margin: 0 auto; border: none !important; box-shadow: none !important; padding: 0 !important; }
          @media print {
            body { padding: 0; }
            .dmc-doc-sheet { max-width: 100%; }
          }
        </style>
      </head>
      <body>
        <div class="dmc-doc-sheet">
          ${sheetContent}
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        <\/script>
      </body>
      </html>
    `);
    printWin.document.close();
  },

  promptEditFileLink(id) {
    this.closeDocumentViewer();
    DMCForm.openEdit(id);
    setTimeout(() => {
      const linkInput = document.getElementById('form-file-link');
      if (linkInput) {
        linkInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        linkInput.focus();
      }
    }, 250);
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

    DMCApp.confirm(t('confirm_delete'), () => {
      DMCStore.deleteQuotation(id);
      DMCApp.showToast(t('msg_deleted_success'), 'success');
    });
  }
};

window.DMCQuotations = DMCQuotations;

