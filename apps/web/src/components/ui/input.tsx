import { cn } from '@/lib/utils';
import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  iconRight?: ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, iconRight, ...props }, ref) => {
    return (
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3 text-text-tertiary pointer-events-none">{icon}</div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full rounded-lg border border-border bg-background-elevated px-3 py-2.5 text-sm text-white',
            'placeholder:text-text-tertiary',
            'focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50',
            'transition-colors duration-150',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            icon && 'pl-9',
            iconRight && 'pr-9',
            className
          )}
          {...props}
        />
        {iconRight && (
          <div className="absolute right-3 text-text-tertiary">{iconRight}</div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
