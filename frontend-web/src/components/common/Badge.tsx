import React from 'react';
import { motion } from 'framer-motion';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'error' | 'warning' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

const variantStyles = {
  success: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
  error: 'bg-red-500/20 text-red-300 border border-red-500/30',
  warning: 'bg-amber-500/20 text-amber-300 border border-amber-500/30',
  info: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  neutral: 'bg-slate-500/20 text-slate-300 border border-slate-500/30',
};

const sizeStyles = {
  sm: 'text-xs px-2 py-0.5',
  md: 'text-sm px-3 py-1',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
}) => {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center rounded-full font-medium ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </motion.span>
  );
};
