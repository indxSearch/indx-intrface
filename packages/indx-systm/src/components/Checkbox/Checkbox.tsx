import React from 'react';
import styles from './Checkbox.module.css';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  score? :string;
}

export const Checkbox = ({ label, score, className = '', ...props }: CheckboxProps) => {
  const id = React.useId();
  const isDisabled = props.disabled;

  return (
    <label
      htmlFor={id}
      className={`${styles.checkboxWrapper} ${className} ${isDisabled ? styles.disabled : ''} ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <input id={id} type="checkbox" className={styles.checkbox} {...props} />
      {label && <span className={styles.label}>{label}</span>}
      {score && <span className={styles.score}>{score}</span>}
    </label>
  );
};
