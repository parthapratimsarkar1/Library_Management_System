import api from './index';

// Define types
export interface BookIssue {
  id: number;
  book_id: number;
  student_id: number;
  issue_date: string;
  due_date: string;
  return_date: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  book_title?: string;
  book_author?: string;
  book_isbn?: string;
  student_name?: string;
  student_roll_number?: string;
}

export interface IssueListResponse {
  issues: BookIssue[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface IssueFilters {
  book_id?: number;
  student_id?: number;
  status?: string;
  page?: number;
  limit?: number;
}

export interface IssueCreate {
  book_id: number;
  student_id: number;
  due_date: string;
}

// API functions
export const getIssues = async (filters: IssueFilters = {}): Promise<IssueListResponse> => {
  const response = await api.get('/issues', { params: filters });
  return response.data;
};

export const getIssueById = async (id: number | string): Promise<BookIssue> => {
  const response = await api.get(`/issues/${id}`);
  return response.data;
};

export const issueBook = async (issueData: IssueCreate): Promise<BookIssue> => {
  const response = await api.post('/issues', issueData);
  return response.data;
};

export const returnBook = async (issueId: number | string): Promise<BookIssue> => {
  const response = await api.put(`/issues/${issueId}/return`);
  return response.data;
};