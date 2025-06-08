import api from './index';

// Define types
export interface Student {
  id: number;
  name: string;
  roll_number: string;
  department: string;
  semester: number;
  phone: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface StudentWithBooks extends Student {
  issuedBooks: IssuedBook[];
}

export interface IssuedBook {
  issue_id: number;
  book_id: number;
  title: string;
  author: string;
  isbn: string;
  category: string;
  issue_date: string;
  due_date: string;
  return_date: string | null;
  status: string;
}

export interface StudentListResponse {
  students: Student[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface StudentFilters {
  name?: string;
  roll_number?: string;
  phone?: string;
  department?: string;
  semester?: number;
  page?: number;
  limit?: number;
}

export interface StudentCreate {
  name: string;
  roll_number: string;
  department: string;
  semester: number;
  phone: string;
  email: string;
}

// API functions
export const getStudents = async (filters: StudentFilters = {}): Promise<StudentListResponse> => {
  const response = await api.get('/students', { params: filters });
  return response.data;
};

export const getStudentById = async (id: number | string): Promise<Student> => {
  const response = await api.get(`/students/${id}`);
  return response.data;
};

export const getStudentBooks = async (id: number | string): Promise<{student: Student, issuedBooks: IssuedBook[]}> => {
  const response = await api.get(`/students/${id}/books`);
  return response.data;
};

export const searchStudentByIdentifier = async (identifier: string): Promise<StudentWithBooks[]> => {
  const response = await api.get(`/students/search/${identifier}`);
  return response.data;
};

export const createStudent = async (student: StudentCreate): Promise<Student> => {
  const response = await api.post('/students', student);
  return response.data;
};

export const updateStudent = async (id: number | string, student: Partial<StudentCreate>): Promise<Student> => {
  const response = await api.put(`/students/${id}`, student);
  return response.data;
};

export const deleteStudent = async (id: number | string): Promise<void> => {
  await api.delete(`/students/${id}`);
};