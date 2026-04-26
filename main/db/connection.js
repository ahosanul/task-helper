const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

let db = null;

function getDatabase() {
  if (!db) {
    const dbPath = path.join(process.env.APP_DATA || process.cwd(), 'flowdesk.db');
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    
    // Run migrations
    runMigrations(db);
  }
  return db;
}

function runMigrations(database) {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  database.exec(schema);
}

function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = {
  getDatabase,
  closeDatabase
};
