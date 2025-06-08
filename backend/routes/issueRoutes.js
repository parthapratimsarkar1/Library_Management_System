import express from 'express';
import { 
  issueBook, 
  returnBook, 
  getAllIssues, 
  getIssueById 
} from '../controllers/issueController.js';

const router = express.Router();

// GET /api/issues - Get all issues with optional filters
router.get('/', getAllIssues);

// GET /api/issues/:id - Get a single issue by ID
router.get('/:id', getIssueById);

// POST /api/issues - Issue a book to a student
router.post('/', issueBook);

// PUT /api/issues/:issue_id/return - Return a book
router.put('/:issue_id/return', returnBook);

export default router;