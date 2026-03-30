import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';

interface AnalyticsChartProps {
  data: { label: string; value: number; secondary?: number }[];
  type?: 'bar' | 'line';
  title: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  height?: number;
}

const CustomTooltip = ({ active, payload, label }: unknown) => {
  if (active && payload && (payload as unknown[]).length) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-xl">
        <p className="text-slate-300 text-xs font-medium mb-1">{label as string}</p>
        {(payload as { name: string; value: number; color: string }[]).map((p) => (
          <p key={p.name} style={{ color: p.color }} className="text-xs">
            {p.name}: <span className="font-bold">{p.value}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  data,
  type = 'bar',
  title,
  primaryLabel = 'Value',
  secondaryLabel,
  height = 220,
}) => {
  const chartData = data.map((d) => ({
    name: d.label,
    [primaryLabel]: d.value,
    ...(secondaryLabel && { [secondaryLabel]: d.secondary }),
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5"
    >
      <h3 className="text-slate-300 font-semibold text-sm mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        {type === 'bar' ? (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey={primaryLabel} fill="#6366f1" radius={[6, 6, 0, 0]} />
            {secondaryLabel && (
              <Bar dataKey={secondaryLabel} fill="#10b981" radius={[6, 6, 0, 0]} />
            )}
          </BarChart>
        ) : (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey={primaryLabel} stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} />
            {secondaryLabel && (
              <Line type="monotone" dataKey={secondaryLabel} stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 4 }} />
            )}
          </LineChart>
        )}
      </ResponsiveContainer>
    </motion.div>
  );
};
