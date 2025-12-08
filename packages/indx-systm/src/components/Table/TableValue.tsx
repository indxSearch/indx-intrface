import React from 'react'
import styles from './Table.module.css'

interface TableValueProps {
  children: React.ReactNode
}

export function TableValue({ children }: TableValueProps) {
  return <span className={styles.value}>{children}</span>
}
