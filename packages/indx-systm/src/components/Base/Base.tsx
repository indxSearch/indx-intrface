import styles from './Base.module.css'

import { ReactNode } from 'react'
type props = {
    children: ReactNode;
    className?: string;
}
  
export function Base({ children, className }: props) {
  return (
    <div className={`${styles.container} ${className || ''}`}>
        {children}
    </div>
  )
}
