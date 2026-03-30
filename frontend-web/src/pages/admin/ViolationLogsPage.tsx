import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { AlertTriangle, Camera, Clock } from 'lucide-react';
import apiClient from '../../api/client';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Loader } from '../../components/common/Loader';

interface ViolationLog {
  id: string;
  student_name: string;
  violation_type: string;
  detected_at: string;
  screenshot_url?: string;
  submission_id: string;
}

const ViolationLogsPage: React.FC = () => {
  const { t } = useTranslation();
  const [violations, setViolations] = useState<ViolationLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await apiClient.get('/violations', { params: { limit: 100 } });
        setViolations(data.violations || data);
      } catch {}
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const violationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      multiple_faces: t('violations.multiple_faces'),
      no_face: t('violations.no_face'),
      phone_detected: t('violations.phone_detected'),
      book_detected: t('violations.book_detected'),
      tab_switch: t('violations.tab_switch'),
      devtools: t('violations.devtools'),
      fullscreen_exit: t('violations.fullscreen_exit'),
    };
    return labels[type] || type;
  };

  const severityVariant = (type: string) => {
    const critical = ['multiple_faces', 'phone_detected', 'book_detected'];
    return critical.includes(type) ? 'error' : 'warning';
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-amber-400" />
          {t('admin.violations')}
        </h1>
        <p className="text-slate-400 text-sm">{violations.length} {t('admin.total_violations')}</p>
      </motion.div>

      {loading ? (
        <Loader />
      ) : violations.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p>No violations found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {violations.map((v, i) => (
            <motion.div key={v.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
              <Card padding="sm">
                <div className="flex items-center gap-4">
                  {v.screenshot_url ? (
                    <img
                      src={v.screenshot_url}
                      alt="violation"
                      className="w-16 h-16 rounded-lg object-cover border border-slate-700 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-slate-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Camera className="w-6 h-6 text-slate-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={severityVariant(v.violation_type)}>
                        {violationTypeLabel(v.violation_type)}
                      </Badge>
                    </div>
                    <p className="text-white font-medium text-sm">{v.student_name}</p>
                    <p className="text-slate-400 text-xs flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(v.detected_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ViolationLogsPage;
