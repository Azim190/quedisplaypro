const express = require('express');
const cors = require('cors');
const path = require('path');
const { db, initSchema } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for frontend flexibility
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Disable caching for frontend files during development
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  next();
});

// Serve static frontend files from workspace root
const ROOT_DIR = path.resolve(__dirname, '..');
app.use(express.static(ROOT_DIR));

// Ensure schema is initialized
initSchema();

// -------------------------------------------------------------
// Helpers
// -------------------------------------------------------------
function addAuditLog(action, userName, entityId, details, beforeVal, afterVal) {
  try {
    const stmt = db.prepare(`
      INSERT INTO audit_logs (action, user_name, entity_id, details, before_val, after_val)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      action,
      userName || 'System',
      entityId || '',
      details || '',
      beforeVal ? JSON.stringify(beforeVal).slice(0, 100) : '-',
      afterVal ? JSON.stringify(afterVal).slice(0, 100) : '-'
    );
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
  }
}

function getRevisionsForQuotation(quotationId) {
  const stmt = db.prepare(`
    SELECT id, revision_no as revisionNo, date, uploaded_by as uploadedBy,
           file_link as fileLink, file_name as fileName, notes
    FROM revisions
    WHERE quotation_id = ?
    ORDER BY revision_no ASC
  `);
  return stmt.all(quotationId);
}

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// Health Check
app.get('/api/health', (req, res) => {
  const count = db.prepare('SELECT COUNT(*) as c FROM quotations').get().c;
  res.json({
    status: 'ok',
    database: 'SQLite (node:sqlite native)',
    totalQuotations: count,
    serverTime: new Date().toISOString()
  });
});

// Authentication
app.post('/api/auth/login', (req, res) => {
  const { nationalId, password } = req.body;
  if (!nationalId || !password) {
    return res.status(400).json({ error: 'National ID and password are required' });
  }

  const user = db.prepare(`
    SELECT id, national_id as nationalId, name_ar as nameAr, name_en as nameEn,
           role, title_ar as titleAr, title_en as titleEn, email, active
    FROM users
    WHERE (national_id = ? OR national_id = ?) AND password = ? AND active = 1
  `).get(nationalId.trim(), nationalId.trim(), password.trim());

  if (!user) {
    return res.status(401).json({ error: 'Invalid National ID or password' });
  }

  addAuditLog('User Login', user.nameEn, user.id, `User logged in: ${user.nameEn}`, null, user.role);

  res.json({
    user: {
      ...user,
      loginTime: new Date().toISOString()
    }
  });
});

// Quotations List (with filtering, search, sorting)
app.get('/api/quotations', (req, res) => {
  try {
    const { branch, status, type, dateFilter, query, sort } = req.query;

    let sql = `
      SELECT q.id, q.quotation_no as quotationNo, q.title_ar as titleAr, q.title_en as titleEn,
             q.branch_id as branchId, q.client_name_ar as clientNameAr, q.client_name_en as clientNameEn,
             q.project_name_ar as projectNameAr, q.project_name_en as projectNameEn,
             q.project_type_id as projectTypeId, q.quotation_type_id as quotationTypeId,
             q.amount, q.vat_rate as vatRate, q.vat_amount as vatAmount, q.total_amount as totalAmount,
             q.currency, q.status, q.creation_date as creationDate, q.valid_until as validUntil,
             q.file_link as fileLink, q.file_name as fileName, q.file_size as fileSize, q.file_type as fileType,
             q.notes, q.created_at as createdAt,
             b.name_ar as branchNameAr, b.name_en as branchNameEn
      FROM quotations q
      LEFT JOIN branches b ON q.branch_id = b.id
      WHERE 1=1
    `;
    const params = [];

    // Filter: Branch
    if (branch && branch !== 'all') {
      sql += ` AND q.branch_id = ?`;
      params.push(branch);
    }

    // Filter: Status
    if (status && status !== 'all') {
      sql += ` AND q.status = ?`;
      params.push(status);
    }

    // Filter: Type
    if (type && type !== 'all') {
      sql += ` AND q.quotation_type_id = ?`;
      params.push(type);
    }

    // Filter: Search Query
    if (query && query.trim()) {
      const q = `%${query.trim()}%`;
      sql += ` AND (
        q.quotation_no LIKE ? OR
        q.title_ar LIKE ? OR
        q.title_en LIKE ? OR
        q.client_name_ar LIKE ? OR
        q.client_name_en LIKE ? OR
        q.project_name_ar LIKE ? OR
        q.project_name_en LIKE ?
      )`;
      params.push(q, q, q, q, q, q, q);
    }

    // Sorting
    if (sort === 'highest') {
      sql += ` ORDER BY q.total_amount DESC`;
    } else if (sort === 'lowest') {
      sql += ` ORDER BY q.total_amount ASC`;
    } else if (sort === 'oldest') {
      sql += ` ORDER BY q.creation_date ASC`;
    } else {
      // Default: newest
      sql += ` ORDER BY q.creation_date DESC, q.created_at DESC`;
    }

    const rows = db.prepare(sql).all(...params);

    // Filter dates in JS for timezone consistency
    let filtered = rows;
    if (dateFilter && dateFilter !== 'all') {
      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth();

      filtered = rows.filter(item => {
        const itemDate = new Date(item.creationDate);
        if (dateFilter === 'today') {
          return itemDate.toDateString() === today.toDateString();
        } else if (dateFilter === 'this_week') {
          const firstDayOfWeek = new Date(today);
          firstDayOfWeek.setDate(today.getDate() - today.getDay());
          return itemDate >= firstDayOfWeek;
        } else if (dateFilter === 'this_month') {
          return itemDate.getFullYear() === currentYear && itemDate.getMonth() === currentMonth;
        } else if (dateFilter === 'this_year') {
          return itemDate.getFullYear() === currentYear;
        }
        return true;
      });
    }

    // Attach revisions and file metadata format matching store.js
    const quotations = filtered.map(row => {
      const revs = getRevisionsForQuotation(row.id);
      return {
        ...row,
        file: {
          name: row.fileName || `DMC_${row.quotationNo}.pdf`,
          size: row.fileSize || '1.2 MB',
          type: row.fileType || 'application/pdf',
          fileLink: row.fileLink || ''
        },
        revisions: revs
      };
    });

    res.json({
      quotations,
      total: quotations.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Single Quotation
app.get('/api/quotations/:id', (req, res) => {
  try {
    const row = db.prepare(`
      SELECT q.id, q.quotation_no as quotationNo, q.title_ar as titleAr, q.title_en as titleEn,
             q.branch_id as branchId, q.client_name_ar as clientNameAr, q.client_name_en as clientNameEn,
             q.project_name_ar as projectNameAr, q.project_name_en as projectNameEn,
             q.project_type_id as projectTypeId, q.quotation_type_id as quotationTypeId,
             q.amount, q.vat_rate as vatRate, q.vat_amount as vatAmount, q.total_amount as totalAmount,
             q.currency, q.status, q.creation_date as creationDate, q.valid_until as validUntil,
             q.file_link as fileLink, q.file_name as fileName, q.file_size as fileSize, q.file_type as fileType,
             q.notes, q.created_at as createdAt,
             b.name_ar as branchNameAr, b.name_en as branchNameEn
      FROM quotations q
      LEFT JOIN branches b ON q.branch_id = b.id
      WHERE q.id = ?
    `).get(req.params.id);

    if (!row) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    const revisions = getRevisionsForQuotation(row.id);

    res.json({
      ...row,
      file: {
        name: row.fileName || `DMC_${row.quotationNo}.pdf`,
        size: row.fileSize || '1.2 MB',
        type: row.fileType || 'application/pdf',
        fileLink: row.fileLink || ''
      },
      revisions
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create Quotation
app.post('/api/quotations', (req, res) => {
  try {
    const data = req.body;
    const amount = Number(data.amount) || 0;
    const vatRate = 0.15;
    const vatAmount = Math.round(amount * vatRate);
    const totalAmount = amount + vatAmount;

    const count = db.prepare('SELECT COUNT(*) as c FROM quotations').get().c;
    const currentYear = new Date().getFullYear();
    const quotationNo = data.quotationNo || `Q-${currentYear}-${String(count + 1).padStart(4, '0')}`;
    const id = data.id || 'q_' + Date.now();

    const stmt = db.prepare(`
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

    stmt.run(
      id,
      quotationNo,
      data.titleAr || data.titleEn || 'عرض سعر جديد',
      data.titleEn || data.titleAr || 'New Quotation',
      data.branchId || 'b_1',
      data.clientNameAr || data.clientNameEn || '',
      data.clientNameEn || data.clientNameAr || '',
      data.projectNameAr || data.projectNameEn || '',
      data.projectNameEn || data.projectNameAr || '',
      data.projectTypeId || 'pt_res_bld',
      data.quotationTypeId || 'qt_supervision',
      amount,
      vatRate,
      vatAmount,
      totalAmount,
      data.currency || 'SAR',
      data.status || 'new',
      data.creationDate || new Date().toISOString().slice(0, 10),
      data.validUntil || new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10),
      data.fileLink || (data.file && data.file.fileLink) || '',
      data.fileName || (data.file && data.file.name) || `DMC_${quotationNo}.pdf`,
      data.fileSize || '1.2 MB',
      'application/pdf',
      data.notes || ''
    );

    addAuditLog('Quotation Created', data.userName || 'User', id, `Created quotation ${quotationNo}`, null, data.status || 'new');

    res.status(201).json({
      id,
      quotationNo,
      amount,
      vatAmount,
      totalAmount,
      status: data.status || 'new'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Quotation
app.put('/api/quotations/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT * FROM quotations WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    const data = req.body;
    let amount = existing.amount;
    let vatAmount = existing.vat_amount;
    let totalAmount = existing.total_amount;

    if (data.amount !== undefined) {
      amount = Number(data.amount) || 0;
      vatAmount = Math.round(amount * 0.15);
      totalAmount = amount + vatAmount;
    }

    const stmt = db.prepare(`
      UPDATE quotations SET
        title_ar = COALESCE(?, title_ar),
        title_en = COALESCE(?, title_en),
        branch_id = COALESCE(?, branch_id),
        client_name_ar = COALESCE(?, client_name_ar),
        client_name_en = COALESCE(?, client_name_en),
        project_name_ar = COALESCE(?, project_name_ar),
        project_name_en = COALESCE(?, project_name_en),
        project_type_id = COALESCE(?, project_type_id),
        quotation_type_id = COALESCE(?, quotation_type_id),
        amount = ?,
        vat_amount = ?,
        total_amount = ?,
        currency = COALESCE(?, currency),
        status = COALESCE(?, status),
        creation_date = COALESCE(?, creation_date),
        valid_until = COALESCE(?, valid_until),
        file_link = COALESCE(?, file_link),
        file_name = COALESCE(?, file_name),
        notes = COALESCE(?, notes),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    stmt.run(
      data.titleAr,
      data.titleEn,
      data.branchId,
      data.clientNameAr,
      data.clientNameEn,
      data.projectNameAr,
      data.projectNameEn,
      data.projectTypeId,
      data.quotationTypeId,
      amount,
      vatAmount,
      totalAmount,
      data.currency,
      data.status,
      data.creationDate,
      data.validUntil,
      data.fileLink !== undefined ? data.fileLink : (data.file && (data.file.fileLink || data.file.link)) || null,
      data.fileName !== undefined ? data.fileName : (data.file && data.file.name) || null,
      data.notes,
      id
    );

    addAuditLog('Quotation Edited', data.userName || 'User', id, `Updated fields on ${existing.quotation_no}`, existing.total_amount, totalAmount);

    res.json({ message: 'Quotation updated successfully', id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update Status
app.patch('/api/quotations/:id/status', (req, res) => {
  try {
    const { id } = req.params;
    const { status, userName } = req.body;
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const existing = db.prepare('SELECT status, quotation_no FROM quotations WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    db.prepare('UPDATE quotations SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(status, id);

    addAuditLog('Status Changed', userName || 'User', id, `Status changed from ${existing.status} to ${status}`, existing.status, status);

    res.json({ message: 'Status updated', id, status });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Revision
app.post('/api/quotations/:id/revisions', (req, res) => {
  try {
    const { id } = req.params;
    const { fileLink, fileName, notes, userName } = req.body;

    const existing = db.prepare('SELECT quotation_no FROM quotations WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    const revCount = db.prepare('SELECT COUNT(*) as c FROM revisions WHERE quotation_id = ?').get(id).c;
    const revisionNo = revCount + 1;
    const todayStr = new Date().toISOString().slice(0, 10);

    const stmt = db.prepare(`
      INSERT INTO revisions (quotation_id, revision_no, date, uploaded_by, file_link, file_name, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      revisionNo,
      todayStr,
      userName || 'User',
      fileLink || '',
      fileName || `${existing.quotation_no}_Rev${revisionNo}.pdf`,
      notes || ''
    );

    // Update status to revised
    db.prepare("UPDATE quotations SET status = 'revised', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(id);

    addAuditLog('Revision Uploaded', userName || 'User', id, `Uploaded revision #${revisionNo} for ${existing.quotation_no}`, null, `Rev ${revisionNo}`);

    res.status(201).json({ message: 'Revision added', revisionNo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Quotation
app.delete('/api/quotations/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT quotation_no, status FROM quotations WHERE id = ?').get(id);
    if (!existing) {
      return res.status(404).json({ error: 'Quotation not found' });
    }

    db.prepare('DELETE FROM revisions WHERE quotation_id = ?').run(id);
    db.prepare('DELETE FROM quotations WHERE id = ?').run(id);

    addAuditLog('Quotation Deleted', req.body.userName || 'User', id, `Deleted quotation ${existing.quotation_no}`, existing.status, 'DELETED');

    res.json({ message: 'Quotation deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dashboard Analytics & KPI Counters
app.get('/api/dashboard/stats', (req, res) => {
  try {
    const totalQuotations = db.prepare('SELECT COUNT(*) as c FROM quotations').get().c;
    const sums = db.prepare(`
      SELECT SUM(amount) as netTotal, SUM(vat_amount) as vatTotal, SUM(total_amount) as totalValue
      FROM quotations
    `).get();

    const approvedSum = db.prepare(`
      SELECT SUM(total_amount) as v FROM quotations WHERE status = 'approved'
    `).get().v || 0;

    const statusCounts = db.prepare(`
      SELECT status, COUNT(*) as count FROM quotations GROUP BY status
    `).all();

    const branchCounts = db.prepare(`
      SELECT b.id, b.name_ar as nameAr, b.name_en as nameEn, COUNT(q.id) as count
      FROM branches b
      LEFT JOIN quotations q ON b.id = q.branch_id
      GROUP BY b.id
    `).all();

    const typeCounts = db.prepare(`
      SELECT qt.id, qt.name_ar as nameAr, qt.name_en as nameEn, COUNT(q.id) as count
      FROM quotation_types qt
      LEFT JOIN quotations q ON qt.id = q.quotation_type_id
      GROUP BY qt.id
    `).all();

    const topQuotation = db.prepare(`
      SELECT id, quotation_no as quotationNo, title_ar as titleAr, title_en as titleEn,
             client_name_ar as clientNameAr, client_name_en as clientNameEn,
             total_amount as totalAmount, currency
      FROM quotations
      ORDER BY total_amount DESC
      LIMIT 1
    `).get();

    res.json({
      totalQuotations,
      totalValue: sums.totalValue || 0,
      vatTotal: sums.vatTotal || 0,
      netTotal: sums.netTotal || 0,
      approvedValue: approvedSum,
      statusCounts,
      branchCounts,
      typeCounts,
      topQuotation
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Entity Configurations (Branches, Types, Statuses, Audit)
app.get('/api/branches', (req, res) => {
  const branches = db.prepare('SELECT id, code, name_ar as nameAr, name_en as nameEn, active FROM branches').all();
  res.json(branches);
});

app.post('/api/branches', (req, res) => {
  const { id, code, nameAr, nameEn, active } = req.body;
  db.prepare(`
    INSERT OR REPLACE INTO branches (id, code, name_ar, name_en, active)
    VALUES (?, ?, ?, ?, ?)
  `).run(id || 'b_' + Date.now(), code, nameAr, nameEn, active ? 1 : 0);
  res.json({ message: 'Branch saved' });
});

app.get('/api/quotation-types', (req, res) => {
  const types = db.prepare('SELECT id, key, name_ar as nameAr, name_en as nameEn, active FROM quotation_types').all();
  res.json(types);
});

app.get('/api/project-types', (req, res) => {
  const types = db.prepare('SELECT id, key, name_ar as nameAr, name_en as nameEn FROM project_types').all();
  res.json(types);
});

app.get('/api/statuses', (req, res) => {
  const statuses = db.prepare('SELECT id, key, name_ar as nameAr, name_en as nameEn, color FROM statuses').all();
  res.json(statuses);
});

app.get('/api/currencies', (req, res) => {
  const currencies = db.prepare('SELECT code, name_ar as nameAr, name_en as nameEn, symbol, is_default as isDefault FROM currencies').all();
  res.json(currencies);
});

app.get('/api/audit-logs', (req, res) => {
  const logs = db.prepare(`
    SELECT id, action, user_name as userName, entity_id as entityId,
           details, before_val as before, after_val as after, created_at as date
    FROM audit_logs
    ORDER BY id DESC
    LIMIT 100
  `).all();
  res.json(logs);
});

// Users Management Endpoints
app.get('/api/users', (req, res) => {
  const users = db.prepare(`
    SELECT id, national_id as nationalId, name_ar as nameAr, name_en as nameEn,
           role, title_ar as titleAr, title_en as titleEn, email, active
    FROM users
  `).all();
  res.json(users);
});

app.post('/api/users', (req, res) => {
  try {
    const { id, nationalId, password, nameAr, nameEn, role, titleAr, titleEn, email, active } = req.body;
    const userId = id || 'u_' + Date.now();
    const existing = db.prepare('SELECT * FROM users WHERE id = ? OR national_id = ?').get(userId, nationalId);

    const userPass = password && password.trim() ? password.trim() : (existing ? existing.password : 'user123');

    db.prepare(`
      INSERT OR REPLACE INTO users (id, national_id, password, name_ar, name_en, role, title_ar, title_en, email, active)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      nationalId,
      userPass,
      nameAr || '',
      nameEn || '',
      role || 'user',
      titleAr || '',
      titleEn || '',
      email || `${nationalId}@dmc-consulting.sa`,
      active !== undefined ? (active ? 1 : 0) : 1
    );

    addAuditLog(existing ? 'User Updated' : 'User Created', 'Admin', userId, `User ${nameEn || nameAr} saved.`);
    res.json({ message: 'User saved successfully', id: userId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.prepare('SELECT id, name_en, name_ar FROM users WHERE id = ? OR national_id = ?').get(id, id);
    if (!existing) {
      return res.status(404).json({ error: 'User not found' });
    }

    db.prepare('DELETE FROM users WHERE id = ? OR national_id = ?').run(id, id);
    addAuditLog('User Deleted', 'Admin', existing.id, `Deleted user ${existing.name_en || existing.name_ar}`);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`DMC Quotation Archiving Server is running on http://localhost:${PORT}`);
  console.log(`SQLite database connected at: ${path.join(__dirname, 'data', 'dmc_database.sqlite')}`);
});
