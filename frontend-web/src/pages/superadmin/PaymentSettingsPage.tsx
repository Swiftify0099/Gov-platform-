import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, CreditCard, CheckCircle2, ArrowRight } from 'lucide-react';
import apiClient from '../../api/client';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { useTranslation } from 'react-i18next';

const GATEWAYS = [
  {
    id: 'razorpay',
    name: 'Razorpay',
    logo: '💳',
    description: 'India\'s leading payment gateway. Supports UPI, cards, netbanking, wallets.',
    color: 'from-blue-600 to-blue-500',
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    logo: '📱',
    description: 'PhonePe payment gateway. Best for UPI-first transactions.',
    color: 'from-purple-600 to-purple-500',
  },
];

const PaymentSettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const [activeGateway, setActiveGateway] = useState<string>('razorpay');
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    apiClient.get('/payments/active-gateway')
      .then(({ data }) => setActiveGateway(data.active_gateway))
      .finally(() => setLoading(false));
  }, []);

  const switchGateway = async (gateway: string) => {
    if (gateway === activeGateway) return;
    setSwitching(true);
    try {
      await apiClient.post('/superadmin/set-gateway', { gateway });
      setActiveGateway(gateway);
    } catch {}
    finally { setSwitching(false); }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-400" /> {t('superadmin.payment_gateway')}
        </h1>
        <p className="text-slate-400 text-sm mt-1">Select the active payment gateway for the platform</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {GATEWAYS.map((gateway, i) => {
          const isActive = activeGateway === gateway.id;
          return (
            <motion.div key={gateway.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card
                className={`cursor-pointer transition-all duration-200 ${isActive ? 'ring-2 ring-indigo-500' : 'hover:border-slate-600'}`}
                onClick={() => switchGateway(gateway.id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gateway.color} flex items-center justify-center text-2xl`}>
                    {gateway.logo}
                  </div>
                  {isActive && (
                    <Badge variant="success">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Active
                    </Badge>
                  )}
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{gateway.name}</h3>
                <p className="text-slate-400 text-sm mb-4">{gateway.description}</p>
                {!isActive && (
                  <Button variant="outline" size="sm" fullWidth isLoading={switching} rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    {t('superadmin.switch_gateway')}
                  </Button>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4"
      >
        <p className="text-amber-400 text-sm">
          ⚠️ Switching the payment gateway will affect all new payment transactions. Existing orders will not be affected.
        </p>
      </motion.div>
    </div>
  );
};

export default PaymentSettingsPage;
