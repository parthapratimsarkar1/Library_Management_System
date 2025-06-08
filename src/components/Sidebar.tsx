import { FC, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Library, BookOpen, Users, Calendar, BarChart, Settings, X } from 'lucide-react';

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar: FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const location = useLocation();
  const { pathname } = location;
  
  const trigger = useRef<HTMLButtonElement>(null);
  const sidebar = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!sidebar.current || !trigger.current) return;
      if (!sidebarOpen || sidebar.current.contains(target as Node) || trigger.current.contains(target as Node)) return;
      setSidebarOpen(false);
    };
    document.addEventListener('click', clickHandler);
    return () => document.removeEventListener('click', clickHandler);
  });

  // Close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!sidebarOpen || keyCode !== 27) return;
      setSidebarOpen(false);
    };
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  });

  return (
    <div>
      {/* Sidebar backdrop (mobile only) */}
      <div
        className={`fixed inset-0 bg-gray-900 bg-opacity-30 z-40 lg:hidden lg:z-auto transition-opacity duration-200 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* Sidebar */}
      <div
        id="sidebar"
        ref={sidebar}
        className={`absolute z-40 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 transform h-screen overflow-y-scroll lg:overflow-y-auto no-scrollbar w-64 flex-shrink-0 bg-white p-4 transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-64'
        }`}
      >
        {/* Sidebar header */}
        <div className="flex justify-between mb-10 pr-3 sm:px-2">
          {/* Logo */}
          <NavLink to="/" className="flex items-center">
            <Library className="w-8 h-8 text-indigo-600" />
            <span className="text-xl font-bold ml-2 text-gray-800">LibraryMS</span>
          </NavLink>
          {/* Close button */}
          <button
            ref={trigger}
            className="lg:hidden text-gray-500 hover:text-gray-400"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-controls="sidebar"
            aria-expanded={sidebarOpen}
          >
            <span className="sr-only">Close sidebar</span>
            <X className="w-6 h-6 fill-current" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="space-y-8">
          <div>
            <h3 className="text-xs uppercase text-gray-500 font-semibold pl-3">
              Main
            </h3>
            <ul className="mt-3">
              {/* Dashboard */}
              <li className="px-3 py-2 rounded-md mb-0.5 last:mb-0">
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `block transition duration-150 ${
                      isActive
                        ? 'text-indigo-500'
                        : 'text-gray-600 hover:text-gray-900'
                    }`
                  }
                  end
                >
                  <div className="flex items-center">
                    <BarChart className="flex-shrink-0 h-6 w-6" />
                    <span className="text-sm font-medium ml-3">Dashboard</span>
                  </div>
                </NavLink>
              </li>
              {/* Books */}
              <li className="px-3 py-2 rounded-md mb-0.5 last:mb-0">
                <NavLink
                  to="/books"
                  className={({ isActive }) =>
                    `block transition duration-150 ${
                      isActive
                        ? 'text-indigo-500'
                        : 'text-gray-600 hover:text-gray-900'
                    }`
                  }
                >
                  <div className="flex items-center">
                    <BookOpen className="flex-shrink-0 h-6 w-6" />
                    <span className="text-sm font-medium ml-3">Books</span>
                  </div>
                </NavLink>
              </li>
              {/* Students */}
              <li className="px-3 py-2 rounded-md mb-0.5 last:mb-0">
                <NavLink
                  to="/students"
                  className={({ isActive }) =>
                    `block transition duration-150 ${
                      isActive
                        ? 'text-indigo-500'
                        : 'text-gray-600 hover:text-gray-900'
                    }`
                  }
                >
                  <div className="flex items-center">
                    <Users className="flex-shrink-0 h-6 w-6" />
                    <span className="text-sm font-medium ml-3">Students</span>
                  </div>
                </NavLink>
              </li>
              {/* Issues */}
              <li className="px-3 py-2 rounded-md mb-0.5 last:mb-0">
                <NavLink
                  to="/issues"
                  className={({ isActive }) =>
                    `block transition duration-150 ${
                      isActive
                        ? 'text-indigo-500'
                        : 'text-gray-600 hover:text-gray-900'
                    }`
                  }
                >
                  <div className="flex items-center">
                    <Calendar className="flex-shrink-0 h-6 w-6" />
                    <span className="text-sm font-medium ml-3">Book Issues</span>
                  </div>
                </NavLink>
              </li>
            </ul>
          </div>
          {/* Settings section */}
          <div>
            <h3 className="text-xs uppercase text-gray-500 font-semibold pl-3">
              Settings
            </h3>
            <ul className="mt-3">
              <li className="px-3 py-2 rounded-md mb-0.5 last:mb-0">
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    `block transition duration-150 ${
                      isActive
                        ? 'text-indigo-500'
                        : 'text-gray-600 hover:text-gray-900'
                    }`
                  }
                >
                  <div className="flex items-center">
                    <Settings className="flex-shrink-0 h-6 w-6" />
                    <span className="text-sm font-medium ml-3">Settings</span>
                  </div>
                </NavLink>
              </li>
            </ul>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;