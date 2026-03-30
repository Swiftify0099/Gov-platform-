import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import apiClient from '../../api/client';
import { Building2, Users, CreditCard, AlertTriangle, Settings, ToggleLeft, ToggleRight } from 'lucide-react';

export const SuperAdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({ institutes: 0, students: 0, revenue: 0, violations: 0 });
  const [gateway, setGateway] = useState<'razorpay' | 'phonepe'>('razorpay');
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    Promise.all([
      apiClient.get('/api/analytics/platform'),
      apiClient.get('/api/admin/settings'),
    ]).then(([statsRes, settingsRes]) => {
      setStats(statsRes.data);
      const gatewaySetting = settingsRes.data.find((s: any) => s.key === 'active_payment_gateway');
      if (gatewaySetting) setGateway(gatewaySetting.value);
    }).catch(() => {});
  }, []);

  const toggleGateway = async () => {
    setToggling(true);
    const newGateway = gateway === 'razorpay' ? 'phonepe' : 'razorpay';
    try {
      await apiClient.put('/api/admin/gateway', { gateway: newGateway });
      setGateway(newGateway);
    } catch (e) {}
    setToggling(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 pb-16">
      <div className="max-w-6xl mx-auto px-4 pt-8">
        <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Super Admin</h1>
              <p className="text-slate-400 text-sm">Platform Control Center</p>
            </div>
          </div>
        </motion.div>

        {/* Global Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { icon: Building2, label: 'Institutes', value: stats.institutes, color: 'from-blue-500 to-indigo-600', href: '/superadmin/institutes' },
            { icon: Users, label: 'Total Students', value: stats.students, color: 'from-green-500 to-emerald-600', href: '/superadmin/students' },
            { icon: CreditCard, label: 'Revenue (₹)', value: `₹${(stats.revenue/1000).toFixed(1)}K`, color: 'from-yellow-500 to-amber-600', href: '/superadmin/payments' },
            { icon: AlertTriangle, label: 'Violations', value: stats.violations, color: 'from-red-500 to-rose-600', href: '/superadmin/violations' },
          ].map((card, i) => (
            <Link key={card.label} to={card.href}>
              <motion.div
                className={`bg-gradient-to-br ${card.color} rounded-2xl p-5 shadow-lg cursor-pointer`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ scale: 1.03, y: -2 }}
              >
                <card.icon className="w-7 h-7 text-white/80 mb-3" />
                <p className="text-3xl font-bold text-white">{card.value}</p>
                <p className="text-white/70 text-sm mt-1">{card.label}</p>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Payment Gateway Toggle */}
        <motion.div
          className="mt-8 bg-slate-800 rounded-2xl border border-slate-700 p-6"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        >
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-yellow-400" /> Payment Gateway
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Active Gateway</p>
              <p className="text-slate-400 text-sm mt-0.5">
                Currently using <span className="text-yellow-400 font-semibold capitalize">{gateway}</span>
              </p>
            </div>
            <motion.button
              onClick={toggleGateway}
              disabled={toggling}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all text-sm ${
                gateway === 'razorpay'
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {toggling ? (
                <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : gateway === 'razorpay' ? (
                <><ToggleLeft className="w-4 h-4" /> Switch to PhonePe</>
              ) : (
                <><ToggleRight className="w-4 h-4" /> Switch to Razorpay</>
              )}
            </motion.button>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {['razorpay', 'phonepe'].map((gw) => (
              <div key={gw} className={`rounded-xl p-3 border-2 transition-all ${
                gateway === gw ? 'border-yellow-500 bg-yellow-500/10' : 'border-slate-700 bg-slate-700/30'
              }`}>
                <p className="text-white font-medium capitalize text-sm">{gw}</p>
                {gateway === gw && <p className="text-yellow-400 text-xs mt-0.5">● Active</p>}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Nav */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { label: 'Manage Institutes', href: '/superadmin/institutes', icon: Building2 },
            { label: 'Subscription Plans', href: '/superadmin/plans', icon: CreditCard },
            { label: 'Violation Logs', href: '/superadmin/violations', icon: AlertTriangle },
            { label: 'Platform Settings', href: '/superadmin/settings', icon: Settings },
            { label: 'Audit Logs', href: '/superadmin/audit', icon: Users },
            { label: 'Feedback', href: '/superadmin/feedback', icon: Users },
          ].map((item) => (
            <Link key={item.label} to={item.href}>
              <motion.div
                className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center gap-3 hover:border-slate-500 cursor-pointer transition-colors"
                whileHover={{ scale: 1.01 }}
              >
                <item.icon className="w-5 h-5 text-slate-400" />
                <span className="text-slate-300 text-sm font-medium">{item.label}</span>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
