import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { CheckCircle2, XCircle, Info, AlertTriangle, X } from 'lucide-react';

/**
 * Tiny in-app toast system. Drop-in replacement for `alert()`:
 *
 *   const { toast } = useToast();
 *   toast.success('Pago completado');
 *   toast.error('No se ha podido validar tu saldo');
 *
 * Toasts auto-dismiss after `ttl` ms (default 4500). Pass `ttl: 0` to make
 * a toast persistent until the user closes it or code calls `dismiss(id)`.
 */

const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fail loud in dev, fail soft in prod: if someone forgot to mount the
    // provider we fall back to console so the call doesn't crash the app.
    return {
      toast: {
        success: (m) => console.log('[toast.success]', m),
        error:   (m) => console.error('[toast.error]', m),
        warning: (m) => console.warn('[toast.warning]', m),
        info:    (m) => console.log('[toast.info]', m),
      },
      dismiss: () => {},
    };
  }
  return ctx;
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((variant, message, opts = {}) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const ttl = Number.isFinite(opts.ttl) ? opts.ttl : 4500;
    setToasts((prev) => [...prev, { id, variant, message, ttl }]);
    return id;
  }, []);

  const api = {
    toast: {
      success: (m, o) => push('success', m, o),
      error:   (m, o) => push('error',   m, o),
      warning: (m, o) => push('warning', m, o),
      info:    (m, o) => push('info',    m, o),
    },
    dismiss,
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({ toasts, onDismiss }) {
  return (
    <div
      role="region"
      aria-live="polite"
      aria-label="Notificaciones"
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 10001,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        pointerEvents: 'none',
        maxWidth: 'calc(100vw - 2rem)',
        width: '380px',
      }}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

const VARIANTS = {
  success: { Icon: CheckCircle2, bg: '#ECFDF5', fg: '#065F46', border: '#6EE7B7' },
  error:   { Icon: XCircle,      bg: '#FEF2F2', fg: '#991B1B', border: '#FCA5A5' },
  warning: { Icon: AlertTriangle, bg: '#FFFBEB', fg: '#92400E', border: '#FCD34D' },
  info:    { Icon: Info,         bg: '#EFF6FF', fg: '#1E40AF', border: '#93C5FD' },
};

function ToastItem({ toast, onDismiss }) {
  const v = VARIANTS[toast.variant] || VARIANTS.info;
  const Icon = v.Icon;

  useEffect(() => {
    if (!toast.ttl || toast.ttl <= 0) return undefined;
    const h = setTimeout(() => onDismiss(toast.id), toast.ttl);
    return () => clearTimeout(h);
  }, [toast.id, toast.ttl, onDismiss]);

  return (
    <div
      role="status"
      style={{
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
        padding: '0.875rem 1rem',
        background: v.bg,
        color: v.fg,
        border: `1px solid ${v.border}`,
        borderRadius: '14px',
        boxShadow: '0 12px 24px -12px rgba(6, 26, 18, 0.25)',
        fontSize: '0.9rem',
        lineHeight: 1.4,
        animation: 'todoflyer-toast-in 0.2s ease-out',
      }}
    >
      <Icon size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button
        onClick={() => onDismiss(toast.id)}
        aria-label="Cerrar"
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: v.fg,
          padding: '2px',
          display: 'flex',
          opacity: 0.7,
        }}
      >
        <X size={14} />
      </button>
      <style>{`
        @keyframes todoflyer-toast-in {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
