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
};

export const RadioButton: React.FC<RadioButtonProps> = ({
  id,
  name,
  value,
  label,
  checked = false,
  onChange,
  disabled = false,
}) => {
  return (
    <label className={`${styles.radioWrapper} ${disabled ? styles.disabled : ""} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
      <input
        id={id}
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={styles.radioInput}
      />
      <span className={styles.customRadio}></span>
      <span className={styles.labelText}>{label}</span>
    </label>
  );
};
