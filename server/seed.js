const { db, initSchema } = require('./db');

function seed() {
  initSchema();

  console.log('Seeding SQLite database with DMC records...');

  // 1. Users
  const userStmt = db.prepare(`
    INSERT OR REPLACE INTO users (id, national_id, password, name_ar, name_en, role, title_ar, title_en, email, active)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const users = [
    ['u_admin_1', '1010101010', 'admin123', 'أحمد محمد الزهراني', 'Ahmed Mohammed Al-Zahrani', 'admin', 'مدير عام النظام والتوثيق', 'System Administrator', 'ahmed.m@dmc-consulting.sa', 1],
    ['u_user_1', '2020202020', 'user123', 'م. خالد سعيد العتيبي', 'Eng. Khalid Al-Otaibi', 'user', 'مهندس استشاري أول', 'Senior Consultant Engineer', 'khalid.o@dmc-consulting.sa', 1],
    ['u_admin_legacy', '1234567890', 'admin123', 'أحمد محمد الزهراني', 'Ahmed Mohammed Al-Zahrani', 'admin', 'مدير عام النظام', 'System Administrator', 'ahmed.m@dmc-consulting.sa', 1],
    ['u_user_legacy', '0987654321', 'user123', 'م. خالد سعيد العتيبي', 'Eng. Khalid Al-Otaibi', 'user', 'مهندس استشاري', 'Consultant Engineer', 'khalid.o@dmc-consulting.sa', 1]
  ];

  for (const u of users) {
    userStmt.run(...u);
  }

  // 2. Branches
  const branchStmt = db.prepare(`
    INSERT OR REPLACE INTO branches (id, code, name_ar, name_en, active)
    VALUES (?, ?, ?, ?, ?)
  `);

  const branches = [
    ['b_1', 'MKK', 'فرع مكة المكرمة', 'Makkah Branch', 1],
    ['b_2', 'MDN', 'فرع المدينة المنورة', 'Madinah Branch', 1],
    ['b_3', 'JED', 'فرع جدة', 'Jeddah Branch', 1],
    ['b_4', 'MKH', 'فرع المخواة', 'Al-Makhwah Branch', 1],
    ['b_5', 'NMR', 'فرع نمرة', 'Nimrah Branch', 1],
    ['b_6', 'BAH', 'فرع الباحة', 'Al-Baha Branch', 1],
    ['b_7', 'BLJ', 'فرع بلجرشي', 'Baljurashi Branch', 1]
  ];

  for (const b of branches) {
    branchStmt.run(...b);
  }

  // 3. Quotation Types
  const qTypeStmt = db.prepare(`
    INSERT OR REPLACE INTO quotation_types (id, key, name_ar, name_en, active)
    VALUES (?, ?, ?, ?, ?)
  `);

  const quotationTypes = [
    ['qt_supervision', 'type_supervision', 'عروض الإشراف الهندسي', 'Supervision Quotations', 1],
    ['qt_design', 'type_design', 'عروض التصميم الهندسي', 'Design Quotations', 1],
    ['qt_hydraulic', 'type_hydraulic', 'عروض الدراسات الهيدرولوجية', 'Hydraulic Study Quotations', 1],
    ['qt_surveying', 'type_surveying', 'عروض الرفع المساحي', 'Surveying Quotations', 1],
    ['qt_structural', 'type_structural', 'عروض الدراسات الإنشائية', 'Structural Study Quotations', 1],
    ['qt_building_permit', 'type_building_permit', 'عروض استخراج تراخيص البناء', 'Building Permit Quotations', 1],
    ['qt_other', 'type_other', 'خدمات هندسية أخرى', 'Other Engineering Services', 1]
  ];

  for (const qt of quotationTypes) {
    qTypeStmt.run(...qt);
  }

  // 4. Project Types
  const pTypeStmt = db.prepare(`
    INSERT OR REPLACE INTO project_types (id, key, name_ar, name_en)
    VALUES (?, ?, ?, ?)
  `);

  const projectTypes = [
    ['pt_res_bld', 'proj_residential_building', 'مبنى سكني', 'Residential Building'],
    ['pt_com_bld', 'proj_commercial_building', 'مبنى تجاري', 'Commercial Building'],
    ['pt_res_com', 'proj_res_comm_building', 'مبنى سكني تجاري', 'Residential & Commercial Building'],
    ['pt_villa', 'proj_villa', 'فيلا سكنية', 'Villa'],
    ['pt_factory', 'proj_factory', 'مصنع / مستودع', 'Factory / Warehouse'],
    ['pt_school', 'proj_school', 'مبنى تعليمي / مدرسة', 'School / Educational'],
    ['pt_mosque', 'proj_mosque', 'جامع / مسجد', 'Mosque'],
    ['pt_gas_station', 'proj_gas_station', 'محطة وقود وخدمات', 'Gas Station & Services'],
    ['pt_office_bld', 'proj_office_building', 'مبنى شركات / مكاتب', 'Company / Office Building'],
    ['pt_infrastructure', 'proj_infrastructure', 'مشروع بنية تحتية', 'Infrastructure Project'],
    ['pt_other', 'proj_other', 'أخرى', 'Other']
  ];

  for (const pt of projectTypes) {
    pTypeStmt.run(...pt);
  }

  // 5. Statuses
  const statusStmt = db.prepare(`
    INSERT OR REPLACE INTO statuses (id, key, name_ar, name_en, color)
    VALUES (?, ?, ?, ?, ?)
  `);

  const statuses = [
    ['approved', 'status_approved', 'معتمدة', 'Approved', '#10B981'],
    ['closed', 'status_closed', 'مغلقة', 'Closed', '#EF4444'],
    ['ongoing', 'status_ongoing', 'جارية', 'Ongoing', '#3B82F6'],
    ['notstarted', 'status_notstarted', 'لم تبدأ', 'Not Started', '#64748B'],
    ['completed', 'status_completed', 'منتهية', 'Completed', '#059669'],
    ['new', 'status_new', 'جديدة', 'New', '#8B5CF6'],
    ['revised', 'status_revised', 'متغيرة', 'Revised', '#F59E0B']
  ];

  for (const st of statuses) {
    statusStmt.run(...st);
  }

  // 6. Currencies
  const currStmt = db.prepare(`
    INSERT OR REPLACE INTO currencies (code, name_ar, name_en, symbol, is_default)
    VALUES (?, ?, ?, ?, ?)
  `);

  const currencies = [
    ['SAR', 'ريال سعودي', 'Saudi Riyal', 'ر.س', 1],
    ['USD', 'دولار أمريكي', 'US Dollar', '$', 0],
    ['EUR', 'يورو', 'Euro', '€', 0],
    ['AED', 'درهم إماراتي', 'UAE Dirham', 'د.إ', 0]
  ];

  for (const c of currencies) {
    currStmt.run(...c);
  }

  // 7. Check if quotations already exist
  const existingCount = db.prepare('SELECT COUNT(*) as count FROM quotations').get().count;
  if (existingCount >= 248) {
    console.log(`Database already has ${existingCount} quotations. Skipping generation.`);
    return;
  }

  // Clear existing quotations and revisions before full seed
  db.exec('DELETE FROM revisions');
  db.exec('DELETE FROM quotations');

  // Insert Statements
  const quotStmt = db.prepare(`
    INSERT INTO quotations (
      id, quotation_no, title_ar, title_en, branch_id,
      client_name_ar, client_name_en, project_name_ar, project_name_en,
      project_type_id, quotation_type_id, amount, vat_rate, vat_amount,
      total_amount, currency, status, creation_date, valid_until,
      file_link, file_name, file_size, file_type, notes
    ) VALUES (
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?,
      ?, ?, ?, ?, ?
    )
  `);

  const revStmt = db.prepare(`
    INSERT INTO revisions (
      quotation_id, revision_no, date, uploaded_by, file_link, file_name, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

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
  const currentMonth = today.getMonth();

  // Top quotation: Hospital Project (SAR 5,200,000)
  quotStmt.run(
    'q_top_hospital',
    'Q-2025-045',
    'مشروع المستشفى التخصصي - إشراف هندسي متكامل',
    'Hospital Project - Engineering Supervision',
    'b_1', // Makkah
    'مستشفى الرحمة الدولي',
    'Al-Rahma Hospital',
    'برج المستشفى التخصصي الجديد',
    'New Specialized Hospital Tower',
    'pt_office_bld',
    'qt_supervision',
    5200000,
    0.15,
    780000,
    5980000,
    'SAR',
    'approved',
    new Date(currentYear, currentMonth, 12).toISOString().slice(0, 10),
    new Date(currentYear, currentMonth + 3, 12).toISOString().slice(0, 10),
    'https://dar-makkah.sharepoint.com/sites/archive/Q-2025-045_Hospital_Supervision.pdf',
    'DMC_Quotation_Q-2025-045_Hospital_Supervision.pdf',
    '1.8 MB',
    'application/pdf',
    'عقد إشراف رئيسي معتمد لكامل مرحلة التنفيذ الإنشائي والمعماري.'
  );

  targetCounts.approved--;
  let quotationIndex = 1;
  let currentMonthCounter = 1;

  for (const [statusKey, count] of Object.entries(targetCounts)) {
    for (let i = 0; i < count; i++) {
      quotationIndex++;
      const branch = branches[(quotationIndex) % branches.length];
      const qType = quotationTypes[(quotationIndex + 2) % quotationTypes.length];
      const pType = projectTypes[(quotationIndex + 1) % projectTypes.length];
      const client = clients[(quotationIndex * 3) % clients.length];

      const isCurrentMonth = currentMonthCounter < 36;
      let dateObj;
      if (isCurrentMonth) {
        const day = Math.min(28, (quotationIndex % 25) + 1);
        dateObj = new Date(currentYear, currentMonth, day);
        currentMonthCounter++;
      } else {
        const monthOffset = (quotationIndex % 11) + 1;
        const pastMonth = (currentMonth - monthOffset + 12) % 12;
        const year = pastMonth > currentMonth ? currentYear - 1 : currentYear;
        const day = (quotationIndex % 27) + 1;
        dateObj = new Date(year, pastMonth, day);
      }

      const dateStr = dateObj.toISOString().slice(0, 10);
      const validUntilObj = new Date(dateObj.getTime() + 90 * 24 * 3600 * 1000);
      const validUntilStr = validUntilObj.toISOString().slice(0, 10);

      const rawAmount = Math.round((25000 + ((quotationIndex * 3791) % 2400000)) / 1000) * 1000;
      const vat = Math.round(rawAmount * 0.15);
      const padNum = String(quotationIndex).padStart(4, '0');
      const qNo = `Q-${currentYear}-${padNum}`;
      const qId = `q_${quotationIndex}`;

      const fileLink = `https://dar-makkah.sharepoint.com/sites/archive/${qNo}.pdf`;

      quotStmt.run(
        qId,
        qNo,
        `${qType[2]} - ${pType[2]}`,
        `${qType[3]} - ${pType[3]}`,
        branch[0],
        client.ar,
        client.en,
        `مشروع ${pType[2]} - ${client.ar}`,
        `${pType[3]} Project - ${client.en}`,
        pType[0],
        qType[0],
        rawAmount,
        0.15,
        vat,
        rawAmount + vat,
        'SAR',
        statusKey,
        dateStr,
        validUntilStr,
        fileLink,
        `DMC_${qNo}.pdf`,
        `${(0.4 + (quotationIndex % 15) * 0.1).toFixed(1)} MB`,
        'application/pdf',
        'عرض سعر محفوظ في الأرشيف المركزي لمكتب دار مكة للاستشارات الهندسية.'
      );

      if (statusKey === 'revised') {
        revStmt.run(
          qId,
          1,
          dateStr,
          'Eng. Khalid Al-Otaibi',
          `https://dar-makkah.sharepoint.com/sites/archive/${qNo}_Rev1.pdf`,
          `${qNo}_Rev1.pdf`,
          'تحديث الأسعار وجداول الكميات بناءً على طلب المالك'
        );
      }
    }
  }

  // 8. Audit Log Initial Record
  const logStmt = db.prepare(`
    INSERT INTO audit_logs (action, user_name, entity_id, details, before_val, after_val)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  logStmt.run(
    'System Seeded',
    'Ahmed Mohammed Al-Zahrani',
    'SYSTEM',
    'Database initialized with 248 quotation records and 7 branches.',
    null,
    '248 records'
  );

  const finalCount = db.prepare('SELECT COUNT(*) as count FROM quotations').get().count;
  console.log(`Successfully seeded ${finalCount} quotations into SQLite database!`);
}

if (require.main === module) {
  seed();
}

module.exports = { seed };
