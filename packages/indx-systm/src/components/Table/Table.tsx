import React from 'react'
import styles from './Table.module.css'

interface TableProps {
  children: React.ReactNode
}

export function Table({ children }: TableProps) {
  return (
    <table className={styles.table}>
      {children}
    </table>
  )
}
