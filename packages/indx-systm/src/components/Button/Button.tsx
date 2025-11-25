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
    size === 'micro' && 'text-xs h-6 px-2 gap-[7px]',
    size === 'default' && 'text-sm h-8 px-3 gap-2',
    size === 'large' && 'text-base h-10 px-4 gap-2',
    variant === 'primary' && 'bg-lv7 text-lv1',
    variant === 'secondary' && 'border border-lv3 text-lv6',
    variant === 'ghost' && 'text-lv5',
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