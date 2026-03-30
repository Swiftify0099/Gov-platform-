import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { authApi } from '../../api/auth';
import { setCredentials } from '../../store/authSlice';
import { OTPInput } from '../../components/auth/OTPInput';
import { Button } from '../../components/common/Button';

interface OTPPageProps {
  phone?: string;
  onBack?: () => void;
}

const OTPPage: React.FC<OTPPageProps> = ({ phone, onBack }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const phoneNumber = phone || sessionStorage.getItem('otp_phone') || '';

  const handleVerify = async () => {
    if (otp.length !== 6) return;
    setLoading(true);
    setError('');
    try {
      const res = await authApi.verifyOTP({ phone_number: phoneNumber, otp });
      localStorage.setItem('token', res.access_token);
      localStorage.setItem('refreshToken', res.refresh_token);
      dispatch(setCredentials({ token: res.access_token, user: res.user, refreshToken: res.refresh_token }));

      if (!res.user.is_profile_complete) {
        navigate('/profile-setup');
      } else if (res.user.role === 'super_admin') {
        navigate('/superadmin');
      } else if (res.user.role === 'institute_admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch {
      setError(t('auth.invalid_otp'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await authApi.sendOTP(phoneNumber);
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown((c) => {
          if (c <= 1) { clearInterval(timer); return 0; }
          return c - 1;
        });
      }, 1000);
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-slate-900/80 border border-slate-700/50 rounded-3xl p-8 shadow-2xl backdrop-blur-xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">{t('auth.verify_otp')}</h1>
          <p className="text-slate-400 text-sm">
            {t('auth.otp_sent')}{' '}
            <span className="text-indigo-400 font-medium">+91 {phoneNumber}</span>
          </p>
        </div>

        <div className="space-y-6">
          <OTPInput value={otp} onChange={setOtp} disabled={loading} />

          {error && (
            <p className="text-red-400 text-sm text-center bg-red-500/10 py-2 rounded-lg">
              {error}
            </p>
          )}

          <Button
            fullWidth
            isLoading={loading}
            disabled={otp.length !== 6}
            onClick={handleVerify}
          >
            {t('auth.verify_otp')}
          </Button>

          <div className="flex justify-between">
            <button
              onClick={onBack}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              ← {t('auth.change_number')}
            </button>
            <button
              onClick={handleResend}
              disabled={resendCooldown > 0}
              className="text-sm text-indigo-400 hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {resendCooldown > 0
                ? `${t('auth.resend_in')} ${resendCooldown}s`
                : t('auth.resend_otp')}
            </button>
          </div>

          <p className="text-center text-xs text-slate-600">{t('auth.default_otp')}</p>
        </div>
      </motion.div>
    </div>
  );
};

export default OTPPage;
