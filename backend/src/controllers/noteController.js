import db from '../db/database.js';
import { validateCreateNote } from '../validators/noteValidator.js';

/**
 * GET /api/leads/:id/notes
 * Get all notes for a specific lead
 */
export const getNotesByLeadId = (req, res) => {
  try {
    const { id } = req.params;

    // 1. Verify that the parent lead exists
    const checkLeadStmt = db.prepare('SELECT id, name FROM leads WHERE id = ?');
    const lead = checkLeadStmt.get(id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: `Lead with ID ${id} not found`
      });
    }

    // 2. Fetch notes for this lead
    const notesStmt = db.prepare('SELECT * FROM notes WHERE leadId = ? ORDER BY createdAt DESC');
    const notes = notesStmt.all(id);

    res.status(200).json({
      success: true,
      leadId: Number(id),
      leadName: lead.name,
      count: notes.length,
      data: notes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve notes',
      error: error.message
    });
  }
};

/**
 * POST /api/leads/:id/notes
 * Create a new note for a specific lead
 */
export const createNote = (req, res) => {
  try {
    const { id } = req.params;

    // 1. Verify that the parent lead exists
    const checkLeadStmt = db.prepare('SELECT id, name FROM leads WHERE id = ?');
    const lead = checkLeadStmt.get(id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: `Cannot add note. Lead with ID ${id} does not exist.`
      });
    }

    // 2. Validate note content
    const { isValid, errors, sanitizedData } = validateCreateNote(req.body);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // 3. Insert the note
    const insertStmt = db.prepare(`
      INSERT INTO notes (leadId, content)
      VALUES (?, ?)
    `);

    const info = insertStmt.run(id, sanitizedData.content);

    const newNoteStmt = db.prepare('SELECT * FROM notes WHERE id = ?');
    const newNote = newNoteStmt.get(info.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Note added successfully',
      data: newNote
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create note',
      error: error.message
    });
  }
};
