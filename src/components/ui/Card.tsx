import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: 'indigo' | 'emerald' | 'danger' | 'none';
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  glow = 'none',
  hoverable = true,
  ...props
}) => {
  const glowStyles = {
    indigo: 'hover:border-brand-500/50 hover:shadow-[0_0_25px_rgba(79,70,229,0.25)]',
    emerald: 'hover:border-emerald-500/50 hover:shadow-[0_0_25px_rgba(34,197,94,0.25)]',
    danger: 'hover:border-red-500/50 hover:shadow-[0_0_25px_rgba(239,68,68,0.25)]',
    none: '',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'glass-card rounded-2xl p-5 border border-slate-800/80 transition-all duration-300',
          hoverable && 'hover:-translate-y-0.5',
          glowStyles[glow],
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
