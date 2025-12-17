import React from 'react';
import styles from './Checkbox.module.css';

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  score?: string;
  'aria-label'?: string;
}

export const Checkbox = ({ label, score, className = '', id: providedId, 'aria-label': ariaLabel, ...props }: CheckboxProps) => {
  const generatedId = React.useId();
  const checkboxId = providedId || generatedId;
  const scoreId = score ? `${checkboxId}-score` : undefined;
  const isDisabled = props.disabled;

  // If there's a visible label or score, wrap in label element
  if (label || score) {
    return (
      <label
        htmlFor={checkboxId}
        className={`${styles.checkboxWrapper} ${className} ${isDisabled ? styles.disabled : ''} ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <input
          id={checkboxId}
          type="checkbox"
          className={styles.checkbox}
          aria-describedby={scoreId}
          aria-label={ariaLabel}
          {...props}
        />
        {label && <span className={styles.label}>{label}</span>}
        {score && <span id={scoreId} className={styles.score}>{score}</span>}
      </label>
    );
  }

  // If no visible label, render input with aria-label only
  return (
    <input
      id={checkboxId}
      type="checkbox"
      className={`${styles.checkbox} ${className}`}
      aria-label={ariaLabel}
      disabled={isDisabled}
      {...props}
    />
  );
};
