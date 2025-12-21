import React from 'react';
import * as RadixSelect from '@radix-ui/react-select';
import { Chevron_down } from '@indxsearch/pixl';
import styles from './Select.module.css';

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  label?: string;
  'aria-label'?: string;
  id?: string;
}

export const Select: React.FC<SelectProps> = ({
  value,
  onValueChange,
  options,
  placeholder = 'Select...',
  className = '',
  disabled = false,
  label,
  'aria-label': ariaLabel,
  id,
}) => {
  const generatedId = React.useId();
  const selectId = id || generatedId;
  const labelId = `${selectId}-label`;

  const selectComponent = (
    <RadixSelect.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <RadixSelect.Trigger
        id={selectId}
        className={`${styles.trigger} ${className} cursor-pointer`}
        {...(label ? { 'aria-labelledby': labelId } : ariaLabel ? { 'aria-label': ariaLabel } : {})}
      >
        <RadixSelect.Value placeholder={placeholder} />
        <RadixSelect.Icon className={styles.icon} aria-hidden="true">
          <Chevron_down size={14} color="currentColor" />
        </RadixSelect.Icon>
      </RadixSelect.Trigger>

      <RadixSelect.Portal>
        <RadixSelect.Content
          className={styles.content}
          position="popper"
          side="bottom"
          align="start"
          sideOffset={4}
        >
          <RadixSelect.Viewport className={styles.viewport}>
            {options.map((option) => (
              <RadixSelect.Item
                key={option.value}
                value={option.value}
                className={styles.item}
              >
                <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
              </RadixSelect.Item>
            ))}
          </RadixSelect.Viewport>
        </RadixSelect.Content>
      </RadixSelect.Portal>
    </RadixSelect.Root>
  );

  // Only wrap with div if there's a label
  if (label) {
    return (
      <div className={styles.wrapper}>
        <label id={labelId} htmlFor={selectId} className={styles.label}>
          {label}
        </label>
        {selectComponent}
      </div>
    );
  }

  return selectComponent;
};
