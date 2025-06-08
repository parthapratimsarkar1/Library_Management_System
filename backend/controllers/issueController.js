import { query } from '../database/db.js';
import { validateIssue } from '../validators/issueValidator.js';

// Issue a book to a student
export const issueBook = async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = validateIssue(req.body);
    
    if (error) {
      return res.status(400).json({ 
        error: true, 
        message: error.details.map(detail => detail.message).join(', ') 
      });
    }
    
    const { book_id, student_id, due_date } = value;
    
    // Check if book exists and has available copies
    const bookResult = await query('SELECT * FROM books WHERE id = $1', [book_id]);
    
    if (bookResult.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Book not found' });
    }
    
    const book = bookResult.rows[0];
    
    if (book.available_copies <= 0) {
      return res.status(400).json({ error: true, message: 'No copies of this book are available' });
    }
    
    // Check if student exists
    const studentResult = await query('SELECT * FROM students WHERE id = $1', [student_id]);
    
    if (studentResult.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Student not found' });
    }
    
    // Check if student already has this book issued
    const existingIssue = await query(
      'SELECT * FROM book_issues WHERE book_id = $1 AND student_id = $2 AND status = $3',
      [book_id, student_id, 'issued']
    );
    
    if (existingIssue.rows.length > 0) {
      return res.status(400).json({ 
        error: true, 
        message: 'This book is already issued to this student' 
      });
    }
    
    // Start transaction
    const client = await query('BEGIN');
    
    try {
      // Create issue record
      const issueResult = await query(
        'INSERT INTO book_issues (book_id, student_id, due_date, status) VALUES ($1, $2, $3, $4) RETURNING *',
        [book_id, student_id, due_date, 'issued']
      );
      
      // Update available copies
      await query(
        'UPDATE books SET available_copies = available_copies - 1, updated_at = NOW() WHERE id = $1',
        [book_id]
      );
      
      // Commit transaction
      await query('COMMIT');
      
      // Get complete issue details with book and student info
      const completeIssue = await query(
        `SELECT bi.*, 
                b.title as book_title, b.author as book_author, b.isbn as book_isbn,
                s.name as student_name, s.roll_number as student_roll_number
         FROM book_issues bi
         JOIN books b ON bi.book_id = b.id
         JOIN students s ON bi.student_id = s.id
         WHERE bi.id = $1`,
        [issueResult.rows[0].id]
      );
      
      res.status(201).json(completeIssue.rows[0]);
    } catch (error) {
      // Rollback transaction in case of error
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// Return a book
export const returnBook = async (req, res, next) => {
  try {
    const { issue_id } = req.params;
    
    // Check if issue exists and is not already returned
    const issueResult = await query(
      'SELECT * FROM book_issues WHERE id = $1',
      [issue_id]
    );
    
    if (issueResult.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Issue record not found' });
    }
    
    const issue = issueResult.rows[0];
    
    if (issue.status !== 'issued') {
      return res.status(400).json({ error: true, message: 'This book has already been returned' });
    }
    
    // Start transaction
    const client = await query('BEGIN');
    
    try {
      // Update issue record
      const returnResult = await query(
        'UPDATE book_issues SET status = $1, return_date = NOW(), updated_at = NOW() WHERE id = $2 RETURNING *',
        ['returned', issue_id]
      );
      
      // Update available copies
      await query(
        'UPDATE books SET available_copies = available_copies + 1, updated_at = NOW() WHERE id = $1',
        [issue.book_id]
      );
      
      // Commit transaction
      await query('COMMIT');
      
      // Get complete issue details with book and student info
      const completeIssue = await query(
        `SELECT bi.*, 
                b.title as book_title, b.author as book_author, b.isbn as book_isbn,
                s.name as student_name, s.roll_number as student_roll_number
         FROM book_issues bi
         JOIN books b ON bi.book_id = b.id
         JOIN students s ON bi.student_id = s.id
         WHERE bi.id = $1`,
        [issue_id]
      );
      
      res.status(200).json(completeIssue.rows[0]);
    } catch (error) {
      // Rollback transaction in case of error
      await query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

// Get all book issues with optional filters
export const getAllIssues = async (req, res, next) => {
  try {
    const { book_id, student_id, status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let queryString = `
      SELECT bi.*, 
             b.title as book_title, b.author as book_author, b.isbn as book_isbn,
             s.name as student_name, s.roll_number as student_roll_number
      FROM book_issues bi
      JOIN books b ON bi.book_id = b.id
      JOIN students s ON bi.student_id = s.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    
    // Add filters if provided
    if (book_id) {
      queryParams.push(book_id);
      queryString += ` AND bi.book_id = $${queryParams.length}`;
    }
    
    if (student_id) {
      queryParams.push(student_id);
      queryString += ` AND bi.student_id = $${queryParams.length}`;
    }
    
    if (status) {
      queryParams.push(status);
      queryString += ` AND bi.status = $${queryParams.length}`;
    }
    
    // Add pagination
    queryString += ' ORDER BY bi.issue_date DESC LIMIT $' + (queryParams.length + 1) + ' OFFSET $' + (queryParams.length + 2);
    queryParams.push(parseInt(limit), parseInt(offset));
    
    // Execute query
    const result = await query(queryString, queryParams);
    
    // Get total count for pagination
    let countQueryString = 'SELECT COUNT(*) FROM book_issues bi WHERE 1=1';
    const countParams = [];
    
    if (book_id) {
      countParams.push(book_id);
      countQueryString += ` AND bi.book_id = $${countParams.length}`;
    }
    
    if (student_id) {
      countParams.push(student_id);
      countQueryString += ` AND bi.student_id = $${countParams.length}`;
    }
    
    if (status) {
      countParams.push(status);
      countQueryString += ` AND bi.status = $${countParams.length}`;
    }
    
    const countResult = await query(countQueryString, countParams);
    
    const totalIssues = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalIssues / limit);
    
    res.status(200).json({
      issues: result.rows,
      pagination: {
        total: totalIssues,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get a single issue by ID
export const getIssueById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      `SELECT bi.*, 
              b.title as book_title, b.author as book_author, b.isbn as book_isbn,
              s.name as student_name, s.roll_number as student_roll_number
       FROM book_issues bi
       JOIN books b ON bi.book_id = b.id
       JOIN students s ON bi.student_id = s.id
       WHERE bi.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Issue record not found' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};