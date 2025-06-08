import { query } from '../database/db.js';
import { validateBook } from '../validators/bookValidator.js';

// Get all books with optional filters and pagination
export const getAllBooks = async (req, res, next) => {
  try {
    const { title, author, category, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let queryString = 'SELECT * FROM books WHERE 1=1';
    const queryParams = [];
    
    // Add filters if provided
    if (title) {
      queryParams.push(`%${title}%`);
      queryString += ` AND title ILIKE $${queryParams.length}`;
    }
    
    if (author) {
      queryParams.push(`%${author}%`);
      queryString += ` AND author ILIKE $${queryParams.length}`;
    }
    
    if (category) {
      queryParams.push(`%${category}%`);
      queryString += ` AND category ILIKE $${queryParams.length}`;
    }
    
    // Add pagination
    queryString += ' ORDER BY title ASC LIMIT $' + (queryParams.length + 1) + ' OFFSET $' + (queryParams.length + 2);
    queryParams.push(parseInt(limit), parseInt(offset));
    
    // Execute query
    const result = await query(queryString, queryParams);
    
    // Get total count for pagination
    const countResult = await query('SELECT COUNT(*) FROM books WHERE 1=1' + 
      (title ? ' AND title ILIKE $1' : '') + 
      (author ? ` AND author ILIKE $${title ? 2 : 1}` : '') + 
      (category ? ` AND category ILIKE $${(title ? 1 : 0) + (author ? 1 : 0) + 1}` : ''),
      [title ? `%${title}%` : null, author ? `%${author}%` : null, category ? `%${category}%` : null].filter(Boolean)
    );
    
    const totalBooks = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalBooks / limit);
    
    res.status(200).json({
      books: result.rows,
      pagination: {
        total: totalBooks,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get a single book by ID
export const getBookById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM books WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Book not found' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

// Create a new book
export const createBook = async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = validateBook(req.body);
    
    if (error) {
      return res.status(400).json({ 
        error: true, 
        message: error.details.map(detail => detail.message).join(', ') 
      });
    }
    
    // Destructure validated data
    const { title, author, isbn, copies, category } = value;
    
    // Check if ISBN already exists
    const existingBook = await query('SELECT * FROM books WHERE isbn = $1', [isbn]);
    
    if (existingBook.rows.length > 0) {
      return res.status(400).json({ error: true, message: 'Book with this ISBN already exists' });
    }
    
    // Insert new book
    const result = await query(
      'INSERT INTO books (title, author, isbn, copies, available_copies, category) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, author, isbn, copies, copies, category]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

// Update a book
export const updateBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate request body
    const { error, value } = validateBook(req.body, true);
    
    if (error) {
      return res.status(400).json({ 
        error: true, 
        message: error.details.map(detail => detail.message).join(', ') 
      });
    }
    
    // Check if book exists
    const existingBook = await query('SELECT * FROM books WHERE id = $1', [id]);
    
    if (existingBook.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Book not found' });
    }
    
    // Build update query dynamically
    const updateFields = [];
    const queryParams = [];
    let paramCounter = 1;
    
    Object.entries(value).forEach(([key, val]) => {
      if (val !== undefined) {
        updateFields.push(`${key} = $${paramCounter}`);
        queryParams.push(val);
        paramCounter += 1;
      }
    });
    
    // Add updated_at timestamp
    updateFields.push(`updated_at = NOW()`);
    
    // Add book ID to params array
    queryParams.push(id);
    
    // Execute update query
    const result = await query(
      `UPDATE books SET ${updateFields.join(', ')} WHERE id = $${paramCounter} RETURNING *`,
      queryParams
    );
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

// Delete a book
export const deleteBook = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if book exists
    const existingBook = await query('SELECT * FROM books WHERE id = $1', [id]);
    
    if (existingBook.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Book not found' });
    }
    
    // Check if book is currently issued to any students
    const issuedBooks = await query(
      'SELECT * FROM book_issues WHERE book_id = $1 AND status = $2',
      [id, 'issued']
    );
    
    if (issuedBooks.rows.length > 0) {
      return res.status(400).json({ 
        error: true, 
        message: 'Cannot delete book because it is currently issued to students' 
      });
    }
    
    // Delete book
    await query('DELETE FROM books WHERE id = $1', [id]);
    
    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    next(error);
  }
};