/**
 * DMC Dar Makkah Engineering Consultancy
 * Audit Log Module
 * Tracks system modifications, status shifts, revisions and deletions
 */

const DMCAudit = {
  init() {
    this.render();
    window.addEventListener('dmc-data-changed', () => this.render());
  },

  render() {
    const tbody = document.getElementById('audit-table-body');
    if (!tbody) return;

    const logs = DMCStore.getAuditLogs();
    if (logs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center" style="padding: 2rem; color: var(--text-muted);">لا توجد حركات مسجلة حتى الآن</td></tr>`;
      return;
    }

    tbody.innerHTML = logs.map((log, idx) => `
      <tr>
        <td><strong>${idx + 1}</strong></td>
        <td><span class="badge" style="background: rgba(11,61,98,0.08); color: var(--brand-primary); font-weight: 700;">${log.action}</span></td>
        <td>${log.userName}</td>
        <td>${new Date(log.date).toLocaleString()}</td>
        <td>${log.details || '-'}</td>
        <td><code>${log.after || '-'}</code></td>
      </tr>
    `).join('');
  }
};
