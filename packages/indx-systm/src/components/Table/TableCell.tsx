import React from 'react'
import styles from './Table.module.css'

interface TableCellProps {
  label?: string
  children?: React.ReactNode
  isHeader?: boolean
  scope?: 'col' | 'row'
}

export function TableCell({ label, children, isHeader = false, scope }: TableCellProps) {
  const CellType = isHeader ? 'th' : 'td';
  const cellProps = isHeader && scope ? { scope } : {};

  if (label || children) {
    return (
      <CellType {...cellProps}>
        <div className={styles.cellInner}>
          {label && <span className={styles.cellLabel}>{label}</span>}
          {children && <div className={styles.cellContent}>{children}</div>}
        </div>
      </CellType>
    )
  }
  return <CellType {...cellProps}>{children}</CellType>
}
