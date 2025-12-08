import React from 'react'
import styles from './Table.module.css'

interface TableCellProps {
  label?: string
  children?: React.ReactNode
}

export function TableCell({ label, children }: TableCellProps) {
  if (label || children) {
    return (
      <td>
        <div className={styles.cellInner}>
          {label && <span className={styles.cellLabel}>{label}</span>}
          {children && <div className={styles.cellContent}>{children}</div>}
        </div>
      </td>
    )
  }
  return <td>{children}</td>
}
