import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import PageTitle from '../components/PageTitle';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import { getBooks, createBook, deleteBook, BookFilters, Book } from '../api/bookService';

const Books = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<BookFilters>({
    title: '',
    author: '',
    category: '',
    page: 1,
    limit: 10
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    isbn: '',
    copies: 1,
    category: ''
  });

  // Fetch books with current filters
  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await getBooks(filters);
      setBooks(response.books);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchBooks();
  }, [filters]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  // Handle filter change
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
  };

  // Handle new book form change
  const handleNewBookChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewBook(prev => ({ 
      ...prev, 
      [name]: name === 'copies' ? (parseInt(value) || 1) : value
    }));
  };

  // Add new book
  const handleAddBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createBook(newBook);
      toast.success('Book added successfully');
      setIsAddModalOpen(false);
      setNewBook({
        title: '',
        author: '',
        isbn: '',
        copies: 1,
        category: ''
      });
      fetchBooks();
    } catch (error) {
      console.error('Error adding book:', error);
      toast.error('Failed to add book');
    } finally {
      setLoading(false);
    }
  };

  // Delete book
  const handleDeleteBook = async () => {
    if (!selectedBook) return;
    
    try {
      setLoading(true);
      await deleteBook(selectedBook.id);
      toast.success('Book deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedBook(null);
      fetchBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error('Failed to delete book');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageTitle 
        title="Books" 
        subtitle="Manage and browse the library collection"
      >
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md flex items-center transition-colors duration-200"
        >
          <Plus className="h-5 w-5 mr-1" />
          Add Book
        </button>
      </PageTitle>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="title"
                name="title"
                value={filters.title}
                onChange={handleFilterChange}
                placeholder="Search by title"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
              Author
            </label>
            <input
              type="text"
              id="author"
              name="author"
              value={filters.author}
              onChange={handleFilterChange}
              placeholder="Search by author"
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
              value={filters.category}
              onChange={handleFilterChange}
              placeholder="Filter by category"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Books List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading && books.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ISBN
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Copies
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Available
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {books.length > 0 ? (
                  books.map((book) => (
                    <tr key={book.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          to={`/books/${book.id}`} 
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          {book.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {book.author}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {book.isbn}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {book.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {book.copies}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          book.available_copies > 0 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {book.available_copies}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <Link 
                            to={`/books/${book.id}`} 
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Edit className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => {
                              setSelectedBook(book);
                              setIsDeleteModalOpen(true);
                            }}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                      No books found
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

      {/* Add Book Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Book"
      >
        <form onSubmit={handleAddBook}>
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={newBook.title}
                onChange={handleNewBookChange}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                Author <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={newBook.author}
                onChange={handleNewBookChange}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="isbn" className="block text-sm font-medium text-gray-700 mb-1">
                ISBN <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="isbn"
                name="isbn"
                value={newBook.isbn}
                onChange={handleNewBookChange}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="category"
                name="category"
                value={newBook.category}
                onChange={handleNewBookChange}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="copies" className="block text-sm font-medium text-gray-700 mb-1">
                Number of Copies <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="copies"
                name="copies"
                value={newBook.copies}
                onChange={handleNewBookChange}
                min="1"
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Adding...' : 'Add Book'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Book"
        size="sm"
      >
        <p className="text-sm text-gray-500">
          Are you sure you want to delete "{selectedBook?.title}"? This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => setIsDeleteModalOpen(false)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDeleteBook}
            disabled={loading}
            className="inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            {loading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Books;