import React from "react";
import styles from "./ToggleSwitch.module.css";

type ToggleSwitchProps = {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  'aria-label'?: string;
};

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  id,
  checked,
  onChange,
  disabled = false,
  label,
  'aria-label': ariaLabel,
}) => {
  const generatedId = React.useId();
  const switchId = id || generatedId;

  return (
    <label
      htmlFor={switchId}
      className={`${styles.switch} ${disabled ? styles.disabled : ''} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <input
        id={switchId}
        type="checkbox"
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <span className={styles.slider} aria-hidden="true"></span>
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
};
