import styles from './Base.module.css'

import { ReactNode } from 'react'
type props = {
    children: ReactNode;
    className?: string;
    type?: 'default' | 'outlined';
}
  
export function Base({ children, className, type = 'default' }: props) {
  return (
    <div className={`${styles.container} ${styles[type]} ${className || ''}`}>
        {children}
    </div>
  )
}
