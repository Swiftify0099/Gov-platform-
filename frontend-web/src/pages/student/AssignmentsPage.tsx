import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Calendar, Clock, ChevronRight, BookOpen, AlertCircle } from 'lucide-react';
import { assignmentsApi } from '../../api/assignments';
import { Assignment } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { useNavigate } from 'react-router-dom';

type TabType = 'upcoming' | 'live' | 'completed';

const AssignmentsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('upcoming');

  useEffect(() => {
    const fetchAssignments = async () => {
      setLoading(true);
      try {
        const data = await assignmentsApi.list();
        setAssignments(data);
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  const now = new Date();

  const categorize = (assignment: Assignment): TabType => {
    const startDateTime = new Date(`${assignment.scheduled_date}T${assignment.start_time}`);
    const endDateTime = new Date(`${assignment.scheduled_date}T${assignment.end_time}`);
    if (now >= startDateTime && now <= endDateTime) return 'live';
    if (now > endDateTime) return 'completed';
    return 'upcoming';
  };

  const filtered = assignments.filter((a) => categorize(a) === activeTab);

  const tabs: { key: TabType; label: string }[] = [
    { key: 'upcoming', label: t('dashboard.upcoming') },
    { key: 'live', label: t('dashboard.live_now') },
    { key: 'completed', label: t('results.title') },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white mb-1">{t('nav.assignments')}</h1>
        <p className="text-slate-400 text-sm mb-6">All your scheduled exams</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-800/60 p-1 rounded-xl mb-6 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
            {tab.key === 'live' && (
              <span className="ml-1.5 w-2 h-2 rounded-full bg-red-500 inline-block animate-pulse" />
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader text="Loading assignments..." />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>{t('dashboard.no_assignments')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((assignment, i) => (
            <motion.div
              key={assignment.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="group" hover>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={categorize(assignment) === 'live' ? 'error' : 'info'}>
                        {assignment.exam_stream}
                      </Badge>
                      {categorize(assignment) === 'live' && (
                        <Badge variant="error">● LIVE</Badge>
                      )}
                    </div>
                    <h3 className="text-white font-semibold truncate">{assignment.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-slate-400 text-xs">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {assignment.scheduled_date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {assignment.start_time} – {assignment.end_time}
                      </span>
                      <span>{assignment.total_marks} marks</span>
                    </div>
                  </div>
                  {categorize(assignment) === 'live' && (
                    <Button
                      size="sm"
                      onClick={() => navigate(`/exam/${assignment.id}`)}
                      rightIcon={<ChevronRight className="w-4 h-4" />}
                    >
                      {t('exam.start')}
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AssignmentsPage;
