import app from './src/app.js';
import db from './src/db/database.js';

const PORT = 5099;
let server;

// Helper to format assertions
const assert = (condition, testName) => {
  if (condition) {
    console.log(`  PASS: ${testName}`);
  } else {
    console.error(`❌ FAIL: ${testName}`);
    process.exitCode = 1;
  }
};

const runApiTests = async () => {
  console.log('\n--- 🧪 STARTING COMPREHENSIVE BACKEND API AUDIT --- \n');

  // Start temporary server for testing
  server = app.listen(PORT);
  const baseUrl = `http://localhost:${PORT}/api`;

  try {
    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.success === true, '1. GET /api/health returns 200 OK');

    // 2. GET all leads
    const allLeadsRes = await fetch(`${baseUrl}/leads`);
    const allLeads = await allLeadsRes.json();
    assert(allLeadsRes.status === 200 && allLeads.data.length >= 4, '2. GET /api/leads returns all seeded leads');

    // 3. Search leads by name
    const searchNameRes = await fetch(`${baseUrl}/leads?search=rahul`);
    const searchNameData = await searchNameRes.json();
    assert(
      searchNameRes.status === 200 && searchNameData.data.some(l => l.name.includes('Rahul')),
      '3. GET /api/leads?search=rahul matches by name'
    );

    // 4. Search leads by email
    const searchEmailRes = await fetch(`${baseUrl}/leads?search=priya@gmail.com`);
    const searchEmailData = await searchEmailRes.json();
    assert(
      searchEmailRes.status === 200 && searchEmailData.data[0].email === 'priya@gmail.com',
      '4. GET /api/leads?search=priya@gmail.com matches by email'
    );

    // 5. Filter leads by status
    const filterStatusRes = await fetch(`${baseUrl}/leads?status=qualified`);
    const filterStatusData = await filterStatusRes.json();
    assert(
      filterStatusRes.status === 200 && filterStatusData.data.every(l => l.status === 'qualified'),
      '5. GET /api/leads?status=qualified returns only qualified leads'
    );

    // 6. Create valid lead
    const newLeadPayload = {
      name: 'Vikram Malhotra',
      email: 'vikram@enterprise.io',
      phone: '9123456780',
      status: 'new'
    };
    const createRes = await fetch(`${baseUrl}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLeadPayload)
    });
    const createData = await createRes.json();
    assert(
      createRes.status === 201 && createData.data.id && createData.data.name === 'Vikram Malhotra',
      '6. POST /api/leads creates lead and returns 201 Created'
    );
    const createdLeadId = createData.data.id;

    // 7. Validation: Invalid email format
    const invalidEmailRes = await fetch(`${baseUrl}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Bad Email User',
        email: 'invalid-email-string',
        phone: '1234567890'
      })
    });
    const invalidEmailData = await invalidEmailRes.json();
    assert(
      invalidEmailRes.status === 400 && invalidEmailData.success === false,
      '7. POST /api/leads rejects invalid email with 400 Bad Request'
    );

    // 8. Validation: Missing required name field
    const missingNameRes = await fetch(`${baseUrl}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: '   ',
        email: 'test@example.com',
        phone: '1234567890'
      })
    });
    assert(missingNameRes.status === 400, '8. POST /api/leads rejects empty name with 400 Bad Request');

    // 9. Validation: Invalid status
    const invalidStatusRes = await fetch(`${baseUrl}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Status',
        email: 'status@example.com',
        phone: '1234567890',
        status: 'unsupported_status'
      })
    });
    assert(invalidStatusRes.status === 400, '9. POST /api/leads rejects invalid status with 400 Bad Request');

    // 10. GET single lead
    const getSingleRes = await fetch(`${baseUrl}/leads/${createdLeadId}`);
    const getSingleData = await getSingleRes.json();
    assert(
      getSingleRes.status === 200 && getSingleData.data.id === createdLeadId,
      '10. GET /api/leads/:id returns single lead with notes array'
    );

    // 11. GET non-existent lead (404)
    const get404Res = await fetch(`${baseUrl}/leads/999999`);
    assert(get404Res.status === 404, '11. GET /api/leads/999999 returns 404 Not Found');

    // 12. PATCH lead (Partial update)
    const patchRes = await fetch(`${baseUrl}/leads/${createdLeadId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'contacted' })
    });
    const patchData = await patchRes.json();
    assert(
      patchRes.status === 200 && patchData.data.status === 'contacted',
      '12. PATCH /api/leads/:id updates status to contacted and returns 200 OK'
    );

    // 13. Add note to lead
    const addNoteRes = await fetch(`${baseUrl}/leads/${createdLeadId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Product demo presented to VP of Engineering.' })
    });
    const addNoteData = await addNoteRes.json();
    assert(
      addNoteRes.status === 201 && addNoteData.data.leadId === createdLeadId,
      '13. POST /api/leads/:id/notes adds note and returns 201 Created'
    );

    // 14. Validation: Empty note rejected
    const emptyNoteRes = await fetch(`${baseUrl}/leads/${createdLeadId}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: '   ' })
    });
    assert(emptyNoteRes.status === 400, '14. POST /api/leads/:id/notes rejects empty content with 400 Bad Request');

    // 15. Add note to non-existent lead (404)
    const note404Res = await fetch(`${baseUrl}/leads/999999/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Orphan note test' })
    });
    assert(note404Res.status === 404, '15. POST /api/leads/999999/notes returns 404 Not Found');

    // 16. GET notes for lead
    const getNotesRes = await fetch(`${baseUrl}/leads/${createdLeadId}/notes`);
    const getNotesData = await getNotesRes.json();
    assert(
      getNotesRes.status === 200 && getNotesData.data.length === 1,
      '16. GET /api/leads/:id/notes returns all notes for the lead'
    );

    // 17. DELETE lead (and cascade notes)
    const deleteRes = await fetch(`${baseUrl}/leads/${createdLeadId}`, {
      method: 'DELETE'
    });
    assert(deleteRes.status === 200, '17. DELETE /api/leads/:id deletes lead and returns 200 OK');

    // Verify notes are also cascade deleted
    const notesCheckStmt = db.prepare('SELECT COUNT(*) as count FROM notes WHERE leadId = ?');
    const remainingNotes = notesCheckStmt.get(createdLeadId);
    assert(remainingNotes.count === 0, '18. SQLite ON DELETE CASCADE automatically removed notes for deleted lead');

    // 19. DELETE non-existent lead (404)
    const delete404Res = await fetch(`${baseUrl}/leads/${createdLeadId}`, {
      method: 'DELETE'
    });
    assert(delete404Res.status === 404, '19. DELETE /api/leads/:id on deleted record returns 404 Not Found');

    console.log('\n ALL 19 BACKEND API TESTS PASSED SUCCESSFULLY! \n');
  } catch (err) {
    console.error('Test execution error:', err);
    process.exitCode = 1;
  } finally {
    if (server) {
      server.close();
    }
  }
};

runApiTests();
