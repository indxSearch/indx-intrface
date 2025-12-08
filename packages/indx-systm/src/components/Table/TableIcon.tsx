import React from 'react'
import styles from './Table.module.css'

interface IconProps {
  size?: string | number;
  color?: string;
}

interface TableIconProps {
  children: React.ReactElement<IconProps>
}

export function TableIcon({ children }: TableIconProps) {
  return (
    <span className={styles.icon}>
      {React.cloneElement(children, { size: '14px', color: 'currentColor' })}
    </span>
  )
}
