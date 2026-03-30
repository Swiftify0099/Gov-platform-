import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { questionsApi } from '../../api/questions';

interface QuestionFormProps {
  onSuccess?: () => void;
  initialData?: Partial<QuestionData>;
  mode?: 'create' | 'edit';
}

interface QuestionData {
  text: string;
  language: string;
  options: [string, string, string, string];
  correct_answers: number[];
  marks: number;
  negative_marks: number;
  difficulty: string;
  topic: string;
  explanation: string;
}

const defaultData: QuestionData = {
  text: '',
  language: 'en',
  options: ['', '', '', ''],
  correct_answers: [],
  marks: 2,
  negative_marks: 0.5,
  difficulty: 'Medium',
  topic: '',
  explanation: '',
};

export const QuestionForm: React.FC<QuestionFormProps> = ({ onSuccess, initialData, mode = 'create' }) => {
  const { t } = useTranslation();
  const [form, setForm] = useState<QuestionData>({ ...defaultData, ...initialData });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const optionLabels = ['A', 'B', 'C', 'D'];

  const toggleCorrect = (index: number) => {
    setForm((prev) => ({
      ...prev,
      correct_answers: prev.correct_answers.includes(index)
        ? prev.correct_answers.filter((i) => i !== index)
        : [...prev.correct_answers, index],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.text.trim()) return setError('Question text is required');
    if (form.correct_answers.length === 0) return setError('Select at least one correct answer');
    if (form.options.some((o) => !o.trim())) return setError('All options must be filled');

    setLoading(true);
    setError('');
    try {
      await questionsApi.create(form);
      onSuccess?.();
      setForm(defaultData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save question';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Question text */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          {t('admin.question_text')} *
        </label>
        <textarea
          className="w-full bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[90px] resize-y"
          placeholder="Enter question text..."
          value={form.text}
          onChange={(e) => setForm((p) => ({ ...p, text: e.target.value }))}
        />
      </div>

      {/* Language */}
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('admin.language_field')}</label>
          <select
            className="w-full bg-slate-800/60 border border-slate-700 rounded-xl text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={form.language}
            onChange={(e) => setForm((p) => ({ ...p, language: e.target.value }))}
          >
            <option value="en">English</option>
            <option value="mr">Marathi</option>
            <option value="hi">Hindi</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('admin.difficulty')}</label>
          <select
            className="w-full bg-slate-800/60 border border-slate-700 rounded-xl text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={form.difficulty}
            onChange={(e) => setForm((p) => ({ ...p, difficulty: e.target.value }))}
          >
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>
        <div>
          <Input
            label={t('admin.topic')}
            placeholder="e.g. History, GK..."
            value={form.topic}
            onChange={(e) => setForm((p) => ({ ...p, topic: e.target.value }))}
          />
        </div>
      </div>

      {/* Options */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">{t('admin.correct_answers')} (click to mark correct)</label>
        <div className="space-y-2">
          {form.options.map((option, i) => (
            <div key={i} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => toggleCorrect(i)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 border transition-all ${
                  form.correct_answers.includes(i)
                    ? 'bg-emerald-600 border-emerald-500 text-white'
                    : 'bg-slate-700 border-slate-600 text-slate-400 hover:border-emerald-500'
                }`}
              >
                {optionLabels[i]}
              </button>
              <input
                className="flex-1 bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder={`Option ${optionLabels[i]}`}
                value={option}
                onChange={(e) => {
                  const opts = [...form.options] as [string, string, string, string];
                  opts[i] = e.target.value;
                  setForm((p) => ({ ...p, options: opts }));
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Marks */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label={`${t('admin.marks')} (+)`}
          type="number"
          min="0"
          step="0.5"
          value={form.marks}
          onChange={(e) => setForm((p) => ({ ...p, marks: parseFloat(e.target.value) }))}
        />
        <Input
          label={`${t('admin.negative_marks')} (-)`}
          type="number"
          min="0"
          step="0.25"
          value={form.negative_marks}
          onChange={(e) => setForm((p) => ({ ...p, negative_marks: parseFloat(e.target.value) }))}
        />
      </div>

      {/* Explanation */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('admin.explanation_optional')}</label>
        <textarea
          className="w-full bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[70px] resize-y"
          placeholder="Optional: pre-written explanation (GPT will generate one if empty)"
          value={form.explanation}
          onChange={(e) => setForm((p) => ({ ...p, explanation: e.target.value }))}
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm bg-red-500/10 px-4 py-2.5 rounded-lg border border-red-500/20">
          ⚠ {error}
        </p>
      )}

      <Button type="submit" isLoading={loading} fullWidth>
        {mode === 'create' ? t('admin.add_question') : t('common.save')}
      </Button>
    </form>
  );
};
