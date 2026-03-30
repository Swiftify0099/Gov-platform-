import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import apiClient from '../../api/client';
import { Users, BookOpen, FileText, AlertTriangle, Plus, TrendingUp, Award } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    total_students: 0,
    total_assignments: 0,
    total_questions: 0,
    total_violations: 0,
    avg_score: 0,
    active_now: 0,
  });

  useEffect(() => {
    apiClient.get('/api/analytics/institute').then(r => setStats(r.data)).catch(() => {});
  }, []);

  const statCards = [
    { icon: Users, label: 'Students', value: stats.total_students, color: 'from-blue-500 to-indigo-600', href: '/admin/students' },
    { icon: FileText, label: 'Assignments', value: stats.total_assignments, color: 'from-green-500 to-emerald-600', href: '/admin/assignments' },
    { icon: BookOpen, label: 'Questions', value: stats.total_questions, color: 'from-purple-500 to-violet-600', href: '/admin/questions' },
    { icon: AlertTriangle, label: 'Violations', value: stats.total_violations, color: 'from-red-500 to-rose-600', href: '/admin/violations' },
  ];

  const quickActions = [
    { label: 'Add Question', icon: Plus, href: '/admin/questions/new', color: 'bg-purple-600 hover:bg-purple-700' },
    { label: 'New Assignment', icon: Plus, href: '/admin/assignments/new', color: 'bg-green-600 hover:bg-green-700' },
    { label: 'Bulk Upload', icon: FileText, href: '/admin/questions/bulk', color: 'bg-blue-600 hover:bg-blue-700' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 pb-16">
      <div className="max-w-6xl mx-auto px-4 pt-8">
        <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400 mt-1">Manage your institute's exam platform</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {statCards.map((card, i) => (
            <Link key={card.label} to={card.href}>
              <motion.div
                className={`bg-gradient-to-br ${card.color} rounded-2xl p-5 cursor-pointer shadow-lg`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
              >
                <card.icon className="w-7 h-7 text-white/80 mb-3" />
                <p className="text-3xl font-bold text-white">{card.value.toLocaleString()}</p>
                <p className="text-white/70 text-sm mt-1">{card.label}</p>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-white font-semibold mb-3">Quick Actions</h2>
          <div className="flex gap-3 flex-wrap">
            {quickActions.map((action) => (
              <Link key={action.label} to={action.href}>
                <motion.button
                  className={`${action.color} text-white font-medium px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors text-sm`}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <action.icon className="w-4 h-4" />
                  {action.label}
                </motion.button>
              </Link>
            ))}
          </div>
        </div>

        {/* Performance Overview */}
        <div className="mt-8 bg-slate-800 rounded-2xl border border-slate-700 p-6">
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-400" /> Performance Overview
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-700/50 rounded-xl p-4">
              <p className="text-slate-400 text-sm">Average Score</p>
              <p className="text-2xl font-bold text-white mt-1">{stats.avg_score}%</p>
            </div>
            <div className="bg-slate-700/50 rounded-xl p-4">
              <p className="text-slate-400 text-sm">Currently Active</p>
              <p className="text-2xl font-bold text-white mt-1">
                {stats.active_now}
                <span className="text-green-400 text-sm ml-2">students</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
