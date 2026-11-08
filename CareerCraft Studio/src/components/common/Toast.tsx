import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};

const ToastItem: React.FC<{ toast: ToastMessage; onDismiss: (id: string) => void }> = ({
  toast,
  onDismiss
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const getColors = () => {
    switch (toast.type) {
      case 'success':
        return {
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
        };
      case 'error':
        return {
          bg: 'bg-rose-50 border-rose-200 text-rose-900',
          icon: <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
        };
      case 'info':
      default:
        return {
          bg: 'bg-indigo-50 border-indigo-200 text-indigo-900',
          icon: <Info className="w-4 h-4 text-indigo-600 shrink-0" />
        };
    }
  };

  const { bg, icon } = getColors();

  return (
    <div
      className={`pointer-events-auto flex items-start gap-2.5 p-3.5 rounded-xl border shadow-lg transition-all animate-in slide-in-from-bottom-2 ${bg}`}
    >
      {icon}
      <div className="flex-1 text-xs">
        <div className="font-bold">{toast.title}</div>
        {toast.message && <div className="mt-0.5 opacity-90 leading-snug">{toast.message}</div>}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        className="opacity-60 hover:opacity-100 p-0.5 rounded transition-opacity"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
