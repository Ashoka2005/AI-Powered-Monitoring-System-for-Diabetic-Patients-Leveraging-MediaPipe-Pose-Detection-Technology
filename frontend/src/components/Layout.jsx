import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiActivity, FiHeart, FiCoffee, FiMessageCircle, FiCalendar, FiUser, FiLogOut, FiMenu, FiX } from 'react-icons/fi';
import { useState } from 'react';

const navItems = [
  { path: '/dashboard', icon: <FiHome />, label: 'Dashboard' },
  { path: '/exercise', icon: <FiActivity />, label: 'Exercises' },
  { path: '/health', icon: <FiHeart />, label: 'Health Log' },
  { path: '/diet', icon: <FiCoffee />, label: 'Diet Plan' },
  { path: '/chat', icon: <FiMessageCircle />, label: 'AI Chatbot' },
  { path: '/appointments', icon: <FiCalendar />, label: 'Appointments' },
  { path: '/profile', icon: <FiUser />, label: 'Profile' },
];

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex lg:w-64 bg-white border-r border-gray-200 flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">D</div>
            <span className="font-bold text-lg">DiaFit AI</span>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} className={location.pathname === item.path ? 'sidebar-link-active' : 'sidebar-link'}>
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-sm">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600">
            <FiLogOut /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-white flex flex-col z-10">
            <div className="p-4 border-b flex items-center justify-between">
              <span className="font-bold text-lg">DiaFit AI</span>
              <button onClick={() => setSidebarOpen(false)}><FiX className="w-6 h-6" /></button>
            </div>
            <nav className="flex-1 p-4 space-y-1">
              {navItems.map((item) => (
                <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} className={location.pathname === item.path ? 'sidebar-link-active' : 'sidebar-link'}>
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
            <div className="p-4 border-t">
              <button onClick={handleLogout} className="sidebar-link w-full text-red-500">
                <FiLogOut /> Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)}><FiMenu className="w-6 h-6" /></button>
          <span className="font-bold">DiaFit AI</span>
          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-sm">
            {user?.firstName?.[0]}
          </div>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
