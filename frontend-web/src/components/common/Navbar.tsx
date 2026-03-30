import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { RootState, AppDispatch } from '../../store';
import { logout } from '../../store/authSlice';
import { LanguageToggle } from './LanguageToggle';
import { BookOpen, Menu, X, LogOut, User, LayoutDashboard } from 'lucide-react';
import apiClient from '../../api/client';

export const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, isAuthenticated } = useSelector((s: RootState) => s.auth);
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();

  const handleLogout = async () => {
    try { await apiClient.post('/api/auth/logout'); } catch (e) {}
    dispatch(logout());
  };

  const navLinks = {
    student: [
      { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { label: 'Assignments', href: '/assignments', icon: BookOpen },
      { label: 'Profile', href: '/profile', icon: User },
    ],
    institute_admin: [
      { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      { label: 'Students', href: '/admin/students', icon: User },
      { label: 'Questions', href: '/admin/questions', icon: BookOpen },
      { label: 'Assignments', href: '/admin/assignments', icon: BookOpen },
    ],
    super_admin: [
      { label: 'Dashboard', href: '/superadmin', icon: LayoutDashboard },
      { label: 'Institutes', href: '/superadmin/institutes', icon: BookOpen },
      { label: 'Plans', href: '/superadmin/plans', icon: BookOpen },
    ],
  };

  const links = user ? (navLinks[user.role as keyof typeof navLinks] || []) : [];

  return (
    <nav className="bg-slate-900/90 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-white text-lg">ExamPrep</span>
        </Link>

        {/* Desktop Nav */}
        {isAuthenticated && (
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === link.href
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <LanguageToggle />
          {isAuthenticated && (
            <>
              <div className="hidden md:flex items-center gap-2">
                {user?.profile_photo_url ? (
                  <img
                    src={user.profile_photo_url}
                    alt="profile"
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-700"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
                <span className="text-slate-300 text-sm font-medium hidden lg:block">
                  {user?.name?.split(' ')[0]}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center gap-1.5 text-slate-400 hover:text-red-400 text-sm transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden text-slate-400 hover:text-white"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="md:hidden bg-slate-900 border-t border-slate-800 px-4 pb-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 py-3 text-slate-300 hover:text-white border-b border-slate-800 text-sm"
              >
                <link.icon className="w-4 h-4" /> {link.label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 py-3 text-red-400 text-sm w-full mt-1"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
