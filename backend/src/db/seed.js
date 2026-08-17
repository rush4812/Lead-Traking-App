import db, { initDatabase } from './database.js';

const seedDatabase = () => {
  console.log(' Starting database seeding...');

  // Ensure tables exist
  initDatabase();

  // Clean existing records to allow repeatable seeding
  db.exec(`
    DELETE FROM notes;
    DELETE FROM leads;
    DELETE FROM sqlite_sequence WHERE name IN ('leads', 'notes');
  `);

  console.log(' Cleared existing records.');

  // Prepared insert statements
  const insertLead = db.prepare(`
    INSERT INTO leads (name, email, phone, status, createdAt)
    VALUES (?, ?, ?, ?, ?)
  `);

  const insertNote = db.prepare(`
    INSERT INTO notes (leadId, content, createdAt)
    VALUES (?, ?, ?)
  `);

  // Transaction for atomic and fast insertion
  const seedTransaction = db.transaction(() => {
    // 1. Rahul Patel
    const lead1 = insertLead.run(
      'Rahul Patel',
      'rahul@gmail.com',
      '9876543210',
      'new',
      '2026-08-10 10:30:00'
    );
    insertNote.run(
      lead1.lastInsertRowid,
      'Initial inbound inquiry received from website contact form.',
      '2026-08-10 10:35:00'
    );

    // 2. Priya Shah
    const lead2 = insertLead.run(
      'Priya Shah',
      'priya@gmail.com',
      '9812345678',
      'contacted',
      '2026-08-12 14:00:00'
    );
    insertNote.run(
      lead2.lastInsertRowid,
      'Called Priya on Monday. Discussed enterprise plan features.',
      '2026-08-12 14:15:00'
    );
    insertNote.run(
      lead2.lastInsertRowid,
      'Sent product demo video and pricing breakdown via email.',
      '2026-08-13 11:20:00'
    );

    // 3. Amit Mehta
    const lead3 = insertLead.run(
      'Amit Mehta',
      'amit@gmail.com',
      '9765432109',
      'qualified',
      '2026-08-14 09:15:00'
    );
    insertNote.run(
      lead3.lastInsertRowid,
      'Budget approved by CFO. Technical review meeting scheduled for Friday.',
      '2026-08-14 16:45:00'
    );

    // 4. Sneha Sharma
    const lead4 = insertLead.run(
      'Sneha Sharma',
      'sneha@gmail.com',
      '9654321987',
      'lost',
      '2026-08-15 16:00:00'
    );
    insertNote.run(
      lead4.lastInsertRowid,
      'Client decided to renew with existing vendor for another quarter due to timeline constraints.',
      '2026-08-15 17:30:00'
    );
  });

  seedTransaction();

  console.log(' Database seeded successfully with sample leads and notes.');
};

// Execute seed if run directly
seedDatabase();
