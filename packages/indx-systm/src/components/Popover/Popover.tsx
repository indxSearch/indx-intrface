import React from 'react';
import * as RadixPopover from '@radix-ui/react-popover';
import styles from './Popover.module.css';

export interface PopoverProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'right' | 'bottom' | 'left';
  sideOffset?: number;
  className?: string;
}

export const Popover: React.FC<PopoverProps> = ({
  trigger,
  children,
  open,
  onOpenChange,
  align = 'end',
  side = 'bottom',
  sideOffset = 5,
  className = '',
}) => {
  return (
    <RadixPopover.Root open={open} onOpenChange={onOpenChange}>
      <RadixPopover.Trigger asChild>
        {trigger}
      </RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          className={`${styles.content} ${className}`}
          align={align}
          side={side}
          sideOffset={sideOffset}
        >
          {children}
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  );
};
