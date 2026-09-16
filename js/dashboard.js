/**
 * DMC Dar Makkah Engineering Consultancy
 * Interactive Dual Dashboard & Chart.js Visualizations
 * Dynamic Switcher between Quotations Dashboard and Contracts Dashboard
 * Real-time KPI Cards, Filter Synchronization, Visual Charts & Tables
 */

const DMCDashboard = {
  charts: {},
  currentMode: 'quotations', // 'quotations' | 'contracts'
  currentFilters: {
    branch: 'all',
    status: 'all',
    type: 'all',
    dateFilter: 'all',
    dateFrom: '',
    dateTo: '',
    sort: 'newest',
    query: ''
  },

  init() {
    this.bindFilterEvents();
    this.updateModeUI();
    this.renderAll();

    // Re-render when data or language changes
    window.addEventListener('dmc-data-changed', () => this.renderAll());
    window.addEventListener('dmc-language-changed', () => {
      this.populateFilterDropdowns();
      this.updateModeUI();
      this.renderAll();
    });

    // Handle window resize dynamically to prevent horizontal blowout
    window.addEventListener('resize', () => {
      if (this._resizeTimeout) clearTimeout(this._resizeTimeout);
      this._resizeTimeout = setTimeout(() => {
        Object.values(this.charts).forEach(chart => {
          if (chart && typeof chart.resize === 'function') {
            try { chart.resize(); } catch(e) {}
          }
        });
      }, 100);
    });
  },

  /**
   * Switch between Quotations and Contracts dashboard mode
   * @param {'quotations' | 'contracts'} mode 
   */
  switchMode(mode) {
    if (this.currentMode === mode) return;
    this.currentMode = mode;
    this.updateModeUI();
    this.populateFilterDropdowns();
    this.renderAll();

    if (typeof DMCApp !== 'undefined' && DMCApp.showToast) {
      const isAr = getLang() === 'ar';
      DMCApp.showToast(
        mode === 'contracts'
          ? (isAr ? 'تم الانتقال إلى لوحة تحكم العقود' : 'Switched to Contracts Dashboard')
          : (isAr ? 'تم الانتقال إلى لوحة تحكم عروض الأسعار' : 'Switched to Quotations Dashboard'),
        'info'
      );
    }
  },

  /**
   * Toggle between the two dashboards with switch icon
   */
  toggleMode() {
    this.switchMode(this.currentMode === 'quotations' ? 'contracts' : 'quotations');
  },

  /**
   * Update texts, icons, badges, and titles matching current dashboard mode
   */
  updateModeUI() {
    const isAr = getLang() === 'ar';
    const isContracts = this.currentMode === 'contracts';

    // Switcher buttons state
    const btnQuot = document.getElementById('dash-switch-quotations');
    const btnCont = document.getElementById('dash-switch-contracts');
    if (btnQuot) btnQuot.classList.toggle('active', !isContracts);
    if (btnCont) btnCont.classList.toggle('active', isContracts);

    // Switch icon rotation animation
    const iconAnim = document.getElementById('dash-switch-icon-anim');
    if (iconAnim) {
      iconAnim.style.transform = isContracts ? 'rotate(180deg)' : 'rotate(0deg)';
    }

    // Header title
    const headingEl = document.getElementById('dashboard-main-heading');
    if (headingEl) {
      headingEl.textContent = isContracts
        ? (isAr ? 'لوحة تحكم العقود الهندسية' : 'Contracts Dashboard')
        : (isAr ? 'لوحة تحكم عروض الأسعار' : 'Quotations Dashboard');
    }

    // Header mode badge indicator
    const badgeIndicator = document.getElementById('dashboard-mode-indicator');
    const badgeIcon = document.getElementById('dashboard-mode-badge-icon');
    const badgeText = document.getElementById('dashboard-mode-badge-text');
    if (badgeText) {
      badgeText.textContent = isContracts
        ? (isAr ? 'لوحة العقود' : 'Contracts')
        : (isAr ? 'عروض الأسعار' : 'Quotations');
    }
    if (badgeIcon) {
      badgeIcon.className = isContracts ? 'fa-solid fa-file-contract' : 'fa-solid fa-file-invoice';
    }
    if (badgeIndicator) {
      badgeIndicator.style.background = isContracts ? 'rgba(16, 185, 129, 0.15)' : 'rgba(212, 175, 55, 0.15)';
      badgeIndicator.style.color = isContracts ? '#10B981' : 'var(--brand-gold)';
      badgeIndicator.style.borderColor = isContracts ? 'rgba(16, 185, 129, 0.3)' : 'rgba(212, 175, 55, 0.3)';
    }

    // KPI labels
    const kpiTotalLbl = document.getElementById('kpi-lbl-total');
    if (kpiTotalLbl) {
      kpiTotalLbl.textContent = isContracts
        ? (isAr ? 'إجمالي العقود' : 'Total Contracts')
        : (isAr ? 'إجمالي عروض الأسعار' : 'Total Quotations');
    }
    const kpiTotalIcon = document.getElementById('kpi-icon-total');
    if (kpiTotalIcon) {
      kpiTotalIcon.className = isContracts ? 'fa-solid fa-file-contract' : 'fa-regular fa-file-lines';
    }

    const kpiMonthLbl = document.getElementById('kpi-lbl-month');
    if (kpiMonthLbl) {
      kpiMonthLbl.textContent = isContracts
        ? (isAr ? 'عقود هذا الشهر' : 'Contracts This Month')
        : (isAr ? 'عروض هذا الشهر' : 'This Month');
    }

    const kpiHighestLbl = document.getElementById('kpi-lbl-highest');
    if (kpiHighestLbl) {
      kpiHighestLbl.textContent = isContracts
        ? (isAr ? 'أعلى قيمة عقد' : 'Highest Value Contract')
        : (isAr ? 'أعلى قيمة لعرض' : 'Highest Value');
    }

    // Chart titles
    const chartBranchTitle = document.getElementById('chart-title-branch');
    if (chartBranchTitle) {
      chartBranchTitle.textContent = isContracts
        ? (isAr ? 'العقود حسب الفروع' : 'Contracts by Branch')
        : (isAr ? 'عروض الأسعار حسب الفروع' : 'Quotations by Branch');
    }

    const chartStatusTitle = document.getElementById('chart-title-status');
    if (chartStatusTitle) {
      chartStatusTitle.textContent = isContracts
        ? (isAr ? 'العقود حسب الحالة' : 'Contracts by Status')
        : (isAr ? 'عروض الأسعار حسب الحالة' : 'Quotations by Status');
    }

    const chartTypeTitle = document.getElementById('chart-title-type');
    if (chartTypeTitle) {
      chartTypeTitle.textContent = isContracts
        ? (isAr ? 'العقود حسب نوع العقد' : 'Contracts by Type')
        : (isAr ? 'عروض الأسعار حسب النوع' : 'Quotations by Type');
    }

    const chartMonthlyTitle = document.getElementById('chart-title-monthly');
    if (chartMonthlyTitle) {
      chartMonthlyTitle.textContent = isContracts
        ? (isAr ? 'مخطط اتجاه العقود الشهرية' : 'Monthly Contracts Trend')
        : (isAr ? 'مخطط اتجاه العروض الشهرية' : 'Monthly Quotations Trend');
    }

    const chartValTitle = document.getElementById('chart-title-value');
    if (chartValTitle) {
      chartValTitle.textContent = isContracts
        ? (isAr ? 'القيمة الإجمالية للعقود' : 'Contracts Value')
        : (isAr ? 'قيمة عروض الأسعار' : 'Quotation Value');
    }

    const valSummaryTitle = document.getElementById('val-summary-title');
    if (valSummaryTitle) {
      valSummaryTitle.textContent = isContracts
        ? (isAr ? 'إجمالي قيمة العقود' : 'Total Contracts Value')
        : (isAr ? 'إجمالي قيمة عروض الأسعار' : 'Total Quotation Value');
    }

    const topItemLabel = document.getElementById('top-item-label');
    if (topItemLabel) {
      topItemLabel.textContent = isContracts
        ? (isAr ? 'أعلى عقد قيمة' : 'Top Value Contract')
        : (isAr ? 'أعلى عرض قيمة' : 'Top Value Quotation');
    }

    // Table section
    const tableTitle = document.getElementById('dash-month-table-title');
    if (tableTitle) {
      tableTitle.textContent = isContracts
        ? (isAr ? 'أحدث العقود المسجلة' : 'Recent Contracts Registered')
        : (isAr ? 'عروض الأسعار المنشأة هذا الشهر' : 'Quotations Created This Month');
    }

    const tableSubtitle = document.getElementById('dash-month-table-subtitle');
    if (tableSubtitle) {
      tableSubtitle.textContent = isContracts
        ? (isAr ? 'قائمة بالعقود الهندسية المسجلة والموثقة في الأرشيف' : 'List of engineering contracts archived in the system')
        : (isAr ? 'قائمة بعروض الأسعار المؤرشفة رسمياً خلال الشهر الحالي' : 'List of quotations officially archived during current month');
    }

    const tableViewAll = document.getElementById('dash-month-table-view-all');
    if (tableViewAll) {
      tableViewAll.setAttribute('href', isContracts ? '#contracts' : '#quotations');
    }

    const colCode = document.getElementById('dash-col-code');
    if (colCode) {
      colCode.textContent = isContracts
        ? (isAr ? 'رقم العقد' : 'Contract No.')
        : (isAr ? 'رقم العرض' : 'Quotation No.');
    }

    const colType = document.getElementById('dash-col-type');
    if (colType) {
      colType.textContent = isContracts
        ? (isAr ? 'نوع العقد' : 'Contract Type')
        : (isAr ? 'نوع العرض' : 'Type');
    }

    const colDate = document.getElementById('dash-col-date');
    if (colDate) {
      colDate.textContent = isContracts
        ? (isAr ? 'تاريخ التوقيع' : 'Signing Date')
        : (isAr ? 'التاريخ' : 'Date');
    }
  },

  populateFilterDropdowns() {
    const isAr = getLang() === 'ar';
    const isContracts = this.currentMode === 'contracts';
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
      const allTypesLabel = isContracts
        ? (isAr ? 'جميع أنواع العقود' : 'All Contract Types')
        : t('filter_all_types');
      typeSelect.innerHTML = `<option value="all">${allTypesLabel}</option>` +
        types.map(tp => `<option value="${tp.id}">${isAr ? tp.nameAr : tp.nameEn}</option>`).join('');
      typeSelect.value = currentVal || 'all';
    }
  },

  /** Show/hide From–To date pickers and mark the date select visually */
  _toggleCustomDatePickers(show) {
    const fromWrap = document.getElementById('filter-from-wrap');
    const toWrap   = document.getElementById('filter-to-wrap');
    const dateSel  = document.getElementById('filter-date');
    if (fromWrap) fromWrap.style.display = show ? '' : 'none';
    if (toWrap)   toWrap.style.display   = show ? '' : 'none';
    if (dateSel)  dateSel.setAttribute('data-custom', show ? 'true' : 'false');
  },

  /** Count how many filters are non-default and update the badge + clear button */
  _updateActiveBadge() {
    const f = this.currentFilters;
    let count = 0;
    if (f.branch !== 'all') count++;
    if (f.status !== 'all') count++;
    if (f.type !== 'all')   count++;
    if (f.dateFilter !== 'all') count++;
    if (f.query && f.query.trim()) count++;

    const badge   = document.getElementById('filter-active-count');
    const clearBtn = document.getElementById('btn-reset-filters');

    if (badge) {
      badge.textContent = count;
      badge.style.display = count > 0 ? '' : 'none';
    }
    if (clearBtn) {
      clearBtn.style.display = count > 0 ? '' : 'none';
    }
  },

  bindFilterEvents() {
    this.populateFilterDropdowns();

    const branchSelect  = document.getElementById('filter-branch');
    const statusSelect  = document.getElementById('filter-status');
    const typeSelect    = document.getElementById('filter-type');
    const dateSelect    = document.getElementById('filter-date');
    const dateFromInput = document.getElementById('filter-date-from');
    const dateToInput   = document.getElementById('filter-date-to');
    const sortSelect    = document.getElementById('filter-sort');
    const searchInput   = document.getElementById('filter-search');
    const resetBtn      = document.getElementById('btn-reset-filters');

    if (branchSelect) {
      branchSelect.addEventListener('change', (e) => {
        this.currentFilters.branch = e.target.value;
        this._updateActiveBadge();
        this.renderAll();
      });
    }

    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        this.currentFilters.status = e.target.value;
        this._updateActiveBadge();
        this.renderAll();
      });
    }

    if (typeSelect) {
      typeSelect.addEventListener('change', (e) => {
        this.currentFilters.type = e.target.value;
        this._updateActiveBadge();
        this.renderAll();
      });
    }

    if (dateSelect) {
      dateSelect.addEventListener('change', (e) => {
        this.currentFilters.dateFilter = e.target.value;
        const isCustom = e.target.value === 'custom_range';
        this._toggleCustomDatePickers(isCustom);
        if (!isCustom) {
          this.currentFilters.dateFrom = '';
          this.currentFilters.dateTo   = '';
          if (dateFromInput) dateFromInput.value = '';
          if (dateToInput)   dateToInput.value   = '';
        }
        this._updateActiveBadge();
        this.renderAll();
      });
    }

    if (dateFromInput) {
      dateFromInput.addEventListener('change', (e) => {
        this.currentFilters.dateFrom = e.target.value;
        this.renderAll();
      });
    }

    if (dateToInput) {
      dateToInput.addEventListener('change', (e) => {
        this.currentFilters.dateTo = e.target.value;
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
          this._updateActiveBadge();
          this.renderAll();
        }, 200);
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.currentFilters = {
          branch: 'all', status: 'all', type: 'all',
          dateFilter: 'all', dateFrom: '', dateTo: '',
          sort: 'newest', query: ''
        };
        if (branchSelect)  branchSelect.value  = 'all';
        if (statusSelect)  statusSelect.value  = 'all';
        if (typeSelect)    typeSelect.value    = 'all';
        if (dateSelect)    dateSelect.value    = 'all';
        if (sortSelect)    sortSelect.value    = 'newest';
        if (searchInput)   searchInput.value   = '';
        if (dateFromInput) dateFromInput.value  = '';
        if (dateToInput)   dateToInput.value    = '';
        this._toggleCustomDatePickers(false);
        this._updateActiveBadge();
        this.renderAll();
      });
    }
  },

  /**
   * Main render method dynamically delegates to Quotations or Contracts mode
   */
  renderAll() {
    this.updateModeUI();

    if (this.currentMode === 'contracts') {
      const allContracts = DMCStore.getContracts ? DMCStore.getContracts() : [];
      const filtered = this.filterContracts(allContracts);
      this.renderContractsKPIs(filtered);
      this.renderContractsCharts(filtered);
      this.renderContractsTable(filtered);
    } else {
      const quotations = DMCStore.getQuotations(this.currentFilters);
      this.renderKPIs(quotations);
      this.renderCharts(quotations);
      this.renderMonthTable(quotations);
    }
  },

  // =========================================================================
  // CONTRACTS FILTERING & RENDERING
  // =========================================================================

  filterContracts(contracts) {
    const f = this.currentFilters;
    let items = Array.isArray(contracts) ? [...contracts] : [];

    if (f.branch && f.branch !== 'all') {
      items = items.filter(c => c.branchId === f.branch || c.branch_id === f.branch);
    }
    if (f.status && f.status !== 'all') {
      items = items.filter(c => c.status === f.status);
    }
    if (f.type && f.type !== 'all') {
      items = items.filter(c => (c.contractTypeId || c.contract_type_id) === f.type);
    }
    if (f.query && f.query.trim()) {
      const q = f.query.trim().toLowerCase();
      items = items.filter(item => (
        (item.contractNo && item.contractNo.toLowerCase().includes(q)) ||
        (item.contract_no && item.contract_no.toLowerCase().includes(q)) ||
        (item.titleAr && item.titleAr.toLowerCase().includes(q)) ||
        (item.title_ar && item.title_ar.toLowerCase().includes(q)) ||
        (item.titleEn && item.titleEn.toLowerCase().includes(q)) ||
        (item.clientNameAr && item.clientNameAr.toLowerCase().includes(q)) ||
        (item.client_name_ar && item.client_name_ar.toLowerCase().includes(q)) ||
        (item.clientNameEn && item.clientNameEn.toLowerCase().includes(q)) ||
        (item.projectNameAr && item.projectNameAr.toLowerCase().includes(q))
      ));
    }

    if (f.dateFilter && f.dateFilter !== 'all') {
      const now = new Date();
      items = items.filter(item => {
        const dateVal = item.signingDate || item.signing_date || item.createdAt || item.created_at;
        if (!dateVal) return false;
        const d = new Date(dateVal);
        if (isNaN(d.getTime())) return false;

        if (f.dateFilter === 'today') {
          return d.toDateString() === now.toDateString();
        } else if (f.dateFilter === 'this_week') {
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          return d >= startOfWeek;
        } else if (f.dateFilter === 'this_month') {
          return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
        } else if (f.dateFilter === 'this_year') {
          return d.getFullYear() === now.getFullYear();
        } else if (f.dateFilter === 'custom_range') {
          if (f.dateFrom && d < new Date(f.dateFrom + 'T00:00:00')) return false;
          if (f.dateTo && d > new Date(f.dateTo + 'T23:59:59')) return false;
          return true;
        }
        return true;
      });
    }

    // Sort
    if (f.sort === 'newest') {
      items.sort((a, b) => new Date(b.signingDate || b.signing_date || b.createdAt || 0) - new Date(a.signingDate || a.signing_date || a.createdAt || 0));
    } else if (f.sort === 'oldest') {
      items.sort((a, b) => new Date(a.signingDate || a.signing_date || a.createdAt || 0) - new Date(b.signingDate || b.signing_date || b.createdAt || 0));
    } else if (f.sort === 'highest') {
      items.sort((a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0));
    } else if (f.sort === 'lowest') {
      items.sort((a, b) => (Number(a.amount) || 0) - (Number(b.amount) || 0));
    }

    return items;
  },

  renderContractsKPIs(filteredContracts) {
    const today = new Date();
    const curYear = today.getFullYear();
    const curMonth = today.getMonth();

    // 1. Total
    this.setKpiText('kpi-val-total', filteredContracts.length);

    // Update sidebar badge
    const allTotal = DMCStore.getContracts ? DMCStore.getContracts().length : filteredContracts.length;
    const sidebarBadge = document.getElementById('sidebar-contracts-badge');
    if (sidebarBadge) sidebarBadge.textContent = allTotal;

    // 2. This Month
    const thisMonthCount = filteredContracts.filter(c => {
      const d = new Date(c.signingDate || c.signing_date || c.createdAt || c.created_at);
      return !isNaN(d.getTime()) && d.getFullYear() === curYear && d.getMonth() === curMonth;
    }).length;
    this.setKpiText('kpi-val-month', thisMonthCount);

    // Status counts
    const approvedCount = filteredContracts.filter(c => c.status === 'approved').length;
    this.setKpiText('kpi-val-approved', approvedCount);

    const closedCount = filteredContracts.filter(c => c.status === 'closed').length;
    this.setKpiText('kpi-val-closed', closedCount);

    const ongoingCount = filteredContracts.filter(c => c.status === 'ongoing').length;
    this.setKpiText('kpi-val-ongoing', ongoingCount);

    const notStartedCount = filteredContracts.filter(c => c.status === 'notstarted').length;
    this.setKpiText('kpi-val-notstarted', notStartedCount);

    const completedCount = filteredContracts.filter(c => c.status === 'completed').length;
    this.setKpiText('kpi-val-completed', completedCount);

    const newCount = filteredContracts.filter(c => c.status === 'new').length;
    this.setKpiText('kpi-val-new', newCount);

    const revisedCount = filteredContracts.filter(c => c.status === 'revised').length;
    this.setKpiText('kpi-val-revised', revisedCount);

    // 10. Highest Value Contract
    if (filteredContracts.length > 0) {
      const highest = [...filteredContracts].sort((a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0))[0];
      const curr = highest.currency || 'SAR';
      this.setKpiText('kpi-val-highest', `${curr} ${(Number(highest.amount) || 0).toLocaleString()}`);
    } else {
      this.setKpiText('kpi-val-highest', 'SAR 0');
    }
  },

  renderContractsCharts(contracts) {
    if (typeof Chart === 'undefined') return;

    const isAr = getLang() === 'ar';
    const isDark = DMCStore.getTheme() === 'dark';
    const textColor = isDark ? '#94A3B8' : '#64748B';
    const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

    // 1. Contracts by Branch
    const branches = DMCStore.getBranches();
    const branchLabels = branches.map(b => isAr ? b.nameAr.replace('فرع ', '') : b.nameEn.replace(' Branch', ''));
    const branchData = branches.map(b => contracts.filter(c => (c.branchId || c.branch_id) === b.id).length);

    this.renderOrUpdateChart('chart-branch', {
      type: 'bar',
      data: {
        labels: branchLabels,
        datasets: [{
          label: isAr ? 'عدد العقود' : 'Contracts Count',
          data: branchData,
          backgroundColor: '#10B981',
          hoverBackgroundColor: '#D4AF37',
          borderRadius: 6,
          barThickness: 24
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: textColor, font: { family: 'Tajawal', size: 11, weight: 'bold' } }
          },
          y: {
            grid: { color: gridColor },
            ticks: { color: textColor, stepSize: 5 }
          }
        }
      }
    });

    // 2. Contracts by Status (Doughnut)
    const statuses = DMCStore.getStatuses();
    const statusLabels = statuses.map(s => isAr ? s.nameAr : s.nameEn);
    const statusColors = ['#10B981', '#EF4444', '#3B82F6', '#64748B', '#059669', '#8B5CF6', '#F59E0B'];
    const statusData = statuses.map(s => contracts.filter(c => c.status === s.id).length);

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
            position: 'right',
            labels: { color: textColor, font: { family: 'Tajawal', size: 11 }, boxWidth: 10, padding: 8 }
          }
        }
      }
    });
    const statusTotalEl = document.getElementById('chart-status-total');
    if (statusTotalEl) statusTotalEl.textContent = contracts.length;

    // 3. Contracts by Type
    const types = DMCStore.getQuotationTypes();
    const typeLabels = types.map(t => isAr ? t.nameAr.replace('عروض ', 'عقود ') : t.nameEn.replace(' Quotations', ' Contracts'));
    const typeColors = ['#10B981', '#D4AF37', '#0284C7', '#0B3D62', '#F59E0B', '#8B5CF6', '#64748B'];
    const typeData = types.map(tp => contracts.filter(c => (c.contractTypeId || c.contract_type_id) === tp.id).length);

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
            position: 'right',
            labels: { color: textColor, font: { family: 'Tajawal', size: 11 }, boxWidth: 10, padding: 8 }
          }
        }
      }
    });

    // 4. Monthly Contracts Trend (Line Chart)
    const monthNamesAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthLabels = isAr ? monthNamesAr : monthNamesEn;

    const curYear = new Date().getFullYear();
    const monthlyCounts = Array(12).fill(0);

    contracts.forEach(c => {
      const d = new Date(c.signingDate || c.signing_date || c.createdAt || c.created_at);
      if (!isNaN(d.getTime()) && d.getFullYear() === curYear) {
        monthlyCounts[d.getMonth()]++;
      }
    });

    this.renderOrUpdateChart('chart-monthly', {
      type: 'line',
      data: {
        labels: monthLabels,
        datasets: [{
          label: isAr ? 'العقود الموقعة' : 'Signed Contracts',
          data: monthlyCounts,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.12)',
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
        plugins: { legend: { display: false } },
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

    // 5. Contracts Financial Value Card & Top Contract
    const totalFinancialVal = contracts.reduce((acc, c) => acc + (Number(c.amount) || 0), 0);
    const totalValEl = document.getElementById('val-summary-amount');
    if (totalValEl) {
      totalValEl.textContent = `SAR ${totalFinancialVal.toLocaleString()}`;
    }

    if (contracts.length > 0) {
      const topC = [...contracts].sort((a, b) => (Number(b.amount) || 0) - (Number(a.amount) || 0))[0];
      const topNoEl = document.getElementById('top-q-no');
      const topTitleEl = document.getElementById('top-q-title');
      const topValEl = document.getElementById('top-q-val');

      if (topNoEl) topNoEl.textContent = topC.contractNo || topC.contract_no;
      if (topTitleEl) topTitleEl.textContent = isAr ? (topC.titleAr || topC.title_ar) : (topC.titleEn || topC.title_en || topC.titleAr);
      if (topValEl) topValEl.textContent = `${topC.currency || 'SAR'} ${(Number(topC.amount) || 0).toLocaleString()}`;
    }

    // Mini bar chart inside Value Card
    const branchValues = branches.map(b => {
      return contracts.filter(c => (c.branchId || c.branch_id) === b.id).reduce((sum, c) => sum + (Number(c.amount) || 0), 0);
    });

    this.renderOrUpdateChart('chart-value-mini', {
      type: 'bar',
      data: {
        labels: branchLabels,
        datasets: [{
          data: branchValues,
          backgroundColor: '#10B981',
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

  renderContractsTable(contracts) {
    const tbody = document.getElementById('month-table-body');
    if (!tbody) return;

    const isAr = getLang() === 'ar';
    const branches = DMCStore.getBranches();
    const quotationTypes = DMCStore.getQuotationTypes();
    const projectTypes = DMCStore.getProjectTypes();

    const recentContracts = contracts.slice(0, 7);

    if (recentContracts.length === 0) {
      tbody.innerHTML = `<tr><td colspan="12" class="text-center" style="padding: 2.5rem; color: var(--text-muted);">${t('no_records')}</td></tr>`;
      return;
    }

    tbody.innerHTML = recentContracts.map((item, idx) => {
      const bId = item.branchId || item.branch_id;
      const cTypeId = item.contractTypeId || item.contract_type_id;
      const pTypeId = item.projectTypeId || item.project_type_id;

      const branch = branches.find(b => b.id === bId);
      const cType = quotationTypes.find(t => t.id === cTypeId);
      const pType = projectTypes.find(p => p.id === pTypeId);

      const branchName = branch ? (isAr ? branch.nameAr : branch.nameEn) : '-';
      const cTypeName = cType ? (isAr ? cType.nameAr : cType.nameEn) : '-';
      const pTypeName = pType ? (isAr ? pType.nameAr : pType.nameEn) : '-';
      const statusLabel = t(`status_${item.status}`);
      const cNo = item.contractNo || item.contract_no;
      const title = isAr ? (item.titleAr || item.title_ar) : (item.titleEn || item.title_en || item.titleAr);
      const client = isAr ? (item.clientNameAr || item.client_name_ar) : (item.clientNameEn || item.client_name_en || item.clientNameAr);
      const sDate = item.signingDate || item.signing_date || (item.createdAt ? item.createdAt.slice(0, 10) : '-');
      const amt = (Number(item.amount) || 0).toLocaleString();

      return `
        <tr>
          <td><strong>${idx + 1}</strong></td>
          <td><span style="font-weight: 800; color: #10B981;">${cNo}</span></td>
          <td>${title}</td>
          <td>${branchName}</td>
          <td>${client}</td>
          <td>${pTypeName}</td>
          <td>${cTypeName}</td>
          <td><strong>${amt}</strong></td>
          <td><span class="badge" style="background: rgba(16,185,129,0.08); color: #10B981;">${item.currency || 'SAR'}</span></td>
          <td><span class="badge badge-${item.status}"><span class="badge-dot"></span>${statusLabel}</span></td>
          <td>${sDate}</td>
          <td>
            <div class="d-flex align-center gap-1">
              <button class="btn btn-outline btn-icon" title="${t('action_view')}" onclick="DMCContracts.openEdit('${item.id}')">
                <i class="fa-regular fa-eye"></i>
              </button>
              <button class="btn btn-outline btn-icon" title="${t('action_edit')}" onclick="DMCContracts.openEdit('${item.id}')" style="color: var(--brand-gold);">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn btn-outline btn-icon" title="${t('action_open_file')}" onclick="DMCContracts.openFile('${item.id}')" style="color: #EF4444;">
                <i class="fa-regular fa-file-pdf"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  // =========================================================================
  // QUOTATIONS RENDERING
  // =========================================================================

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
            position: 'right',
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
            position: 'right',
            labels: { color: textColor, font: { family: 'Tajawal', size: 11 }, boxWidth: 10, padding: 8 }
          }
        }
      }
    });

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
              <button class="btn btn-outline btn-icon" title="${item.status === 'closed' ? t('workflow_closed_msg') : t('tab_workflow')}" onclick="DMCDetails.open('${item.id}', 'workflow')" style="color: ${item.status === 'closed' ? 'var(--text-muted)' : 'var(--brand-gold)'};">
                <i class="fa-solid fa-route"></i>
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
