import React from "react";
import styles from "./RadioButton.module.css";

type RadioButtonProps = {
  id: string;
  name: string;
  value: string;
  label: string;
  checked?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  'aria-label'?: string;
};

export const RadioButton: React.FC<RadioButtonProps> = ({
  id,
  name,
  value,
  label,
  checked = false,
  onChange,
  disabled = false,
  'aria-label': ariaLabel,
}) => {
  return (
    <label htmlFor={id} className={`${styles.radioWrapper} ${disabled ? styles.disabled : ""} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        aria-label={ariaLabel}
        className={styles.radioInput}
      />
      <span className={styles.customRadio}></span>
      <span className={styles.labelText}>{label}</span>
    </label>
  );
};
