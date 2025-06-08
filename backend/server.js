import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import bookRoutes from './routes/bookRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import { initDatabase } from './database/db.js';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/books', bookRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/issues', issueRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Library Management System API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    error: true,
    message: err.message || 'An unknown error occurred',
  });
});

// Start server
const startServer = async () => {
  try {
    // Initialize database connection
    await initDatabase();
    console.log('Database connected successfully');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();