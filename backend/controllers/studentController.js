import { query } from '../database/db.js';
import { validateStudent } from '../validators/studentValidator.js';

// Get all students with optional filters
export const getAllStudents = async (req, res, next) => {
  try {
    const { name, roll_number, phone, department, semester, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    let queryString = 'SELECT * FROM students WHERE 1=1';
    const queryParams = [];
    
    // Add filters if provided
    if (name) {
      queryParams.push(`%${name}%`);
      queryString += ` AND name ILIKE $${queryParams.length}`;
    }
    
    if (roll_number) {
      queryParams.push(`%${roll_number}%`);
      queryString += ` AND roll_number ILIKE $${queryParams.length}`;
    }
    
    if (phone) {
      queryParams.push(`%${phone}%`);
      queryString += ` AND phone ILIKE $${queryParams.length}`;
    }
    
    if (department) {
      queryParams.push(`%${department}%`);
      queryString += ` AND department ILIKE $${queryParams.length}`;
    }
    
    if (semester) {
      queryParams.push(semester);
      queryString += ` AND semester = $${queryParams.length}`;
    }
    
    // Add pagination
    queryString += ' ORDER BY name ASC LIMIT $' + (queryParams.length + 1) + ' OFFSET $' + (queryParams.length + 2);
    queryParams.push(parseInt(limit), parseInt(offset));
    
    // Execute query
    const result = await query(queryString, queryParams);
    
    // Get total count for pagination
    let countQueryString = 'SELECT COUNT(*) FROM students WHERE 1=1';
    const countParams = [];
    
    if (name) {
      countParams.push(`%${name}%`);
      countQueryString += ` AND name ILIKE $${countParams.length}`;
    }
    
    if (roll_number) {
      countParams.push(`%${roll_number}%`);
      countQueryString += ` AND roll_number ILIKE $${countParams.length}`;
    }
    
    if (phone) {
      countParams.push(`%${phone}%`);
      countQueryString += ` AND phone ILIKE $${countParams.length}`;
    }
    
    if (department) {
      countParams.push(`%${department}%`);
      countQueryString += ` AND department ILIKE $${countParams.length}`;
    }
    
    if (semester) {
      countParams.push(semester);
      countQueryString += ` AND semester = $${countParams.length}`;
    }
    
    const countResult = await query(countQueryString, countParams);
    
    const totalStudents = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalStudents / limit);
    
    res.status(200).json({
      students: result.rows,
      pagination: {
        total: totalStudents,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get a single student by ID
export const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM students WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Student not found' });
    }
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

// Get books issued to a student
export const getStudentBooks = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if student exists
    const studentCheck = await query('SELECT * FROM students WHERE id = $1', [id]);
    
    if (studentCheck.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Student not found' });
    }
    
    // Get all issued books for this student
    const issuedBooks = await query(
      `SELECT bi.id as issue_id, bi.issue_date, bi.due_date, bi.return_date, bi.status,
              b.id as book_id, b.title, b.author, b.isbn, b.category
       FROM book_issues bi
       JOIN books b ON bi.book_id = b.id
       WHERE bi.student_id = $1
       ORDER BY bi.issue_date DESC`,
      [id]
    );
    
    res.status(200).json({
      student: studentCheck.rows[0],
      issuedBooks: issuedBooks.rows
    });
  } catch (error) {
    next(error);
  }
};

// Get a student by identifier (name, roll_number, or phone)
export const getStudentByIdentifier = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    
    // Search by any of the identifiers
    const result = await query(
      `SELECT * FROM students 
       WHERE name ILIKE $1 OR roll_number ILIKE $1 OR phone ILIKE $1`,
      [`%${identifier}%`]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Student not found' });
    }
    
    // Get issued books for each student
    const students = await Promise.all(
      result.rows.map(async (student) => {
        const issuedBooks = await query(
          `SELECT bi.id as issue_id, bi.issue_date, bi.due_date, bi.return_date, bi.status,
                  b.id as book_id, b.title, b.author, b.isbn, b.category
           FROM book_issues bi
           JOIN books b ON bi.book_id = b.id
           WHERE bi.student_id = $1 AND bi.status = 'issued'
           ORDER BY bi.issue_date DESC`,
          [student.id]
        );
        
        return {
          ...student,
          issuedBooks: issuedBooks.rows
        };
      })
    );
    
    res.status(200).json(students);
  } catch (error) {
    next(error);
  }
};

// Create a new student
export const createStudent = async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = validateStudent(req.body);
    
    if (error) {
      return res.status(400).json({ 
        error: true, 
        message: error.details.map(detail => detail.message).join(', ') 
      });
    }
    
    // Destructure validated data
    const { name, roll_number, department, semester, phone, email } = value;
    
    // Check if roll_number or email already exists
    const existingStudent = await query(
      'SELECT * FROM students WHERE roll_number = $1 OR email = $2',
      [roll_number, email]
    );
    
    if (existingStudent.rows.length > 0) {
      return res.status(400).json({ 
        error: true, 
        message: 'Student with this roll number or email already exists' 
      });
    }
    
    // Insert new student
    const result = await query(
      'INSERT INTO students (name, roll_number, department, semester, phone, email) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, roll_number, department, semester, phone, email]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

// Update a student
export const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Validate request body
    const { error, value } = validateStudent(req.body, true);
    
    if (error) {
      return res.status(400).json({ 
        error: true, 
        message: error.details.map(detail => detail.message).join(', ') 
      });
    }
    
    // Check if student exists
    const existingStudent = await query('SELECT * FROM students WHERE id = $1', [id]);
    
    if (existingStudent.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Student not found' });
    }
    
    // Check if updated roll_number or email already exists for another student
    if (value.roll_number || value.email) {
      const checkDuplicate = await query(
        `SELECT * FROM students WHERE id != $1 AND 
         (${value.roll_number ? 'roll_number = $2' : '1=0'} OR 
          ${value.email ? (value.roll_number ? 'email = $3' : 'email = $2') : '1=0'})`,
        [id, 
         value.roll_number || null, 
         value.email || null].filter(Boolean)
      );
      
      if (checkDuplicate.rows.length > 0) {
        return res.status(400).json({ 
          error: true, 
          message: 'Roll number or email already exists for another student' 
        });
      }
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
    
    // Add student ID to params array
    queryParams.push(id);
    
    // Execute update query
    const result = await query(
      `UPDATE students SET ${updateFields.join(', ')} WHERE id = $${paramCounter} RETURNING *`,
      queryParams
    );
    
    res.status(200).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

// Delete a student
export const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if student exists
    const existingStudent = await query('SELECT * FROM students WHERE id = $1', [id]);
    
    if (existingStudent.rows.length === 0) {
      return res.status(404).json({ error: true, message: 'Student not found' });
    }
    
    // Check if student has any issued books
    const issuedBooks = await query(
      'SELECT * FROM book_issues WHERE student_id = $1 AND status = $2',
      [id, 'issued']
    );
    
    if (issuedBooks.rows.length > 0) {
      return res.status(400).json({ 
        error: true, 
        message: 'Cannot delete student because they have books currently issued' 
      });
    }
    
    // Delete student
    await query('DELETE FROM students WHERE id = $1', [id]);
    
    res.status(200).json({ message: 'Student deleted successfully' });
  } catch (error) {
    next(error);
  }
};