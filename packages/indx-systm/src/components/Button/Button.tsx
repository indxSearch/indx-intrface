import React from 'react';
import styles from './Button.module.css';

interface IconProps {
  size?: string | number;
  color?: string;
}

export function Button(
  props: Omit<React.ComponentProps<'button'>, 'className'> & {
    size?: 'micro' | 'default' | 'large';
    variant?: 'primary' | 'secondary' | 'ghost';
    iconLeft?: React.ReactElement<IconProps>;
    iconRight?: React.ReactElement<IconProps>;
    className?: string;
  }
) {
  const { size = 'default', variant = 'primary', iconLeft, iconRight, className, children, type = 'button', ...rest } = props;

  const iconSize = size === 'micro' ? '14px' : size === 'large' ? '21px' : '14px';

  const buttonClassName = [
    styles.button,
    styles[size],
    styles[variant],
    rest.disabled ? 'cursor-not-allowed' : 'cursor-pointer',
    className
  ].filter(Boolean).join(' ');

  // Warn in development if button has only icons and no accessible label
  if (process.env.NODE_ENV !== 'production') {
    const hasIconOnly = (iconLeft || iconRight) && !children;
    const hasAccessibleLabel = rest['aria-label'] || rest['aria-labelledby'];
    if (hasIconOnly && !hasAccessibleLabel) {
      console.warn('Button: Icon-only buttons should have an aria-label or aria-labelledby for accessibility.');
    }
  }

  return (
    <button className={buttonClassName} type={type} {...rest}>
      {iconLeft && React.cloneElement(iconLeft, { size: iconSize, color: 'currentColor' })}
      {children}
      {iconRight && React.cloneElement(iconRight, { size: iconSize, color: 'currentColor' })}
    </button>
  );
}