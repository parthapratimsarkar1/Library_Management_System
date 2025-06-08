import api from './index';

// Define types
export interface Book {
  id: number;
  title: string;
  author: string;
  isbn: string;
  copies: number;
  available_copies: number;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface BookListResponse {
  books: Book[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface BookFilters {
  title?: string;
  author?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface BookCreate {
  title: string;
  author: string;
  isbn: string;
  copies: number;
  category: string;
}

// API functions
export const getBooks = async (filters: BookFilters = {}): Promise<BookListResponse> => {
  const response = await api.get('/books', { params: filters });
  return response.data;
};

export const getBookById = async (id: number | string): Promise<Book> => {
  const response = await api.get(`/books/${id}`);
  return response.data;
};

export const createBook = async (book: BookCreate): Promise<Book> => {
  const response = await api.post('/books', book);
  return response.data;
};

export const updateBook = async (id: number | string, book: Partial<BookCreate>): Promise<Book> => {
  const response = await api.put(`/books/${id}`, book);
  return response.data;
};

export const deleteBook = async (id: number | string): Promise<void> => {
  await api.delete(`/books/${id}`);
};