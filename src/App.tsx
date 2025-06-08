import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import BookDetails from './pages/BookDetails';
import Students from './pages/Students';
import StudentDetails from './pages/StudentDetails';
import Issues from './pages/Issues';
import NotFound from './pages/NotFound';
import Layout from './components/Layout';

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-gray-50">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <Layout sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/books" element={<Books />} />
          <Route path="/books/:id" element={<BookDetails />} />
          <Route path="/students" element={<Students />} />
          <Route path="/students/:id" element={<StudentDetails />} />
          <Route path="/issues" element={<Issues />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </div>
  );
}

export default App;