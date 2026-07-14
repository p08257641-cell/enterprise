/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Shared UI primitives — skeletons, empty states and motion helpers.
 * Used across modules to keep loading / empty / entrance behaviour consistent.
 */

import React from 'react';
import { motion, type Variants } from 'motion/react';

/* ── Skeleton (shimmer placeholder) ─────────────────────────────────────────── */
export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse rounded-md bg-slate-200/70 ${className}`} />
);

/* ── Content skeleton block (labeled rows) ───────────────────────────────────── */
export const SkeletonRows: React.FC<{ rows?: number; className?: string }> = ({ rows = 5, className = '' }) => (
  <div className={`space-y-3 ${className}`}>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-2.5 w-1/2" />
        </div>
        <Skeleton className="h-3 w-16" />
      </div>
    ))}
  </div>
);

/* ── Empty state ─────────────────────────────────────────────────────────────── */
export const EmptyState: React.FC<{
  icon?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}> = ({ icon = 'bi bi-inbox', title, subtitle, action, className = '' }) => (
  <div className={`flex flex-col items-center justify-center text-center py-16 px-6 ${className}`}>
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 text-2xl">
      <i className={icon}></i>
    </div>
    <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
    {subtitle && <p className="mt-1 max-w-xs text-xs leading-relaxed text-slate-500">{subtitle}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

/* ── Fade-in wrapper (view / block entrance) ──────────────────────────────── */
export const FadeIn: React.FC<{
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}> = ({ children, className = '', delay = 0, y = 8 }) => (
  <motion.div
    initial={{ opacity: 0, y }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
    className={className}
  >
    {children}
  </motion.div>
);

/* ── Staggered group + item (list / card grids) ───────────────────────────── */
const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05, delayChildren: 0.04 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
};

export const Stagger: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <motion.div variants={containerVariants} initial="hidden" animate="show" className={className}>
    {children}
  </motion.div>
);

export const StaggerItem: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <motion.div variants={itemVariants} className={className}>
    {children}
  </motion.div>
);
