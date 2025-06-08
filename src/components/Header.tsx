import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Menu, Search, Bell, User } from 'lucide-react';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Header: FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <header className="sticky top-0 bg-white border-b border-gray-200 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 -mb-px">
          {/* Header: Left side */}
          <div className="flex">
            {/* Hamburger button */}
            <button
              className="text-gray-500 hover:text-gray-600 lg:hidden"
              aria-controls="sidebar"
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span className="sr-only">Open sidebar</span>
              <Menu className="w-6 h-6 fill-current" />
            </button>
          </div>

          {/* Header: Right side */}
          <div className="flex items-center space-x-3">
            <div>
              <button
                className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition duration-150 rounded-full"
                aria-controls="search-modal"
              >
                <span className="sr-only">Search</span>
                <Search className="w-4 h-4" />
              </button>
            </div>
            <div>
              <button
                className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition duration-150 rounded-full"
                aria-controls="notification-modal"
              >
                <span className="sr-only">Notifications</span>
                <Bell className="w-4 h-4" />
              </button>
            </div>
            {/* User button */}
            <div className="relative inline-flex">
              <button
                className="inline-flex justify-center items-center group"
                aria-haspopup="true"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition duration-150 rounded-full">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex items-center truncate">
                  <span className="truncate ml-2 text-sm font-medium group-hover:text-gray-800">
                    Admin User
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;