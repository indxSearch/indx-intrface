import React from "react";
import styles from "./ToggleSwitch.module.css";

type ToggleSwitchProps = {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
};

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  id,
  checked,
  onChange,
  disabled = false,
  label,
}) => {
  const switchId = id || `toggle-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <label htmlFor={switchId} className={styles.switch}>
      <input
        id={switchId}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      <span className={styles.slider}></span>
      {label && <span className={styles.label}>{label}</span>}
    </label>
  );
};
