import React from 'react';
import styles from './Checkbox.module.css';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = ({ label, className = '', ...props }: CheckboxProps) => {
  const id = React.useId();

  return (
    <label htmlFor={id} className={`${styles.checkboxWrapper} ${className}`}>
      <input id={id} type="checkbox" className={styles.checkbox} {...props} />
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
};
