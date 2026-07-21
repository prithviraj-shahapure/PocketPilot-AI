import React from 'react';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number; // percentage 0 - 100+
  color?: string;
  height?: string;
  showLabel?: boolean;
  animate?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color = 'gradient-primary',
  height = 'h-2.5',
  showLabel = false,
  animate = true,
}) => {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-semibold text-slate-400 mb-1">
          <span>Progress</span>
          <span>{Math.round(value)}%</span>
        </div>
      )}
      <div className={`w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 ${height}`}>
        <motion.div
          initial={animate ? { width: 0 } : { width: `${clampedValue}%` }}
          animate={{ width: `${clampedValue}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-full rounded-full ${color.startsWith('#') ? '' : color}`}
          style={color.startsWith('#') ? { backgroundColor: color } : {}}
        />
      </div>
    </div>
  );
};
