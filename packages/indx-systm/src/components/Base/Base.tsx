import styles from './Base.module.css'

import { ReactNode } from 'react'

export type BaseProps = {
    children: ReactNode;
    className?: string;
}

export function Base({ children, className }: BaseProps) {
  return (
    <div className={`${styles.container} ${styles.default} ${className || ''}`}>
        {children}
    </div>
  )
}
