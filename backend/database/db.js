import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const { Pool } = pg;

// Create a pool of connections
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/library',
});

// Initialize database with tables if they don't exist
export const initDatabase = async () => {
  const client = await pool.connect();
  try {
    // Begin transaction
    await client.query('BEGIN');

    // Create books table
    await client.query(`
      CREATE TABLE IF NOT EXISTS books (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        isbn VARCHAR(20) UNIQUE NOT NULL,
        copies INTEGER NOT NULL DEFAULT 1,
        available_copies INTEGER NOT NULL DEFAULT 1,
        category VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create students table
    await client.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        roll_number VARCHAR(20) UNIQUE NOT NULL,
        department VARCHAR(100) NOT NULL,
        semester INTEGER NOT NULL,
        phone VARCHAR(20) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create book_issues table
    await client.query(`
      CREATE TABLE IF NOT EXISTS book_issues (
        id SERIAL PRIMARY KEY,
        book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
        student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
        issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        due_date TIMESTAMP NOT NULL,
        return_date TIMESTAMP,
        status VARCHAR(20) DEFAULT 'issued',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Commit transaction
    await client.query('COMMIT');
    console.log('Database tables initialized successfully');
  } catch (error) {
    // Rollback transaction in case of error
    await client.query('ROLLBACK');
    console.error('Error initializing database:', error);
    throw error;
  } finally {
    client.release();
  }
};

// Query method to simplify database operations
export const query = (text, params) => pool.query(text, params);

export default pool;