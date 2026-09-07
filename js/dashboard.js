/**
 * DMC Dar Makkah Engineering Consultancy
 * Interactive Dashboard & Chart.js Visualizations
 * Dynamic KPI Cards, Filter Synchronization, and Current Month Quotations
 */

const DMCDashboard = {
  charts: {},
  currentFilters: {
    branch: 'all',
    status: 'all',
    type: 'all',
    dateFilter: 'all',
    sort: 'newest',
    query: ''
  },

  init() {
    this.bindFilterEvents();
    this.renderAll();

    // Re-render when data or language changes
    window.addEventListener('dmc-data-changed', () => this.renderAll());
    window.addEventListener('dmc-language-changed', () => {
      this.populateFilterDropdowns();
      this.renderAll();
    });
  },

  populateFilterDropdowns() {
    const isAr = getLang() === 'ar';
    const branches = DMCStore.getBranches();
    const statuses = DMCStore.getStatuses();
    const types = DMCStore.getQuotationTypes();

    // Branch filter dropdown
    const branchSelect = document.getElementById('filter-branch');
    if (branchSelect) {
      const currentVal = branchSelect.value;
      branchSelect.innerHTML = `<option value="all">${t('filter_all_branches')}</option>` +
        branches.map(b => `<option value="${b.id}">${isAr ? b.nameAr : b.nameEn}</option>`).join('');
      branchSelect.value = currentVal || 'all';
    }

    // Status filter dropdown
    const statusSelect = document.getElementById('filter-status');
    if (statusSelect) {
      const currentVal = statusSelect.value;
      statusSelect.innerHTML = `<option value="all">${t('filter_all_statuses')}</option>` +
        statuses.map(s => `<option value="${s.id}">${isAr ? s.nameAr : s.nameEn}</option>`).join('');
      statusSelect.value = currentVal || 'all';
    }

    // Type filter dropdown
    const typeSelect = document.getElementById('filter-type');
    if (typeSelect) {
      const currentVal = typeSelect.value;
      typeSelect.innerHTML = `<option value="all">${t('filter_all_types')}</option>` +
        types.map(tp => `<option value="${tp.id}">${isAr ? tp.nameAr : tp.nameEn}</option>`).join('');
      typeSelect.value = currentVal || 'all';
    }
  },

  bindFilterEvents() {
    this.populateFilterDropdowns();

    const branchSelect = document.getElementById('filter-branch');
    const statusSelect = document.getElementById('filter-status');
    const typeSelect = document.getElementById('filter-type');
    const dateSelect = document.getElementById('filter-date');
    const sortSelect = document.getElementById('filter-sort');
    const searchInput = document.getElementById('filter-search');
    const resetBtn = document.getElementById('btn-reset-filters');

    if (branchSelect) {
      branchSelect.addEventListener('change', (e) => {
        this.currentFilters.branch = e.target.value;
        this.renderAll();
      });
    }

    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        this.currentFilters.status = e.target.value;
        this.renderAll();
      });
    }

    if (typeSelect) {
      typeSelect.addEventListener('change', (e) => {
        this.currentFilters.type = e.target.value;
        this.renderAll();
      });
    }

    if (dateSelect) {
      dateSelect.addEventListener('change', (e) => {
        this.currentFilters.dateFilter = e.target.value;
        this.renderAll();
      });
    }

    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.currentFilters.sort = e.target.value;
        this.renderAll();
      });
    }

    if (searchInput) {
      let timeout;
      searchInput.addEventListener('input', (e) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          this.currentFilters.query = e.target.value;
          this.renderAll();
        }, 200);
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.currentFilters = {
          branch: 'all',
          status: 'all',
          type: 'all',
          dateFilter: 'all',
          sort: 'newest',
          query: ''
        };
        if (branchSelect) branchSelect.value = 'all';
        if (statusSelect) statusSelect.value = 'all';
        if (typeSelect) typeSelect.value = 'all';
        if (dateSelect) dateSelect.value = 'all';
        if (sortSelect) sortSelect.value = 'newest';
        if (searchInput) searchInput.value = '';
        this.renderAll();
      });
    }
  },

  renderAll() {
    const quotations = DMCStore.getQuotations(this.currentFilters);
    this.renderKPIs(quotations);
    this.renderCharts(quotations);
    this.renderMonthTable(quotations);
  },

  // Compute and update all 10 KPI Cards
  renderKPIs(filteredQuotations) {
    const today = new Date();
    const curYear = today.getFullYear();
    const curMonth = today.getMonth();

    // 1. Total
    const totalCount = filteredQuotations.length;
    this.setKpiText('kpi-val-total', totalCount);

    // Update sidebar badge
    const allTotal = DMCStore.getQuotations().length;
    const sidebarBadge = document.getElementById('sidebar-total-badge');
    if (sidebarBadge) sidebarBadge.textContent = allTotal;

    // 2. This Month
    const thisMonthCount = filteredQuotations.filter(q => {
      const d = new Date(q.creationDate);
      return d.getFullYear() === curYear && d.getMonth() === curMonth;
    }).length;
    this.setKpiText('kpi-val-month', thisMonthCount);

    // 3. Approved
    const approvedCount = filteredQuotations.filter(q => q.status === 'approved').length;
    this.setKpiText('kpi-val-approved', approvedCount);

    // 4. Closed
    const closedCount = filteredQuotations.filter(q => q.status === 'closed').length;
    this.setKpiText('kpi-val-closed', closedCount);

    // 5. Ongoing
    const ongoingCount = filteredQuotations.filter(q => q.status === 'ongoing').length;
    this.setKpiText('kpi-val-ongoing', ongoingCount);

    // 6. Not Started
    const notStartedCount = filteredQuotations.filter(q => q.status === 'notstarted').length;
    this.setKpiText('kpi-val-notstarted', notStartedCount);

    // 7. Completed
    const completedCount = filteredQuotations.filter(q => q.status === 'completed').length;
    this.setKpiText('kpi-val-completed', completedCount);

    // 8. New
    const newCount = filteredQuotations.filter(q => q.status === 'new').length;
    this.setKpiText('kpi-val-new', newCount);

    // 9. Revised
    const revisedCount = filteredQuotations.filter(q => q.status === 'revised').length;
    this.setKpiText('kpi-val-revised', revisedCount);

    // 10. Highest Value
    if (filteredQuotations.length > 0) {
      const highest = [...filteredQuotations].sort((a, b) => b.amount - a.amount)[0];
      this.setKpiText('kpi-val-highest', `${highest.currency} ${highest.amount.toLocaleString()}`);
    } else {
      this.setKpiText('kpi-val-highest', 'SAR 0');
    }
  },

  setKpiText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  },

  // Render or update all Chart.js visualizations
  renderCharts(quotations) {
    if (typeof Chart === 'undefined') return;

    const isAr = getLang() === 'ar';
    const isDark = DMCStore.getTheme() === 'dark';
    const textColor = isDark ? '#94A3B8' : '#64748B';
    const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

    // 1. Quotations by Branch
    const branches = DMCStore.getBranches();
    const branchLabels = branches.map(b => isAr ? b.nameAr.replace('فرع ', '') : b.nameEn.replace(' Branch', ''));
    const branchData = branches.map(b => quotations.filter(q => q.branchId === b.id).length);

    this.renderOrUpdateChart('chart-branch', {
      type: 'bar',
      data: {
        labels: branchLabels,
        datasets: [{
          label: isAr ? 'عدد العروض' : 'Quotations Count',
          data: branchData,
          backgroundColor: '#0B3D62',
          hoverBackgroundColor: '#D4AF37',
          borderRadius: 6,
          barThickness: 24
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: textColor, font: { family: 'Tajawal', size: 11, weight: 'bold' } }
          },
          y: {
            grid: { color: gridColor },
            ticks: { color: textColor, stepSize: 10 }
          }
        }
      }
    });

    // 2. Quotations by Status (Doughnut)
    const statuses = DMCStore.getStatuses();
    const statusLabels = statuses.map(s => isAr ? s.nameAr : s.nameEn);
    const statusColors = ['#10B981', '#EF4444', '#3B82F6', '#64748B', '#059669', '#8B5CF6', '#F59E0B'];
    const statusData = statuses.map(s => quotations.filter(q => q.status === s.id).length);

    this.renderOrUpdateChart('chart-status', {
      type: 'doughnut',
      data: {
        labels: statusLabels,
        datasets: [{
          data: statusData,
          backgroundColor: statusColors,
          borderWidth: 2,
          borderColor: isDark ? '#0E2236' : '#FFFFFF',
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: {
            position: isAr ? 'right' : 'right',
            labels: { color: textColor, font: { family: 'Tajawal', size: 11 }, boxWidth: 10, padding: 8 }
          }
        }
      }
    });
    const statusTotalEl = document.getElementById('chart-status-total');
    if (statusTotalEl) statusTotalEl.textContent = quotations.length;

    // 3. Quotations by Type (Doughnut)
    const types = DMCStore.getQuotationTypes();
    const typeLabels = types.map(t => isAr ? t.nameAr.replace('عروض ', '') : t.nameEn.replace(' Quotations', ''));
    const typeColors = ['#0B3D62', '#D4AF37', '#0284C7', '#10B981', '#F59E0B', '#8B5CF6', '#64748B'];
    const typeData = types.map(tp => quotations.filter(q => q.quotationTypeId === tp.id).length);

    this.renderOrUpdateChart('chart-type', {
      type: 'doughnut',
      data: {
        labels: typeLabels,
        datasets: [{
          data: typeData,
          backgroundColor: typeColors,
          borderWidth: 2,
          borderColor: isDark ? '#0E2236' : '#FFFFFF',
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: {
            position: isAr ? 'right' : 'right',
            labels: { color: textColor, font: { family: 'Tajawal', size: 11 }, boxWidth: 10, padding: 8 }
          }
        }
      }
    });
    const typeTotalEl = document.getElementById('chart-type-total');
    if (typeTotalEl) typeTotalEl.textContent = quotations.length;

    // 4. Monthly Quotations (Line Trend Chart)
    const monthNamesAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthLabels = isAr ? monthNamesAr : monthNamesEn;

    const curYear = new Date().getFullYear();
    const monthlyCounts = Array(12).fill(0);

    quotations.forEach(q => {
      const d = new Date(q.creationDate);
      if (d.getFullYear() === curYear) {
        monthlyCounts[d.getMonth()]++;
      }
    });

    this.renderOrUpdateChart('chart-monthly', {
      type: 'line',
      data: {
        labels: monthLabels,
        datasets: [{
          label: isAr ? 'العروض المنشأة' : 'Archived Quotations',
          data: monthlyCounts,
          borderColor: '#0284C7',
          backgroundColor: 'rgba(2, 132, 199, 0.1)',
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#D4AF37',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: textColor, font: { family: 'Tajawal', size: 11 } }
          },
          y: {
            grid: { color: gridColor },
            ticks: { color: textColor }
          }
        }
      }
    });

    // 5. Quotation Value Analysis Card & Top Value Quotation
    const totalFinancialVal = quotations.reduce((acc, q) => acc + (Number(q.amount) || 0), 0);
    const totalValEl = document.getElementById('val-summary-amount');
    if (totalValEl) {
      totalValEl.textContent = `SAR ${totalFinancialVal.toLocaleString()}`;
    }

    if (quotations.length > 0) {
      const topQ = [...quotations].sort((a, b) => b.amount - a.amount)[0];
      const topNoEl = document.getElementById('top-q-no');
      const topTitleEl = document.getElementById('top-q-title');
      const topValEl = document.getElementById('top-q-val');

      if (topNoEl) topNoEl.textContent = topQ.quotationNo;
      if (topTitleEl) topTitleEl.textContent = isAr ? topQ.titleAr : topQ.titleEn;
      if (topValEl) topValEl.textContent = `${topQ.currency} ${topQ.amount.toLocaleString()}`;
    }

    // Mini bar chart inside Value Card
    const branchValues = branches.map(b => {
      return quotations.filter(q => q.branchId === b.id).reduce((sum, q) => sum + q.amount, 0);
    });

    this.renderOrUpdateChart('chart-value-mini', {
      type: 'bar',
      data: {
        labels: branchLabels,
        datasets: [{
          data: branchValues,
          backgroundColor: '#0B3D62',
          hoverBackgroundColor: '#D4AF37',
          borderRadius: 3,
          barThickness: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { enabled: true } },
        scales: { x: { display: false }, y: { display: false } }
      }
    });
  },

  renderOrUpdateChart(canvasId, config) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (this.charts[canvasId]) {
      this.charts[canvasId].destroy();
    }
    this.charts[canvasId] = new Chart(canvas, config);
  },

  // Render "Quotations Created This Month" table
  renderMonthTable(quotations) {
    const tbody = document.getElementById('month-table-body');
    if (!tbody) return;

    const today = new Date();
    const curYear = today.getFullYear();
    const curMonth = today.getMonth();
    const isAr = getLang() === 'ar';

    const branches = DMCStore.getBranches();
    const quotationTypes = DMCStore.getQuotationTypes();
    const projectTypes = DMCStore.getProjectTypes();

    const monthItems = quotations.filter(q => {
      const d = new Date(q.creationDate);
      return d.getFullYear() === curYear && d.getMonth() === curMonth;
    }).slice(0, 7); // Show top 7 recent of this month

    if (monthItems.length === 0) {
      tbody.innerHTML = `<tr><td colspan="12" class="text-center" style="padding: 2.5rem; color: var(--text-muted);">${t('no_records')}</td></tr>`;
      return;
    }

    tbody.innerHTML = monthItems.map((item, idx) => {
      const branch = branches.find(b => b.id === item.branchId);
      const qType = quotationTypes.find(t => t.id === item.quotationTypeId);
      const pType = projectTypes.find(p => p.id === item.projectTypeId);

      const branchName = branch ? (isAr ? branch.nameAr : branch.nameEn) : '-';
      const qTypeName = qType ? (isAr ? qType.nameAr : qType.nameEn) : '-';
      const pTypeName = pType ? (isAr ? pType.nameAr : pType.nameEn) : '-';
      const statusLabel = t(`status_${item.status}`);

      return `
        <tr>
          <td><strong>${idx + 1}</strong></td>
          <td><span style="font-weight: 800; color: var(--brand-primary);">${item.quotationNo}</span></td>
          <td>${isAr ? item.titleAr : item.titleEn}</td>
          <td>${branchName}</td>
          <td>${isAr ? item.clientNameAr : item.clientNameEn}</td>
          <td>${pTypeName}</td>
          <td>${qTypeName}</td>
          <td><strong>${item.amount.toLocaleString()}</strong></td>
          <td><span class="badge" style="background: rgba(11,61,98,0.08); color: var(--brand-primary);">${item.currency}</span></td>
          <td><span class="badge badge-${item.status}"><span class="badge-dot"></span>${statusLabel}</span></td>
          <td>${item.creationDate}</td>
          <td>
            <div class="d-flex align-center gap-1">
              <button class="btn btn-outline btn-icon" title="${t('action_view')}" onclick="DMCDetails.open('${item.id}')">
                <i class="fa-regular fa-eye"></i>
              </button>
              <button class="btn btn-outline btn-icon" title="${t('action_open_file')}" onclick="DMCQuotations.openFile('${item.id}')" style="color: #EF4444;">
                <i class="fa-regular fa-file-pdf"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }
};
