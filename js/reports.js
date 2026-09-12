/**
 * DMC Dar Makkah Engineering Consultancy
 * Reports & Analytics Module
 * Redesigned dashboard: KPI cards + Bar chart (value by branch) +
 * Donut chart (by type) + Full-width area line chart (monthly value)
 */

const DMCReports = {
  charts: {},
  filters: {
    branch: 'all',
    date: 'all'
  },

  init() {
    this.populateFilterDropdowns();
    this.bindFilterEvents();

    // Re-render when data or language changes
    window.addEventListener('dmc-data-changed', () => this.renderAll());
    window.addEventListener('dmc-language-changed', () => {
      this.populateFilterDropdowns();
      this.renderAll();
    });

    // Resize handler
    window.addEventListener('resize', () => {
      if (this._resizeTimeout) clearTimeout(this._resizeTimeout);
      this._resizeTimeout = setTimeout(() => {
        Object.values(this.charts).forEach(chart => {
          if (chart && typeof chart.resize === 'function') {
            try { chart.resize(); } catch (e) {}
          }
        });
      }, 120);
    });

    // Render when reports view becomes visible (hash change)
    window.addEventListener('hashchange', () => {
      if (window.location.hash === '#reports') {
        // Small delay to ensure the view is visible/sized before rendering
        setTimeout(() => this.renderAll(), 80);
      }
    });
  },

  populateFilterDropdowns() {
    const isAr = getLang() === 'ar';
    const branches = DMCStore.getBranches();

    const branchSel = document.getElementById('rpt-filter-branch');
    if (branchSel) {
      const cur = branchSel.value;
      branchSel.innerHTML =
        `<option value="all">${t('filter_all_branches')}</option>` +
        branches.map(b => `<option value="${b.id}">${isAr ? b.nameAr : b.nameEn}</option>`).join('');
      branchSel.value = cur || 'all';
    }
  },

  bindFilterEvents() {
    const branchSel = document.getElementById('rpt-filter-branch');
    const dateSel   = document.getElementById('rpt-filter-date');

    if (branchSel) {
      branchSel.addEventListener('change', e => {
        this.filters.branch = e.target.value;
        this.renderAll();
      });
    }

    if (dateSel) {
      dateSel.addEventListener('change', e => {
        this.filters.date = e.target.value;
        this.renderAll();
      });
    }
  },

  /** Apply branch + date filters to all quotations */
  getFilteredQuotations() {
    const all = DMCStore.getQuotations();
    const today = new Date();
    const curYear  = today.getFullYear();
    const curMonth = today.getMonth();

    return all.filter(q => {
      // Branch filter
      if (this.filters.branch !== 'all' && q.branchId !== this.filters.branch) return false;

      // Date filter
      if (this.filters.date !== 'all') {
        const d = new Date(q.creationDate);
        if (this.filters.date === 'this_year' && d.getFullYear() !== curYear) return false;
        if (this.filters.date === 'this_month' &&
            (d.getFullYear() !== curYear || d.getMonth() !== curMonth)) return false;
      }

      return true;
    });
  },

  renderAll() {
    const quotations = this.getFilteredQuotations();
    this.renderKPIs(quotations);
    this.renderBranchValueChart(quotations);
    this.renderTypeDonutChart(quotations);
    this.renderMonthlyValueChart(quotations);
  },

  /* -----------------------------------------------------------------------
     KPI STAT CARDS
  ----------------------------------------------------------------------- */
  renderKPIs(quotations) {
    const total = quotations.length;
    const totalVal = quotations.reduce((s, q) => s + (Number(q.amount) || 0), 0);
    const avgVal   = total > 0 ? totalVal / total : 0;
    const highestQ = total > 0 ? [...quotations].sort((a, b) => b.amount - a.amount)[0] : null;
    const highestVal = highestQ ? highestQ.amount : 0;

    this._setText('rpt-kpi-total',         total.toLocaleString());
    this._setText('rpt-kpi-total-value',   this._formatSAR(totalVal));
    this._setText('rpt-kpi-avg-value',     this._formatSAR(avgVal));
    this._setText('rpt-kpi-highest-value', this._formatSAR(highestVal));
  },

  _formatSAR(value) {
    if (value >= 1_000_000) {
      return (value / 1_000_000).toFixed(3).replace(/\.?0+$/, '') + 'M SAR';
    }
    return value.toLocaleString('en-US', { maximumFractionDigits: 3 }) + ' SAR';
  },

  _setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  },

  /* -----------------------------------------------------------------------
     BAR CHART — Quotation Value Distribution by Branch
  ----------------------------------------------------------------------- */
  renderBranchValueChart(quotations) {
    if (typeof Chart === 'undefined') return;

    const isAr  = getLang() === 'ar';
    const isDark = DMCStore.getTheme() === 'dark';
    const textColor = isDark ? '#94A3B8' : '#64748B';
    const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';

    const branches = DMCStore.getBranches();
    const labels = branches.map(b => isAr
      ? b.nameAr.replace('فرع ', '')
      : b.nameEn.replace(' Branch', '') + ' Branch');
    const data = branches.map(b =>
      quotations.filter(q => q.branchId === b.id)
                .reduce((s, q) => s + (Number(q.amount) || 0), 0)
    );

    // Multi-colour bars matching the mockup palette
    const barColors = ['#0B3D62', '#D4AF37', '#0891B2', '#B45309', '#EF4444', '#059669', '#7C3AED'];

    this._renderChart('rpt-chart-branch-value', {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Total Value',
          data,
          backgroundColor: barColors,
          hoverBackgroundColor: barColors.map(() => '#D4AF37'),
          borderRadius: 5,
          barThickness: 32
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: true, position: 'top',
            labels: { color: textColor, font: { family: 'Tajawal', size: 11 },
                      boxWidth: 12, padding: 10 } },
          tooltip: {
            callbacks: {
              label: ctx => ' ' + ctx.parsed.y.toLocaleString() + ' SAR'
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: textColor, font: { family: 'Tajawal', size: 11, weight: '700' } }
          },
          y: {
            grid: { color: gridColor },
            ticks: {
              color: textColor,
              callback: v => {
                if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M';
                if (v >= 1_000) return (v / 1_000).toFixed(0) + 'K';
                return v;
              }
            }
          }
        }
      }
    });
  },

  /* -----------------------------------------------------------------------
     DONUT CHART — Quotations by Type
  ----------------------------------------------------------------------- */
  renderTypeDonutChart(quotations) {
    if (typeof Chart === 'undefined') return;

    const isAr  = getLang() === 'ar';
    const isDark = DMCStore.getTheme() === 'dark';
    const textColor  = isDark ? '#94A3B8' : '#64748B';
    const borderClr  = isDark ? '#0E2236' : '#FFFFFF';

    const types = DMCStore.getQuotationTypes();
    const typeColors = ['#0B3D62', '#8B5CF6', '#0891B2', '#D4AF37', '#EF4444', '#059669', '#64748B'];

    const labels = types.map(tp =>
      isAr ? tp.nameAr.replace('عروض ', '') : tp.nameEn.replace(' Quotations', ''));
    const data = types.map(tp => quotations.filter(q => q.quotationTypeId === tp.id).length);

    this._renderChart('rpt-chart-type-donut', {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: typeColors,
          borderWidth: 2,
          borderColor: borderClr,
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '62%',
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: textColor,
              font: { family: 'Tajawal', size: 11 },
              boxWidth: 12,
              padding: 10
            }
          },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.label}: ${ctx.parsed}`
            }
          }
        }
      }
    });
  },

  /* -----------------------------------------------------------------------
     AREA LINE CHART — Monthly Quotations (Total Value) — last 12 months
  ----------------------------------------------------------------------- */
  renderMonthlyValueChart(quotations) {
    if (typeof Chart === 'undefined') return;

    const isAr  = getLang() === 'ar';
    const isDark = DMCStore.getTheme() === 'dark';
    const textColor = isDark ? '#94A3B8' : '#64748B';
    const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';

    // Build last-12-months window
    const now  = new Date();
    const labels = [];
    const monthlyValues = [];

    const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthNamesAr = ['يناير','فبراير','مارس','أبريل','مايو','يونيو',
                          'يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    const monthNames = isAr ? monthNamesAr : monthNamesEn;

    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      labels.push(`${monthNames[d.getMonth()]} ${d.getFullYear()}`);

      const val = quotations
        .filter(q => {
          const qd = new Date(q.creationDate);
          return qd.getFullYear() === d.getFullYear() && qd.getMonth() === d.getMonth();
        })
        .reduce((s, q) => s + (Number(q.amount) || 0), 0);

      monthlyValues.push(val);
    }

    this._renderChart('rpt-chart-monthly-value', {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Total Value',
          data: monthlyValues,
          borderColor: '#A78BFA',          // soft purple matching mockup
          backgroundColor: 'rgba(167,139,250,0.15)',
          fill: true,
          tension: 0.45,
          pointBackgroundColor: '#8B5CF6',
          pointBorderColor: '#FFFFFF',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            align: 'end',
            labels: {
              color: textColor,
              font: { family: 'Tajawal', size: 11 },
              boxWidth: 20,
              padding: 12
            }
          },
          tooltip: {
            callbacks: {
              label: ctx => ' ' + ctx.parsed.y.toLocaleString() + ' SAR'
            }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: textColor, font: { family: 'Tajawal', size: 10 } }
          },
          y: {
            grid: { color: gridColor },
            beginAtZero: true,
            ticks: {
              color: textColor,
              callback: v => {
                if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M';
                if (v >= 1_000) return (v / 1_000).toFixed(0) + 'K';
                return v;
              }
            }
          }
        }
      }
    });
  },

  /* -----------------------------------------------------------------------
     HELPER — create or replace a Chart.js instance
  ----------------------------------------------------------------------- */
  _renderChart(canvasId, config) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (this.charts[canvasId]) {
      try { this.charts[canvasId].destroy(); } catch (e) {}
    }
    this.charts[canvasId] = new Chart(canvas, config);
  }
};

window.DMCReports = DMCReports;
