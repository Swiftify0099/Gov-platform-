import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

const LANGS = [
  { code: 'en', label: 'EN' },
  { code: 'mr', label: 'MR' },
  { code: 'hi', label: 'HI' },
];

export const LanguageToggle: React.FC = () => {
  const { i18n } = useTranslation();

  return (
    <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
      <Globe className="w-3.5 h-3.5 text-slate-500 ml-1" />
      {LANGS.map((lang) => (
        <button
          key={lang.code}
          onClick={() => i18n.changeLanguage(lang.code)}
          className={`px-2 py-1 rounded text-xs font-semibold transition-colors ${
            i18n.language === lang.code
              ? 'bg-blue-600 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};
