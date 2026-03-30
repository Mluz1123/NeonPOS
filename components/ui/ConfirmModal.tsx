'use client';

import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isPending?: boolean;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isPending = false,
  variant = 'danger'
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const variants = {
    danger: {
      icon: <AlertTriangle className="w-8 h-8 text-red-500" />,
      bgIcon: "bg-red-100",
      button: "bg-red-500 hover:bg-red-600 shadow-red-500/20",
    },
    warning: {
      icon: <AlertTriangle className="w-8 h-8 text-amber-500" />,
      bgIcon: "bg-amber-100",
      button: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20",
    },
    info: {
      icon: <AlertTriangle className="w-8 h-8 text-blue-500" />,
      bgIcon: "bg-blue-100",
      button: "bg-blue-500 hover:bg-blue-600 shadow-blue-500/20",
    }
  };

  const current = variants[variant];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background-dark/40 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[40px] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
        <div className="p-8 pt-10 flex flex-col items-center text-center">
          <div className={cn("p-4 rounded-3xl mb-6 shadow-sm", current.bgIcon)}>
            {current.icon}
          </div>
          
          <h2 className="text-2xl font-black text-text-main mb-3">{title}</h2>
          <p className="text-text-secondary font-medium leading-relaxed px-4">
            {description}
          </p>
        </div>

        <div className="p-8 bg-gray-50 flex gap-3">
          <button 
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 py-4 bg-white border border-gray-200 text-text-secondary rounded-2xl font-bold hover:bg-gray-100 transition-all disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button 
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className={cn(
              "flex-[1.5] py-4 text-white rounded-2xl font-black text-lg shadow-lg transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50",
              current.button
            )}
          >
            {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
