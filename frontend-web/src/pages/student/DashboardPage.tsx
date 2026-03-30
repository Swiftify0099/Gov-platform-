import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import apiClient from '../../api/client';
import { Assignment } from '../../types';
import { Calendar, Clock, BookOpen, TrendingUp, Award, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';

export const DashboardPage: React.FC = () => {
  const { user } = useSelector((s: RootState) => s.auth);
  const { t } = useTranslation();
  const [upcomingAssignments, setUpcomingAssignments] = useState<Assignment[]>([]);
  const [liveAssignments, setLiveAssignments] = useState<Assignment[]>([]);
  const [stats, setStats] = useState({ total: 0, avg: 0, best: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [upcoming, live, analytics] = await Promise.all([
          apiClient.get('/api/assignments/upcoming'),
          apiClient.get('/api/assignments/live'),
          apiClient.get('/api/analytics/student/me'),
        ]);
        setUpcomingAssignments(upcoming.data.slice(0, 5));
        setLiveAssignments(live.data);
        setStats(analytics.data);
      } catch (e) {}
    };
    fetchData();
  }, []);

  // Redirect if no profile photo
  if (!user?.profile_photo_url) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <motion.div
          className="bg-slate-800 rounded-2xl border border-orange-500/40 p-8 text-center max-w-sm"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="w-8 h-8 text-orange-400" />
          </div>
          <h2 className="text-white text-xl font-bold mb-2">Complete Your Profile</h2>
          <p className="text-slate-400 mb-6">Upload a profile photo to access assignments. It's used for exam verification.</p>
          <Link to="/profile-setup">
            <motion.button
              className="w-full bg-gradient-to-r from-orange-500 to-amber-600 text-white font-semibold py-3 rounded-xl"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Setup Profile →
            </motion.button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 pb-16">
      <div className="max-w-5xl mx-auto px-4 pt-8">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-bold text-white">
            {t('dashboard.welcome')}, {user?.name?.split(' ')[0] || 'Student'} 👋
          </h1>
          <p className="text-slate-400 mt-1">Ready for today's challenge?</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { icon: BookOpen, label: 'Exams Taken', value: stats.total, color: 'from-blue-500 to-indigo-600' },
            { icon: TrendingUp, label: 'Avg Score', value: `${stats.avg}%`, color: 'from-green-500 to-emerald-600' },
            { icon: Award, label: 'Best Score', value: `${stats.best}%`, color: 'from-yellow-500 to-amber-600' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="bg-slate-800 rounded-2xl border border-slate-700 p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-slate-400 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Live Assignments */}
        {liveAssignments.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <h2 className="text-white font-bold text-lg">Live Now</h2>
            </div>
            <div className="space-y-3">
              {liveAssignments.map((a) => (
                <motion.div
                  key={a.id}
                  className="bg-gradient-to-r from-red-900/30 to-rose-900/30 border border-red-500/40 rounded-2xl p-5 flex items-center justify-between"
                  whileHover={{ scale: 1.01 }}
                >
                  <div>
                    <h3 className="text-white font-semibold">{a.title}</h3>
                    <div className="flex gap-3 mt-1 text-sm text-slate-400">
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {a.duration_minutes}m</span>
                      <span>{a.total_marks} marks</span>
                      {a.exam_stream && <span className="bg-slate-700 px-2 py-0.5 rounded text-xs">{a.exam_stream}</span>}
                    </div>
                  </div>
                  <Link to={`/exam/${a.id}`}>
                    <motion.button
                      className="bg-red-500 hover:bg-red-600 text-white font-semibold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      Start <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Assignments */}
        <div className="mt-8">
          <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" /> Upcoming Assignments
          </h2>
          {upcomingAssignments.length === 0 ? (
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 text-center">
              <p className="text-slate-400">No upcoming assignments. Check back later!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAssignments.map((a, i) => (
                <motion.div
                  key={a.id}
                  className="bg-slate-800 border border-slate-700 rounded-2xl p-5 flex items-center justify-between hover:border-slate-600 transition-colors"
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div>
                    <h3 className="text-white font-medium">{a.title}</h3>
                    <div className="flex gap-3 mt-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(a.start_time), 'dd MMM, hh:mm a')}
                      </span>
                      <span><Clock className="w-3.5 h-3.5 inline mr-0.5" />{a.duration_minutes}m</span>
                      <span>{a.total_marks} marks</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    a.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'
                  }`}>
                    {a.status}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
