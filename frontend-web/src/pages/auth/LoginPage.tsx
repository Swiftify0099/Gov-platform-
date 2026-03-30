import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { sendOTP, verifyOTP } from '../../store/authSlice';
import { AppDispatch, RootState } from '../../store';
import { Phone, Shield, BookOpen, Users, Award } from 'lucide-react';

const DEFAULT_CREDENTIALS = [
  { label: 'Super Admin', phone: '9000000000', otp: '123456', color: 'from-red-500 to-rose-600' },
  { label: 'Institute Admin', phone: '9000000001', otp: '123456', color: 'from-blue-500 to-indigo-600' },
  { label: 'Student', phone: '9876543210', otp: '123456', color: 'from-green-500 to-emerald-600' },
];

export const LoginPage: React.FC = () => {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [devOtp, setDevOtp] = useState('');

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isLoading } = useSelector((s: RootState) => s.auth);

  const handleSendOTP = async (phoneNum?: string) => {
    const targetPhone = phoneNum || phone;
    if (!targetPhone || targetPhone.length !== 10) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    const result = await dispatch(sendOTP(targetPhone));
    if (sendOTP.fulfilled.match(result)) {
      setPhone(targetPhone);
      setDevOtp(result.payload.dev_otp || '');
      setStep('otp');
    } else {
      setError(result.payload as string);
    }
  };

  const handleVerifyOTP = async (otpStr?: string) => {
    const targetOtp = otpStr || otpValues.join('');
    if (targetOtp.length !== 6) {
      setError('Enter the 6-digit OTP');
      return;
    }
    setError('');
    const result = await dispatch(verifyOTP({ phone, otp: targetOtp }));
    if (verifyOTP.fulfilled.match(result)) {
      const role = result.payload.role;
      if (role === 'super_admin') navigate('/superadmin');
      else if (role === 'institute_admin') navigate('/admin');
      else navigate('/dashboard');
    } else {
      setError(result.payload as string);
    }
  };

  const handleQuickLogin = async (cred: typeof DEFAULT_CREDENTIALS[0]) => {
    setPhone(cred.phone);
    await handleSendOTP(cred.phone);
    setTimeout(() => handleVerifyOTP(cred.otp), 500);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newValues = [...otpValues];
    newValues[index] = value.slice(-1);
    setOtpValues(newValues);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
    if (newValues.every(v => v)) {
      handleVerifyOTP(newValues.join(''));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex flex-col">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-500/5"
            style={{
              width: `${100 + i * 80}px`,
              height: `${100 + i * 80}px`,
              left: `${10 + i * 15}%`,
              top: `${5 + i * 12}%`,
            }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <div className="flex flex-1 relative z-10">
        {/* Left Panel */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 py-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">ExamPrep</h1>
                <p className="text-blue-300 text-sm">Government Exam Platform</p>
              </div>
            </div>

            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              Your path to<br />
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Government Service
              </span>
            </h2>
            <p className="text-slate-400 text-lg mb-12">
              Prepare for MPSC, UPSC, Group B/C/D and All India Services with AI-powered practice.
            </p>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Shield, label: 'AI Proctored', desc: 'Secure exam environment', color: 'text-blue-400' },
                { icon: Award, label: 'Expert Content', desc: '10,000+ questions', color: 'text-yellow-400' },
                { icon: Users, label: 'Live Classes', desc: 'Learn with peers', color: 'text-green-400' },
                { icon: BookOpen, label: 'Multi-language', desc: 'EN / MR / HI', color: 'text-purple-400' },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10"
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
                >
                  <item.icon className={`w-6 h-6 ${item.color} mb-2`} />
                  <p className="text-white font-semibold text-sm">{item.label}</p>
                  <p className="text-slate-400 text-xs">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Panel — Login Form */}
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center px-6 py-12">
          <motion.div
            className="w-full max-w-md"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Card */}
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/40">
                  <Phone className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {step === 'phone' ? 'Welcome Back' : 'Verify OTP'}
                </h2>
                <p className="text-slate-400 mt-1 text-sm">
                  {step === 'phone'
                    ? 'Enter your mobile number to continue'
                    : `OTP sent to +91 ${phone}`
                  }
                </p>
              </div>

              <AnimatePresence mode="wait">
                {step === 'phone' ? (
                  <motion.div
                    key="phone"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <div className="mb-4">
                      <label className="text-slate-300 text-sm font-medium mb-1.5 block">
                        Mobile Number
                      </label>
                      <div className="flex gap-2">
                        <div className="bg-white/10 border border-white/20 rounded-xl px-3 flex items-center text-slate-300 font-medium">
                          +91
                        </div>
                        <input
                          type="tel"
                          maxLength={10}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          placeholder="9000000000"
                          className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                          onKeyDown={(e) => e.key === 'Enter' && handleSendOTP()}
                        />
                      </div>
                    </div>

                    {error && (
                      <motion.p
                        className="text-red-400 text-sm mb-3"
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      >
                        {error}
                      </motion.p>
                    )}

                    <motion.button
                      onClick={() => handleSendOTP()}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3.5 rounded-xl hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/30"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      {isLoading ? 'Sending OTP...' : 'Send OTP'}
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="otp"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    {devOtp && (
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg px-3 py-2 mb-4 text-center">
                        <p className="text-yellow-400 text-xs">Dev Mode — OTP: <strong>{devOtp}</strong></p>
                      </div>
                    )}
                    <label className="text-slate-300 text-sm font-medium mb-3 block text-center">
                      Enter 6-digit OTP
                    </label>
                    <div className="flex gap-2 justify-center mb-4">
                      {otpValues.map((val, i) => (
                        <input
                          key={i}
                          id={`otp-${i}`}
                          type="text"
                          maxLength={1}
                          value={val}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Backspace' && !val && i > 0) {
                              document.getElementById(`otp-${i - 1}`)?.focus();
                            }
                          }}
                          className="w-12 h-12 text-center text-xl font-bold bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                        />
                      ))}
                    </div>

                    {error && (
                      <p className="text-red-400 text-sm mb-3 text-center">{error}</p>
                    )}

                    <motion.button
                      onClick={() => handleVerifyOTP()}
                      disabled={isLoading}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3.5 rounded-xl hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/30 mb-3"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      {isLoading ? 'Verifying...' : 'Verify & Login'}
                    </motion.button>
                    <button
                      onClick={() => { setStep('phone'); setOtpValues(['','','','','','']); setError(''); }}
                      className="w-full text-slate-400 text-sm hover:text-white transition-colors py-2"
                    >
                      ← Change Number
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Login — Dev Only */}
            <motion.div
              className="mt-6"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            >
              <p className="text-center text-slate-500 text-xs mb-3">
                ⚡ Quick Login (Development)
              </p>
              <div className="grid grid-cols-3 gap-2">
                {DEFAULT_CREDENTIALS.map((cred) => (
                  <motion.button
                    key={cred.label}
                    onClick={() => handleQuickLogin(cred)}
                    className={`bg-gradient-to-br ${cred.color} text-white text-xs font-semibold py-2.5 px-3 rounded-xl shadow-lg transition-all`}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    {cred.label}
                  </motion.button>
                ))}
              </div>
              <p className="text-center text-slate-600 text-xs mt-2">
                Default OTP: 123456
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
