import React, { useState, useRef, useEffect } from 'react';
import styles from './SearchField.module.css';
import { Search } from '@indxsearch/pixl';

interface IconProps {
  size?: string | number;
  color?: string;
}

export type InputSize = 'micro' | 'default' | 'large';
export type InputState = 'default' | 'focus' | 'filtered';

const iconSizeMap: Record<InputSize, string> = {
  micro: '14px',
  default: '21px',
  large: '28px',
};

export interface SearchFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  className?: string;
  showSearchIcon?: boolean;
  searchIcon?: React.ReactElement<IconProps>;
  searchIconColor?: string;
  inputSize?: InputSize;
  inputState?: InputState;
}

export function SearchField({
  label,
  error,
  className = '',
  showSearchIcon = true,
  searchIcon,
  searchIconColor,
  inputSize = 'default',
  inputState = 'default',
  ...props
}: SearchFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  const iconSize = iconSizeMap[inputSize];
  const inlineStyles: React.CSSProperties & { [key: string]: string } = {};

  if (searchIconColor) {
    inlineStyles['--search-icon-color'] = searchIconColor;
  }

  const fallbackIconColor = 'var(--search-icon-color)';
  const iconToRender = searchIcon ?? <Search />;

  return (
    <div className={`${styles.wrapper} ${className}`}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={`${styles.inputContainer} ${styles[inputSize]} ${styles[inputState]}`}>
        {showSearchIcon && !isFocused && inputRef.current?.value === '' && (
          <span className={styles.searchIcon}>
            {React.cloneElement(iconToRender, {
              size: iconSize,
              color: searchIconColor ?? fallbackIconColor,
            })}
          </span>
        )}
        <input
          ref={inputRef}
          className={`${styles.input} ${error ? styles.error : ''}`}
          style={inlineStyles}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          onChange={(e) => {
            props.onChange?.(e);
          }}
          {...props}
        />
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}
