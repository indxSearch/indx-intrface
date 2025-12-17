import React from 'react';
import styles from './InputField.module.css';

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
  isValid?: boolean;
  variant?: 'default' | 'borderBottom';
}

export function InputField({ label, error, className = '', isValid = true, variant = 'default', id: providedId, ...props }: InputFieldProps) {
  const generatedId = React.useId();
  const inputId = providedId || generatedId;
  const errorId = `${inputId}-error`;
  const hasError = error || !isValid;

  return (
    <div className={`${styles.wrapper} ${className}`}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
          {props.required && <span aria-label="required"> *</span>}
        </label>
      )}
      <input
        id={inputId}
        className={`${styles.input} ${variant === 'borderBottom' ? styles.borderBottom : ''} ${hasError ? styles.error : ''}`}
        aria-invalid={hasError ? 'true' : 'false'}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error && (
        <span id={errorId} className={styles.errorText} role="alert">
          {error}
        </span>
      )}
    </div>
  );
};
