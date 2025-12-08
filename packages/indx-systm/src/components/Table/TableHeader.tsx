import React from 'react'
import styles from './Table.module.css'

interface TableHeaderProps {
  children: React.ReactNode
}

export function TableHeader({ children }: TableHeaderProps) {
  return (
    <thead>
      <tr className={styles.headerRow}>
        {children}
      </tr>
    </thead>
  )
}
