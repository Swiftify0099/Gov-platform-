import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, UserX, UserCheck, Eye, Phone } from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface Student {
  id: string;
  full_name: string;
  phone_number: string;
  email?: string;
  exam_stream?: string;
  is_active: boolean;
  profile_photo_url?: string;
  created_at?: string;
}

interface StudentTableProps {
  students: Student[];
  onToggleActive?: (id: string) => void;
  onViewDetails?: (id: string) => void;
  loading?: boolean;
}

export const StudentTable: React.FC<StudentTableProps> = ({
  students,
  onToggleActive,
  onViewDetails,
  loading = false,
}) => {
  const [search, setSearch] = useState('');

  const filtered = students.filter(
    (s) =>
      s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.phone_number.includes(search)
  );

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-14 bg-slate-800/40 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          className="w-full bg-slate-800/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-slate-500">No students found</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-700/50">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700/50 bg-slate-800/60">
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Student</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Phone</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Stream</th>
                <th className="text-left px-4 py-3 text-slate-400 font-medium">Status</th>
                <th className="text-right px-4 py-3 text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((student, i) => (
                <motion.tr
                  key={student.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {student.profile_photo_url ? (
                        <img
                          src={student.profile_photo_url}
                          alt={student.full_name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-700"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-xs font-bold">
                          {student.full_name?.charAt(0) || '?'}
                        </div>
                      )}
                      <div>
                        <p className="text-slate-200 font-medium">{student.full_name || 'No name'}</p>
                        <p className="text-slate-500 text-xs">{student.email || ''}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Phone className="w-3.5 h-3.5" />
                      {student.phone_number}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="info">{student.exam_stream || '—'}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={student.is_active ? 'success' : 'error'}>
                      {student.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails?.(student.id)}
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                      >
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleActive?.(student.id)}
                        leftIcon={student.is_active ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        className={student.is_active ? 'text-red-400 hover:bg-red-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'}
                      >
                        {student.is_active ? 'Disable' : 'Enable'}
                      </Button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
