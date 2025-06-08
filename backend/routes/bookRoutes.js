import express from 'express';
import { 
  getAllBooks, 
  getBookById, 
  createBook, 
  updateBook, 
  deleteBook 
} from '../controllers/bookController.js';

const router = express.Router();

// GET /api/books - Get all books with optional filters and pagination
router.get('/', getAllBooks);

// GET /api/books/:id - Get a single book by ID
router.get('/:id', getBookById);

// POST /api/books - Create a new book
router.post('/', createBook);

// PUT /api/books/:id - Update a book
router.put('/:id', updateBook);

// DELETE /api/books/:id - Delete a book
router.delete('/:id', deleteBook);

export default router;