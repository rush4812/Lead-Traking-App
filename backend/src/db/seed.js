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
    const firstNames = [
      'Rahul', 'Priya', 'Amit', 'Sneha', 'Rohan', 'Aisha', 'Vikram', 'Neha', 
      'Karan', 'Pooja', 'Arjun', 'Anjali', 'Dev', 'Kavya', 'Yash', 'Riya',
      'Kabir', 'Tara', 'Sahil', 'Meera', 'Samar', 'Nisha', 'Ravi', 'Simran'
    ];
    const lastNames = ['Patel', 'Shah', 'Mehta', 'Sharma', 'Singh', 'Verma', 'Gupta', 'Kumar', 'Deshmяк', 'Joshi'];
    const statuses = ['new', 'contacted', 'qualified', 'lost'];
    const notesContent = [
      'Initial inbound inquiry received from website contact form.',
      'Discussed enterprise plan features.',
      'Sent product demo video and pricing breakdown via email.',
      'Budget approved by CFO. Technical review meeting scheduled.',
      'Client decided to renew with existing vendor.',
      'Left a voicemail, waiting for callback.',
      'Requested more time to review the proposal.',
      'Interested in a customized plan, setting up a meeting with sales engineer.',
      'Unreachable, will try again next week.',
      'Competitor offered a lower price, evaluating options.'
    ];

    for (let i = 0; i < 20; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const fullName = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`;
      const phone = `9${Math.floor(100000000 + Math.random() * 900000000)}`;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
      const hour = String(Math.floor(Math.random() * 12) + 8).padStart(2, '0');
      const minute = String(Math.floor(Math.random() * 60)).padStart(2, '0');
      const createdAt = `2026-08-${day} ${hour}:${minute}:00`;

      const lead = insertLead.run(fullName, email, phone, status, createdAt);

      // Add 1-3 random notes per lead
      const numNotes = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < numNotes; j++) {
        const noteText = notesContent[Math.floor(Math.random() * notesContent.length)];
        const noteHour = String(Math.floor(Math.random() * 12) + 8).padStart(2, '0');
        const noteCreatedAt = `2026-08-${day} ${noteHour}:${minute}:00`;
        insertNote.run(lead.lastInsertRowid, noteText, noteCreatedAt);
      }
    }
  });

  seedTransaction();

  console.log(' Database seeded successfully with sample leads and notes.');
};

// Execute seed if run directly
seedDatabase();
