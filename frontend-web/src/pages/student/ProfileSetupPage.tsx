import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Camera, Upload, CheckCircle2, ArrowRight } from 'lucide-react';
import { usersApi } from '../../api/users';
import { RootState } from '../../store';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';

const EXAM_STREAMS = [
  { value: 'MPSC', label: 'MPSC (Maharashtra)' },
  { value: 'UPSC', label: 'UPSC (Central)' },
  { value: 'Group B', label: 'Group B Services' },
  { value: 'Group C', label: 'Group C Services' },
  { value: 'Group D', label: 'Group D Services' },
  { value: 'All India Services', label: 'All India Services' },
];

const LANGUAGES = [
  { value: 'en', label: '🇺🇸 English' },
  { value: 'mr', label: '🇮🇳 मराठी' },
  { value: 'hi', label: '🇮🇳 हिंदी' },
];

const ProfileSetupPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    exam_stream: '',
    preferred_language: 'en',
  });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!photo) return setError(t('profile.photo_required'));
    if (!form.full_name.trim()) return setError('Full name is required');
    if (!form.exam_stream) return setError('Please select an exam stream');

    setLoading(true);
    setError('');
    try {
      // Upload photo first
      await usersApi.uploadProfilePhoto(photo);
      // Update profile
      await usersApi.updateProfile(form);
      navigate('/dashboard');
    } catch {
      setError('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg bg-slate-900/80 border border-slate-700/50 rounded-3xl p-8 shadow-2xl backdrop-blur-xl"
      >
        <h1 className="text-2xl font-bold text-white text-center mb-2">{t('profile.title')}</h1>
        <p className="text-slate-400 text-sm text-center mb-8">Complete your profile to access exams</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Photo upload */}
          <div className="flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="relative group"
            >
              <div className={`w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden transition-all ${
                photoPreview ? 'border-indigo-500' : 'border-slate-600 hover:border-indigo-500'
              }`}>
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                )}
              </div>
              {photoPreview && (
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Upload className="w-6 h-6 text-white" />
                </div>
              )}
            </button>
            <p className="text-xs text-slate-500 text-center max-w-xs">{t('profile.photo_tip')}</p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoSelect} />
          </div>

          {/* Name */}
          <Input
            label={t('profile.name')}
            placeholder={t('profile.name_placeholder')}
            value={form.full_name}
            onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
          />

          {/* Email */}
          <Input
            label={t('profile.email')}
            type="email"
            placeholder={t('profile.email_placeholder')}
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
          />

          {/* Exam stream */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{t('profile.select_stream')} *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {EXAM_STREAMS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, exam_stream: s.value }))}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                    form.exam_stream === s.value
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">{t('profile.language')}</label>
            <div className="flex gap-2">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.value}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, preferred_language: lang.value }))}
                  className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                    form.preferred_language === lang.value
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                      : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-500/10 px-4 py-2.5 rounded-lg border border-red-500/20">⚠ {error}</p>
          )}

          <Button type="submit" isLoading={loading} fullWidth rightIcon={<ArrowRight className="w-4 h-4" />}>
            {t('profile.save_profile')}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default ProfileSetupPage;
