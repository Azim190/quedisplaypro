-- DMC Dar Makkah Engineering Consultancy
-- Quotation Management & Archiving Database Schema (SQLite)

PRAGMA foreign_keys = ON;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    national_id TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'user')),
    title_ar TEXT,
    title_en TEXT,
    email TEXT,
    active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Branches Table (7 DMC Branches)
CREATE TABLE IF NOT EXISTS branches (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Quotation Types / Categories
CREATE TABLE IF NOT EXISTS quotation_types (
    id TEXT PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    active INTEGER DEFAULT 1
);

-- 4. Project Types
CREATE TABLE IF NOT EXISTS project_types (
    id TEXT PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL
);

-- 5. Quotation Statuses
CREATE TABLE IF NOT EXISTS statuses (
    id TEXT PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    color TEXT NOT NULL
);

-- 6. Currencies
CREATE TABLE IF NOT EXISTS currencies (
    code TEXT PRIMARY KEY,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    symbol TEXT NOT NULL,
    is_default INTEGER DEFAULT 0
);

-- 7. Quotations Master Table
CREATE TABLE IF NOT EXISTS quotations (
    id TEXT PRIMARY KEY,
    quotation_no TEXT UNIQUE NOT NULL,
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    branch_id TEXT NOT NULL REFERENCES branches(id),
    client_name_ar TEXT NOT NULL,
    client_name_en TEXT NOT NULL,
    project_name_ar TEXT NOT NULL,
    project_name_en TEXT NOT NULL,
    project_type_id TEXT REFERENCES project_types(id),
    quotation_type_id TEXT REFERENCES quotation_types(id),
    amount REAL NOT NULL DEFAULT 0,
    vat_rate REAL NOT NULL DEFAULT 0.15,
    vat_amount REAL NOT NULL DEFAULT 0,
    total_amount REAL NOT NULL DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'SAR',
    status TEXT NOT NULL DEFAULT 'new' REFERENCES statuses(id),
    creation_date TEXT NOT NULL,
    valid_until TEXT,
    file_link TEXT,
    file_name TEXT,
    file_size TEXT,
    file_type TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. Revisions Table
CREATE TABLE IF NOT EXISTS revisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quotation_id TEXT NOT NULL REFERENCES quotations(id) ON DELETE CASCADE,
    revision_no INTEGER NOT NULL,
    date TEXT NOT NULL,
    uploaded_by TEXT NOT NULL,
    file_link TEXT,
    file_name TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    user_name TEXT NOT NULL,
    entity_id TEXT,
    details TEXT,
    before_val TEXT,
    after_val TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for ultra-fast dashboard queries & searching
CREATE INDEX IF NOT EXISTS idx_quotations_branch ON quotations(branch_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_quotations_type ON quotations(quotation_type_id);
CREATE INDEX IF NOT EXISTS idx_quotations_date ON quotations(creation_date);
CREATE INDEX IF NOT EXISTS idx_quotations_no ON quotations(quotation_no);
CREATE INDEX IF NOT EXISTS idx_revisions_quotation ON revisions(quotation_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
