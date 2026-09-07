/**
 * DMC Dar Makkah Engineering Consultancy
 * Quotation Profile Details Modal & File Viewer
 * Complete metadata, financial details, revision timeline, and audit trail
 */

const DMCDetails = {
  activeQuotationId: null,

  open(id) {
    const quotation = DMCStore.getQuotationById(id);
    if (!quotation) return;

    this.activeQuotationId = id;
    const isAr = getLang() === 'ar';
    const branches = DMCStore.getBranches();
    const quotationTypes = DMCStore.getQuotationTypes();
    const projectTypes = DMCStore.getProjectTypes();

    const branch = branches.find(b => b.id === quotation.branchId);
    const qType = quotationTypes.find(t => t.id === quotation.quotationTypeId);
    const pType = projectTypes.find(p => p.id === quotation.projectTypeId);

    const branchName = branch ? (isAr ? branch.nameAr : branch.nameEn) : '-';
    const qTypeName = qType ? (isAr ? qType.nameAr : qType.nameEn) : '-';
    const pTypeName = pType ? (isAr ? pType.nameAr : pType.nameEn) : '-';
    const statusLabel = t(`status_${quotation.status}`);

    // Set Header
    document.getElementById('detail-modal-qno').textContent = quotation.quotationNo;
    document.getElementById('detail-modal-status').innerHTML = `
      <span class="badge badge-${quotation.status}"><span class="badge-dot"></span>${statusLabel}</span>
    `;

    // Overview Fields
    document.getElementById('detail-title').textContent = isAr ? quotation.titleAr : quotation.titleEn;
    document.getElementById('detail-client').textContent = isAr ? quotation.clientNameAr : quotation.clientNameEn;
    document.getElementById('detail-project').textContent = isAr ? quotation.projectNameAr : quotation.projectNameEn;
    document.getElementById('detail-branch').textContent = branchName;
    document.getElementById('detail-qtype').textContent = qTypeName;
    document.getElementById('detail-ptype').textContent = pTypeName;
    document.getElementById('detail-amount').textContent = `${quotation.amount.toLocaleString()} ${quotation.currency}`;
    document.getElementById('detail-vat').textContent = `${(quotation.vatAmount || Math.round(quotation.amount * 0.15)).toLocaleString()} ${quotation.currency}`;
    document.getElementById('detail-total').textContent = `${(quotation.totalAmount || quotation.amount * 1.15).toLocaleString()} ${quotation.currency}`;
    document.getElementById('detail-created').textContent = quotation.creationDate;
    document.getElementById('detail-valid').textContent = quotation.validUntil;
    document.getElementById('detail-uploaded-by').textContent = (quotation.file && quotation.file.uploadedBy) || 'Engineer';
    document.getElementById('detail-upload-date').textContent = (quotation.file && quotation.file.uploadDate) ? new Date(quotation.file.uploadDate).toLocaleString() : '-';

    // Archived File Details
    const fileNameEl = document.getElementById('detail-file-name');
    const fileSizeEl = document.getElementById('detail-file-size');
    if (fileNameEl) fileNameEl.textContent = (quotation.file && quotation.file.name) || 'DMC_Official_Document.pdf';
    if (fileSizeEl) fileSizeEl.textContent = (quotation.file && (quotation.file.platform || quotation.file.size)) || 'Microsoft OneDrive';

    // Render Revisions Timeline
    this.renderRevisions(quotation);

    // Switch to Overview tab by default
    this.switchTab('overview');

    document.getElementById('modal-quotation-details').classList.add('active');
    document.body.classList.add('modal-open');
  },

  closeModal() {
    document.getElementById('modal-quotation-details').classList.remove('active');
    document.body.classList.remove('modal-open');
  },

  switchTab(tabName) {
    document.querySelectorAll('.detail-tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.detail-tab-pane').forEach(pane => pane.style.display = 'none');

    const activeBtn = document.getElementById(`detail-tab-btn-${tabName}`);
    const activePane = document.getElementById(`detail-pane-${tabName}`);

    if (activeBtn) activeBtn.classList.add('active');
    if (activePane) activePane.style.display = 'block';
  },

  renderRevisions(quotation) {
    const list = document.getElementById('detail-revisions-list');
    if (!list) return;

    if (!quotation.revisions || quotation.revisions.length === 0) {
      list.innerHTML = `<div style="padding: 1.5rem; color: var(--text-muted); text-align: center;">لا توجد نسخ معدلة مسجلة لهذا العرض (النسخة الأصلية هي المعتمدة)</div>`;
      return;
    }

    list.innerHTML = quotation.revisions.map(rev => `
      <div class="revision-item">
        <div class="revision-bullet"></div>
        <div class="revision-content">
          <div class="revision-header">
            <span class="revision-tag">النسخة المعدلة رقم (Revision #${rev.revisionNo})</span>
            <span class="revision-date">${rev.date}</span>
          </div>
          <p style="font-size: 0.88rem; margin-bottom: 0.5rem; color: var(--text-main);">${rev.notes || 'تعديل تقني/مالي'}</p>
          <div class="d-flex align-center justify-between" style="font-size: 0.8rem; color: var(--text-muted);">
            <span><i class="fa-regular fa-file-pdf" style="color: #EF4444;"></i> ${rev.fileName}</span>
            <span>بواسطة: ${rev.uploadedBy}</span>
          </div>
        </div>
      </div>
    `).join('');
  },

  openActiveFile() {
    if (this.activeQuotationId) {
      DMCQuotations.openFile(this.activeQuotationId);
    }
  },

  addRevisionForActive() {
    if (this.activeQuotationId) {
      this.closeModal();
      DMCRevisions.open(this.activeQuotationId);
    }
  }
};
