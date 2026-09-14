/**
 * DMC Dar Makkah Engineering Consultancy
 * Quotation Profile Details Modal & File Viewer
 * Complete metadata, financial details, revision timeline, and audit trail
 */

const DMCDetails = {
  activeQuotationId: null,

  open(id, initialTab = 'overview') {
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
    if (fileNameEl) fileNameEl.textContent = (quotation.file && quotation.file.name) || quotation.fileName || 'DMC_Official_Document.pdf';
    if (fileSizeEl) fileSizeEl.textContent = (quotation.file && (quotation.file.platform || quotation.file.size)) || quotation.fileSize || 'Microsoft OneDrive';

    const fileUrl = quotation.fileLink || (quotation.file && (quotation.file.fileLink || quotation.file.link)) || '';
    const linkEl = document.getElementById('detail-file-link-url');
    if (linkEl) {
      if (fileUrl) {
        linkEl.href = fileUrl;
        linkEl.textContent = fileUrl;
        linkEl.style.display = 'inline-block';
      } else {
        linkEl.href = 'javascript:void(0)';
        linkEl.textContent = isAr ? 'لا يوجد رابط مسجل' : 'No link registered';
      }
    }

    // Render Revisions & Workflow Timelines
    this.renderRevisions(quotation);
    this.renderWorkflow(quotation);

    // Switch to requested or Overview tab
    this.switchTab(initialTab || 'overview');

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
      list.innerHTML = `<div style="padding: 1.5rem; color: var(--text-muted); text-align: center;">${getLang() === 'ar' ? 'لا توجد نسخ معدلة مسجلة لهذا العرض (النسخة الأصلية هي المعتمدة)' : 'No revisions recorded for this quotation'}</div>`;
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

  renderWorkflow(quotation) {
    const isClosed = quotation.status === 'closed';
    const lockedBanner = document.getElementById('workflow-locked-banner');
    const addContainer = document.getElementById('workflow-add-step-container');

    if (lockedBanner) lockedBanner.style.display = isClosed ? 'flex' : 'none';
    if (addContainer) addContainer.style.display = isClosed ? 'none' : 'block';

    const list = document.getElementById('detail-workflow-list');
    if (!list) return;

    const steps = DMCStore.getWorkflowSteps(quotation.id);
    const countEl = document.getElementById('workflow-steps-count');
    if (countEl) countEl.textContent = steps.length;

    if (!steps || steps.length === 0) {
      list.innerHTML = `
        <div style="padding: 2rem 1rem; color: var(--text-muted); text-align: center;">
          <i class="fa-solid fa-route" style="font-size: 2.2rem; color: var(--text-muted); opacity: 0.5; margin-bottom: 0.75rem; display: block;"></i>
          <div>${t('workflow_empty')}</div>
        </div>
      `;
      return;
    }

    const isAr = getLang() === 'ar';
    const currentUser = DMCStore.getCurrentUser();
    const isAdmin = currentUser && currentUser.role === 'admin';

    list.innerHTML = steps.map((step, idx) => {
      const stepDate = new Date(step.createdAt || Date.now());
      const dateFormatted = stepDate.toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      const processName = isAr ? (step.processAr || step.processEn) : (step.processEn || step.processAr);

      return `
        <div class="workflow-item">
          <div class="workflow-bullet"><i class="fa-solid fa-check"></i></div>
          <div class="workflow-content">
            <div class="workflow-header">
              <div class="d-flex align-center gap-2">
                <span class="workflow-step-num">#${idx + 1}</span>
                <span class="workflow-step-title">${processName}</span>
              </div>
              <div class="d-flex align-center gap-2">
                <span class="workflow-date">${dateFormatted}</span>
                ${!isClosed && isAdmin ? `
                  <button type="button" class="btn-delete-step" onclick="DMCDetails.deleteWorkflowStep('${step.id}')" title="${t('workflow_confirm_delete')}">
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                ` : ''}
              </div>
            </div>
            ${step.notes ? `<p class="workflow-notes-text">${step.notes}</p>` : ''}
            <div class="workflow-meta">
              <span><i class="fa-regular fa-user" style="font-size: 0.75rem; margin-inline-end: 0.25rem;"></i> ${t('workflow_performed_by')}: <strong>${step.performedBy}</strong></span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  submitWorkflowStep() {
    if (!this.activeQuotationId) return;
    const quotation = DMCStore.getQuotationById(this.activeQuotationId);
    if (!quotation || quotation.status === 'closed') {
      if (typeof DMCApp !== 'undefined' && DMCApp.showToast) {
        DMCApp.showToast(t('workflow_closed_msg'), 'warning');
      }
      return;
    }

    const nameInput = document.getElementById('workflow-step-name');
    const notesInput = document.getElementById('workflow-step-notes');
    const processName = nameInput ? nameInput.value.trim() : '';
    const notes = notesInput ? notesInput.value.trim() : '';

    if (!processName) return;

    const newStep = DMCStore.addWorkflowStep(this.activeQuotationId, {
      processAr: processName,
      processEn: processName,
      notes: notes
    });

    if (newStep) {
      const form = document.getElementById('workflow-add-form');
      if (form) form.reset();

      this.renderWorkflow(quotation);

      if (typeof DMCApp !== 'undefined' && DMCApp.showToast) {
        DMCApp.showToast(t('workflow_step_added'), 'success');
      }
    }
  },

  deleteWorkflowStep(stepId) {
    if (!this.activeQuotationId) return;
    const quotation = DMCStore.getQuotationById(this.activeQuotationId);
    if (!quotation || quotation.status === 'closed') return;

    if (!confirm(t('workflow_confirm_delete'))) return;

    const ok = DMCStore.deleteWorkflowStep(stepId, this.activeQuotationId);
    if (ok) {
      this.renderWorkflow(quotation);
      if (typeof DMCApp !== 'undefined' && DMCApp.showToast) {
        DMCApp.showToast(t('workflow_step_deleted'), 'success');
      }
    }
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
