import React from 'react';
import styles from './InputField.module.css';

export interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
  isValid?: boolean;
  variant?: 'default' | 'borderBottom';
}

export function InputField({ label, error, className = '', isValid = true, variant = 'default', ...props }: InputFieldProps) {
  const hasError = error || !isValid;

  return (
    <div className={`${styles.wrapper} ${className}`}>
      {label && <label className={styles.label}>{label}</label>}
      <input
        className={`${styles.input} ${variant === 'borderBottom' ? styles.borderBottom : ''} ${hasError ? styles.error : ''}`}
        {...props}
      />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};
