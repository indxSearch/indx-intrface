import React, { useEffect, useState, useRef } from 'react';
import styles from './Button.module.css';

interface IconProps {
  size?: string | number;
  color?: string;
}

const iconSizeMap = {
  micro: '14px',
  default: '14px',
  large: '21px',
};

export type ButtonSize = 'micro' | 'default' | 'large';
export type ButtonType = 'primary' | 'secondary' | 'tertiary' | 'active' | 'ghost';
export type ButtonState = 'default' | 'disabled';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize;
  typeVariant?: ButtonType;
  state?: ButtonState;
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
  typeVariant = 'primary',
  state = 'default',
  iconLeft,
  iconRight,
  backgroundColor,
  iconColor,
  textColor,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const iconSize = iconSizeMap[size];
  const inlineStyles: React.CSSProperties & { [key: string]: string } = {};
  if (backgroundColor) inlineStyles.backgroundColor = backgroundColor;
  if (iconColor) inlineStyles['--button-icon-color'] = iconColor;
  if (textColor) inlineStyles.color = textColor;

  const fallbackIconColor = 'var(--button-icon-color)';

  // Combine class names
  const buttonClass = [
    styles.button,
    styles[size],
    styles[typeVariant],
    state === 'disabled' ? styles.disabled : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={buttonRef}
      className={buttonClass}
      style={inlineStyles}
      disabled={state === 'disabled'}
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
