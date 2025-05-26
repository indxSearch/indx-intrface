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
export type ButtonTheme = 'light' | 'dark';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: ButtonSize;
  typeVariant?: ButtonType;
  state?: ButtonState;
  theme?: ButtonTheme;
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
  theme = 'light',
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
  const [mounted, setMounted] = useState(false);
  const [computedColor, setComputedColor] = useState<string>('currentColor');

  const iconSize = iconSizeMap[size];

  // Only update mounted after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Only read CSS variable after DOM is mounted and theme is applied
  useEffect(() => {
    if (!mounted || !buttonRef.current) return;

    const style = getComputedStyle(buttonRef.current);
    const cssColor = style.getPropertyValue('--button-icon-color').trim();
    setComputedColor(cssColor || 'currentColor');
  }, [mounted, typeVariant]);

  // apply inline overrides if provided
  const inlineStyles: React.CSSProperties & { [key: string]: string } = {};
  if (backgroundColor) inlineStyles.backgroundColor = backgroundColor;
  if (iconColor) inlineStyles['--button-icon-color'] = iconColor;
  if (textColor) inlineStyles.color = textColor;

  // Combine class names
  const buttonClass = [
    styles.button,
    styles[size],
    styles[typeVariant],
    styles[theme],
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
          color: iconColor ?? computedColor,
        })}
      <span>{children}</span>
      {iconRight &&
        React.cloneElement(iconRight, {
          size: iconSize,
          color: iconColor ?? computedColor,
        })}
    </button>
  );
}
