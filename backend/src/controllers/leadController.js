import db from '../db/database.js';
import { validateCreateLead, validateUpdateLead } from '../validators/leadValidator.js';

/**
 * GET /api/leads
 * Get all leads with optional ?search= & ?status= query filters
 */
export const getLeads = (req, res) => {
  try {
    const { search, status } = req.query;

    let query = `
      SELECT 
        l.id, 
        l.name, 
        l.email, 
        l.phone, 
        l.status, 
        l.createdAt,
        COUNT(n.id) as notesCount
      FROM leads l
      LEFT JOIN notes n ON l.id = n.leadId
    `;

    const conditions = [];
    const params = [];

    // Filter by search query (matches name OR email)
    if (search && search.trim() !== '') {
      conditions.push('(l.name LIKE ? OR l.email LIKE ?)');
      params.push(`%${search.trim()}%`, `%${search.trim()}%`);
    }

    // Filter by status (new, contacted, qualified, lost)
    if (status && status.trim() !== '' && status !== 'all') {
      conditions.push('l.status = ?');
      params.push(status.trim());
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ' GROUP BY l.id ORDER BY l.createdAt DESC';

    const stmt = db.prepare(query);
    const leads = stmt.all(...params);

    res.status(200).json({
      success: true,
      count: leads.length,
      data: leads
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve leads',
      error: error.message
    });
  }
};

/**
 * GET /api/leads/:id
 * Get single lead by ID with all associated notes
 */
export const getLeadById = (req, res) => {
  try {
    const { id } = req.params;

    const leadStmt = db.prepare('SELECT * FROM leads WHERE id = ?');
    const lead = leadStmt.get(id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: `Lead with ID ${id} not found`
      });
    }

    // Retrieve associated notes
    const notesStmt = db.prepare('SELECT * FROM notes WHERE leadId = ? ORDER BY createdAt DESC');
    const notes = notesStmt.all(id);

    res.status(200).json({
      success: true,
      data: {
        ...lead,
        notes
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve lead details',
      error: error.message
    });
  }
};

/**
 * POST /api/leads
 * Create a new lead
 */
export const createLead = (req, res) => {
  try {
    const { isValid, errors, sanitizedData } = validateCreateLead(req.body);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    const { name, email, phone, status } = sanitizedData;

    const insertStmt = db.prepare(`
      INSERT INTO leads (name, email, phone, status)
      VALUES (?, ?, ?, ?)
    `);

    const info = insertStmt.run(name, email, phone, status);

    const newLeadStmt = db.prepare('SELECT * FROM leads WHERE id = ?');
    const newLead = newLeadStmt.get(info.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: newLead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create lead',
      error: error.message
    });
  }
};

/**
 * PATCH /api/leads/:id
 * Partial update for a lead
 */
export const updateLead = (req, res) => {
  try {
    const { id } = req.params;

    // Check if lead exists
    const checkStmt = db.prepare('SELECT * FROM leads WHERE id = ?');
    const existingLead = checkStmt.get(id);

    if (!existingLead) {
      return res.status(404).json({
        success: false,
        message: `Lead with ID ${id} not found`
      });
    }

    // Validate update fields
    const { isValid, errors, sanitizedData } = validateUpdateLead(req.body);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    const setClauses = [];
    const params = [];

    for (const [key, value] of Object.entries(sanitizedData)) {
      setClauses.push(`${key} = ?`);
      params.push(value);
    }

    if (setClauses.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update'
      });
    }

    params.push(id);
    const updateStmt = db.prepare(`UPDATE leads SET ${setClauses.join(', ')} WHERE id = ?`);
    updateStmt.run(...params);

    const updatedLead = checkStmt.get(id);

    res.status(200).json({
      success: true,
      message: 'Lead updated successfully',
      data: updatedLead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update lead',
      error: error.message
    });
  }
};

/**
 * DELETE /api/leads/:id
 * Delete a lead (and cascade delete its notes)
 */
export const deleteLead = (req, res) => {
  try {
    const { id } = req.params;

    const checkStmt = db.prepare('SELECT * FROM leads WHERE id = ?');
    const lead = checkStmt.get(id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: `Lead with ID ${id} not found`
      });
    }

    const deleteStmt = db.prepare('DELETE FROM leads WHERE id = ?');
    deleteStmt.run(id);

    res.status(200).json({
      success: true,
      message: `Lead '${lead.name}' (ID: ${id}) and associated notes deleted successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete lead',
      error: error.message
    });
  }
};
