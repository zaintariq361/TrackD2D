'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { forwardRef, ButtonHTMLAttributes } from 'react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#090909] disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default:
          'bg-accent text-accent-foreground hover:bg-accent-hover focus:ring-accent shadow-sm',
        secondary:
          'bg-background-elevated border border-border text-white hover:bg-background-overlay hover:border-white/20 focus:ring-white/20',
        ghost:
          'text-text-secondary hover:text-white hover:bg-white/5 focus:ring-white/10',
        danger:
          'bg-danger/10 text-danger border border-danger/20 hover:bg-danger hover:text-white focus:ring-danger',
        success:
          'bg-success/10 text-success border border-success/20 hover:bg-success hover:text-white focus:ring-success',
        outline:
          'border border-border text-text-secondary hover:text-white hover:border-white/40 focus:ring-white/20',
        link:
          'text-accent underline-offset-4 hover:underline focus:ring-accent p-0 h-auto',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        default: 'h-10 px-4 text-sm',
        lg: 'h-11 px-6 text-base',
        xl: 'h-12 px-8 text-base',
        icon: 'h-10 w-10',
        'icon-sm': 'h-8 w-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
