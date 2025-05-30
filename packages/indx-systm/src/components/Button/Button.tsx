import React, { useRef } from 'react';
import styles from './Button.module.css';

interface IconProps {
  size?: string | number;
  color?: string;
}

const iconSizeMap: Record<string, string> = {
  micro: '14px',
  default: '14px',
  large: '21px',
};

export type ButtonSize = 'micro' | 'default' | 'large';
export type ButtonType = 'primary' | 'secondary' | 'tertiary' | 'active' | 'ghost';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize;
  variant?: ButtonType;
  /** use the built-in `disabled` prop instead of a separate state */
  iconLeft?: React.ReactElement<IconProps>;
  iconRight?: React.ReactElement<IconProps>;
  children: React.ReactNode;
  backgroundColor?: string;
  iconColor?: string;
  textColor?: string;
  className?: string;
}

export function Button({
  size = 'default',
  variant = 'primary',
  iconLeft,
  iconRight,
  backgroundColor,
  iconColor,
  textColor,
  className = '',
  children,
  disabled = false,
  ...props
}: ButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const iconSize = iconSizeMap[size] || iconSizeMap.default;

  const inlineStyles: React.CSSProperties & Record<string, string> = {};
  if (backgroundColor) inlineStyles.backgroundColor = backgroundColor;
  if (iconColor) inlineStyles['--button-icon-color'] = iconColor;
  if (textColor) inlineStyles.color = textColor;

  const fallbackIconColor = 'var(--button-icon-color)';

  const buttonClass = [
    styles.button,
    styles[size],
    styles[variant],
    disabled ? styles.disabled : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={buttonRef}
      className={buttonClass}
      style={inlineStyles}
      disabled={disabled}
      {...props}
    >
      {iconLeft &&
        React.cloneElement(iconLeft, {
          size: iconSize,
          color: iconColor ?? fallbackIconColor,
        })}
      <span>{children}</span>
      {iconRight &&
        React.cloneElement(iconRight, {
          size: iconSize,
          color: iconColor ?? fallbackIconColor,
        })}
    </button>
  );
}