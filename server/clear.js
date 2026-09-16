const { db } = require('./db');

function clearDatabase() {
  console.log('Clearing all quotation, revision, and contract records from database...');

  db.exec('DELETE FROM revisions;');
  db.exec('DELETE FROM quotations;');
  db.exec('DELETE FROM contracts;');

  db.prepare(`
    INSERT INTO audit_logs (action, user_name, entity_id, details)
    VALUES (?, ?, ?, ?)
  `).run(
    'Database Cleared',
    'Administrator',
    'SYSTEM',
    'All quotation, revision, and contract records cleared for fresh production start.'
  );

  const quotCount = db.prepare('SELECT COUNT(*) as c FROM quotations').get().c;
  const revCount = db.prepare('SELECT COUNT(*) as c FROM revisions').get().c;
  const contractCount = db.prepare('SELECT COUNT(*) as c FROM contracts').get().c;
  const branchCount = db.prepare('SELECT COUNT(*) as c FROM branches').get().c;
  const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get().c;

  console.log(`Finished clearing records:`);
  console.log(`- Quotations: ${quotCount}`);
  console.log(`- Revisions: ${revCount}`);
  console.log(`- Contracts: ${contractCount}`);
  console.log(`- Branches (Preserved): ${branchCount}`);
  console.log(`- Users (Preserved): ${userCount}`);
}

if (require.main === module) {
  clearDatabase();
}

module.exports = { clearDatabase };
