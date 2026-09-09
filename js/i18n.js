/**
 * DMC Dar Makkah Engineering Consultancy
 * Bilingual Internationalization System (Arabic & English)
 */

const translations = {
  ar: {
    // App & Brand
    app_name: 'دار مكة للاستشارات الهندسية',
    app_subtitle: 'نظام أرشفة وإدارة عروض الأسعار',
    tagline: 'تنظيم • متابعة • قرارات مدروسة',
    since_year: 'تأسست عام 1986',

    // Navigation
    nav_section_main: 'القائمة الرئيسية',
    nav_section_analytics: 'التحليلات والأرشيف',
    nav_section_system: 'إدارة النظام',
    nav_cloud_status: 'الأرشفة السحابية',
    nav_cloud_connected: 'متصل وسحابي نشط',
    nav_drive_direct: 'روابط Drive المباشرة',
    nav_dashboard: 'لوحة التحكم',
    nav_quotations: 'عروض الأسعار',
    nav_add_quotation: 'إضافة عرض سعر',
    nav_reports: 'التقارير والإحصائيات',
    nav_settings: 'إعدادات النظام',
    nav_audit: 'سجل العمليات',
    nav_profile: 'الملف الشخصي',

    // Top Header & Actions
    search_placeholder: 'بحث في عروض الأسعار (الرقم، العميل، المشروع، الفرع)...',
    btn_add_quotation: '+ إضافة عرض سعر جديد',
    lang_toggle: 'English',
    theme_light: 'الوضع النهاري',
    theme_dark: 'الوضع الليلي',
    logout: 'تسجيل الخروج',
    welcome_back: 'مرحباً بك',

    // KPI Cards
    kpi_total_quotations: 'إجمالي عروض الأسعار',
    kpi_this_month: 'عروض هذا الشهر',
    kpi_approved: 'معتمدة',
    kpi_closed: 'مغلقة',
    kpi_ongoing: 'جارية',
    kpi_not_started: 'لم تبدأ',
    kpi_completed: 'منتهية',
    kpi_new: 'جديدة',
    kpi_revised: 'متغيرة (معدلة)',
    kpi_highest_value: 'أعلى قيمة لعرض',

    // Filters
    filter_all_branches: 'جميع الفروع',
    filter_all_statuses: 'جميع الحالات',
    filter_all_types: 'جميع أنواع العروض',
    filter_date_all: 'كافة الفترات',
    filter_date_today: 'اليوم',
    filter_date_week: 'هذا الأسبوع',
    filter_date_month: 'هذا الشهر',
    filter_date_year: 'هذا العام',
    filter_sort_highest: 'الأعلى قيمة',
    filter_sort_lowest: 'الأقل قيمة',
    filter_sort_newest: 'الأحدث تاريخاً',
    filter_sort_oldest: 'الأقدم تاريخاً',
    btn_reset_filters: 'إعادة ضبط الفلاتر',

    // Charts
    chart_branch_title: 'توزيع عروض الأسعار حسب الفروع',
    chart_status_title: 'توزيع عروض الأسعار حسب الحالة',
    chart_type_title: 'توزيع عروض الأسعار حسب نوع الخدمة',
    chart_monthly_title: 'حركة عروض الأسعار الشهرية خلال العام',
    chart_value_title: 'إجمالي قيمة العروض والتحليل المالي',
    total_value_label: 'إجمالي القيمة المالية',
    top_quotation_label: 'عرض السعر الأعلى قيمة',

    // Current Month Section
    month_section_title: 'عروض الأسعار المنشأة خلال هذا الشهر',
    month_section_subtitle: 'قائمة عروض الأسعار المسجلة رسمياً خلال الشهر الحالي',
    view_all: 'عرض الكل',

    // Table Columns
    col_no: 'م',
    col_quotation_no: 'رقم العرض',
    col_title: 'عنوان عرض السعر',
    col_branch: 'الفرع',
    col_client: 'العميل',
    col_project: 'اسم المشروع',
    col_project_type: 'نوع المشروع',
    col_type: 'نوع العرض',
    col_amount: 'المبلغ الأساسي',
    col_vat: 'ضريبة القيمة المضافة',
    col_total: 'الإجمالي شامل الضريبة',
    col_currency: 'العملة',
    col_status: 'الحالة',
    col_date: 'تاريخ الإنشاء',
    col_valid_until: 'صالح حتى',
    col_file: 'الملف المؤرشف',
    col_actions: 'الإجراءات',

    // Table Actions
    action_view: 'عرض التفاصيل',
    action_open_file: 'فتح الملف',
    action_edit: 'تعديل',
    action_change_status: 'تغيير الحالة',
    action_add_revision: 'إضافة نسخة معدلة',
    action_delete: 'حذف',
    no_records: 'لا توجد عروض أسعار مطابقة للبحث أو الفلترة',

    // Branches (7 Fixed)
    branch_1: 'فرع مكة المكرمة',
    branch_2: 'فرع المدينة المنورة',
    branch_3: 'فرع جدة',
    branch_4: 'فرع المخواة',
    branch_5: 'فرع نمرة',
    branch_6: 'فرع الباحة',
    branch_7: 'فرع بلجرشي',

    // Quotation Types
    type_supervision: 'عروض الإشراف الهندسي',
    type_design: 'عروض التصميم الهندسي',
    type_hydraulic: 'عروض الدراسات الهيدرولوجية',
    type_surveying: 'عروض الرفع المساحي',
    type_structural: 'عروض الدراسات الإنشائية',
    type_building_permit: 'عروض استخراج تراخيص البناء',
    type_other: 'أخرى',

    // Project Types
    proj_residential_building: 'مبنى سكني',
    proj_commercial_building: 'مبنى تجاري',
    proj_res_comm_building: 'مبنى سكني تجاري',
    proj_villa: 'فيلا سكنية',
    proj_factory: 'مصنع / مستودع',
    proj_school: 'مبنى تعليمي / مدرسة',
    proj_mosque: 'جامع / مسجد',
    proj_gas_station: 'محطة وقود وخدمات',
    proj_office_building: 'مبنى شركات / مكاتب',
    proj_infrastructure: 'مشروع بنية تحتية',
    proj_other: 'أخرى',

    // Quotation Statuses
    status_new: 'جديدة',
    status_ongoing: 'جارية',
    status_notstarted: 'لم تبدأ',
    status_approved: 'معتمدة',
    status_closed: 'مغلقة',
    status_completed: 'منتهية',
    status_revised: 'متغيرة',

    // Currencies
    curr_sar: 'ريال سعودي (SAR)',
    curr_usd: 'دولار أمريكي (USD)',
    curr_eur: 'يورو (EUR)',
    curr_aed: 'درهم إماراتي (AED)',

    // Add Quotation Form
    modal_add_title: 'أرشفة عرض سعر جديد',
    modal_add_desc: 'يرجى إدخال بيانات العرض وإرفاق الملف الأصلي لحفظه في الأرشيف',
    sec_basic_info: 'المعلومات الأساسية',
    sec_financial_info: 'المعلومات المالية',
    sec_file_attachment: 'وثيقة عرض السعر (الملف المؤرشف)',
    
    lbl_quotation_no: 'رقم عرض السعر',
    lbl_quotation_title: 'عنوان عرض السعر',
    lbl_client_name: 'اسم العميل / الجهة',
    lbl_project_name: 'اسم المشروع',
    lbl_project_type: 'نوع المشروع',
    lbl_quotation_type: 'نوع عرض السعر',
    lbl_branch: 'الفرع التابع له',
    lbl_creation_date: 'تاريخ إنشاء العرض',
    lbl_valid_until: 'صالح لغاية تاريخ',
    lbl_status: 'حالة العرض',
    lbl_amount: 'مبلغ العرض (غير شامل الضريبة)',
    lbl_currency: 'العملة',
    lbl_vat_rate: 'نسبة ضريبة القيمة المضافة (15%)',
    lbl_total_amount: 'الإجمالي النهائي شامل الضريبة',
    lbl_file_link: 'رابط وثيقة عرض السعر (OneDrive / سحابي / شبكة)',
    lbl_file_link_desc: 'يمكنك لصق رابط المشاركة المباشر من OneDrive أو SharePoint أو أي سحابة تخزين',
    btn_test_link: 'اختبار الرابط',
    
    dropzone_title: 'اسحب وأفلت ملف عرض السعر هنا أو انقر للاختيار',
    dropzone_hint: 'الصيغ المدعومة: PDF, DOCX, XLSX, JPG, PNG (الأصل وثيقة PDF)',
    dropzone_selected: 'تم اختيار الملف بنجاح',

    btn_save_quotation: 'حفظ وأرشفة العرض',
    btn_cancel: 'إلغاء',

    // Details Modal
    modal_details_title: 'بطاقة تفاصيل عرض السعر',
    btn_open_quotation: 'فتح وثيقة عرض السعر المؤرشفة',
    lbl_uploaded_by: 'تمت الأرشفة بواسطة',
    lbl_upload_date: 'تاريخ وتوقيت الأرشفة',
    lbl_last_modified: 'آخر تعديل',
    tab_overview: 'نظرة عامة',
    tab_revisions: 'سجل التعديلات والنسخ (Revisions)',
    tab_audit: 'سجل الحركات (Audit Log)',

    // Revision Modal
    modal_revision_title: 'تسجيل نسخة معدلة لعرض السعر',
    lbl_revision_notes: 'ملاحظات التعديل وأسباب التغيير',
    lbl_revision_file: 'ملف العرض المعدل الجديد',
    btn_save_revision: 'حفظ النسخة المعدلة',

    // Settings
    settings_title: 'إعدادات النظام وإدارة الصلاحيات',
    tab_company: 'بيانات الشركة',
    tab_branches: 'إدارة الفروع (7)',
    tab_types: 'أنواع العروض',
    tab_project_types: 'أنواع المشاريع',
    tab_statuses: 'حالات العروض',
    tab_currencies: 'العملات المعتمدة',
    tab_users: 'المستخدمين والصلاحيات',

    // Login Page
    login_welcome: 'مرحباً بك',
    login_subtitle_text: 'تسجيل الدخول إلى نظام إدارة وأرشفة عروض الأسعار',
    lbl_national_id: 'رقم الهوية الوطنية / الإقامة',
    lbl_password: 'كلمة المرور',
    remember_me: 'تذكرني',
    forgot_password: 'نسيت كلمة المرور؟',
    btn_login: 'دخول إلى النظام',
    login_invalid: 'رقم الهوية أو كلمة المرور غير صحيحة',
    login_demo_hint: 'بيانات تجريبية سريعة:',
    demo_admin: 'مدير النظام (Admin)',
    demo_user: 'مستخدم عادي (Engineer)',

    // Messages
    msg_saved_success: 'تم حفظ وأرشفة عرض السعر بنجاح',
    msg_status_updated: 'تم تحديث حالة عرض السعر بنجاح',
    msg_revision_added: 'تمت إضافة النسخة المعدلة بنجاح مع الاحتفاظ بالأصل',
    msg_deleted_success: 'تم حذف العرض بنجاح',
    confirm_delete: 'هل أنت متأكد من حذف عرض السعر هذا من الأرشيف؟',
    validation_error: 'يرجى تعبئة كافة الحقول الإلزامية وإرفاق ملف العرض',
    rule_note: 'ملاحظة: هذا النظام مخصص للأرشفة والمتابعة فقط ولا يولد عروض أسعار.'
  },

  en: {
    // App & Brand
    app_name: 'Dar Makkah Engineering Consultancy',
    app_subtitle: 'Quotation Archive & Management System',
    tagline: 'Organize • Track • Make Better Decisions',
    since_year: 'Since 1986',

    // Navigation
    nav_section_main: 'Main Menu',
    nav_section_analytics: 'Analytics & Archive',
    nav_section_system: 'System & Config',
    nav_cloud_status: 'Cloud Archive',
    nav_cloud_connected: 'Connected & Synced',
    nav_drive_direct: 'Direct Drive Links',
    nav_dashboard: 'Dashboard',
    nav_quotations: 'Quotations',
    nav_add_quotation: 'Add Quotation',
    nav_reports: 'Reports & Analytics',
    nav_settings: 'Settings',
    nav_audit: 'Audit Log',
    nav_profile: 'User Profile',

    // Top Header & Actions
    search_placeholder: 'Search quotations (No., Client, Project, Branch)...',
    btn_add_quotation: '+ Add New Quotation',
    lang_toggle: 'العربية',
    theme_light: 'Light Mode',
    theme_dark: 'Dark Mode',
    logout: 'Logout',
    welcome_back: 'Welcome back',

    // KPI Cards
    kpi_total_quotations: 'Total Quotations',
    kpi_this_month: 'This Month',
    kpi_approved: 'Approved',
    kpi_closed: 'Closed',
    kpi_ongoing: 'Ongoing',
    kpi_not_started: 'Not Started',
    kpi_completed: 'Completed',
    kpi_new: 'New',
    kpi_revised: 'Revised',
    kpi_highest_value: 'Highest Value',

    // Filters
    filter_all_branches: 'All Branches',
    filter_all_statuses: 'All Statuses',
    filter_all_types: 'All Types',
    filter_date_all: 'All Periods',
    filter_date_today: 'Today',
    filter_date_week: 'This Week',
    filter_date_month: 'This Month',
    filter_date_year: 'This Year',
    filter_sort_highest: 'Highest Value',
    filter_sort_lowest: 'Lowest Value',
    filter_sort_newest: 'Newest Date',
    filter_sort_oldest: 'Oldest Date',
    btn_reset_filters: 'Reset Filters',

    // Charts
    chart_branch_title: 'Quotations by Branch',
    chart_status_title: 'Quotations by Status',
    chart_type_title: 'Quotations by Type',
    chart_monthly_title: 'Monthly Quotations Trend',
    chart_value_title: 'Quotation Value & Financial Summary',
    total_value_label: 'Total Quotation Value',
    top_quotation_label: 'Top Value Quotation',

    // Current Month Section
    month_section_title: 'Quotations Created This Month',
    month_section_subtitle: 'List of quotations officially archived during current month',
    view_all: 'View All',

    // Table Columns
    col_no: '#',
    col_quotation_no: 'Quotation No.',
    col_title: 'Quotation Title',
    col_branch: 'Branch',
    col_client: 'Client',
    col_project: 'Project Name',
    col_project_type: 'Project Type',
    col_type: 'Quotation Type',
    col_amount: 'Amount',
    col_vat: 'VAT',
    col_total: 'Total Amount',
    col_currency: 'Currency',
    col_status: 'Status',
    col_date: 'Creation Date',
    col_valid_until: 'Valid Until',
    col_file: 'Archived File',
    col_actions: 'Actions',

    // Table Actions
    action_view: 'View Details',
    action_open_file: 'Open File',
    action_edit: 'Edit',
    action_change_status: 'Change Status',
    action_add_revision: 'Add Revision',
    action_delete: 'Delete',
    no_records: 'No quotations found matching the criteria',

    // Branches (7 Fixed)
    branch_1: 'Makkah Branch',
    branch_2: 'Madinah Branch',
    branch_3: 'Jeddah Branch',
    branch_4: 'Al-Makhwah Branch',
    branch_5: 'Nimrah Branch',
    branch_6: 'Al-Baha Branch',
    branch_7: 'Baljurashi Branch',

    // Quotation Types
    type_supervision: 'Supervision Quotations',
    type_design: 'Design Quotations',
    type_hydraulic: 'Hydraulic Study Quotations',
    type_surveying: 'Surveying Quotations',
    type_structural: 'Structural Study Quotations',
    type_building_permit: 'Building Permit Quotations',
    type_other: 'Other',

    // Project Types
    proj_residential_building: 'Residential Building',
    proj_commercial_building: 'Commercial Building',
    proj_res_comm_building: 'Residential & Commercial Building',
    proj_villa: 'Villa',
    proj_factory: 'Factory / Warehouse',
    proj_school: 'School / Educational',
    proj_mosque: 'Mosque',
    proj_gas_station: 'Gas Station & Services',
    proj_office_building: 'Company / Office Building',
    proj_infrastructure: 'Infrastructure Project',
    proj_other: 'Other',

    // Quotation Statuses
    status_new: 'New',
    status_ongoing: 'Ongoing',
    status_notstarted: 'Not Started',
    status_approved: 'Approved',
    status_closed: 'Closed',
    status_completed: 'Completed',
    status_revised: 'Revised',

    // Currencies
    curr_sar: 'Saudi Riyal (SAR)',
    curr_usd: 'US Dollar (USD)',
    curr_eur: 'Euro (EUR)',
    curr_aed: 'UAE Dirham (AED)',

    // Add Quotation Form
    modal_add_title: 'Archive New Quotation',
    modal_add_desc: 'Enter quotation details and attach official file to archive',
    sec_basic_info: 'Basic Information',
    sec_financial_info: 'Financial Information',
    sec_file_attachment: 'Quotation Document (Archived File)',
    
    lbl_quotation_no: 'Quotation Number',
    lbl_quotation_title: 'Quotation Title',
    lbl_client_name: 'Client Name',
    lbl_project_name: 'Project Name',
    lbl_project_type: 'Project Type',
    lbl_quotation_type: 'Quotation Type',
    lbl_branch: 'Assigned Branch',
    lbl_creation_date: 'Creation Date',
    lbl_valid_until: 'Valid Until',
    lbl_status: 'Quotation Status',
    lbl_amount: 'Quotation Amount (excl. VAT)',
    lbl_currency: 'Currency',
    lbl_vat_rate: 'VAT Rate (15%)',
    lbl_total_amount: 'Total Amount (incl. VAT)',
    lbl_file_link: 'Quotation Document Link (OneDrive / Cloud / Server)',
    lbl_file_link_desc: 'Paste the direct sharing link from OneDrive, SharePoint, Google Drive, or shared server',
    btn_test_link: 'Test Link',
    
    dropzone_title: 'Drag & drop quotation file here, or click to browse',
    dropzone_hint: 'Supported formats: PDF, DOCX, XLSX, JPG, PNG (PDF preferred)',
    dropzone_selected: 'File selected successfully',

    btn_save_quotation: 'Save & Archive Quotation',
    btn_cancel: 'Cancel',

    // Details Modal
    modal_details_title: 'Quotation Profile Details',
    btn_open_quotation: 'Open Archived Quotation Document',
    lbl_uploaded_by: 'Archived By',
    lbl_upload_date: 'Archive Timestamp',
    lbl_last_modified: 'Last Modified',
    tab_overview: 'Overview',
    tab_revisions: 'Revision History',
    tab_audit: 'Audit Log Trail',

    // Revision Modal
    modal_revision_title: 'Register Quotation Revision',
    lbl_revision_notes: 'Revision Notes & Reason',
    lbl_revision_file: 'New Revised Document',
    btn_save_revision: 'Save Revised Version',

    // Settings
    settings_title: 'System Settings & Access Control',
    tab_company: 'Company Profile',
    tab_branches: 'Branches (7)',
    tab_types: 'Quotation Types',
    tab_project_types: 'Project Types',
    tab_statuses: 'Statuses',
    tab_currencies: 'Currencies',
    tab_users: 'Users & Roles',

    // Login Page
    login_welcome: 'Welcome',
    login_subtitle_text: 'Sign in to Quotation Archive & Dashboard',
    lbl_national_id: 'National ID / ID Number',
    lbl_password: 'Password',
    remember_me: 'Remember me',
    forgot_password: 'Forgot password?',
    btn_login: 'Login to System',
    login_invalid: 'Invalid National ID or Password',
    login_demo_hint: 'Quick demo credentials:',
    demo_admin: 'System Administrator (Admin)',
    demo_user: 'Standard User (Engineer)',

    // Messages
    msg_saved_success: 'Quotation archived successfully',
    msg_status_updated: 'Quotation status updated successfully',
    msg_revision_added: 'Revision saved successfully. Original document preserved.',
    msg_deleted_success: 'Quotation deleted successfully',
    confirm_delete: 'Are you sure you want to delete this quotation from archive?',
    validation_error: 'Please fill all required fields and attach a quotation document',
    rule_note: 'Note: This system is for archiving and monitoring only. It does not generate quotations.'
  }
};

let currentLang = localStorage.getItem('dmc_lang') || 'ar';

function t(key) {
  if (!translations[currentLang] || !translations[currentLang][key]) {
    // Fallback to English or key itself
    return (translations['en'] && translations['en'][key]) || key;
  }
  return translations[currentLang][key];
}

function getLang() {
  return currentLang;
}

function setLang(lang) {
  if (lang !== 'ar' && lang !== 'en') return;
  currentLang = lang;
  localStorage.setItem('dmc_lang', lang);
  applyDocumentLanguage();
  // Dispatch event for UI reactivity
  window.dispatchEvent(new CustomEvent('dmc-language-changed', { detail: { lang } }));
}

function toggleLang() {
  setLang(currentLang === 'ar' ? 'en' : 'ar');
}

function applyDocumentLanguage() {
  const html = document.documentElement;
  html.setAttribute('lang', currentLang);
  html.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
  
  // Update all elements marked with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });

  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.setAttribute('placeholder', t(key));
  });

  // Update titles
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    el.setAttribute('title', t(key));
  });
}

// Auto-run on load
document.addEventListener('DOMContentLoaded', () => {
  applyDocumentLanguage();
});
