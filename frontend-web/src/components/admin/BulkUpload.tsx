import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileJson, FileText, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { questionsApi } from '../../api/questions';
import { Button } from '../common/Button';

interface BulkUploadResult {
  created: number;
  failed: number;
  errors: string[];
}

export const BulkUpload: React.FC = () => {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<BulkUploadResult | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file: File) => {
    if (!file) return;
    const isJSON = file.name.endsWith('.json');
    const isCSV = file.name.endsWith('.csv');
    if (!isJSON && !isCSV) {
      alert('Please upload a .json or .csv file');
      return;
    }

    setUploading(true);
    setResult(null);
    try {
      const res = isJSON
        ? await questionsApi.bulkUploadJSON(file)
        : await questionsApi.bulkUploadCSV(file);
      setResult(res);
    } catch {
      setResult({ created: 0, failed: 1, errors: ['Upload failed. Please check the file format.'] });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const downloadJSONTemplate = () => {
    const template = {
      questions: [
        {
          text: 'Question text here',
          language: 'en',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correct_answers: [0],
          marks: 2,
          negative_marks: 0.5,
          difficulty: 'Medium',
          topic: 'History',
          explanation: 'Optional pre-written explanation',
        },
      ],
    };
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'questions_template.json';
    a.click();
  };

  const downloadCSVTemplate = () => {
    const csv = `text,language,option_a,option_b,option_c,option_d,correct_answers,marks,negative_marks,difficulty,topic,explanation
Question text,en,Option A,Option B,Option C,Option D,0,2,0.5,Medium,History,Optional explanation`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'questions_template.csv';
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Template downloads */}
      <div className="flex gap-3">
        <Button variant="secondary" size="sm" leftIcon={<FileJson className="w-4 h-4" />} onClick={downloadJSONTemplate}>
          Download JSON Template
        </Button>
        <Button variant="secondary" size="sm" leftIcon={<FileText className="w-4 h-4" />} onClick={downloadCSVTemplate}>
          Download CSV Template
        </Button>
      </div>

      {/* Drop zone */}
      <motion.div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        animate={{ borderColor: dragOver ? '#6366f1' : '#374151' }}
        className={`border-2 border-dashed rounded-2xl p-10 text-center transition-colors cursor-pointer ${
          dragOver ? 'bg-indigo-500/5' : 'bg-slate-800/30 hover:bg-slate-800/50'
        }`}
        onClick={() => document.getElementById('bulk-file-input')?.click()}
      >
        <Upload className="w-10 h-10 text-slate-500 mx-auto mb-3" />
        <p className="text-slate-300 font-medium">Drop your JSON or CSV file here</p>
        <p className="text-slate-500 text-sm mt-1">or click to browse</p>
        <input
          id="bulk-file-input"
          type="file"
          accept=".json,.csv"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
      </motion.div>

      {/* Loading */}
      {uploading && (
        <div className="flex items-center gap-3 text-indigo-400 animate-pulse">
          <Upload className="w-5 h-5 animate-bounce" />
          <span>Uploading and processing questions...</span>
        </div>
      )}

      {/* Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              <div>
                <p className="text-2xl font-bold text-emerald-400">{result.created}</p>
                <p className="text-xs text-slate-400">Questions created</p>
              </div>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3">
              <XCircle className="w-6 h-6 text-red-400" />
              <div>
                <p className="text-2xl font-bold text-red-400">{result.failed}</p>
                <p className="text-xs text-slate-400">Failed</p>
              </div>
            </div>
          </div>
          {result.errors.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
              <div className="flex items-center gap-2 text-amber-400 mb-2">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">Errors</span>
              </div>
              <ul className="space-y-1">
                {result.errors.map((err, i) => (
                  <li key={i} className="text-xs text-slate-400">• {err}</li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};
