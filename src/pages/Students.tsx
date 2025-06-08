import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import PageTitle from '../components/PageTitle';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import { getStudents, createStudent, deleteStudent, StudentFilters, Student } from '../api/studentService';

const Students = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<StudentFilters>({
    name: '',
    roll_number: '',
    department: '',
    page: 1,
    limit: 10
  });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [newStudent, setNewStudent] = useState({
    name: '',
    roll_number: '',
    department: '',
    semester: 1,
    phone: '',
    email: ''
  });

  // Fetch students with current filters
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await getStudents(filters);
      setStudents(response.students);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to fetch students');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchStudents();
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

  // Handle new student form change
  const handleNewStudentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewStudent(prev => ({ 
      ...prev, 
      [name]: name === 'semester' ? (parseInt(value) || 1) : value
    }));
  };

  // Add new student
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createStudent(newStudent);
      toast.success('Student added successfully');
      setIsAddModalOpen(false);
      setNewStudent({
        name: '',
        roll_number: '',
        department: '',
        semester: 1,
        phone: '',
        email: ''
      });
      fetchStudents();
    } catch (error) {
      console.error('Error adding student:', error);
      toast.error('Failed to add student');
    } finally {
      setLoading(false);
    }
  };

  // Delete student
  const handleDeleteStudent = async () => {
    if (!selectedStudent) return;
    
    try {
      setLoading(true);
      await deleteStudent(selectedStudent.id);
      toast.success('Student deleted successfully');
      setIsDeleteModalOpen(false);
      setSelectedStudent(null);
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      toast.error('Failed to delete student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageTitle 
        title="Students" 
        subtitle="Manage and browse student records"
      >
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-md flex items-center transition-colors duration-200"
        >
          <Plus className="h-5 w-5 mr-1" />
          Add Student
        </button>
      </PageTitle>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="name"
                name="name"
                value={filters.name}
                onChange={handleFilterChange}
                placeholder="Search by name"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div>
            <label htmlFor="roll_number" className="block text-sm font-medium text-gray-700 mb-1">
              Roll Number
            </label>
            <input
              type="text"
              id="roll_number"
              name="roll_number"
              value={filters.roll_number}
              onChange={handleFilterChange}
              placeholder="Search by roll number"
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
              value={filters.department}
              onChange={handleFilterChange}
              placeholder="Filter by department"
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading && students.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Roll Number
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Semester
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.length > 0 ? (
                  students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          to={`/students/${student.id}`} 
                          className="text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          {student.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.roll_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                          {student.department}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.semester}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div>{student.phone}</div>
                        <div className="text-xs text-gray-400">{student.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <Link 
                            to={`/students/${student.id}`} 
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Edit className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => {
                              setSelectedStudent(student);
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
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      No students found
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

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Student"
      >
        <form onSubmit={handleAddStudent}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={newStudent.name}
                onChange={handleNewStudentChange}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="roll_number" className="block text-sm font-medium text-gray-700 mb-1">
                Roll Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="roll_number"
                name="roll_number"
                value={newStudent.roll_number}
                onChange={handleNewStudentChange}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                Department <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="department"
                name="department"
                value={newStudent.department}
                onChange={handleNewStudentChange}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="semester" className="block text-sm font-medium text-gray-700 mb-1">
                Semester <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="semester"
                name="semester"
                value={newStudent.semester}
                onChange={handleNewStudentChange}
                min="1"
                max="12"
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={newStudent.phone}
                onChange={handleNewStudentChange}
                required
                className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={newStudent.email}
                onChange={handleNewStudentChange}
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
              {loading ? 'Adding...' : 'Add Student'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Student"
        size="sm"
      >
        <p className="text-sm text-gray-500">
          Are you sure you want to delete "{selectedStudent?.name}"? This action cannot be undone.
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
            onClick={handleDeleteStudent}
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

export default Students;