import React from 'react';

interface IconProps {
  size?: string | number;
  color?: string;
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
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
  const { size = 'default', variant = 'primary', iconLeft, iconRight, className, children, ...rest } = props;

  const iconSize = size === 'micro' ? '14px' : size === 'large' ? '21px' : '14px';

  const buttonClassName = cn(
    'inline-flex',
    'items-center',
    'cursor-pointer',
    'rounded',
    'disabled:opacity-50',
    'disabled:cursor-not-allowed',
    size === 'micro' && 'text-xs h-6 px-2 gap-[7px]',
    size === 'default' && 'text-sm h-8 px-3 gap-2',
    size === 'large' && 'text-base h-10 px-4 gap-2',
    variant === 'primary' && 'bg-(--lv7) text-(--lv1) hover:bg-(--lv5) disabled:hover:bg-(--lv7)',
    variant === 'secondary' && 'border border-(--lv3) text-(--lv6) hover:bg-(--lv2) disabled:hover:bg-transparent',
    variant === 'ghost' && 'text-(--lv5) hover:bg-(--lv2) disabled:hover:bg-transparent',
    className,
  );

  return (
    <button className={buttonClassName} {...rest}>
      {iconLeft && React.cloneElement(iconLeft, { size: iconSize, color: 'currentColor' })}
      {children}
      {iconRight && React.cloneElement(iconRight, { size: iconSize, color: 'currentColor' })}
    </button>
  );
}