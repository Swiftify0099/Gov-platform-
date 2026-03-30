import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Users, Search } from 'lucide-react';
import apiClient from '../../api/client';
import { StudentTable } from '../../components/admin/StudentTable';
import { Loader } from '../../components/common/Loader';

const StudentsPage: React.FC = () => {
  const { t } = useTranslation();
  const [students, setStudents] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/admin/students');
      setStudents(data.students || []);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleToggleActive = async (id: string) => {
    try {
      await apiClient.patch(`/users/${id}/toggle-active`);
      fetchStudents();
    } catch {}
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Users className="w-6 h-6 text-indigo-400" />
          {t('admin.students')}
        </h1>
        <p className="text-slate-400 text-sm">{students.length} {t('admin.total_students')}</p>
      </motion.div>

      {loading ? (
        <Loader />
      ) : (
        <StudentTable
          students={students as Parameters<typeof StudentTable>[0]['students']}
          onToggleActive={handleToggleActive}
        />
      )}
    </div>
  );
};

export default StudentsPage;
