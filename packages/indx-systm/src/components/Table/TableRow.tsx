import React from 'react'
import styles from './Table.module.css'

interface TableRowProps {
  children: React.ReactNode
}

export function TableRow({ children }: TableRowProps) {
  return (
    <tr className={styles.dataRow}>
      {children}
    </tr>
  )
}
