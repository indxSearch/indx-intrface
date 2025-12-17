import React from 'react'
import styles from './Table.module.css'

interface IconProps {
  size?: string | number;
  color?: string;
}

interface TableIconProps {
  children: React.ReactElement<IconProps>
  'aria-label'?: string
}

export function TableIcon({ children, 'aria-label': ariaLabel }: TableIconProps) {
  // If no aria-label is provided, the icon is decorative
  const isDecorative = !ariaLabel;

  return (
    <span
      className={styles.icon}
      aria-hidden={isDecorative ? 'true' : undefined}
      aria-label={ariaLabel}
    >
      {React.cloneElement(children, { size: '14px', color: 'currentColor' })}
    </span>
  )
}
