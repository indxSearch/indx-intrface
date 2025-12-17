import React from 'react'
import styles from './Table.module.css'

interface TableProps {
  children: React.ReactNode
  caption?: string
  'aria-label'?: string
}

export function Table({ children, caption, 'aria-label': ariaLabel }: TableProps) {
  // Warn in development if there's no caption or aria-label
  if (process.env.NODE_ENV !== 'production') {
    if (!caption && !ariaLabel) {
      console.warn('Table: Component should have either a caption or aria-label for accessibility.');
    }
  }

  return (
    <table className={styles.table} aria-label={ariaLabel}>
      {caption && <caption className={styles.caption}>{caption}</caption>}
      {children}
    </table>
  )
}
