import React from 'react';

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
  isValid?: boolean;
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export function InputField({ label, error, className = '', isValid = true, ...props }: InputFieldProps) {
  const hasError = error || !isValid;

  return (
    <div className={cn('flex flex-col gap-[4px]', className)}>
      {label && (
        <label className="text-xs text-(--lv6)">
          {label}
        </label>
      )}
      <input
        className={cn(
          'text-xs px-0 h-6 rounded-none',
          'border-b border-b-(--lv3) bg-transparent',
          'hover:border-b-(--lv5)',
          'placeholder:text-(--lv5)',
          'text-(--lv7)',
          'disabled:opacity-60 disabled:cursor-not-allowed',
          'selection:bg-(--lv3)',
          '[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [appearance:textfield]',
          hasError
            ? 'border-b-(--CSignal) focus:outline-none focus:border-b-(--CSignal)'
            : 'active:border-b-(--lv5) focus:outline-none focus:border-b-(--lv5)'
        )}
        {...props}
      />
      {error && <span className="text-xs text-(--CSignal)">{error}</span>}
    </div>
  );
};
