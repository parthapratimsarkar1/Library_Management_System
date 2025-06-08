import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, BookOpen } from 'lucide-react';
import { toast } from 'react-toastify';
import PageTitle from '../components/PageTitle';
import { getBookById, updateBook, Book } from '../api/bookService';
import { getIssues, BookIssue } from '../api/issueService';

const BookDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [bookIssues, setBookIssues] = useState<BookIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    copies: 1,
    category: ''
  });

  // Fetch book details
  useEffect(() => {
    const fetchBookData = async () => {
      try {
        setLoading(true);
        const bookData = await getBookById(id!);
        setBook(bookData);
        setFormData({
          title: bookData.title,
          author: bookData.author,
          isbn: bookData.isbn,
          copies: bookData.copies,
          category: bookData.category
        });
        
        // Fetch book issues
        const issuesResponse = await getIssues({ book_id: parseInt(id!) });
        setBookIssues(issuesResponse.issues);
      } catch (error) {
        console.error('Error fetching book details:', error);
        toast.error('Failed to fetch book details');
        navigate('/books');
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookData();
  }, [id, navigate]);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'copies' ? parseInt(value) : value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      await updateBook(id!, formData);
      toast.success('Book updated successfully');
      
      // Refresh book data
      const updatedBook = await getBookById(id!);
      setBook(updatedBook);
    } catch (error) {
      console.error('Error updating book:', error);
      toast.error('Failed to update book');
    } finally {
      setSaving(false);
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="text-center py-8">
        <h2 className="text-2xl font-semibold text-gray-800">Book not found</h2>
        <p className="mt-2 text-gray-600">The book you're looking for doesn't exist or has been removed.</p>
        <Link to="/books" className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-500">
          <ArrowLeft className="h-5 w-5 mr-1" />
          Back to Books
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link to="/books" className="mr-4 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-6 w-6" />
        </Link>
        <PageTitle 
          title={book.title} 
          subtitle={`By ${book.author}`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Book Details */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                <BookOpen className="h-5 w-5 mr-2 text-indigo-500" />
                Book Information
              </h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                      Author
                    </label>
                    <input
                      type="text"
                      id="author"
                      name="author"
                      value={formData.author}
                      onChange={handleInputChange}
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 mb-1">
                      ISBN
                    </label>
                    <input
                      type="text"
                      id="isbn"
                      name="isbn"
                      value={formData.isbn}
                      onChange={handleInputChange}
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="copies" className="block text-sm font-medium text-gray-700 mb-1">
                      Total Copies
                    </label>
                    <input
                      type="number"
                      id="copies"
                      name="copies"
                      value={formData.copies}
                      onChange={handleInputChange}
                      min="1"
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Available Copies
                    </label>
                    <div className="block w-full px-3 py-2 border border-gray-300 bg-gray-50 rounded-md shadow-sm sm:text-sm">
                      {book.available_copies}
                    </div>
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

        {/* Book Stats */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Book Status</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Total Copies</h4>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">{book.copies}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Available Copies</h4>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">{book.available_copies}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Currently Issued</h4>
                  <p className="mt-1 text-2xl font-semibold text-gray-900">{book.copies - book.available_copies}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Status</h4>
                  <div className="mt-1">
                    {book.available_copies > 0 ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Available
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Book Issue History */}
      <div className="mt-6">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Issue History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookIssues.length > 0 ? (
                  bookIssues.map((issue) => (
                    <tr key={issue.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <Link 
                          to={`/students/${issue.student_id}`} 
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          {issue.student_name}
                        </Link>
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
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      No issue history found for this book
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;