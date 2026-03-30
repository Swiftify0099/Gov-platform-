import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { paymentsApi, Plan } from '../../api/payments';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';
import { Loader } from '../../components/common/Loader';
import { Plus, CreditCard } from 'lucide-react';

const PlansPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', duration_days: 30, price: 0, features: '' });

  useEffect(() => {
    paymentsApi.getPlans().then(setPlans).finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await (await import('../../api/client')).default.post('/payments/plans', form);
      setPlans((p) => [...p, data]);
      setShowModal(false);
    } catch {}
    finally { setSaving(false); }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-indigo-400" /> Subscription Plans
          </h1>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowModal(true)}>Add Plan</Button>
      </div>

      {loading ? <Loader /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((plan, i) => (
            <motion.div key={plan.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.08 }}>
              <Card hover className="h-full">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-white font-bold text-lg">{plan.name}</h3>
                  <Badge variant="success">Active</Badge>
                </div>
                <p className="text-4xl font-black text-indigo-400 mb-1">₹{plan.price}</p>
                <p className="text-slate-500 text-sm mb-4">{plan.duration_days} days</p>
                {plan.description && <p className="text-slate-400 text-xs">{plan.description}</p>}
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Subscription Plan">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Plan Name" required value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
          <Input label="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Duration (days)" type="number" value={form.duration_days} onChange={(e) => setForm((p) => ({ ...p, duration_days: parseInt(e.target.value) }))} />
            <Input label="Price (₹)" type="number" value={form.price} onChange={(e) => setForm((p) => ({ ...p, price: parseFloat(e.target.value) }))} />
          </div>
          <Button type="submit" fullWidth isLoading={saving}>Create Plan</Button>
        </form>
      </Modal>
    </div>
  );
};

export default PlansPage;
