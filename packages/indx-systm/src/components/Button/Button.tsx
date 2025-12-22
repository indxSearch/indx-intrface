import React from 'react';
import styles from './Button.module.css';

interface IconProps {
  size?: string | number;
  color?: string;
}

type ButtonBaseProps = {
  size?: 'micro' | 'default' | 'large';
  variant?: 'primary' | 'secondary' | 'ghost';
  iconLeft?: React.ReactElement<IconProps>;
  iconRight?: React.ReactElement<IconProps>;
  className?: string;
};

type ButtonAsButton = ButtonBaseProps & Omit<React.ComponentProps<'button'>, keyof ButtonBaseProps> & {
  href?: never;
};

type ButtonAsLink = ButtonBaseProps & Omit<React.ComponentProps<'a'>, keyof ButtonBaseProps> & {
  href: string;
};

export type ButtonProps = ButtonAsButton | ButtonAsLink;

export function Button(props: ButtonProps) {
  const { size = 'default', variant = 'primary', iconLeft, iconRight, className, children, ...rest } = props;
  const { href } = rest as { href?: string };
  const disabled = 'disabled' in rest ? rest.disabled : false;

  const iconSize = size === 'micro' ? '14px' : size === 'large' ? '21px' : '14px';

  const buttonClassName = [
    styles.button,
    styles[size],
    styles[variant],
    disabled ? 'cursor-not-allowed' : 'cursor-pointer',
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

  const content = (
    <>
      {iconLeft && React.cloneElement(iconLeft, { size: iconSize, color: 'currentColor' })}
      {children}
      {iconRight && React.cloneElement(iconRight, { size: iconSize, color: 'currentColor' })}
    </>
  );

  if (href) {
    const { type, disabled: _, ...anchorProps } = rest as any;
    return (
      <a
        className={buttonClassName}
        href={href}
        {...anchorProps}
        aria-disabled={disabled ? 'true' : undefined}
        onClick={disabled ? (e) => e.preventDefault() : anchorProps.onClick}
      >
        {content}
      </a>
    );
  }

  const { type = 'button', ...buttonProps } = rest as any;
  return (
    <button className={buttonClassName} type={type} {...buttonProps}>
      {content}
    </button>
  );
}