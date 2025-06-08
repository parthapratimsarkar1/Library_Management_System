import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, User, BookOpen, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import PageTitle from '../components/PageTitle';
import Modal from '../components/Modal';
import { getStudentBooks, updateStudent, Student, IssuedBook } from '../api/studentService';
import { issueBook, returnBook } from '../api/issueService';
import { getBooks, Book } from '../api/bookService';

const StudentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [issuedBooks, setIssuedBooks] = useState<IssuedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    roll_number: '',
    department: '',
    semester: 1,
    phone: '',
    email: ''
  });
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [availableBooks, setAvailableBooks] = useState<Book[]>([]);
  const [selectedBook, setSelectedBook] = useState<number | ''>('');
  const [dueDate, setDueDate] = useState<string>('');

  // Set default due date to 14 days from now
  useEffect(() => {
    const date = new Date();
    date.setDate(date.getDate() + 14);
    setDueDate(date.toISOString().split('T')[0]);
  }, []);

  // Fetch student details and issued books
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        setLoading(true);
        const studentData = await getStudentBooks(id!);
        setStudent(studentData.student);
        setIssuedBooks(studentData.issuedBooks);
        setFormData({
          name: studentData.student.name,
          roll_number: studentData.student.roll_number,
          department: studentData.student.department,
          semester: studentData.student.semester,
          phone: studentData.student.phone,
          email: studentData.student.email
        });
      } catch (error) {
        console.error('Error fetching student details:', error);
        toast.error('Failed to fetch student details');
        navigate('/students');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudentData();
  }, [id, navigate]);

  // Fetch available books for issuing
  const fetchAvailableBooks = async () => {
    try {
      const response = await getBooks();
      // Filter books with available copies
      const available = response.books.filter(book => book.available_copies > 0);
      setAvailableBooks(available);
    } catch (error) {
      console.error('Error fetching available books:', error);
      toast.error('Failed to fetch available books');
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'semester' ? parseInt(value) : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      await updateStudent(id!, formData);
      toast.success('Student information updated successfully');
      
      // Refresh student data
      const updatedStudent = await getStudentBooks(id!);
      setStudent(updatedStudent.student);
      setIssuedBooks(updatedStudent.issuedBooks);
    } catch (error) {
      console.error('Error updating student:', error);
      toast.error('Failed to update student information');
    } finally {
      setSaving(false);
    }
  };

  // Open issue book modal
  const handleOpenIssueModal = async () => {
    await fetchAvailableBooks();
    setIsIssueModalOpen(true);
  };

  // Issue a book to the student
  const handleIssueBook = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBook || !dueDate) {
      toast.error('Please select a book and due date');
      return;
    }
    
    try {
      setSaving(true);
      await issueBook({
        book_id: Number(selectedBook),
        student_id: Number(id),
        due_date: new Date(dueDate).toISOString()
      });
      
      toast.success('Book issued successfully');
      setIsIssueModalOpen(false);
      setSelectedBook('');
      
      // Refresh student books
      const updatedStudent = await getStudentBooks(id!);
      setIssuedBooks(updatedStudent.issuedBooks);
    } catch (error) {
      console.error('Error issuing book:', error);
      toast.error('Failed to issue book');
    } finally {
      setSaving(false);
    }
  };

  // Return a book
  const handleReturnBook = async (issueId: number) => {
    try {
      setLoading(true);
      await returnBook(issueId);
      toast.success('Book returned successfully');
      
      // Refresh student books
      const updatedStudent = await getStudentBooks(id!);
      setIssuedBooks(updatedStudent.issuedBooks);
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

  if (loading && !student) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-semibold text-gray-800">Student not found</h2>
        <p className="mt-2 text-gray-600">The student you're looking for doesn't exist or has been removed.</p>
        <Link to="/students" className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-500">
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Students
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link to="/students" className="mr-4 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <PageTitle 
          title={student.name} 
          subtitle={`Roll Number: ${student.roll_number}`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Student Details */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2 text-indigo-500" />
                Student Information
              </h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="roll_number" className="block text-sm font-medium text-gray-700 mb-1">
                      Roll Number
                    </label>
                    <input
                      type="text"
                      id="roll_number"
                      name="roll_number"
                      value={formData.roll_number}
                      onChange={handleInputChange}
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      id="department"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
                      Semester
                    </label>
                    <input
                      type="number"
                      id="semester"
                      name="semester"
                      value={formData.semester}
                      onChange={handleInputChange}
                      min="1"
                      max="12"
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Issue Book Button */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Actions</h3>
            </div>
            <div className="p-6">
              <button
                onClick={handleOpenIssueModal}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md flex items-center justify-center transition-colors duration-200"
              >
                <BookOpen className="h-5 w-5 mr-2" />
                Issue New Book
              </button>
            </div>
          </div>
          
          {/* Books Overview */}
          <div className="bg-white rounded-lg shadow overflow-hidden mt-6">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Books Overview</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Currently Issued</h4>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">
                    {issuedBooks.filter(book => book.status === 'issued').length}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Overdue Books</h4>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">
                    {issuedBooks.filter(book => 
                      book.status === 'issued' && new Date(book.due_date) < new Date()
                    ).length}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Total Returned</h4>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">
                    {issuedBooks.filter(book => book.status === 'returned').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Issued Books */}
      <div className="mt-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-indigo-500" />
            <h3 className="text-lg font-medium leading-6 text-gray-900">Issued Books</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Book Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
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
                {issuedBooks.length > 0 ? (
                  issuedBooks.map((book) => (
                    <tr key={book.issue_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <Link 
                          to={`/books/${book.book_id}`} 
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          {book.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {book.author}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(book.issue_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(book.due_date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {book.status === 'issued' ? (
                          new Date(book.due_date) < new Date() ? (
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
                        {book.status === 'issued' && (
                          <button
                            onClick={() => handleReturnBook(book.issue_id)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Return Book
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      No books currently issued to this student
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Issue Book Modal */}
      <Modal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        title="Issue Book to Student"
      >
        <form onSubmit={handleIssueBook}>
          <div className="space-y-4">
            <div>
              <label htmlFor="book" className="block text-sm font-medium text-gray-700 mb-1">
                Select Book <span className="text-red-500">*</span>
              </label>
              <select
                id="book"
                value={selectedBook}
                onChange={(e) => setSelectedBook(e.target.value)}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">-- Select a book --</option>
                {availableBooks.map((book) => (
                  <option key={book.id} value={book.id}>
                    {book.title} by {book.author} ({book.available_copies} available)
                  </option>
                ))}
              </select>
              {availableBooks.length === 0 && (
                <p className="mt-1 text-sm text-red-600">
                  No books are currently available for issue.
                </p>
              )}
            </div>
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="dueDate"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsIssueModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || availableBooks.length === 0}
              className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {saving ? 'Issuing...' : 'Issue Book'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StudentDetails;