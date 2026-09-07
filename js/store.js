/**
 * DMC Dar Makkah Engineering Consultancy
 * Storage Layer & Data Engine (localStorage)
 * Pre-seeded with 248 realistic quotations matching the Visual Identity Mockup
 */

const STORAGE_KEYS = {
  USERS: 'dmc_users',
  BRANCHES: 'dmc_branches',
  QUOTATION_TYPES: 'dmc_quotation_types',
  PROJECT_TYPES: 'dmc_project_types',
  STATUSES: 'dmc_statuses',
  CURRENCIES: 'dmc_currencies',
  QUOTATIONS: 'dmc_quotations',
  AUDIT_LOGS: 'dmc_audit_logs',
  SESSION: 'dmc_session',
  THEME: 'dmc_theme',
  SEEDED: 'dmc_data_v2'
};

const DMCStore = {
  // Initialize and seed database if empty or unseeded
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.SEEDED)) {
      this.seedDatabase();
    }
  },

  seedDatabase() {
    // 1. Users (Admin + Standard User)
    const users = [
      {
        id: 'u_1',
        nationalId: '1234567890',
        password: 'admin123',
        nameAr: 'أحمد محمد الزهراني',
        nameEn: 'Ahmed Mohammed Al-Zahrani',
        role: 'admin',
        titleAr: 'مدير عام النظام والتوثيق',
        titleEn: 'System Administrator',
        email: 'ahmed.m@dmc-consulting.sa',
        active: true
      },
      {
        id: 'u_2',
        nationalId: '0987654321',
        password: 'user123',
        nameAr: 'م. خالد سعيد العتيبي',
        nameEn: 'Eng. Khalid Al-Otaibi',
        role: 'user',
        titleAr: 'مهندس استشاري أول',
        titleEn: 'Senior Consultant Engineer',
        email: 'khalid.o@dmc-consulting.sa',
        active: true
      }
    ];

    // 2. 7 Fixed Branches
    const branches = [
      { id: 'b_1', code: 'MKK', nameAr: 'فرع مكة المكرمة', nameEn: 'Makkah Branch', active: true },
      { id: 'b_2', code: 'MDN', nameAr: 'فرع المدينة المنورة', nameEn: 'Madinah Branch', active: true },
      { id: 'b_3', code: 'JED', nameAr: 'فرع جدة', nameEn: 'Jeddah Branch', active: true },
      { id: 'b_4', code: 'MKH', nameAr: 'فرع المخواة', nameEn: 'Al-Makhwah Branch', active: true },
      { id: 'b_5', code: 'NMR', nameAr: 'فرع نمرة', nameEn: 'Nimrah Branch', active: true },
      { id: 'b_6', code: 'BAH', nameAr: 'فرع الباحة', nameEn: 'Al-Baha Branch', active: true },
      { id: 'b_7', code: 'BLJ', nameAr: 'فرع بلجرشي', nameEn: 'Baljurashi Branch', active: true }
    ];

    // 3. Quotation Categories / Types
    const quotationTypes = [
      { id: 'qt_supervision', key: 'type_supervision', nameAr: 'عروض الإشراف الهندسي', nameEn: 'Supervision Quotations', active: true },
      { id: 'qt_design', key: 'type_design', nameAr: 'عروض التصميم الهندسي', nameEn: 'Design Quotations', active: true },
      { id: 'qt_hydraulic', key: 'type_hydraulic', nameAr: 'عروض الدراسات الهيدرولوجية', nameEn: 'Hydraulic Study Quotations', active: true },
      { id: 'qt_surveying', key: 'type_surveying', nameAr: 'عروض الرفع المساحي', nameEn: 'Surveying Quotations', active: true },
      { id: 'qt_structural', key: 'type_structural', nameAr: 'عروض الدراسات الإنشائية', nameEn: 'Structural Study Quotations', active: true },
      { id: 'qt_building_permit', key: 'type_building_permit', nameAr: 'عروض استخراج تراخيص البناء', nameEn: 'Building Permit Quotations', active: true },
      { id: 'qt_other', key: 'type_other', nameAr: 'خدمات هندسية أخرى', nameEn: 'Other Engineering Services', active: true }
    ];

    // 4. Project Types
    const projectTypes = [
      { id: 'pt_res_bld', key: 'proj_residential_building', nameAr: 'مبنى سكني', nameEn: 'Residential Building' },
      { id: 'pt_com_bld', key: 'proj_commercial_building', nameAr: 'مبنى تجاري', nameEn: 'Commercial Building' },
      { id: 'pt_res_com', key: 'proj_res_comm_building', nameAr: 'مبنى سكني تجاري', nameEn: 'Residential & Commercial Building' },
      { id: 'pt_villa', key: 'proj_villa', nameAr: 'فيلا سكنية', nameEn: 'Villa' },
      { id: 'pt_factory', key: 'proj_factory', nameAr: 'مصنع / مستودع', nameEn: 'Factory / Warehouse' },
      { id: 'pt_school', key: 'proj_school', nameAr: 'مبنى تعليمي / مدرسة', nameEn: 'School / Educational' },
      { id: 'pt_mosque', key: 'proj_mosque', nameAr: 'جامع / مسجد', nameEn: 'Mosque' },
      { id: 'pt_gas_station', key: 'proj_gas_station', nameAr: 'محطة وقود وخدمات', nameEn: 'Gas Station & Services' },
      { id: 'pt_office_bld', key: 'proj_office_building', nameAr: 'مبنى شركات / مكاتب', nameEn: 'Company / Office Building' },
      { id: 'pt_infrastructure', key: 'proj_infrastructure', nameAr: 'مشروع بنية تحتية', nameEn: 'Infrastructure Project' },
      { id: 'pt_other', key: 'proj_other', nameAr: 'أخرى', nameEn: 'Other' }
    ];

    // 5. Quotation Statuses
    const statuses = [
      { id: 'approved', key: 'status_approved', nameAr: 'معتمدة', nameEn: 'Approved', color: '#10B981' },
      { id: 'closed', key: 'status_closed', nameAr: 'مغلقة', nameEn: 'Closed', color: '#EF4444' },
      { id: 'ongoing', key: 'status_ongoing', nameAr: 'جارية', nameEn: 'Ongoing', color: '#3B82F6' },
      { id: 'notstarted', key: 'status_notstarted', nameAr: 'لم تبدأ', nameEn: 'Not Started', color: '#64748B' },
      { id: 'completed', key: 'status_completed', nameAr: 'منتهية', nameEn: 'Completed', color: '#059669' },
      { id: 'new', key: 'status_new', nameAr: 'جديدة', nameEn: 'New', color: '#8B5CF6' },
      { id: 'revised', key: 'status_revised', nameAr: 'متغيرة', nameEn: 'Revised', color: '#F59E0B' }
    ];

    // 6. Currencies
    const currencies = [
      { code: 'SAR', nameAr: 'ريال سعودي', nameEn: 'Saudi Riyal', symbol: 'ر.س', default: true },
      { code: 'USD', nameAr: 'دولار أمريكي', nameEn: 'US Dollar', symbol: '$', default: false },
      { code: 'EUR', nameAr: 'يورو', nameEn: 'Euro', symbol: '€', default: false },
      { code: 'AED', nameAr: 'درهم إماراتي', nameEn: 'UAE Dirham', symbol: 'د.إ', default: false }
    ];

    // Save configurations
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(branches));
    localStorage.setItem(STORAGE_KEYS.QUOTATION_TYPES, JSON.stringify(quotationTypes));
    localStorage.setItem(STORAGE_KEYS.PROJECT_TYPES, JSON.stringify(projectTypes));
    localStorage.setItem(STORAGE_KEYS.STATUSES, JSON.stringify(statuses));
    localStorage.setItem(STORAGE_KEYS.CURRENCIES, JSON.stringify(currencies));

    // 7. Seed 248 Realistic Quotations Matching Mockup Distribution Exactly:
    // Approved: 52, Closed: 48, Ongoing: 62, Not Started: 32, Completed: 28, New: 16, Revised: 10
    // Total = 248!
    // Current Month = 36 quotations
    // Highest Value = SAR 5,200,000 (Hospital Project - Supervision, Q-2025-045)
    const quotations = this.generateSeedQuotations(branches, quotationTypes, projectTypes);
    localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(quotations));

    // 8. Seed Sample Audit Logs
    const auditLogs = [
      {
        id: 'log_1',
        action: 'System Seeded',
        userName: 'Ahmed Mohammed Al-Zahrani',
        date: new Date().toISOString(),
        details: 'Initial 248 quotation records and 7 branches archived successfully.',
        quotationNo: 'SYSTEM'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(auditLogs));

    localStorage.setItem(STORAGE_KEYS.SEEDED, 'true');
  },

  // Generates precisely 248 realistic quotations to match the mockup statistics
  generateSeedQuotations(branches, quotationTypes, projectTypes) {
    const clients = [
      { ar: 'مستشفى الرحمة الدولي', en: 'Al-Rahma Hospital' },
      { ar: 'شركة النور القابضة', en: 'Al-Noor Co.' },
      { ar: 'شركة تطوير المدينة', en: 'Al-Madinah Development' },
      { ar: 'بلدية محافظة المخواة', en: 'Al-Makhwah Municipality' },
      { ar: 'إدارة تعليم منطقة الباحة', en: 'Al-Baha Education' },
      { ar: 'مجموعة بن لادن السعودية', en: 'Saudi Binladin Group' },
      { ar: 'شركة جبل عمر للتطوير', en: 'Jabal Omar Development Co.' },
      { ar: 'أمانة العاصمة المقدسة', en: 'Holy Makkah Municipality' },
      { ar: 'شركة البحر الأحمر للتطوير', en: 'Red Sea Global' },
      { ar: 'صندوق الاستثمارات العامة', en: 'Public Investment Fund' },
      { ar: 'شركة روشن العقارية', en: 'Roshn Real Estate' },
      { ar: 'جامعة أم القرى', en: 'Umm Al-Qura University' },
      { ar: 'الهيئة الملكية لمدينة مكة', en: 'Royal Commission for Makkah' },
      { ar: 'شركة مكة للإنشاء والتعمير', en: 'Makkah Construction Co.' },
      { ar: 'مستشفى الملك فهد', en: 'King Fahad Hospital' }
    ];

    const targetCounts = {
      approved: 52,
      closed: 48,
      ongoing: 62,
      notstarted: 32,
      completed: 28,
      new: 16,
      revised: 10
    };

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-11

    const list = [];
    let quotationIndex = 1;

    // Helper for dummy PDF content
    const sampleDummyPdf = 'data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsOfCjIgMCBvYmoKPDwvTGVuZ3RoIDY4L0ZpbHRlci9GbGF0ZURlY29kZT4+c3RyZWFtCnicS8xNVcjPU9Aw1jU0UDAzNLAwUjA0NzBRsDAwMTBS0LUwMjDUA3J1TYHcmpoA7+AHzwo8L0VuZHN0cmVhbQplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2UvTWVkaWFCb3hbMCAwIDU5NSA4NDJdL1Jlc291cmNlczw8L1Byb2NTZXRbL1BERl0+Pj4+CmVuZG9iagoxIDAgb2JqCjw8L1R5cGUvQ2F0YWxvZy9QYWdlcyAyIDAgUj4+CmVuZG9iago0IDAgb2JqCjw8L1Byb2R1Y2VyKP7/AEQAQQBSACAATQBBAEsASwBBAEggQ09OU1VMVElORyk+PgplbmRvYmoKeHJlZgowIDUKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMTg0IDAwMDAwIG4gCjAwMDAwMDAwMTUgMDAwMDAgbiAKMDAwMDAwMDEzMSAwMDAwMCBuIAowMDAwMDAwMjIwIDAwMDAwIG4gCnRyYWlsZXIKPDwvU2l6ZSA1L1Jvb3QgMSAwIFIvSW5mbyA0IDAgUj4+CnN0YXJ0eHJlZgoyODgKJSVFT0YK';

    // Ensure our Top Value Quotation is item #1 (SAR 5,200,000, Hospital Project - Supervision)
    const topQuotation = {
      id: 'q_top_hospital',
      quotationNo: 'Q-2025-045',
      titleAr: 'مشروع المستشفى التخصصي - إشراف هندسي متكامل',
      titleEn: 'Hospital Project - Engineering Supervision',
      branchId: 'b_1', // Makkah
      clientNameAr: 'مستشفى الرحمة الدولي',
      clientNameEn: 'Al-Rahma Hospital',
      projectNameAr: 'برج المستشفى التخصصي الجديد',
      projectNameEn: 'New Specialized Hospital Tower',
      projectTypeId: 'pt_office_bld',
      quotationTypeId: 'qt_supervision',
      amount: 5200000,
      vatRate: 0.15,
      vatAmount: 780000,
      totalAmount: 5980000,
      currency: 'SAR',
      status: 'approved',
      creationDate: new Date(currentYear, currentMonth, 12).toISOString().slice(0, 10),
      validUntil: new Date(currentYear, currentMonth + 3, 12).toISOString().slice(0, 10),
      file: {
        name: 'DMC_Quotation_Q-2025-045_Hospital_Supervision.pdf',
        size: '1.8 MB',
        type: 'application/pdf',
        uploadDate: new Date(currentYear, currentMonth, 12).toISOString(),
        uploadedBy: 'Ahmed Mohammed Al-Zahrani',
        dataUrl: sampleDummyPdf
      },
      revisions: [],
      notes: 'عقد إشراف رئيسي معتمد لكامل مرحلة التنفيذ الإنشائي والمعماري.'
    };
    list.push(topQuotation);
    targetCounts.approved--; // account for this top quotation

    // Create remaining 247 items distributed across statuses, branches, types
    let currentMonthCounter = 1; // 1 already created (topQuotation)

    Object.entries(targetCounts).forEach(([statusKey, count]) => {
      for (let i = 0; i < count; i++) {
        quotationIndex++;
        const branch = branches[(quotationIndex) % branches.length];
        const qType = quotationTypes[(quotationIndex + 2) % quotationTypes.length];
        const pType = projectTypes[(quotationIndex + 1) % projectTypes.length];
        const client = clients[(quotationIndex * 3) % clients.length];

        // Should this quotation belong to current month? (We need 36 in current month total)
        const isCurrentMonth = currentMonthCounter < 36;
        let dateObj;
        if (isCurrentMonth) {
          const day = Math.min(28, (quotationIndex % 25) + 1);
          dateObj = new Date(currentYear, currentMonth, day);
          currentMonthCounter++;
        } else {
          // Spread across previous months of the year
          const monthOffset = (quotationIndex % 11) + 1;
          const pastMonth = (currentMonth - monthOffset + 12) % 12;
          const year = pastMonth > currentMonth ? currentYear - 1 : currentYear;
          const day = (quotationIndex % 27) + 1;
          dateObj = new Date(year, pastMonth, day);
        }

        const dateStr = dateObj.toISOString().slice(0, 10);
        const validUntilObj = new Date(dateObj.getTime() + 90 * 24 * 3600 * 1000);
        const validUntilStr = validUntilObj.toISOString().slice(0, 10);

        // Price varying realistically between 25,000 SAR and 2,500,000 SAR
        const rawAmount = Math.round((25000 + ((quotationIndex * 3791) % 2400000)) / 1000) * 1000;
        const vat = Math.round(rawAmount * 0.15);

        const padNum = String(quotationIndex).padStart(4, '0');
        const qNo = `Q-${currentYear}-${padNum}`;

        const isRevised = statusKey === 'revised';
        const revisions = isRevised ? [
          {
            revisionNo: 1,
            date: dateStr,
            uploadedBy: 'Eng. Khalid Al-Otaibi',
            notes: 'تحديث الأسعار وجداول الكميات بناءً على طلب المالك',
            fileName: `${qNo}_Rev1.pdf`,
            dataUrl: sampleDummyPdf
          }
        ] : [];

        list.push({
          id: `q_${quotationIndex}`,
          quotationNo: qNo,
          titleAr: `${qType.nameAr} - ${pType.nameAr}`,
          titleEn: `${qType.nameEn} - ${pType.nameEn}`,
          branchId: branch.id,
          clientNameAr: client.ar,
          clientNameEn: client.en,
          projectNameAr: `مشروع ${pType.nameAr} - ${client.ar}`,
          projectNameEn: `${pType.nameEn} Project - ${client.en}`,
          projectTypeId: pType.id,
          quotationTypeId: qType.id,
          amount: rawAmount,
          vatRate: 0.15,
          vatAmount: vat,
          totalAmount: rawAmount + vat,
          currency: 'SAR',
          status: statusKey,
          creationDate: dateStr,
          validUntil: validUntilStr,
          file: {
            name: `DMC_${qNo}.pdf`,
            size: `${(0.4 + (quotationIndex % 15) * 0.1).toFixed(1)} MB`,
            type: 'application/pdf',
            uploadDate: dateObj.toISOString(),
            uploadedBy: quotationIndex % 2 === 0 ? 'Ahmed Mohammed Al-Zahrani' : 'Eng. Khalid Al-Otaibi',
            dataUrl: sampleDummyPdf
          },
          revisions: revisions,
          notes: 'عرض سعر محفوظ في الأرشيف المركزي لمكتب دار مكة للاستشارات الهندسية.'
        });
      }
    });

    return list;
  },

  // CRUD Operations on Quotations
  getQuotations(filterOptions = {}) {
    let items = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUOTATIONS) || '[]');

    // 1. Branch filter
    if (filterOptions.branch && filterOptions.branch !== 'all') {
      items = items.filter(q => q.branchId === filterOptions.branch);
    }

    // 2. Status filter
    if (filterOptions.status && filterOptions.status !== 'all') {
      items = items.filter(q => q.status === filterOptions.status);
    }

    // 3. Quotation Type filter
    if (filterOptions.type && filterOptions.type !== 'all') {
      items = items.filter(q => q.quotationTypeId === filterOptions.type);
    }

    // 4. Date Range filter
    if (filterOptions.dateFilter && filterOptions.dateFilter !== 'all') {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();

      items = items.filter(q => {
        const qDate = new Date(q.creationDate);
        if (filterOptions.dateFilter === 'today') {
          return qDate.toDateString() === today.toDateString();
        } else if (filterOptions.dateFilter === 'this_week') {
          const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
          return qDate >= firstDayOfWeek;
        } else if (filterOptions.dateFilter === 'this_month') {
          return qDate.getFullYear() === currentYear && qDate.getMonth() === currentMonth;
        } else if (filterOptions.dateFilter === 'this_year') {
          return qDate.getFullYear() === currentYear;
        }
        return true;
      });
    }

    // 5. Global Search (No., Client, Project, Title)
    if (filterOptions.query && filterOptions.query.trim()) {
      const q = filterOptions.query.trim().toLowerCase();
      items = items.filter(item => {
        return (
          item.quotationNo.toLowerCase().includes(q) ||
          item.titleAr.toLowerCase().includes(q) ||
          item.titleEn.toLowerCase().includes(q) ||
          item.clientNameAr.toLowerCase().includes(q) ||
          item.clientNameEn.toLowerCase().includes(q) ||
          item.projectNameAr.toLowerCase().includes(q) ||
          item.projectNameEn.toLowerCase().includes(q)
        );
      });
    }

    // 6. Sorting
    if (filterOptions.sort) {
      if (filterOptions.sort === 'highest') {
        items.sort((a, b) => b.amount - a.amount);
      } else if (filterOptions.sort === 'lowest') {
        items.sort((a, b) => a.amount - b.amount);
      } else if (filterOptions.sort === 'newest') {
        items.sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate));
      } else if (filterOptions.sort === 'oldest') {
        items.sort((a, b) => new Date(a.creationDate) - new Date(b.creationDate));
      }
    } else {
      // Default: newest first
      items.sort((a, b) => new Date(b.creationDate) - new Date(a.creationDate));
    }

    return items;
  },

  getQuotationById(id) {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUOTATIONS) || '[]');
    return items.find(q => q.id === id);
  },

  createQuotation(data) {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUOTATIONS) || '[]');
    const currentUser = this.getCurrentUser();
    
    // Calculate VAT and Total
    const amount = Number(data.amount) || 0;
    const vatRate = 0.15;
    const vatAmount = Math.round(amount * vatRate);
    const totalAmount = amount + vatAmount;

    const newQuotation = {
      id: 'q_' + Date.now(),
      quotationNo: data.quotationNo || `Q-${new Date().getFullYear()}-${String(items.length + 1).padStart(4, '0')}`,
      titleAr: data.titleAr || data.titleEn || 'عرض سعر جديد',
      titleEn: data.titleEn || data.titleAr || 'New Quotation',
      branchId: data.branchId,
      clientNameAr: data.clientNameAr || data.clientNameEn,
      clientNameEn: data.clientNameEn || data.clientNameAr,
      projectNameAr: data.projectNameAr || data.projectNameEn,
      projectNameEn: data.projectNameEn || data.projectNameAr,
      projectTypeId: data.projectTypeId,
      quotationTypeId: data.quotationTypeId,
      amount: amount,
      vatRate: vatRate,
      vatAmount: vatAmount,
      totalAmount: totalAmount,
      currency: data.currency || 'SAR',
      status: data.status || 'new',
      creationDate: data.creationDate || new Date().toISOString().slice(0, 10),
      validUntil: data.validUntil || new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
      file: {
        name: data.fileName || 'Quotation_Document.pdf',
        size: data.fileSize || '1.2 MB',
        type: data.fileType || 'application/pdf',
        uploadDate: new Date().toISOString(),
        uploadedBy: currentUser ? (currentUser.nameEn || currentUser.nameAr) : 'Ahmed Mohammed',
        dataUrl: data.fileDataUrl || ''
      },
      revisions: [],
      notes: data.notes || ''
    };

    items.unshift(newQuotation);
    localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(items));

    this.addAuditLog('Quotation Created', newQuotation.id, `Created quotation ${newQuotation.quotationNo}`, null, newQuotation.status);
    window.dispatchEvent(new CustomEvent('dmc-data-changed'));
    return newQuotation;
  },

  updateQuotation(id, updatedFields) {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUOTATIONS) || '[]');
    const index = items.findIndex(q => q.id === id);
    if (index === -1) return null;

    const oldItem = { ...items[index] };

    if (updatedFields.amount !== undefined) {
      const amount = Number(updatedFields.amount) || 0;
      updatedFields.vatAmount = Math.round(amount * 0.15);
      updatedFields.totalAmount = amount + updatedFields.vatAmount;
    }

    items[index] = { ...items[index], ...updatedFields };
    localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(items));

    this.addAuditLog('Quotation Edited', id, `Updated fields on ${oldItem.quotationNo}`, oldItem, items[index]);
    window.dispatchEvent(new CustomEvent('dmc-data-changed'));
    return items[index];
  },

  updateStatus(id, newStatus) {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUOTATIONS) || '[]');
    const item = items.find(q => q.id === id);
    if (!item) return null;

    const oldStatus = item.status;
    item.status = newStatus;
    localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(items));

    this.addAuditLog('Status Changed', id, `Status changed from ${oldStatus} to ${newStatus}`, oldStatus, newStatus);
    window.dispatchEvent(new CustomEvent('dmc-data-changed'));
    return item;
  },

  addRevision(id, revisionData) {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUOTATIONS) || '[]');
    const item = items.find(q => q.id === id);
    if (!item) return null;

    if (!item.revisions) item.revisions = [];
    const revNo = item.revisions.length + 1;
    const currentUser = this.getCurrentUser();

    const newRev = {
      revisionNo: revNo,
      date: new Date().toISOString().slice(0, 10),
      uploadedBy: currentUser ? (currentUser.nameEn || currentUser.nameAr) : 'User',
      notes: revisionData.notes || '',
      fileName: revisionData.fileName || `Revision_${revNo}.pdf`,
      dataUrl: revisionData.fileDataUrl || item.file.dataUrl
    };

    item.revisions.push(newRev);
    item.status = 'revised';
    localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(items));

    this.addAuditLog('Revision Uploaded', id, `Uploaded revision #${revNo} for ${item.quotationNo}`, null, `Rev ${revNo}`);
    window.dispatchEvent(new CustomEvent('dmc-data-changed'));
    return item;
  },

  deleteQuotation(id) {
    let items = JSON.parse(localStorage.getItem(STORAGE_KEYS.QUOTATIONS) || '[]');
    const target = items.find(q => q.id === id);
    if (!target) return false;

    items = items.filter(q => q.id !== id);
    localStorage.setItem(STORAGE_KEYS.QUOTATIONS, JSON.stringify(items));

    this.addAuditLog('Quotation Deleted', id, `Deleted quotation ${target.quotationNo}`, target.status, 'DELETED');
    window.dispatchEvent(new CustomEvent('dmc-data-changed'));
    return true;
  },

  // Audit Logs
  getAuditLogs() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS) || '[]');
  },

  addAuditLog(action, entityId, details, beforeVal, afterVal) {
    const logs = this.getAuditLogs();
    const currentUser = this.getCurrentUser();

    logs.unshift({
      id: 'log_' + Date.now(),
      action: action,
      userName: currentUser ? `${currentUser.nameEn} (${currentUser.role})` : 'System',
      date: new Date().toISOString(),
      entityId: entityId,
      details: details,
      before: beforeVal ? JSON.stringify(beforeVal).slice(0, 60) : '-',
      after: afterVal ? JSON.stringify(afterVal).slice(0, 60) : '-'
    });

    // Keep last 150 logs
    if (logs.length > 150) logs.pop();
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
  },

  // Settings Entities
  getBranches() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.BRANCHES) || '[]');
  },
  saveBranches(list) {
    localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('dmc-data-changed'));
  },

  getQuotationTypes() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.QUOTATION_TYPES) || '[]');
  },
  saveQuotationTypes(list) {
    localStorage.setItem(STORAGE_KEYS.QUOTATION_TYPES, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('dmc-data-changed'));
  },

  getProjectTypes() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECT_TYPES) || '[]');
  },
  saveProjectTypes(list) {
    localStorage.setItem(STORAGE_KEYS.PROJECT_TYPES, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('dmc-data-changed'));
  },

  getStatuses() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.STATUSES) || '[]');
  },

  getCurrencies() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENCIES) || '[]');
  },

  getUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  },
  saveUsers(list) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(list));
  },

  // Session Management
  getCurrentUser() {
    const sessionStr = sessionStorage.getItem(STORAGE_KEYS.SESSION) || localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!sessionStr) return null;
    try {
      return JSON.parse(sessionStr);
    } catch (e) {
      return null;
    }
  },

  login(nationalId, password, rememberMe = false) {
    const users = this.getUsers();
    const user = users.find(u => u.nationalId === nationalId.trim() && u.password === password.trim() && u.active);
    if (!user) return null;

    const sessionData = {
      id: user.id,
      nationalId: user.nationalId,
      nameAr: user.nameAr,
      nameEn: user.nameEn,
      role: user.role,
      titleAr: user.titleAr,
      titleEn: user.titleEn,
      email: user.email,
      loginTime: new Date().toISOString()
    };

    if (rememberMe) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));
    } else {
      sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));
    }

    this.addAuditLog('User Login', user.id, `User logged in: ${user.nameEn}`, null, user.role);
    return sessionData;
  },

  logout() {
    const user = this.getCurrentUser();
    if (user) {
      this.addAuditLog('User Logout', user.id, `User logged out: ${user.nameEn}`, null, null);
    }
    sessionStorage.removeItem(STORAGE_KEYS.SESSION);
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  // Helper for Theme
  getTheme() {
    return localStorage.getItem(STORAGE_KEYS.THEME) || 'light';
  },

  setTheme(theme) {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
    document.documentElement.setAttribute('data-theme', theme);
  },

  toggleTheme() {
    const current = this.getTheme();
    const next = current === 'light' ? 'dark' : 'light';
    this.setTheme(next);
    return next;
  }
};

// Initialize on script load
DMCStore.init();
