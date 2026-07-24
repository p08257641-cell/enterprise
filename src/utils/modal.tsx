/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { createRoot, Root } from 'react-dom/client';

export type ModalVariant = 'info' | 'success' | 'warning' | 'danger';
export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface AlertOptions { title?: string; variant?: ModalVariant; okText?: string; }
interface ConfirmOptions { title?: string; variant?: ModalVariant; okText?: string; cancelText?: string; }
interface PromptOptions { title?: string; variant?: ModalVariant; okText?: string; cancelText?: string; placeholder?: string; defaultValue?: string; inputType?: string; }

const VARIANT_STYLES: Record<ModalVariant, { icon: string; ring: string; bg: string; color: string }> = {
  info: { icon: 'bi bi-info-circle', ring: 'bg-blue-100 text-blue-600', bg: 'bg-blue-50 text-blue-700 border-blue-200', color: 'text-blue-600' },
  success: { icon: 'bi bi-check-circle', ring: 'bg-emerald-100 text-emerald-600', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', color: 'text-emerald-600' },
  warning: { icon: 'bi bi-exclamation-triangle', ring: 'bg-amber-100 text-amber-600', bg: 'bg-amber-50 text-amber-700 border-amber-200', color: 'text-amber-600' },
  danger: { icon: 'bi bi-exclamation-octagon', ring: 'bg-rose-100 text-rose-600', bg: 'bg-rose-50 text-rose-700 border-rose-200', color: 'text-rose-600' },
};

let container: HTMLDivElement | null = null;
let root: Root | null = null;

function ensureRoot(): Root {
  if (!container) {
    container = document.createElement('div');
    container.id = 'modal-portal-root';
    container.style.position = 'relative';
    container.style.zIndex = '9999';
    document.body.appendChild(container);
    root = createRoot(container);
  }
  return root!;
}

function render(node: React.ReactNode) {
  ensureRoot().render(node);
}

function close() {
  if (root) root.render(null);
}

function ModalShell({ variant, title, children, onClose }: { variant: ModalVariant; title?: string; children: React.ReactNode; onClose: () => void }) {
  const v = VARIANT_STYLES[variant];
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl border border-slate-200/80 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-start gap-3 px-5 pt-5 pb-3">
          <div className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center fs-lg ${v.ring}`}>
            <i className={v.icon}></i>
          </div>
          <div className="min-w-0 pt-0.5">
            {title && <h3 className="fs-sm fw-bold text-slate-900">{title}</h3>}
            <div className="fs-sm text-slate-600 mt-0.5">{children}</div>
          </div>
          <button type="button" onClick={onClose} className="ml-auto h-7 w-7 shrink-0 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
            <i className="bi bi-x fs-xl"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

const BtnBase = 'flex-1 px-4 py-2.5 rounded-lg fw-semibold fs-sm cursor-pointer transition-all';
const OkBtn = (variant: ModalVariant) => {
  const map: Record<ModalVariant, string> = {
    info: 'bg-slate-900 text-white hover:bg-slate-800',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700',
    warning: 'bg-amber-600 text-white hover:bg-amber-700',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
  };
  return `${BtnBase} ${map[variant]}`;
};
const CancelBtn = `${BtnBase} bg-white text-slate-600 border border-slate-200 hover:bg-slate-100`;

export function modalAlert(message: string, opts: AlertOptions = {}): Promise<void> {
  return new Promise(resolve => {
    const variant = opts.variant ?? 'info';
    render(
      <ModalShell variant={variant} title={opts.title ?? 'Notice'} onClose={() => { close(); resolve(); }}>
        <span className="block whitespace-pre-wrap">{message}</span>
        <div className="flex gap-2 mt-4">
          <button className={OkBtn(variant)} onClick={() => { close(); resolve(); }}>{opts.okText ?? 'OK'}</button>
        </div>
      </ModalShell>
    );
  });
}

export function modalConfirm(message: string, opts: ConfirmOptions = {}): Promise<boolean> {
  return new Promise(resolve => {
    const variant = opts.variant ?? 'warning';
    const done = (val: boolean) => { close(); resolve(val); };
    render(
      <ModalShell variant={variant} title={opts.title ?? 'Confirm'} onClose={() => done(false)}>
        <span className="block whitespace-pre-wrap">{message}</span>
        <div className="flex gap-2 mt-4">
          <button className={CancelBtn} onClick={() => done(false)}>{opts.cancelText ?? 'Cancel'}</button>
          <button className={OkBtn(variant)} onClick={() => done(true)}>{opts.okText ?? 'Confirm'}</button>
        </div>
      </ModalShell>
    );
  });
}

export function modalPrompt(message: string, opts: PromptOptions = {}): Promise<string | null> {
  return new Promise(resolve => {
    const variant = opts.variant ?? 'info';
    const inputRef = React.createRef<HTMLInputElement>();
    const done = (val: string | null) => {
      close();
      setTimeout(() => resolve(val), 0);
    };
    render(
      <ModalShell variant={variant} title={opts.title ?? 'Input'} onClose={() => done(null)}>
        <span className="block whitespace-pre-wrap mb-3">{message}</span>
        <input
          ref={inputRef}
          type={opts.inputType ?? 'text'}
          defaultValue={opts.defaultValue ?? ''}
          placeholder={opts.placeholder ?? ''}
          autoFocus
          onKeyDown={e => { if (e.key === 'Enter') done((e.target as HTMLInputElement).value); if (e.key === 'Escape') done(null); }}
          className="w-full px-3 py-2 fs-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none"
        />
        <div className="flex gap-2 mt-4">
          <button className={CancelBtn} onClick={() => done(null)}>{opts.cancelText ?? 'Cancel'}</button>
          <button className={OkBtn(variant)} onClick={() => done(inputRef.current?.value ?? '')}>{opts.okText ?? 'OK'}</button>
        </div>
      </ModalShell>
    );
    setTimeout(() => inputRef.current?.focus(), 0);
  });
}

// ── TOAST NOTIFICATIONS ────────────────────────────────────────────────────────
let toastContainer: HTMLDivElement | null = null;
let toastRoot: Root | null = null;
let toastIdCounter = 0;

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
  title?: string;
}

let toasts: ToastItem[] = [];
let renderScheduled = false;

function ensureToastRoot(): Root {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-portal-root';
    toastContainer.style.cssText = 'position:fixed;top:20px;right:20px;z-index:10000;display:flex;flex-direction:column;gap:10px;pointer-events:none;';
    document.body.appendChild(toastContainer);
    toastRoot = createRoot(toastContainer);
  }
  return toastRoot!;
}

const TOAST_STYLES: Record<ToastVariant, { icon: string; ring: string; border: string; bg: string }> = {
  success: { icon: 'bi bi-check-circle-fill', ring: 'text-emerald-500', border: 'border-emerald-200', bg: 'bg-white' },
  error: { icon: 'bi bi-x-circle-fill', ring: 'text-rose-500', border: 'border-rose-200', bg: 'bg-white' },
  info: { icon: 'bi bi-info-circle-fill', ring: 'text-blue-500', border: 'border-blue-200', bg: 'bg-white' },
  warning: { icon: 'bi bi-exclamation-triangle-fill', ring: 'text-amber-500', border: 'border-amber-200', bg: 'bg-white' },
};

function ToastContainer() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', pointerEvents: 'none' }}>
      {toasts.map(t => {
        const s = TOAST_STYLES[t.variant];
        return (
          <div
            key={t.id}
            style={{ pointerEvents: 'auto', animation: 'toastSlideIn 0.3s ease-out' }}
            className={`${s.bg} border ${s.border} rounded-xl shadow-lg px-4 py-3 flex items-center gap-3 min-w-[280px] max-w-[420px]`}
          >
            <i className={`${s.icon} ${s.ring} fs-lg shrink-0`}></i>
            <div className="min-w-0 flex-1">
              {t.title && <div className="fs-xs fw-bold text-slate-900">{t.title}</div>}
              <div className="fs-xs text-slate-600 leading-snug">{t.message}</div>
            </div>
            <button
              onClick={() => { toasts = toasts.filter(x => x.id !== t.id); scheduleRender(); }}
              className="text-slate-400 hover:text-slate-600 cursor-pointer shrink-0"
            >
              <i className="bi bi-x fs-sm"></i>
            </button>
          </div>
        );
      })}
    </div>
  );
}

function scheduleRender() {
  if (renderScheduled) return;
  renderScheduled = true;
  requestAnimationFrame(() => {
    renderScheduled = false;
    ensureToastRoot().render(<ToastContainer />);
    // auto-dismiss after 4s
    setTimeout(() => {
      if (toasts.length > 0) {
        toasts = toasts.slice(1);
        ensureToastRoot().render(<ToastContainer />);
      }
    }, 4000);
  });
}

export function toast(message: string, variant: ToastVariant = 'success', title?: string) {
  const id = ++toastIdCounter;
  toasts = [...toasts, { id, message, variant, title }];
  scheduleRender();
}

// Inject keyframes once
if (typeof document !== 'undefined' && !document.getElementById('toast-keyframes')) {
  const style = document.createElement('style');
  style.id = 'toast-keyframes';
  style.textContent = `@keyframes toastSlideIn { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }`;
  document.head.appendChild(style);
}
