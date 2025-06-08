import { FC, ReactNode } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Layout: FC<LayoutProps> = ({ children, sidebarOpen, setSidebarOpen }) => {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      {/* Main content */}
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        
        {/* Main content */}
        <main className="flex-grow px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;