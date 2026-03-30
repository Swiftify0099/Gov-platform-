import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, HelpCircle } from 'lucide-react';
import { questionsApi } from '../../api/questions';
import { Question } from '../../types';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { QuestionForm } from '../../components/admin/QuestionForm';
import { BulkUpload } from '../../components/admin/BulkUpload';
import { Loader } from '../../components/common/Loader';

const QuestionsPage: React.FC = () => {
  const { t } = useTranslation();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [search, setSearch] = useState('');

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const data = await questionsApi.list({ limit: 50 });
      setQuestions(data.questions || data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchQuestions(); }, []);

  const difficultyColor = {
    Easy: 'success' as const,
    Medium: 'warning' as const,
    Hard: 'error' as const,
  };

  const filtered = questions.filter((q) =>
    q.text.toLowerCase().includes(search.toLowerCase()) ||
    q.topic?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">{t('admin.questions')}</h1>
          <p className="text-slate-400 text-sm">{questions.length} {t('admin.total_questions')}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowBulkModal(true)}>
            {t('admin.bulk_upload')}
          </Button>
          <Button size="sm" leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowAddModal(true)}>
            {t('admin.add_question')}
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          className="w-full bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <Loader />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <HelpCircle className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>{t('admin.no_questions')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((question, i) => (
            <motion.div key={question.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card padding="sm">
                <div className="flex items-start gap-4">
                  <span className="text-slate-600 text-sm font-mono mt-0.5">{i + 1}.</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 text-sm mb-2 line-clamp-2">{question.text}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={difficultyColor[question.difficulty as keyof typeof difficultyColor] || 'neutral'} size="sm">
                        {question.difficulty}
                      </Badge>
                      {question.topic && <Badge variant="info" size="sm">{question.topic}</Badge>}
                      <Badge variant="neutral" size="sm">+{question.marks} / -{question.negative_marks}</Badge>
                      <Badge variant="neutral" size="sm">{question.language?.toUpperCase()}</Badge>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Question Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={t('admin.add_question')} size="lg">
        <QuestionForm onSuccess={() => { setShowAddModal(false); fetchQuestions(); }} />
      </Modal>

      {/* Bulk Upload Modal */}
      <Modal isOpen={showBulkModal} onClose={() => setShowBulkModal(false)} title={t('admin.bulk_upload')} size="lg">
        <BulkUpload />
      </Modal>
    </div>
  );
};

export default QuestionsPage;
