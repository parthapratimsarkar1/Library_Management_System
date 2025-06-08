import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, ArrowRight, CheckCircle, X } from 'lucide-react';
import { toast } from 'react-toastify';
import PageTitle from '../components/PageTitle';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import { getIssues, issueBook, returnBook, BookIssue, IssueFilters } from '../api/issueService';
import { getBooks } from '../api/bookService';
import { getStudents } from '../api/studentService';

const Issues = () => {
  const [issues, setIssues] = useState<BookIssue[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<IssueFilters>({
    status: '',
    page: 1,
    limit: 10
  });
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [bookSearch, setBookSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [showBookDropdown, setShowBookDropdown] = useState(false);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [newIssue, setNewIssue] = useState({
    book_id: '',
    student_id: '',
    due_date: ''
  });

  // Set default due date to 14 days from now
  useEffect(() => {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    setNewIssue(prev => ({
      ...prev,
      due_date: date.toISOString().split('T')[0]
    }));
  }, []);

  // Filter books based on search
  useEffect(() => {
    if (bookSearch.trim() === '') {
      setFilteredBooks(books);
    } else {
      const filtered = books.filter(book =>
        book.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
        book.author.toLowerCase().includes(bookSearch.toLowerCase()) ||
        book.isbn.toLowerCase().includes(bookSearch.toLowerCase())
      );
      setFilteredBooks(filtered);
    }
  }, [bookSearch, books]);

  // Filter students based on search
  useEffect(() => {
    if (studentSearch.trim() === '') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student =>
        student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        student.roll_number.toLowerCase().includes(studentSearch.toLowerCase()) ||
        student.email.toLowerCase().includes(studentSearch.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [studentSearch, students]);

  // Fetch issues with current filters
  const fetchIssues = async () => {
    try {
      setLoading(true);
      const response = await getIssues(filters);
      setIssues(response.issues);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching issues:', error);
      toast.error('Failed to fetch issues');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchIssues();
  }, [filters]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Handle filter change
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  // Reset modal state
  const resetModalState = () => {
    setBookSearch('');
    setStudentSearch('');
    setSelectedBook(null);
    setSelectedStudent(null);
    setShowBookDropdown(false);
    setShowStudentDropdown(false);
    setNewIssue(prev => ({
      book_id: '',
      student_id: '',
      due_date: prev.due_date
    }));
  };

  // Fetch books and students for the issue modal
  const handleOpenIssueModal = async () => {
    try {
      setLoading(true);
      const [booksResponse, studentsResponse] = await Promise.all([
        getBooks({ limit: 1000 }), // Increased limit for better search
        getStudents({ limit: 1000 })
      ]);
      
      // Only show books with available copies
      const availableBooks = booksResponse.books.filter(book => book.available_copies > 0);
      
      setBooks(availableBooks);
      setStudents(studentsResponse.students);
      setFilteredBooks(availableBooks);
      setFilteredStudents(studentsResponse.students);
      setIsIssueModalOpen(true);
    } catch (error) {
      console.error('Error fetching books and students:', error);
      toast.error('Failed to load books and students');
    } finally {
      setLoading(false);
    }
  };

  // Handle book selection
  const handleBookSelect = (book) => {
    setSelectedBook(book);
    setBookSearch(`${book.title} by ${book.author}`);
    setNewIssue(prev => ({ ...prev, book_id: book.id.toString() }));
    setShowBookDropdown(false);
  };

  // Handle student selection
  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setStudentSearch(`${student.name} (${student.roll_number})`);
    setNewIssue(prev => ({ ...prev, student_id: student.id.toString() }));
    setShowStudentDropdown(false);
  };

  // Clear book selection
  const clearBookSelection = () => {
    setSelectedBook(null);
    setBookSearch('');
    setNewIssue(prev => ({ ...prev, book_id: '' }));
  };

  // Clear student selection
  const clearStudentSelection = () => {
    setSelectedStudent(null);
    setStudentSearch('');
    setNewIssue(prev => ({ ...prev, student_id: '' }));
  };

  // Handle new issue form change
  const handleNewIssueChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewIssue(prev => ({ ...prev, [name]: value }));
  };

  // Add new issue
  const handleAddIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newIssue.book_id || !newIssue.student_id || !newIssue.due_date) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      setLoading(true);
      await issueBook({
        book_id: parseInt(newIssue.book_id),
        student_id: parseInt(newIssue.student_id),
        due_date: new Date(newIssue.due_date).toISOString()
      });
      
      toast.success('Book issued successfully');
      setIsIssueModalOpen(false);
      resetModalState();
      
      fetchIssues();
    } catch (error) {
      console.error('Error issuing book:', error);
      toast.error('Failed to issue book');
    } finally {
      setLoading(false);
    }
  };

  // Return a book
  const handleReturnBook = async (issueId: number) => {
    try {
      setLoading(true);
      await returnBook(issueId);
      toast.success('Book returned successfully');
      fetchIssues();
    } catch (error) {
      console.error('Error returning book:', error);
      toast.error('Failed to return book');
    } finally {
      setLoading(false);
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div>
      <PageTitle 
        title="Book Issues" 
        subtitle="Manage book issuance and returns"
      >
        <button
          onClick={handleOpenIssueModal}
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md flex items-center transition-colors duration-200"
        >
          <Plus className="h-5 w-5 mr-1" />
          Issue Book
        </button>
      </PageTitle>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="">All Status</option>
              <option value="issued">Issued</option>
              <option value="returned">Returned</option>
            </select>
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading && issues.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Book
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Return Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {issues.length > 0 ? (
                  issues.map((issue) => (
                    <tr key={issue.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          to={`/books/${issue.book_id}`} 
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          {issue.book_title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          to={`/students/${issue.student_id}`} 
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          {issue.student_name}
                        </Link>
                        <div className="text-xs text-gray-500">{issue.student_roll_number}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(issue.issue_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(issue.due_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {issue.return_date ? formatDate(issue.return_date) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {issue.status === 'issued' ? (
                          new Date(issue.due_date) < new Date() ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              Overdue
                            </span>
                          ) : (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              Issued
                            </span>
                          )
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Returned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {issue.status === 'issued' && (
                          <button
                            onClick={() => handleReturnBook(issue.id)}
                            className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Return
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      No issues found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Pagination */}
        <div className="px-6 py-3 border-t border-gray-200">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* Issue Book Modal */}
      <Modal
        isOpen={isIssueModalOpen}
        onClose={() => {
          setIsIssueModalOpen(false);
          resetModalState();
        }}
        title="Issue a Book"
      >
        <form onSubmit={handleAddIssue}>
          <div className="space-y-4">
            {/* Book Search */}
            <div>
              <label htmlFor="book_search" className="block text-sm font-medium text-gray-700 mb-1">
                Book <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="relative">
                  <input
                    type="text"
                    id="book_search"
                    placeholder="Search by title, author, or ISBN..."
                    value={bookSearch}
                    onChange={(e) => setBookSearch(e.target.value)}
                    onFocus={() => setShowBookDropdown(true)}
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  {selectedBook && (
                    <button
                      type="button"
                      onClick={clearBookSelection}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
                
                {/* Book Dropdown */}
                {showBookDropdown && bookSearch && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                    {filteredBooks.length > 0 ? (
                      filteredBooks.map((book) => (
                        <div
                          key={book.id}
                          onClick={() => handleBookSelect(book)}
                          className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900 truncate">
                              {book.title}
                            </span>
                            <span className="text-gray-500 text-sm">
                              by {book.author} • ISBN: {book.isbn}
                            </span>
                            <span className="text-green-600 text-xs">
                              {book.available_copies} copies available
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="cursor-default select-none relative py-2 pl-3 pr-9 text-gray-500">
                        No books found
                      </div>
                    )}
                  </div>
                )}
              </div>
              {books.length === 0 && (
                <p className="mt-1 text-sm text-red-600">
                  No books are currently available for issue.
                </p>
              )}
            </div>

            {/* Student Search */}
            <div>
              <label htmlFor="student_search" className="block text-sm font-medium text-gray-700 mb-1">
                Student <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="relative">
                  <input
                    type="text"
                    id="student_search"
                    placeholder="Search by name, roll number, or email..."
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    onFocus={() => setShowStudentDropdown(true)}
                    className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  {selectedStudent && (
                    <button
                      type="button"
                      onClick={clearStudentSelection}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    </button>
                  )}
                </div>
                
                {/* Student Dropdown */}
                {showStudentDropdown && studentSearch && (
                  <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => (
                        <div
                          key={student.id}
                          onClick={() => handleStudentSelect(student)}
                          className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900 truncate">
                              {student.name}
                            </span>
                            <span className="text-gray-500 text-sm">
                              Roll: {student.roll_number} • {student.email}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="cursor-default select-none relative py-2 pl-3 pr-9 text-gray-500">
                        No students found
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="due_date"
                name="due_date"
                value={newIssue.due_date}
                onChange={handleNewIssueChange}
                min={new Date().toISOString().split('T')[0]}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setIsIssueModalOpen(false);
                resetModalState();
              }}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || books.length === 0 || !selectedBook || !selectedStudent}
              className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Issue Book'}
              <ArrowRight className="ml-1 h-4 w-4" />
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Issues;