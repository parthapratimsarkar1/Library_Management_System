import express from 'express';
import { 
  getAllStudents, 
  getStudentById, 
  getStudentBooks,
  getStudentByIdentifier,
  createStudent, 
  updateStudent, 
  deleteStudent 
} from '../controllers/studentController.js';

const router = express.Router();

// GET /api/students - Get all students with optional filters
router.get('/', getAllStudents);

// GET /api/students/:id - Get a single student by ID
router.get('/:id', getStudentById);

// GET /api/students/:id/books - Get books issued to a student
router.get('/:id/books', getStudentBooks);

// GET /api/students/search/:identifier - Search student by name, roll, or phone
router.get('/search/:identifier', getStudentByIdentifier);

// POST /api/students - Create a new student
router.post('/', createStudent);

// PUT /api/students/:id - Update a student
router.put('/:id', updateStudent);

// DELETE /api/students/:id - Delete a student
router.delete('/:id', deleteStudent);

export default router;