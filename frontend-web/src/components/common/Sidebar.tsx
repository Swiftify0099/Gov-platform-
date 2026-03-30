import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import {
  LayoutDashboard, BookOpen, ClipboardList, User, Users,
  HelpCircle, BarChart2, AlertTriangle, GraduationCap,
  Building2, CreditCard, Settings, ChevronLeft, ChevronRight,
  LogOut,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { RootState } from '../../store';
import { logout } from '../../store/authSlice';

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  roles: string[];
}

const navItems: NavItem[] = [
  { label: 'nav.dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard', roles: ['student', 'institute_admin', 'super_admin'] },
  { label: 'nav.assignments', icon: <ClipboardList size={18} />, path: '/assignments', roles: ['student'] },
  { label: 'nav.results', icon: <BarChart2 size={18} />, path: '/results', roles: ['student'] },
  { label: 'nav.profile', icon: <User size={18} />, path: '/profile', roles: ['student'] },
  { label: 'nav.students', icon: <Users size={18} />, path: '/admin/students', roles: ['institute_admin'] },
  { label: 'nav.questions', icon: <HelpCircle size={18} />, path: '/admin/questions', roles: ['institute_admin'] },
  { label: 'nav.assignments', icon: <ClipboardList size={18} />, path: '/admin/assignments', roles: ['institute_admin'] },
  { label: 'nav.violations', icon: <AlertTriangle size={18} />, path: '/admin/violations', roles: ['institute_admin'] },
  { label: 'nav.analytics', icon: <BarChart2 size={18} />, path: '/admin/analytics', roles: ['institute_admin'] },
  { label: 'nav.institutes', icon: <Building2 size={18} />, path: '/superadmin/institutes', roles: ['super_admin'] },
  { label: 'nav.plans', icon: <CreditCard size={18} />, path: '/superadmin/plans', roles: ['super_admin'] },
  { label: 'nav.payment_settings', icon: <Settings size={18} />, path: '/superadmin/payment-settings', roles: ['super_admin'] },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed = false, onToggle }) => {
  const { t } = useTranslation();
  const { user } = useSelector((s: RootState) => s.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const userRole = user?.role || 'student';
  const filteredItems = navItems.filter((item) => item.roles.includes(userRole));

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <motion.div
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="h-screen flex flex-col bg-slate-900 border-r border-slate-800 fixed left-0 top-0 z-40 overflow-hidden"
    >
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-800 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="font-bold text-white text-sm whitespace-nowrap"
            >
              GovExam Prep
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
              ${isActive
                ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }
              ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? t(item.label) : undefined}
          >
            <span className="flex-shrink-0">{item.icon}</span>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="whitespace-nowrap"
                >
                  {t(item.label)}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all ${collapsed ? 'justify-center' : ''}`}
          title={collapsed ? t('common.logout') : undefined}
        >
          <LogOut size={18} />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {t('common.logout')}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Toggle button */}
      {onToggle && (
        <button
          onClick={onToggle}
          className="absolute top-1/2 -right-3 w-6 h-6 bg-slate-700 border border-slate-600 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-600 transition-colors z-50"
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      )}
    </motion.div>
  );
};
