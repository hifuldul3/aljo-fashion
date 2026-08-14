'use client';

import React from 'react';
import { useStore } from '@/lib/store';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start p-4 rounded-xl shadow-2xl border backdrop-blur-md transition-all duration-300 transform translate-y-0 ${
            toast.type === 'success'
              ? 'bg-neutral-900/95 border-amber-500/40 text-neutral-100'
              : toast.type === 'error'
              ? 'bg-neutral-900/95 border-red-500/40 text-neutral-100'
              : 'bg-neutral-900/95 border-blue-500/40 text-neutral-100'
          }`}
        >
          <div className="flex-shrink-0 mr-3 mt-0.5">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-amber-400" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-semibold tracking-wide text-amber-200">{toast.title}</h4>
            {toast.description && <p className="text-xs text-neutral-400 mt-1 leading-snug">{toast.description}</p>}
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 ml-3 text-neutral-500 hover:text-neutral-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
