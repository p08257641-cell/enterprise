/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import { createRoot, Root } from 'react-dom/client';

export type ModalVariant = 'info' | 'success' | 'warning' | 'danger';

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
          <div className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-lg ${v.ring}`}>
            <i className={v.icon}></i>
          </div>
          <div className="min-w-0 pt-0.5">
            {title && <h3 className="text-sm font-bold text-slate-900">{title}</h3>}
            <div className="text-sm text-slate-600 mt-0.5">{children}</div>
          </div>
          <button type="button" onClick={onClose} className="ml-auto h-7 w-7 shrink-0 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 cursor-pointer transition-colors">
            <i className="bi bi-x text-xl"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

const BtnBase = 'flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm cursor-pointer transition-all';
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
          className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 outline-none"
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
