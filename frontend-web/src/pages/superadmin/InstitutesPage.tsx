import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Building2, Plus, ToggleRight, UserPlus } from 'lucide-react';
import apiClient from '../../api/client';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { Loader } from '../../components/common/Loader';

interface Institute {
  id: string;
  name: string;
  description: string;
  contact_email: string;
  is_active: boolean;
  admin_id?: string;
}

const InstitutesPage: React.FC = () => {
  const { t } = useTranslation();
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', contact_email: '', contact_phone: '' });
  const [saving, setSaving] = useState(false);

  const fetchInstitutes = async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/institutes');
      setInstitutes(data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchInstitutes(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.post('/institutes', null, { params: form });
      setShowModal(false);
      fetchInstitutes();
    } catch {}
    finally { setSaving(false); }
  };

  const toggleActive = async (id: string) => {
    try {
      await apiClient.patch(`/institutes/${id}/toggle-active`);
      fetchInstitutes();
    } catch {}
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-400" /> {t('superadmin.manage_institutes')}
          </h1>
          <p className="text-slate-400 text-sm">{institutes.length} {t('superadmin.total_institutes')}</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>
          {t('superadmin.add_institute')}
        </Button>
      </div>

      {loading ? <Loader /> : (
        <div className="space-y-3">
          {institutes.map((inst, i) => (
            <motion.div key={inst.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card padding="sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold">{inst.name}</h3>
                      <Badge variant={inst.is_active ? 'success' : 'error'}>{inst.is_active ? 'Active' : 'Inactive'}</Badge>
                    </div>
                    <p className="text-slate-400 text-xs">{inst.contact_email}</p>
                    {inst.description && <p className="text-slate-500 text-xs mt-0.5">{inst.description}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" leftIcon={<ToggleRight className="w-3.5 h-3.5" />} onClick={() => toggleActive(inst.id)}>
                      Toggle
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={t('superadmin.add_institute')}>
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Institute Name" required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          <Input label="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          <Input label="Contact Email" type="email" value={form.contact_email} onChange={(e) => setForm((p) => ({ ...p, contact_email: e.target.value }))} />
          <Input label="Contact Phone" value={form.contact_phone} onChange={(e) => setForm((p) => ({ ...p, contact_phone: e.target.value }))} />
          <Button type="submit" fullWidth isLoading={saving}>Create Institute</Button>
        </form>
      </Modal>
    </div>
  );
};

export default InstitutesPage;
