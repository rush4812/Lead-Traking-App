import { Router } from 'express';
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead
} from '../controllers/leadController.js';
import {
  getNotesByLeadId,
  createNote
} from '../controllers/noteController.js';

const router = Router();

// ==========================================
// LEADS CRUD ENDPOINTS
// ==========================================

// 1. GET /api/leads (with ?search= & ?status= support)
router.get('/', getLeads);

// 2. POST /api/leads (Create new lead)
router.post('/', createLead);

// 3. GET /api/leads/:id (Get single lead + notes)
router.get('/:id', getLeadById);

// 4. PATCH /api/leads/:id (Partial update lead)
router.patch('/:id', updateLead);

// 5. DELETE /api/leads/:id (Delete lead + cascade notes)
router.delete('/:id', deleteLead);


// ==========================================
// NESTED NOTES ENDPOINTS
// ==========================================

// 6. GET /api/leads/:id/notes (Get all notes for a lead)
router.get('/:id/notes', getNotesByLeadId);

// 7. POST /api/leads/:id/notes (Add note to a lead)
router.post('/:id/notes', createNote);

export default router;
