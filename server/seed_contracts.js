const { db } = require('./db');

function seedContracts() {
  const count = db.prepare('SELECT count(*) as c FROM contracts').get().c;
  console.log('Current contracts count in SQLite:', count);

  if (count < 10) {
    const branches = ['b_1', 'b_2', 'b_3', 'b_4', 'b_5', 'b_6', 'b_7'];
    const contractTypes = ['qt_supervision', 'qt_design', 'qt_hydraulic', 'qt_surveying', 'qt_structural', 'qt_building_permit'];
    const projectTypes = ['pt_res_bld', 'pt_com_bld', 'pt_res_com', 'pt_villa', 'pt_factory', 'pt_school', 'pt_office_bld', 'pt_infrastructure'];
    const statuses = ['approved', 'ongoing', 'completed', 'notstarted', 'closed', 'new', 'revised'];

    const clients = [
      { ar: 'شركة أم القرى للتنمية والإعمار', en: 'Umm Al-Qura Development Co.' },
      { ar: 'شركة جبل عمر للتطوير', en: 'Jabal Omar Development' },
      { ar: 'أمانة العاصمة المقدسة', en: 'Holy Makkah Municipality' },
      { ar: 'صندوق الاستثمارات العامة', en: 'Public Investment Fund' },
      { ar: 'شركة روشن العقارية', en: 'Roshn Real Estate' },
      { ar: 'جامعة أم القرى', en: 'Umm Al-Qura University' },
      { ar: 'الهيئة الملكية لمدينة مكة', en: 'Royal Commission for Makkah' },
      { ar: 'شركة مكة للإنشاء والتعمير', en: 'Makkah Construction Co.' },
      { ar: 'مستشفى الملك فهد', en: 'King Fahad Hospital' }
    ];

    const contractTitles = [
      { ar: 'عقد إشراف هندسي متكامل - مشروع الأبراج السكنية', en: 'Comprehensive Engineering Supervision - Residential Towers' },
      { ar: 'عقد تصميم معماري وإنشائي لمجمع تجاري فاخر', en: 'Architectural & Structural Design for Luxury Commercial Mall' },
      { ar: 'عقد دراسات هيدرولوجية ودرء أخطار السيول', en: 'Hydrological Studies & Flood Mitigation Contract' },
      { ar: 'عقد مساحة وتثبيت حدود مخطط سكني متكامل', en: 'Surveying & Boundary Fixing for Residential Masterplan' },
      { ar: 'عقد إشراف تنفيذي لمستشفى تخصصي 200 سرير', en: 'Supervision Contract for 200-Bed Specialized Hospital' },
      { ar: 'عقد ترخيص وتأهيل مبنى مكاتب إدارية', en: 'Licensing & Renovation Contract for Office Building' },
      { ar: 'عقد دراسات التربة والأساسات العميقة', en: 'Soil Investigation & Deep Foundation Study Contract' },
      { ar: 'عقد إشراف على أعمال شبكات البنية التحتية', en: 'Infrastructure Network Works Supervision Contract' },
      { ar: 'عقد تصميم مجمع تعليمي ومدارس نموذجية', en: 'Educational Campus & Model Schools Design Contract' }
    ];

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO contracts (
        id, contract_no, quotation_id, title_ar, title_en, branch_id,
        client_name_ar, client_name_en, project_name_ar, project_name_en,
        project_type_id, contract_type_id, amount, vat_rate, vat_amount, total_amount,
        currency, status, signing_date, valid_until, file_link, file_name, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const curYear = new Date().getFullYear();
    const curMonth = new Date().getMonth();

    for (let i = 1; i <= 48; i++) {
      const cId = 'c_' + (1789400000000 + i * 12345);
      const cNo = 'C-' + curYear + '-' + String(i).padStart(4, '0');
      const branch = branches[i % branches.length];
      const cType = contractTypes[(i + 1) % contractTypes.length];
      const pType = projectTypes[(i + 2) % projectTypes.length];
      const client = clients[i % clients.length];
      const title = contractTitles[i % contractTitles.length];
      const status = statuses[i % statuses.length];

      // Some contracts signed this month, some earlier
      const isThisMonth = i <= 14;
      let dateObj;
      if (isThisMonth) {
        const day = Math.min(28, (i % 25) + 1);
        dateObj = new Date(curYear, curMonth, day);
      } else {
        const mOffset = (i % 10) + 1;
        const pastM = (curMonth - mOffset + 12) % 12;
        const y = pastM > curMonth ? curYear - 1 : curYear;
        dateObj = new Date(y, pastM, (i % 27) + 1);
      }
      const signingDate = dateObj.toISOString().slice(0, 10);
      const validUntil = new Date(dateObj.getTime() + 365 * 24 * 3600 * 1000).toISOString().slice(0, 10);

      const amount = Math.round((80000 + ((i * 7391) % 4500000)) / 1000) * 1000;
      const vat = Math.round(amount * 0.15);
      const total = amount + vat;
      const fileLink = (i === 1)
        ? 'https://onedrive.live.com/embed?resid=9E591EC818CB6AE4!s1b34aadb3d634b8e8d8e9be999238cd4&redeem=aHR0cHM6Ly8xZHJ2Lm1zL2IvYy85ZTU5MWVjODE4Y2I2YWU0L0lRRGJxalFiWXoyT1M0Mk9tLW1aSTR6VUFRTXZ3bjRTbnhjSDFFT2UyM3lYRVBvP2U9YjNSSzY4&em=2'
        : (i === 2)
        ? 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/preview'
        : `https://dar-makkah.sharepoint.com/sites/archive/${cNo}.pdf`;

      stmt.run(
        cId, cNo, null, title.ar, title.en, branch,
        client.ar, client.en, `مشروع ${title.ar}`, `${title.en} Project`,
        pType, cType, amount, 0.15, vat, total,
        'SAR', status, signingDate, validUntil, fileLink,
        `DMC_Contract_${cNo}.pdf`,
        'عقد استشارات هندسي رسمي معتمد ومؤرشف في قاعدة البيانات المركزية.'
      );
    }

    const finalCount = db.prepare('SELECT count(*) as c FROM contracts').get().c;
    console.log('Seeded successfully! Total contracts:', finalCount);
  }
}

if (require.main === module) {
  seedContracts();
}

module.exports = { seedContracts };
