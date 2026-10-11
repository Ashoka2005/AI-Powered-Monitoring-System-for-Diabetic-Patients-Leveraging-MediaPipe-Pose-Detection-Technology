import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiHome, FiActivity, FiHeart, FiCoffee, FiMessageCircle, FiCalendar, FiUser, FiLogOut, FiMenu, FiX, FiSmartphone, FiDownload } from 'react-icons/fi';
import { useState } from 'react';
import MobileInstallModal from './MobileInstallModal';

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
  const [installModalOpen, setInstallModalOpen] = useState(false);

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
        
        {/* Mobile App Download Card in Sidebar */}
        <div className="px-4 mb-2">
          <button
            onClick={() => setInstallModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
          >
            <FiSmartphone className="text-base" /> Download Mobile App
          </button>
        </div>

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
            <div className="p-4 border-t space-y-2">
              <button
                onClick={() => { setSidebarOpen(false); setInstallModalOpen(true); }}
                className="sidebar-link w-full text-primary-600 bg-primary-50 font-bold"
              >
                <FiDownload /> Download Mobile App
              </button>
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
        <header className="lg:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <button onClick={() => setSidebarOpen(true)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-700">
              <FiMenu className="w-6 h-6" />
            </button>
            <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">D</div>
            <span className="font-bold text-gray-900 tracking-tight">DiaFit AI</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setInstallModalOpen(true)}
              className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-xs transition"
            >
              <FiDownload className="w-3.5 h-3.5" /> Download App
            </button>
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-semibold text-xs border border-primary-200">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
          </div>
        </header>
        
        {/* Content area with bottom padding on mobile to clear bottom nav */}
        <main className="flex-1 overflow-auto pb-20 lg:pb-0">{children}</main>

        {/* Mobile Bottom Navigation Bar (Native Mobile App Experience) */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-2 py-1.5 flex justify-around items-center shadow-lg">
          {[
            { path: '/dashboard', icon: <FiHome className="w-5 h-5" />, label: 'Home' },
            { path: '/exercise', icon: <FiActivity className="w-5 h-5" />, label: 'Exercise' },
            { path: '/health', icon: <FiHeart className="w-5 h-5" />, label: 'Health' },
            { path: '/diet', icon: <FiCoffee className="w-5 h-5" />, label: 'Diet' },
            { path: '/chat', icon: <FiMessageCircle className="w-5 h-5" />, label: 'Chat' },
            { path: '/profile', icon: <FiUser className="w-5 h-5" />, label: 'Profile' },
          ].map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
                  isActive
                    ? 'text-primary-600 font-bold scale-105'
                    : 'text-gray-500 hover:text-gray-900 font-medium'
                }`}
              >
                <div className={`p-1 rounded-full ${isActive ? 'bg-primary-50' : ''}`}>
                  {item.icon}
                </div>
                <span className="text-[10px] tracking-tight">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile App Download & Install Modal */}
      <MobileInstallModal isOpen={installModalOpen} onClose={() => setInstallModalOpen(false)} />
    </div>
  );
}
