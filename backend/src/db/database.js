import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path: backend/src/db/leads.db
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'leads.db');

// Initialize database connection
const db = new Database(DB_PATH);

// Enable SQLite Foreign Key support & WAL (Write-Ahead Logging) mode for performance
db.pragma('foreign_keys = ON');
db.pragma('journal_mode = WAL');

// Initialize Database Schema
export const initDatabase = () => {
  // 1. Leads Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'contacted', 'qualified', 'lost')),
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Notes Table (with Foreign Key ON DELETE CASCADE)
  db.exec(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      leadId INTEGER NOT NULL,
      content TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (leadId) REFERENCES leads(id) ON DELETE CASCADE
    );
  `);

  // 3. Create Indexes for fast lookup & filtering
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
    CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
    CREATE INDEX IF NOT EXISTS idx_notes_leadId ON notes(leadId);
  `);

  console.log(' SQLite Database initialized successfully with tables: leads, notes');
};

// Run schema initialization immediately on load
initDatabase();

export default db;
