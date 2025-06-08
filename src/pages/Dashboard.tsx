import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';
import PageTitle from '../components/PageTitle';
import { getBooks } from '../api/bookService';
import { getStudents } from '../api/studentService';
import { getIssues } from '../api/issueService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalStudents: 0,
    issuedBooks: 0,
    overdueBooks: 0,
  });
  const [recentIssues, setRecentIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch basic stats
        const [booksRes, studentsRes, issuesRes] = await Promise.all([
          getBooks({ limit: 1 }),
          getStudents({ limit: 1 }),
          getIssues({ limit: 10 })
        ]);
        
        // Count overdue books
        const today = new Date();
        const overdueBooks = issuesRes.issues.filter(issue => 
          issue.status === 'issued' && 
          new Date(issue.due_date) < today
        ).length;
        
        setStats({
          totalBooks: booksRes.pagination.total,
          totalStudents: studentsRes.pagination.total,
          issuedBooks: issuesRes.issues.filter(issue => issue.status === 'issued').length,
          overdueBooks,
        });
        
        setRecentIssues(issuesRes.issues);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  // Format date function
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div>
      <PageTitle 
        title="Dashboard" 
        subtitle="Welcome to the Library Management System"
      />
      
      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total Books */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-blue-100 rounded-full p-3">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500 truncate">Total Books</p>
                  <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalBooks}</p>
                </div>
              </div>
              <div className="mt-4">
                <Link to="/books" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                  View all books →
                </Link>
              </div>
            </div>
            
            {/* Total Students */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-teal-500">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-teal-100 rounded-full p-3">
                  <Users className="h-8 w-8 text-teal-600" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500 truncate">Total Students</p>
                  <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.totalStudents}</p>
                </div>
              </div>
              <div className="mt-4">
                <Link to="/students" className="text-sm font-medium text-teal-600 hover:text-teal-500">
                  View all students →
                </Link>
              </div>
            </div>
            
            {/* Issued Books */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-purple-100 rounded-full p-3">
                  <Calendar className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500 truncate">Issued Books</p>
                  <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.issuedBooks}</p>
                </div>
              </div>
              <div className="mt-4">
                <Link to="/issues" className="text-sm font-medium text-purple-600 hover:text-purple-500">
                  View all issues →
                </Link>
              </div>
            </div>
            
            {/* Overdue Books */}
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-500">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-amber-100 rounded-full p-3">
                  <AlertTriangle className="h-8 w-8 text-amber-600" />
                </div>
                <div className="ml-5">
                  <p className="text-sm font-medium text-gray-500 truncate">Overdue Books</p>
                  <p className="mt-1 text-3xl font-semibold text-gray-900">{stats.overdueBooks}</p>
                </div>
              </div>
              <div className="mt-4">
                <Link to="/issues?status=issued" className="text-sm font-medium text-amber-600 hover:text-amber-500">
                  View overdue books →
                </Link>
              </div>
            </div>
          </div>
          
          {/* Recent Book Issues */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Book Issues</h3>
            </div>
            <div className="bg-white overflow-hidden">
              <div className="flow-root">
                <div className="-my-2 overflow-x-auto">
                  <div className="py-2 align-middle inline-block min-w-full">
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
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {recentIssues.length > 0 ? (
                          recentIssues.map((issue) => (
                            <tr key={issue.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {issue.book_title}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {issue.student_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(issue.issue_date)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(issue.due_date)}
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
                              No recent book issues found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;