/**
 * DMC Dar Makkah Engineering Consultancy
 * Quotation Revision Management
 * Preserves original uploaded file, tracks version history and revision notes
 */

const DMCRevisions = {
  currentQuotationId: null,
  revisionFile: null,

  init() {
    const fileInput = document.getElementById('revision-file-input');
    const form = document.getElementById('revision-form');

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = (evt) => {
            this.revisionFile = {
              name: file.name,
              size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
              type: file.type || 'application/pdf',
              dataUrl: evt.target.result
            };

            const labelEl = document.getElementById('revision-file-name-label');
            if (labelEl) labelEl.textContent = file.name;
          };
          reader.readAsDataURL(file);
        }
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveRevision();
      });
    }
  },

  open(quotationId) {
    const quotation = DMCStore.getQuotationById(quotationId);
    if (!quotation) return;

    this.currentQuotationId = quotationId;
    this.revisionFile = null;

    const modal = document.getElementById('modal-revision');
    const titleEl = document.getElementById('revision-modal-title');
    const form = document.getElementById('revision-form');
    const labelEl = document.getElementById('revision-file-name-label');

    if (form) form.reset();
    if (labelEl) labelEl.textContent = '';
    if (titleEl) titleEl.textContent = `${t('modal_revision_title')} (${quotation.quotationNo})`;

    if (modal) modal.classList.add('active');
  },

  closeModal() {
    const modal = document.getElementById('modal-revision');
    if (modal) modal.classList.remove('active');
  },

  saveRevision() {
    const notesInput = document.getElementById('revision-notes');
    const notes = notesInput ? notesInput.value.trim() : '';

    if (!notes) {
      alert('يرجى كتابة سبب وملاحظات التعديل / Please specify revision notes.');
      return;
    }

    const payload = {
      notes: notes,
      fileName: this.revisionFile ? this.revisionFile.name : `Revision_${Date.now()}.pdf`,
      fileDataUrl: this.revisionFile ? this.revisionFile.dataUrl : ''
    };

    DMCStore.addRevision(this.currentQuotationId, payload);
    this.closeModal();
    DMCApp.showToast(t('msg_revision_added'), 'success');
  }
};
