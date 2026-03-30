import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Plus, Calendar, Clock, ClipboardList } from 'lucide-react';
import { assignmentsApi } from '../../api/assignments';
import { Assignment } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Loader } from '../../components/common/Loader';

const EXAM_STREAMS = ['MPSC', 'UPSC', 'Group B', 'Group C', 'Group D', 'All India Services'];

const AssignmentsAdminPage: React.FC = () => {
  const { t } = useTranslation();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', exam_stream: 'MPSC',
    scheduled_date: '', start_time: '', end_time: '',
    duration_minutes: 60, total_marks: 100, passing_marks: 40,
    negative_marking_enabled: false,
  });

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const data = await assignmentsApi.list();
      setAssignments(data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAssignments(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await assignmentsApi.create(form);
      setShowModal(false);
      fetchAssignments();
    } catch {}
    finally { setFormLoading(false); }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('admin.assignments')}</h1>
          <p className="text-slate-400 text-sm">{assignments.length} {t('admin.total_assignments')}</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>
          {t('admin.create_assignment')}
        </Button>
      </div>

      {loading ? (
        <Loader />
      ) : assignments.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>{t('admin.no_assignments')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {assignments.map((a, i) => (
            <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card padding="sm">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="info">{a.exam_stream}</Badge>
                      <Badge variant={a.is_active ? 'success' : 'neutral'}>{a.is_active ? 'Active' : 'Inactive'}</Badge>
                    </div>
                    <h3 className="text-white font-semibold">{a.title}</h3>
                    <div className="flex gap-4 mt-1.5 text-slate-400 text-xs">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{a.scheduled_date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.start_time} – {a.end_time}</span>
                      <span>{a.total_marks} marks</span>
                      <span>{a.duration_minutes} min</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => assignmentsApi.delete(a.id).then(fetchAssignments)}>
                    {t('common.delete')}
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={t('admin.create_assignment')} size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label={t('admin.assignment_title')} value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Exam Stream</label>
            <select className="w-full bg-slate-800/60 border border-slate-700 rounded-xl text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.exam_stream} onChange={(e) => setForm((p) => ({ ...p, exam_stream: e.target.value }))}>
              {EXAM_STREAMS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <Input label={t('admin.scheduled_date')} type="date" value={form.scheduled_date} onChange={(e) => setForm((p) => ({ ...p, scheduled_date: e.target.value }))} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label={t('admin.start_time')} type="time" value={form.start_time} onChange={(e) => setForm((p) => ({ ...p, start_time: e.target.value }))} required />
            <Input label={t('admin.end_time')} type="time" value={form.end_time} onChange={(e) => setForm((p) => ({ ...p, end_time: e.target.value }))} required />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Duration (min)" type="number" value={form.duration_minutes} onChange={(e) => setForm((p) => ({ ...p, duration_minutes: parseInt(e.target.value) }))} />
            <Input label="Total Marks" type="number" value={form.total_marks} onChange={(e) => setForm((p) => ({ ...p, total_marks: parseInt(e.target.value) }))} />
            <Input label="Passing Marks" type="number" value={form.passing_marks} onChange={(e) => setForm((p) => ({ ...p, passing_marks: parseInt(e.target.value) }))} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.negative_marking_enabled} onChange={(e) => setForm((p) => ({ ...p, negative_marking_enabled: e.target.checked }))} />
            <span className="text-sm text-slate-300">{t('admin.negative_marking')}</span>
          </label>
          <Button type="submit" fullWidth isLoading={formLoading}>{t('admin.create_assignment')}</Button>
        </form>
      </Modal>
    </div>
  );
};

export default AssignmentsAdminPage;
