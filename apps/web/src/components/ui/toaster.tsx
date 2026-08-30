'use client';

import * as Toast from '@radix-ui/react-toast';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { create } from 'zustand';

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'error' | 'warning';
}

interface ToastStore {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
}

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toastData) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toastData, id: Math.random().toString(36).slice(2) }],
    })),
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

export function toast(options: Omit<ToastItem, 'id'>) {
  useToastStore.getState().addToast(options);
}

const variantStyles = {
  default: 'border-border bg-background-elevated',
  success: 'border-success/20 bg-success/10',
  error: 'border-danger/20 bg-danger/10',
  warning: 'border-warning/20 bg-warning/10',
};

const variantIcons = {
  default: <Info className="h-4 w-4 text-info" />,
  success: <CheckCircle className="h-4 w-4 text-success" />,
  error: <AlertCircle className="h-4 w-4 text-danger" />,
  warning: <AlertTriangle className="h-4 w-4 text-warning" />,
};

export function Toaster() {
  const { toasts, removeToast } = useToastStore();

  return (
    <Toast.Provider>
      {toasts.map((toastItem) => (
        <Toast.Root
          key={toastItem.id}
          open={true}
          onOpenChange={(open) => !open && removeToast(toastItem.id)}
          duration={4000}
          className={cn(
            'flex items-start gap-3 rounded-xl border p-4 shadow-dropdown',
            'data-[state=open]:animate-slide-up',
            variantStyles[toastItem.variant || 'default']
          )}
        >
          <div className="mt-0.5 shrink-0">
            {variantIcons[toastItem.variant || 'default']}
          </div>
          <div className="flex-1 min-w-0">
            <Toast.Title className="text-sm font-medium text-white">
              {toastItem.title}
            </Toast.Title>
            {toastItem.description && (
              <Toast.Description className="mt-1 text-xs text-text-secondary">
                {toastItem.description}
              </Toast.Description>
            )}
          </div>
          <Toast.Close
            onClick={() => removeToast(toastItem.id)}
            className="shrink-0 text-text-tertiary hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </Toast.Close>
        </Toast.Root>
      ))}
      <Toast.Viewport className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80" />
    </Toast.Provider>
  );
}
