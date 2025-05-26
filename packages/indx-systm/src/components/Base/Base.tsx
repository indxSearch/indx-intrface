import styles from './Base.module.css'

import { ReactNode } from 'react'
type props = {
    children: ReactNode
}
  
export function Base({ children }: props) {
  return (
    <div className={styles.container}>
        {children}
    </div>
  )
}
